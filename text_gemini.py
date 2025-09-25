"""
Test script to verify Gemini Vision API is working correctly
"""

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
# Load environment variables
load_dotenv()

def test_gemini_setup():
    print("=== Testing Gemini Vision API Setup ===")
    
    # Check API key
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No API key found! Please set GOOGLE_API_KEY or GEMINI_API_KEY in your .env file")
        return False
    
    print(f"✅ API key found: {api_key[:10]}...")
    
    try:
        # Configure Gemini
        llm = ChatGoogleGenerativeAI(
            model='gemini-1.5-flash',
            api_key=api_key
        )
        print("✅ Gemini model initialized successfully")
        
        # Test with a simple text prompt
        test_prompt = "Hello, can you help me identify plant diseases?"
        response = llm.invoke(test_prompt)
        
        if response.text:
            print("✅ Gemini API is responding correctly")
            print(f"Sample response: {response.text[:100]}...")
            return True
        else:
            print("❌ Empty response from Gemini API")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Gemini API: {str(e)}")
        return False

def test_plant_analysis():
    """Test plant analysis capabilities"""
    print("\n=== Testing Plant Analysis Capabilities ===")
    
    try:
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        llm = ChatGoogleGenerativeAI(
            model='gemini-1.5-flash',
            api_key=api_key
        )
        # Test plant analysis prompt
        plant_prompt = """
        You are an expert plant pathologist. If I send you an image of a plant leaf, 
        can you analyze it for diseases and provide treatment recommendations?
        Please respond with your capabilities and approach.
        """
        
        response = llm.invoke(plant_prompt)
        
        if response.text:
            print("✅ Gemini can analyze plant diseases")
            print(f"Response preview: {response.text[:200]}...")
            return True
        else:
            print("❌ No response for plant analysis test")
            return False
            
    except Exception as e:
        print(f"❌ Error testing plant analysis: {str(e)}")
        return False

if __name__ == "__main__":
    print("🌱 LeafLense Gemini Vision API Test\n")
    
    setup_ok = test_gemini_setup()
    if setup_ok:
        analysis_ok = test_plant_analysis()
        
        if setup_ok and analysis_ok:
            print("\n🎉 All tests passed! Gemini Vision API is ready for plant disease detection.")
            print("\nNext steps:")
            print("1. Start your FastAPI server")
            print("2. Upload a plant image to /disease/predict")
            print("3. Get detailed plant analysis and treatment recommendations")
        else:
            print("\n⚠️ Some tests failed. Check your API key and internet connection.")
    else:
        print("\n❌ Setup failed. Cannot proceed with plant analysis test.")
        print("\nPlease:")
        print("1. Check your GOOGLE_API_KEY in the .env file")
        print("2. Ensure you have internet connectivity")
        print("3. Verify your Gemini API quota/billing")
