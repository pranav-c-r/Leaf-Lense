import os
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
import logging
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/disease", tags=["Plant Disease"])

# Initialize Gemini API
try:
    google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not google_api_key:
        raise ValueError("No Google API key found in environment variables")
    
    genai.configure(api_key=google_api_key)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("✅ Gemini Vision API initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {str(e)}")
    gemini_model = None

def process_image_for_gemini(image_bytes: bytes) -> Image.Image:
    """Process image for optimal Gemini analysis"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize for optimal processing (Gemini works well with various sizes)
        # Keep aspect ratio and ensure reasonable size
        max_size = 1024
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        logger.info(f"Processed image size: {image.size}")
        return image
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise

def extract_structured_response(response_text: str) -> Dict[str, Any]:
    """Extract structured information from Gemini's response"""
    try:
        # Try to extract JSON if present
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Fall back to text parsing with improved structure
        lines = response_text.strip().split('\n')
        result = {
            "plant_type": "Unknown",
            "condition": "Unknown",
            "confidence": "Medium",
            "identification_process": [],
            "symptoms": [],
            "causes": [],
            "why_happens": [],
            "impact_progression": [],
            "immediate_actions": [],
            "precautions": [],
            "timeline": [],
            "additional_tips": [],
            "urgency_level": "Monitor",
            "treatment": {
                "organic": [],
                "chemical": [],
                "prevention": []
            }
        }
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for structured section headers (with **)
            if line.startswith('**') and line.endswith('**'):
                header = line.replace('**', '').strip().lower()
                if 'plant type' in header:
                    current_section = 'plant_type'
                elif 'specific condition' in header or 'condition' in header:
                    current_section = 'condition'
                elif 'confidence' in header:
                    current_section = 'confidence'
                elif 'how i identified' in header or 'identification' in header:
                    current_section = 'identification_process'
                elif 'detailed symptoms' in header or 'symptoms' in header:
                    current_section = 'symptoms'
                elif 'what causes' in header or 'causes' in header:
                    current_section = 'causes'
                elif 'why this happens' in header:
                    current_section = 'why_happens'
                elif 'impact and progression' in header:
                    current_section = 'impact_progression'
                elif 'immediate actions' in header:
                    current_section = 'immediate_actions'
                elif 'important precautions' in header or 'precautions' in header:
                    current_section = 'precautions'
                elif 'expected timeline' in header or 'timeline' in header:
                    current_section = 'timeline'
                elif 'additional tips' in header:
                    current_section = 'additional_tips'
                elif 'urgency level' in header or 'urgency' in header:
                    current_section = 'urgency_level'
                elif 'organic treatment' in header:
                    current_section = 'organic'
                elif 'chemical treatment' in header:
                    current_section = 'chemical'
                elif 'prevention and future care' in header or 'prevention' in header:
                    current_section = 'prevention'
                continue
            
            # Check for key-value pairs (with :)
            if ':' in line and not line.startswith('-'):
                key, value = line.split(':', 1)
                key = key.strip().lower().replace('**', '')
                value = value.strip().replace('[', '').replace(']', '')
                
                if 'plant type' in key:
                    result["plant_type"] = value
                elif 'specific condition' in key or 'condition' in key:
                    result["condition"] = value
                elif 'confidence' in key:
                    result["confidence"] = value
                continue
            
            # Handle list items
            if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                item = line[1:].strip()
                if not item or item.startswith('[') and item.endswith(']'):
                    continue
                    
                if current_section == 'identification_process':
                    result["identification_process"].append(item)
                elif current_section == 'symptoms':
                    result["symptoms"].append(item)
                elif current_section == 'causes':
                    result["causes"].append(item)
                elif current_section == 'why_happens':
                    result["why_happens"].append(item)
                elif current_section == 'impact_progression':
                    result["impact_progression"].append(item)
                elif current_section == 'immediate_actions':
                    result["immediate_actions"].append(item)
                elif current_section == 'precautions':
                    result["precautions"].append(item)
                elif current_section == 'timeline':
                    result["timeline"].append(item)
                elif current_section == 'additional_tips':
                    result["additional_tips"].append(item)
                elif current_section == 'organic':
                    result["treatment"]["organic"].append(item)
                elif current_section == 'chemical':
                    result["treatment"]["chemical"].append(item)
                elif current_section == 'prevention':
                    result["treatment"]["prevention"].append(item)
            
            # Handle urgency level as text (not list item)
            elif current_section == 'urgency_level' and line.strip():
                result["urgency_level"] = line.strip()
        
        # Clean up empty bracket placeholders
        if result["plant_type"] in ["[Name of the plant species, e.g., Tomato, Corn, Apple, etc.]", "Unknown"]:
            result["plant_type"] = "Unknown Plant"
        if result["condition"] in ["[Name the specific disease, pest, or condition - be specific, e.g., \"Tomato Late Blight\", \"Apple Scab\", \"Healthy Plant\", etc.]", "Unknown"]:
            result["condition"] = "Unknown Condition"
            
        return result
        
    except Exception as e:
        logger.error(f"Error extracting structured response: {str(e)}")
        return {
            "plant_type": "Unknown",
            "condition": "Analysis Error",
            "confidence": "Low",
            "raw_response": response_text
        }

