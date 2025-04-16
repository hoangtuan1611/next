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
}

export default function DashboardCamera() {
  const router = useRouter()
  const [cameras, setCameras] = useState<Camera[]>([])
  const [activeStreams, setActiveStreams] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchCameras()

    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchCameras()
    }, 5000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:5000/cameras')
      const data = await response.json()
      
      if (data && Array.isArray(data.cameras)) {
        const validCameras = data.cameras.map((camera: Partial<Camera>) => ({
          ...camera,
          is_active: camera.is_active ?? false,
          id: camera.id ?? camera.camera_id,
          camera_id: camera.camera_id ?? camera.id?.toString()
        }))
        setCameras(validCameras)
      }
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
              {camera.name}
              <div
                className={clsx(styles.container__layout__item__info__state, {
                  [styles['container__layout__item__info--offline']]: !camera.is_active,
                  [styles['container__layout__item__info--online']]: camera.is_active,
                })}
              >
                {camera.is_active ? 'Đang hoạt động' : 'Đang tắt'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
