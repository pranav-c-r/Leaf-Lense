from FarmAgent.app.clients.firestore_client import get_all_farmers, save_alert
from FarmAgent.app.agents.weather_agent import analyze_weather
from FarmAgent.app.agents.risk_engine import calculate_risks
from FarmAgent.app.agents.reasoner import generate_advice
from FarmAgent.app.agents.notifier import send_push_notification

async def run_daily_pipeline():
    print("🚀 Starting daily pipeline run...")
    all_farmers = get_all_farmers()

    for farmer in all_farmers:
        farmer_id = farmer.get('id')
        if not farmer_id:
            continue
            
        print(f"Processing farmer: {farmer.get('name', farmer_id)}")
        
        try:
            weather = await analyze_weather(farmer.get("lat"), farmer.get("lon"))
            if not weather or weather.get('error'):
                print(f"  -> Skipping {farmer_id}, weather fetch failed.")
                continue

            risks = calculate_risks(weather, farmer.get("crop", "default"))
            advice_message = await generate_advice(farmer, weather, risks)
            
            alert_data = {
                "message": advice_message,
                "weather": weather,
                "risks": risks
            }
            save_alert(farmer_id, alert_data)
            
            if "push_subscription_token" in farmer and farmer["push_subscription_token"]:
                token = farmer["push_subscription_token"]
                title = f"Farm Alert for {farmer.get('crop', 'your farm')}"
                
                send_push_notification(
                    token=token,
                    title=title,
                    body=advice_message
                )
            else:
                print(f"  -> Farmer {farmer_id} not subscribed to push notifications.")

        except Exception as e:
            print(f"  -> ❌ Error processing farmer {farmer_id}: {e}")

    print("✅ Daily pipeline run finished.")

