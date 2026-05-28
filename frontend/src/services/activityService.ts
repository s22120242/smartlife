import api from './api'
import type { Activity } from '@/types'

export const activityService = {
  getAll: () => api.get<Activity[]>('/activities'),
  getById: (id: string) => api.get<Activity>(`/activities/${id}`),
  create: (data: Partial<Activity>) => api.post<Activity>('/activities', data),
  update: (id: string, data: Partial<Activity>) => api.put<Activity>(`/activities/${id}`, data),
  remove: (id: string) => api.delete(`/activities/${id}`),
  removeBatch: (ids: string[]) => api.post('/activities/batch-delete', { ids }),
}
