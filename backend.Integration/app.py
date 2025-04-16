# app.py
from flask import Flask, Response
import cv2
from ultralytics import YOLO

app = Flask(__name__)

# Tải mô hình YOLOv8
model = YOLO('yolov8n.pt')  # Sử dụng mô hình YOLOv8 nhỏ

def generate_frames():
    camera = cv2.VideoCapture(0)  # Sử dụng camera mặc định
    frame_count = 0
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            frame_count += 1
            if frame_count % 2 != 0:  # Chỉ xử lý mỗi khung hình thứ hai
                continue
            frame = cv2.resize(frame, (640, 480))
            # Sử dụng YOLOv8 để phát hiện đối tượng
            results = model(frame)
            for result in results:
                # Vẽ bounding box lên frame
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

            # Chuyển đổi frame thành JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
