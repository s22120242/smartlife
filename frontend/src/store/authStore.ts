import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  setAuth: (user: User, token: string, refreshToken?: string) => void
  setTokens: (token: string, refreshToken: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    set({ user, token, refreshToken: refreshToken || get().refreshToken })
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    set({ token, refreshToken })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    set({ user: null, token: null, refreshToken: null })
  },
  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'ADMIN',
}))
