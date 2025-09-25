import os
import numpy as np
import tensorflow as tf
from PIL import Image
import io

# Class names from your application
class_names = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight", "Potato___Late_blight",
    "Potato___healthy", "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot", "Tomato___Early_blight",
    "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

def load_and_test_model():
    # Try loading the keras model
    model_path = r"D:\LeafLense-2\LeafLense-2\backend\models\trained_model.keras"
    
    print(f"Loading model from: {model_path}")
    print(f"Model exists: {os.path.exists(model_path)}")
    
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"✅ Model loaded successfully")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
        print(f"Number of classes expected: {len(class_names)}")
        print(f"Model output units: {model.layers[-1].units if hasattr(model.layers[-1], 'units') else 'Unknown'}")
        
        # Model summary
        print("\nModel Summary:")
        model.summary()
        
        # Test with random data
        print("\n--- Testing with Random Data ---")
        test_input = np.random.random((1, 128, 128, 3))
        prediction = model.predict(test_input)
        
        print(f"Raw prediction shape: {prediction.shape}")
        print(f"Raw prediction (first 10): {prediction[0][:10]}")
        
        # Apply softmax if needed
        if not np.allclose(np.sum(prediction, axis=1), 1.0):
            print("Applying softmax...")
            prediction = tf.nn.softmax(prediction).numpy()
        else:
            print("Prediction already normalized")
            
        print(f"Normalized prediction (first 10): {prediction[0][:10]}")
        print(f"Sum of predictions: {np.sum(prediction[0])}")
        
        # Get top predictions
        top_indices = np.argsort(prediction[0])[-5:][::-1]
        print("\nTop 5 predictions:")
        for i, idx in enumerate(top_indices):
            print(f"{i+1}. {class_names[idx]}: {prediction[0][idx]*100:.2f}%")
            
        # Check if model weights are properly trained
        print(f"\nModel weights analysis:")
        total_weights = 0
        for layer in model.layers:
            if hasattr(layer, 'get_weights') and layer.get_weights():
                weights = layer.get_weights()[0]
                total_weights += np.sum(np.abs(weights))
                print(f"Layer {layer.name}: avg weight magnitude = {np.mean(np.abs(weights)):.6f}")
        
        print(f"Total absolute weight sum: {total_weights}")
        
        if total_weights < 1e-6:
            print("⚠️ WARNING: Model weights are very small - model may not be trained properly!")
        
        return model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_savedmodel():
    """Test the SavedModel format as well"""
    savedmodel_path = r"D:\LeafLense-2\LeafLense-2\backend\Plant_Disease\trained_model_savedmodel"
    
    print(f"\n--- Testing SavedModel ---")
    print(f"SavedModel path: {savedmodel_path}")
    print(f"SavedModel exists: {os.path.exists(savedmodel_path)}")
    
    try:
        model = tf.keras.models.load_model(savedmodel_path)
        print(f"✅ SavedModel loaded successfully")
        
        # Test with random data
        test_input = np.random.random((1, 128, 128, 3))
        prediction = model.predict(test_input)
        
        print(f"SavedModel prediction shape: {prediction.shape}")
        print(f"SavedModel prediction (first 10): {prediction[0][:10]}")
        
        return model
        
    except Exception as e:
        print(f"❌ Error loading SavedModel: {e}")
        return None

if __name__ == "__main__":
    print("=== Model Diagnosis ===")
    
    # Test Keras model
    keras_model = load_and_test_model()
    
    # Test SavedModel
    saved_model = test_savedmodel()
    
    print("\n=== Diagnosis Complete ===")
