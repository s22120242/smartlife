import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  })
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const onOff = () => setOffline(true)
    const onOn = () => setOffline(false)
    window.addEventListener('offline', onOff)
    window.addEventListener('online', onOn)
    return () => {
      window.removeEventListener('offline', onOff)
      window.removeEventListener('online', onOn)
    }
  }, [])
  if (!offline) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center text-sm py-2 px-4">
      Sin conexión — algunos datos pueden no estar disponibles
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OfflineBanner />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
        hideProgressBar
        closeOnClick
      />
    </BrowserRouter>
  </StrictMode>,
)
