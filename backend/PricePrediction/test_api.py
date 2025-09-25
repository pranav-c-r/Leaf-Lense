#!/usr/bin/env python3
"""
Test script to verify the price prediction API is working
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing LeafLense Price Prediction API")
    print("=" * 50)
    
    # Test 1: Service status
    try:
        print("1. Testing service status...")
        response = requests.get(f"{base_url}/price/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Service Status: {data['status']}")
            print(f"   ✅ Model Loaded: {data['model_loaded']}")
        else:
            print(f"   ❌ Status check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Test 2: Get commodities
    try:
        print("\n2. Testing commodities endpoint...")
        response = requests.get(f"{base_url}/price/commodities")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Found {data['count']} commodities")
            print(f"   📋 Sample commodities: {data['commodities'][:5]}")
        else:
            print(f"   ❌ Commodities request failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Commodities request error: {e}")
    
    # Test 3: Get states
    try:
        print("\n3. Testing states endpoint...")
        response = requests.get(f"{base_url}/price/states")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Found {data['count']} states")
            print(f"   📋 Sample states: {data['states'][:5]}")
        else:
            print(f"   ❌ States request failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ States request error: {e}")
    
    # Test 4: Make a prediction
    try:
        print("\n4. Testing prediction endpoint...")
        test_data = {
            "month": "January",
            "commodity_name": "Rice",
            "avg_min_price": 1500.0,
            "avg_max_price": 1800.0,
            "state_name": "Maharashtra",
            "district_name": "Mumbai",
            "calculationType": "per_quintal",
            "change": 5.5
        }
        
        response = requests.post(
            f"{base_url}/price/predict",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Prediction successful!")
            print(f"   💰 Predicted price: ₹{data['predicted_price']:.2f}")
            print(f"   📊 Status: {data['status']}")
        else:
            print(f"   ❌ Prediction failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Prediction error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API test completed!")
    return True

if __name__ == "__main__":
    # Wait a moment for server to start
    print("⏳ Waiting 5 seconds for server to start...")
    time.sleep(5)
    test_api()
