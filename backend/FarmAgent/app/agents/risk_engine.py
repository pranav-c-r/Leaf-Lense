# agents/risk_engine.py
from math import exp
from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables from backend root directory
backend_root = Path(__file__).parent.parent.parent.parent
load_dotenv(backend_root / '.env')

# Read thresholds from .env with defaults
DISEASE_RISK_THRESHOLD = float(os.getenv("DISEASE_RISK_THRESHOLD", 0.6))
PEST_RISK_THRESHOLD = float(os.getenv("PEST_RISK_THRESHOLD", 0.5))
HIGH_RAIN_THRESHOLD = float(os.getenv("HIGH_RAIN_THRESHOLD", 8))
LOW_RAIN_THRESHOLD = float(os.getenv("LOW_RAIN_THRESHOLD", 3))
HIGH_TEMP_THRESHOLD = float(os.getenv("HIGH_TEMP_THRESHOLD", 28))

def sigmoid(x: float) -> float:
    return 1 / (1 + exp(-x))

def compute_fdi(wet_hours: int, temp_optimal: bool, rain_recent: float) -> float:
    score = 0.5 * (wet_hours / 24) + 0.3 * (1 if temp_optimal else 0) + 0.2 * (1 if rain_recent >= 5 else 0)
    return round(sigmoid(4 * (score - 0.5)), 3)

def compute_ior(temp_optimal: bool, had_rain: bool, dry_period: bool, windy: bool) -> float:
    score = 0.4 * (1 if temp_optimal else 0) + 0.3 * (1 if had_rain else 0) + 0.2 * (1 if dry_period else 0) + 0.1 * (1 if windy else 0)
    return round(sigmoid(4 * (score - 0.5)), 3)

def get_irrigation_action(rainfall: float, temperature: float) -> str:
    if rainfall > HIGH_RAIN_THRESHOLD:
        return "skip"
    elif rainfall < LOW_RAIN_THRESHOLD and temperature > HIGH_TEMP_THRESHOLD:
        return "irrigate"
    else:
        return "monitor"

def get_crop_temp_range(crop_type: str) -> tuple:
    ranges = {
        "rice": (20, 35), "wheat": (10, 25), "maize": (15, 30),
        "tomato": (18, 27), "potato": (15, 25), "cotton": (20, 32),
        "sugarcane": (20, 35), "default": (15, 30)
    }
    return ranges.get(crop_type.lower(), ranges["default"])

def calculate_risks(weather_data: dict, crop_type: str = "default") -> dict:
    if not weather_data:
        return {"error": "No weather data available"}

    avg_temp = weather_data.get('avg_temp', 25)
    current_temp = weather_data.get('current_temp', avg_temp)
    total_rainfall = weather_data.get('total_rainfall', 0)
    wet_hours = weather_data.get('wet_hours', 0)
    max_wind_speed = weather_data.get('max_wind_speed', 0)
    humidity = weather_data.get('humidity', 50)
    conditions = weather_data.get('conditions', 'Unknown')

    temp_min, temp_max = get_crop_temp_range(crop_type)
    temp_optimal = temp_min <= avg_temp <= temp_max
    had_recent_rain = total_rainfall > 2
    is_windy = max_wind_speed > 4

    disease_risk = compute_fdi(wet_hours, temp_optimal, total_rainfall)
    pest_risk = compute_ior(temp_optimal, had_recent_rain, total_rainfall < 1, is_windy)
    irrigation = get_irrigation_action(total_rainfall, current_temp)

    rationale = []
    if disease_risk > DISEASE_RISK_THRESHOLD:
        rationale.append(f"High disease risk ({disease_risk*100}%) due to {wet_hours} humid hours")
    if pest_risk > PEST_RISK_THRESHOLD:
        rationale.append(f"Pest risk ({pest_risk*100}%) - favorable conditions detected")
    rationale.append(f"Irrigation: {irrigation.upper()}")

    return {
        "disease_risk": disease_risk,
        "pest_risk": pest_risk,
        "irrigation_action": irrigation,
        "rationale": rationale,
        "humidity": humidity,
        "conditions": conditions,
        "current_temp": current_temp,
        "avg_temp": avg_temp
    }
