'use client'

import AdminWrapper from '@/app/(components)/AdminWrapper/AdminWrapper'
import styles from './AccountManagerment.module.scss'
import ToolBar from './Components/ToolBar/ToolBar'
import { useEffect, useState } from 'react'
import axios from 'axios'
import UserList from './Components/UserList/UserList'

export default function AccountManagerment() {
  return (
    <AdminWrapper title="Danh sách tài khoản" toolbar={<ToolBar />}>
      <UserList />
    </AdminWrapper>
  )
}
