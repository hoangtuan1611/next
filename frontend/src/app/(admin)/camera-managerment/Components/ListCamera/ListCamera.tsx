'use client'

import React, { useState, useEffect } from 'react'
import { Button, Table, Space, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import AddCamera from '../AddCamera/AddCamera'
import styles from './ListCamera.module.scss'

interface Camera {
  id: number
  name: string
  camera_id: string
  ip_address: string
  port: string
  username: string
  password: string
  stream_path: string
  description: string
  is_active: boolean
  url: string
}

export default function ListCamera() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStreams, setActiveStreams] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchCameras()

    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchCameras()
    }, 5000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:5000/cameras')
      const data = await response.json()
      
      if (data && Array.isArray(data.cameras)) {
        const validCameras = data.cameras.map((camera: Partial<Camera>) => ({
          ...camera,
          is_active: camera.is_active ?? false,
          id: camera.id ?? camera.camera_id,
          camera_id: camera.camera_id ?? camera.id?.toString(),
          key: camera.id // Thêm key cho Table
        }))
        setCameras(validCameras)
      } else {
        console.error('Invalid camera data format:', data)
        setCameras([])
      }
    } catch (error) {
      console.error('Error fetching cameras:', error)
      setCameras([])
    }
  }

  const handleAddCamera = async (formData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (response.ok) {
        message.success('Thêm camera thành công')
        fetchCameras()
        setIsAddModalOpen(false)
      } else {
        setError(data.error || 'Không thể thêm camera')
      }
    } catch (error) {
      console.error('Error adding camera:', error)
      setError('Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCamera = async (formData: any) => {
    if (!selectedCamera) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000/cameras/${selectedCamera.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (response.ok) {
        message.success('Cập nhật camera thành công')
        fetchCameras()
        setIsEditModalOpen(false)
        setSelectedCamera(null)
      } else {
        setError(data.error || 'Không thể cập nhật camera')
      }
    } catch (error) {
      console.error('Error updating camera:', error)
      setError('Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCamera = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa camera này?')) return
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/cameras/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        message.success('Xóa camera thành công')
        fetchCameras()
      } else {
        const data = await response.json()
        message.error(data.error || 'Không thể xóa camera')
      }
    } catch (error) {
      console.error('Error deleting camera:', error)
      message.error('Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStream = (cameraId: string) => {
    setActiveStreams(prev => ({
      ...prev,
      [cameraId]: !prev[cameraId]
    }))
  }

  const columns = [
    {
      title: 'Tên camera',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Trạng thái',
      key: 'is_active',
      render: (record: Camera) => (
        <Tag color={record.is_active ? 'success' : 'error'}>
          {record.is_active ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: Camera) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedCamera(record)
              setIsEditModalOpen(true)
            }}
            disabled={isLoading}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCamera(record.id)}
            disabled={isLoading}
          />
          {record.is_active && (
            <Button
              type={activeStreams[record.camera_id] ? 'primary' : 'default'}
              icon={activeStreams[record.camera_id] ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleStream(record.camera_id)}
              disabled={isLoading}
            >
              {activeStreams[record.camera_id] ? 'Dừng' : 'Xem'}
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.tableContainer}>
     

      <Table
        columns={columns}
        dataSource={cameras}
        scroll={{ y: 'auto' }}
        pagination={{ pageSize: 8, position: ['bottomLeft'] }}
      />

      {/* Video streams */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {cameras.map(camera => (
          activeStreams[camera.camera_id] && camera.is_active && (
            <div key={camera.id} className="relative pt-[56.25%]">
              <div className="absolute top-0 left-0 w-full bg-gray-800 text-white p-2">
                {camera.name}
              </div>
              <img
                src={`http://localhost:5000/video_feed/${camera.camera_id}`}
                alt={`Camera stream ${camera.name}`}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
          )
        ))}
      </div>

      <AddCamera
        open={isAddModalOpen}
        setopen={setIsAddModalOpen}
        onOk={handleAddCamera}
        isLoading={isLoading}
        error={error}
      />

      {selectedCamera && (
        <AddCamera
          open={isEditModalOpen}
          setopen={setIsEditModalOpen}
          onOk={handleEditCamera}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  )
}
