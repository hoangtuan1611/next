import { Button } from 'antd'
import styles from './DashboardCamera.module.scss'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Camera {
  id: number
  name: string
  camera_id: string
  ip_address: string
  is_active: boolean
  currentClass?: {
    className: string
    subject: string
    teacher: string
    studentCount: number
    maxStudents: number
    startTime: string
    endTime: string
  }
}

interface ClassInfo {
  className: string
  subject: string
  teacher: string
  studentCount: number
  maxStudents: number
  startTime: string
  endTime: string
}

type ScheduleType = {
  [key in typeof days[number]]: ClassInfo[]
}

const days = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
]

const API_BASE_URL = 'http://localhost:5000'

export default function DashboardCamera() {
  const router = useRouter()
  const [cameras, setCameras] = useState<Camera[]>([])
  const [activeStreams, setActiveStreams] = useState<{ [key: string]: boolean }>({})
  const [currentDay, setCurrentDay] = useState<string>('')
  const [schedule, setSchedule] = useState<any>(null)

  useEffect(() => {
    // Set current day
    const today = new Date()
    setCurrentDay(days[today.getDay()])
    
    fetchCameras()
    fetchSchedule()

    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchCameras()
      fetchSchedule()
    }, 5000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể lấy lịch học')
      }

      const data = await response.json()
      setSchedule(data)
    } catch (error) {
      console.error('Error fetching schedule:', error)
      setSchedule(null)
    }
  }

  const fetchCameras = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cameras`, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách camera')
      }

      const data = await response.json()
      
      // Map cameras with real schedule data
      const validCameras = data.map((camera: Partial<Camera>) => {
        const isActive = camera.is_active ?? false
        let currentClass = undefined

        if (isActive && schedule) {
          // Tìm lớp học hiện tại dựa trên camera_id và ngày hiện tại
          const todaySchedule = schedule[currentDay] || []
          const classForCamera = todaySchedule.find((cls: any) => cls.camera_id === camera.camera_id)
          
          if (classForCamera) {
            currentClass = {
              className: classForCamera.className,
              subject: classForCamera.subject,
              teacher: classForCamera.teacher,
              studentCount: classForCamera.studentCount,
              maxStudents: classForCamera.maxStudents,
              startTime: classForCamera.startTime,
              endTime: classForCamera.endTime
            }
          }
        }

        return {
          ...camera,
          is_active: isActive,
          id: camera.id ?? camera.camera_id,
          camera_id: camera.camera_id ?? camera.id?.toString(),
          currentClass
        }
      })
      setCameras(validCameras)
    } catch (error) {
      console.error('Error fetching cameras:', error)
      setCameras([])
    }
  }

  const handleViewCamera = (cameraId: string) => {
    router.push(`/camera-managerment/view-camera/${cameraId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__header}>
        <h2>Hôm nay là {currentDay}</h2>
      </div>
      <div className={styles.container__layout}>
        {cameras.map((camera) => (
          <div key={camera.id} className={styles.container__layout__item}>
            <div className={styles.container__layout__item__camera}>
              <Button 
                type="primary"
                disabled={!camera.is_active}
                onClick={() => handleViewCamera(camera.camera_id)}
              >
                {camera.is_active ? 'Mở Cam' : 'Camera không hoạt động'}
              </Button>
            </div>
            <div className={styles.container__layout__item__info}>
              <div className={styles.container__layout__item__info__name}>
                {camera.name}
              </div>
              <div
                className={clsx(styles.container__layout__item__info__state, {
                  [styles['container__layout__item__info--offline']]: !camera.is_active,
                  [styles['container__layout__item__info--online']]: camera.is_active,
                })}
              >
                {camera.is_active ? 'Đang hoạt động' : 'Đang tắt'}
              </div>
              {camera.is_active && (
                <div className={styles.container__layout__item__info__class}>
                  {camera.currentClass ? (
                    <>
                      <div className={styles.container__layout__item__info__class__name}>
                        {camera.currentClass.className}
                      </div>
                      <div className={styles.container__layout__item__info__class__subject}>
                        {camera.currentClass.subject}
                      </div>
                      <div className={styles.container__layout__item__info__class__teacher}>
                        GV: {camera.currentClass.teacher}
                      </div>
                      <div className={styles.container__layout__item__info__class__students}>
                        Số học viên: {camera.currentClass.studentCount}/{camera.currentClass.maxStudents}
                      </div>
                      <div className={styles.container__layout__item__info__class__time}>
                        {camera.currentClass.startTime} - {camera.currentClass.endTime}
                      </div>
                    </>
                  ) : (
                    <div className={styles.container__layout__item__info__class__noClass}>
                      Không có lớp học vào {currentDay}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
