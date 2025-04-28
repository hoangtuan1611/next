'use client'

import React, { useState, useRef } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Modal } from 'antd'

interface ChartData {
  createTime: string
  logTime: string
  studentCount: number
}

interface LineChartCustomProps {
  data: ChartData[]
  title: string
}

const LineChartCustom: React.FC<LineChartCustomProps> = ({ data, title }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const chartRef = useRef<any>(null)

  // Format data for chart
  const formattedData = data.map(item => ({
    time: item.createTime,
    count: item.studentCount,
    createTime: item.createTime
  }))

  const handleClick = (event: any) => {
    // Chỉ xử lý click event từ chart
    if (!event || !event.activePayload) {
      return
    }

    const selectedData = event.activePayload[0].payload
    console.log('Selected data:', selectedData)

    // Lấy giờ và phút từ createTime
    const [hours, minutes] = selectedData.time.split(':')
    
    // Tạo tên file với định dạng: camera_20250428HHMM.jpg (chỉ lưu đến phút)
    const paddedHours = hours.padStart(2, '0')
    const paddedMinutes = minutes.padStart(2, '0')
    const imageName = `camera_20250428${paddedHours}${paddedMinutes}.jpg`
    
    console.log('Loading image:', imageName)
    setSelectedImage(imageName)
    setImageError(null)
    setIsModalOpen(true)
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Error loading image:', selectedImage)
    const target = e.target as HTMLImageElement
    setImageError(`Không tìm thấy ảnh cho thời điểm này. Vui lòng thử lại sau.`)
    target.style.display = 'none'
  }

  return (
    <div className="chart-container" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
      <h2 style={{ 
        fontSize: '16px', 
        marginBottom: '10px',
        fontWeight: 'normal',
        color: '#333'
      }}>{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          onClick={handleClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="time" 
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
            stroke="#666"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            stroke="#666"
            domain={[0, 'auto']}
            tickCount={5}
          />
          <Tooltip 
            formatter={(value: any) => [`${value} học sinh`, 'Số lượng']}
            labelFormatter={(label) => `Thời gian: ${label}`}
            contentStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Số lượng học sinh"
            stroke="#1890ff"
            activeDot={{ r: 6 }}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Modal
        title="Ảnh đã chụp"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setImageError(null)
        }}
        footer={null}
        width={800}
      >
        {selectedImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={`http://localhost:5095/camera-images/${selectedImage}`}
              alt="Camera capture"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                display: imageError ? 'none' : 'block',
                margin: '0 auto'
              }}
              onError={handleImageError}
            />
            {imageError && (
              <div style={{ 
                padding: '20px', 
                color: '#ff4d4f',
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: '4px',
                margin: '10px 0'
              }}>
                {imageError}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LineChartCustom
