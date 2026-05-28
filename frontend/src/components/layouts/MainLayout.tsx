import { useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'

export default function MainLayout() {
  const { isOpen, open, close } = useSidebarStore()
  const touchStartX = useRef(0)

  useEffect(() => {
    const handler = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      if (touch.clientX < 40 && !isOpen) {
        touchStartX.current = touch.clientX
      }
    }
    const moveHandler = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch || touchStartX.current === null) return
      if (touch.clientX - touchStartX.current > 60 && !isOpen) {
        open()
        touchStartX.current = 0
      }
    }
    window.addEventListener('touchstart', handler, { passive: true })
    window.addEventListener('touchmove', moveHandler, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('touchmove', moveHandler)
    }
  }, [isOpen, open])

  return (
    <div className="min-h-screen bg-dark flex">
      <Sidebar />
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
