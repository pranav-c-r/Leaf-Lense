# api.py

import os
import pickle
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import List

# --- 1. Initialize FastAPI Router ---
router = APIRouter()

from .utils import download_models_from_hf

# --- 2. Load Models ---
# Define the directory where models are saved
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
RECOMMEND_MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommend_model.pkl")
YIELD_MODEL_PATH = os.path.join(MODEL_DIR, "crop_yield_model.pkl")

recommend_model = None
yield_model_pipeline = None

download_models_from_hf()

try:
    with open(RECOMMEND_MODEL_PATH, 'rb') as file:
        recommend_model = pickle.load(file)
    with open(YIELD_MODEL_PATH, 'rb') as file:
        yield_model_pipeline = pickle.load(file)
    print("Models loaded successfully!")
except FileNotFoundError:
    print(f"Error: Model files not found in {MODEL_DIR}. Please ensure 'yield-final.py' has been run to train and save the models.")
except Exception as e:
    print(f"Error loading models: {e}")

# --- 3. Define the Input Data Model using Pydantic ---
# This ensures that the data sent from the frontend matches what the model expects.
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    State_Name: str
    District_Name: str
    Season: str
    Crop_Year: int = 2024 # Default to current year or make it an input

# --- 4. Create the Prediction Endpoint ---
@router.post("/predict-yield")
async def predict_yield(data: CropInput):
    if recommend_model is None or yield_model_pipeline is None:
        raise HTTPException(status_code=500, detail="Models are not loaded. Please check server logs for details.")

    # 1. Recommend the best crop
    recommend_features_df = pd.DataFrame([[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]],
                                         columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    recommended_crop = recommend_model.predict(recommend_features_df)[0]
    
    # 2. Predict the yield for the recommended crop
    yield_features = pd.DataFrame({
        'State_Name': [data.State_Name],
        'District_Name': [data.District_Name],
        'Crop_Year': [data.Crop_Year],
        'Season': [data.Season],
        'Crop': [recommended_crop]
    })
    
    predicted_log_yield = yield_model_pipeline.predict(yield_features)
    
    # Convert the prediction back to the original scale
    predicted_yield_value = np.expm1(predicted_log_yield)
    
    return {
        "recommended_crop": recommended_crop,
        "predicted_yield": round(float(predicted_yield_value[0]), 2)
    }

# --- 5. Root endpoint for testing ---
@router.get("/")
def read_root():
    return {"message": "LeafLense Yield Prediction API is running."}

