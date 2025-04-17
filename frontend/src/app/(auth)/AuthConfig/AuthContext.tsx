'use client'

import axios from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export interface User {
  name: string
  role: 'admin' | 'teacher'
  code: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  fetchUser: () => Promise<User | null>
  logout: () => Promise<void>
}

const getUserApi = process.env.NEXT_PUBLIC_API_ME

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`${getUserApi}`, {
        withCredentials: true,
      })
      if (res.data) {
        setUser(res.data)
        return res.data
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log('Fail to fetch data', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const isAuthenticated = !!user && !isLoading

  const value = {
    user,
    isLoading,
    isAuthenticated,
    fetchUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
