from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel
import os
import numpy as np
from .routes import price_prediction_router

app = FastAPI()

# Mock model for development/testing
class MockModel:
    def predict(self, X):
        # In a real scenario, this would be a more sophisticated mock
        return np.array([100.0] * len(X))

# Load the trained model
MODEL_PATH = "C:\Users\anshu\OneDrive\Desktop\leaflense\LeafLense\backend\PricePrediction\crop_price_model.pkl"
MODELS_DIR = "C:\Users\anshu\OneDrive\Desktop\leaflense\LeafLense\backend\PricePrediction\models"

price_model = None
try:
    if os.path.exists(MODEL_PATH):
        price_model = joblib.load(MODEL_PATH)
        print("✅ Price prediction model loaded successfully from main directory!")
    elif os.path.exists(os.path.join(MODELS_DIR, "crop_price_model.pkl")):
        price_model = joblib.load(os.path.join(MODELS_DIR, "crop_price_model.pkl"))
        print("✅ Price prediction model loaded successfully from models directory!")
    else:
        print(f"⚠️ No price prediction model found. Checked paths:")
        print(f"   - {MODEL_PATH}")
        print(f"   - {os.path.join(MODELS_DIR, 'crop_price_model.pkl')}")
        print("📝 To enable predictions, place your trained model file at one of these locations.")
        print("🔧 Creating mock model for development/testing...")
        price_model = MockModel()
        print("✅ Mock price prediction model created for development.")
except Exception as e:
    print(f"❌ Error loading price prediction model: {e}")
    print("🔧 Creating mock model for development/testing due0 to error...")
    price_model = MockModel()
    print("✅ Mock price prediction model created for development.")

app.include_router(price_prediction_router)

# Input schema for request body
class CropData(BaseModel):
    month: str
    commodity_name: str
    avg_min_price: float
    avg_max_price: float
    state_name: str
    district_name: str
    calculationType: str
    change: float

@app.post("/predict")
def predict(data: CropData):
    # Convert input to DataFrame (model expects same features as training)
    df = pd.DataFrame([data.dict()])
    
    # Predict
    pred = price_model.predict(df)[0]
    
    return {"predicted_price": float(pred)}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Price Prediction API"}
