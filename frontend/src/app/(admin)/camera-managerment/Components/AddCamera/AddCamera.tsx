import { Form, Input, Modal } from 'antd'
import React, { useState } from 'react'

type ModalProps = {
  open: boolean
  setopen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (formData: any) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

const { TextArea } = Input

export default function AddCamera({ open, setopen, onOk, isLoading, error }: ModalProps) {
  const [form] = Form.useForm()

  const handleCancel = () => {
    setopen(false)
    form.resetFields()
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await onOk({
        name: values.name,
        ip_address: values.ip_address || '0',
        port: values.port || '554',
        username: values.username || '',
        password: values.password || '',
        stream_path: values.stream_path || '/Streaming/Channels/101/',
        description: values.description || ''
      })
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title="Thêm Camera"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isLoading ? 'Đang xử lý...' : 'Thêm'}
      cancelText="Hủy"
      confirmLoading={isLoading}
      okButtonProps={{ disabled: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên Camera"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên camera' }]}
        >
          <Input placeholder="Ví dụ: Camera phòng 24.1" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ IP"
          name="ip_address"
          tooltip="Nhập 0 cho webcam local"
        >
          <Input placeholder="0" />
        </Form.Item>

        <Form.Item
          label="Port"
          name="port"
        >
          <Input placeholder="554" />
        </Form.Item>

        <Form.Item
          label="Tên đăng nhập"
          name="username"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Đường dẫn stream"
          name="stream_path"
        >
          <Input placeholder="/Streaming/Channels/101/" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea rows={3} placeholder="Nhập mô tả về camera" />
        </Form.Item>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Form>
    </Modal>
  )
}
