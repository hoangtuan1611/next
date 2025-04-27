'use client'

import React from 'react'
import { Select, Button } from 'antd'
import { useModalStore } from '../../Store/useModalStore'

type ToolBarProps = {
  setValue: React.Dispatch<React.SetStateAction<string>>
}

const options = [
  { value: 'date', label: 'Thống kê theo ngày' },
  { value: 'room', label: 'Thống kê theo phòng' },
  { value: 'teacher', label: 'Thống kê theo giáo viên' },
]

export default function ToolBar({ setValue }: ToolBarProps) {
  const { openModal } = useModalStore()

  const handleChange = (value: string) => {
    setValue(value)
  }

  return (
    <div className="flex gap-3">
      <Button onClick={openModal} type="primary">
        Xem biểu đồ
      </Button>
      <Select
        onChange={handleChange}
        style={{ width: 220 }}
        defaultValue="date"
        options={options}
      />
    </div>
  )
}
