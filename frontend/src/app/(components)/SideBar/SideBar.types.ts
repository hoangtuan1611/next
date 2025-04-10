export interface Item {
  label: string
  key: string
  icon?: React.ReactNode
  path?: string
  children?: Item[]
}
