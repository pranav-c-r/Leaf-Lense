from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from huggingface_hub import hf_hub_download
import re

router = APIRouter()

# --- START: MODIFICATION ---
# Define global variables for the model and its components at the top level.
model = None
columns = None
llm = None

# Define model repository information clearly at the top.
REPO_ID = "adityaarun1010/my-new-models"
FILENAME = "fertilizer_model.pkl"

# Use a dedicated startup function for cleaner initialization.
@router.on_event("startup")
def load_model_and_llm():
    global model, columns, llm
    
    # 1. Load the Machine Learning Model
    try:
        print(f"Attempting to load fertilizer model from Hugging Face repo: {REPO_ID}, filename: {FILENAME}")
        fertilizer_model_path = hf_hub_download(
            repo_id=REPO_ID,
            filename=FILENAME
        )
        model, columns = joblib.load(fertilizer_model_path)
        print("✅ Fertilizer model loaded successfully!")

    except Exception as e:
        # If the model fails to load, the app should not be able to run predictions.
        print(f"🔥 CRITICAL: Failed to load fertilizer model: {e}")
        # Setting model to None ensures predictions will fail with a clear message.
        model = None

    # 2. Configure the Gemini API
    try:
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        
        llm = ChatGoogleGenerativeAI(model='gemini-1.5-flash')
        print("✅ Gemini LLM initialized successfully!")

    except Exception as e:
        print(f"🔥 CRITICAL: Failed to initialize Gemini LLM: {e}")
        llm = None
# --- END: MODIFICATION ---


# Pydantic Schemas
class FertilizerRequest(BaseModel):
    Temperature: int
    Humidity: int
    Moisture: int
    Soil_Type: str
    Crop_Type: str
    Nitrogen: int
    Phosphorus: int
    Potassium: int


# Helper Function for ML Prediction
def predict_fertilizer(input_data: dict):
    if model is None or columns is None:
        raise RuntimeError("Model is not loaded. Check server startup logs for errors.")
    
    new_data = pd.DataFrame([input_data])
    new_data = pd.get_dummies(new_data)
    new_data = new_data.reindex(columns=columns, fill_value=0)
    return model.predict(new_data)[0]


# API Endpoint
@router.post("/predict")
def predict(data: FertilizerRequest):
    # Check if models were loaded correctly at startup
    if model is None:
        raise HTTPException(status_code=503, detail="Service Unavailable: Prediction model is not loaded. Please check server logs.")
    if llm is None:
        raise HTTPException(status_code=503, detail="Service Unavailable: Language model is not loaded. Please check server logs.")

    try:
        input_dict = data.dict()
        
        # 1. Get prediction from your trained ML model
        ml_prediction_result = predict_fertilizer(input_dict)

        # 2. Use Gemini for supplemental advice
        gemini_prompt = (
            f"Given the soil data, recommend optimal N, P, and K levels and give a short explanation. "
            f"Return ONLY a valid JSON object.\n"
            f"Format: {{\"nitrogen\": <int>, \"phosphorus\": <int>, \"potassium\": <int>, \"explanation\": \"<string>\"}}\n"
            f"Input Data: {json.dumps(input_dict)}"
        )
        
        response = llm.invoke(gemini_prompt)
        
        # Default values in case Gemini fails
        recommended_n = input_dict["Nitrogen"] + 20
        recommended_p = input_dict["Phosphorus"] + 20
        recommended_k = input_dict["Potassium"] + 20
        explanation = "Based on standard agricultural models, adjustments are recommended to balance nutrient levels for the selected crop."

        # 3. Parse Gemini's response
        match = re.search(r'\{[\s\S]*\}', response.content) # Use response.content for langchain
        if match:
            try:
                gemini_data = json.loads(match.group(0).replace("'", '"'))
                recommended_n = gemini_data.get("nitrogen", recommended_n)
                recommended_p = gemini_data.get("phosphorus", recommended_p)
                recommended_k = gemini_data.get("potassium", recommended_k)
                explanation = gemini_data.get("explanation", explanation)
            except (json.JSONDecodeError, KeyError):
                pass 
        
        # 4. Construct the final response
        result = {
            "mlPrediction": ml_prediction_result,
            "nutrients": {
                "nitrogen": {"current": input_dict["Nitrogen"], "recommended": recommended_n, "unit": "kg/ha"},
                "phosphorus": {"current": input_dict["Phosphorus"], "recommended": recommended_p, "unit": "kg/ha"},
                "potassium": {"current": input_dict["Potassium"], "recommended": recommended_k, "unit": "kg/ha"}
            },
            "explanation": explanation
        }
        return result
        
    except Exception as e:
        # This will catch errors during the prediction logic itself
        raise HTTPException(status_code=500, detail=f"An internal error occurred during prediction: {e}")

