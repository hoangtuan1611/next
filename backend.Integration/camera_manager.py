import cv2
import asyncio
import json
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack, MediaStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRelay
from av import VideoFrame
import logging
from models import db, Camera
import os
import threading
import queue
from datetime import datetime
import torch
from ultralytics import YOLO
from flask import Flask
import numpy as np
import time

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("camera_manager")

# Initialize Flask app
flask_app = Flask(__name__)
flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cameras.db'
flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(flask_app)

# Load YOLOv8 Model
model = YOLO("yolov8n.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Global variables
camera_objects = {}
frame_queues = {}
person_counts = {}

class VideoFrameAdapter:
    """Adapter cho việc chuyển đổi giữa OpenCV frames và PyAV frames (cần cho WebRTC)"""
    
    @staticmethod
    def from_ndarray(array, format="bgr24"):
        """Chuyển đổi từ numpy array (OpenCV) sang PyAV frame"""
        if array is None:
            return None
            
        # Đảm bảo numpy array là unsigned 8-bit integer
        if array.dtype != np.uint8:
            array = array.astype(np.uint8)
            
        # Đảm bảo kích thước chia hết cho 2 (yêu cầu cho một số codec video)
        height, width = array.shape[:2]
        if width % 2 != 0 or height % 2 != 0:
            new_width = width - (width % 2)
            new_height = height - (height % 2)
            array = cv2.resize(array, (new_width, new_height))
        
        # Chuyển đổi màu nếu cần
        if format == "rgb24" and array.shape[2] == 3:
            array = cv2.cvtColor(array, cv2.COLOR_BGR2RGB)
        
        # Tạo PyAV frame
        frame = av.VideoFrame.from_ndarray(array, format=format)
        return frame

    @staticmethod
    def to_ndarray(frame):
        """Chuyển đổi từ PyAV frame sang numpy array (OpenCV)"""
        if frame is None:
            return None
        return frame.to_ndarray(format="bgr24")

class CameraManager:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        
    def setup_routes(self):
        self.app.router.add_get("/", self.camera_list)
        self.app.router.add_get("/view/{camera_id}", self.camera_view)
        self.app.router.add_get("/cameras", self.camera_list)
        self.app.router.add_get("/api/cameras", self.get_cameras)
        self.app.router.add_post("/api/cameras", self.add_camera)
        self.app.router.add_delete("/api/cameras/{camera_id}", self.delete_camera)
        self.app.router.add_get("/api/person_count/{camera_id}", self.get_person_count)
        self.app.router.add_post("/offer", self.handle_offer)
        
        # Thêm route cho static files
        self.app.router.add_static('/static', path=os.path.join(os.path.dirname(__file__), 'static'))

    async def camera_list(self, request):
        """Hiển thị trang danh sách camera"""
        with open(os.path.join(os.path.dirname(__file__), "templates/camera_list.html"), "r", encoding='utf-8') as f:
            content = f.read()
        return web.Response(text=content, content_type='text/html')

    async def camera_view(self, request):
        """Hiển thị trang xem camera"""
        camera_id = request.match_info['camera_id']
        with open(os.path.join(os.path.dirname(__file__), "templates/camera_view.html"), "r", encoding='utf-8') as f:
            content = f.read()
        return web.Response(text=content, content_type='text/html')

    async def get_cameras(self, request):
        """API lấy danh sách camera"""
        with flask_app.app_context():
            cameras = Camera.query.all()
            return web.Response(
                content_type="application/json",
                text=json.dumps([{
                    'id': cam.id,
                    'name': cam.name,
                    'camera_id': cam.camera_id,
                    'is_active': cam.is_active,
                    'status': 'Đang hoạt động' if cam.is_active else 'Đã tắt'
                } for cam in cameras])
            )

    async def add_camera(self, request):
        """API thêm camera mới"""
        data = await request.json()
        with flask_app.app_context():
            camera = Camera(
                name=data['name'],
                camera_id=data['camera_id'],
                ip_address=data['ip_address'],
                port=data.get('port', '554'),  # Default to 554 if not provided
                username=data.get('username', ''),
                password=data.get('password', ''),
                stream_path=data.get('stream_path', '/Streaming/Channels/101/'),
                description=data.get('description', ''),
                is_active=True
            )
            db.session.add(camera)
            db.session.commit()
            return web.Response(
                content_type="application/json",
                text=json.dumps({'success': True, 'camera': camera.to_dict()})
            )

    async def delete_camera(self, request):
        """API xóa camera"""
        camera_id = request.match_info['camera_id']
        with flask_app.app_context():
            camera = Camera.query.filter_by(camera_id=camera_id).first()
            if camera:
                db.session.delete(camera)
                db.session.commit()
                return web.Response(
                    content_type="application/json",
                    text=json.dumps({'success': True})
                )
            return web.Response(status=404)

    async def get_person_count(self, request):
        """API lấy số lượng người"""
        camera_id = request.match_info['camera_id']
        count = person_counts.get(camera_id, 0)
        return web.Response(
            content_type="application/json",
            text=json.dumps({"count": count})
        )

    async def handle_offer(self, request):
        """Xử lý WebRTC offer"""
        try:
            params = await request.json()
            logger.info(f"Received offer for camera: {params.get('camera_id')}")
            
            offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
            pc = RTCPeerConnection()
            camera_id = params["camera_id"]

            @pc.on("connectionstatechange")
            async def on_connectionstatechange():
                logger.info(f"Connection state change: {pc.connectionState}")
                if pc.connectionState == "failed":
                    await pc.close()

            # Tạo video track
            logger.info(f"Creating video track for camera: {camera_id}")
            track = CameraStreamTrack(camera_id)
            pc.addTrack(track)

            await pc.setRemoteDescription(offer)
            answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            
            logger.info(f"Created answer for camera: {camera_id}")
            return web.Response(
                content_type="application/json",
                text=json.dumps(
                    {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
                ),
            )
        except Exception as e:
            logger.error(f"Error in handle_offer: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return web.Response(
                status=500,
                content_type="application/json",
                text=json.dumps({"error": str(e)})
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
        self.kind = "video"
        self.frames_processed = 0
        
    def _capture_frames(self):
        try:
            with flask_app.app_context():
                camera = Camera.query.filter_by(camera_id=self.camera_id).first()
                if not camera:
                    logger.error(f"Camera {self.camera_id} not found")
                    # Provide a fallback - use a color pattern or test image
                    self._use_fallback_video()
                    return

                # Try multiple connection formats for RTSP
                connected = False

                # Try webcam first if configured
                if camera.ip_address == "0":
                    logger.info(f"Opening local webcam for camera {self.camera_id}")
                    # Try multiple camera indexes (0, 1, 2) in case first one fails
                    for idx in [0, 1, 2]:
                        self.cap = cv2.VideoCapture(idx)
                        if self.cap.isOpened():
                            connected = True
                            logger.info(f"Connected to local webcam at index {idx}")
                            break
                else:
                    # Try various RTSP URL formats
                    rtsp_formats = [
                        f"rtsp://{camera.username}:{camera.password}@{camera.ip_address}:{camera.port or 554}/Streaming/Channels/101/",
                        f"rtsp://{camera.username}:{camera.password}@{camera.ip_address}:{camera.port or 554}/stream1",
                        f"rtsp://{camera.username}:{camera.password}@{camera.ip_address}:{camera.port or 554}/h264/ch1/main/av_stream",
                        f"rtsp://{camera.username}:{camera.password}@{camera.ip_address}:{camera.port or 554}/cam/realmonitor?channel=1&subtype=0",
                        f"rtsp://{camera.ip_address}:{camera.port or 554}/{camera.camera_id}",
                        # Thêm định dạng URL không có username/password
                        f"rtsp://{camera.ip_address}:{camera.port or 554}/stream",
                        f"rtsp://{camera.ip_address}:{camera.port or 554}/"
                    ]
                    
                    for url in rtsp_formats:
                        logger.info(f"Trying to connect to camera {self.camera_id} with URL: {url}")
                        self.cap = cv2.VideoCapture(url)
                        if self.cap.isOpened():
                            connected = True
                            logger.info(f"Successfully connected to camera {self.camera_id}")
                            break
                
                # If all connection attempts fail, use fallback
                if not connected:
                    logger.error(f"Failed to open camera {self.camera_id} - using fallback")
                    self._use_fallback_video()
                    return

                # Set resolution to something reasonable for WebRTC
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

                # Main video processing loop
                while self.running:
                    ret, frame = self.cap.read()
                    if not ret:
                        logger.warning(f"Failed to read frame from camera {self.camera_id}, retrying...")
                        # Create black frame as placeholder and retry next time
                        frame = self._create_black_frame()
                    
                    try:
                        # Nhận diện người với YOLOv8
                        results = model(frame)
                        
                        # Vẽ kết quả lên frame
                        annotated_frame = results[0].plot()
                        
                        # Đếm số người
                        person_count = 0
                        for result in results:
                            for box in result.boxes:
                                if result.names[int(box.cls[0])] == 'person':
                                    person_count += 1

                        # Cập nhật số lượng người
                        person_counts[self.camera_id] = person_count

                        # Hiển thị số người
                        cv2.putText(
                            annotated_frame,
                            f"Persons: {person_count}",
                            (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1,
                            (0, 255, 0),
                            2
                        )

                        # Cập nhật frame
                        while not self.frame_queue.empty():
                            try:
                                self.frame_queue.get_nowait()
                            except queue.Empty:
                                pass
                        self.frame_queue.put(annotated_frame)
                    except Exception as e:
                        logger.error(f"Error processing frame: {str(e)}")
                        # Put original frame in queue if processing fails
                        self.frame_queue.put(frame)

        except Exception as e:
            logger.error(f"Error in camera capture: {str(e)}")
            self._use_fallback_video()
        finally:
            if self.cap:
                self.cap.release()
                
    def _create_black_frame(self, width=640, height=480):
        """Create a black frame with text as fallback"""
        frame = np.zeros((height, width, 3), np.uint8)
        cv2.putText(
            frame,
            f"Camera {self.camera_id} - No Signal",
            (width//6, height//2),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2
        )
        return frame
        
    def _use_fallback_video(self):
        """Display a fallback video pattern when camera is unavailable"""
        logger.info(f"Using fallback video for camera {self.camera_id}")
        width, height = 640, 480
        
        while self.running:
            # Create a color pattern that changes over time
            frame = self._create_black_frame(width, height)
            
            # Add timestamp
            cv2.putText(
                frame,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                (10, height - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1
            )
            
            # Update frame queue
            while not self.frame_queue.empty():
                try:
                    self.frame_queue.get_nowait()
                except queue.Empty:
                    pass
            self.frame_queue.put(frame)
            
            # Sleep to simulate frame rate
            time.sleep(1/30)

    async def recv(self):
        """Lấy frame tiếp theo và chuyển đổi thành định dạng phù hợp cho WebRTC"""
        try:
            # Lấy frame từ queue
            frame = self.frame_queue.get(timeout=1.0)
            if frame is None:
                frame = self._create_black_frame()
            
            # Chuyển đổi frame sang PyAV frame cho WebRTC
            pts, time_base = await self.next_timestamp()
            self.frames_processed += 1
            
            # Sử dụng adapter để chuyển đổi
            video_frame = VideoFrameAdapter.from_ndarray(frame, format="rgb24")
            video_frame.pts = pts
            video_frame.time_base = time_base
            
            return video_frame
            
        except queue.Empty:
            # Nếu queue rỗng, trả về khung đen
            frame = self._create_black_frame()
            pts, time_base = await self.next_timestamp()
            
            video_frame = VideoFrameAdapter.from_ndarray(frame, format="rgb24")
            video_frame.pts = pts
            video_frame.time_base = time_base
            
            return video_frame
            
        except Exception as e:
            logger.error(f"Error in recv: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Trả về khung đen trong trường hợp lỗi
            frame = self._create_black_frame()
            pts, time_base = await self.next_timestamp()
            
            video_frame = VideoFrameAdapter.from_ndarray(frame, format="rgb24")
            video_frame.pts = pts
            video_frame.time_base = time_base
            
            return video_frame

    def stop(self):
        self.running = False
        if self.cap:
            self.cap.release()

if __name__ == "__main__":
    with flask_app.app_context():
        db.create_all()  # Create database tables
    manager = CameraManager()
    web.run_app(manager.app, host="0.0.0.0", port=5000) 