async def analyze_plant_with_gemini(image: Image.Image) -> Dict[str, Any]:
    """Use Gemini Vision to analyze plant health"""
    if gemini_model is None:
        raise ValueError("Gemini model not initialized")
    
    try:
        # Create an extremely comprehensive prompt for detailed plant disease analysis
        prompt = """
You are a world-renowned plant pathologist and agricultural specialist with 30+ years of experience. Analyze this plant image with extreme detail and provide the most comprehensive assessment possible. Don't limit information - provide EVERYTHING you can observe and analyze.

IMPORTANT: Be extremely thorough, detailed, and educational. Provide unlimited information in a structured format. This analysis will be used to educate farmers and help save their crops.

Please examine every detail in the image and provide:

**Plant Type**: [Identify the exact plant species, variety if possible, growth stage, and any notable characteristics]

**Overall Health Status**: [Healthy/Diseased/Stressed/Critical - with detailed explanation]

**Specific Condition/Disease**: [Provide the exact disease name, alternative names, scientific pathogen name if applicable]
**Confidence Level**: [High/Medium/Low - explain in detail why you are confident or uncertain, what additional angles/images would help]

**Detailed Visual Analysis - What I See in the Image**:
- [Describe EVERY visible symptom in extreme detail]
- [Color changes: exact colors, gradients, patterns - be very specific]
- [Spot characteristics: size, shape, borders, centers, halos]
- [Leaf texture changes: wilting, curling, brittleness, glossiness]
- [Distribution patterns: where symptoms appear, how they spread]
- [Severity assessment: percentage of plant affected]
- [Any visible insects, eggs, webbing, or pest signs]
- [Stem condition, root visibility if any]
- [Background clues: soil condition, other plants, environment]

**How I Diagnosed This Disease**:
- [Step-by-step explanation of the diagnostic process]
- [Specific visual clues that led to this diagnosis]
- [Distinctive features that rule out other similar diseases]
- [Pattern recognition: how symptoms match known disease profiles]
- [Any unique identifying characteristics]
- [Comparison with similar-looking conditions]
- [what disease it has u mention it here. the name of the disease if it has any.]
**Complete Symptom Breakdown**:
- [Early stage symptoms and progression]
- [Current visible symptoms in detail]
- [Advanced stage symptoms if progression continues]
- [Microscopic details that might be present]
- [Seasonal variation in symptom appearance]

**Disease Biology and Pathology**:
- [Scientific name and classification of the pathogen]
- [Life cycle of the disease organism]
- [How the pathogen infects and spreads]
- [Optimal conditions for pathogen growth]
- [Host range and susceptibility factors]
- [Disease triangle: host, pathogen, environment interaction]

**Root Causes and Contributing Factors**:
- [Primary causes of this condition]
- [Environmental factors that promote disease]
- [Cultural practices that increase susceptibility]
- [Stress factors that weaken plant immunity]
- [Seasonal timing and weather patterns]
- [Soil conditions that favor disease]
- [Water management issues]
- [Nutrition imbalances that contribute]

**Complete Impact Analysis**:
- [Immediate effects on plant health]
- [Impact on photosynthesis and plant metabolism]
- [Effects on fruit/grain production and quality]
- [Economic impact and yield losses]
- [Long-term plant health consequences]
- [Impact on neighboring plants]
- [Effects on soil health]

**Disease Progression Timeline**:
- [Day-by-day progression if untreated]
- [Critical intervention points]
- [Point of no return for plant recovery]
- [Spread rate to other plants]
- [Seasonal progression patterns]

**Emergency Response Plan**:
- [Immediate actions in first 24 hours]
- [Priority steps to prevent spread]
- [Emergency isolation procedures]
- [Quick diagnostic confirmation methods]
- [Damage control measures]

**Comprehensive Treatment Strategy**:

**Organic and Natural Treatments**:
- [Detailed homemade remedies with exact recipes]
- [Application methods, timing, and frequency]
- [Beneficial microorganisms and biological controls]
- [Plant-based treatments and essential oils]
- [Soil amendments and organic fertilizers]
- [Cultural control methods]
- [Companion planting solutions]

**Chemical Treatment Options**:
- [Specific fungicides/pesticides with active ingredients]
- [Commercial product names and concentrations]
- [Application rates and mixing instructions]
- [Spray timing and weather considerations]
- [Resistance management strategies]
- [Safety equipment and precautions]
- [Pre-harvest interval and safety periods]

**Integrated Management Approach**:
- [Combination treatment strategies]
- [Sequential treatment protocols]
- [Monitoring and adjustment procedures]
- [Resistance prevention methods]

**Prevention and Long-term Management**:
- [Detailed cultural practices for prevention]
- [Resistant varieties and genetic solutions]
- [Soil health improvement strategies]
- [Water management best practices]
- [Nutrition and fertilization programs]
- [Crop rotation recommendations]
- [Sanitation and hygiene protocols]
- [Monitoring and early detection methods]

**Critical Safety Information**:
- [Personal protective equipment needed]
- [Handling precautions for affected plants]
- [Chemical safety and application warnings]
- [First aid measures if needed]
- [Environmental protection measures]
- [What NOT to do - common dangerous mistakes]
- [When to evacuate/abandon treatment]

**Recovery and Monitoring Timeline**:
- [Expected response to treatment (daily/weekly)]
- [Key indicators of improvement]
- [Warning signs of treatment failure]
- [When to change treatment approach]
- [Long-term recovery expectations]
- [Monitoring schedule and checkpoints]

**Professional Recommendations**:
- [Expert tips for optimal results]
- [Advanced diagnostic techniques]
- [Professional consultation recommendations]
- [Laboratory testing options]
- [Extension service resources]
- [Specialized equipment or tools needed]

**Environmental Modifications**:
- [Microclimate adjustments needed]
- [Greenhouse or protection requirements]
- [Air circulation improvements]
- [Lighting and shading modifications]
- [Temperature and humidity management]

**Similar Diseases to Rule Out**:
- [Differential diagnosis considerations]
- [How to distinguish from look-alike conditions]
- [Additional tests or observations needed]

**Economic Considerations**:
- [Cost-benefit analysis of treatments]
- [Most economical effective treatments]
- [When treatment isn't economically viable]
- [Insurance and crop loss considerations]

**Research and Latest Developments**:
- [Recent scientific findings on this disease]
- [New treatment methods or products]
- [Emerging resistant varieties]
- [Climate change impacts on this disease]

**Regional Considerations**:
- [Geographic prevalence patterns]
- [Local regulatory restrictions]
- [Regional treatment preferences]
- [Climate-specific recommendations]

**Urgency Classification**: [Critical/High/Medium/Low - with detailed explanation of timeframe and consequences of delay]

Be extremely detailed, scientific, and practical. Provide as much information as possible - there are no limits. Think like you're writing a comprehensive case study that will be used to train future plant pathologists.
"""
        
        logger.info("Sending image to Gemini for analysis...")
        
        # Generate response using Gemini Vision
        response = gemini_model.generate_content([prompt, image])
        
        # Check if response was blocked or empty
        if not response.text:
            if response.candidates and response.candidates[0].finish_reason:
                reason = response.candidates[0].finish_reason
                raise ValueError(f"Gemini blocked the response: {reason}")
            else:
                raise ValueError("Empty response from Gemini")
            
        logger.info("Received response from Gemini")
        logger.debug(f"Gemini response: {response.text[:200]}...")
        
        # Process the response
        structured_response = extract_structured_response(response.text)
        structured_response["raw_response"] = response.text
        
        return structured_response
        
    except Exception as e:
        logger.error(f"Error analyzing with Gemini: {str(e)}")
        raise

