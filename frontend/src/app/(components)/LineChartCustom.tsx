'use client'

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Modal, Image } from 'antd'

interface ChartData {
  createTime: string
  currentCount: number
}

interface LineChartCustomProps {
  data: ChartData[]
}

function LineChartCustom({ data }: LineChartCustomProps) {
  const [visible, setVisible] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  const handleClick = (e: any) => {
    if (e && e.activePayload) {
      const clickedData = e.activePayload[0].payload
      setVisible(true)
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} onClick={handleClick}>
          <XAxis dataKey={'createTime'} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="currentCount" stroke="#8884d8" />
          <Legend formatter={() => ['Số lượng sinh viên']} />
        </LineChart>
      </ResponsiveContainer>
      <Image
        width={200}
        style={{
          display: 'none',
        }}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
        preview={{
          visible,
          src: '/data/logs/test.png',
          onVisibleChange: (value: boolean) => {
            setVisible(value)
          },
        }}
      />
    </>
  )
}

export default LineChartCustom
