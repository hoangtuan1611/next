'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from 'antd'
import axios from 'axios'
import UpdateClass from '@teacher/schedule/UpdateClass'
import { TimeTableItem } from '@teacher/schedule/types'
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

  const timeTableApi = process.env.NEXT_PUBLIC_API_TIMETABLE
  const teacherCode =
    typeof window !== 'undefined'
      ? (localStorage.getItem('TeacherCode') ?? '000.000.00000')
      : '000.000.00000'
  const teacherName =
    typeof window !== 'undefined'
      ? (localStorage.getItem('TeacherName') ?? 'Teacher')
      : 'Teacher'

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const fetchData = async () => {
    try {
      const result = await axios.get(`${timeTableApi}/${teacherCode}`)
      if (result.data && result.data.length > 1) {
        setStartDate(formatDate(result.data[0].schedule.startDay))
        setEndDate(formatDate(result.data[0].schedule.endDay))
        setWeekNum(result.data[0].schedule.weekNum)
        setTimeTable(result.data)
      } else {
        console.log('Fail')
        setTimeTable([])
      }
    } catch (error) {
      console.log('Fail to load data')
      setTimeTable([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCellClick = (item: TimeTableItem) => {
    setSelectedItem(item)
    setOpen(true)
  }

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
                <th className="w-[28%]border border-gray-100 bg-white py-3 text-center text-sm font-normal text-gray-500">
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
                const scheduleForDay = timeTable.filter(
                  (item) => item.dayOfWeek === index + 2
                )

                return (
                  <tr key={index}>
                    <td className="border border-gray-100 bg-gray-50 py-3 text-center text-sm font-medium">
                      {day}
                    </td>
                    {[0, 1, 2].map((timeOfDay) => {
                      const schedule = scheduleForDay.filter(
                        (item) => item.timeOfDay === timeOfDay
                      )

                      return (
                        <td
                          key={timeOfDay}
                          className="h-28 cursor-pointer border border-gray-100 p-2 align-top hover:bg-gray-50"
                          onClick={() =>
                            schedule.length > 0 && handleCellClick(schedule[0])
                          }
                        >
                          {schedule.length > 0
                            ? schedule.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <p className="text-sm font-medium text-[#FF4D4F]">
                                    {item.subject.subjectName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Mã HP: {item.schedule.classId}
                                  </p>
                                  <p className="text-xs text-[#1677FF]">
                                    - Lớp: {item.schedule.className}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Tiết: {item.periodBegin} →{' '}
                                    {item.periodEnd}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    - Đã dạy: {item.schedule.maxStudents} Tiết
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
