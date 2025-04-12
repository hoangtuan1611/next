'use client'

import AdminWrapper from '@/app/(components)/AdminWrapper/AdminWrapper'
import styles from './AccountManagerment.module.scss'
import { Table, TableColumnsType, TableProps } from 'antd'
import ToolBar from './Components/ToolBar/ToolBar'

interface DataType {
  key: React.Key
  name: string
  age: number
  address: string
}

const columns: TableColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
]

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Disabled User',
    age: 99,
    address: 'Sydney No. 1 Lake Park',
  },
]

const rowSelection: TableProps<DataType>['rowSelection'] = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows
    )
  },
  getCheckboxProps: (record: DataType) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
}

export default function AccountManagerment() {
  return (
    <AdminWrapper title="Danh sách tài khoản" toolbar={<ToolBar />}>
      <Table<DataType>
        rowSelection={{ ...rowSelection }}
        columns={columns}
        dataSource={data}
      />
    </AdminWrapper>
  )
}
