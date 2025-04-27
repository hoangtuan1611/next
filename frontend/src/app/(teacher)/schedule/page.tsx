'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from 'antd'
import axios from 'axios'
import UpdateClass from '@admin/schedule-managerment/UpdateClass'
import { TimeTableItem } from '@admin/schedule-managerment/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/app/(auth)/AuthConfig/AuthContext'

const scheduleApi = process.env.NEXT_PUBLIC_API_TEACHING_SCHEDULE

export type ScheduleItem = {
  subject: string
  classCode: string
  className: string
  period: string
  periodBegin: number
  periodEnd: number
  timeBegin: string
  timeEnd: string
  taughtLessons: string
  room: string
  content: string
  subjectId: number
  maxStudent: number
}

export type DaySchedule = {
  morning: ScheduleItem[]
  afternoon: ScheduleItem[]
  evening: ScheduleItem[]
}

export type ScheduleData = {
  metadata: {
    weekNumber: number
    startDate: string
    endDate: string
    professorName: string
  }
  schedule: {
    [day: string]: DaySchedule
  }
}

export default function Schedule() {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<TimeTableItem | undefined>()

  const { user } = useAuth()

  const days = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ]

  const handleCellClick = (item: TimeTableItem) => {
    console.log(item)
    setSelectedItem(item)
    setOpen(true)
  }

  const [data, setData] = useState<ScheduleData>()

  const fetchData = async () => {
    const result = await axios.get(
      `${scheduleApi}/8?startDate=2024-12-30&endDate=2025-01-05&teacherCode=${user?.code}`
    )
    setData(result.data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const { metadata, schedule } = data || {}

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
            <span className="font-medium">{data?.metadata.professorName}</span>
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
                const scheduleForDay = schedule?.[
                  day as keyof typeof schedule
                ] || {
                  morning: [],
                  afternoon: [],
                  evening: [],
                }

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
                                  <p className="text-xs text-gray-500">
                                    - Số lượng: {item.maxStudent}
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

      {open && selectedItem && (
        <UpdateClass
          item={selectedItem}
          open={open}
          setOpen={setOpen}
          fetchData={fetchData}
        />
      )}
    </Layout>
  )
}
