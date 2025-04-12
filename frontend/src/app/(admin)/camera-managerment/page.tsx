'use client'

import { useState } from 'react'
import AdminWrapper from '../../(components)/AdminWrapper/AdminWrapper'
import styles from './CameraManagerment.module.scss'
import ToolBar from './Components/ToolBar/ToolBar'
import DashboardCamera from './Components/DashboardCamera/DashboardCamera'
import ListCamera from './Components/ListCamera/ListCamera'

export default function CameraManagerment() {
  const [type, setType] = useState<string>('dasboard')
  return (
    <AdminWrapper
      title="Danh sách Camera"
      toolbar={<ToolBar type={type} setType={setType} />}
    >
      {type === 'dasboard' ? <DashboardCamera /> : <ListCamera />}
    </AdminWrapper>
  )
}
