'use client'

import styles from './ByDate.module.scss'
import { Image, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubjectLogGroupSummaryDto } from './types'
import { useModalStore } from '../../../Store/useModalStore'
import { ChartType, convertDataLogByDate } from '../../../Utils/ConvertData'
import { RenderChart } from '../../ModalChart/Chart'

const subjectLogGroupApi = process.env.NEXT_PUBLIC_API_SUBJECT_LOG

export default function ByDate() {
  const [data, setData] = useState<SubjectLogGroupSummaryDto[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [imgPath, setImgPath] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(data[0]?.createDate)

  const { isOpen, closeModal } = useModalStore()
  const { dataChart, dataSelect } = convertDataLogByDate(data, selectedDate)

  const fetchData = async () => {
    try {
      var res = await axios.get(`${subjectLogGroupApi}/Grouped`)
      if (res.data) setData(res.data)
    } catch (error) {
      console.log('Fail to fetch: ', error)
    }
  }

  const handleClick = (imgPath: string) => {
    setVisible(true)
    setImgPath(imgPath)
  }

  const handleChange = (value: string) => {
    setSelectedDate(value)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <div className={styles['schedule-tree']}>
        {data.map((item, index) => (
          <div key={index} className={styles['schedule-tree__date-group']}>
            <h3 className={styles['schedule-tree__date']}>
              📅 Ngày: {item.createDate}
            </h3>
            <div className={styles['schedule-tree__sessions']}>
              {item.teachingSession.map((session, idx) => (
                <div key={idx} className={styles['schedule-tree__session']}>
                  <p className={styles['schedule-tree__info']}>
                    👩‍🏫 Giảng viên: <strong>{session.teacherName}</strong> – Môn
                    học: <strong>{session.subjectName}</strong> – Lớp:{' '}
                    <strong>{session.className}</strong>
                  </p>
                  <p
                    className={styles['schedule-tree__log']}
                    onClick={() => handleClick(session.firstLog.imgPath)}
                  >
                    🕐 Giờ đầu: {session.firstLog.createTime} – Sĩ số:{' '}
                    {session.firstLog.currentCount} / {session.maxSudent}
                  </p>
                  <p
                    className={styles['schedule-tree__log']}
                    onClick={() => handleClick(session.firstLog.imgPath)}
                  >
                    🕑 Giờ cuối: {session.lastLog.createTime} – Sĩ số:{' '}
                    {session.lastLog.currentCount} / {session.maxSudent}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Image
        width={200}
        style={{
          display: 'none',
        }}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
        preview={{
          visible,
          src: `${imgPath}`,
          onVisibleChange: (value: boolean) => {
            setVisible(value)
          },
        }}
      />
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
            defaultValue={selectedDate}
          />
          <RenderChart data={dataChart} />
        </Modal>
      )}
    </>
  )
}
