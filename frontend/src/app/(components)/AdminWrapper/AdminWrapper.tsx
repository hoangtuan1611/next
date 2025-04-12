import styles from './AdminWrapper.module.scss'

interface AdminWrapperProps {
  title?: string
  toolbar?: React.ReactNode
  children: React.ReactNode
}

export default function AdminWrapper({
  title,
  toolbar,
  children,
}: AdminWrapperProps) {
  return (
    <div className={styles.container}>
      <div className={styles.container__header}>
        <h1 className={styles.container__header__title}>{title}</h1>
        {toolbar}
      </div>
      <div className={styles.container__content}>{children}</div>
    </div>
  )
}
