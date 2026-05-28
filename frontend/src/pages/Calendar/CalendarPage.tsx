import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Modal from '@/components/ui/Modal'
import ActivityForm from '@/components/forms/ActivityForm'
import type { ActivityFormData } from '@/components/forms/ActivityForm'
import ScheduleForm from '@/components/forms/ScheduleForm'
import type { ScheduleFormData } from '@/components/forms/ScheduleForm'
import { scheduleService } from '@/services/scheduleService'
import { activityService } from '@/services/activityService'
import api from '@/services/api'
import type { FixedSchedule, Activity } from '@/types'

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

const DAY_INDEX: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3,
  jueves: 4, viernes: 5, sábado: 6,
}

const TYPE_COLORS: Record<string, string> = {
  clase: '#6C63FF',
  trabajo: '#9F7AEA',
  dormir: '#4FD1C5',
  comida: '#F6AD55',
  transporte: '#63B3ED',
  otro: '#A0AEC0',
}

interface ScheduleGroup {
  key: string
  title: string
  startTime: string
  endTime: string
  type: string
  color: string
  days: string[]
}

function groupSchedules(schedules: FixedSchedule[]) {
  const groups = new Map<string, ScheduleGroup>()
  for (const s of schedules) {
    const key = `${s.title}|${s.startTime}|${s.endTime}|${s.type}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type,
        color: TYPE_COLORS[s.type] || '#6C63FF',
        days: [],
      })
    }
    groups.get(key)!.days.push(s.day)
  }
  return Array.from(groups.values()).map((g) => ({
    title: g.title,
    daysOfWeek: [...new Set(g.days.map((d) => DAY_INDEX[d] ?? 1))].sort(),
    startTime: g.startTime,
    endTime: g.endTime,
    backgroundColor: g.color,
    borderColor: g.color,
    extendedProps: { type: 'schedule', groupKey: g.key },
    classNames: ['cursor-pointer'],
  }))
}

function activitiesToEvents(activities: Activity[]) {
  return activities
    .filter((a) => a.deadline)
    .map((a) => {
      const baseDate = a.deadline!.split('T')[0]
      const hasTime = !!a.startTime
      const color = a.category?.color || (a.status === 'completada' ? '#4FD1C5' : '#F6AD55')
      return {
        id: a.id,
        title: `${a.title} (${a.duration}min)`,
        start: hasTime ? `${baseDate}T${a.startTime}` : baseDate,
        end: hasTime ? (() => {
          const [h, m] = a.startTime!.split(':').map(Number)
          const totalMin = h * 60 + m + a.duration
          const endH = Math.floor(totalMin / 60)
          const endM = totalMin % 60
          return `${baseDate}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
        })() : undefined,
        allDay: !hasTime,
        backgroundColor: color,
        borderColor: color,
        textColor: a.status === 'completada' ? '#0F172A' : '#FFFFFF',
        classNames: ['cursor-pointer'],
        extendedProps: { type: 'activity' },
      }
    })
}

