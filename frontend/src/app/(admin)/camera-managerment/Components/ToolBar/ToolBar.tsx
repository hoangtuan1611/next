'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { Button } from 'antd'
import {
  MenuIcon,
  LayoutDashboardIcon,
  Trash2Icon,
  CirclePlusIcon,
} from 'lucide-react'
import styles from './ToolBar.module.scss'
import clsx from 'clsx'
import AddCamera from '../AddCamera/AddCamera'

const swichs = [
  { key: 'list', icon: <MenuIcon /> },
  { key: 'dasboard', icon: <LayoutDashboardIcon /> },
]

export default function ToolBar({
  type,
  setType,
}: {
  type: string
  setType: Dispatch<SetStateAction<string>>
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOk = async (formData: any) => {
    // Handle form submission here
  }

  const showModal = () => {
    setIsOpen(true)
  }

  return (
    <div className={styles.toolBar}>
      <div className={styles.toolBar__switch}>
        {swichs.map(({ key, icon }) => (
          <Button
            key={key}
            type={type === key ? 'primary' : 'default'}
            className={clsx({
              [styles['toolBar__switch--inactive']]: type !== key,
            })}
            onClick={() => setType(key)}
          >
            {icon}
          </Button>
        ))}
      </div>
      <Button danger disabled>
        <Trash2Icon />
        Xóa Camera
      </Button>
      <Button type="primary" onClick={showModal}>
        <CirclePlusIcon />
        Thêm Camera
      </Button>
      <AddCamera open={isOpen} setopen={setIsOpen} onOk={handleOk} />
    </div>
  )
}
