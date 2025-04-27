import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { StatisticalData } from './types'
import styles from './ByRoom.module.scss'
import { convertDataLogByRoom } from '../../../Utils/ConvertData'
import { useModalStore } from '../../../Store/useModalStore'
import { Modal, Select } from 'antd'
import { RenderChart } from '../../ModalChart/Chart'

const subjectLogGroupApi = process.env.NEXT_PUBLIC_API_SUBJECT_LOG

export default function ByRoom() {
  const [data, setData] = useState<StatisticalData[]>([])
  const [selectedRoom, setSelectedRoom] = useState(data[0]?.room)

  const { isOpen, closeModal } = useModalStore()
  const { dataChart, dataSelect } = convertDataLogByRoom(data, selectedRoom)

  const fetchData = async () => {
    const res = await axios.get(`${subjectLogGroupApi}/GroupedByRoom`)
    if (res.data) {
      console.log(res.data)
      setData(res.data)
    }
  }

  const handleChange = (value: string) => {
    setSelectedRoom(value)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {' '}
      <div className={styles.container}>
        {data.map((item) => (
          <div key={item.room} className={styles.room}>
            <div className={styles.roomTitle}>{item.room}</div>
            {item.createDate.map((d, index) => (
              <div key={index} className={styles.session}>
                <div className={styles.dateSubject}>
                  {d.createDate} - {d.subjectname}
                </div>
                <div className={styles.className}>{d.className}</div>
                <div className={styles.time}>
                  Giờ đầu: {d.firstTime.dateTime}{' '}
                  <span className={styles.badge}>
                    ({d.firstTime.currentCount}/{d.maxStudent})
                  </span>
                </div>
                <div className={styles.time}>
                  Giờ cuối: {d.lastTime.dateTime}{' '}
                  <span className={styles.badge}>
                    ({d.lastTime.currentCount}/{d.maxStudent})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {isOpen && (
        <Modal
          width={'70%'}
          title="Biểu đồ thống kê"
          open={isOpen}
          onCancel={closeModal}
        >
          <Select
            options={dataSelect}
            style={{ width: 200 }}
            onChange={handleChange}
            defaultValue={selectedRoom}
          />
          <RenderChart data={dataChart} />
        </Modal>
      )}
    </>
  )
}
