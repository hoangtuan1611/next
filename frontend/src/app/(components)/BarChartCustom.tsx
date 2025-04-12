import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" stroke="#62B2FD" />
        <YAxis stroke="#62B2FD" domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="count" fill="#62B2FD" barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default BarChartCustom 