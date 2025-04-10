import { Form, Input, Modal } from 'antd'
import React from 'react'

type ModalProps = {
  open: boolean
  setopen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: () => void
}

const { TextArea } = Input

export default function AddCamera({ open, setopen, onOk }: ModalProps) {
  const handleCancel = () => {
    setopen(false)
  }
  return (
    <Modal
      title="Thêm Camera"
      open={open}
      onOk={onOk}
      onCancel={handleCancel}
      okText={'Thêm'}
      cancelText={'Đóng'}
    >
      <Form layout="vertical">
        <Form.Item
          label={'Tên Camera'}
          name={'cameraName'}
          rules={[{ required: true, message: 'Vui lòng nhập tên camera' }]}
        >
          <Input placeholder="Ví dụ: Cam phòng 24.1" />
        </Form.Item>
        <Form.Item
          label={'IP'}
          name={'ip'}
          rules={[{ required: true, message: 'Vui lòng nhập ip camera' }]}
        >
          <Input placeholder="Ví dụ: 192.168.1.1" />
        </Form.Item>
        <Form.Item label={'Mô tả'} name={'describe'}>
          <TextArea placeholder="Nhập thông tin địa chỉ" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
