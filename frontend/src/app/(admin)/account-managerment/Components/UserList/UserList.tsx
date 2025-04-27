import {
  Popconfirm,
  Table,
  TableColumnsType,
  TableProps,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import React, { useEffect } from 'react'
import { useSelectionStore } from '../../Store/useSelectionStore'
import { useUserStore } from '../../Store/userSore'

type User = {
  id: number
  username: string
  password: string
  role: string
  code: string
  createdAt: string
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

const col: TableColumnsType<User> = [
  {
    title: 'Tên đăng nhập',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Quyền',
    dataIndex: 'role',
    key: 'role',
    sorter: (a, b) => a.role.length - b.role.length,
    sortDirections: ['descend'],
  },
  {
    title: 'Mã số',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text: string) => <span>{formatDate(text)}</span>,
  },
]

export default function UserList() {
  const { data, fetchData } = useUserStore()

  const setSelectionIds = useSelectionStore((state) => state.setSelectedIds)

  const rowSelection: TableProps<User>['rowSelection'] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: User[]) => {
      setSelectionIds(selectedRowKeys as number[])
    },
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div style={{ height: '100%' }}>
      <Table
        rowKey="id"
        rowSelection={{ ...rowSelection }}
        dataSource={data}
        columns={col}
      />
    </div>
  )
}
