'use client'

import { useState } from 'react'
import { Button, App } from 'antd'
import { Trash2Icon, CirclePlusIcon } from 'lucide-react'
import styles from './ToolBar.module.scss'
import AddAccount from '../AddAccount/AddAccount'
import { useSelectionStore } from '../../Store/useSelectionStore'
import axios from 'axios'
import { useUserStore } from '../../Store/userSore'

const userApi = process.env.NEXT_PUBLIC_API_USER

export default function ToolBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const isDeletable = useSelectionStore((state) => state.isDeletable)
  const selectedIds = useSelectionStore((state) => state.selectedIds)

  const { fetchData } = useUserStore()

  const { message } = App.useApp()

  const showModal = () => {
    setIsOpen(true)
  }

  const handleDelete = async () => {
    try {
      var res = await axios.delete(`${userApi}`, {
        data: selectedIds,
      })
      message.success('Xóa thành công')
      fetchData()
    } catch (error) {
      message.error('Xóa thất bại')
      console.log('Error: ', error)
    }
  }

  return (
    <div className={styles.toolBar}>
      <Button danger disabled={!isDeletable} onClick={handleDelete}>
        <Trash2Icon />
        Xóa tài khoản
      </Button>
      <Button type="primary" onClick={showModal}>
        <CirclePlusIcon />
        Thêm tài khoản
      </Button>
      <AddAccount open={isOpen} setopen={setIsOpen} />
    </div>
  )
}
