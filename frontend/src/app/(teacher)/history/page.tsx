'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { List, DatePicker, Layout, Input, Button } from 'antd'
import { Search, Plus, Monitor } from 'lucide-react'
import axios from 'axios'
import LineChartCustom from '@/app/(components)/LineChartCustom'
import BarChartCustom from '@/app/(components)/BarChartCustom'
import Image from 'next/image'

interface LogData {
  time: string
  count: number
}

interface HistoryData {
  date: string
  logData: LogData[]
}

interface ChartData {
  time: string
  count: string
}

const dataChart: ChartData[] = [
  { time: 'Buổi 1 (30/12/2025)', count: '40' },
  { time: 'Buổi 2 (05/01/2025)', count: '45' },
]

const classList = [
  {
    id: 1,
    name: 'Phát triển ứng dụng di động',
    class: 'CTK46-PM',
    room: 'A27.4',
    students: 25
  },
  {
    id: 2,
    name: 'Lập trình Game',
    class: 'CTK46-PM',
    room: 'A27.4',
    students: 30
  }
]

export default function History() {
  const [data, setData] = useState<HistoryData[]>([])
  const [logData, setLogData] = useState<LogData[]>([])
  const [selectedClass, setSelectedClass] = useState(classList[0])

  const handleDetail = (logData: LogData[]) => {
    setLogData(logData)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Class List */}
      <div className="w-1/4 p-4 bg-white ">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Danh sách lớp học</h2>
          <div className="relative mb-4">
            <Input
              placeholder="Tìm kiếm"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full"
            />
          </div>
          <Button type="primary" className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm mới lớp
          </Button>
        </div>
        <List
          dataSource={classList}
          renderItem={(item) => (
            <div 
              className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center gap-3 ${
                selectedClass.id === item.id ? 'bg-blue-50 text-green-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedClass(item)}
            >
              <Monitor className="h-5 w-5" />
              <span>{item.name}</span>
            </div>
          )}
        />
      </div>

      {/* Middle Column - History */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Lịch sử lớp học</h2>
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded bg-green-100 text-green-800">
                Ngày 12/09/2025
                <span className="ml-2 text-sm">Tiết 1-4</span>
              </div>
            </div>
            <DatePicker
              format={'DD-MM-YYYY'}
              inputReadOnly={true}
              allowClear={false}
              defaultValue={dayjs()}
            />
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
            <div className="h-64 mb-8">
              <LineChartCustom data={logData} />
            </div>
            <h3 className="text-lg font-semibold mb-4">Thống kê điểm danh - CTK46-PM</h3>
            <div className="h-64">
              <BarChartCustom data={dataChart} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Class Details */}
      <div className="w-1/4 p-4">
        <h2 className="text-xl font-bold mb-4">Thông tin chi tiết lớp học</h2>
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 relative">
              <Image
                src="/class-icon.svg"
                alt="Class Icon"
                width={128}
                height={128}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-500">Tên:</label>
              <p className="font-medium">{selectedClass.name}</p>
            </div>
            <div>
              <label className="text-gray-500">Lớp:</label>
              <p className="font-medium">{selectedClass.class}</p>
            </div>
            <div>
              <label className="text-gray-500">Phòng:</label>
              <p className="font-medium">{selectedClass.room}</p>
            </div>
            <div>
              <label className="text-gray-500">Sĩ số:</label>
              <p className="font-medium">{selectedClass.students} sinh viên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 