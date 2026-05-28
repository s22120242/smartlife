import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { activityService } from '@/services/activityService'
import type { Activity } from '@/types'
import Modal from '@/components/ui/Modal'
import ActivityForm, { type ActivityFormData } from '@/components/forms/ActivityForm'
import Pagination from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { toast } from 'react-toastify'
import { formatDuration, formatDate, useDebounce } from '@/utils/helpers'

type StatusFilter = 'todas' | 'pendiente' | 'completada'
type SortField = 'deadline' | 'priority' | 'duration' | 'title'
type SortDir = 'asc' | 'desc'

const ITEMS_PER_PAGE = 20

const priorityConfig: Record<string, { label: string; bg: string; dot: string }> = {
  alta: { label: 'Alta', bg: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' },
  media: { label: 'Media', bg: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
  baja: { label: 'Baja', bg: 'bg-gray-500/20 text-gray-400', dot: 'bg-gray-400' },
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('deadline')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [formDirty, setFormDirty] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const fetchActivities = useCallback(() => {
    setLoading(true)
    setError('')
    activityService.getAll().then((res) => {
      setActivities(res.data)
    }).catch(() => {
      setError('Error al cargar actividades')
      toast.error('Error al cargar actividades')
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedSearch])

  const priorityWeight: Record<string, number> = { alta: 0, media: 1, baja: 2 }

  const filtered = useMemo(() => {
    let list = activities
    if (statusFilter !== 'todas') {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      const cmp = (() => {
        if (sortField === 'deadline') {
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }
        if (sortField === 'priority') {
          return (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1)
        }
        if (sortField === 'duration') {
          return a.duration - b.duration
        }
        return a.title.localeCompare(b.title)
      })()
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [activities, statusFilter, debouncedSearch, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleCreate = (data: ActivityFormData) => {
    setSaving('create')
    activityService.create(data).then(() => {
      toast.success('Actividad creada')
      setModalOpen(false)
      fetchActivities()
    }).catch(() => toast.error('Error al crear actividad'))
      .finally(() => setSaving(null))
  }

  const handleUpdate = (data: ActivityFormData) => {
    if (!editing) return
    setSaving(editing.id)
    activityService.update(editing.id, data).then(() => {
      toast.success('Actividad actualizada')
      setEditing(null)
      fetchActivities()
    }).catch(() => toast.error('Error al actualizar actividad'))
      .finally(() => setSaving(null))
  }

  const handleDelete = (activity: Activity) => {
    if (!window.confirm(`¿Eliminar "${activity.title}"?`)) return
    setActivities((prev) => prev.filter((a) => a.id !== activity.id))
    activityService.remove(activity.id).then(() => {
      toast.success('Actividad eliminada')
    }).catch(() => {
      toast.error('Error al eliminar actividad')
      fetchActivities()
    })
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`¿Eliminar ${selectedIds.size} actividades seleccionadas?`)) return
    const ids = Array.from(selectedIds)
    setActivities((prev) => prev.filter((a) => !selectedIds.has(a.id)))
    setSelectedIds(new Set())
    activityService.removeBatch(ids).then(() => {
      toast.success(`${ids.length} actividades eliminadas`)
    }).catch(() => {
      toast.error('Error al eliminar actividades')
      fetchActivities()
    })
  }

  const handleToggleStatus = (activity: Activity) => {
    const newStatus = activity.status === 'completada' ? 'pendiente' : 'completada'
    setActivities((prev) =>
      prev.map((a) => (a.id === activity.id ? { ...a, status: newStatus as 'pendiente' | 'completada' } : a))
    )
    activityService.update(activity.id, { status: newStatus }).then(() => {
      toast.success(newStatus === 'completada' ? '¡Actividad completada!' : 'Actividad pendiente')
    }).catch(() => {
      toast.error('Error al cambiar estado')
      fetchActivities()
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map((a) => a.id)))
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-700 rounded w-36 animate-pulse" />
          <div className="h-10 bg-gray-700 rounded w-36 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-700 rounded w-40 animate-pulse" />
          <div className="h-9 bg-gray-700 rounded w-64 animate-pulse" />
        </div>
        <SkeletonList count={5} />
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">Actividades</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
            >
              Eliminar {selectedIds.size}
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            disabled={saving === 'create'}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {saving === 'create' ? 'Guardando...' : '+ Nueva actividad'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={fetchActivities} className="text-red-400 text-sm underline mt-1">Reintentar</button>
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-surface rounded-lg p-1">
          {(['todas', 'pendiente', 'completada'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'todas' ? 'Todas' : f === 'pendiente' ? 'Pendientes' : 'Completadas'}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-surface border border-gray-700 text-text placeholder-gray-500 focus:outline-none focus:border-primary w-full sm:w-64"
        />
        <div className="flex gap-1 bg-surface rounded-lg p-1 flex-wrap">
          {(['deadline', 'priority', 'duration', 'title'] as SortField[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                if (sortField === f) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
                else { setSortField(f); setSortDir('asc') }
              }}
              className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                sortField === f
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'deadline' ? 'Fecha' : f === 'priority' ? 'Prioridad' : f === 'duration' ? 'Duración' : 'Título'}
              {sortField === f && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface rounded-xl p-12 text-center">
          {debouncedSearch.trim() ? (
            <>
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">Sin resultados para "{debouncedSearch}"</p>
              <button
                onClick={() => setSearch('')}
                className="text-primary hover:underline text-sm"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">No hay actividades registradas</p>
              <p className="text-gray-500 text-sm mb-6">Organiza tu tiempo creando actividades con fecha y prioridad.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Crear primera actividad
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-text transition-colors"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedIds.size === paginated.length
                    ? 'bg-primary border-primary'
                    : 'border-gray-600 hover:border-primary'
                }`}>
                  {selectedIds.size === paginated.length && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                Seleccionar todos
              </button>
              <span className="text-xs text-gray-500">({selectedIds.size} seleccionados)</span>
            </div>
          )}
          {paginated.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-surface rounded-xl p-4 border-l-4 transition-colors ${
                activity.status === 'completada'
                  ? 'border-green-500/50'
                  : activity.priority === 'alta'
                  ? 'border-red-500/50'
                  : activity.priority === 'media'
                  ? 'border-yellow-500/50'
                  : 'border-gray-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(activity)}
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        activity.status === 'completada'
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-600 hover:border-primary'
                      }`}
                    >
                      {activity.status === 'completada' && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-text font-medium ${activity.status === 'completada' ? 'line-through opacity-60' : ''}`}>
                        {activity.title}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[activity.priority].bg}`}>
                        {priorityConfig[activity.priority].label}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        activity.status === 'completada'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {activity.status === 'completada' ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: activity.category?.color || '#6C63FF' }}
                        />
                        <span>{activity.category?.name || 'Sin categoría'}</span>
                      </div>
                      <span>&middot;</span>
                      <span>{formatDuration(activity.duration)}</span>
                      <span>&middot;</span>
                      <span>{formatDate(activity.deadline)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleSelect(activity.id)}
                    className={`w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(activity.id)
                        ? 'bg-primary border-primary'
                        : 'border-gray-600 hover:border-primary'
                    }`}
                    title={selectedIds.has(activity.id) ? 'Deseleccionar' : 'Seleccionar'}
                  >
                    {selectedIds.has(activity.id) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setEditing(activity)}
                    className="p-3 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-700 text-gray-400 hover:text-text transition-colors flex items-center justify-center"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(activity)}
                    className="p-3 min-w-[44px] min-h-[44px] rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setFormDirty(false) }} title="Nueva actividad" dirty={formDirty}>
        <ActivityForm onSubmit={(data) => { handleCreate(data); setFormDirty(false) }} onCancel={() => { setModalOpen(false); setFormDirty(false) }} onDirtyChange={setFormDirty} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => { setEditing(null); setFormDirty(false) }}
        title="Editar actividad"
        dirty={formDirty}
      >
        {editing && (
          <ActivityForm
            onSubmit={(data) => { handleUpdate(data); setFormDirty(false) }}
            onCancel={() => { setEditing(null); setFormDirty(false) }}
            onDirtyChange={setFormDirty}
            initial={{
              title: editing.title,
              description: editing.description || '',
              categoryId: editing.categoryId,
              duration: editing.duration,
              priority: editing.priority,
              deadline: editing.deadline ? editing.deadline.slice(0, 10) : '',
              startTime: editing.startTime || '',
              splittable: editing.splittable,
              status: editing.status,
            }}
          />
        )}
      </Modal>
    </motion.div>
  )
}
