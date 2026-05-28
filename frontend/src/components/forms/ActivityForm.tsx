import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'

interface ActivityFormProps {
  onSubmit: (data: ActivityFormData) => void
  onCancel?: () => void
  initial?: Partial<ActivityFormData>
  onDirtyChange?: (dirty: boolean) => void
}

export interface ActivityFormData {
  title: string
  description: string
  categoryId: string
  duration: number
  priority: string
  deadline: string
  startTime: string
  splittable: boolean
  status?: string
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180]

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#F687B3' },
  media: { label: 'Media', color: '#F6AD55' },
  baja: { label: 'Baja', color: '#A0AEC0' },
}

const DATE_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: 'Mañana', days: 1 },
  { label: 'Esta semana', days: null, getDate: () => {
    const d = new Date()
    d.setDate(d.getDate() + (6 - d.getDay()))
    return d
  }},
  { label: '+1 semana', days: 7 },
  { label: '+2 semanas', days: 14 },
]

const TIME_PRESETS = [
  { label: 'Mañana', time: '08:00', desc: '6:00 - 12:00' },
  { label: 'Mediodía', time: '12:00', desc: '12:00 - 14:00' },
  { label: 'Tarde', time: '15:00', desc: '14:00 - 18:00' },
  { label: 'Noche', time: '19:00', desc: '18:00 - 22:00' },
]

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function ActivityForm({ onSubmit, onCancel, initial, onDirtyChange }: ActivityFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showCustomTime, setShowCustomTime] = useState(!!initial?.startTime && !TIME_PRESETS.some(p => p.time === initial?.startTime))

  const { register, handleSubmit, setValue, getValues, watch, formState: { isDirty } } = useForm<ActivityFormData>({
    defaultValues: {
      title: initial?.title || '',
      description: initial?.description || '',
      categoryId: initial?.categoryId || '',
      duration: initial?.duration || 60,
      priority: initial?.priority || 'media',
      deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
      startTime: initial?.startTime || '',
      splittable: initial?.splittable || false,
      status: initial?.status || 'pendiente',
    },
  })

  const duration = watch('duration')
  const priority = watch('priority')
  const status = watch('status')
  const currentDate = watch('deadline')
  const currentTime = watch('startTime')

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    setCategoriesLoading(true)
    categoryService.getAll().then((res) => {
      setCategories(res.data)
      if (!getValues('categoryId') && res.data.length > 0) {
        setValue('categoryId', res.data[0].id)
      }
    }).catch(() => {
      const fallback = [
        { id: 'Estudio', name: 'Estudio', color: '#6C63FF' },
        { id: 'Trabajo', name: 'Trabajo', color: '#9F7AEA' },
        { id: 'Obligaciones', name: 'Obligaciones', color: '#4FD1C5' },
        { id: 'Salud', name: 'Salud', color: '#F687B3' },
        { id: 'Pasatiempos', name: 'Pasatiempos', color: '#F6AD55' },
        { id: 'Vida social', name: 'Vida social', color: '#63B3ED' },
        { id: 'Vida amorosa', name: 'Vida amorosa', color: '#FC8181' },
        { id: 'Descanso', name: 'Descanso', color: '#A0AEC0' },
      ]
      setCategories(fallback)
      if (!getValues('categoryId')) {
        setValue('categoryId', fallback[0].id)
      }
    }).finally(() => setCategoriesLoading(false))
  }, [])

  function formatDurationMin(min: number) {
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }

  function handleDatePreset(days: number | null, getDate?: () => Date) {
    if (days === null && getDate) {
      setValue('deadline', formatDate(getDate()))
    } else if (days !== null) {
      const d = new Date()
      d.setDate(d.getDate() + days)
      setValue('deadline', formatDate(d))
    }
  }

  function handleTimePreset(time: string) {
    setValue('startTime', time)
    setShowCustomTime(false)
  }

  function handleClearDate() {
    setValue('deadline', '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Título</label>
        <input
          type="text"
          {...register('title', { required: true })}
          placeholder="ej. Estudiar cálculo"
          className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Descripción</label>
        <textarea
          {...register('description')}
          placeholder="Opcional: añade detalles..."
          className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Categoría</label>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  getValues('categoryId') === cat.id
                    ? 'text-white scale-[1.02]'
                    : 'border-gray-700 bg-dark text-gray-400 hover:border-gray-500'
                }`}
                style={{
                  borderColor: getValues('categoryId') === cat.id ? cat.color : undefined,
                  backgroundColor: getValues('categoryId') === cat.id ? `${cat.color}20` : undefined,
                }}
              >
                <input
                  type="radio"
                  value={cat.id}
                  {...register('categoryId')}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Prioridad</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <label
              key={key}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                priority === key
                  ? 'text-white scale-[1.02]'
                  : 'border-gray-700 bg-dark text-gray-400 hover:border-gray-500'
              }`}
              style={{
                borderColor: priority === key ? cfg.color : undefined,
                backgroundColor: priority === key ? `${cfg.color}20` : undefined,
              }}
            >
              <input
                type="radio"
                value={key}
                {...register('priority')}
                className="sr-only"
              />
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-sm">{cfg.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-gray-400">Duración</label>
          <span className="text-xs text-gray-500">{formatDurationMin(duration || 0)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setValue('duration', preset)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                duration === preset
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {formatDurationMin(preset)}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={5}
          max={480}
          step={5}
          value={duration || 60}
          onChange={(e) => setValue('duration', Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-dark accent-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-400">Fecha y hora</label>
          {currentDate && (
            <button type="button" onClick={handleClearDate} className="text-xs text-gray-500 hover:text-gray-300">
              Quitar fecha
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleDatePreset('days' in preset ? preset.days as number | null : null, 'getDate' in preset ? preset.getDate : undefined)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                currentDate === formatDate(new Date(Date.now() + (preset.days !== null ? preset.days : 0) * 86400000))
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-start">
          <input
            type="date"
            {...register('deadline')}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-dark border border-gray-700 text-white text-sm focus:outline-none focus:border-primary"
          />
          <div className="flex gap-1 flex-wrap">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleTimePreset(preset.time)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  currentTime === preset.time && !showCustomTime
                    ? 'bg-primary text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setShowCustomTime(true); setValue('startTime', currentTime || '') }}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                showCustomTime
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
              }`}
            >
              {showCustomTime ? (
                <input
                  type="time"
                  value={currentTime}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); setValue('startTime', e.target.value) }}
                  className="w-16 bg-transparent text-white text-xs border-none outline-none"
                />
              ) : '⌚'}
            </button>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
        <input
          type="checkbox"
          {...register('splittable')}
          className="w-4 h-4 rounded border-gray-700 bg-dark accent-primary"
        />
        Actividad dividible en bloques
      </label>

      {initial && (
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={status === 'completada'}
            onChange={(e) => setValue('status', e.target.checked ? 'completada' : 'pendiente')}
            className="w-4 h-4 rounded border-gray-700 bg-dark accent-primary"
          />
          Completada
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          {initial ? 'Actualizar' : 'Guardar'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}