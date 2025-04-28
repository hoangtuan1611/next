import React from 'react'
import { Item } from '@components/SideBar/SideBar.types'
import {
  PieChartOutlined,
  VideoCameraOutlined,
  ScheduleOutlined,
  ProfileOutlined,
} from '@ant-design/icons'

const getItem = (
  label: string,
  key: string,
  icon?: React.ReactNode,
  path?: string,
  children?: Item[]
): Item => ({
  label,
  key,
  icon,
  path,
  children,
})

const root = 'http://localhost:3000'
const getPath = (uri: string) => `${root}${uri}`

export const items: Item[] = [
  getItem(
    'Thống kê',
    '1',
    React.createElement(PieChartOutlined),
    getPath('/home')
  ),
  getItem(
    'Camera',
    '2',
    React.createElement(VideoCameraOutlined),
    getPath('/home')
  ),
  getItem(
    'Lịch biểu',
    '3',
    React.createElement(ScheduleOutlined),
    getPath('/schedule')
  ),
  getItem(
    'Khóa học',
    '4',
    React.createElement(ProfileOutlined),
    getPath('/history')
  ),
]
