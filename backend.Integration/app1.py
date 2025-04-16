from flask import Flask, Response, jsonify
import cv2
from ultralytics import YOLO
from concurrent.futures import ThreadPoolExecutor
import torch
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
model = YOLO('yolov8n-pose.pt')  # Sử dụng mô hình YOLOv8 nhỏ
if torch.cuda.is_available():
    model.to('cuda')
    print("Using GPU for inference")
    print(torch.cuda.get_device_name(0))
else:
    model.to('cpu')
    print("CUDA not available, using CPU for inference")

# Configuration for video source
USE_IP_CAMERA = True
# IP_CAMERA_URL = "rtsp://administrator:admin123@192.168.1.6:554/stream1"
IP_CAMERA_URL = "rtsp://admin:Drg@2024@$@192.168.40.100:554/Streaming/Channels/101/"
# Tải mô hình YOLOv8


current_count_class_0 = 0
def process_frame(frame):
    global current_count_class_0  # Sử dụng biến toàn cục
    frame = cv2.resize(frame, (640, 480))
    results = model(frame)
    count_class_0 = 0
    for result in results:
        for box in result.boxes:
            if box.cls == 0:  # Kiểm tra nếu class là 0
                count_class_0 += 1
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
    current_count_class_0 = count_class_0  # Cập nhật biến toàn cục
    return frame

def generate_frames():
    # Chọn nguồn video
    if USE_IP_CAMERA:
        camera = cv2.VideoCapture(IP_CAMERA_URL)
    else:
        camera = cv2.VideoCapture(0)  # Sử dụng camera mặc định

    frame_count = 0
    with ThreadPoolExecutor(max_workers=2) as executor:
        while True:
            success, frame = camera.read()
            if not success:
                break
            else:
                frame_count += 1
                if frame_count % 3 != 0:  # Chỉ xử lý mỗi khung hình thứ hai
                    continue

                # Xử lý khung hình trong một luồng riêng biệt
                future = executor.submit(process_frame, frame)
                processed_frame = future.result()

                # Vẽ số lượng class 0 lên khung hình
                cv2.putText(processed_frame, f'Count: {current_count_class_0}', (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                ret, buffer = cv2.imencode('.jpg', processed_frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/student_count')
def student_count():
    # Trả về số lượng class 0 dưới dạng JSON
    return jsonify({'count': current_count_class_0})

if __name__ == '__main__':
    app.run(debug=True)