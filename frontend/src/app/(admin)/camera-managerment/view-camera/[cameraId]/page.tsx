'use client'

import React, { useEffect, useState, useRef } from "react"
import { UserCheck, Activity, Clock } from "lucide-react"
import { Layout } from "antd"
import LineChartCustom from "@/app/(components)/LineChartCustom"

interface HistoricalData {
  logTime: string
  studentCount: number
}

interface Camera {
  id: number
  name: string
  camera_id: string
  ip_address: string
  is_active: boolean
}

export default function ViewCamera({ params }: { params: Promise<{ cameraId: string }> }) {
  const resolvedParams = React.use(params)
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [currentCount, setCurrentCount] = useState<number>(0)
  const [attendanceRate, setAttendanceRate] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [activeCameras, setActiveCameras] = useState<Camera[]>([])
  const [cameraStatus, setCameraStatus] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const maxStudents = 30 // Số lượng sinh viên tối đa của lớp
  const [selectedCamera, setSelectedCamera] = useState<string>(resolvedParams.cameraId)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLImageElement>(null)
  const retryCountRef = useRef<number>(0)
  const maxRetries = 3

  useEffect(() => {
    const fetchActiveCameras = async () => {
      try {
        const response = await fetch('http://localhost:5000/cameras')
        if (!response.ok) {
          throw new Error('Không thể kết nối đến server')
        }
        const data = await response.json()
        if (data && Array.isArray(data.cameras)) {
          const activeCams = data.cameras.filter((camera: Camera) => camera.is_active)
          setActiveCameras(activeCams)
          
          const statusMap: { [key: string]: boolean } = {}
          for (const camera of data.cameras) {
            try {
              const statusResponse = await fetch(`http://localhost:5000/student_count?camera_id=${camera.camera_id}`)
              const statusData = await statusResponse.json()
              statusMap[camera.camera_id] = !statusData.error
            } catch (error) {
              statusMap[camera.camera_id] = false
            }
          }
          setCameraStatus(statusMap)
        }
      } catch (error) {
        console.error('Error fetching active cameras:', error)
        setError('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.')
      }
    }

    fetchActiveCameras()
    const interval = setInterval(fetchActiveCameras, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch(`http://localhost:5000/student_count?camera_id=${selectedCamera}`)
        if (!response.ok) {
          throw new Error('Không thể kết nối đến server')
        }
        const data = await response.json()
        
        if (data.error) {
          setError(data.error)
          setIsStreaming(false)
          return
        }

        setCurrentCount(data.count)
        const rate = Math.round((data.count / maxStudents) * 100)
        setAttendanceRate(rate)

        const now = new Date()
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        
        setHistoricalData(prev => {
          const newData = [...prev, { logTime: time, studentCount: data.count }]
          return newData.slice(-10)
        })
      } catch (error) {
        console.error("Error fetching student count:", error)
        setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.")
        setIsStreaming(false)
      }
    }

    if (isStreaming) {
      const interval = setInterval(fetchStudentCount, 2000)
      return () => clearInterval(interval)
    }
  }, [isStreaming, maxStudents, selectedCamera])

  useEffect(() => {
    const getTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const currentTime = `${hours}:${minutes}`
      setCurrentTime(currentTime)

      const secondsUntilNextMinute = 60 - now.getSeconds()
      const timeoutId = setTimeout(getTime, secondsUntilNextMinute * 1000)

      return timeoutId
    }

    const timeoutId = getTime()
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      const loadVideo = async () => {
        try {
          setIsLoading(true)
          const timestamp = new Date().getTime()
          const videoUrl = `http://localhost:5000/video_feed/${selectedCamera}?t=${timestamp}`
          
          // Kiểm tra xem URL có hoạt động không
          const response = await fetch(videoUrl)
          if (!response.ok) {
            throw new Error('Không thể kết nối đến video stream')
          }

          if (videoRef.current) {
            videoRef.current.src = videoUrl
            retryCountRef.current = 0
          }
        } catch (error) {
          console.error('Error loading video:', error)
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current += 1
            setTimeout(loadVideo, 2000) // Thử lại sau 2 giây
          } else {
            setError('Không thể kết nối đến video stream. Vui lòng thử lại sau.')
            setIsStreaming(false)
          }
        } finally {
          setIsLoading(false)
        }
      }

      loadVideo()
    }
  }, [isStreaming, selectedCamera])

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value)
    setError(null)
    retryCountRef.current = 0
  }

  const handleStreamError = () => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current += 1
      setTimeout(() => {
        if (videoRef.current) {
          const timestamp = new Date().getTime()
          videoRef.current.src = `http://localhost:5000/video_feed/${selectedCamera}?t=${timestamp}`
        }
      }, 2000)
    } else {
      setError("Không thể kết nối đến camera. Vui lòng thử lại.")
      setIsStreaming(false)
    }
  }

  const handleStartStream = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/student_count?camera_id=${selectedCamera}`)
      if (!response.ok) {
        throw new Error('Không thể kết nối đến server')
      }
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        return
      }

      setError(null)
      setIsStreaming(true)
      retryCountRef.current = 0
    } catch (error) {
      setError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout style={{ flex: 1 }}>
      <div className="h-auto bg-white p-6">
        {/* <div className="header mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
            Lập trình python CTK46-MMT, THK46SP
          </h1>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* <div className="bg-white rounded-lg p-4 shadow-sm border-2" style={{ borderColor: '#79AD22' }}>
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
          </div> */}
        </div>

        {/* Camera Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <h3 className="text-lg font-medium mb-4">Theo dõi camera</h3>
          <div className="flex h-[80vh] items-center justify-center rounded-lg" style={{ backgroundColor: '#212529' }}>
            {isLoading ? (
              <div className="text-white">Đang kết nối...</div>
            ) : isStreaming ? (
              <>
                <img
                  ref={videoRef}
                  src={`http://localhost:5000/video_feed/${selectedCamera}`}
                  alt="Video Stream"
                  className="w-full h-full object-contain"
                  onError={handleStreamError}
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
              className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
              onClick={() => {
                if (isStreaming) {
                  setIsStreaming(false)
                } else {
                  handleStartStream()
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Đang kết nối..." : isStreaming ? "Tắt camera" : "Mở camera"}
            </button>
            {isStreaming && activeCameras.length > 0 && (
              <select 
                className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                value={selectedCamera}
                onChange={handleCameraChange}
                disabled={isLoading}
              >
                {activeCameras.map((camera) => (
                  <option key={camera.camera_id} value={camera.camera_id}>
                    {camera.name} {cameraStatus[camera.camera_id] ? '(Đã khởi tạo)' : '(Chưa khởi tạo)'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Chart Section */}
        {/* <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Thống kê điểm danh - CTK46-PM</h3>
            <div className="h-64">
              <LineChartCustom data={historicalData} />
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  )
} 