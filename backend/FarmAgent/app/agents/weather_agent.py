# agents/weather_agent.py
import aiohttp
import os, httpx, math
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from backend root directory
backend_root = Path(__file__).parent.parent.parent.parent
load_dotenv(backend_root / '.env')
API_KEY = os.getenv("OWM_API_KEY")
async def analyze_weather(lat: float, lon: float) -> dict:
    """
    Fetch weather data from API and ensure all required keys exist.
    Returns a dict with defaults if missing.
    """
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                data = await resp.json()
        except Exception as e:
            print(f"Weather API error: {e}")
            data = {}

    weather = {
        'current_temp': data.get('main', {}).get('temp', 25),
        'avg_temp': data.get('main', {}).get('temp', 25),
        'total_rainfall': data.get('rain', {}).get('1h', 0),
        'wet_hours': 1 if data.get('rain', {}).get('1h', 0) > 0 else 0,
        'max_wind_speed': data.get('wind', {}).get('speed', 0),
        'humidity': data.get('main', {}).get('humidity', 50),
        'conditions': data.get('weather', [{}])[0].get('description', 'Unknown')
    }


    return weather
