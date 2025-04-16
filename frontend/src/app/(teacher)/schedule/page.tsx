'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from 'antd'
import axios from 'axios'
import UpdateClass from '@admin/schedule-managerment/UpdateClass'
import { TimeTableItem } from '@admin/schedule-managerment/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Schedule() {
  const [weekNum, setWeekNum] = useState<number>(0)
  const [startDate, setStartDate] = useState<string>('00/00/0000')
  const [endDate, setEndDate] = useState<string>('00/00/0000')
  const [timeTable, setTimeTable] = useState<TimeTableItem[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<TimeTableItem | undefined>()

  const days = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ]

  const teacherName = ''

  const handleCellClick = (item: TimeTableItem) => {
    setSelectedItem(item)
    setOpen(true)
  }

  const [data, setData] = useState({})

  const fetchData = async () => {
    const result = await axios.get(
      'http://localhost:5095/api/TeachingSchedule/8?startDate=2024-12-30&endDate=2025-01-05'
    )
    setData(result.data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const { schedule } = data || {}

  if (!data.schedule) {
    return <p>Đang tải dữ liệu...</p>
  }

  const scheduleData = {
    metadata: {
      weekNumber: 8,
      startDate: '30/12/2024',
      endDate: '05/01/2025',
      professorName: 'Đoàn Minh Khuê',
    },
    schedule: {
      'Thứ 2': {
        morning: [],
        afternoon: [],
        evening: [],
      },
      'Thứ 3': {
        morning: [],
        afternoon: [
          {
            subject: 'Lập trình python',
            classCode: '24220CT3106D07',
            className: 'CTK46-MMT, THK46SP',
            period: '7->9',
            periodBegin: 7,
            periodEnd: 9,
            timeBegin: '13:00',
            timeEnd: '15:30',
            taughtLessons: '0/30 tiết',
            room: 'A8.5',
            content: '',
          },
        ],
        evening: [],
      },
      'Thứ 4': {
        morning: [],
        afternoon: [],
        evening: [],
      },
      'Thứ 5': {
        morning: [],
        afternoon: [],
        evening: [],
      },
      'Thứ 6': {
        morning: [],
        afternoon: [],
        evening: [],
      },
      'Thứ 7': {
        morning: [
          {
            subject: 'Lập trình Java',
            classCode: '24220CT3105D03',
            className: 'CTK46-PM',
            period: '1->4',
            periodBegin: 1,
            periodEnd: 4,
            timeBegin: '07:30',
            timeEnd: '11:00',
            taughtLessons: '0/30 tiết',
            room: 'TV1',
            content: '',
          },
        ],
        afternoon: [],
        evening: [],
      },
      'Chủ nhật': {
        morning: [],
        afternoon: [],
        evening: [],
      },
    },
  }

  const timeMap = ['morning', 'afternoon', 'evening']

  return (
    <Layout style={{ flex: 1 }}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <button className="rounded p-1 text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">Tuần này</span>
            <button className="rounded p-1 text-gray-600 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-sm">
            Thời khoá biểu giảng viên:{' '}
            <span className="font-medium">{teacherName}</span>
          </h1>
        </div>

        {/* Schedule Table */}
        <div className="px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-[16%] border border-gray-100 bg-white py-3 text-center text-sm font-normal text-gray-500">
                  Thời gian
                </th>
                <th className="w-[28%] border border-gray-100 bg-white py-3 text-center text-sm font-normal text-gray-500">
                  Sáng
                </th>
                <th className="w-[28%] border border-gray-100 bg-white py-3 text-center text-sm font-normal text-gray-500">
                  Chiều
                </th>
                <th className="w-[28%] border border-gray-100 bg-white py-3 text-center text-sm font-normal text-gray-500">
                  Tối
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => {
                const scheduleForDay = schedule[day as keyof typeof schedule]

                return (
                  <tr key={index}>
                    <td className="border border-gray-100 bg-gray-50 py-3 text-center text-sm font-medium">
                      {day}
                    </td>
                    {timeMap.map((time, timeIdx) => {
                      const items = scheduleForDay[time]

                      return (
                        <td
                          key={timeIdx}
                          className="h-28 cursor-pointer border border-gray-100 p-2 align-top hover:bg-gray-50"
                          onClick={() =>
                            items.length > 0 && handleCellClick(items[0])
                          }
                        >
                          {items.length > 0
                            ? items.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <p className="text-sm font-medium text-[#FF4D4F]">
                                    {item.subject}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Mã HP: {item.classCode}
                                  </p>
                                  <p className="text-xs text-[#1677FF]">
                                    - Lớp: {item.className}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Tiết: {item.periodBegin} →{' '}
                                    {item.periodEnd}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Đã dạy: {item.taughtLessons}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Phòng: {item.room}
                                  </p>
                                </div>
                              ))
                            : null}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* {open && selectedItem && (
        <UpdateClass
          item={selectedItem}
          open={open}
          setOpen={setOpen}
          fetchData={fetchData}
        />
      )} */}
    </Layout>
  )
}
