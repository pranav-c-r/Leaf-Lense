# scheduler.py
import asyncio
from .clients.firestore_client import get_all_farmers, save_alert
from .agents.weather_agent import analyze_weather
from .agents.risk_engine import calculate_risks
from .agents.reasoner import generate_advice
from .agents.notifier import send_whatsapp_alert

async def process_single_farmer(farmer: dict):
    print(f"Processing {farmer['name']} in {farmer['district']}...")

    # Get weather data
    weather = await analyze_weather(farmer['lat'], farmer['lon'])
    if not weather:
        print(f"Weather data unavailable for {farmer['name']}")
        return

    # Calculate risks
    risks = calculate_risks(weather, farmer.get('crop', 'default'))

    # Generate advice
    if asyncio.iscoroutinefunction(generate_advice):
        message = await generate_advice(farmer, weather, risks)
    else:
        message = generate_advice(farmer, weather, risks)

    # Send WhatsApp alert
    if farmer.get('phone'):
        success = send_whatsapp_alert(farmer['phone'], message)
        status = "sent" if success else "failed"
    else:
        status = "no_phone"

    # Save alert
    alert_data = {
        "message": message,
        "status": status,
        "weather_data": weather,
        "risk_scores": risks
    }

    save_alert(farmer['id'], alert_data)
    print(f"Alert {status} for {farmer['name']}")

async def run_daily_pipeline():
    farmers = get_all_farmers()
    if not farmers:
        print("No farmers found in database")
        return

    tasks = [process_single_farmer(farmer) for farmer in farmers]
    await asyncio.gather(*tasks)
    print(f"Processed {len(farmers)} farmers")
