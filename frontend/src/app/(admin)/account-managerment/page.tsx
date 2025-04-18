'use client'

import AdminWrapper from '@/app/(components)/AdminWrapper/AdminWrapper'
import styles from './AccountManagerment.module.scss'
import { Image } from 'antd'
import ToolBar from './Components/ToolBar/ToolBar'
import { useEffect, useState } from 'react'
import axios from 'axios'

export interface SubjectLogGroupItem {
  createTime: string
  currentCount: number
  imgPath: string
}

export interface TeachingSession {
  teachingSession: number
  teacherName: string
  subjectName: string
  className: string
  maxSudent: number
  firstLog: SubjectLogGroupItem
  lastLog: SubjectLogGroupItem
}

export interface SubjectLogGroupSummaryDto {
  createDate: string
  teachingSession: TeachingSession[]
}

const subjectLogGroupApi = process.env.NEXT_PUBLIC_API_SUBJECT_LOG

export default function AccountManagerment() {
  const [data, setData] = useState<SubjectLogGroupSummaryDto[]>([])
  const [visible, setVisible] = useState<boolean>(false)
  const [imgPath, setImgPath] = useState<string>('')

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

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <AdminWrapper title="Danh sách tài khoản" toolbar={<ToolBar />}>
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
                      👩‍🏫 Giảng viên: <strong>{session.teacherName}</strong> –
                      Môn học: <strong>{session.subjectName}</strong> – Lớp:{' '}
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
      </AdminWrapper>
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
    </>
  )
}
