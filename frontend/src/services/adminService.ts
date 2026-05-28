import api from './api'
import type { User, Activity, Habit, FixedSchedule, Category } from '@/types'

export interface AdminStats {
  users: number
  activities: number
  habits: number
  schedules: number
  transports: number
  logs: number
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  password?: string
}

export interface AdminLog {
  id: string
  adminId: string
  adminName: string
  action: string
  target: string | null
  targetId: string | null
  details: string | null
  createdAt: string
}

export interface UserDetail {
  user: User
  activities: (Activity & { category?: Category })[]
  habits: Habit[]
  schedules: FixedSchedule[]
}

export interface AdminExport {
  exportedAt: string
  summary: { users: number; activities: number; habits: number; schedules: number; transports: number }
  data: {
    users: User[]
    activities: Activity[]
    habits: Habit[]
    schedules: FixedSchedule[]
    transports: { id: string; userId: string; origin: string; destination: string; duration: number }[]
  }
}

export const adminService = {
  getUsers: () => api.get<User[]>('/admin/users'),
  createUser: (data: CreateUserData) => api.post<User>('/admin/users', data),
  updateUser: (id: string, data: UpdateUserData) => api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getUserDetail: (id: string) => api.get<UserDetail>(`/admin/users/${id}/detail`),
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getLogs: () => api.get<AdminLog[]>('/admin/logs'),
  exportAll: () => api.get<AdminExport>('/admin/export'),
}
