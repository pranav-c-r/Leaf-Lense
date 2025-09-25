from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import re
from typing import Optional, Dict, Any
from datetime import datetime

# ✅ Router for AI Chat
router = APIRouter(prefix="/ai", tags=["AI Chat"])

# Input schema for chat requests
class ChatRequest(BaseModel):
    query: str
    language: str = "en"
    location: str = "Delhi"
    weather: Optional[Dict[str, Any]] = None

@router.get("/")
def chat_status():
    """Get AI chat service status"""
    return {
        "status": "active",
        "service": "AI Chat Service",
        "version": "1.0.0",
        "supported_languages": ["en", "hi", "ta", "te", "ml", "kn"],
        "features": ["text_chat", "voice_chat", "weather_integration", "multilingual_support"]
    }

@router.post("/chat")
def process_chat(request: ChatRequest):
    """Process chat message and return AI response"""
    try:
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        # Process the query using rule-based responses
        response = generate_ai_response(
            request.query, 
            request.language, 
            request.location, 
            request.weather
        )

        return {
            "response": response,
            "language": request.language,
            "timestamp": datetime.now(),
            "weather": request.weather,
            "confidence": 0.85,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

def generate_ai_response(query: str, language: str, location: str, weather: Optional[Dict] = None) -> str:
    """Generate AI response based on query and context"""
    query_lower = query.lower()
    
    # Weather-related queries
    if any(term in query_lower for term in ['weather', 'rain', 'temperature', 'मौसम', 'बारिश', 'तापमान']):
        return get_weather_response(query_lower, language, location, weather)
    
    # Crop-related queries
    if any(term in query_lower for term in ['crop', 'wheat', 'rice', 'farming', 'फसल', 'गेहूं', 'चावल', 'खेती']):
        return get_crop_response(query_lower, language)
    
    # Fertilizer queries
    if any(term in query_lower for term in ['fertilizer', 'nutrient', 'npk', 'खाद', 'उर्वरक', 'पोषक']):
        return get_fertilizer_response(query_lower, language)
    
    # Disease and pest queries
    if any(term in query_lower for term in ['disease', 'pest', 'insect', 'बीमारी', 'कीट', 'रोग']):
        return get_disease_response(query_lower, language)
    
    # Irrigation and water queries
    if any(term in query_lower for term in ['water', 'irrigation', 'watering', 'पानी', 'सिंचाई']):
        return get_irrigation_response(query_lower, language)
    
    # Harvest and timing queries
    if any(term in query_lower for term in ['harvest', 'when to', 'timing', 'कटाई', 'समय', 'कब']):
        return get_harvest_response(query_lower, language)
    
    # Price and market queries
    if any(term in query_lower for term in ['price', 'market', 'sell', 'cost', 'दाम', 'मूल्य', 'बाजार']):
        return get_price_response(query_lower, language)
    
    # Seed and planting queries
    if any(term in query_lower for term in ['seed', 'planting', 'sowing', 'बीज', 'बुवाई']):
        return get_seed_response(query_lower, language)
    
    # Default response
    return get_default_response(language)

def get_weather_response(query: str, language: str, location: str, weather: Optional[Dict] = None) -> str:
    """Get weather-related response"""
    if weather and weather.get('current'):
        temp = weather['current'].get('temp_c', 'N/A')
        humidity = weather['current'].get('humidity', 'N/A')
        condition = weather['current'].get('condition', {}).get('text', 'Unknown')
        
        if language == 'hi':
            response = f"{location} में वर्तमान मौसम: तापमान {temp}°C, आर्द्रता {humidity}%, मौसम {condition}।"
            
            # Add agricultural advice based on weather
            if isinstance(temp, (int, float)):
                if temp > 35:
                    response += " तेज गर्मी है, फसलों में अधिक पानी दें।"
                elif temp < 10:
                    response += " ठंड है, फसलों को ठंड से बचाएं।"
            
            if isinstance(humidity, (int, float)) and humidity > 80:
                response += " अधिक नमी है, फंगल बीमारियों से सावधान रहें।"
                
            return response
        else:
            response = f"Current weather in {location}: Temperature {temp}°C, Humidity {humidity}%, Condition: {condition}."
            
            # Add agricultural advice
            if isinstance(temp, (int, float)):
                if temp > 35:
                    response += " High temperature - increase irrigation for crops."
                elif temp < 10:
                    response += " Cold weather - protect crops from frost damage."
            
            if isinstance(humidity, (int, float)) and humidity > 80:
                response += " High humidity - watch for fungal diseases."
                
            return response
    else:
        if language == 'hi':
            return "मौसम की जानकारी उपलब्ध नहीं है। स्थानीय मौसम विभाग से जांच करें और फसल की देखभाल करते रहें।"
        else:
            return "Weather information is not available. Please check with local meteorological services and continue regular crop care."

def get_crop_response(query: str, language: str) -> str:
    """Get crop-related response"""
    if language == 'hi':
        if 'गेहूं' in query or 'wheat' in query:
            return "गेहूं की खेती: रबी सीजन में बुवाई करें। उचित सिंचाई, NPK खाद का उपयोग करें। बीमारियों से बचाव करें।"
        elif 'चावल' in query or 'rice' in query:
            return "धान की खेती: खरीफ सीजन में रोपाई करें। पानी की पर्याप्त व्यवस्था रखें। नर्सरी में पहले बीज तैयार करें।"
        else:
            return "फसल की देखभाल: 1) उचित बीज चुनें 2) समय पर बुवाई करें 3) नियमित सिंचाई करें 4) खाद और दवाई का प्रयोग करें।"
    else:
        if 'wheat' in query:
            return "Wheat cultivation: Sow during Rabi season. Ensure proper irrigation, use NPK fertilizers, and protect from diseases."
        elif 'rice' in query:
            return "Rice cultivation: Plant during Kharif season. Maintain adequate water supply. Prepare seedlings in nursery first."
        else:
            return "General crop care: 1) Choose quality seeds 2) Sow at right time 3) Regular irrigation 4) Apply fertilizers and pesticides as needed."

def get_fertilizer_response(query: str, language: str) -> str:
    """Get fertilizer-related response"""
    if language == 'hi':
        return "उर्वरक का उपयोग: NPK (नाइट्रोजन-फास्फोरस-पोटाश) संतुलित मात्रा में दें। मिट्टी की जांच कराएं। जैविक खाद का भी प्रयोग करें। यूरिया, DAP, MOP का सही अनुपात रखें।"
    else:
        return "Fertilizer application: Use balanced NPK (Nitrogen-Phosphorus-Potassium) ratio. Get soil tested. Also use organic manure. Maintain proper ratio of Urea, DAP, and MOP."

def get_disease_response(query: str, language: str) -> str:
    """Get disease and pest response"""
    if language == 'hi':
        return "पौधों की बीमारी से बचाव: 1) साफ खेती करें 2) रोगग्रस्त पत्तियां हटाएं 3) उचित दवा का छिड़काव करें 4) फसल चक्र अपनाएं 5) प्रतिरोधी किस्में लगाएं।"
    else:
        return "Disease and pest management: 1) Maintain field hygiene 2) Remove infected leaves 3) Apply appropriate pesticides 4) Practice crop rotation 5) Use resistant varieties."

def get_irrigation_response(query: str, language: str) -> str:
    """Get irrigation-related response"""
    if language == 'hi':
        return "सिंचाई की जानकारी: मिट्टी की नमी देखकर पानी दें। सुबह या शाम को सिंचाई करें। ड्रिप इरिगेशन अच्छा है। अधिक पानी न दें, जड़ सड़ सकती है।"
    else:
        return "Irrigation guidelines: Water based on soil moisture. Irrigate in morning or evening. Drip irrigation is efficient. Avoid overwatering as it can cause root rot."

def get_harvest_response(query: str, language: str) -> str:
    """Get harvest timing response"""
    if language == 'hi':
        return "कटाई का समय: फसल पकने पर कटाई करें। अनाज सख्त हो जाए तब काटें। मौसम साफ होने पर ही कटाई करें। समय पर कटाई न करने से नुकसान हो सकता है।"
    else:
        return "Harvest timing: Harvest when crop is fully matured. Cut when grains are firm. Harvest in clear weather only. Delayed harvesting can cause losses."

def get_price_response(query: str, language: str) -> str:
    """Get price and market response"""
    if language == 'hi':
        return "बाजार भाव: स्थानीय मंडी से भाव पता करें। सरकारी एमएसपी की जानकारी रखें। अच्छी गुणवत्ता की फसल का बेहतर भाव मिलता है। सही समय पर बेचें।"
    else:
        return "Market prices: Check local mandi rates. Know government MSP rates. Quality produce gets better prices. Sell at the right time for maximum profit."

def get_seed_response(query: str, language: str) -> str:
    """Get seed and planting response"""
    if language == 'hi':
        return "बीज और बुवाई: प्रमाणित बीज का उपयोग करें। बुवाई से पहले बीज ट्रीटमेंट करें। उचित गहराई पर बीज डालें। पंक्ति की दूरी सही रखें।"
    else:
        return "Seeds and sowing: Use certified seeds. Treat seeds before sowing. Plant at proper depth. Maintain correct row spacing."

def get_default_response(language: str) -> str:
    """Get default response when query doesn't match specific categories"""
    if language == 'hi':
        return "मैं आपका कृषि सहायक हूं। मैं फसल, मौसम, खाद, कीट-बीमारी, सिंचाई, कटाई और बाजार से जुड़े सवालों में आपकी मदद कर सकता हूं। कृपया अपना सवाल स्पष्ट रूप से पूछें।"
    else:
        return "I am your agricultural assistant. I can help you with crops, weather, fertilizers, pests, diseases, irrigation, harvesting, and market-related questions. Please ask your question clearly."
