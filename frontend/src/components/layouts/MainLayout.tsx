import { useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'

export default function MainLayout() {
  const { isOpen, open, close } = useSidebarStore()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const gestureActive = useRef(false)

  useEffect(() => {
    const startHandler = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch || isOpen) return
      if (touch.clientX < 40) {
        touchStartX.current = touch.clientX
        touchStartY.current = touch.clientY
        gestureActive.current = true
      }
    }
    const moveHandler = (e: TouchEvent) => {
      if (!gestureActive.current) return
      const touch = e.touches[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStartX.current
      const deltaY = Math.abs(touch.clientY - touchStartY.current)
      if (deltaY > Math.abs(deltaX)) {
        gestureActive.current = false
        return
      }
      if (deltaX > 70) {
        gestureActive.current = false
        open()
      }
    }
    const endHandler = () => {
      gestureActive.current = false
    }
    window.addEventListener('touchstart', startHandler, { passive: true })
    window.addEventListener('touchmove', moveHandler, { passive: true })
    window.addEventListener('touchend', endHandler, { passive: true })
    return () => {
      window.removeEventListener('touchstart', startHandler)
      window.removeEventListener('touchmove', moveHandler)
      window.removeEventListener('touchend', endHandler)
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
