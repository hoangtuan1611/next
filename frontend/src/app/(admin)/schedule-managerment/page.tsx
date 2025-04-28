'use client'

import React, { useEffect, useState } from 'react'
import { Layout } from 'antd'
import axios from 'axios'
import UpdateClass from '@teacher/schedule/UpdateClass'
import { TimeTableItem } from './types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Schedule() {
  const [weekNum, setWeekNum] = useState<number>(0)
  const [startDate, setStartDate] = useState<string>('00/00/0000')
  const [endDate, setEndDate] = useState<string>('00/00/0000')
  const [timeTable, setTimeTable] = useState<TimeTableItem[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<TimeTableItem | undefined>()
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all')
  const [allSchedules, setAllSchedules] = useState<any[]>([])

  const days = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ]

  const timeTableApi = 'http://localhost:5095/api/TeachingSchedule'
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
      // Get the current date
      const currentDate = new Date()
      
      // Calculate the week number based on the database's week numbers (8 and 9)
      // If weekNum is 0, use week 8, if 1 use week 9
      const dbWeekNum = weekNum === 0 ? 8 : 9
      
      // Set the dates based on the database's date ranges
      const startDate = new Date(weekNum === 0 ? '2024-12-30' : '2025-01-06')
      const endDate = new Date(weekNum === 0 ? '2025-01-05' : '2025-01-12')

      console.log('Fetching data with params:', {
        weekNum: dbWeekNum,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        selectedTeacher
      })

      let result
      if (selectedTeacher === 'all') {
        result = await axios.get(
          `${timeTableApi}/all/${dbWeekNum}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )
        console.log('All teachers schedule result:', result.data)
        if (result.data) {
          setAllSchedules(result.data)
          const allTimeTableItems = result.data.flatMap((schedule: any) => {
            console.log('Processing schedule:', schedule)
            return convertScheduleToTimeTableItems(schedule)
          })
          console.log('Converted time table items:', allTimeTableItems)
          setTimeTable(allTimeTableItems)
          if (result.data.length > 0) {
            setStartDate(formatDate(result.data[0].metadata.startDate))
            setEndDate(formatDate(result.data[0].metadata.endDate))
            setWeekNum(result.data[0].metadata.weekNumber - 8) // Convert DB week number to UI week number
          }
        }
      } else {
        result = await axios.get(
          `${timeTableApi}/${dbWeekNum}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&teacherCode=${selectedTeacher}`
        )
        console.log('Single teacher schedule result:', result.data)
        if (result.data) {
          const scheduleData = result.data
          setStartDate(formatDate(scheduleData.metadata.startDate))
          setEndDate(formatDate(scheduleData.metadata.endDate))
          setWeekNum(scheduleData.metadata.weekNumber - 8) // Convert DB week number to UI week number
          const timeTableItems = convertScheduleToTimeTableItems(scheduleData)
          console.log('Converted time table items:', timeTableItems)
          setTimeTable(timeTableItems)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setTimeTable([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [weekNum, selectedTeacher])

  const handleCellClick = (item: TimeTableItem) => {
    setSelectedItem(item)
    setOpen(true)
  }

  const convertScheduleToTimeTableItems = (scheduleData: any) => {
    console.log('Converting schedule data:', scheduleData)
    const timeTableItems: TimeTableItem[] = []
    if (!scheduleData.schedule) {
      console.log('No schedule data found')
      return timeTableItems
    }

    // Log the actual structure of schedule data
    console.log('Schedule data structure:', JSON.stringify(scheduleData.schedule, null, 2))

    // Initialize schedule for each day
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    days.forEach((day, index) => {
      const dayIndex = index + 2 // Convert to dayOfWeek (2-8)
      const daySchedule = scheduleData.schedule[day] || { morning: [], afternoon: [], evening: [] }
      
      console.log(`Processing ${day}:`, daySchedule)

      // Process morning sessions
      const morningItems = (daySchedule.morning || []).map((item: any) => ({
        dayOfWeek: dayIndex,
        timeOfDay: 0,
        subject: { subjectName: item.subject },
        schedule: {
          classId: item.classCode,
          className: item.className,
          maxStudents: item.maxStudent,
          startDay: scheduleData.metadata.startDate,
          endDay: scheduleData.metadata.endDate,
          weekNum: scheduleData.metadata.weekNumber
        },
        periodBegin: item.periodBegin,
        periodEnd: item.periodEnd,
        room: item.room,
        teacherName: scheduleData.metadata.professorName
      }))

      // Process afternoon sessions
      const afternoonItems = (daySchedule.afternoon || []).map((item: any) => ({
        dayOfWeek: dayIndex,
        timeOfDay: 1,
        subject: { subjectName: item.subject },
        schedule: {
          classId: item.classCode,
          className: item.className,
          maxStudents: item.maxStudent,
          startDay: scheduleData.metadata.startDate,
          endDay: scheduleData.metadata.endDate,
          weekNum: scheduleData.metadata.weekNumber
        },
        periodBegin: item.periodBegin,
        periodEnd: item.periodEnd,
        room: item.room,
        teacherName: scheduleData.metadata.professorName
      }))

      // Process evening sessions
      const eveningItems = (daySchedule.evening || []).map((item: any) => ({
        dayOfWeek: dayIndex,
        timeOfDay: 2,
        subject: { subjectName: item.subject },
        schedule: {
          classId: item.classCode,
          className: item.className,
          maxStudents: item.maxStudent,
          startDay: scheduleData.metadata.startDate,
          endDay: scheduleData.metadata.endDate,
          weekNum: scheduleData.metadata.weekNumber
        },
        periodBegin: item.periodBegin,
        periodEnd: item.periodEnd,
        room: item.room,
        teacherName: scheduleData.metadata.professorName
      }))

      console.log(`${day} items:`, {
        morning: morningItems,
        afternoon: afternoonItems,
        evening: eveningItems
      })

      timeTableItems.push(...morningItems, ...afternoonItems, ...eveningItems)
    })

    console.log('Final converted time table items:', timeTableItems)
    return timeTableItems
  }

  return (
    <Layout style={{ flex: 1 }}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <div className="flex items-center gap-2">
            <button 
              className="rounded p-1 text-gray-600 hover:bg-gray-50"
              onClick={() => setWeekNum(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">Tuần {weekNum}</span>
            <button 
              className="rounded p-1 text-gray-600 hover:bg-gray-50"
              onClick={() => setWeekNum(prev => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="rounded border border-gray-200 px-2 py-1 text-sm"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="all">Tất cả giáo viên</option>
              <option value={teacherCode}>{teacherName}</option>
            </select>
            <h1 className="text-sm">
              Thời khoá biểu giảng viên:{' '}
              <span className="font-medium">{teacherName}</span>
            </h1>
          </div>
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
                                  <p className="text-xs text-gray-500">
                                    - Giáo viên: {item.teacherName}
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
