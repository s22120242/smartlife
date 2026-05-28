import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'
import { authService } from '@/services/authService'

export default function Navbar() {
  const { theme, toggle } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { toggle: toggleSidebar } = useSidebarStore()
  const navigate = useNavigate()

  const initials = user
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleLogout = () => {
    authService.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface border-b border-gray-700/50 flex items-center justify-between px-4 sm:px-6 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors shrink-0"
          title="Menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-text truncate">Smart Life Organizer</h2>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          title="Cerrar sesión"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
          {initials}
        </div>
      </div>
    </header>
  )
}
