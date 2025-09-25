import requests
import os, httpx, math
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
 
API_KEY = os.getenv("OWM_API_KEY")
if not API_KEY:
    raise EnvironmentError("OWM_API_KEY not found in .env")
BASE_URL = "https://api.tomorrow.io/v4/weather/realtime"

def get_weather(city):
    try:
        # Build request
        params = {
            "location": city,
            "apikey": API_KEY
        }
        response = requests.get(BASE_URL, params=params, timeout=10)

        if response.status_code != 200:
            return {"error": f"API error: {response.status_code} {response.text}"}

        data = response.json()

        # Extract weather data
        values = data.get("data", {}).get("values", {})
        if not values:
            return {"error": "No weather data available"}

        weather_info = {
            "temperature": values.get("temperature", 25),
            "humidity": values.get("humidity", 50),
            "wind_speed": values.get("windSpeed", 0),
            "cloud_cover": values.get("cloudCover", 0),
            "rain_intensity": values.get("rainIntensity", 0),
            "city": city
        }
        return weather_info

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    city = input("Enter city name: ")
    weather = get_weather(city)
    print(weather)
