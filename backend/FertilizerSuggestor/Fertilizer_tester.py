import joblib
import pandas as pd
import json
from langchain_google_genai import ChatGoogleGenerativeAI
import os
# Load your trained scikit-learn model
model, columns = joblib.load("fertilizer_model.pkl")
GEMINI_API_KEY = "AIzaSyCt5HrCdlC_eBzEdHnnyPb7mqRXDhhmSLk"
def predict_fertilizer(input_data: dict):
    new_data = pd.DataFrame([input_data])
    new_data = pd.get_dummies(new_data)
    new_data = new_data.reindex(columns=columns, fill_value=0)
    return model.predict(new_data)[0]

soil_type=input("Enter the soil type:")
crop_type=input("Enter the crop type:")
nitrogen=input("Enter the nitrogen level:")
phosphorus=input("Enter the phosphorus level:")
potassium=input("Enter the potassium level:")
temperature=input("Enter the temperature:")
humidity=input("Enter the humidity:")
moisture=input("Enter the moisture:")

# Example user input
user_input = (
    f"The soil type is {soil_type}, crop is {crop_type}, Nitrogen {nitrogen}, Phosphorus {phosphorus}, Potassium {potassium}, "
    f"Temperature {temperature}, Humidity {humidity}, Moisture {moisture}.\n"
    "Extract the following fields and return ONLY valid JSON (no explanation, no markdown, no text):\n"
    "{\n"
    "  \"Temperature\": <int>,\n"
    "  \"Humidity\": <int>,\n"
    "  \"Moisture\": <int>,\n"
    "  \"Soil Type\": <string>,\n"
    "  \"Crop Type\": <string>,\n"
    "  \"Nitrogen\": <int>,\n"
    "  \"Phosphorus\": <int>,\n"
    "  \"Potassium\": <int>\n"
    "}"
)


# Use Gemini to extract structured JSON
llm = ChatGoogleGenerativeAI(
    api_key=os.getenv("GOOGLE_API_KEY"),
    model='gemini-1.5-flash'
)

response = llm.invoke(user_input)

# The content is usually in response["candidates"][0]["content"]

# Print Gemini's raw output for debugging
print("Gemini raw output:\n", response.text)

# Try to extract JSON from the response
import re
try:
    # Try to find the first JSON object in the response
    match = re.search(r'\{[\s\S]*\}', response.text)
    if match:
        json_text = match.group(0)
        json_data = json.loads(json_text)
    else:
        raise ValueError("No JSON object found in Gemini response.")
except Exception as e:
    print("Error parsing Gemini output as JSON:", e)
    print("Raw Gemini output was:\n", response.text)
    raise

# Predict fertilizer
prediction = predict_fertilizer(json_data)
print("Recommended Fertilizer:", prediction)
