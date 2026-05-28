import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null
const initial: Theme = stored === 'light' ? 'light' : 'dark'

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initial)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    set({ theme: next })
  },
  setTheme: (t) => {
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
    set({ theme: t })
  },
}))
