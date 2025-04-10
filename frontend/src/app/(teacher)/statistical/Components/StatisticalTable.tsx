import { Table } from 'antd'
import styles from './StatisticalTable.module.scss'

const columns = [
  {
    title: 'Tên học sinh',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Điểm',
    dataIndex: 'score',
    key: 'score',
  },
]

const data = [
  {
    key: '1',
    name: 'Nguyễn Văn A',
    score: 8.5,
  },
  {
    key: '2',
    name: 'Trần Thị B',
    score: 9.0,
  },
  {
    key: '3',
    name: 'Lê Văn C',
    score: 7.5,
  },
]

export default function StatisticalTable() {
  return (
    <div className={styles.table}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ position: ['bottomLeft'], pageSize: 5 }}
        scroll={{ x: '1400', y: 'auto' }}
      />
    </div>
  )
}
