'use client'

import React, { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Modal, Image } from "antd"

interface ChartData {
  time?: string
  count?: number
  logTime?: string
  studentCount?: number
}

interface LineChartCustomProps {
  data: ChartData[]
}

function LineChartCustom({ data }: LineChartCustomProps) {
  const [visible, setVisible] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={data[0]?.logTime ? "logTime" : "time"} stroke="#62B2FD" />
          <YAxis stroke="#62B2FD" domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={data[0]?.studentCount ? "studentCount" : "count"}
            stroke="#62B2FD"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <Image
        width={200}
        style={{
          display: "none",
        }}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
        preview={{
          visible,
          src: "/data/logs/test.png",
          onVisibleChange: (value: boolean) => {
            setVisible(value)
          },
        }}
      />
    </>
  )
}

export default LineChartCustom 