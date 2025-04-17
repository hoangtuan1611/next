'use client'

import React, { useState } from 'react'
import { Modal, Form, Input, message, InputNumber, App } from 'antd'
import axios from 'axios'
import { TimeTableItem } from './types'

interface UpdateClassProps {
  item: any
  open: boolean
  setOpen: (open: boolean) => void
  fetchData: () => Promise<void>
}

interface FormValues {
  maxStudents: number
}

export default function UpdateClass({
  item,
  open,
  setOpen,
  fetchData,
}: UpdateClassProps) {
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false)
  const [form] = Form.useForm<FormValues>()

  const { message } = App.useApp()

  const apiClass = process.env.NEXT_PUBLIC_API_SUBJECT

  const handleUpdate = async (values: number): Promise<boolean> => {
    try {
      const api = `${apiClass}/${item.subjectId}?maxStudentCount=${values}`
      await axios.patch(api)
      message.success('Cập nhật thành công!')
      return true
    } catch (error) {
      console.error('Validation failed:', error)
      message.error('Cập nhật thất bại. Vui lòng thử lại!')
      return false
    }
  }

  const handleOk = async () => {
    try {
      setConfirmLoading(true)

      const values = await form.validateFields()
      const isSuccess = await handleUpdate(values.maxStudents)

      if (isSuccess) {
        setOpen(false)
        form.resetFields()
      }
      fetchData()
    } catch (error) {
      console.log('Validation failed:', error)
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setOpen(false)
  }

  return (
    <Modal
      title={`${item.subject} - ${item.className}`}
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      okText="Cập nhật"
      cancelText="Hủy"
      centered
      style={{ padding: '0.6rem' }}
    >
      <Form
        form={form}
        initialValues={{ remember: true }}
        style={{ maxWidth: 360, margin: 'auto' }}
      >
        <Form.Item
          name="maxStudents"
          rules={[{ required: true, message: 'Vui lòng nhập số sinh viên!' }]}
          style={{ marginBottom: '1rem' }}
        >
          <InputNumber
            style={{ width: '100%', height: '100%', padding: '0.3rem' }}
            min={1}
            placeholder="Nhập số lượng sinh viên"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
