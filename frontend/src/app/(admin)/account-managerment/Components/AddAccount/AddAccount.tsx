'use client'

import { App, Form, Input, Modal, Switch } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
import { useUserStore } from '../../Store/userSore'

type ModalProps = {
  open: boolean
  setopen: React.Dispatch<React.SetStateAction<boolean>>
}

const createAccountApi = process.env.NEXT_PUBLIC_API_CREATE_ACCOUNT

export default function AddAccount({ open, setopen }: ModalProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { fetchData } = useUserStore()

  const [form] = Form.useForm()
  const { message } = App.useApp()

  const onChange = (checked: boolean) => {
    setIsAdmin(checked)
  }

  const handleOk = async () => {
    try {
      setIsLoading(true)
      let values = await form.validateFields()
      if (isAdmin) {
        values = { ...values, role: 'admin' }
      }
      const res = await axios.post(`${createAccountApi}`, values)
      if (res.status === 200) {
        message.success('Thêm tài khoản thành công')
        fetchData()
        handleCancel()
        form.resetFields()
      }
    } catch (error) {
      message.error('Thêm tài khoản thất bại')
      console.log('Error: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setopen(false)
  }
  return (
    <Modal
      title="Thêm tài khoản"
      loading={isLoading}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={'Thêm'}
      cancelText={'Đóng'}
    >
      <h1 style={{ margin: '0.5rem 0', fontWeight: 600, fontSize: '1.5rem' }}>
        Thông tin chung
      </h1>
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Tên đăng nhập"
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
        >
          <Input placeholder="vd: admin" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input placeholder="vd: 123" />
        </Form.Item>

        <Form.Item
          label="Mã giáo viên"
          name="code"
          rules={[{ message: 'Không cần nhập nếu thêm admin' }]}
        >
          <Input placeholder="vd: 011.034.00010" />
        </Form.Item>
      </Form>
      <Switch defaultChecked={false} onChange={onChange} /> {'Admin'}
    </Modal>
  )
}
