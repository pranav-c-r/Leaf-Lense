from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from FarmAgent.app.scheduler import run_daily_pipeline
from FarmAgent.app.agents.weather_agent import analyze_weather
from FarmAgent.app.agents.risk_engine import calculate_risks
from FarmAgent.app.clients.firestore_client import get_firestore_client
from FarmAgent.app.agents.chat_agent import generate_chat_response

import asyncio
from dotenv import load_dotenv
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
import os

router = APIRouter(prefix="/farmagent", tags=["FarmAgent"])
scheduler = AsyncIOScheduler()

class Subscription(BaseModel):
    userId: str
    token: str

@router.on_event("startup")
async def startup_event():
    if not scheduler.running:
        trigger = CronTrigger(hour=6, minute=0, timezone="Asia/Kolkata")
        scheduler.add_job(run_daily_pipeline, trigger)
        scheduler.start()
        print("✅ FarmAgent scheduler started - Daily runs at 6:00 AM IST")
    else:
        print("⚠️ FarmAgent scheduler already running")

@router.post("/subscribe")
async def subscribe_to_notifications(subscription: Subscription):
    try:
        db = get_firestore_client()
        farmer_ref = db.collection("farmers").document(subscription.userId)
        farmer_ref.update({"push_subscription_token": subscription.token})
        return {
            "status": "success",
            "message": "Subscribed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {str(e)}")

@router.get("/")
async def root():
    return {
        "status": "active",
        "service": "FarmAgent Proactive Alert System",
        "version": "1.0.0"
    }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": asyncio.get_event_loop().time(),
        "database": "firebase"
    }

@router.post("/run-now")
async def trigger_pipeline_now():
    try:
        await run_daily_pipeline()
        return {
            "status": "success",
            "message": "Agent pipeline executed successfully",
            "action": "check_push_notifications_for_alerts"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

@router.post("/farmers")
async def register_farmer(farmer_data: dict):
    try:
        db = get_firestore_client()
        doc_ref = db.collection("farmers").document()
        doc_ref.set(farmer_data)
        return {
            "status": "success",
            "message": "Farmer registered successfully",
            "farmer_id": doc_ref.id,
            "data": farmer_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.get("/farmers")
async def get_all_farmers():
    try:
        db = get_firestore_client()
        farmers_ref = db.collection("farmers")
        farmers = []
        for doc in farmers_ref.stream():
            farmer_data = doc.to_dict()
            farmer_data["id"] = doc.id
            farmers.append(farmer_data)
        return {
            "status": "success",
            "count": len(farmers),
            "farmers": farmers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch farmers: {str(e)}")

@router.get("/alerts")
async def get_all_alerts():
    try:
        db = get_firestore_client()
        alerts_ref = db.collection("alerts")
        alerts = []
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data["id"] = doc.id
            alerts.append(alert_data)
        return {
            "status": "success",
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.get("/alerts/{farmer_id}")
async def get_farmer_alerts(farmer_id: str):
    try:
        db = get_firestore_client()
        alerts_ref = db.collection("alerts").where("farmer_id", "==", farmer_id)
        alerts = []
        for doc in alerts_ref.stream():
            alert_data = doc.to_dict()
            alert_data["id"] = doc.id
            alerts.append(alert_data)
        return {
            "status": "success",
            "farmer_id": farmer_id,
            "count": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")

@router.post("/api/chat")
async def chat_with_farmer(chat_data: dict):
    try:
        db = get_firestore_client()
        farmer_ref = db.collection("farmers").document(chat_data["farmer_id"])
        farmer_doc = farmer_ref.get()
        if not farmer_doc.exists:
            raise HTTPException(status_code=404, detail="Farmer not found")

        farmer = farmer_doc.to_dict()
        weather = await analyze_weather(farmer["lat"], farmer["lon"])
        if not weather:
            raise HTTPException(status_code=500, detail="Could not fetch weather data")

        risks = calculate_risks(weather, farmer.get("crop", "default"))
        response = await generate_chat_response(farmer, chat_data["message"], weather, risks)

        chat_history = {
            "farmer_id": chat_data["farmer_id"],
            "user_message": chat_data["message"],
            "bot_response": response,
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        db.collection("chat_messages").add(chat_history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

