'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { List, DatePicker, Input, Button } from 'antd'
import { Search, Plus, Monitor } from 'lucide-react'
import axios from 'axios'
import LineChartCustom from '@/app/(components)/LineChartCustom'
import BarChartCustom from '@/app/(components)/BarChartCustom'
import Image from 'next/image'

interface DataProps {
  id: number
  classCode: string
  className: string
  subjectName: string
  room: string
  maxStudent: number
  teacherCode: string
}

export default function History() {
  const [data, setData] = useState<DataProps[]>([])
  const [logDate, setLogDate] = useState([])
  const [allLog, setAllLog] = useState([])
  const [selectedClass, setSelectedClass] = useState<DataProps | undefined>()
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  )

  const getAllSubject = async () => {
    const result = await axios.get(
      'http://localhost:5095/api/Subject/011.034.00027'
    )
    setData(result.data)

    if (result.data.length > 0) {
      setSelectedClass(result.data[0])
    }
  }

  const fetchLogByDate = async (subjectId: number, createDate: string) => {
    try {
      const result = await axios.get(
        `http://localhost:5095/api/SubjectLog/session/${createDate}?subjectId=${subjectId}`
      )

      const lineChartData = result.data.map((item: any) => ({
        createTime: item.createTime.slice(0, 5),
        currentCount: item.currentCount,
      }))

      setLogDate(lineChartData)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLogDate([])
      }
    }
  }

  const fetchAllLogBySubject = async (subjectId: number) => {
    const result = await axios.get(
      `http://localhost:5095/api/SubjectLog/${subjectId}`
    )

    const barChartData = result.data.map((item: any) => ({
      time: `Buổi ${item.lessonNumber}`,
      count: Number(item.avgCurrentCount.toFixed(2)),
    }))

    setAllLog(barChartData)
  }

  useEffect(() => {
    getAllSubject()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchAllLogBySubject(selectedClass.id)
      fetchLogByDate(selectedClass.id, selectedDate)
    }
  }, [selectedClass])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Class List */}
      <div className="w-1/4 bg-white p-4">
        <div className="mb-4">
          <h2 className="mb-4 text-xl font-bold">Danh sách lớp học</h2>
          <div className="relative mb-4">
            <Input
              placeholder="Tìm kiếm"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full"
            />
          </div>
          <Button
            type="primary"
            className="flex w-full items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Thêm mới lớp
          </Button>
        </div>
        <List
          dataSource={data}
          renderItem={(item: any) => (
            <div
              className={`mb-2 flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                selectedClass && selectedClass.id === item.id
                  ? 'bg-blue-50 text-green-600'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedClass(item)}
            >
              <Monitor className="h-5 w-5" />
              <span>{item.subjectName}</span>
            </div>
          )}
        />
      </div>

      {/* Middle Column - History */}
      <div className="w-1/2 p-4">
        <h2 className="mb-4 text-xl font-bold">Lịch sử lớp học</h2>
        <div className="rounded-lg bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="rounded bg-green-100 px-4 py-2 text-green-800">
                Ngày {selectedDate}
              </div>
            </div>
            <DatePicker
              format={'DD-MM-YYYY'}
              inputReadOnly={true}
              allowClear={false}
              defaultValue={dayjs()}
              onChange={(date) => {
                if (date && selectedClass) {
                  const formatted = date.format('YYYY-MM-DD')
                  setSelectedDate(formatted)
                  fetchLogByDate(selectedClass.id, formatted)
                }
              }}
            />
          </div>
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold">Thống kê</h3>
            <div className="mb-8 h-64">
              <LineChartCustom data={logDate} />
            </div>
            <h3 className="mb-4 text-lg font-semibold">
              Thống kê điểm danh - CTK46-PM
            </h3>
            <div className="h-64">
              <BarChartCustom data={allLog} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Class Details */}
      <div className="w-1/4 p-4">
        <h2 className="mb-4 text-xl font-bold">Thông tin chi tiết lớp học</h2>
        <div className="rounded-lg bg-white p-4">
          <div className="mb-6 flex justify-center">
            <div className="relative h-32 w-32">
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
              <p className="font-medium">{selectedClass?.subjectName}</p>
            </div>
            <div>
              <label className="text-gray-500">Lớp:</label>
              <p className="font-medium">{selectedClass?.className}</p>
            </div>
            <div>
              <label className="text-gray-500">Phòng:</label>
              <p className="font-medium">{selectedClass?.room}</p>
            </div>
            <div>
              <label className="text-gray-500">Sĩ số:</label>
              <p className="font-medium">
                {selectedClass?.maxStudent} sinh viên
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
