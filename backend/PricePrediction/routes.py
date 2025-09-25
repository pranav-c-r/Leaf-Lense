from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from huggingface_hub import hf_hub_download

# --- Router and Pydantic Model Definition ---

router = APIRouter(
    tags=["Price Prediction"],
)

class CropPriceData(BaseModel):
    month: str
    commodity_name: str
    avg_min_price: float
    avg_max_price: float
    state_name: str
    district_name: str
    calculationType: str
    change: float

# --- Model Loading from Hugging Face Hub ---

model = None
model_loaded = False
REPO_ID = "adityaarun1010/my-new-models"
FILENAME = "crop_price_model.pkl"

try:
    print(f"Attempting to load model from Hugging Face repo: {REPO_ID}, filename: {FILENAME}")
    # Download the model from the Hub
    model_path = hf_hub_download(repo_id=REPO_ID, filename=FILENAME)
    # Load the model using joblib
    model = joblib.load(model_path)
    model_loaded = True
    print(f"✅ Price prediction model loaded successfully from {model_path}!")

except Exception as e:
    print(f"❌ Failed to load model from Hugging Face: {e}")
    print("⚠️ Warning: Creating a mock model for development/testing purposes.")
    # Define a mock model as a fallback
    class MockPricePredictionModel:
        def predict(self, df):
            avg_min = df['avg_min_price'].iloc[0]
            avg_max = df['avg_max_price'].iloc[0]
            # Return a random prediction within a reasonable range
            return [np.random.uniform(avg_min * 0.95, avg_max * 1.05)]
    model = MockPricePredictionModel()
    model_loaded = "mock"


# --- Helper Data ---

MONTH_MAP = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
}

# --- API Endpoints ---

@router.post("/predict")
def predict_price(data: CropPriceData):
    if model is None:
        return {"error": "Price prediction model is not available.", "status": "error"}

    try:
        # 1. Convert incoming data to a DataFrame
        input_df = pd.DataFrame([data.dict()])

        # 2. Preprocess the data to create required features
        input_df['month_num'] = input_df['month'].map(MONTH_MAP)
        input_df['month_sin'] = np.sin(2 * np.pi * input_df['month_num'] / 12)
        input_df['month_cos'] = np.cos(2 * np.pi * input_df['month_num'] / 12)
        input_df['price_range'] = input_df['avg_max_price'] - input_df['avg_min_price']
        input_df['prev_modal_by_commodity'] = (input_df['avg_min_price'] + input_df['avg_max_price']) / 2
        
        # 3. Make the prediction
        # Ensure your model is robust to column order or reorder them explicitly if needed
        pred = model.predict(input_df)[0]

        return {
            "predicted_price": float(pred),
            "status": "success",
            "model_source": "Hugging Face" if model_loaded == True else "Mock Fallback"
        }
    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return {"error": f"Prediction failed: {e}", "status": "error"}

# You can keep other endpoints like get_supported_commodities, etc.
