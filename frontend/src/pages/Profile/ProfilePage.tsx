import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import Modal from '@/components/ui/Modal'

export default function ProfilePage() {
  const { user, setAuth, token, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const navigate = useNavigate()

  const fetchProfile = useCallback(() => {
    authService
      .getProfile()
      .then((res) => {
        if (token) setAuth(res.data, token)
      })
      .catch(() => setError('Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [token, setAuth])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await authService.updateProfile({ name: name.trim() })
      if (token) setAuth(res.data, token)
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setName(user?.name || '')
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) return
    setSavingPassword(true)
    try {
      await authService.changePassword(passwordForm)
      toast.success('Contraseña actualizada')
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al cambiar contraseña'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return
    setDeleting(true)
    try {
      await authService.deleteAccount()
      toast.success('Cuenta eliminada')
      logout()
      navigate('/login')
    } catch {
      toast.error('Error al eliminar cuenta')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  const initials = user
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
        <div className="bg-surface rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-700 rounded w-48" />
              <div className="h-4 bg-gray-700 rounded w-64" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline text-sm">Reintentar</button>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-text">Perfil</h1>

      <div className="bg-surface rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoComplete="name"
                  className="flex-1 px-3 py-1.5 rounded bg-dark border border-gray-700 text-text text-lg font-medium focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-text">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => {
                setName(user.name)
                setEditing(true)
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text">Seguridad</h2>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors"
        >
          Cambiar contraseña
        </button>
      </div>

      <div className="bg-surface rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Zona de peligro</h2>
        <p className="text-sm text-gray-400">Eliminar tu cuenta es irreversible. Se borrarán todos tus datos.</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
        >
          Eliminar cuenta
        </button>
      </div>

      <Modal
        open={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '' }) }}
        title="Cambiar contraseña"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleChangePassword() }} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-text focus:outline-none focus:border-primary"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-text focus:outline-none focus:border-primary"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
            <button
              type="button"
              onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '' }) }}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
        title="¿Eliminar cuenta?"
      >
        <div className="space-y-4">
          <p className="text-gray-400">Esta acción es irreversible. Se eliminarán todos tus datos: actividades, hábitos, horarios y transporte.</p>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Escribe <span className="text-red-400 font-bold">ELIMINAR</span> para confirmar</label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-dark border border-gray-700 text-text focus:outline-none focus:border-red-400"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== 'ELIMINAR'}
              className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-30 text-red-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
            </button>
            <button
              type="button"
              onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