def format_advice_response(analysis: Dict[str, Any]) -> str:
    """Format the analysis into a user-friendly advice response"""
    try:
        raw_response = analysis.get("raw_response", "")
        
        # If we have a well-formatted response, return it
        if "Plant Identification" in raw_response or "Health Assessment" in raw_response:
            return raw_response
        
        # Otherwise, format the structured data
        advice_parts = []
        
        plant_type = analysis.get("plant_type", "Unknown")
        condition = analysis.get("condition", "Unknown")
        confidence = analysis.get("confidence", "Medium")
        
        advice_parts.append(f"### Plant Analysis")
        advice_parts.append(f"**Plant Type**: {plant_type}")
        advice_parts.append(f"**Condition**: {condition}")
        advice_parts.append(f"**Confidence**: {confidence}")
        advice_parts.append("")
        
        symptoms = analysis.get("symptoms", [])
        if symptoms:
            advice_parts.append("### Symptoms Observed")
            for symptom in symptoms:
                advice_parts.append(f"- {symptom}")
            advice_parts.append("")
        
        causes = analysis.get("causes", [])
        if causes:
            advice_parts.append("### Possible Causes")
            for cause in causes:
                advice_parts.append(f"- {cause}")
            advice_parts.append("")
        
        treatment = analysis.get("treatment", {})
        
        organic = treatment.get("organic", [])
        if organic:
            advice_parts.append("### Organic Remedies")
            for remedy in organic:
                advice_parts.append(f"- {remedy}")
            advice_parts.append("")
        
        chemical = treatment.get("chemical", [])
        if chemical:
            advice_parts.append("### Chemical Treatments")
            for treatment in chemical:
                advice_parts.append(f"- {treatment}")
            advice_parts.append("")
        
        prevention = treatment.get("prevention", [])
        if prevention:
            advice_parts.append("### Prevention")
            for measure in prevention:
                advice_parts.append(f"- {measure}")
        
        if not advice_parts:
            return raw_response or "Unable to analyze the plant image. Please ensure the image is clear and shows the plant clearly."
        
        return "\n".join(advice_parts)
        
    except Exception as e:
        logger.error(f"Error formatting advice: {str(e)}")
        return analysis.get("raw_response", "Analysis completed but formatting failed.")

