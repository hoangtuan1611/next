import cv2
import numpy as np
from flask import Flask, Response
from flask_socketio import SocketIO
from ultralytics import YOLO
import torch

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load the YOLOv8 model
model = YOLO('best.pt')

# Check if CUDA is available and move the model to GPU if possible
if torch.cuda.is_available():
    model.to('cuda')
    print("Using GPU for inference")
else:
    model.to('cpu')
    print("CUDA not available, using CPU for inference")

# Configuration for video source
USE_IP_CAMERA = False
IP_CAMERA_URL = "rtsp://username:password@192.168.1.100:554/stream1"

def generate_frames():
    try:
        if USE_IP_CAMERA:
            cap = cv2.VideoCapture(IP_CAMERA_URL)
        else:
            cap = cv2.VideoCapture(0)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Use YOLOv8 to detect students
            results = model(frame)
            student_count = sum(1 for result in results if result['class'] == 0)

            # Send the student count to the frontend
            socketio.emit("student_count", {"count": student_count})

            # Encode the frame in JPEG format
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield the frame in byte format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    except Exception as e:
        print(f"Error: {e}")
    finally:
        cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/")
def index():
    return "Flask Video Processing Server is running!"

if __name__ == "__main__":
    from threading import Thread
    video_thread = Thread(target=generate_frames)
    video_thread.start()

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)