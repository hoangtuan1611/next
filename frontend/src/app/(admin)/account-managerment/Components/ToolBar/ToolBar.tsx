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
import AddAccount from '../AddAccount/AddAccount'

const swichs = [
  { key: 'list', icon: <MenuIcon /> },
  { key: 'dasboard', icon: <LayoutDashboardIcon /> },
]

export default function ToolBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOk = () => {}

  const showModal = () => {
    setIsOpen(true)
  }

  return (
    <div className={styles.toolBar}>
      <Button danger disabled>
        <Trash2Icon />
        Xóa tài khoản
      </Button>
      <Button type="primary" onClick={showModal}>
        <CirclePlusIcon />
        Thêm tài khoản
      </Button>
      <AddAccount open={isOpen} setopen={setIsOpen} onOk={handleOk} />
    </div>
  )
}
