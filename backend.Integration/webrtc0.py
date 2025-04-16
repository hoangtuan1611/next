import cv2
import av
import torch
import asyncio
import websockets
from flask import Flask, jsonify, Response, request
from ultralytics import YOLO
from flask_cors import CORS
from aiortc import RTCPeerConnection, VideoStreamTrack
from urllib.parse import quote, unquote

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})

# Load YOLOv8 Model
model = YOLO("yolov8n.pt")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Camera RTSP streams
CAMERA_URLS = [
    "rtsp://administrator:admin123@192.168.1.6:554/stream1",
    # "rtsp://admin:Drg@2024@$@192.168.40.103:554/Streaming/Channels/101/",
    # "rtsp://admin:Drg@2024@$@192.168.40.155:554/Streaming/Channels/101/",
    "0"
]

# Tạo mapping giữa ID đơn giản và URL camera
CAMERA_MAPPING = {
    "cam1": CAMERA_URLS[0],
    # "cam2": CAMERA_URLS[1],
    "cam0": CAMERA_URLS[1]  # Webcam local
}

# Biến toàn cục để lưu số lượng sinh viên
student_counts = {
    "cam0": 0,
    "cam1": 0
}

def get_camera_id(url):
    """Chuyển đổi URL camera thành ID đơn giản"""
    for cam_id, cam_url in CAMERA_MAPPING.items():
        if cam_url == url:
            return cam_id
    return None

def get_camera_url(camera_id):
    """Chuyển đổi ID camera thành URL"""
    return CAMERA_MAPPING.get(camera_id)

# Kiểm tra camera có hoạt động không
def check_camera(url):
    print(f"Đang kiểm tra camera: {url}")
    try:
        # Xử lý camera local dạng số nguyên
        if url == "0" or url == 0:
            url = 0
            
        cap = cv2.VideoCapture(url)
        is_open = cap.isOpened()
        print(f"Camera {url}: {'Hoạt động' if is_open else 'Không hoạt động'}")
        
        if is_open:
            # Thử đọc một frame để xác nhận camera hoạt động tốt
            ret, frame = cap.read()
            if ret:
                print(f"Camera {url}: Đọc frame thành công")
            else:
                print(f"Camera {url}: Không đọc được frame")
                is_open = False
                
        cap.release()
        return is_open
    except Exception as e:
        print(f"Lỗi khi kiểm tra camera {url}: {str(e)}")
        return False

# Lọc danh sách camera hoạt động
ACTIVE_CAMERAS = [url for url in CAMERA_URLS if check_camera(url)]
print(f"Danh sách camera hoạt động: {ACTIVE_CAMERAS}")

# Lưu trữ các camera objects
camera_objects = {}

class YOLOv8VideoStream:
    def __init__(self, camera_url):
        if camera_url == "0":
            camera_url = 0
        self.camera_url = camera_url
        self.cap = cv2.VideoCapture(camera_url)
        self.camera_id = get_camera_id(camera_url)
        self.person_count = 0  # Biến để lưu số lượng người
        
    def get_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            return None
            
        frame = cv2.resize(frame, (640, 480))
        
        # Chạy YOLOv8 để phát hiện đối tượng
        results = model(frame)
        self.person_count = 0  # Reset số lượng người mỗi frame
        
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                if model.names[cls_id] == "person":  # Chỉ đếm người
                    self.person_count += 1
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = round(float(box.conf[0]), 2)
                    
                    # Vẽ bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"Person {conf}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Hiển thị số lượng sinh viên lên frame
        cv2.putText(frame, f"Students: {self.person_count}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Cập nhật số lượng sinh viên cho camera hiện tại
        if self.camera_id:
            student_counts[self.camera_id] = self.person_count
            print(f"Camera {self.camera_id}: Updated student count to {self.person_count}")  # Debug log
            
        return frame
        
    def release(self):
        self.cap.release()

def generate_frames(camera_id):
    """Tạo video stream từ camera cụ thể"""
    # Chuyển đổi camera_id thành URL
    camera_url = get_camera_url(camera_id)
    
    if camera_url not in ACTIVE_CAMERAS:
        print(f"Camera URL {camera_url} không tồn tại trong danh sách camera hoạt động")
        return
        
    if camera_id not in camera_objects:
        if camera_url == "0":
            camera_url = 0
        print(f"Khởi tạo camera với URL: {camera_url}")
        camera_objects[camera_id] = YOLOv8VideoStream(camera_url)
    
    camera = camera_objects[camera_id]
    
    while True:
        frame = camera.get_frame()
        if frame is None:
            print("Không đọc được frame từ camera")
            break
            
        # Chuyển đổi frame sang JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            print("Không thể mã hóa frame thành JPEG")
            continue
            
        # Chuyển buffer thành bytes và yield cho client
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed/<camera_id>')
def video_feed(camera_id):
    """API endpoint để truyền video từ camera cụ thể"""
    print(f"Yêu cầu stream từ camera: {camera_id}")
    # Chuyển đổi camera_id thành URL và kiểm tra
    camera_url = get_camera_url(camera_id)
    print(f"URL camera tương ứng: {camera_url}")
    
    if camera_url not in ACTIVE_CAMERAS:
        print(f"Camera {camera_url} không hoạt động")
        return jsonify({"error": f"Camera {camera_id} không hoạt động"}), 404
        
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/cameras", methods=["GET"])
def get_cameras():
    """API endpoint để lấy danh sách camera đang hoạt động"""
    # Trả về cả URL và ID của camera
    cameras_info = [{"url": url, "id": get_camera_id(url)} for url in ACTIVE_CAMERAS]
    return jsonify({"cameras": cameras_info})

@app.route("/start_stream", methods=["GET"])
def start_stream():
    """API endpoint để khởi động stream từ tất cả camera"""
    if not ACTIVE_CAMERAS:
        return jsonify({"error": "No active cameras found!"}), 400
    return jsonify({
        "message": "Streaming ready!",
        "cameras": [{"id": get_camera_id(url), "url": url} for url in ACTIVE_CAMERAS],
        "instructions": "Truy cập /video_feed/<camera_id> để xem stream từ camera cụ thể. Ví dụ: /video_feed/cam0 cho webcam, /video_feed/cam1 cho camera RTSP 1"
    })

@app.route("/student_count", methods=["GET"])
def get_student_count():
    """API endpoint để lấy số lượng sinh viên từ camera đang chạy"""
    try:
        # Lấy camera_id từ query parameter, mặc định là cam0
        camera_id = request.args.get('camera_id', 'cam0')
        
        if camera_id not in camera_objects:
            print(f"Camera {camera_id} not found in camera_objects")  # Debug log
            return jsonify({"error": f"Camera {camera_id} không tồn tại"}), 404
            
        # Lấy số lượng người trực tiếp từ camera object
        count = camera_objects[camera_id].person_count
        print(f"Returning count {count} for camera {camera_id}")  # Debug log
        return jsonify({
            "camera_id": camera_id,
            "count": count
        })
    except Exception as e:
        print(f"Error in get_student_count: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

@app.route("/all_student_counts", methods=["GET"])
def get_all_student_counts():
    """API endpoint để lấy số lượng sinh viên từ tất cả camera đang chạy"""
    try:
        # Cập nhật student_counts từ các camera objects
        for camera_id, camera in camera_objects.items():
            student_counts[camera_id] = camera.person_count
            print(f"Updating count for {camera_id}: {camera.person_count}")  # Debug log
            
        return jsonify({
            "counts": student_counts
        })
    except Exception as e:
        print(f"Error in get_all_student_counts: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
