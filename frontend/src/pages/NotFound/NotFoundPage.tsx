import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function NotFoundPage() {
  const isAuth = useAuthStore((s) => !!s.token)

  if (isAuth) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
      >
        <div className="text-8xl font-bold text-primary/30">404</div>
        <h1 className="text-2xl font-bold text-white">Página no encontrada</h1>
        <p className="text-gray-400 max-w-sm">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            Ir al Dashboard
          </Link>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
