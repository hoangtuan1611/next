import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartType } from '../../Utils/ConvertData'

export const RenderChart = ({ data }: { data: ChartType[] }) => {
  return (
    <ResponsiveContainer width={'100%'} height={250}>
      <BarChart data={data} barSize={50}>
        <XAxis
          dataKey="name"
          tickFormatter={(value) =>
            value.length > 25 ? value.slice(0, 25) + '...' : value
          }
        />
        <YAxis />
        <Tooltip
          formatter={(value, name, props) => {
            const { payload } = props
            if (name === 'value1') {
              return [`${value} (Giờ đầu: ${payload.firstTime})`, 'Số lượng']
            }
            if (name === 'value2') {
              return [`${value} (Giờ cuối: ${payload.lastTime})`, 'Số lượng']
            }
            return [value, name]
          }}
        />
        <Bar dataKey="value1" fill="#8884d8" />
        <Bar dataKey="value2" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}
