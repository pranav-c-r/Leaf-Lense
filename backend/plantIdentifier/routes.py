import cv2
import numpy as np
import mediapipe as mp  # <-- ADD THIS IMPORT
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ultralytics import YOLO

router = APIRouter()

# --- Load Models (YOLO and MediaPipe) ---
try:
    model = YOLO('yolov8n.pt')
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7, max_num_hands=1)
    mp_draw = mp.solutions.drawing_utils
except Exception as e:
    print(f"Error loading models: {e}")
    model, hands = None, None

try:
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise IOError("Cannot open webcam")
except Exception as e:
    print(f"Error initializing webcam: {e}")
    cap = None

# --- Re-usable Gesture Recognition Logic ---
def get_gesture(hand_landmarks):
    if not hand_landmarks:
        return None
    
    tips_ids = [4, 8, 12, 16, 20]
    fingers = []
    
    # Thumb
    if hand_landmarks.landmark[tips_ids[0]].x < hand_landmarks.landmark[tips_ids[0] - 1].x:
        fingers.append(1)
    else:
        fingers.append(0)

    # 4 other fingers
    for id in range(1, 5):
        if hand_landmarks.landmark[tips_ids[id]].y < hand_landmarks.landmark[tips_ids[id] - 2].y:
            fingers.append(1)
        else:
            fingers.append(0)
    
    total_fingers = fingers.count(1)
    
    if total_fingers == 5: return "OPEN_PALM"
    if total_fingers == 1 and fingers[0] == 1:
        if hand_landmarks.landmark[tips_ids[0]].y < hand_landmarks.landmark[tips_ids[0] - 1].y:
            return "THUMBS_UP"
    if total_fingers == 0: return "FIST"
    
    return None


# --- Main Processing Function ---
def process_frame_for_streaming(frame):
    # 1. --- AI Object Detection (YOLO) ---
    results = model.predict(frame, verbose=False) # Use predict and verbose=False for speed
    for result in results:
        for box in result.boxes:
            # Your existing YOLO logic for plants and people...
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_name = model.names[int(box.cls[0])]
            if class_name == 'person':
                 cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 100, 0), 2)
                 cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 100, 0), 2)


    # 2. --- Gesture Detection (MediaPipe) ---
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    hand_results = hands.process(rgb_frame)
    
    gesture_name = None
    if hand_results.multi_hand_landmarks:
        for hand_landmarks in hand_results.multi_hand_landmarks:
            # Draw landmarks on the hand for visual feedback
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            # Get the name of the gesture
            gesture_name = get_gesture(hand_landmarks)

    # 3. --- Draw Gesture Name on Screen ---
    if gesture_name:
        cv2.putText(frame, f"Gesture: {gesture_name}", (50, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)

    return frame


def video_stream_generator():
    if not cap or not model or not hands:
        print("Camera or Models not initialized. Cannot stream video.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            processed_frame = process_frame_for_streaming(frame)
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@router.get("/video_feed")
def video_feed():
    return StreamingResponse(video_stream_generator(),
                    media_type='multipart/x-mixed-replace; boundary=frame')