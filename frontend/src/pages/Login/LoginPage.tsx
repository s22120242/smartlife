import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'

interface ZodIssue {
  path: string[]
  message: string
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      const res = isRegister
        ? await authService.register(form)
        : await authService.login({ email: form.email, password: form.password })
      setAuth(res.data.user, res.data.token, res.data.refreshToken)
      toast.success(isRegister ? 'Cuenta creada exitosamente' : 'Inicio de sesión exitoso')
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; details?: ZodIssue[] } } }
      const details = axiosErr.response?.data?.details
      if (details && Array.isArray(details)) {
        const fieldMap: Record<string, string> = {}
        for (const issue of details) {
          const key = issue.path[0]
          if (key && !fieldMap[key]) {
            fieldMap[key] = issue.message
          }
        }
        if (Object.keys(fieldMap).length > 0) {
          setFieldErrors(fieldMap)
          setLoading(false)
          return
        }
      }
      const serverError = axiosErr.response?.data?.error
      if (serverError) {
        setError(serverError)
      } else {
        setError('Error al conectar con el servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-text text-center mb-2">
          Smart Life Organizer
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                className={`w-full px-4 py-2.5 rounded-lg bg-dark border text-text focus:outline-none focus:border-primary transition-colors ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-700'
                }`}
                required
              />
              {fieldErrors.name && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              className={`w-full px-4 py-2.5 rounded-lg bg-dark border text-text focus:outline-none focus:border-primary transition-colors ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-700'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={`w-full px-4 py-2.5 rounded-lg bg-dark border text-text focus:outline-none focus:border-primary transition-colors ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-700'
              }`}
              required
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setFieldErrors({})
              setError('')
            }}
            className="text-primary hover:underline"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  )
}
