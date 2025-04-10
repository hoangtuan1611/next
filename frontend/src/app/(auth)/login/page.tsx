'use client'

import styles from './Login.module.scss'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useEffect } from 'react'

const clearAllStorage = () => {
  localStorage.clear()
  sessionStorage.clear()
}

export default function Login() {
  useEffect(() => {
    clearAllStorage()
  }, [])

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.container__title}>
        Quản lý sinh viên trong phòng thực hành
      </h1>
      <Form
        name="login"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360 }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input
            suppressHydrationWarning
            prefix={<UserOutlined />}
            placeholder="Tên đăng nhập"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password
            suppressHydrationWarning
            prefix={<LockOutlined />}
            type="password"
            placeholder="Mật khẩu"
          />
        </Form.Item>

        <div className="flex flex-col gap-2">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button
              suppressHydrationWarning
              block
              type="primary"
              htmlType="submit"
            >
              Log in
            </Button>
            <a href="">Quên mật khẩu!</a>
          </Form.Item>
        </div>
      </Form>
    </div>
  )
}

// console.log(
//   'Render Login component',
//   typeof window !== 'undefined' ? 'Client' : 'Server'
// )

// useEffect(() => {
//   console.log('useEffect chạy ở client')
// }, [])
