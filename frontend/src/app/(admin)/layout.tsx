import { items } from './SideBar.config'
import SideBar from '@components/SideBar/SideBar'

export default function ManagermentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex">
      <SideBar items={items} />
      <div className="h-screen min-w-0 flex-1 overflow-x-hidden p-5">
        {children}
      </div>
    </div>
  )
}
