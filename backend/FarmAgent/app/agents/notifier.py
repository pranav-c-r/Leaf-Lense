import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.auth.transport.requests import Request

backend_root = Path(__file__).parent.parent.parent.parent
load_dotenv(backend_root / '.env')

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
SERVICE_ACCOUNT_FILE = backend_root / 'serviceAccountKey.json'
FCM_SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

def get_access_token():
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=FCM_SCOPES)
        creds.refresh(Request())
        return creds.token
    except Exception as e:
        print(f"❌ Error getting access token from service account file: {e}")
        return None

def send_push_notification(token: str, title: str, body: str) -> bool:
    if not FIREBASE_PROJECT_ID:
        print("❌ ERROR: FIREBASE_PROJECT_ID missing in .env")
        return False

    access_token = get_access_token()
    if not access_token:
        return False

    url = f"https://fcm.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/messages:send"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        "message": {
            "token": token,
            "notification": {
                "title": title,
                "body": body,
            },
            "webpush": {
                "fcm_options": {
                    "link": "/" 
                },
                "notification": {
                   "icon": "/logo192.png"
                }
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        print(f"✅ Push notification sent successfully to token ending in ...{token[-5:]}")
        return True
    except requests.exceptions.HTTPError as err:
        print(f"❌ Push notification failed for token ...{token[-5:]}: {err}")
        if err.response:
            print(f"FCM Response: {err.response.text}")
        return False

