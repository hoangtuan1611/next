import React, { useEffect, useState } from 'react'
import styles from './ByTeacher.module.scss'
import { TeacherLogInfo } from './types'
import axios from 'axios'
import { useModalStore } from '../../../Store/useModalStore'
import { convertDataLogByTeacher } from '../../../Utils/ConvertData'
import { Modal, Select } from 'antd'
import { RenderChart } from '../../ModalChart/Chart'

const subjectLogGroupApi = process.env.NEXT_PUBLIC_API_SUBJECT_LOG

export default function ByTeacher() {
  const [data, setData] = useState<TeacherLogInfo[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState(data[0]?.teacherName)

  const { isOpen, closeModal } = useModalStore()
  const { dataChart, dataSelect } = convertDataLogByTeacher(
    data,
    selectedTeacher
  )

  const fetchData = async () => {
    const res = await axios.get(`${subjectLogGroupApi}/GroupedByTeacher`)
    if (res.data) {
      console.log(res.data)
      setData(res.data)
    }
  }

  const handleChange = (value: string) => {
    setSelectedTeacher(value)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <div className={styles.container}>
        {data.map((teacher, idx) => (
          <div key={idx} className={styles.room}>
            <div className={styles.roomTitle}>{teacher.teacherName}</div>
            <div>
              {teacher.subject.map((subject, subjectIdx) => (
                <div key={subjectIdx} className={styles.session}>
                  <div className={styles.dateSubject}>
                    Môn học {subject.subjectName}
                    <span className={styles.badge}>
                      SL: {subject.maxStudent}
                    </span>
                  </div>
                  <div className={styles.dateList}>
                    {subject.createDate.map((dateInfo, dateIdx) => (
                      <div key={dateIdx} className={styles.dateItem}>
                        <div className={styles.classInfo}>
                          Ngày: {dateInfo.createDate} - Lớp:{' '}
                          {dateInfo.className} - Phòng: {dateInfo.room}
                        </div>
                        <div className={styles.timeGroup}>
                          <div className={styles.time}>
                            Giờ đầu: {dateInfo.firstTime.dateTime}{' '}
                            <span className={styles.badge}>
                              {dateInfo.firstTime.currentCount}
                            </span>
                          </div>
                          <div className={styles.time}>
                            Giờ cuối: {dateInfo.lastTime.dateTime}{' '}
                            <span className={styles.badge}>
                              {dateInfo.lastTime.currentCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
            defaultValue={selectedTeacher}
          />
          <RenderChart data={dataChart} />
        </Modal>
      )}
    </>
  )
}
