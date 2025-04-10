import { Button } from 'antd'
import { SlidersHorizontal, Upload } from 'lucide-react'
import styles from './Statistical.module.scss'
import StatisticalTable from './Components/StatisticalTable'

export default function Statistical() {
  return (
    <div className={styles.container}>
      <div className={styles.container__header}>
        <div className={styles.container__header__title}>Báo cáo</div>
        <div>
          <Button
            className={styles.container__header__btnSlider}
            type="default"
          >
            <SlidersHorizontal />
          </Button>
          <Button type="primary">
            <Upload /> Xuất excel
          </Button>
        </div>
      </div>
      <StatisticalTable />
    </div>
  )
}
