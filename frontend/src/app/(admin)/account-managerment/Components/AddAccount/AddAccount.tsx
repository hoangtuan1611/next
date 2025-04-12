import { Form, Input, Modal, DatePicker, Row, Col, Switch } from 'antd'
import React from 'react'

type ModalProps = {
  open: boolean
  setopen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: () => void
}

const onChange = (checked: boolean) => {
  console.log(`switch to ${checked}`)
}

export default function AddAccount({ open, setopen, onOk }: ModalProps) {
  const handleCancel = () => {
    setopen(false)
  }
  return (
    <Modal
      title="Thêm tài khoản"
      open={open}
      onOk={onOk}
      onCancel={handleCancel}
      okText={'Thêm'}
      cancelText={'Đóng'}
    >
      <h1 style={{ margin: '0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
        Thông tin chung
      </h1>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              ]}
            >
              <Input placeholder="Tên đăng nhập" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ' }]}
            >
              <Input placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              name="phoneNo"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Số điện thoại không hợp lệ!',
                },
              ]}
            >
              <Input type="tel" placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Switch defaultChecked onChange={onChange} /> {'Kích hoạt tài khoản'}
    </Modal>
  )
}
