'use client'

import React, { useEffect, useState, useRef } from "react"
import { UserCheck, Activity, Clock, Box } from "lucide-react"
import { Layout } from "antd"
import LineChartCustom from "@/app/(components)/LineChartCustom"
import { CameraImageGallery } from './components/CameraImageGallery';
import { Button } from 'antd';
// import StudentCountDisplay from "@components/student_count"

interface HistoricalData {
  createTime: string;
  currentCount: number;
  logTime: string;
  studentCount: number;
}

export default function Home() {
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [currentCount, setCurrentCount] = useState<number>(0)
  const [attendanceRate, setAttendanceRate] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const maxStudents = 30 // Số lượng sinh viên tối đa của lớp
  const [selectedCamera, setSelectedCamera] = useState<string>("cam0")
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLImageElement>(null)
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);

  // Cập nhật thời gian hiện tại
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    // Cập nhật ngay lập tức
    updateCurrentTime();

    // Cập nhật mỗi giây
    const interval = setInterval(updateCurrentTime, 1000);

    // Cleanup khi component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/student_count?camera_id=${selectedCamera}`);
        const data = await response.json();
        
        // Chỉ cập nhật currentCount nếu có sự thay đổi
        if (data.count !== currentCount) {
          setCurrentCount(data.count);
          
          // Tính tỷ lệ điểm danh
          const rate = Math.round((data.count / maxStudents) * 100);
          setAttendanceRate(rate);
        }
      } catch (error) {
        console.error("Error fetching student count:", error);
      }
    };

    if (isStreaming) {
      const interval = setInterval(fetchStudentCount, 2000);
      return () => clearInterval(interval);
    }
  }, [isStreaming, maxStudents, selectedCamera, currentCount]);

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      const timestamp = new Date().getTime()
      videoRef.current.src = `http://localhost:5000/video_feed/${selectedCamera}?t=${timestamp}`
    }
  }, [isStreaming, selectedCamera])

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value)
    setError(null)
  }

  const handleStreamError = () => {
    setError("Không thể kết nối đến camera. Vui lòng thử lại.")
    setIsStreaming(false)
  }

  // Hàm kiểm tra và chụp ảnh tự động
  const checkAndCapture = async () => {
    if (!isStreaming) return;
    
    const now = new Date();
    if (!lastCaptureTime || (now.getTime() - lastCaptureTime.getTime()) >= 30 * 60 * 1000) {
      await handleCapture();
      setLastCaptureTime(now);
    }
  };

  // Thêm interval kiểm tra chụp ảnh tự động
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(checkAndCapture, 60000); // Kiểm tra mỗi phút
      return () => clearInterval(interval);
    }
  }, [isStreaming, lastCaptureTime]);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      console.log('Starting capture...');
      
      // Lấy image element từ ref
      const img = videoRef.current;
      if (!img) {
        console.error('Image element not found');
        return;
      }
      console.log('Image element found');

      // Đảm bảo image đã load xong
      if (!img.complete || img.naturalWidth === 0) {
        console.error('Image not loaded yet');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      console.log('Canvas size:', canvas.width, canvas.height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      // Vẽ image vào canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      console.log('Image drawn to canvas');
      
      // Thử chuyển đổi canvas thành blob trước
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg');
      });

      // Chuyển blob thành base64
      const reader = new FileReader();
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      console.log('Base64 image created');
      
      const response = await fetch('/api/CameraImage/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(base64Image),
      });

      if (!response.ok) {
        throw new Error('Failed to save image');
      }
      console.log('Image saved successfully');

      // Cập nhật dữ liệu biểu đồ khi chụp ảnh
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setHistoricalData(prev => {
        const newData = [...prev, { 
          logTime: time, 
          studentCount: currentCount,
          createTime: time,
          currentCount: currentCount
        }];
        return newData.slice(-10);
      });
    } catch (error) {
      console.error('Error capturing image:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Layout style={{ flex: 1 }}>
      <div className="h-auto bg-white p-6">
        <div className="header mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
            {/* Ứng Dụng Quản Lý Sinh Viên Trong Phòng Thực Hành */}
            Lập trình python CTK46-MMT, THK46SP
          </h1>
          {/* <p className="text-lg">
            Theo dõi, phân tích và quản lý số lượng sinh viên theo thời gian thực
          </p>
          <p className="pt-4 text-xl">
            Lập trình python CTK46-MMT, THK46SP
          </p> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border-2" style={{ borderColor: '#79AD22' }}>
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 mr-3" style={{ color: '#79AD22' }}/>
              <div>
                <p className="text-gray-600 font-bold">Sinh viên có mặt</p>
                <p className="text-2xl font-semibold" style={{ color: '#79AD22' }}>
                  {isStreaming ? currentCount : '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-2" style={{ borderColor: '#E88B3B' }}>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-gray-600 font-bold">Tỷ lệ sinh viên có mặt</p>
                <p className="text-2xl font-semibold" style={{ color: '#E88B3B' }}>
                  {isStreaming ? `${attendanceRate}%` : '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border-2" style={{ borderColor: '#0070FF' }}>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-600 font-bold">Thời gian hiện tại</p>
                <p className="text-2xl font-semibold" style={{ color: '#0070FF' }}>{currentTime}</p>
              </div>
            </div>
          </div>
        </div>

    

        {/* Camera Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-medium mb-4">Theo dõi camera</h3>
          <div className="flex h-[80vh] items-center justify-center rounded-lg" style={{ backgroundColor: '#212529' }}>
            {isStreaming ? (
              <>
                <img
                  ref={videoRef}
                  src={`http://localhost:5000/video_feed/${selectedCamera}`}
                  alt="Video Stream"
                  className="w-full h-full object-contain"
                  onError={handleStreamError}
                  crossOrigin="anonymous"
                />
                {error && (
                  <div className="absolute bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Camera đang tắt</p>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={() => {
                setError(null);
                setIsStreaming(!isStreaming);
              }}
            >
              {isStreaming ? "Tắt camera" : "Mở camera"}
            </button>
            {isStreaming && (
              <>
                <button
                  className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
                  onClick={handleCapture}
                  disabled={isCapturing}
                >
                  {isCapturing ? "Đang chụp..." : "Chụp ảnh"}
                </button>
                <select 
                  className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  value={selectedCamera}
                  onChange={handleCameraChange}
                >
                  <option value="cam0">Webcam</option>
                  <option value="cam1">Camera 1</option>
                  <option value="cam2">Camera 2</option>
                </select>
              </>
            )}
          </div>
        </div>
            {/* Chart Section */}
            <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Thống kê điểm danh - CTK46-PM</h3>
            <div className="h-64">
            <LineChartCustom 
            data={historicalData} 
            title="Biểu đồ theo dõi sĩ số"
          />
            </div>
          </div>
        </div>

        
      </div>
    </Layout>
  )
} 