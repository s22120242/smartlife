import api from './api'
import type { Transport } from '@/types'

export const transportService = {
  getAll: () => api.get<Transport[]>('/transport'),
  getById: (id: string) => api.get<Transport>(`/transport/${id}`),
  create: (data: { origin: string; destination: string; duration: number; day?: string | null }) =>
    api.post<Transport>('/transport', data),
  update: (id: string, data: { origin?: string; destination?: string; duration?: number; day?: string | null }) =>
    api.put<Transport>(`/transport/${id}`, data),
  delete: (id: string) => api.delete(`/transport/${id}`),
}
