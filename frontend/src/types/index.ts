export interface User {
  id: string
  name: string
  email: string
  role?: string
  profileImage?: string
}

export interface UpdateProfileData {
  name?: string
  profileImage?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface FixedSchedule {
  id: string
  userId: string
  title: string
  day: string
  startTime: string
  endTime: string
  type: string
}

export interface Activity {
  id: string
  userId: string
  categoryId: string
  title: string
  description?: string
  duration: number
  priority: 'alta' | 'media' | 'baja'
  deadline?: string
  startTime?: string
  splittable: boolean
  status: 'pendiente' | 'completada'
  category?: Category
}

export interface Habit {
  id: string
  userId: string
  title: string
  streak: number
  target: number
  completed: number
  lastCompletedAt?: string
}

export interface Transport {
  id: string
  userId: string
  origin: string
  destination: string
  duration: number
  day?: string | null
}

export interface Suggestion {
  id: string
  suggestion: string
  type: string
  read: boolean
  generatedAt: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface HoursByCategory {
  category: string
  color: string
  hours: number
  percentage: number
}

export interface PriorityDistribution {
  name: string
  minutes: number
  percentage: number
}

export interface ScheduleHoursByType {
  type: string
  hours: number
  color: string
}

export interface HabitProgress {
  name: string
  count: number
}

export interface HabitStats {
  totalHabits: number
  totalStreak: number
  bestStreak: number
  completedToday: number
  averageStreak: number
  habitsByProgress: HabitProgress[]
}

export interface Stats {
  hoursByCategory: HoursByCategory[]
  totalHours: number
  totalActivities: number
  pendingActivities: number
  completedActivities: number
  priorityDistribution: PriorityDistribution[]
  scheduleHoursByType: ScheduleHoursByType[]
  totalScheduleHours: number
  totalSchedules: number
  habitStats: HabitStats
  period?: string
}
