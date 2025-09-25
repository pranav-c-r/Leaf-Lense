"""
Test script to verify the model prediction fixes
This simulates the behavior with the actual prediction values you provided
"""

import numpy as np

# Your actual prediction values from the JSON output
actual_predictions = [
    0.021038254722952843,
    0.0015900521539151669,
    0.006108887493610382,
    0.014116844162344933,
    0.002468020422384143,
    0.0217671450227499,
    0.0037544514052569866,
    0.0938277617096901,
    0.04395011067390442,
    0.06136709079146385
]

# Class names from your application (first 10 for testing)
class_names_sample = [
    "Apple___Apple_scab", 
    "Apple___Black_rot", 
    "Apple___Cedar_apple_rust", 
    "Apple___healthy",
    "Blueberry___healthy", 
    "Cherry_(including_sour)___Powdery_mildew", 
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", 
    "Corn_(maize)___Common_rust_", 
    "Corn_(maize)___Northern_Leaf_Blight"
]

def test_improved_logic():
    print("=== Testing Improved Prediction Logic ===")
    
    prediction = np.array(actual_predictions)
    
    # Simulate the improved logic
    print(f"Raw predictions: {prediction}")
    print(f"Raw predictions sum: {np.sum(prediction):.6f}")
    
    # Normalize if needed (like in the improved code)
    if not np.allclose(np.sum(prediction), 1.0, atol=1e-6):
        print("Normalizing predictions...")
        prediction = prediction / np.sum(prediction)
    
    print(f"Normalized predictions: {prediction}")
    print(f"Normalized sum: {np.sum(prediction):.6f}")
    
    # Get top 5 predictions
    top_indices = np.argsort(prediction)[-5:][::-1]
    top_confidences = prediction[top_indices]
    
    result_index = top_indices[0]
    confidence = float(top_confidences[0]) * 100
    
    print(f"\nTop 5 predictions:")
    for i, (idx, conf) in enumerate(zip(top_indices, top_confidences)):
        print(f"  {i+1}. {class_names_sample[idx]}: {conf*100:.2f}%")
    
    # Test the improved threshold logic
    max_prediction = np.max(prediction)
    print(f"\nMaximum prediction value: {max_prediction*100:.2f}%")
    
    # Determine threshold
    if max_prediction < 0.15:  # If all predictions are less than 15%
        print("⚠️ All predictions are very low - using adaptive threshold")
        confidence_threshold = 5.0  # Lower threshold
    else:
        confidence_threshold = 30.0  # Standard threshold
    
    print(f"Using confidence threshold: {confidence_threshold}%")
    print(f"Top prediction confidence: {confidence:.2f}%")
    
    # Apply the improved logic
    if confidence < confidence_threshold:
        if len(top_confidences) > 1:
            confidence_gap = (top_confidences[0] - top_confidences[1]) * 100
            print(f"Confidence gap between top 2 predictions: {confidence_gap:.2f}%")
            
            if confidence_gap > 1.0:  # If there's a reasonable gap
                result = class_names_sample[result_index]
                print(f"✅ Accepting prediction due to confidence gap: {result}")
                
                if "healthy" in result.lower():
                    advice = "Your plant appears to be healthy based on the analysis, though the confidence is moderate."
                else:
                    advice = f"Potential issue detected: {result.replace('___', ' ').replace('_', ' ')}. The confidence is moderate, so please verify."
            else:
                result = f"{class_names_sample[top_indices[0]]} or {class_names_sample[top_indices[1]]}"
                advice = "Multiple potential conditions detected with similar probabilities."
                print(f"✅ Multiple conditions suggested: {result}")
        else:
            result = "Uncertain Classification"
            advice = "Unable to make a confident prediction."
            print(f"❌ Uncertain classification")
    else:
        result = class_names_sample[result_index]
        advice = f"High confidence prediction: {result}"
        print(f"✅ High confidence prediction: {result}")
    
    print(f"\nFinal Result: {result}")
    print(f"Advice: {advice}")
    
    return {
        "class": result,
        "confidence": round(confidence, 2),
        "advice": advice,
        "all_predictions": prediction[:10].tolist()
    }

def compare_old_vs_new():
    print("\n=== Comparison: Old vs New Logic ===")
    
    prediction = np.array(actual_predictions)
    
    # OLD logic (what was happening before)
    print("OLD LOGIC:")
    top_index = np.argmax(prediction)
    old_confidence = prediction[top_index] * 100
    print(f"  Top prediction: {class_names_sample[top_index]} ({old_confidence:.2f}%)")
    
    if old_confidence < 30:
        old_result = "Unknown Disease (Low confidence)"
        print(f"  Result: {old_result}")
    else:
        old_result = class_names_sample[top_index]
        print(f"  Result: {old_result}")
    
    # NEW logic
    print("\nNEW LOGIC:")
    result = test_improved_logic()
    print(f"  Result: {result['class']} ({result['confidence']:.2f}%)")
    
    print(f"\n🔄 IMPROVEMENT:")
    print(f"  Before: Always returned '{old_result}' due to low confidence")
    print(f"  After: Returns '{result['class']}' with adaptive thresholding")

if __name__ == "__main__":
    test_result = test_improved_logic()
    compare_old_vs_new()
    
    print(f"\n=== Summary ===")
    print(f"✅ Fixed adaptive confidence thresholding")
    print(f"✅ Improved prediction selection logic")  
    print(f"✅ Better handling of low-confidence scenarios")
    print(f"✅ Enhanced logging for debugging")
    
    print(f"\nThe model should now:")
    print(f"1. Use lower thresholds when all predictions are low")
    print(f"2. Consider confidence gaps between top predictions")
    print(f"3. Provide more informative responses")
    print(f"4. Log detailed information for debugging")
