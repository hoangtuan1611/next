import React, { use } from 'react'
import { Item } from '@components/SideBar/SideBar.types'
import {
  VideoCameraAddOutlined,
  UserAddOutlined,
  SettingOutlined,
  ScheduleOutlined,
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
    label: 'Tài Khoản',
    key: '2',
    icon: React.createElement(UserAddOutlined),
    path: getPath('/account-managerment'),
  }),
  getItem({
    label: 'Thời khóa biểu',
    key: '3',
    icon: React.createElement(ScheduleOutlined),
    path: getPath('/schedule-managerment'),
  }),
  getItem({
    label: 'Cấu hình',
    key: '4',
    icon: React.createElement(SettingOutlined),
    path: getPath('/'),
  }),
]
