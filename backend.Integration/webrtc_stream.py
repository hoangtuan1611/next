import cv2
import asyncio
import json
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRelay
from aiortc.rtcrtpsender import RTCRtpSender
import logging
from models import db, Camera
import os
import threading
import queue
from datetime import datetime
import torch
from ultralytics import YOLO

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("webrtc")

# Load YOLOv8 Model
model = YOLO("yolov8n.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Global variables
camera_objects = {}
frame_queues = {}
person_counts = {}  # Lưu số lượng người cho mỗi camera

# API endpoint để lấy danh sách camera
async def get_cameras(request):
    with app.app_context():
        cameras = Camera.query.all()
        cameras_data = [camera.to_dict() for camera in cameras]
        return web.Response(
            content_type="application/json",
            text=json.dumps(cameras_data)
        )

class CameraStreamTrack(VideoStreamTrack):
    def __init__(self, camera_id):
        super().__init__()
        self.camera_id = camera_id
        self.cap = None
        self.frame_queue = queue.Queue(maxsize=1)
        self.running = True
        self.thread = threading.Thread(target=self._capture_frames)
        self.thread.daemon = True
        self.thread.start()
        self.person_count = 0  # Biến để lưu số lượng người

    def _capture_frames(self):
        try:
            camera = Camera.query.filter_by(camera_id=self.camera_id).first()
            if not camera:
                logger.error(f"Camera {self.camera_id} not found in database")
                return

            if camera.ip_address == "0":
                self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            else:
                self.cap = cv2.VideoCapture(camera.url)

            if not self.cap.isOpened():
                logger.error(f"Failed to open camera {self.camera_id}")
                return

            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    logger.error(f"Failed to read frame from camera {self.camera_id}")
                    continue

                # Reset person count for this frame
                self.person_count = 0

                # Process frame with YOLOv8
                results = model(frame)
                
                # Draw results on frame
                annotated_frame = results[0].plot()
                
                # Count persons in the frame
                for result in results:
                    for box in result.boxes:
                        if result.names[int(box.cls[0])] == 'person':
                            self.person_count += 1

                # Update global person count
                person_counts[self.camera_id] = self.person_count

                # Add person count text to frame
                cv2.putText(annotated_frame, f"Persons: {self.person_count}", 
                          (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                # Clear queue before putting new frame
                while not self.frame_queue.empty():
                    try:
                        self.frame_queue.get_nowait()
                    except:
                        pass

                self.frame_queue.put(annotated_frame)

        except Exception as e:
            logger.error(f"Error in camera capture thread: {str(e)}")
        finally:
            if self.cap:
                self.cap.release()

    async def recv(self):
        try:
            frame = self.frame_queue.get(timeout=1.0)
            pts, time_base = await self.next_timestamp()
            return frame, pts, time_base
        except queue.Empty:
            return None, None, None

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()

def force_codec(pc, sender, forced_codec):
    kind = forced_codec.split("/")[0]
    codecs = RTCRtpSender.getCapabilities(kind).codecs
    transceiver = next(t for t in pc.getTransceivers() if t.sender == sender)
    transceiver.setCodecPreferences(
        [codec for codec in codecs if codec.mimeType == forced_codec]
    )

async def index(request):
    content = open(os.path.join(os.path.dirname(__file__), "templates/index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logger.info(f"Connection state is {pc.connectionState}")
        if pc.connectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    # Get camera ID from request
    camera_id = params.get("camera_id")
    if not camera_id:
        return web.Response(status=400, text="Camera ID is required")

    # Create video track for the requested camera
    track = CameraStreamTrack(camera_id)
    pc.addTrack(track)

    # Force VP8 codec for better performance
    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            force_codec(pc, track, "video/VP8")

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )

# API endpoint để lấy số lượng người
async def get_person_count(request):
    camera_id = request.match_info.get('camera_id')
    if not camera_id:
        return web.Response(status=400, text="Camera ID is required")
    
    count = person_counts.get(camera_id, 0)
    return web.Response(
        content_type="application/json",
        text=json.dumps({"count": count})
    )

pcs = set()

async def on_shutdown(app):
    # Close all peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

app = web.Application()
app.on_shutdown.append(on_shutdown)
app.router.add_get("/", index)
app.router.add_post("/offer", offer)
app.router.add_get("/api/person_count/{camera_id}", get_person_count)
app.router.add_get("/api/cameras", get_cameras)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=5000) 