import axios from 'axios'

// Unidad 3 — AJAX: Cliente HTTP asíncrono con Axios
// Todas las peticiones del frontend pasan por aquí

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingRequests: Array<{ resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = []

// Interceptor de request: inyecta el token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: refresh automático si el token expiró
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')

      // Si ya se está refrescando, encola las peticiones pendientes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        const res = await axios.post('/api/v1/auth/refresh', null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })

        const newToken = res.data.token
        const newRefreshToken = res.data.refreshToken
        localStorage.setItem('token', newToken)
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        isRefreshing = false

        pendingRequests.forEach((p) => p.resolve(newToken))
        pendingRequests = []

        return api(originalRequest)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        isRefreshing = false
        pendingRequests.forEach((p) => p.reject(err))
        pendingRequests = []
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  }
)

export default api
