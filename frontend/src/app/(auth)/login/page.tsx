'use client'

import {
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../AuthConfig/AuthContext'

const loginApi = process.env.NEXT_PUBLIC_API_LOGIN
const clearTokenApi = process.env.NEXT_PUBLIC_API_CLEAR_TOKEN

export default function Login() {
  const [loading, setLoading] = useState<boolean>(false)

  const route = useRouter()
  const { fetchUser } = useAuth()

  const onFinish = async (values: any) => {
    try {
      setLoading(true)
      const res = await axios.post(`${loginApi}`, values, {
        withCredentials: true,
      })

      if (res.data) {
        const user = await fetchUser()
        let redirectPath = '/login'
        switch (user?.role) {
          case 'admin':
            redirectPath = '/camera-managerment'
            break
          case 'teacher':
            redirectPath = '/home'
          default:
            break
        }
        route.push(redirectPath)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const clearCookie = async () => {
      try {
        await axios.get(`${clearTokenApi}`, {
          withCredentials: true,
        })
      } catch (error) {
        console.error('Error clearing cookie:', error)
      }
    }
    clearCookie()
    localStorage.clear()
  }, [])

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Đăng nhập</h2>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            className="mt-8 space-y-6"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                size="large"
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
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
