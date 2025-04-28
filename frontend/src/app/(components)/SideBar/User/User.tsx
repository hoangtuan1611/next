import { Badge, Avatar, Button } from 'antd'
import clsx from 'clsx'
import styles from './User.module.scss'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoutOutlined } from '@ant-design/icons'
import axios from 'axios'

const clearTokenApi = process.env.NEXT_PUBLIC_API_CLEAR_TOKEN

export default function User({ collapsed }: { collapsed: boolean }) {
  const [showText, setShowText] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (collapsed) {
      setShowText(false)
    } else {
      timeoutId = setTimeout(() => setShowText(true), 250)
    }
    return () => clearTimeout(timeoutId)
  }, [collapsed])

  const handleLogout = async () => {
    try {
      await axios.get(`${clearTokenApi}`, {
        withCredentials: true,
      })
      localStorage.clear()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className={clsx(styles.user, { [styles.user__open]: collapsed })}>
      <div>
        <Badge dot color="green">
          <Avatar className={styles.user__avatar}>U</Avatar>
        </Badge>
      </div>
      <>
        {!collapsed && showText && (
          <>
            {/* <div>
              <p>User</p>
              <p>user@example.com</p>
            </div> */}
            <div>
              <Button 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className={styles.user__logoutBtn}
              >
                Đăng xuất
              </Button>
            </div>
          </>
        )}
      </>
    </div>
  )
}
