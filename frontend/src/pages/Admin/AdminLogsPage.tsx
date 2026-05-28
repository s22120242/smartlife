import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { adminService, type AdminLog } from '@/services/adminService'

export default function AdminLogsPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getLogs()
      .then((res) => setLogs(res.data))
      .catch(() => setError('Error al cargar logs'))
      .finally(() => setLoading(false))
  }, [])

  const actionColors: Record<string, string> = {
    create_user: 'bg-green-500/20 text-green-400',
    update_user: 'bg-blue-500/20 text-blue-400',
    delete_user: 'bg-red-500/20 text-red-400',
  }

  const actionLabels: Record<string, string> = {
    create_user: 'Creación',
    update_user: 'Actualización',
    delete_user: 'Eliminación',
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="bg-surface rounded-xl p-6 animate-pulse space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-gray-700 rounded" />)}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-text">Registro de Actividad</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Sin registros de actividad</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Fecha</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Admin</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Acción</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('es-MX', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 text-text font-medium">{log.adminName}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors[log.action] || 'bg-gray-600/30 text-gray-400'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
