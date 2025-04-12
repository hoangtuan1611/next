'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from 'antd'
import { PlusCircle, Edit2, Trash2, Play, Square, AlertCircle } from 'lucide-react' 

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

export default function CameraManagement1() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '554',
    username: '',
    password: '',
    stream_path: '/Streaming/Channels/101/',
    description: ''
  })
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
      console.log('Camera data from API:', data) // Debug log
      
      if (data && Array.isArray(data.cameras)) {
        // Đảm bảo mỗi camera có đủ thông tin cần thiết
        const validCameras = data.cameras.map((camera: Partial<Camera>) => ({
          ...camera,
          is_active: camera.is_active ?? false, // Nếu không có is_active thì mặc định là false
          id: camera.id ?? camera.camera_id, // Fallback to camera_id if id is not present
          camera_id: camera.camera_id ?? camera.id?.toString() // Ensure camera_id exists
        }))
        console.log('Processed cameras:', validCameras) // Debug log
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

  const handleAddCamera = async () => {
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
        // Nếu camera được thêm thành công
        fetchCameras()
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          ip_address: '',
          port: '554',
          username: '',
          password: '',
          stream_path: '/Streaming/Channels/101/',
          description: ''
        })
      } else {
        // Nếu có lỗi từ server
        setError(data.error || 'Không thể thêm camera')
      }
    } catch (error) {
      console.error('Error adding camera:', error)
      setError('Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCamera = async () => {
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
    if (!confirm('Bạn có chắc muốn xóa camera này?')) return
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/cameras/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchCameras()
      } else {
        const data = await response.json()
        alert(data.error || 'Không thể xóa camera')
      }
    } catch (error) {
      console.error('Error deleting camera:', error)
      alert('Không thể kết nối đến server')
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

  return (
    <Layout style={{ flex: 1 }}>
      <div className="h-auto bg-white p-6">
        <div className="header mb-8">
          <h1 className="text-2xl font-bold mb-4">Quản lý Camera</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setIsAddModalOpen(true)}
            disabled={isLoading}
          >
            <PlusCircle className="mr-2" size={20} />
            Thêm Camera
          </button>
        </div>

        {/* Danh sách camera */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map(camera => (
            <div key={camera.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{camera.name}</h3>
                  <p className="text-gray-600 text-sm">{camera.description}</p>
                  <div className={`flex items-center mt-2 ${camera.is_active ? 'text-green-500' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${camera.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">{camera.is_active ? 'Hoạt động' : 'Không hoạt động'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    onClick={() => {
                      setSelectedCamera(camera)
                      setFormData({
                        name: camera.name,
                        ip_address: camera.ip_address,
                        port: camera.port,
                        username: camera.username,
                        password: camera.password,
                        stream_path: camera.stream_path,
                        description: camera.description
                      })
                      setIsEditModalOpen(true)
                    }}
                    disabled={isLoading}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    onClick={() => handleDeleteCamera(camera.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Camera ID: {camera.camera_id}</p>
                    <p className="text-sm text-gray-600">IP: {camera.ip_address}</p>
                  </div>
                  <button
                    className={`flex items-center px-3 py-1 rounded ${
                      camera.is_active 
                        ? activeStreams[camera.camera_id]
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => camera.is_active && toggleStream(camera.camera_id)}
                    disabled={!camera.is_active || isLoading}
                  >
                    {activeStreams[camera.camera_id] ? (
                      <>
                        <Square size={16} className="mr-1" />
                        Dừng
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-1" />
                        Xem
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Video stream */}
              {activeStreams[camera.camera_id] && camera.is_active && (
                <div className="mt-4 relative pt-[56.25%]">
                  <img
                    src={`http://localhost:5000/video_feed/${camera.camera_id}`}
                    alt={`Camera stream ${camera.name}`}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal thêm camera */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Thêm Camera Mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Camera</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ IP</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0 cho webcam local"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="text"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="554"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Đường dẫn stream</label>
                  <input
                    type="text"
                    value={formData.stream_path}
                    onChange={(e) => setFormData({ ...formData, stream_path: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="/Streaming/Channels/101/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setError(null)
                    setFormData({
                      name: '',
                      ip_address: '',
                      port: '554',
                      username: '',
                      password: '',
                      stream_path: '/Streaming/Channels/101/',
                      description: ''
                    })
                  }}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleAddCamera}
                  disabled={isLoading || !formData.name}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Thêm Camera'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chỉnh sửa camera */}
        {isEditModalOpen && selectedCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Chỉnh sửa Camera</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên Camera</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IP Address</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.ip_address}
                    onChange={e => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Port</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.port}
                    onChange={e => setFormData(prev => ({ ...prev, port: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stream Path</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.stream_path}
                    onChange={e => setFormData(prev => ({ ...prev, stream_path: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedCamera(null)
                    setError(null)
                  }}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleEditCamera}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 