import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { statsService } from '@/services/statsService'
import type { Stats } from '@/types'
import { SkeletonStats, SkeletonList } from '@/components/ui/Skeleton'

type Tab = 'actividades' | 'horarios' | 'habitos'
type Period = 'all' | 'day' | 'week' | 'month'

const TYPE_LABELS: Record<string, string> = {
  clase: 'Clase',
  trabajo: 'Trabajo',
  dormir: 'Dormir',
  comida: 'Comida',
  transporte: 'Transporte',
  otro: 'Otro',
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'actividades', label: 'Actividades', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'horarios', label: 'Horarios Fijos', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { key: 'habitos', label: 'Hábitos', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' },
]

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodLoading, setPeriodLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('actividades')
  const [period, setPeriod] = useState<Period>('all')

  const fetchStats = useCallback(() => {
    setLoading(true)
    setError('')
    statsService.getStats(period)
      .then((res) => setStats(res.data))
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => { setLoading(false); setPeriodLoading(false) })
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-36 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 bg-gray-700 rounded w-28 animate-pulse" />
          <div className="h-9 bg-gray-700 rounded w-28 animate-pulse" />
          <div className="h-9 bg-gray-700 rounded w-28 animate-pulse" />
        </div>
        <SkeletonStats />
        <SkeletonList count={3} />
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchStats} className="text-primary hover:underline text-sm">Reintentar</button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const isEmpty = stats.totalActivities === 0 && stats.totalSchedules === 0 && stats.habitStats.totalHabits === 0

  if (isEmpty) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Estadísticas</h1>
        <div className="bg-surface rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">No hay datos aún</p>
          <p className="text-gray-500 text-sm mb-6">
            Crea actividades, horarios fijos o hábitos para ver estadísticas.
          </p>
          <Link
            to="/calendar"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Ir al calendario
          </Link>
        </div>
      </motion.div>
    )
  }

  const scheduleData = stats.scheduleHoursByType.map((s) => ({
    ...s,
    label: TYPE_LABELS[s.type] || s.type,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-text">Estadísticas</h1>
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => { setPeriodLoading(true); setPeriod(p.key) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.key
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-text'
              } ${periodLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={periodLoading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1.5">
        {TABS.map((tab) => {
          const hasData =
            (tab.key === 'actividades' && stats.totalActivities > 0) ||
            (tab.key === 'horarios' && stats.totalSchedules > 0) ||
            (tab.key === 'habitos' && stats.habitStats.totalHabits > 0)
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-text'
              } ${!hasData ? 'opacity-40 cursor-not-allowed' : ''}`}
              disabled={!hasData}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
              {!hasData && <span className="text-xs ml-1">(vacio)</span>}
            </button>
          )
        })}
      </div>

      {activeTab === 'actividades' && stats.totalActivities > 0 && (
        <motion.div key="actividades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Horas por categoría</h3>
            {stats.hoursByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.hoursByCategory}>
                  <XAxis dataKey="category" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {stats.hoursByCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500 text-sm text-center py-12">Sin datos en este período</p>}
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Distribución del tiempo</h3>
            {stats.hoursByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.hoursByCategory} dataKey="hours" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percentage }) => `${category} ${percentage}%`}>
                    {stats.hoursByCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500 text-sm text-center py-12">Sin datos</p>}
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Prioridad de actividades</h3>
            {stats.priorityDistribution.some((p) => p.minutes > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.priorityDistribution} layout="vertical">
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="minutes" radius={[0, 6, 6, 0]} fill="#6C63FF" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500 text-sm text-center py-12">Sin datos en este período</p>}
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Total horas planificadas</span><span className="text-text font-medium">{stats.totalHours} h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Actividades totales</span><span className="text-text font-medium">{stats.totalActivities}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Pendientes</span><span className="text-yellow-400 font-medium">{stats.pendingActivities}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Completadas</span><span className="text-green-400 font-medium">{stats.completedActivities}</span></div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'horarios' && stats.totalSchedules > 0 && (
        <motion.div key="horarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Horas semanales por tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scheduleData}>
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {scheduleData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Distribución semanal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={scheduleData} dataKey="hours" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, hours }) => `${label} ${hours}h`}>
                  {scheduleData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Horarios por tipo</h3>
            <div className="space-y-3">
              {scheduleData.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400 text-sm capitalize">{item.label}</span>
                  <span className="ml-auto text-text font-medium">{item.hours}h/sem</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Total horas semanales</span><span className="text-text font-medium">{stats.totalScheduleHours} h</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Horarios registrados</span><span className="text-text font-medium">{stats.totalSchedules}</span></div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'habitos' && stats.habitStats.totalHabits > 0 && (
        <motion.div key="habitos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-xl p-4 border-l-4 border-accent">
              <p className="text-gray-400 text-sm">Mejor racha</p>
              <p className="text-3xl font-bold text-text mt-1">{stats.habitStats.bestStreak} días</p>
            </div>
            <div className="bg-surface rounded-xl p-4 border-l-4 border-primary">
              <p className="text-gray-400 text-sm">Total hábitos</p>
              <p className="text-3xl font-bold text-text mt-1">{stats.habitStats.totalHabits}</p>
            </div>
            <div className="bg-surface rounded-xl p-4 border-l-4 border-green-500">
              <p className="text-gray-400 text-sm">Completados hoy</p>
              <p className="text-3xl font-bold text-text mt-1">{stats.habitStats.completedToday}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Progreso general</h3>
              <div className="space-y-4">
                {stats.habitStats.habitsByProgress.map((item) => {
                  const maxCount = Math.max(...stats.habitStats.habitsByProgress.map((h) => h.count), 1)
                  const pct = (item.count / maxCount) * 100
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item.name}</span>
                        <span className="text-text font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-dark rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.name === 'Completados hoy'
                              ? 'bg-green-500'
                              : item.name === 'Con racha > 0'
                              ? 'bg-accent'
                              : 'bg-gray-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">Resumen</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total de hábitos</span>
                  <span className="text-text font-medium">{stats.habitStats.totalHabits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Racha total acumulada</span>
                  <span className="text-text font-medium">{stats.habitStats.totalStreak} días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mejor racha</span>
                  <span className="text-accent font-medium">{stats.habitStats.bestStreak} días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Promedio de racha</span>
                  <span className="text-text font-medium">{stats.habitStats.averageStreak} días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completados hoy</span>
                  <span className="text-green-400 font-medium">{stats.habitStats.completedToday}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'actividades' && stats.totalActivities === 0 && (
        <div className="bg-surface rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">Sin actividades en este período</p>
          <p className="text-gray-500 text-sm mb-6">Cambia el filtro de período o crea actividades nuevas.</p>
          <Link to="/calendar" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">Ir al calendario</Link>
        </div>
      )}

      {activeTab === 'horarios' && stats.totalSchedules === 0 && (
        <div className="bg-surface rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-lg mb-2">Sin horarios fijos</p>
          <p className="text-gray-500 text-sm mb-6">Crea horarios fijos en el calendario para ver estadísticas.</p>
          <Link to="/calendar" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">Ir al calendario</Link>
        </div>
      )}

      {activeTab === 'habitos' && stats.habitStats.totalHabits === 0 && (
        <div className="bg-surface rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 text-lg mb-2">Sin hábitos</p>
          <p className="text-gray-500 text-sm mb-6">Crea hábitos para ver estadísticas de rachas y progreso.</p>
          <Link to="/habits" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">Ir a hábitos</Link>
        </div>
      )}
    </motion.div>
  )
}
