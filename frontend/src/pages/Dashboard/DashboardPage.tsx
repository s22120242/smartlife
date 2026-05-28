import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { activityService } from '@/services/activityService'
import { habitService } from '@/services/habitService'
import { scheduleService } from '@/services/scheduleService'
import { transportService } from '@/services/transportService'
import api from '@/services/api'
import type { Habit } from '@/types'
import { SkeletonStats, SkeletonList } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { parseTime } from '@/utils/helpers'
import { weatherService, type WeatherData } from '@/services/weatherService'

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

interface SuggestionItem {
  id: string
  suggestion: string
  type: string
  read: boolean
  generatedAt: string
}

interface AgendaItem {
  time: string
  title: string
  type: 'fijo' | 'actividad'
  color: string
}

const TYPE_COLORS: Record<string, string> = {
  clase: '#6C63FF',
  trabajo: '#9F7AEA',
  dormir: '#4FD1C5',
  comida: '#F6AD55',
  transporte: '#63B3ED',
  otro: '#A0AEC0',
}

export default function DashboardPage() {
  const [pendingCount, setPendingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [freeMinutes, setFreeMinutes] = useState(0)
  const [totalActivities, setTotalActivities] = useState(0)
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherCity, setWeatherCity] = useState(localStorage.getItem('weatherCity') || 'Mexico City')
  const [editingCity, setEditingCity] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWeather = (city: string) => {
    setWeatherLoading(true)
    weatherService.getWeather(city)
      .then((res) => setWeather(res.data))
      .catch(() => {})
      .finally(() => setWeatherLoading(false))
  }

  useEffect(() => {
    fetchWeather(weatherCity)
  }, [])

  const handleCityChange = () => {
    const trimmed = cityInput.trim()
    if (!trimmed) return
    localStorage.setItem('weatherCity', trimmed)
    setWeatherCity(trimmed)
    setEditingCity(false)
    fetchWeather(trimmed)
  }

  const fetchDashboard = async () => {
    try {
      setError('')
      const [actRes, habRes, schRes, sugRes, transRes] = await Promise.all([
        activityService.getAll(),
        habitService.getAll(),
        scheduleService.getAll(),
        api.get<SuggestionItem[]>('/scheduling/suggestions'),
        transportService.getAll(),
      ])

      const activities = actRes.data
      const schedules = schRes.data
      const allHabits = habRes.data
      const transports = Array.isArray(transRes) ? transRes : transRes.data

      setHabits(allHabits)
      setTotalActivities(activities.length)
      setPendingCount(activities.filter((a) => a.status === 'pendiente').length)
      setCompletedCount(activities.filter((a) => a.status === 'completada').length)
      setBestStreak(allHabits.reduce((max, h) => Math.max(max, h.streak), 0))

      const todayName = DAY_NAMES[new Date().getDay()]
      const todaySch = schedules.filter((s) => s.day === todayName)
      const todayTrans = transports.filter(
        (t: any) => !t.day || t.day === todayName
      )

      let busyMinutes = 0
      for (const s of todaySch) {
        busyMinutes += parseTime(s.endTime) - parseTime(s.startTime)
      }
      const transMinutes = todayTrans.reduce((sum: number, t: any) => sum + t.duration, 0)
      setFreeMinutes(Math.max(0, 1440 - busyMinutes - transMinutes))

      setSuggestions(sugRes.data)

      const pendingActs = activities
        .filter((a) => a.status === 'pendiente')
        .sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })

      const agendaItems: AgendaItem[] = [
        ...todaySch.map((s) => ({
          time: `${s.startTime} - ${s.endTime}`,
          title: s.title,
          type: 'fijo' as const,
          color: TYPE_COLORS[s.type] || '#6C63FF',
        })),
        ...pendingActs.slice(0, 5).map((a) => ({
          time: a.deadline
            ? new Date(a.deadline).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
            : 'Sin fecha',
          title: `${a.title} (${a.duration}min)`,
          type: 'actividad' as const,
          color: a.priority === 'alta' ? '#F687B3' : a.priority === 'media' ? '#F6AD55' : '#A0AEC0',
        })),
      ]
      setAgenda(agendaItems)
    } catch {
      setError('Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleExportJSON = async () => {
    try {
      const res = await api.get('/export')
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartlife-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Datos exportados exitosamente')
    } catch {
      toast.error('Error al exportar datos')
    }
  }

  const handleExportXML = async () => {
    try {
      const res = await api.get('/xml/export', { responseType: 'text' })
      const blob = new Blob([res.data], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartlife-export-${new Date().toISOString().split('T')[0]}.xml`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('XML exportado correctamente')
    } catch {
      toast.error('Error al exportar XML')
    }
  }

  const handleImportXML = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xml'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const res = await api.post('/xml/import', text, {
          headers: { 'Content-Type': 'application/xml' },
        })
        toast.success(
          `Importados: ${res.data.imported.activities} actividades, ${res.data.imported.schedules} horarios, ${res.data.imported.habits} hábitos, ${res.data.imported.transports} transportes`
        )
        fetchDashboard()
      } catch {
        toast.error('Error al importar XML')
      }
    }
    input.click()
  }

  const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-32 mb-4" />
            <SkeletonList count={4} />
          </div>
          <div className="bg-surface rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-24 mb-4" />
            <SkeletonList count={3} />
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Reintentar
          </button>
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
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-4 border-l-4 border-primary">
          <p className="text-gray-400 text-sm">Actividades pendientes</p>
          <p className="text-3xl font-bold text-text mt-1">{pendingCount}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border-l-4 border-green-500">
          <p className="text-gray-400 text-sm">Completadas</p>
          <p className="text-3xl font-bold text-text mt-1">{completedCount}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border-l-4 border-accent">
          <p className="text-gray-400 text-sm">Tiempo libre hoy</p>
          <p className="text-3xl font-bold text-text mt-1">
            {Math.round(freeMinutes / 60)}h {freeMinutes % 60}m
          </p>
        </div>
        <div className="bg-surface rounded-xl p-4 border-l-4 border-secondary">
          <p className="text-gray-400 text-sm">Mejor racha de hábitos</p>
          <p className="text-3xl font-bold text-text mt-1">{bestStreak} días</p>
        </div>
      </div>

      {completionRate > 0 && (
        <div className="bg-surface rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progreso general</span>
            <span className="text-sm font-medium text-primary">{completionRate}%</span>
          </div>
          <div className="h-3 bg-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            Agenda diaria
            {agenda.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">({agenda.length} items)</span>
            )}
          </h2>
          {agenda.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-center">Sin actividades para hoy</p>
              <p className="text-gray-600 text-sm mt-1">Organiza tu día en el calendario</p>
              <Link to="/calendar" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
                Ir al calendario
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {agenda.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">{item.time}</p>
                    <p className="text-text font-medium truncate">{item.title}</p>
                  </div>
                  <span className={`ml-auto shrink-0 text-xs px-2 py-1 rounded-full ${
                    item.type === 'fijo' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                  }`}>
                    {item.type === 'fijo' ? 'Fijo' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Clima</h2>
            <button
              onClick={() => { setEditingCity(!editingCity); setCityInput(weatherCity) }}
              className="text-xs text-gray-400 hover:text-text transition-colors"
            >
              {editingCity ? 'Cancelar' : 'Cambiar ubicación'}
            </button>
          </div>

          {editingCity && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCityChange()}
                className="flex-1 bg-dark border border-gray-700 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors"
                placeholder="Ej: Mexico City, London, Tokyo..."
              />
              <button onClick={handleCityChange} className="px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                Buscar
              </button>
            </div>
          )}

          {weatherLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-700 rounded w-24" />
              <div className="h-8 bg-gray-700 rounded w-32" />
            </div>
          ) : weather ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                {weather.icon && <img src={weather.icon} alt="" className="w-12 h-12" />}
                <div>
                  <p className="text-2xl font-bold text-text">{weather.temperature}</p>
                  <p className="text-sm text-gray-400">{weather.city}, {weather.country}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-1 capitalize">{weather.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <span>Sensación: {weather.feelsLike}</span>
                <span>Humedad: {weather.humidity}</span>
                <span>Viento: {weather.windSpeed}</span>
              </div>
              {weather.hourly && weather.hourly.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Por hora</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weather.hourly.map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-lg bg-dark/50">
                        <p className="text-[11px] text-gray-400">{h.time}</p>
                        {h.icon && <img src={h.icon} alt="" className="w-5 h-5" />}
                        <p className="text-xs text-text font-medium">{h.temp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {weather.forecast.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Pronóstico</p>
                  <div className="flex gap-2">
                    {weather.forecast.map((day, i) => (
                      <div key={i} className="flex-1 text-center p-2 rounded-lg bg-dark/50">
                        <p className="text-xs text-gray-400">
                          {new Date(day.date).toLocaleDateString('es-MX', { weekday: 'short' })}
                        </p>
                        {day.icon && <img src={day.icon} alt="" className="w-6 h-6 mx-auto" />}
                        <p className="text-xs text-text font-medium">{day.maxTemp}°</p>
                        <p className="text-xs text-gray-500">{day.minTemp}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No disponible</p>
          )}
        </div>

        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Sugerencias</h2>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-gray-500 text-center">Sin sugerencias por ahora</p>
              <p className="text-gray-600 text-sm mt-1">Usa el motor inteligente para generar sugerencias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-lg text-sm ${
                    s.type === 'balance'
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-primary/10 border border-primary/20'
                  }`}
                >
                  <p className="text-gray-300">{s.suggestion}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
            <button
              onClick={async () => {
                try {
                  setError('')
                  await api.get('/scheduling/analyze')
                  const res = await api.get<SuggestionItem[]>('/scheduling/suggestions')
                  setSuggestions(res.data)
                } catch {
                  setError('Error al analizar horario')
                }
              }}
              className="w-full py-3 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              {suggestions.length > 0 ? 'Re-analizar horario' : 'Analizar horario'}
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors font-medium"
            >
              Exportar JSON
            </button>
            <button
              onClick={handleExportXML}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors font-medium"
            >
              Exportar XML
            </button>
            <button
              onClick={handleImportXML}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors font-medium"
            >
              Importar XML
            </button>
          </div>
          {habits.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Hábitos hoy</h3>
              <div className="space-y-2">
                {habits.slice(0, 4).map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 truncate">{h.title}</span>
                    <span className={`font-medium ${h.completed >= h.target ? 'text-green-400' : 'text-gray-500'}`}>
                      {h.completed}/{h.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
