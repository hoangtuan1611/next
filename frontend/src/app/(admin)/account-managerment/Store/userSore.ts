import { create } from 'zustand'
import axios from 'axios'

type User = {
  id: number
  username: string
  password: string
  role: string
  code: string
  createdAt: string
}

type UserStore = {
  data: User[]
  fetchData: () => Promise<void>
}

const userApi = process.env.NEXT_PUBLIC_API_USER

export const useUserStore = create<UserStore>((set) => ({
  data: [],
  fetchData: async () => {
    try {
      const res = await axios.get(`${userApi}`)
      if (res.data) {
        set({ data: res.data })
      }
    } catch (error) {
      console.log('Error: ', error)
    }
  },
}))
