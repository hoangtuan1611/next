import { Button } from 'antd'
import styles from './DashboardCamera.module.scss'
import clsx from 'clsx'

const config = [
  { room: 'A24.1', state: true },
  { room: 'A8.5', state: false },
  { room: 'A8.6', state: true },
  { room: 'TV2', state: true },
  { room: 'TV3', state: false },
  { room: 'TV4', state: true },
  { room: 'TV1', state: false },
]

export default function DashboardCamera() {
  return (
    <div className={styles.container}>
      <div className={styles.container__layout}>
        {config.map(({ room, state }) => (
          <div key={room} className={styles.container__layout__item}>
            <div className={styles.container__layout__item__camera}>
              <Button type="primary">Mở Cam</Button>
            </div>
            <div className={styles.container__layout__item__info}>
              Cam phòng {room}
              <div
                className={clsx(styles.container__layout__item__info__state, {
                  [styles['container__layout__item__info--offline']]: !state,
                  [styles['container__layout__item__info--online']]: state,
                })}
              >
                {state ? 'Đang hoạt động' : 'Đang tắt'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
