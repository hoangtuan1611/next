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
    axios.get(`${clearTokenApi}`, {
      withCredentials: true,
    })
    localStorage.clear()
  }, [])

  return (
    <div className="flex h-screen">
      {/* Left side - Illustration */}
      <div className="relative flex w-4/10 flex-col items-center justify-center bg-white p-8">
        <Image
          src="/bg-login.svg"
          alt="Login Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-6/10 flex-col justify-center bg-white p-8">
        <div className="pr-[20%]">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Đăng nhập</h2>
          <p className="mb-8 text-gray-600">
            Chào mừng bạn trở lại! Hãy nhập thông tin tài khoản để tiếp tục.
          </p>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Nhập tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="mb-6 flex items-center justify-between">
              <a
                className="text-sm text-gray-600 hover:text-green-600"
                href="#"
              >
                Ghi nhớ mật khẩu
              </a>
            </div>

            <Form.Item>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="h-12 w-full border-none bg-green-600 text-base font-medium hover:bg-green-700"
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
