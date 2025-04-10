'use client'

import { useState } from 'react'
import styles from './CameraManagerment.module.scss'
import ToolBar from './Components/ToolBar/ToolBar'
import DashboardCamera from './Components/DashboardCamera/DashboardCamera'
import ListCamera from './Components/ListCamera/ListCamera'

export default function CameraManagerment() {
  const [type, setType] = useState<string>('dasboard')

  return (
    <div className={styles.container}>
      <div className={styles.container__header}>
        <div className={styles.container__header__title}>Danh sách Camera</div>
        <ToolBar type={type} setType={setType} />
      </div>

      {type === 'dasboard' ? <DashboardCamera /> : <ListCamera />}
    </div>
  )
}
