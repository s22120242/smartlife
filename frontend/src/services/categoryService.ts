import api from './api'
import type { Category } from '@/types'

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories'),
}
