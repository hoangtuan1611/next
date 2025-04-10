'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Layout, Menu } from 'antd'
import { Menu as MenuIcon } from 'lucide-react'
import styles from '@components/SideBar/SideBar.module.scss'
import { Item } from './SideBar.types'
import { handleMenuClick } from './SideBar.utils'
import User from './User/User'
import { motion } from 'framer-motion'

const { Sider } = Layout

export default function SideBar({ items }: { items: Item[] }) {
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [showText, setShowText] = useState<boolean>(true)

  const route = useRouter()

  useEffect(() => {
    const savedKey = localStorage.getItem('selectedMenuKey')
    if (savedKey) {
      setSelectedKey(savedKey)
    }
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (collapsed) {
      setShowText(false)
    } else {
      timeoutId = setTimeout(() => setShowText(true), 100)
    }
    return () => clearTimeout(timeoutId)
  }, [collapsed])

  return (
    <Sider
      className={styles.SideBar}
      collapsed={collapsed}
      collapsedWidth={80}
      width={250}
    >
      <div className={styles.SideBar__header}>
        {!collapsed && showText && (
          <motion.p
            className={styles.SideBar__header__text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            Quản lý
          </motion.p>
        )}
        <Button
          className={styles.SideBar__header__button}
          onClick={() => setCollapsed(!collapsed)}
        >
          <MenuIcon />
        </Button>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        items={items}
        onClick={({ key }) =>
          handleMenuClick(key, setSelectedKey, route, items)
        }
        selectedKeys={[selectedKey]}
      />
      <User collapsed={collapsed} />
    </Sider>
  )
}
