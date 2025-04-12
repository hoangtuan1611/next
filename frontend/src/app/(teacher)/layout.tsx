'use client'

/// <reference types="react" />
import * as React from 'react'
import { items } from './SideBar.config'
import SideBar from '@components/SideBar/SideBar'

export default function ManagermentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SideBar items={items} />
      <div className="h-screen min-w-0 flex-1 overflow-x-hidden p-5">
        {children}
      </div>
    </div>
  )
}
