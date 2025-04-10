import { Badge, Avatar } from 'antd'
import clsx from 'clsx'
import styles from './User.module.scss'
import { useEffect, useState } from 'react'

export default function User({ collapsed }: { collapsed: boolean }) {
  const [showText, setShowText] = useState<boolean>(true)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (collapsed) {
      setShowText(false)
    } else {
      timeoutId = setTimeout(() => setShowText(true), 250)
    }
    return () => clearTimeout(timeoutId)
  }, [collapsed])

  return (
    <div className={clsx(styles.user, { [styles.user__open]: collapsed })}>
      <div>
        <Badge dot color="green">
          <Avatar className={styles.user__avatar}>NT</Avatar>
        </Badge>
      </div>
      <>
        {!collapsed && showText && (
          <>
            <div>
              <p>Nguyễn Trọng Hiếu</p>
              <p>hieunt@dlu.edu.vn</p>
            </div>
            <div>
              <button className={styles.user__menuBtn}>⋮</button>
            </div>
          </>
        )}
      </>
    </div>
  )
}
