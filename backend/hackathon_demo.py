import cv2
import numpy as np
from ultralytics import YOLO

# --- Configuration ---
# Load the pre-trained YOLOv8n model. 'n' is for nano, it's small and fast.
model = YOLO('yolov8n.pt') 

# HSV color ranges for crop health analysis
# You might need to tweak these values based on your lighting and camera
LOWER_HEALTHY_GREEN = np.array([35, 40, 40])
UPPER_HEALTHY_GREEN = np.array([85, 255, 255])

LOWER_DAMAGED_BROWN = np.array([10, 50, 50])
UPPER_DAMAGED_BROWN = np.array([30, 255, 200])

# --- Main Video Loop ---
# Start video capture from the default system camera (index 0)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

while True:
    # Read a frame from the camera
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        break

    # 1. --- OBJECT DETECTION ---
    # Run the YOLO model on the current frame
    results = model(frame)

    # 2. --- PROCESS DETECTIONS ---
    # The model can detect multiple objects, so we loop through them
    for result in results:
        # Get the bounding boxes for detected objects
        boxes = result.boxes
        for box in boxes:
            # Get coordinates [x_start, y_start, x_end, y_end]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Get the class ID and confidence score
            cls = int(box.cls[0])
            confidence = float(box.conf[0])
            
            # Get the class name from the model's names list
            class_name = model.names[cls]

            # 3. --- CONDITIONAL ANALYSIS (The "Smart" Part) ---

            # If the object is a "potted plant" (our crop), run the heatmap analysis
            if class_name == 'potted plant' and confidence > 0.5:
                # Extract the Region of Interest (ROI) - the plant itself
                plant_roi = frame[y1:y2, x1:x2]

                # Avoid errors if the ROI is empty
                if plant_roi.size == 0:
                    continue
                
                # --- Apply the original heatmap logic ONLY to the ROI ---
                hsv = cv2.cvtColor(plant_roi, cv2.COLOR_BGR2HSV)
                
                mask_green = cv2.inRange(hsv, LOWER_HEALTHY_GREEN, UPPER_HEALTHY_GREEN)
                mask_brown = cv2.inRange(hsv, LOWER_DAMAGED_BROWN, UPPER_DAMAGED_BROWN)

                heatmap = np.zeros_like(plant_roi)
                heatmap[mask_brown > 0] = [0, 0, 255]  # Red for damaged
                heatmap[mask_green > 0] = [0, 255, 0]  # Green for healthy

                # Blend the heatmap with the ROI
                overlay = cv2.addWeighted(plant_roi, 0.7, heatmap, 0.3, 0)
                
                # Place the processed overlay back onto the main frame
                frame[y1:y2, x1:x2] = overlay

                # --- Calculate and Display Health Score ---
                healthy_pixels = np.sum(mask_green > 0)
                damaged_pixels = np.sum(mask_brown > 0)
                total_pixels = healthy_pixels + damaged_pixels

                health_score = 0
                if total_pixels > 0:
                    health_score = (healthy_pixels / total_pixels) * 100
                
                label = f"Crop Health: {health_score:.1f}%"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2) # Green box for crops
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # If it's a person or another object, just draw a simple box
            elif class_name == 'person' and confidence > 0.5:
                label = f"Person: {confidence:.2f}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2) # Blue box for people
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
            # You can add more `elif` conditions for other objects if you want

    # --- Display the final processed frame ---
    cv2.imshow("Smart Crop Health Monitor", frame)

    # Exit the loop if the 'ESC' key is pressed
    if cv2.waitKey(1) & 0xFF == 27:
        break

# --- Cleanup ---
cap.release()
cv2.destroyAllWindows()