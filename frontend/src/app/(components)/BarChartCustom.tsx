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
}

interface BarChartCustomProps {
  data: BarChartData[]
}

function BarChartCustom({ data }: BarChartCustomProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey={'time'} />
        <YAxis />
        <Tooltip />

        <Legend formatter={() => ['Trung bình sô lượng sinh viên mỗi buổi']} />
        <Bar dataKey="count" fill="#62B2FD" barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartCustom
