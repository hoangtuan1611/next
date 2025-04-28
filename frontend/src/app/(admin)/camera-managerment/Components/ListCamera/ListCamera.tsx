'use client'

import React, { useState, useEffect } from 'react'
import { Button, Table, Space, message, Tag, Modal, Form, Input, Radio } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
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

interface CameraFormData {
  name: string
  type: 'webcam' | 'ip'
  ip_address?: string
  port?: string
  username?: string
  password?: string
  stream_path?: string
  description?: string
}

const API_BASE_URL = 'http://localhost:5000'

export default function ListCamera() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCameras()
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cameras`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách camera')
      }

      const data = await response.json()
      setCameras(data)
    } catch (error) {
      console.error('Error fetching cameras:', error)
      message.error('Không thể kết nối đến server')
      setCameras([])
    }
  }

  const handleAddCamera = async (values: CameraFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      // Prepare data based on camera type
      const addData = {
        ...values,
        type: values.type || 'webcam',
        ip_address: values.type === 'webcam' ? '0' : values.ip_address,
        port: values.type === 'webcam' ? '' : values.port,
        username: values.type === 'webcam' ? '' : values.username,
        password: values.type === 'webcam' ? '' : values.password,
        stream_path: values.type === 'webcam' ? '' : values.stream_path,
        camera_id: values.type === 'webcam' ? 'cam0' : `cam${Date.now()}`
      }

      const response = await fetch(`${API_BASE_URL}/cameras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(addData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Không thể thêm camera')
      }

      const data = await response.json()
      message.success('Thêm camera thành công')
      fetchCameras()
      setIsAddModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Error adding camera:', error)
      message.error(error instanceof Error ? error.message : 'Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCamera = async (values: CameraFormData) => {
    if (!selectedCamera) return
    setIsLoading(true)
    setError(null)
    try {
      // Prepare data based on camera type
      const updateData = {
        ...values,
        type: values.type || 'webcam',
        ip_address: values.type === 'webcam' ? '0' : values.ip_address,
        port: values.type === 'webcam' ? '' : values.port,
        username: values.type === 'webcam' ? '' : values.username,
        password: values.type === 'webcam' ? '' : values.password,
        stream_path: values.type === 'webcam' ? '' : values.stream_path,
        camera_id: selectedCamera.camera_id // Giữ nguyên camera_id
      }

      // Sử dụng id thay vì camera_id trong URL
      const response = await fetch(`${API_BASE_URL}/cameras/${selectedCamera.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Không thể cập nhật camera')
      }

      const data = await response.json()
      message.success('Cập nhật camera thành công')
      fetchCameras()
      setIsEditModalOpen(false)
      setSelectedCamera(null)
      form.resetFields()
    } catch (error) {
      console.error('Error updating camera:', error)
      message.error(error instanceof Error ? error.message : 'Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCamera = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa camera này?')) return
    setIsLoading(true)
    try {
      // Sử dụng id thay vì camera_id trong URL
      const response = await fetch(`${API_BASE_URL}/cameras/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Không thể xóa camera')
      }

      message.success('Xóa camera thành công')
      fetchCameras()
    } catch (error) {
      console.error('Error deleting camera:', error)
      message.error(error instanceof Error ? error.message : 'Không thể kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const showAddModal = () => {
    setIsAddModalOpen(true)
    form.resetFields()
  }

  const showEditModal = (camera: Camera) => {
    setSelectedCamera(camera)
    form.setFieldsValue({
      name: camera.name,
      type: camera.ip_address === '0' ? 'webcam' : 'ip',
      ip_address: camera.ip_address,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      stream_path: camera.stream_path,
      description: camera.description
    })
    setIsEditModalOpen(true)
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
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
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
            onClick={() => showEditModal(record)}
            disabled={isLoading}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCamera(record.id)}
            disabled={isLoading}
          />
        </Space>
      ),
    },
  ]

  const CameraForm = ({ form, onFinish, loading, isEdit = false }: { 
    form: any, 
    onFinish: (values: CameraFormData) => void,
    loading: boolean,
    isEdit?: boolean 
  }) => {
    const [cameraType, setCameraType] = useState<'webcam' | 'ip'>('webcam')

    const handleTypeChange = (e: any) => {
      const newType = e.target.value
      setCameraType(newType)
      
      if (newType === 'webcam') {
        // Set default values for webcam
        form.setFieldsValue({
          ip_address: '0',
          port: '',
          username: '',
          password: '',
          stream_path: ''
        })
      } else {
        // Clear values when switching to IP camera
        form.setFieldsValue({
          ip_address: '',
          port: '',
          username: '',
          password: '',
          stream_path: ''
        })
      }
    }

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Tên camera"
          rules={[{ required: true, message: 'Vui lòng nhập tên camera' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại camera"
          initialValue="webcam"
        >
          <Radio.Group onChange={handleTypeChange}>
            <Radio value="webcam">Webcam</Radio>
            <Radio value="ip">IP Camera</Radio>
          </Radio.Group>
        </Form.Item>

        {cameraType === 'ip' ? (
          <>
            <Form.Item
              name="ip_address"
              label="IP"
              rules={[{ required: true, message: 'Vui lòng nhập IP' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="port"
              label="Port"
              rules={[{ required: true, message: 'Vui lòng nhập port' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Vui lòng nhập username' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Vui lòng nhập password' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="stream_path"
              label="Stream Path"
              rules={[{ required: true, message: 'Vui lòng nhập stream path' }]}
            >
              <Input />
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="ip_address"
            hidden
            initialValue="0"
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm'}
            </Button>
            <Button onClick={() => {
              if (isEdit) {
                setIsEditModalOpen(false)
                setSelectedCamera(null)
              } else {
                setIsAddModalOpen(false)
              }
            }}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__header}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          disabled={isLoading}
        >
          Thêm Camera
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cameras}
        loading={isLoading}
        rowKey="id"
      />

      {/* Add Camera Modal */}
      <Modal
        title="Thêm Camera"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <CameraForm 
          form={form}
          onFinish={handleAddCamera}
          loading={isLoading}
        />
      </Modal>

      {/* Edit Camera Modal */}
      <Modal
        title="Sửa Camera"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          setSelectedCamera(null)
        }}
        footer={null}
      >
        <CameraForm 
          form={form}
          onFinish={handleEditCamera}
          loading={isLoading}
          isEdit={true}
        />
      </Modal>
    </div>
  )
}
