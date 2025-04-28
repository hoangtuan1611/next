import cv2
import torch
from flask import Flask, jsonify, Response, request
from ultralytics import YOLO
from flask_cors import CORS
from models import db, Camera, VideoRecord
import os
import time
import threading
import queue
import json
from urllib.parse import urlparse
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Cấu hình CORS chi tiết hơn
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Cấu hình Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cameras.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Load YOLOv8 Model
model = YOLO("yolov8n.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Global variables
camera_objects = {}
student_counts = {}
frame_queues = {}  # Thêm khai báo frame_queues

# Định nghĩa danh sách camera URLs
CAMERA_URLS = []  # Sẽ được cập nhật từ database

# Cập nhật CAMERA_URLS từ database
def update_camera_urls():
    global CAMERA_URLS
    with app.app_context():
        cameras = Camera.query.all()
        CAMERA_URLS = [camera.url for camera in cameras]
    return CAMERA_URLS

# Thay đổi cách kiểm tra camera
def check_camera(url):
    logger.info(f"Đang kiểm tra camera: {url}")
    try:
        if url == "0" or url == 0:
            url = 0
            
        cap = cv2.VideoCapture(url)
        is_open = cap.isOpened()
        logger.info(f"Camera {url}: {'Hoạt động' if is_open else 'Không hoạt động'}")
        
        if is_open:
            ret, frame = cap.read()
            if ret:
                logger.info(f"Camera {url}: Đọc frame thành công")
            else:
                logger.info(f"Camera {url}: Không đọc được frame")
                is_open = False
                
        cap.release()
        return is_open
    except Exception as e:
        logger.error(f"Lỗi khi kiểm tra camera {url}: {str(e)}")
        return False

class YOLOv8VideoStream:
    def __init__(self, camera_id, camera_url):
        self.camera_id = camera_id
        self.camera_url = camera_url
        self.cap = None
        self.person_count = 0
        self.is_running = False
        self.thread = None
        self.stop_flag = threading.Event()
        self.last_frame_time = time.time()
        
        # Khởi tạo queue cho camera này
        if camera_id not in frame_queues:
            frame_queues[camera_id] = queue.Queue(maxsize=1)
            logger.info(f"Khởi tạo queue cho camera {camera_id}")

    def start(self):
        if self.is_running:
            logger.info(f"Camera {self.camera_id} đã đang chạy")
            return

        self.is_running = True
        self.stop_flag.clear()
        self.thread = threading.Thread(target=self._process_frames)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"Đã khởi động camera {self.camera_id}")

    def stop(self):
        if not self.is_running:
            return

        logger.info(f"Đang dừng camera {self.camera_id}")
        self.is_running = False
        self.stop_flag.set()
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
        self.cap = None
        
        # Xóa queue khi dừng camera
        if self.camera_id in frame_queues:
            while not frame_queues[self.camera_id].empty():
                try:
                    frame_queues[self.camera_id].get_nowait()
                except:
                    pass

    def _process_frames(self):
        try:
            # Initialize camera capture
            if self.camera_url == "0":
                logger.info(f"Mở webcam cho camera {self.camera_id}")
                # Try multiple ways to open the webcam
                self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                if not self.cap.isOpened():
                    logger.warning(f"Failed to open webcam with DirectShow, trying without DirectShow...")
                    self.cap = cv2.VideoCapture(0)
                    
                if not self.cap.isOpened():
                    # Try with specific backends
                    backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]
                    for backend in backends:
                        logger.info(f"Trying webcam with backend {backend}")
                        self.cap = cv2.VideoCapture(0 + backend)
                        if self.cap.isOpened():
                            logger.info(f"Successfully opened webcam with backend {backend}")
                            break
            else:
                logger.info(f"Mở RTSP stream cho camera {self.camera_id}: {self.camera_url}")
                self.cap = cv2.VideoCapture(self.camera_url)

            if not self.cap.isOpened():
                logger.error(f"Error: Could not open camera {self.camera_id} with URL {self.camera_url}")
                self.is_running = False
                return

            # Set properties for better performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 10)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            logger.info(f"Successfully opened camera {self.camera_id}")
            frame_count = 0

            while self.is_running and not self.stop_flag.is_set():
                ret, frame = self.cap.read()
                if not ret:
                    logger.error(f"Error reading frame from camera {self.camera_id}")
                    # Retry connecting to the camera after failure
                    time.sleep(2)
                    self.cap.release()
                    logger.info(f"Retrying connection to camera {self.camera_id}")
                    if self.camera_url == "0":
                        self.cap = cv2.VideoCapture(0)
                    else:
                        self.cap = cv2.VideoCapture(self.camera_url)
                    continue

                # Update last frame time
                self.last_frame_time = time.time()
                
                # Reset person count for this frame
                self.person_count = 0

                # Process frame with YOLOv8
                results = model(frame)
                
                # Count persons in the frame
                for result in results:
                    for box in result.boxes:
                        if int(box.cls[0]) == 0:  # Chỉ xử lý class 0
                            self.person_count += 1
                            x1, y1, x2, y2 = map(int, box.xyxy[0])
                            conf = round(float(box.conf[0]), 2)
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Màu xanh lá cho class 0
                            cv2.putText(frame, f"student: {conf}", (x1, y1 - 10),
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                # Update student count
                student_counts[self.camera_id] = self.person_count

                # Draw results on frame
                annotated_frame = frame  # Sử dụng frame đã được vẽ thay vì results[0].plot()
                
                # Add student count text
                cv2.putText(annotated_frame, f"Students Count: {self.person_count}", 
                          (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                # Clear queue before putting new frame
                while not frame_queues[self.camera_id].empty():
                    try:
                        frame_queues[self.camera_id].get_nowait()
                    except:
                        pass

                # Put frame in queue
                try:
                    frame_queues[self.camera_id].put(annotated_frame, block=False)
                    frame_count += 1
                    if frame_count % 10 == 0:
                        logger.info(f"Camera {self.camera_id}: Processed {frame_count} frames")
                except queue.Full:
                    logger.warning(f"Queue full for camera {self.camera_id}")

                # Small delay to prevent high CPU usage
                time.sleep(0.1)

        except Exception as e:
            logger.error(f"Error in _process_frames for camera {self.camera_id}: {str(e)}")
            self.is_running = False
        finally:
            if self.cap:
                self.cap.release()
            self.cap = None
            logger.info(f"Camera {self.camera_id} processing stopped")

def generate_frames(camera_id):
    logger.info(f"Client connected to video feed for camera {camera_id}")
    frame_count = 0
    no_frame_count = 0
    
    with app.app_context():
        if camera_id not in frame_queues:
            logger.error(f"Queue not found for camera {camera_id}")
            frame_queues[camera_id] = queue.Queue(maxsize=1)

        while True:
            try:
                # Wait for a frame with a timeout
                frame = frame_queues[camera_id].get(timeout=1.0)
                no_frame_count = 0
                frame_count += 1
                
                if frame_count % 10 == 0:
                    logger.info(f"Streaming camera {camera_id}: Sent {frame_count} frames")
                
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            except queue.Empty:
                no_frame_count += 1
                if no_frame_count >= 5:
                    logger.warning(f"No frames received from camera {camera_id} for {no_frame_count} attempts")
                continue
            except Exception as e:
                logger.error(f"Error in generate_frames for camera {camera_id}: {str(e)}")
                break

@app.route('/video_feed/<camera_id>')
def video_feed(camera_id):
    logger.info(f"Video feed requested for camera {camera_id}")
    with app.app_context():
        # If the camera doesn't exist or isn't running, start it
        if camera_id not in camera_objects:
            logger.info(f"Camera {camera_id} not found in camera_objects, attempting to create")
            # For cam0 (default webcam)
            if camera_id == "cam0":
                camera_url = "0"
                camera_objects[camera_id] = YOLOv8VideoStream(camera_id, camera_url)
                camera_objects[camera_id].start()
            else:
                # For other cameras, check if it exists in database
                camera = Camera.query.filter_by(camera_id=camera_id).first()
                if camera:
                    camera_url = camera.url
                    camera_objects[camera_id] = YOLOv8VideoStream(camera_id, camera_url)
                    camera_objects[camera_id].start()
                else:
                    logger.error(f"Camera {camera_id} not found in database")
                    return Response("Camera not found", status=404)
            
        if not camera_objects[camera_id].is_running:
            logger.info(f"Starting camera {camera_id} as it was not running")
            camera_objects[camera_id].start()
            
        # Wait a short time for camera to initialize
        time.sleep(0.5)
            
        return Response(generate_frames(camera_id),
                      mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/student_count')
def get_student_count():
    with app.app_context():
        camera_id = request.args.get('camera_id')
        if not camera_id:
            return jsonify({'error': 'Camera ID is required'}), 400
        
        if camera_id not in camera_objects:
            return jsonify({'error': f'Camera {camera_id} not found'}), 404
        
        if not camera_objects[camera_id].is_running:
            return jsonify({'error': f'Camera {camera_id} is not running'}), 400
        
        return jsonify({'count': student_counts.get(camera_id, 0)})

@app.route('/cameras', methods=['GET'])
def get_cameras():
    with app.app_context():
        cameras = []
        for camera_id, stream in camera_objects.items():
            cameras.append({
                'id': camera_id,
                'name': f'Camera {camera_id}',
                'camera_id': camera_id,
                'ip_address': stream.camera_url,
                'is_active': stream.is_running,
                'last_frame_time': stream.last_frame_time
            })
        return jsonify({'cameras': cameras})

@app.route('/check_camera', methods=['POST'])
def check_camera_endpoint():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
        
    url = data['url']
    is_working = check_camera(url)
    
    return jsonify({
        'url': url,
        'is_working': is_working
    })

# API endpoints để quản lý camera
@app.route('/api/cameras', methods=['GET'])
def get_all_cameras():
    with app.app_context():
        cameras = Camera.query.all()
        return jsonify([camera.to_dict() for camera in cameras])

@app.route('/api/cameras/<int:camera_id>', methods=['GET'])
def get_camera(camera_id):
    with app.app_context():
        camera = Camera.query.get(camera_id)
        if not camera:
            return jsonify({'error': 'Camera not found'}), 404
        return jsonify(camera.to_dict())

@app.route('/api/cameras', methods=['POST'])
def create_camera():
    with app.app_context():
        data = request.get_json()
        
        # Kiểm tra các trường bắt buộc
        required_fields = ['name', 'camera_id', 'ip_address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Kiểm tra xem camera_id đã tồn tại chưa
        if Camera.query.filter_by(camera_id=data['camera_id']).first():
            return jsonify({'error': 'Camera ID already exists'}), 400
            
        # Tạo camera mới
        camera = Camera(
            name=data['name'],
            camera_id=data['camera_id'],
            ip_address=data['ip_address'],
            port=data.get('port', '554'),
            username=data.get('username'),
            password=data.get('password'),
            stream_path=data.get('stream_path', '/Streaming/Channels/101/'),
            description=data.get('description'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(camera)
        db.session.commit()
        
        # Cập nhật danh sách camera URLs
        update_camera_urls()
        
        return jsonify(camera.to_dict()), 201

@app.route('/api/cameras/<int:camera_id>', methods=['PUT'])
def update_camera(camera_id):
    with app.app_context():
        camera = Camera.query.get(camera_id)
        if not camera:
            return jsonify({'error': 'Camera not found'}), 404
            
        data = request.get_json()
        
        # Cập nhật các trường có thể thay đổi
        updatable_fields = ['name', 'ip_address', 'port', 'username', 'password', 
                          'stream_path', 'description', 'is_active', 'camera_id']
        
        for field in updatable_fields:
            if field in data:
                setattr(camera, field, data[field])
                
        camera.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Cập nhật danh sách camera URLs
        update_camera_urls()
        
        return jsonify(camera.to_dict())

@app.route('/api/cameras/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    with app.app_context():
        camera = Camera.query.get(camera_id)
        if not camera:
            return jsonify({'error': 'Camera not found'}), 404
            
        db.session.delete(camera)
        db.session.commit()
        
        # Cập nhật danh sách camera URLs
        update_camera_urls()
        
        return jsonify({'message': 'Camera deleted successfully'})

@app.route('/api/cameras/by-camera-id/<camera_id>', methods=['GET'])
def get_camera_by_camera_id(camera_id):
    with app.app_context():
        camera = Camera.query.filter_by(camera_id=camera_id).first()
        if not camera:
            return jsonify({'error': 'Camera not found'}), 404
        return jsonify(camera.to_dict())

@app.route('/troubleshoot')
def troubleshoot():
    """Endpoint to check all system connections and diagnose issues"""
    camera_statuses = {}
    
    # Check all configured cameras
    with app.app_context():
        cameras = Camera.query.all()
        for camera in cameras:
            camera_id = camera.camera_id
            camera_url = camera.url
            camera_name = camera.name
            
            # Check if camera exists in camera_objects
            is_in_objects = camera_id in camera_objects
            
            # Check if camera is running
            is_running = False
            if is_in_objects:
                is_running = camera_objects[camera_id].is_running
            
            # Test direct connection
            is_connectable = check_camera(camera_url)
            
            camera_statuses[camera_id] = {
                "name": camera_name,
                "url": camera_url,
                "is_in_objects": is_in_objects,
                "is_running": is_running,
                "is_connectable": is_connectable
            }
            
        # Add webcam status if not already included
        if "cam0" not in camera_statuses:
            is_in_objects = "cam0" in camera_objects
            is_running = False
            if is_in_objects:
                is_running = camera_objects["cam0"].is_running
            is_connectable = check_camera("0")
            
            camera_statuses["cam0"] = {
                "name": "Webcam",
                "url": "0",
                "is_in_objects": is_in_objects,
                "is_running": is_running,
                "is_connectable": is_connectable
            }
    
    # Check OpenCV and CUDA status
    system_info = {
        "opencv_version": cv2.__version__,
        "cuda_available": torch.cuda.is_available(),
        "device": device,
        "num_gpus": torch.cuda.device_count() if torch.cuda.is_available() else 0
    }
    
    # Return all collected information
    return jsonify({
        "cameras": camera_statuses,
        "system_info": system_info,
        "frame_queues": {cam_id: not frame_queues[cam_id].empty() if cam_id in frame_queues else False 
                         for cam_id in camera_objects}
    })

@app.route('/test')
def test_page():
    """Simple HTML page for testing camera connections"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Camera Test Page</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h1 { color: #333; }
            .camera-container { margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 5px; }
            .controls { margin: 10px 0; }
            button { padding: 5px 10px; margin-right: 10px; }
            .video-wrapper { max-width: 640px; max-height: 480px; overflow: hidden; }
            img { max-width: 100%; }
            .status { color: #666; margin-top: 10px; }
            .error { color: red; }
            .success { color: green; }
        </style>
    </head>
    <body>
        <h1>Camera Test Page</h1>
        <div id="troubleshoot-data"></div>
        
        <div class="camera-container">
            <h2>Webcam (cam0)</h2>
            <div class="controls">
                <button onclick="startStream('cam0')">Start</button>
                <button onclick="stopStream('cam0')">Stop</button>
            </div>
            <div class="video-wrapper">
                <img id="cam0-feed" src="" alt="No stream" style="display: none;" />
            </div>
            <div id="cam0-status" class="status">Not connected</div>
        </div>
        
        <div id="other-cameras"></div>
        
        <div class="controls">
            <button onclick="checkAllCameras()">Check All Cameras</button>
            <button onclick="location.reload()">Refresh Page</button>
        </div>
        
        <script>
            // Get all camera information
            async function loadTroubleshootingData() {
                try {
                    const response = await fetch('/troubleshoot');
                    const data = await response.json();
                    
                    // Display system info
                    let html = '<div class="camera-container"><h2>System Information</h2>';
                    html += `<p>OpenCV Version: ${data.system_info.opencv_version}</p>`;
                    html += `<p>CUDA Available: ${data.system_info.cuda_available ? 'Yes' : 'No'}</p>`;
                    html += `<p>Device: ${data.system_info.device}</p>`;
                    html += `<p>GPUs: ${data.system_info.num_gpus}</p>`;
                    html += '</div>';
                    
                    document.getElementById('troubleshoot-data').innerHTML = html;
                    
                    // Add other cameras
                    const cameraDiv = document.getElementById('other-cameras');
                    cameraDiv.innerHTML = '';
                    
                    for (const [id, camera] of Object.entries(data.cameras)) {
                        if (id === 'cam0') continue; // Skip webcam
                        
                        let camHtml = `<div class="camera-container">
                            <h2>${camera.name} (${id})</h2>
                            <p>URL: ${camera.url}</p>
                            <p>Status: ${camera.is_connectable ? '<span class="success">Connectable</span>' : '<span class="error">Not connectable</span>'}</p>
                            <div class="controls">
                                <button onclick="startStream('${id}')">Start</button>
                                <button onclick="stopStream('${id}')">Stop</button>
                            </div>
                            <div class="video-wrapper">
                                <img id="${id}-feed" src="" alt="No stream" style="display: none;" />
                            </div>
                            <div id="${id}-status" class="status">Not connected</div>
                        </div>`;
                        
                        cameraDiv.innerHTML += camHtml;
                    }
                    
                } catch (error) {
                    console.error('Error fetching troubleshooting data:', error);
                }
            }
            
            // Start streaming a specific camera
            function startStream(cameraId) {
                const img = document.getElementById(`${cameraId}-feed`);
                const status = document.getElementById(`${cameraId}-status`);
                
                status.innerHTML = 'Connecting...';
                
                // Add timestamp to prevent caching
                const timestamp = new Date().getTime();
                img.src = `/video_feed/${cameraId}?t=${timestamp}`;
                img.style.display = 'block';
                
                img.onerror = function() {
                    status.innerHTML = '<span class="error">Failed to connect</span>';
                    img.style.display = 'none';
                };
                
                img.onload = function() {
                    status.innerHTML = '<span class="success">Connected</span>';
                };
            }
            
            // Stop streaming a specific camera
            function stopStream(cameraId) {
                const img = document.getElementById(`${cameraId}-feed`);
                const status = document.getElementById(`${cameraId}-status`);
                
                img.src = '';
                img.style.display = 'none';
                status.innerHTML = 'Disconnected';
            }
            
            // Check all cameras (simple connection test)
            async function checkAllCameras() {
                try {
                    const response = await fetch('/troubleshoot');
                    const data = await response.json();
                    
                    for (const [id, camera] of Object.entries(data.cameras)) {
                        const status = document.getElementById(`${id}-status`);
                        if (status) {
                            status.innerHTML = camera.is_connectable ? 
                                '<span class="success">Camera is available</span>' : 
                                '<span class="error">Camera is not available</span>';
                        }
                    }
                } catch (error) {
                    console.error('Error checking cameras:', error);
                }
            }
            
            // Load data when page loads
            window.onload = loadTroubleshootingData;
        </script>
    </body>
    </html>
    """
    return html

# Tạo database và cập nhật danh sách camera khi khởi động ứng dụng
with app.app_context():
    db.create_all()
    update_camera_urls()
    
    # Tự động thêm webcam default nếu chưa có trong database
    default_webcam = Camera.query.filter_by(camera_id="cam0").first()
    if not default_webcam:
        logger.info("Thêm webcam mặc định vào database")
        default_webcam = Camera(
            name="Webcam",
            camera_id="cam0",
            ip_address="0",
            description="Local webcam"
        )
        db.session.add(default_webcam)
        db.session.commit()
    
    # Thêm webcam mặc định nếu chưa có camera nào
    if "cam0" not in camera_objects:
        default_camera = YOLOv8VideoStream("cam0", "0")
        camera_objects["cam0"] = default_camera
        logger.info("Đã thêm webcam mặc định (cam0)")
        
        # Only start the camera if it's confirmed to be working
        if check_camera("0"):
            default_camera.start()
            logger.info("Đã khởi động webcam mặc định (cam0)")
        else:
            logger.warning("Không thể kết nối đến webcam mặc định, không tự động khởi động")

    # Thêm camera RTSP nếu có trong CAMERA_URLS
    cameras = Camera.query.filter(Camera.ip_address != "0").all()
    for camera in cameras:
        camera_id = camera.camera_id
        camera_url = camera.url
        
        # Kiểm tra xem camera đã tồn tại chưa
        if camera_id not in camera_objects:
            # Kiểm tra kết nối trước khi thêm vào danh sách
            if check_camera(camera_url):
                rtsp_camera = YOLOv8VideoStream(camera_id, camera_url)
                camera_objects[camera_id] = rtsp_camera
                rtsp_camera.start()
                logger.info(f"Đã thêm và khởi động camera RTSP: {camera_id}")
            else:
                logger.warning(f"Không thể kết nối đến camera {camera_id} ({camera_url}), camera sẽ không được khởi động tự động")
                # Vẫn thêm camera vào danh sách nhưng không khởi động
                rtsp_camera = YOLOv8VideoStream(camera_id, camera_url)
                camera_objects[camera_id] = rtsp_camera

@app.route('/status')
def status():
    """Return the status of all cameras and the backend service"""
    return jsonify({
        'status': 'running',
        'cameras': {
            camera_id: {
                'is_running': stream.is_running,
                'url': stream.camera_url,
                'last_frame_time': stream.last_frame_time,
                'student_count': student_counts.get(camera_id, 0)
            } for camera_id, stream in camera_objects.items()
        }
    })

if __name__ == "__main__":
    logger.info(f"Starting Flask app on port 5000, using {device} for model inference")
    app.run(host="0.0.0.0", port=5000, debug=True)
