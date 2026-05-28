import api from './api'
import type { AuthResponse, UpdateProfileData, User } from '@/types'

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get<User>('/auth/profile'),

  updateProfile: (data: UpdateProfileData) =>
    api.put<User>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  deleteAccount: () => api.delete('/auth/account'),

  refresh: () => api.post<{ token: string }>('/auth/refresh'),
}
