import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/components/layouts/MainLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute from '@/components/auth/AdminRoute'

const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'))
const CalendarPage = lazy(() => import('@/pages/Calendar/CalendarPage'))
const HabitsPage = lazy(() => import('@/pages/Habits/HabitsPage'))
const StatisticsPage = lazy(() => import('@/pages/Statistics/StatisticsPage'))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'))
const ActivitiesPage = lazy(() => import('@/pages/Activities/ActivitiesPage'))
const TransportPage = lazy(() => import('@/pages/Transport/TransportPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'))
const AdminDashboardPage = lazy(() => import('@/pages/Admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/Admin/AdminUsersPage'))
const UserDetailPage = lazy(() => import('@/pages/Admin/UserDetailPage'))
const AdminLogsPage = lazy(() => import('@/pages/Admin/AdminLogsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/Admin/AdminSettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
      <Route path="/404" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/activities" element={<Suspense fallback={<PageLoader />}><ActivitiesPage /></Suspense>} />
          <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />
          <Route path="/habits" element={<Suspense fallback={<PageLoader />}><HabitsPage /></Suspense>} />
          <Route path="/statistics" element={<Suspense fallback={<PageLoader />}><StatisticsPage /></Suspense>} />
          <Route path="/transport" element={<Suspense fallback={<PageLoader />}><TransportPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
          <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense>} />
          <Route path="/admin/users/:id/detail" element={<Suspense fallback={<PageLoader />}><UserDetailPage /></Suspense>} />
          <Route path="/admin/logs" element={<Suspense fallback={<PageLoader />}><AdminLogsPage /></Suspense>} />
          <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense>} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
    </Routes>
  )
}

export default App
