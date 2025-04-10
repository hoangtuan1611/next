/**
 *
 * @param key - item's key
 * @param setSelectedKey - set selected key for sidebar
 * @param route - navigation
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { Item } from './SideBar.types'

export const handleMenuClick = (
  key: string,
  setSelectedKey: React.Dispatch<React.SetStateAction<string>>,
  route: ReturnType<typeof useRouter>,
  items: Item[]
) => {
  setSelectedKey(key)
  localStorage.setItem('selectedMenuKey', key)

  const selectedItem = items
    .flatMap((item) => (item.children ? [item, ...item.children] : item))
    .find((item) => item.key === key)

  if (selectedItem?.path) {
    route.push(selectedItem.path)
  }
}
