import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { transportService } from '@/services/transportService'
import type { Transport } from '@/types'
import Modal from '@/components/ui/Modal'
import { SkeletonList } from '@/components/ui/Skeleton'

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

interface TransportForm {
  origin: string
  destination: string
  duration: number
  day: string
}

const emptyForm: TransportForm = { origin: '', destination: '', duration: 30, day: '' }

export default function TransportPage() {
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transport | null>(null)
  const [form, setForm] = useState<TransportForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchTransports = async () => {
    try {
      setError('')
      const res = await transportService.getAll()
      setTransports(res.data)
    } catch {
      setError('Error al cargar transportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransports() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (t: Transport) => {
    setEditing(t)
    setForm({ origin: t.origin, destination: t.destination, duration: t.duration, day: t.day || '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.origin.trim() || !form.destination.trim()) {
      toast.error('Origen y destino son requeridos')
      return
    }
    if (form.duration < 1) {
      toast.error('La duración debe ser mayor a 0')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await transportService.update(editing.id, form)
        setTransports((prev) => prev.map((t) => (t.id === editing.id ? res.data : t)))
        toast.success('Transporte actualizado')
      } else {
        const res = await transportService.create(form)
        setTransports((prev) => [res.data, ...prev])
        toast.success('Transporte creado')
      }
      setModalOpen(false)
    } catch {
      toast.error('Error al guardar transporte')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`¿Eliminar transporte "${label}"?`)) return
    try {
      await transportService.delete(id)
      setTransports((prev) => prev.filter((t) => t.id !== id))
      toast.success('Transporte eliminado')
    } catch {
      toast.error('Error al eliminar transporte')
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="bg-surface rounded-xl p-6 animate-pulse space-y-4">
          <SkeletonList count={4} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Transportes</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          + Nuevo transporte
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {transports.length === 0 && !error ? (
        <div className="bg-surface rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-500">Sin transportes registrados</p>
          <p className="text-gray-600 text-sm mt-1">Agrega los tiempos de traslado entre tus lugares frecuentes</p>
          <button onClick={openCreate} className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
            Agregar transporte
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {transports.map((t) => (
            <div key={t.id} className="bg-surface rounded-xl p-5 flex items-center gap-4 hover:bg-gray-700/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text font-medium">
                  {t.origin} <span className="text-gray-500 mx-1">→</span> {t.destination}
                </p>
                <p className="text-sm text-gray-400">
                  {t.duration} min
                  {t.day && <span className="ml-2 text-gray-500">· {t.day}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(t.id, `${t.origin} → ${t.destination}`)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar transporte' : 'Nuevo transporte'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Origen</label>
            <input
              type="text"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Casa"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Destino</label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: Universidad"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Duración (minutos)</label>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Math.max(1, parseInt(e.target.value) || 0) })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Día (opcional)</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Todos los días</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
