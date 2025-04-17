import dayjs from 'dayjs'
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartData {
  time: string
  count: string | number
  sessionDate: string
}

interface BarChartCustomProps {
  data: BarChartData[]
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>
}

function BarChartCustom({ data, setSelectedDate }: BarChartCustomProps) {
  const handleClick = (e: any) => {
    if (e && e.activePayload) {
      const clickedData = e.activePayload[0].payload
      const formatted = dayjs(clickedData.sessionDate, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )
      setSelectedDate(formatted)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} onClick={handleClick}>
        <XAxis dataKey={'time'} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          name="Trung bình sô lượng sinh viên mỗi buổi"
          dataKey="count"
          fill="#62B2FD"
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartCustom
