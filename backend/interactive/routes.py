import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from anyio.to_thread import run_sync
# We need these two from the other file
import cv2
import mediapipe as mp

router = APIRouter()

# --- MediaPipe Hand Tracking Setup (Moved here) ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7, max_num_hands=1)
cap = cv2.VideoCapture(0)

# --- Gesture Recognition Logic (Unchanged) ---
def get_gesture(hand_landmarks):
    if not hand_landmarks:
        return None
    tips_ids = [4, 8, 12, 16, 20]
    fingers = []
    if hand_landmarks.landmark[tips_ids[0]].x < hand_landmarks.landmark[tips_ids[0] - 1].x:
        fingers.append(1)
    else:
        fingers.append(0)
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

def process_gestures_for_ws():
    """Reads one frame and returns the detected gesture."""
    success, frame = cap.read()
    if not success:
        return None
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)
    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            return get_gesture(hand_landmarks)
    return None

# --- Voice Command Processing (Unchanged) ---
def process_voice_command(command: str):
    command = command.lower()
    if "fertilizer" in command:
        return {"action": "navigate", "page": "/fertilizer", "message": "Opening fertilizer recommendations..."}
    elif "disease" in command:
        return {"action": "navigate", "page": "/disease-detection", "message": "Opening the disease detection tool..."}
    elif "yield" in command:
        return {"action": "navigate", "page": "/crop-yield", "message": "Showing crop yield predictions..."}
    else:
        return {"action": "unknown", "message": f"Sorry, I didn't understand the command: '{command}'"}

# --- WebSocket Endpoint (Updated Logic) ---
@router.websocket("/ws/interactive")
async def interactive_websocket(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection established.")
    last_gesture = None
    
    try:
        async def gesture_task():
            nonlocal last_gesture
            while True:
                gesture = await run_sync(process_gestures_for_ws)
                
                # If a new, valid gesture is detected, send a navigation command
                if gesture and gesture != last_gesture:
                    last_gesture = gesture
                    response = {}
                    
                    # *** NEW: Map gestures to navigation actions ***
                    if gesture == "OPEN_PALM":
                        response = {"action": "navigate", "page": "/disease-detection", "message": f"Gesture '{gesture}' detected. Navigating..."}
                    elif gesture == "THUMBS_UP":
                        response = {"action": "navigate", "page": "/fertilizer", "message": f"Gesture '{gesture}' detected. Navigating..."}
                    elif gesture == "FIST":
                         response = {"action": "navigate", "page": "/crop-yield", "message": f"Gesture '{gesture}' detected. Navigating..."}

                    if response:
                        await websocket.send_json({"type": "gesture_action", "data": response})
                
                await asyncio.sleep(0.5) # Check for gestures every half second

        async def receive_task():
            while True:
                data = await websocket.receive_text()
                response = process_voice_command(data)
                await websocket.send_json({"type": "voice_response", "data": response})

        await asyncio.gather(gesture_task(), receive_task())

    except WebSocketDisconnect:
        print("WebSocket connection closed.")
    except Exception as e:
        print(f"An error occurred: {e}")