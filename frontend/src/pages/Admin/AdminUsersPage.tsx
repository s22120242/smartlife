import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { adminService, type CreateUserData, type UpdateUserData } from '@/services/adminService'
import Modal from '@/components/ui/Modal'
import type { User } from '@/types'

interface UserForm {
  name: string
  email: string
  password: string
  role: string
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'USER' }

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(() => {
    setError('')
    adminService.getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role || 'USER' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son requeridos')
      return
    }
    if (!editingUser && !form.password.trim()) {
      setError('Contraseña es requerida')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingUser) {
        const data: UpdateUserData = { name: form.name, email: form.email, role: form.role }
        if (form.password) data.password = form.password
        const res = await adminService.updateUser(editingUser.id, data)
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)))
      } else {
        const data: CreateUserData = { name: form.name, email: form.email, password: form.password, role: form.role }
        const res = await adminService.createUser(data)
        setUsers((prev) => [res.data, ...prev])
      }
      setModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminService.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError('Error al eliminar usuario')
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
        <div className="bg-surface rounded-xl p-6 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded" />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-gray-700/30 text-gray-400 hover:text-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-text">Gestión de Usuarios</h1>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          + Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center">
          <p className="text-gray-500">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Nombre</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Email</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Rol</th>
                  <th className="text-right p-4 text-gray-400 text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="p-4 text-text font-medium">{user.name}</td>
                    <td className="p-4 text-gray-400">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-600/30 text-gray-400'
                      }`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/admin/users/${user.id}/detail`)} className="text-gray-400 hover:text-text text-sm font-medium transition-colors">
                          Detalle
                        </button>
                        <button onClick={() => openEdit(user)} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                          Editar
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button onClick={() => handleDelete(user.id, user.name)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="Nombre del usuario"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Contraseña {editingUser && <span className="text-gray-600">(dejar vacío para mantener)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear usuario'}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
