import requests
import io
from PIL import Image
import numpy as np

# Create a simple test image
print("📊 Creating test image...")
test_image = Image.new('RGB', (128, 128), color='green')
test_image_bytes = io.BytesIO()
test_image.save(test_image_bytes, format='PNG')
test_image_bytes.seek(0)

# Test the API
api_url = "http://127.0.0.1:8000/plant/disease/predict"

try:
    print("📊 Testing API endpoint...")
    files = {'file': ('test_plant.png', test_image_bytes, 'image/png')}
    response = requests.post(api_url, files=files)
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"📊 Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ SUCCESS! Disease prediction working!")
        print(f"   - Detected: {result.get('class', 'N/A')}")
        print(f"   - Confidence: {result.get('confidence', 'N/A')}%")
        print(f"   - Model Type: {result.get('model_type', 'N/A')}")
        print(f"   - Advice: {result.get('advice', 'N/A')[:100]}...")
    else:
        print(f"❌ API call failed")
        
except Exception as e:
    print(f"❌ Error testing API: {e}")
    print("🔍 Make sure the server is running on http://127.0.0.1:8000")
