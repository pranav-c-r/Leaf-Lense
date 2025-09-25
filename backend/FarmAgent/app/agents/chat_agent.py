import os
from langchain_google_genai import ChatGoogleGenerativeAI

# Environment variables are already loaded globally in main.py
# So here we just configure the API key

def create_chat_prompt(farmer, user_question, weather_data, risk_scores):
    """Creates the context-aware prompt for the chatbot"""
    return f"""
You are FarmAI, an agricultural expert assistant for {farmer.get('name', 'the farmer')}.

**FARMER'S CONTEXT:**
- Location: {farmer.get('district', 'Unknown district')}
- Crop: {farmer.get('crop', 'Unknown crop')} ({farmer.get('growth_stage', 'Unknown stage')})
- Coordinates: {farmer.get('lat', 'N/A')}, {farmer.get('lon', 'N/A')}

**CURRENT WEATHER:**
- Temperature: {weather_data.get('current_temp', 'N/A')}°C
- Humidity: {weather_data.get('current_humidity', 'N/A')}%
- Conditions: {weather_data.get('conditions', 'N/A')}
- Rainfall: {weather_data.get('total_rainfall', 0)}mm last 24h

**CURRENT RISKS:**
- Disease risk: {risk_scores.get('disease_risk', 0)*100}%
- Pest risk: {risk_scores.get('pest_risk', 0)*100}%
- Irrigation advice: {risk_scores.get('irrigation_action', 'monitor')}

**FARMER'S QUESTION:**
{user_question}

**INSTRUCTIONS:**
Answer specifically for THIS farmer's situation. Be practical and actionable.
Keep response under 200 characters. Use simple language.
"""

async def generate_chat_response(farmer, user_question, weather_data, risk_scores):
    """Generates context-aware response for farmer's questions"""
    prompt = create_chat_prompt(farmer, user_question, weather_data, risk_scores)
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            model_kwargs={}
        )
        response = llm.invoke(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Chat error: {e}")
        return "I'm having trouble connecting to weather data right now. Please try again later."
