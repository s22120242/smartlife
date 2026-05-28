import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { adminService, type AdminStats } from '@/services/adminService'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-700 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-700 rounded w-12" />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Panel de Administración</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </motion.div>
    )
  }

  const cards = [
    { label: 'Usuarios', value: stats?.users ?? 0, color: 'border-primary', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { label: 'Actividades', value: stats?.activities ?? 0, color: 'border-green-500', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Horarios', value: stats?.schedules ?? 0, color: 'border-accent', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Hábitos', value: stats?.habits ?? 0, color: 'border-secondary', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { label: 'Transportes', value: stats?.transports ?? 0, color: 'border-pink-500', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { label: 'Logs de actividad', value: stats?.logs ?? 0, color: 'border-yellow-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]

  const quickLinks = [
    { to: '/admin/users', label: 'Gestionar Usuarios', desc: 'CRUD completo de usuarios', color: 'bg-primary/10 text-primary border-primary/20' },
    { to: '/admin/logs', label: 'Registro de Actividad', desc: 'Ver acciones de administradores', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { to: '/admin/settings', label: 'Ajustes del Sistema', desc: 'Exportar datos e información', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors" title="Volver al dashboard principal">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text">Panel de Administración</h1>
          <p className="text-gray-400 text-sm">Resumen global de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`bg-surface rounded-xl p-4 border-l-4 ${card.color} hover:bg-gray-700/20 transition-colors`}>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{card.label}</p>
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <p className="text-3xl font-bold text-text mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-text pt-2">Acceso rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className={`bg-surface rounded-xl p-5 border ${link.color} hover:brightness-110 transition-all text-left`}
          >
            <h3 className="font-semibold mb-1">{link.label}</h3>
            <p className="text-sm opacity-70">{link.desc}</p>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
