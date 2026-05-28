import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { habitService } from '@/services/habitService'
import type { Habit } from '@/types'
import Pagination from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useDebounce } from '@/utils/helpers'

const ITEMS_PER_PAGE = 20

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTarget, setEditTarget] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const debouncedSearch = useDebounce(search, 300)

  const fetchHabits = async () => {
    try {
      setError('')
      const res = await habitService.getAll()
      const today = new Date().toISOString().split('T')[0]
      setHabits(res.data.map((h) => ({
        ...h,
        completed: h.lastCompletedAt
          ? new Date(h.lastCompletedAt).toISOString().split('T')[0] === today ? h.completed : 0
          : 0,
      })))
    } catch {
      setError('Error al cargar hábitos')
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return habits
    const q = debouncedSearch.toLowerCase()
    return habits.filter((h) => h.title.toLowerCase().includes(q))
  }, [habits, debouncedSearch])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const addHabit = async () => {
    if (!newTitle.trim()) return
    try {
      await habitService.create({ title: newTitle.trim() })
      setNewTitle('')
      toast.success('Hábito creado')
      await fetchHabits()
    } catch {
      toast.error('Error al crear hábito')
    }
  }

  const toggleComplete = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0]
    const lastDate = habit.lastCompletedAt
      ? new Date(habit.lastCompletedAt).toISOString().split('T')[0]
      : null
    const alreadyDone = habit.completed >= habit.target

    if (lastDate === today && alreadyDone) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? { ...h, completed: 0, streak: Math.max(0, h.streak - 1), lastCompletedAt: undefined }
            : h
        )
      )
      toast.success('Hábito desmarcado')
      habitService.update(habit.id, {
        completed: 0,
        streak: Math.max(0, habit.streak - 1),
        lastCompletedAt: null,
      }).catch(() => {
        toast.error('Error al actualizar hábito')
        fetchHabits()
      })
      return
    }

    const isNewDay = lastDate !== today
    const newCompleted = Math.min((habit.completed || 0) + 1, habit.target)
    const newStreak = isNewDay ? (habit.streak || 0) + 1 : habit.streak
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, completed: newCompleted, streak: newStreak, lastCompletedAt: new Date().toISOString() }
          : h
      )
    )
    if (isNewDay) toast.success('¡Racha aumentada!')

    habitService.update(habit.id, {
      completed: newCompleted,
      streak: newStreak,
      lastCompletedAt: new Date().toISOString(),
    }).catch(() => {
      toast.error('Error al actualizar hábito')
      fetchHabits()
    })
  }

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditTitle(habit.title)
    setEditTarget(habit.target)
  }

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return
    try {
      await habitService.update(id, { title: editTitle.trim(), target: editTarget })
      setEditingId(null)
      toast.success('Hábito actualizado')
      await fetchHabits()
    } catch {
      toast.error('Error al editar hábito')
    }
  }

  const removeHabit = async (habit: Habit) => {
    if (!window.confirm(`¿Eliminar hábito "${habit.title}"?`)) return
    setHabits((prev) => prev.filter((h) => h.id !== habit.id))
    try {
      await habitService.remove(habit.id)
      toast.success('Hábito eliminado')
    } catch {
      toast.error('Error al eliminar hábito')
      fetchHabits()
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`¿Eliminar ${selectedIds.size} hábitos seleccionados?`)) return
    const ids = Array.from(selectedIds)
    setHabits((prev) => prev.filter((h) => !selectedIds.has(h.id)))
    setSelectedIds(new Set())
    habitService.removeBatch(ids).then(() => {
      toast.success(`${ids.length} hábitos eliminados`)
    }).catch(() => {
      toast.error('Error al eliminar hábitos')
      fetchHabits()
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
      setSelectedIds(new Set(paginated.map((h) => h.id)))
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="h-11 bg-gray-700 rounded w-full animate-pulse" />
        <SkeletonList count={5} />
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchHabits} className="text-primary hover:underline text-sm">Reintentar</button>
        </div>
      </div>
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
        <h1 className="text-2xl font-bold text-text">Hábitos</h1>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="Nuevo hábito..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-surface border border-gray-700 text-text placeholder-gray-500 focus:outline-none focus:border-primary"
        />
        <button
          onClick={addHabit}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          Añadir
        </button>
      </div>

      {habits.length > 0 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar hábito..."
          className="w-full px-4 py-2.5 rounded-lg bg-surface border border-gray-700 text-text placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      )}

      {paginated.length === 0 && !loading && (
        <div className="bg-surface rounded-xl p-12 text-center">
          {debouncedSearch.trim() ? (
            <>
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">Sin resultados para "{debouncedSearch}"</p>
              <button onClick={() => setSearch('')} className="text-primary hover:underline text-sm">Limpiar búsqueda</button>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-gray-400 text-lg mb-2">No hay hábitos</p>
              <p className="text-gray-500 text-sm">Crea tu primer hábito usando el campo de arriba</p>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {paginated.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
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
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                Eliminar {selectedIds.size}
              </button>
            )}
          </div>
        )}
        {paginated.map((habit) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface rounded-xl p-4 border-l-4 transition-colors ${
              habit.completed >= habit.target
                ? 'border-green-500/50'
                : 'border-accent/50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleComplete(habit)}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    habit.completed >= habit.target
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-600 hover:border-primary'
                  }`}
                >
                  {habit.completed >= habit.target && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  {editingId === habit.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(habit.id)}
                          className="flex-1 px-3 py-1.5 rounded bg-dark border border-gray-700 text-text text-sm focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(habit.id)}
                          className="px-3 py-1.5 bg-primary/20 text-primary text-sm rounded-lg hover:bg-primary/30 transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Meta diaria:</span>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={editTarget}
                          onChange={(e) => setEditTarget(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 px-2 py-1 rounded bg-dark border border-gray-700 text-text text-sm focus:outline-none focus:border-primary text-center"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-text font-medium ${habit.completed >= habit.target ? 'opacity-60' : ''}`}>
                        {habit.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">
                          {habit.completed}/{habit.target} hoy
                        </span>
                        <span className="text-gray-600">&middot;</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-accent font-medium">{habit.streak} días</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {editingId !== habit.id && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleSelect(habit.id)}
                    className={`w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(habit.id)
                        ? 'bg-primary border-primary'
                        : 'border-gray-600 hover:border-primary'
                    }`}
                    title={selectedIds.has(habit.id) ? 'Deseleccionar' : 'Seleccionar'}
                  >
                    {selectedIds.has(habit.id) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  {habit.streak > 0 && (
                    <div className="hidden sm:flex items-center gap-0.5 mr-1">
                      {Array.from({ length: Math.min(habit.streak, 5) }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i < habit.streak % 5 ? 'bg-accent' : 'bg-accent/30'}`}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => startEdit(habit)}
                    className="p-3 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-700 text-gray-400 hover:text-text transition-colors flex items-center justify-center"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => removeHabit(habit)}
                    className="p-3 min-w-[44px] min-h-[44px] rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  )
}
