import { useState, useEffect } from 'react'

export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
