from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from urllib.parse import quote
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

db = SQLAlchemy()

Base = declarative_base()

class Camera(db.Model):
    __tablename__ = 'cameras'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Tên camera (ví dụ: Cam phòng 27.A)
    camera_id = db.Column(db.String(50), unique=True, nullable=False)  # ID camera (ví dụ: cam0, cam1)
    ip_address = db.Column(db.String(100))  # Địa chỉ IP của camera
    port = db.Column(db.String(10), default="554")  # Port của camera, mặc định là 554
    username = db.Column(db.String(100))  # Username để kết nối camera
    password = db.Column(db.String(100))  # Password để kết nối camera
    stream_path = db.Column(db.String(255), default="/Streaming/Channels/101/")  # Đường dẫn stream
    description = db.Column(db.Text)  # Mô tả về camera
    is_active = db.Column(db.Boolean, default=True)  # Trạng thái hoạt động
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def url(self):
        """Tự động tạo URL RTSP từ thông tin camera"""
        if self.ip_address == "0" or not self.ip_address:
            return "0"  # Trường hợp webcam local
            
        # Mã hóa username và password để tránh các ký tự đặc biệt
        encoded_username = quote(self.username) if self.username else ""
        encoded_password = quote(self.password) if self.password else ""
        
        # Tạo phần xác thực nếu có username và password
        auth = f"{encoded_username}:{encoded_password}@" if encoded_username and encoded_password else ""
        
        # Tạo URL RTSP hoàn chỉnh
        return f"rtsp://{auth}{self.ip_address}:{self.port}{self.stream_path}"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'camera_id': self.camera_id,
            'ip_address': self.ip_address,
            'port': self.port,
            'username': self.username,
            'password': self.password,
            'stream_path': self.stream_path,
            'url': self.url,  # URL RTSP được tạo tự động
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class VideoRecord(db.Model):
    __tablename__ = 'video_records'
    
    id = db.Column(db.Integer, primary_key=True)
    camera_id = db.Column(db.String(50), db.ForeignKey('cameras.camera_id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)  # Đường dẫn đến file video
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # Thời lượng video (giây)
    file_size = db.Column(db.Integer)  # Kích thước file (bytes)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Quan hệ với bảng Camera
    camera = db.relationship('Camera', backref='video_records')
    
    def to_dict(self):
        return {
            'id': self.id,
            'camera_id': self.camera_id,
            'file_path': self.file_path,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Teacher(Base):
    __tablename__ = 'teachers'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    schedules = relationship("Schedule", back_populates="teacher")

class Schedule(Base):
    __tablename__ = 'schedules'
    
    id = Column(Integer, primary_key=True)
    teacher_id = Column(String, ForeignKey('teachers.id'))
    week = Column(Integer, nullable=False)
    day = Column(String, nullable=False)  # Thứ 2, Thứ 3, etc.
    period = Column(String, nullable=False)  # morning, afternoon, evening
    subject = Column(String)
    class_code = Column(String)
    class_name = Column(String)
    taught_lessons = Column(String)
    room = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    teacher = relationship("Teacher", back_populates="schedules") 