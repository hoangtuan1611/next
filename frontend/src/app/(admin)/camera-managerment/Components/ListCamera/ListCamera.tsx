'use client'

import { useEffect, useState } from 'react'
import styles from './ListCamera.module.scss'
import { Table } from 'antd'

const col = [
  {
    title: 'Tên camera',
    dataIndex: 'cameraName',
    key: 'cameraName',
  },
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: 'Cột 3',
    dataIndex: 'col3',
    key: 'col3',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
  },
]

const data = [
  {
    key: '1',
    cameraName: 'Cam TV1',
    ip: '192.168.1.1',
    col3: '',
    status: 'hoạt động',
  },
  {
    key: '2',
    cameraName: 'Cam TV2',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '3',
    cameraName: 'Cam TV3',
    ip: '192.168.1.1',
    col3: '',
    status: 'hoạt động',
  },
  {
    key: '4',
    cameraName: 'Cam TV4',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '5',
    cameraName: 'Cam TV5',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '6',
    cameraName: 'Cam TV6',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '7',
    cameraName: 'Cam TV7',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '8',
    cameraName: 'Cam TV8',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '9',
    cameraName: 'Cam TV9',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '10',
    cameraName: 'Cam TV10',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '11',
    cameraName: 'Cam TV11',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
  {
    key: '12',
    cameraName: 'Cam TV12',
    ip: '192.168.1.1',
    col3: '',
    status: 'không hoạt động',
  },
]

export default function ListCamera() {
  return (
    <div className={styles.tableContainer}>
      <Table
        columns={col}
        dataSource={data}
        scroll={{ y: 'auto' }}
        pagination={{ pageSize: 8, position: ['bottomLeft'] }}
      />
    </div>
  )
}
