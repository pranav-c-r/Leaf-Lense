from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import datetime
import requests
import json
import os
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials

router = APIRouter()

# Initialize Firebase Admin SDK if not already done
try:
    firebase_admin.get_app()
except ValueError:
    service_account_path = os.path.join(os.path.dirname(__file__), "../serviceAccountKey.json")
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

db = firestore.client()

class FarmProfile(BaseModel):
    farmerId: str
    location: str
    lat: float
    lon: float
    soil_type: str
    farm_size: float
    irrigation_type: str
    experience_level: str
    current_crop: Optional[str] = None
    current_season: Optional[str] = None

class WeatherConditions(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    windSpeed: float
    season: str
    forecast: List[Dict]

class CropRecommendation(BaseModel):
    cropName: str
    variety: str
    suitabilityScore: int
    expectedYield: str
    marketPrice: str
    profitMargin: str
    growthDuration: str
    waterRequirement: str
    riskLevel: str
    marketDemand: str
    advantages: List[str]
    disadvantages: List[str]
    bestPlantingTime: str
    harvestTime: str
    marketTrends: str
    category: str

# Mock crop database with detailed information
CROP_DATABASE = {
    "rice": {
        "varieties": ["Basmati 1121", "Sona Masoori", "IR64", "Pusa Basmati"],
        "water_requirement": "High",
        "soil_types": ["clay", "loam"],
        "seasons": ["Kharif", "Rabi"],
        "growth_duration": "120-130 days",
        "market_price_range": "2500-3000",
        "category": "cereal",
        "advantages": [
            "High market demand",
            "Stable pricing",
            "Government support available",
            "Export potential"
        ],
        "disadvantages": [
            "High water requirement",
            "Pest susceptibility",
            "Weather dependent"
        ]
    },
    "cotton": {
        "varieties": ["Bt Cotton", "Desi Cotton", "American Cotton"],
        "water_requirement": "Medium",
        "soil_types": ["sandy", "loam"],
        "seasons": ["Kharif"],
        "growth_duration": "150-180 days",
        "market_price_range": "4500-5500",
        "category": "cash",
        "advantages": [
            "High profitability",
            "Strong export market",
            "Multiple income sources (fiber, seeds)",
            "Pest-resistant varieties available"
        ],
        "disadvantages": [
            "Price volatility",
            "Long growth cycle",
            "Requires careful management"
        ]
    },
    "wheat": {
        "varieties": ["HD 3086", "PBW 343", "WH 147"],
        "water_requirement": "Medium",
        "soil_types": ["loam", "clay"],
        "seasons": ["Rabi"],
        "growth_duration": "120-140 days",
        "market_price_range": "2000-2500",
        "category": "cereal",
        "advantages": [
            "Assured procurement",
            "Lower risk",
            "Good for crop rotation",
            "Storage friendly"
        ],
        "disadvantages": [
            "Lower profit margins",
            "Competition from imports",
            "Water intensive"
        ]
    },
    "tomato": {
        "varieties": ["Hybrid varieties", "Determinate types", "Cherry tomato"],
        "water_requirement": "Medium",
        "soil_types": ["loam", "sandy"],
        "seasons": ["All seasons with protected cultivation"],
        "growth_duration": "90-120 days",
        "market_price_range": "800-1500",
        "category": "vegetable",
        "advantages": [
            "Quick returns",
            "High demand",
            "Multiple cropping possible",
            "Value addition opportunities"
        ],
        "disadvantages": [
            "Highly perishable",
            "Price volatility",
            "Disease susceptible"
        ]
    },
    "sugarcane": {
        "varieties": ["Co 86032", "Co 0238", "Co 15023"],
        "water_requirement": "High",
        "soil_types": ["loam", "clay"],
        "seasons": ["All year planting"],
        "growth_duration": "12-18 months",
        "market_price_range": "250-350",
        "category": "cash",
        "advantages": [
            "Long-term income",
            "Government support",
            "Byproduct utilization",
            "Stable crop"
        ],
        "disadvantages": [
            "Very long cycle",
            "High water requirement",
            "Heavy machinery needed"
        ]
    }
}

def get_weather_data(lat: float, lon: float) -> WeatherConditions:
    """Get weather data for given coordinates"""
    try:
        # In production, use actual weather API like OpenWeatherMap
        # For now, returning mock data based on location
        mock_weather = WeatherConditions(
            temperature=28.0,
            humidity=65.0,
            rainfall=120.0,
            windSpeed=15.0,
            season="Kharif",
            forecast=[
                {"day": "Today", "temp": 28, "condition": "Sunny", "rain": 0},
                {"day": "Tomorrow", "temp": 31, "condition": "Partly Cloudy", "rain": 10},
                {"day": "Day 3", "temp": 29, "condition": "Rainy", "rain": 80},
                {"day": "Day 4", "temp": 27, "condition": "Cloudy", "rain": 30},
                {"day": "Day 5", "temp": 30, "condition": "Sunny", "rain": 0}
            ]
        )
        return mock_weather
    except Exception as e:
        # Return default weather data if API fails
        return WeatherConditions(
            temperature=25.0,
            humidity=60.0,
            rainfall=100.0,
            windSpeed=12.0,
            season="Current",
            forecast=[]
        )

def calculate_suitability_score(crop_name: str, farm_profile: FarmProfile, weather: WeatherConditions) -> int:
    """Calculate AI-powered suitability score for a crop"""
    score = 50  # Base score
    
    crop_info = CROP_DATABASE.get(crop_name, {})
    
    # Soil type compatibility
    suitable_soils = crop_info.get("soil_types", [])
    if farm_profile.soil_type in suitable_soils:
        score += 15
    else:
        score -= 10
    
    # Water requirement vs irrigation
    water_req = crop_info.get("water_requirement", "Medium")
    if water_req == "High" and farm_profile.irrigation_type in ["drip", "sprinkler"]:
        score += 10
    elif water_req == "Low" and farm_profile.irrigation_type == "manual":
        score += 5
    
    # Weather conditions
    if weather.temperature > 20 and weather.temperature < 35:
        score += 10
    if weather.humidity > 50 and weather.humidity < 80:
        score += 5
    if weather.rainfall > 50:
        score += 10
    
    # Experience level
    if farm_profile.experience_level == "expert":
        score += 10
    elif farm_profile.experience_level == "intermediate":
        score += 5
    
    # Farm size considerations
    if farm_profile.farm_size > 5:  # Large farms
        if crop_name in ["cotton", "sugarcane", "wheat"]:
            score += 10
    else:  # Small farms
        if crop_name in ["tomato", "rice"]:
            score += 5
    
    return min(100, max(0, score))

def get_market_price(crop_name: str) -> str:
    """Get current market price for crop"""
    crop_info = CROP_DATABASE.get(crop_name, {})
    price_range = crop_info.get("market_price_range", "1000-2000")
    return f"₹{price_range}/quintal"

def generate_recommendations(farm_profile: FarmProfile, weather: WeatherConditions) -> List[CropRecommendation]:
    """Generate AI-powered crop recommendations"""
    recommendations = []
    
    for crop_name, crop_data in CROP_DATABASE.items():
        suitability = calculate_suitability_score(crop_name, farm_profile, weather)
        
        # Select best variety based on conditions
        varieties = crop_data.get("varieties", [crop_name])
        best_variety = varieties[0]  # Simplified selection
        
        # Calculate expected yield based on farm size and conditions
        base_yield = {"rice": 4.5, "cotton": 2.5, "wheat": 3.5, "tomato": 45, "sugarcane": 90}
        expected_yield = base_yield.get(crop_name, 3.0)
        if suitability > 80:
            expected_yield *= 1.2
        elif suitability < 60:
            expected_yield *= 0.8
        
        # Generate profit margin
        profit_margins = {90: "Very High", 80: "High", 70: "Medium", 60: "Low"}
        profit_margin = "Medium"
        for threshold in sorted(profit_margins.keys(), reverse=True):
            if suitability >= threshold:
                profit_margin = profit_margins[threshold]
                break
        
        # Risk assessment
        risk_levels = {90: "Low", 75: "Medium", 60: "High"}
        risk_level = "High"
        for threshold in sorted(risk_levels.keys(), reverse=True):
            if suitability >= threshold:
                risk_level = risk_levels[threshold]
                break
        
        recommendation = CropRecommendation(
            cropName=crop_name.title(),
            variety=best_variety,
            suitabilityScore=suitability,
            expectedYield=f"{expected_yield:.1f} tons/hectare" if crop_name != "sugarcane" else f"{expected_yield:.0f} tons/hectare",
            marketPrice=get_market_price(crop_name),
            profitMargin=profit_margin,
            growthDuration=crop_data.get("growth_duration", "90-120 days"),
            waterRequirement=crop_data.get("water_requirement", "Medium"),
            riskLevel=risk_level,
            marketDemand="High",  # This would come from market analysis
            advantages=crop_data.get("advantages", [])[:4],
            disadvantages=crop_data.get("disadvantages", [])[:2],
            bestPlantingTime=get_planting_time(crop_name, weather.season),
            harvestTime=get_harvest_time(crop_name, weather.season),
            marketTrends=get_market_trends(crop_name),
            category=crop_data.get("category", "general")
        )
        
        recommendations.append(recommendation)
    
    # Sort by suitability score
    recommendations.sort(key=lambda x: x.suitabilityScore, reverse=True)
    
    return recommendations

def get_planting_time(crop_name: str, current_season: str) -> str:
    """Get optimal planting time for crop"""
    planting_times = {
        "rice": "June-July",
        "cotton": "May-June", 
        "wheat": "November-December",
        "tomato": "Year-round with protection",
        "sugarcane": "February-March, October-November"
    }
    return planting_times.get(crop_name, "Consult local expert")

def get_harvest_time(crop_name: str, current_season: str) -> str:
    """Get expected harvest time for crop"""
    harvest_times = {
        "rice": "October-November",
        "cotton": "October-December",
        "wheat": "April-May", 
        "tomato": "3-4 months after planting",
        "sugarcane": "December-April"
    }
    return harvest_times.get(crop_name, "Season dependent")

def get_market_trends(crop_name: str) -> str:
    """Get market trends for crop"""
    trends = {
        "rice": "Stable demand, export opportunities",
        "cotton": "Strong export market, price volatility",
        "wheat": "Government procurement, stable pricing",
        "tomato": "High demand, price fluctuation",
        "sugarcane": "Government support, consistent demand"
    }
    return trends.get(crop_name, "Market dependent")

@router.post("/api/crop-recommendations")
async def get_crop_recommendations(farm_profile: FarmProfile):
    """Get AI-powered crop recommendations based on farm profile and conditions"""
    try:
        # Get weather data for the farm location
        weather = get_weather_data(farm_profile.lat, farm_profile.lon)
        
        # Generate recommendations
        recommendations = generate_recommendations(farm_profile, weather)
        
        # Store recommendation request in database for analytics
        try:
            recommendation_doc = {
                "farmerId": farm_profile.farmerId,
                "location": farm_profile.location,
                "timestamp": datetime.datetime.now(),
                "recommendations_count": len(recommendations),
                "top_recommendation": recommendations[0].cropName if recommendations else None
            }
            db.collection('recommendation_requests').add(recommendation_doc)
        except Exception as e:
            print(f"Error storing recommendation request: {e}")
        
        return {
            "weather": weather.dict(),
            "recommendations": [rec.dict() for rec in recommendations],
            "generated_at": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/api/crop-recommendations/weather/{lat}/{lon}")
async def get_weather_info(lat: float, lon: float):
    """Get weather information for specific coordinates"""
    try:
        weather = get_weather_data(lat, lon)
        return weather.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

@router.get("/api/crop-recommendations/crop-info/{crop_name}")
async def get_crop_info(crop_name: str):
    """Get detailed information about a specific crop"""
    try:
        crop_info = CROP_DATABASE.get(crop_name.lower())
        if not crop_info:
            raise HTTPException(status_code=404, detail="Crop information not found")
        
        return {
            "crop_name": crop_name.title(),
            **crop_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crop info: {str(e)}")

@router.get("/api/crop-recommendations/market-analysis")
async def get_market_analysis():
    """Get current market analysis and trends"""
    try:
        analysis = {
            "market_trends": {
                "rising_prices": [
                    {"crop": "Cotton", "change": "+12%", "reason": "Export demand"},
                    {"crop": "Rice", "change": "+8%", "reason": "Reduced production"},
                    {"crop": "Tomato", "change": "+15%", "reason": "Seasonal shortage"}
                ],
                "stable_crops": [
                    {"crop": "Wheat", "change": "±2%", "reason": "Government procurement"},
                    {"crop": "Sugarcane", "change": "±1%", "reason": "Fixed pricing"}
                ],
                "export_demand": [
                    {"crop": "Basmati Rice", "demand": "Very High"},
                    {"crop": "Cotton", "demand": "High"}, 
                    {"crop": "Wheat", "demand": "Medium"}
                ]
            },
            "seasonal_recommendations": {
                "current_season": "Kharif",
                "recommended_crops": ["Rice", "Cotton", "Sugarcane"],
                "avoid_crops": ["Wheat"],
                "reason": "Monsoon season suitable for water-intensive crops"
            },
            "price_forecasts": {
                "next_quarter": {
                    "rice": "Expected 5-8% increase",
                    "cotton": "Volatile, 10-15% fluctuation expected",
                    "wheat": "Stable, minimal change expected"
                }
            }
        }
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market analysis: {str(e)}")

@router.get("/api/crop-recommendations/stats")
async def get_recommendation_stats():
    """Get analytics on recommendation requests and trends"""
    try:
        # This would typically query the database for real analytics
        stats = {
            "total_requests": 1250,
            "most_requested_crops": [
                {"crop": "Rice", "requests": 340},
                {"crop": "Cotton", "requests": 285},
                {"crop": "Wheat", "requests": 220},
                {"crop": "Tomato", "requests": 185},
                {"crop": "Sugarcane", "requests": 140}
            ],
            "top_regions": [
                {"region": "Punjab", "requests": 180},
                {"region": "Maharashtra", "requests": 165},
                {"region": "Uttar Pradesh", "requests": 150},
                {"region": "Karnataka", "requests": 130},
                {"region": "Andhra Pradesh", "requests": 120}
            ],
            "average_suitability": 78.5,
            "success_rate": 85.2
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendation stats: {str(e)}")
