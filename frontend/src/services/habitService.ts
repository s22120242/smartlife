import api from './api'
import type { Habit } from '@/types'

export const habitService = {
  getAll: () => api.get<Habit[]>('/habits'),
  create: (data: { title: string; target?: number }) => api.post<Habit>('/habits', data),
  update: (id: string, data: Partial<Habit>) => api.put<Habit>(`/habits/${id}`, data),
  remove: (id: string) => api.delete(`/habits/${id}`),
  removeBatch: (ids: string[]) => api.post('/habits/batch-delete', { ids }),
}
