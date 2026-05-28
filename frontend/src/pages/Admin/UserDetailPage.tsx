import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminService } from '@/services/adminService'
import type { UserDetail } from '@/services/adminService'


const priorityColors: Record<string, string> = {
  alta: 'bg-red-500/20 text-red-400',
  media: 'bg-yellow-500/20 text-yellow-400',
  baja: 'bg-gray-500/20 text-gray-400',
}

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-400',
  completada: 'bg-green-500/20 text-green-400',
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    adminService.getUserDetail(id)
      .then((res) => setDetail(res.data))
      .catch(() => setError('Error al cargar datos del usuario'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl p-6 animate-pulse"><div className="h-64 bg-gray-700 rounded" /></div>
          <div className="bg-surface rounded-xl p-6 animate-pulse"><div className="h-64 bg-gray-700 rounded" /></div>
        </div>
      </motion.div>
    )
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors">
          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="ml-2">Volver</span>
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error || 'Usuario no encontrado'}</p>
        </div>
      </div>
    )
  }

  const { user, activities, habits, schedules } = detail

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text">{user.name}</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        <span className={`ml-auto text-xs px-3 py-1.5 rounded-full font-medium ${
          user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-600/30 text-gray-400'
        }`}>
          {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-4 border-l-4 border-primary">
          <p className="text-gray-400 text-sm">Actividades</p>
          <p className="text-3xl font-bold text-text mt-1">{activities.length}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border-l-4 border-secondary">
          <p className="text-gray-400 text-sm">Hábitos</p>
          <p className="text-3xl font-bold text-text mt-1">{habits.length}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border-l-4 border-accent">
          <p className="text-gray-400 text-sm">Horarios fijos</p>
          <p className="text-3xl font-bold text-text mt-1">{schedules.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Actividades</h2>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Sin actividades</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark/50">
                  <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: a.category?.color || '#6C63FF' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-text font-medium truncate">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.duration} min · {a.category?.name || 'Sin categoría'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[a.priority] || priorityColors.media}`}>
                      {a.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status] || ''}`}>
                      {a.status === 'completada' ? 'Completada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Hábitos</h2>
            {habits.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin hábitos</p>
            ) : (
              <div className="space-y-2">
                {habits.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-dark/50">
                    <div>
                      <p className="text-text font-medium">{h.title}</p>
                      <p className="text-xs text-gray-500">Racha: {h.streak} días</p>
                    </div>
                    <span className="text-sm text-gray-400">{h.completed}/{h.target}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Horarios Fijos</h2>
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin horarios</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-dark/30 text-sm">
                    <span className="text-text">{s.title}</span>
                    <span className="text-gray-400">{s.day} · {s.startTime}-{s.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