export default function CalendarPage() {
  const [modal, setModal] = useState<'activity' | 'schedule' | 'scheduleDetail' | 'editSchedule' | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleGroup | null>(null)
  const [editingSchedules, setEditingSchedules] = useState<FixedSchedule[]>([])
  const [allSchedules, setAllSchedules] = useState<FixedSchedule[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formDirty, setFormDirty] = useState(false)

  const fetchAll = async () => {
    try {
      setError('')
      const [schRes, actRes] = await Promise.all([
        scheduleService.getAll(),
        activityService.getAll(),
      ])
      setAllSchedules(schRes.data)
      const scheduleEvents = groupSchedules(schRes.data)
      const activityEvents = activitiesToEvents(actRes.data)
      setEvents([...scheduleEvents, ...activityEvents])
    } catch {
      setError('Error al cargar el calendario')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps
    if (props.type === 'activity') {
      activityService.getById(info.event.id).then((res) => {
        setEditingActivity(res.data)
      }).catch(() => {})
    } else if (props.type === 'schedule') {
      const group = allSchedules.filter((s) => {
        const key = `${s.title}|${s.startTime}|${s.endTime}|${s.type}`
        return key === props.groupKey
      })
      if (group.length > 0) {
        setSelectedSchedule({
          key: props.groupKey,
          title: group[0].title,
          startTime: group[0].startTime,
          endTime: group[0].endTime,
          type: group[0].type,
          color: TYPE_COLORS[group[0].type] || '#6C63FF',
          days: group.map((s) => s.day),
        })
        setModal('scheduleDetail')
      }
    }
  }

  const handleActivitySubmit = async (data: ActivityFormData) => {
    try {
      if (editingActivity) {
        await activityService.update(editingActivity.id, data)
        toast.success('Actividad actualizada')
      } else {
        await activityService.create(data)
        toast.success('Actividad creada')
      }
      setEditingActivity(null)
      setModal(null)
      await fetchAll()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al guardar actividad'
      toast.error(msg)
    }
  }

  const handleScheduleSubmit = async (data: ScheduleFormData) => {
    try {
      if (editingSchedules.length > 0) {
        await Promise.all(
          editingSchedules.map((s) =>
            scheduleService.update(s.id, {
              title: data.title,
              day: s.day,
              startTime: data.startTime,
              endTime: data.endTime,
              type: data.type,
            })
          )
        )
        toast.success('Horarios actualizados')
      } else {
        await scheduleService.createBatch(data)
        toast.success('Horarios creados')
      }
      setEditingSchedules([])
      await fetchAll()
      setModal(null)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al guardar horarios'
      toast.error(msg)
    }
  }

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return
    if (!window.confirm(`¿Eliminar horario fijo "${selectedSchedule.title}"?`)) return
    const toDelete = allSchedules.filter((s) => {
      const key = `${s.title}|${s.startTime}|${s.endTime}|${s.type}`
      return key === selectedSchedule.key
    })
    try {
      await Promise.all(toDelete.map((s) => scheduleService.remove(s.id)))
      toast.success('Horario eliminado')
      setSelectedSchedule(null)
      setModal(null)
      await fetchAll()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al eliminar horarios'
      toast.error(msg)
    }
  }

  const openNewActivity = () => {
    setEditingActivity(null)
    setModal('activity')
  }

  const openEditSchedule = () => {
    if (!selectedSchedule) return
    const schedules = allSchedules.filter((s) => {
      const key = `${s.title}|${s.startTime}|${s.endTime}|${s.type}`
      return key === selectedSchedule.key
    })
    setEditingSchedules(schedules)
    setModal('editSchedule')
  }

  const closeModal = () => {
    setEditingActivity(null)
    setSelectedSchedule(null)
    setEditingSchedules([])
    setModal(null)
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-700 rounded w-36 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-700 rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="bg-surface rounded-xl p-4 animate-pulse">
          <div className="h-96 bg-gray-700/50 rounded-lg" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchAll} className="text-primary hover:underline text-sm">Reintentar</button>
        </div>
      </div>
    )
  }

  const hasData = events.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">Calendario</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setModal('schedule')}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Horario fijo
          </button>
          <button
            onClick={openNewActivity}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Actividad
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="bg-surface rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-lg mb-2">Tu calendario está vacío</p>
          <p className="text-gray-500 text-sm mb-6">
            Agrega horarios fijos (clases, trabajo) y actividades para empezar a organizar tu tiempo.
          </p>
          <button
            onClick={() => setModal('schedule')}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Crear primer horario
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl p-4 [&_.fc]:text-text [&_.fc-toolbar-title]:text-text [&_.fc-button]:!bg-primary [&_.fc-button]:!border-primary [&_.fc-button:hover]:!bg-primary/90 [&_.fc-daygrid-day]:border-gray-700 [&_.fc-col-header-cell]:border-gray-700 [&_.fc-timegrid-slot]:border-gray-700 [&_.fc-scrollgrid]:border-gray-700 [&_.fc-list-day]:bg-surface [&_.fc-list-event]:bg-surface [&_.fc-list]:border-gray-700">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          editable={true}
          eventDurationEditable={true}
          height="auto"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={true}
          allDayText="Todo el día"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
        />
      </div>

      <Modal
        open={modal === 'activity' || !!editingActivity}
        onClose={() => { closeModal(); setFormDirty(false) }}
        title={editingActivity ? 'Editar actividad' : 'Nueva actividad'}
        dirty={formDirty}
      >
        <ActivityForm
          key={editingActivity?.id || 'new'}
          onSubmit={(data) => { handleActivitySubmit(data); setFormDirty(false) }}
          onCancel={() => { closeModal(); setFormDirty(false) }}
          onDirtyChange={setFormDirty}
          initial={editingActivity ? {
            title: editingActivity.title,
            description: editingActivity.description || '',
            categoryId: editingActivity.categoryId,
            duration: editingActivity.duration,
            priority: editingActivity.priority,
            deadline: editingActivity.deadline ? editingActivity.deadline.slice(0, 10) : '',
            startTime: editingActivity.startTime || '',
            splittable: editingActivity.splittable,
            status: editingActivity.status,
          } : undefined}
        />
      </Modal>

      <Modal
        open={modal === 'schedule'}
        onClose={() => { setModal(null); setFormDirty(false) }}
        title="Nuevo horario fijo"
        dirty={formDirty}
      >
        <ScheduleForm
          onSubmit={(data) => { handleScheduleSubmit(data); setFormDirty(false) }}
          onCancel={() => { setModal(null); setFormDirty(false) }}
          onDirtyChange={setFormDirty}
        />
      </Modal>

      <Modal
        open={modal === 'scheduleDetail'}
        onClose={closeModal}
        title="Detalle de horario fijo"
      >
        {selectedSchedule && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Título</label>
              <p className="text-text font-medium">{selectedSchedule.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Inicio</label>
                <p className="text-text">{selectedSchedule.startTime}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fin</label>
                <p className="text-text">{selectedSchedule.endTime}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <p className="text-text capitalize">{selectedSchedule.type}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Días</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {DAY_NAMES.map((d) => (
                  <span
                    key={d}
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      selectedSchedule.days.includes(d)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1, 3)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteSchedule}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Eliminar horario
              </button>
              <button
                onClick={openEditSchedule}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Editar horario
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal === 'editSchedule'}
        onClose={() => { closeModal(); setFormDirty(false) }}
        title="Editar horario fijo"
        dirty={formDirty}
      >
        {editingSchedules.length > 0 && (
          <ScheduleForm
            key={editingSchedules[0].id}
            onSubmit={(data) => { handleScheduleSubmit(data); setFormDirty(false) }}
            onCancel={() => { closeModal(); setFormDirty(false) }}
            onDirtyChange={setFormDirty}
            initial={{
              title: editingSchedules[0].title,
              days: [...new Set(editingSchedules.map((s) => s.day))],
              startTime: editingSchedules[0].startTime,
              endTime: editingSchedules[0].endTime,
              type: editingSchedules[0].type,
            }}
          />
        )}
      </Modal>
    </motion.div>
  )
}
