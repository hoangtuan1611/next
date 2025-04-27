import React from 'react'
import { Item } from '@components/SideBar/SideBar.types'
import {
  VideoCameraAddOutlined,
  UserOutlined,
  SettingOutlined,
  ScheduleOutlined,
  PieChartOutlined,
} from '@ant-design/icons'

interface ItemProps {
  label: string
  key: string
  icon?: React.ReactNode
  path?: string
  children?: Item[]
}

const getItem = ({ label, key, icon, path, children }: ItemProps): Item => ({
  label,
  key,
  icon,
  path,
  children,
})

const root = 'http://localhost:3000'
const getPath = (uri: string) => `${root}${uri}`

export const items: Item[] = [
  getItem({
    label: 'Camera',
    key: 'sub1',
    icon: React.createElement(VideoCameraAddOutlined),
    path: getPath('/camera-managerment'),
  }),
  getItem({
    label: 'Quản lý tài khoản',
    key: '2',
    icon: React.createElement(UserOutlined),
    path: getPath('/account-managerment'),
  }),
  getItem({
    label: 'Thời khóa biểu',
    key: '3',
    icon: React.createElement(ScheduleOutlined),
    path: getPath('/schedule-managerment'),
  }),
  getItem({
    label: 'Thống kê',
    key: '4',
    icon: React.createElement(PieChartOutlined),
    path: getPath('/statistical-managerment'),
  }),
  getItem({
    label: 'Cấu hình',
    key: '5',
    icon: React.createElement(SettingOutlined),
    path: getPath('/'),
  }),
]
