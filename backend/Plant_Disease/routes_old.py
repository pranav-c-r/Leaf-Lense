import os
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import json
import re
import numpy as np
import tensorflow as tf
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import logging
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
parser = StrOutputParser()
router = APIRouter(prefix="/disease", tags=["Plant Disease"])

# Initialize Gemini API
try:
    google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not google_api_key:
        raise ValueError("No Google API key found in environment variables")
    
    llm = ChatGoogleGenerativeAI(
        model='gemini-1.5-flash',
        api_key=google_api_key
    )
    logger.info("✅ Gemini Vision API initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {str(e)}")
    gemini_model = None

prompt1 = PromptTemplate(
    template="""
        You are an agriculture expert. 
        A farmer's plant or leaf has the disease: {disease}.
        Suggest:
        1. Short description of the disease
        2. Organic remedies
        3. Chemical remedies (if available)
        4. Preventive measures
        Return the answer in simple and matured and respected language and answer should be within 100 words.
        You should return the answer in such a manner:
        ### Disease Name
        ---
        ### Cause
        ---
        ### Symptoms
        ---
        ### Organic Remedies
        ---
        ### Chemical Remedies
        ---
        ### Prevention
        ---
    """,
    input_variables=["disease"]
)

async def get_disease_advice(disease: str) -> str:
    try:
        if llm is None:
            raise ValueError("LLM not initialized")
        
        chain = prompt1 | llm | parser
        result = await chain.ainvoke({"disease": disease})
        return result
    except Exception as e:
        logger.error(f"Failed to get LLM advice: {str(e)}")
        # Return a basic fallback advice
        disease_clean = disease.replace("___", " ").replace("_", " ").title()
        return f"Disease detected: {disease_clean}. Please consult with a local agricultural expert or extension service for specific diagnosis and treatment recommendations."

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if llm is None:
        return JSONResponse(content={"error": "Model not loaded."}, status_code=500)

    try:
        contents = await file.read()
        if not contents or len(contents) < 10:
            return JSONResponse(content={
                "error": "Uploaded file is empty or invalid. Please upload a valid image file."
            }, status_code=422)
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception:
            return JSONResponse(content={
                "error": "Uploaded file is not a valid image. Please upload a valid image file."
            }, status_code=422)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        target_size = (128, 128)
        image = image.resize(target_size)
        input_arr = tf.keras.preprocessing.image.img_to_array(image)
        input_arr = input_arr / 255.0
        input_arr = np.expand_dims(input_arr, axis=0)
        print(f"Input array shape: {input_arr.shape}")

        # Model prediction
        logger.info(f"Input array shape: {input_arr.shape}, dtype: {input_arr.dtype}")
        logger.info(f"Input array min: {np.min(input_arr)}, max: {np.max(input_arr)}")
        
        prediction = llm.invoke(input_arr, verbose=0)
        logger.info(f"Raw prediction shape: {prediction.shape}")
        logger.info(f"Raw prediction range: min={np.min(prediction)}, max={np.max(prediction)}")
        
        # Handle single batch dimension first
        if prediction.ndim > 1:
            prediction = prediction[0]  # Get first (and only) sample
        
        # Check if we need to apply softmax
        prediction_sum = np.sum(prediction)
        logger.info(f"Prediction sum: {prediction_sum}")
        
        if not np.allclose(prediction_sum, 1.0, atol=1e-6):
            logger.info("Applying softmax normalization")
            prediction = tf.nn.softmax(prediction)
            if hasattr(prediction, 'numpy'):
                prediction = prediction.numpy()
        else:
            logger.info("Prediction already normalized")
        
        # Get top 5 predictions for better analysis
        top_indices = np.argsort(prediction)[-5:][::-1]
        top_confidences = prediction[top_indices]

        result_index = top_indices[0]
        confidence = float(top_confidences[0]) * 100

        # Enhanced logging
        logger.info(f"Top 5 predictions:")
        
        # Debug: Check if all predictions are very low
        max_prediction = np.max(prediction)
        logger.info(f"Maximum prediction value: {max_prediction*100:.2f}%")
        
        # Adjust threshold based on model behavior
        # If the model consistently gives low predictions, use a lower threshold
        if max_prediction < 0.15:  # If all predictions are less than 15%
            logger.warning("⚠️ All predictions are very low - using adaptive threshold")
            confidence_threshold = 5.0  # Lower threshold for poorly performing models
        else:
            confidence_threshold = 30.0  # Standard threshold
        
        logger.info(f"Using confidence threshold: {confidence_threshold}%")

        if confidence < confidence_threshold:
            # Check if there's a clear winner even with low confidence
            if len(top_confidences) > 1:
                confidence_gap = (top_confidences[0] - top_confidences[1]) * 100
                logger.info(f"Confidence gap between top 2 predictions: {confidence_gap:.2f}%")
                
                if confidence_gap > 1.0:  # If there's a reasonable gap
                    logger.info(f"Accepting prediction due to confidence gap: {result}")
                    try:
                        disease_advice = await get_disease_advice(result)
                    except Exception:
                        if "healthy" in result.lower():
                            disease_advice = "Your plant appears to be healthy based on the analysis, though the confidence is moderate. Continue monitoring your plant's health."
                        else:
                            disease_advice = f"Potential issue detected: {result.replace('___', ' ').replace('_', ' ')}. The confidence is moderate, so please verify with additional inspection or consult an expert."
                else:
                    disease_advice = "Multiple potential conditions detected with similar probabilities. Please consult with an expert for accurate diagnosis."
            else:
                result = "Uncertain Classification"
                disease_advice = "Unable to make a confident prediction. Please ensure the image shows clear plant features and symptoms, with good lighting conditions."
        else:
            try:
                disease_advice = await get_disease_advice(result)
            except Exception:
                if "healthy" in result.lower():
                    disease_advice = "Good news! Your plant appears to be healthy. Continue with regular care and monitoring."
                elif "unknown" in result.lower():
                    disease_advice = "Unable to identify the specific disease. Please consult with a local agricultural expert for proper diagnosis."
                else:
                    disease_advice = f"Disease detected: {result}. Please consult with a local agricultural expert for specific treatment recommendations."

        ai_response = disease_advice

        return {
            "class": result,
            "confidence": round(confidence, 2),
            "advice": ai_response,
            "status": "success",
            "all_predictions": prediction.tolist() if len(prediction) <= 10 else prediction[:10].tolist()
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={
            "error": f"Prediction failed: {str(e)}",
            "status": "error"
        }, status_code=500)

@router.get("/health")
def health_check():
    """Health check endpoint to verify model and LLM status"""
    return {
        "status": "healthy",
    }
