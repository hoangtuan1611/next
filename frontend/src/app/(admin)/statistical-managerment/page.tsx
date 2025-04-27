'use client'

import AdminWrapper from '@/app/(components)/AdminWrapper/AdminWrapper'
import React, { useState } from 'react'
import ToolBar from './Components/ToolBar/ToolBar'
import ByDate from './Components/Statistical/ByDate/ByDate'
import ByRoom from './Components/Statistical/ByRoom/ByRoom'
import ByTeacher from './Components/Statistical/ByTeacher/ByTeacher'

export default function page() {
  const [value, setValue] = useState<string>('date')

  const renderContent = () => {
    switch (value) {
      case 'date':
        return <ByDate />
      case 'room':
        return <ByRoom />
      case 'teacher':
        return <ByTeacher />

      default:
        break
    }
  }

  return (
    <AdminWrapper title="Thống kê" toolbar={<ToolBar setValue={setValue} />}>
      <div>{renderContent()}</div>
    </AdminWrapper>
  )
}
