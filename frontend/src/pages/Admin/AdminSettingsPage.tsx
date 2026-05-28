import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { adminService } from '@/services/adminService'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await adminService.exportAll()
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartlife-platform-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exportación completada: ${res.data.summary.users} usuarios, ${res.data.summary.activities} actividades, ${res.data.summary.habits} hábitos, ${res.data.summary.schedules} horarios, ${res.data.summary.transports} transportes`)
    } catch {
      toast.error('Error al exportar datos')
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-text">Ajustes del Sistema</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-2">Exportar datos</h2>
          <p className="text-gray-400 text-sm mb-4">Descarga un JSON con todos los datos de la plataforma (usuarios, actividades, hábitos, horarios, transportes).</p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
          >
            {exporting ? 'Exportando...' : 'Exportar todo (JSON)'}
          </button>
        </div>

        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-2">Información del sistema</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-700/30">
              <span className="text-gray-400">Versión</span>
              <span className="text-text">1.0.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700/30">
              <span className="text-gray-400">Frontend</span>
              <span className="text-text">React 19 + Vite 8</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700/30">
              <span className="text-gray-400">Backend</span>
              <span className="text-text">Express + Prisma + SQLite</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Autenticación</span>
              <span className="text-text">JWT + Refresh Tokens</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
