import api from './api'
import type { FixedSchedule } from '@/types'

export const scheduleService = {
  getAll: () => api.get<FixedSchedule[]>('/schedule'),
  create: (data: Partial<FixedSchedule>) => api.post<FixedSchedule>('/schedule', data),
  createBatch: (data: { title: string; days: string[]; startTime: string; endTime: string; type: string }) =>
    api.post<FixedSchedule[]>('/schedule/batch', data),
  update: (id: string, data: Partial<FixedSchedule>) => api.put<FixedSchedule>(`/schedule/${id}`, data),
  remove: (id: string) => api.delete(`/schedule/${id}`),
}
