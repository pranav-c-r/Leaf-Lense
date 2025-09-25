import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from backend root directory
backend_root = Path(__file__).parent.parent.parent.parent
load_dotenv(backend_root / '.env')

def get_firestore_client():
    if not firebase_admin._apps:
        try:
            # Try different methods to initialize Firebase
            cred_path = None
            
            # Method 1: Use GOOGLE_APPLICATION_CREDENTIALS env var
            if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
                backend_dir = Path(__file__).resolve().parents[3]
                cred_path = backend_dir / os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
                print(f"Trying to load Firebase credentials from: {cred_path}")
                
                if cred_path.exists():
                    cred = credentials.Certificate(str(cred_path))
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase Admin initialized from GOOGLE_APPLICATION_CREDENTIALS")
                    return firestore.client()
            
            # Method 2: Look for common service account file names
            backend_dir = Path(__file__).resolve().parents[3]
            possible_files = [
                "serviceAccountKey.json",
                "firebase-service-account.json", 
                "firebase-adminsdk.json",
                "service-account.json"
            ]
            
            for filename in possible_files:
                cred_path = backend_dir / filename
                if cred_path.exists():
                    cred = credentials.Certificate(str(cred_path))
                    firebase_admin.initialize_app(cred)
                    print(f"✅ Firebase Admin initialized from {filename}")
                    return firestore.client()
            
            # Method 3: Use Firebase Admin SDK default credentials (for deployed environments)
            try:
                firebase_admin.initialize_app()
                print("✅ Firebase Admin initialized with default credentials")
                return firestore.client()
            except Exception as default_e:
                print(f"Default credentials failed: {default_e}")
            
            # If all methods fail, create a mock client for development
            print("⚠️ Warning: Using mock Firebase client for development")
            return create_mock_firestore_client()
            
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            print("⚠️ Using mock Firebase client for development")
            return create_mock_firestore_client()
    
    return firestore.client()

def create_mock_firestore_client():
    """Creates a mock Firestore client for development when Firebase is not available"""
    class MockDoc:
        def __init__(self, data, doc_id):
            self._data = data
            self._id = doc_id
        
        def to_dict(self):
            return self._data
        
        @property
        def id(self):
            return self._id
    
    class MockCollection:
        def __init__(self):
            self._docs = {
                'farmers': [
                    {'id': 'farmer1', 'name': 'Mock Farmer', 'district': 'Test District', 'crop': 'rice', 'lat': 12.9716, 'lon': 77.5946}
                ],
                'alerts': []
            }
        
        def stream(self):
            collection_name = getattr(self, '_collection_name', 'farmers')
            docs = self._docs.get(collection_name, [])
            return [MockDoc(doc, doc['id']) for doc in docs]
        
        def add(self, data):
            collection_name = getattr(self, '_collection_name', 'alerts')
            doc_id = f"mock_{len(self._docs[collection_name])}"
            data['id'] = doc_id
            self._docs[collection_name].append(data)
            return MockDoc(data, doc_id)
    
    class MockFirestore:
        def collection(self, name):
            mock_collection = MockCollection()
            mock_collection._collection_name = name
            return mock_collection
    
    return MockFirestore()



def get_all_farmers():
    db = get_firestore_client()
    farmers_ref = db.collection('farmers')
    farmers = []

    try:
        for doc in farmers_ref.stream():
            farmer_data = doc.to_dict()
            farmer_data['id'] = doc.id
            farmers.append(farmer_data)
    except Exception as e:
        print(f"Error fetching farmers: {e}")


    return farmers

def save_alert(farmer_id: str, alert_data: dict):
    db = get_firestore_client()
    try:
        alert_data = alert_data.copy()  # avoid mutating input
        alert_data['farmer_id'] = farmer_id
        alert_data['timestamp'] = firestore.SERVER_TIMESTAMP
        db.collection('alerts').add(alert_data)
    except Exception as e:
        print(f"Failed to save alert for {farmer_id}: {e}")

