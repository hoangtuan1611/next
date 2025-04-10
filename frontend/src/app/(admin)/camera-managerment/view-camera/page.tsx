import { Button } from 'antd'
import styles from './ViewCamera.module.scss'

export default function ViewCamera() {
  return (
    <>
      <div className={styles.container}></div>
      <Button type="primary">Mở Cam</Button>
      <Button type="primary" danger>
        Tắt Cam
      </Button>
    </>
  )
}
