import cv2
import asyncio
import numpy as np
from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay
from ultralytics import YOLO  # Import YOLOv8

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
pcs = set()
relay = MediaRelay()

# Load the YOLOv8 model
model = YOLO('best.pt')  # Use the appropriate model file

class VideoTransformTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track

    async def recv(self):
        frame = await self.track.recv()
        img = frame.to_ndarray(format="bgr24")

        # Use YOLOv8 to detect students
        results = model(img)
        student_count = sum(1 for result in results if result['class'] == 0)  # Assuming 'person' class

        # Send the student count to the frontend
        socketio.emit("student_count", {"count": student_count})

        # Convert image to grayscale for testing
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        new_frame = frame.from_ndarray(img, format="bgr24")
        return new_frame

@app.route("/")
def index():
    return "Flask WebRTC Server is running!"

@socketio.on("offer")
async def handle_offer(data):
    offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            pc.addTrack(VideoTransformTrack(relay.subscribe(track)))

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    socketio.emit("answer", {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type})

@app.route("/offer", methods=["POST"])
async def handle_offer():
    data = await request.get_json()
    offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            pc.addTrack(VideoTransformTrack(relay.subscribe(track)))

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return jsonify({"sdp": pc.localDescription.sdp, "type": pc.localDescription.type})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)