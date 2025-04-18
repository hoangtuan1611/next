'use client'

import { notFound, usePathname, useRouter } from 'next/navigation'
import { useAuth, User } from './AuthContext'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<User['role']>
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.replace(loginUrl)
        return
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
          notFound()
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname])

  if (isLoading) {
    return null
  }

  if (
    isAuthenticated &&
    (!allowedRoles || (user && allowedRoles.includes(user.role)))
  ) {
    return <>{children}</>
  }

  return null
}
