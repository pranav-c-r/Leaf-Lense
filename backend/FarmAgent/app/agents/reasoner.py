import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
chat = ChatGoogleGenerativeAI(
    api_key=os.getenv("GOOGLE_API_KEY"),
    model="gemini-1.5-flash"    
)

async def generate_advice(farmer: dict, weather: dict, risks: dict) -> str:
    prompt = f"""
    Create urgent weather advisory for farmer. MAX 160 CHARACTERS.

    FARMER: {farmer.get('name')} - {farmer.get('crop')} ({farmer.get('growth_stage')})
    LOCATION: {farmer.get('district')}
    
    WEATHER: {weather['current_temp']}°C, {weather['humidity']}% humidity, {weather['conditions']}
    RAIN: {weather['total_rainfall']}mm last 24h, {weather['wet_hours']} humid hours
    
    RISKS: Disease {risks['disease_risk']*100}%, Pests {risks['pest_risk']*100}%
    ACTION: {risks['irrigation_action'].upper()} irrigation

    Write direct, urgent message in English. No greetings. Just critical actions.
    """
    try:
        response = await chat.agenerate(messages=[{"role": "user", "content": prompt}])
        return response.generations[0][0].text.strip().replace('*', '').replace('#', '')[:160]
    except Exception as e:
        return f"URGENT: {risks['disease_risk']*100}% disease risk. {risks['irrigation_action'].upper()} irrigation for {farmer.get('crop')}."