def determine_confidence_score(analysis: Dict[str, Any]) -> float:
    """Determine a confidence score based on the analysis"""
    try:
        confidence_text = analysis.get("confidence", "medium").lower()
        
        if "high" in confidence_text:
            return 85.0
        elif "low" in confidence_text:
            return 35.0
        else:  # medium or unknown
            return 65.0
            
    except Exception:
        return 65.0

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Analyze plant image using Gemini Vision API"""
    
    if gemini_model is None:
        return JSONResponse(content={
            "error": "Gemini Vision API not available. Please check your API key configuration.",
            "status": "error"
        }, status_code=500)

    try:
        # Read and validate the uploaded file
        contents = await file.read()
        if not contents or len(contents) < 10:
            return JSONResponse(content={
                "error": "Uploaded file is empty or invalid. Please upload a valid image file.",
                "status": "error"
            }, status_code=422)

        logger.info(f"Processing uploaded file: {file.filename}, size: {len(contents)} bytes")

        # Process the image
        try:
            processed_image = process_image_for_gemini(contents)
        except Exception as e:
            return JSONResponse(content={
                "error": "Invalid image file. Please upload a clear photo of the plant.",
                "status": "error"
            }, status_code=422)

        # Analyze with Gemini Vision
        try:
            analysis = await analyze_plant_with_gemini(processed_image)
        except Exception as e:
            logger.error(f"Gemini analysis failed: {str(e)}")
            return JSONResponse(content={
                "error": f"Plant analysis failed: {str(e)}",
                "status": "error"
            }, status_code=500)

        # Format the response
        condition = analysis.get("condition", "Unknown Condition")
        confidence_score = determine_confidence_score(analysis)
        advice = format_advice_response(analysis)
        
        # Create the comprehensive response
        response = {
            "class": condition,
            "confidence": round(confidence_score, 2),
            "advice": advice,
            "model_type": "gemini_vision",
            "status": "success",
            "plant_type": analysis.get("plant_type", "Unknown"),
            "urgency_level": analysis.get("urgency_level", "Monitor"),
            "analysis_details": {
                "identification_process": analysis.get("identification_process", []),
                "symptoms": analysis.get("symptoms", []),
                "causes": analysis.get("causes", []),
                "why_happens": analysis.get("why_happens", []),
                "impact_progression": analysis.get("impact_progression", []),
                "immediate_actions": analysis.get("immediate_actions", []),
                "precautions": analysis.get("precautions", []),
                "timeline": analysis.get("timeline", []),
                "additional_tips": analysis.get("additional_tips", []),
                "treatments": analysis.get("treatment", {})
            }
        }

        logger.info(f"Analysis completed: {condition} with {confidence_score}% confidence")
        return response

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={
            "error": f"An unexpected error occurred: {str(e)}",
            "status": "error"
        }, status_code=500)

@router.get("/health")
def health_check():
    """Health check endpoint to verify Gemini Vision API status"""
    return {
        "status": "healthy",
        "model_type": "gemini_vision",
        "gemini_initialized": gemini_model is not None,
        "api_available": gemini_model is not None,
        "version": "2.0.0"
    }

@router.get("/info")
def get_api_info():
    """Get information about the plant disease detection API"""
    return {
        "name": "Plant Disease Detection API",
        "version": "2.0.0",
        "model": "Google Gemini Vision",
        "capabilities": [
            "Plant species identification",
            "Disease detection and diagnosis",
            "Health assessment",
            "Treatment recommendations",
            "Organic and chemical remedies",
            "Prevention advice"
        ],
        "supported_formats": ["JPEG", "PNG", "WEBP"],
        "max_file_size": "10MB",
        "status": "active" if gemini_model else "unavailable"
    }
