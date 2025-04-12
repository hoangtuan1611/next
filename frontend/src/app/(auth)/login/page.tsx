'use client'

import { LockOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import Image from 'next/image'

export default function Login() {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values)
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Illustration */}
      <div className="w-4/10 bg-white p-8 flex flex-col items-center justify-center relative">
        <Image
          src="/bg-login.svg"
          alt="Login Illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-6/10 bg-white p-8 flex flex-col justify-center">
        <div className="pr-[20%] ">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
          <p className="text-gray-600 mb-8">
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
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
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
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <a className="text-sm text-gray-600 hover:text-green-600" href="#">
                Ghi nhớ mật khẩu
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-green-600 hover:bg-green-700 border-none h-12 text-base font-medium"
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
