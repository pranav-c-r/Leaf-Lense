# File: backend/plantIdentifier/routes.py

import cv2
import numpy as np
from fastapi import APIRouter, Response
from ultralytics import YOLO

# 1. SETUP
# =============================================
# Create an API Router
router = APIRouter()

# Load the pre-trained YOLO model (this happens only once when the server starts)
try:
    model = YOLO('yolov8n.pt')
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

# Initialize webcam capture (also happens only once)
try:
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise IOError("Cannot open webcam")
except Exception as e:
    print(f"Error initializing webcam: {e}")
    cap = None

# --- Define HSV Color Ranges for Heatmap ---
LOWER_HEALTHY_GREEN = np.array([35, 40, 40])
UPPER_HEALTHY_GREEN = np.array([85, 255, 255])
LOWER_DAMAGED_BROWN = np.array([10, 50, 50])
UPPER_DAMAGED_BROWN = np.array([30, 255, 200])

# 2. CORE LOGIC
# =============================================
def process_frame_for_streaming(frame):
    """
    Takes a raw frame, runs all CV logic, and returns the processed frame.
    """
    # Run YOLO model on the frame
    results = model(frame)

    # Loop through each detected object
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])
            class_name = model.names[int(box.cls[0])]

            # --- Conditional Analysis: Apply logic based on what's detected ---
            if class_name == 'potted plant' and confidence > 0.5:
                plant_roi = frame[y1:y2, x1:x2]
                if plant_roi.size == 0: continue

                # Convert ROI to HSV for color analysis
                hsv = cv2.cvtColor(plant_roi, cv2.COLOR_BGR2HSV)
                mask_green = cv2.inRange(hsv, LOWER_HEALTHY_GREEN, UPPER_HEALTHY_GREEN)
                mask_brown = cv2.inRange(hsv, LOWER_DAMAGED_BROWN, UPPER_DAMAGED_BROWN)

                # Create heatmap
                heatmap = np.zeros_like(plant_roi)
                heatmap[mask_brown > 0] = [0, 0, 255]  # Damaged = Red
                heatmap[mask_green > 0] = [0, 255, 0]  # Healthy = Green
                
                # Blend heatmap onto the original frame's ROI
                overlay = cv2.addWeighted(plant_roi, 0.7, heatmap, 0.4, 0)
                frame[y1:y2, x1:x2] = overlay

                # Calculate health score
                healthy_px = np.sum(mask_green > 0)
                damaged_px = np.sum(mask_brown > 0)
                total_px = healthy_px + damaged_px
                health_score = (healthy_px / total_px * 100) if total_px > 0 else 0
                
                label = f"Health: {health_score:.1f}%"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            elif class_name == 'person' and confidence > 0.5:
                label = f"Person: {confidence:.2f}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 100, 0), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 100, 0), 2)
    return frame

def video_stream_generator():
    """
    Generator function that yields processed video frames as JPEG bytes.
    """
    if not cap or not model:
        print("Camera or Model not initialized. Cannot stream video.")
        # You could yield a placeholder error image here if you want
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            # Run all your processing on the frame
            processed_frame = process_frame_for_streaming(frame)

            # Encode the frame to JPEG format
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if not ret:
                continue
            
            # Convert buffer to bytes and yield for streaming
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# 3. API ENDPOINT
# =============================================
@router.get("/video_feed", summary="Get the live plant identification video stream")
def video_feed():
    """
    This endpoint serves the live video feed from the webcam, processed with YOLO
    object detection and heatmap analysis for plants.
    """
    return Response(video_stream_generator(),
                    media_type='multipart/x-mixed-replace; boundary=frame')