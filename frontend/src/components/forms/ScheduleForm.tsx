import { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => void
  onCancel?: () => void
  initial?: Partial<ScheduleFormData>
  onDirtyChange?: (dirty: boolean) => void
}

export interface ScheduleFormData {
  title: string
  days: string[]
  startTime: string
  endTime: string
  type: string
}

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

const DAY_COLORS: Record<string, string> = {
  lunes: '#6C63FF',
  martes: '#9F7AEA',
  miércoles: '#4FD1C5',
  jueves: '#F687B3',
  viernes: '#F6AD55',
  sábado: '#63B3ED',
  domingo: '#FC8181',
}

const TIME_PRESETS = [
  { label: '30 min', start: '08:00', end: '08:30' },
  { label: '1 hora', start: '08:00', end: '09:00' },
  { label: '1.5 h', start: '08:00', end: '09:30' },
  { label: '2 horas', start: '08:00', end: '10:00' },
  { label: '3 horas', start: '08:00', end: '11:00' },
]

const BLOCK_PRESETS = [
  { label: 'Mañana', start: '08:00', end: '12:00' },
  { label: 'Mediodía', start: '12:00', end: '14:00' },
  { label: 'Tarde', start: '14:00', end: '18:00' },
  { label: 'Noche', start: '18:00', end: '22:00' },
]

export default function ScheduleForm({ onSubmit, onCancel, initial, onDirtyChange }: ScheduleFormProps) {
  const [showTimePresets, setShowTimePresets] = useState(false)
  const [timeError, setTimeError] = useState('')
  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<ScheduleFormData>({
    defaultValues: {
      title: initial?.title || '',
      days: initial?.days || [],
      startTime: initial?.startTime || '08:00',
      endTime: initial?.endTime || '09:00',
      type: initial?.type || 'clase',
    },
  })

  const watchedDays = watch('days')
  const startTime = watch('startTime')
  const endTime = watch('endTime')

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const durationMinutes = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    return (eh * 60 + em) - (sh * 60 + sm)
  }, [startTime, endTime])

  const durationLabel = useMemo(() => {
    if (durationMinutes <= 0) return '0 min'
    const h = Math.floor(durationMinutes / 60)
    const m = durationMinutes % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }, [durationMinutes])

  const toggleDay = (day: string) => {
    const current = watchedDays || []
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]
    setValue('days', updated, { shouldValidate: true })
  }

  const quickSelect = (selected: string[]) => {
    setValue('days', selected, { shouldValidate: true })
  }

  const applyTimePreset = (start: string, end: string) => {
    setValue('startTime', start)
    setValue('endTime', end)
    setShowTimePresets(false)
  }

  const onFormSubmit = (data: ScheduleFormData) => {
    if (data.days.length === 0) return
    const [sh, sm] = data.startTime.split(':').map(Number)
    const [eh, em] = data.endTime.split(':').map(Number)
    if (eh * 60 + em <= sh * 60 + sm) {
      setTimeError('La hora de fin debe ser posterior a la hora de inicio')
      return
    }
    setTimeError('')
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Título</label>
        <input
          type="text"
          {...register('title', { required: true })}
          placeholder="ej. Clase de matemáticas"
          className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-400">Días</label>
          <span className="text-xs text-gray-500">
            {(watchedDays || []).length} {(watchedDays || []).length === 1 ? 'día' : 'días'} seleccionados
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => quickSelect(['lunes', 'martes', 'miércoles', 'jueves', 'viernes'])}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            Entre semana
          </button>
          <button
            type="button"
            onClick={() => quickSelect(['sábado', 'domingo'])}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            Fin de semana
          </button>
          <button
            type="button"
            onClick={() => quickSelect([...DAYS])}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => quickSelect([])}
            className="text-xs px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            Limpiar
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day) => {
            const selected = (watchedDays || []).includes(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all ${
                  selected
                    ? 'text-white scale-105 shadow-lg shadow-primary/20'
                    : 'border-gray-700 bg-dark text-gray-400 hover:border-gray-500'
                }`}
                style={{
                  borderColor: selected ? DAY_COLORS[day] : undefined,
                  backgroundColor: selected ? `${DAY_COLORS[day]}20` : undefined,
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${selected ? 'bg-transparent' : 'bg-gray-600'}`}
                  style={selected ? { backgroundColor: DAY_COLORS[day] } : undefined}
                />
                <span className="text-xs font-medium">{day.slice(0, 3)}</span>
              </button>
            )
          })}
        </div>
        {(watchedDays || []).length === 0 && (
          <p className="text-xs text-red-400 mt-1">Selecciona al menos un día</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-400">Horario</label>
          <span className="text-xs text-gray-500">Duración: {durationLabel}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {BLOCK_PRESETS.map((block) => (
            <button
              key={block.label}
              type="button"
              onClick={() => applyTimePreset(block.start, block.end)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                startTime === block.start && endTime === block.end
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {block.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowTimePresets(!showTimePresets)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              showTimePresets ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            + Duraciones
          </button>
        </div>

        {showTimePresets && (
          <div className="flex flex-wrap gap-1.5 mb-3 p-2 rounded-lg bg-dark border border-gray-700">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyTimePreset(preset.start, preset.end)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  startTime === preset.start && endTime === preset.end
                    ? 'bg-primary/30 text-primary border border-primary/50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {preset.label} ({preset.start}-{preset.end})
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Inicio</label>
            <input
              type="time"
              {...register('startTime', { required: true })}
              className="w-full px-3 py-2 rounded-lg bg-dark border border-gray-700 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fin</label>
            <input
              type="time"
              {...register('endTime', { required: true })}
              className="w-full px-3 py-2 rounded-lg bg-dark border border-gray-700 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
        </div>

        {durationMinutes <= 0 && (
          <p className="text-xs text-red-400 mt-1">La hora de fin debe ser posterior a la hora de inicio</p>
        )}
        {timeError && <p className="text-xs text-red-400 mt-1">{timeError}</p>}
        {durationMinutes > 0 && (
          <div className="mt-2 h-2 bg-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min((durationMinutes / 480) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Tipo</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'clase', label: 'Clase', color: '#6C63FF' },
            { value: 'trabajo', label: 'Trabajo', color: '#9F7AEA' },
            { value: 'dormir', label: 'Dormir', color: '#4FD1C5' },
            { value: 'comida', label: 'Comida', color: '#F6AD55' },
            { value: 'transporte', label: 'Transporte', color: '#63B3ED' },
            { value: 'otro', label: 'Otro', color: '#A0AEC0' },
          ].map((t) => (
            <label
              key={t.value}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                watch('type') === t.value
                  ? 'text-white scale-[1.02]'
                  : 'border-gray-700 bg-dark text-gray-400 hover:border-gray-500'
              }`}
              style={{
                borderColor: watch('type') === t.value ? t.color : undefined,
                backgroundColor: watch('type') === t.value ? `${t.color}20` : undefined,
              }}
            >
              <input
                type="radio"
                value={t.value}
                {...register('type')}
                className="sr-only"
              />
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={(watchedDays || []).length === 0}
          className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {durationMinutes > 0
            ? `Guardar (${durationLabel}, ${(watchedDays || []).length} ${(watchedDays || []).length === 1 ? 'día' : 'días'})`
            : `Guardar (${(watchedDays || []).length || 0} ${(watchedDays || []).length === 1 ? 'día' : 'días'})`}
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
