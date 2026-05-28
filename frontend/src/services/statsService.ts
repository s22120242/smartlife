import api from './api'
import type { Stats } from '@/types'

export const statsService = {
  getStats: (period?: string) =>
    api.get<Stats>(`/statistics${period && period !== 'all' ? `?period=${period}` : ''}`),
}
