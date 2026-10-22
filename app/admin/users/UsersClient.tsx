// app/admin/users/UsersClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Bell, 
  Lock, 
  User, 
  KeyRound,
  ShieldAlert,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { AVAILABLE_MENUS } from '@/lib/menus'
import { checkPasswordExpiry, validatePasswordStrength } from '@/lib/password'
import { 
  createUserAction, 
  updateUserAction, 
  deleteUserAction, 
  toggleUserStatusAction,
  resetUserPasswordAction
} from './actions'

export interface CmsUserDisplay {
  id: string
  username: string
  name: string
  role: string
  permissions: string[]
  canReceiveCareerNotif: boolean
  isActive: boolean
  createdAt: number
  passwordUpdatedAt?: number
  mustResetPassword?: boolean
}

interface UsersClientProps {
  users: CmsUserDisplay[]
  masterAdminUsername: string
  isRootAdmin: boolean
  currentUserId: string
}

export default function UsersClient({ 
  users, 
  masterAdminUsername, 
  isRootAdmin, 
  currentUserId: _currentUserId 
}: UsersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<CmsUserDisplay | null>(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetTargetUser, setResetTargetUser] = useState<CmsUserDisplay | null>(null)

  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State form modal user
  const [formUsername, setFormUsername] = useState('')
  const [formName, setFormName] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('Staff')
  const [formCanNotif, setFormCanNotif] = useState(false)
  const [formIsActive, setFormIsActive] = useState(true)
  const [formPermissions, setFormPermissions] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)

  // State form modal reset password
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)

  // Buka modal tambah pengguna (khusus Admin Root)
  const openAddModal = () => {
    if (!isRootAdmin) {
      setErrorMsg('Akses ditolak: Hanya Administrator Root yang memiliki wewenang untuk menambahkan role atau pengguna baru.')
      return
    }
    setEditingUser(null)
    setFormUsername('')
    setFormName('')
    setFormPassword('')
    setFormRole('Staff')
    setFormCanNotif(false)
    setFormIsActive(true)
    setFormPermissions(['career', 'applications'])
    setShowPassword(false)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // Buka modal edit pengguna
  const openEditModal = (user: CmsUserDisplay) => {
    setEditingUser(user)
    setFormUsername(user.username)
    setFormName(user.name)
    setFormPassword('')
    setFormRole(user.role)
    setFormCanNotif(user.canReceiveCareerNotif)
    setFormIsActive(user.isActive)
    setFormPermissions(user.permissions || [])
    setShowPassword(false)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // Buka modal reset password user lain
  const openResetModal = (user: CmsUserDisplay) => {
    setResetTargetUser(user)
    setResetNewPassword('')
    setResetConfirmPassword('')
    setShowResetPassword(false)
    setErrorMsg('')
    setIsResetModalOpen(true)
  }

  const togglePermission = (menuId: string) => {
    if (!isRootAdmin) return // Hanya root admin yang bisa mengubah permission
    setFormPermissions((prev) => 
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    )
  }

  const selectAllPermissions = () => {
    if (!isRootAdmin) return
    setFormPermissions(AVAILABLE_MENUS.map((m) => m.id))
  }

  const clearAllPermissions = () => {
    if (!isRootAdmin) return
    setFormPermissions([])
  }

  // Handle submit form tambah / edit pengguna
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    // Jika mode tambah, pastikan validasi kekuatan password
    if (!editingUser) {
      const val = validatePasswordStrength(formPassword)
      if (!val.isValid) {
        setErrorMsg(val.errors.join(' '))
        return
      }
    } else if (formPassword.trim().length > 0) {
      const val = validatePasswordStrength(formPassword.trim())
      if (!val.isValid) {
        setErrorMsg(val.errors.join(' '))
        return
      }
    }

    const formData = new FormData()
    if (editingUser) {
      formData.set('id', editingUser.id)
    }
    formData.set('username', formUsername)
    formData.set('name', formName)
    formData.set('password', formPassword)
    formData.set('role', formRole)
    formData.set('canReceiveCareerNotif', formCanNotif ? 'on' : 'off')
    formData.set('isActive', formIsActive ? 'true' : 'false')

    formPermissions.forEach((perm) => {
      formData.set(`perm_${perm}`, 'on')
    })

    startTransition(async () => {
      try {
        if (editingUser) {
          const res = await updateUserAction(formData)
          if (!res.success) {
            setErrorMsg(res.message || 'Gagal memperbarui data pengguna.')
            return
          }
          setSuccessMsg(`Data pengguna "${formName}" berhasil diperbarui.`)
        } else {
          const res = await createUserAction(formData)
          if (!res.success) {
            setErrorMsg(res.message || 'Gagal menambahkan pengguna baru.')
            return
          }
          setSuccessMsg(`Pengguna baru "${formName}" berhasil dibuat.`)
        }
        setIsModalOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
        setErrorMsg(msg)
      }
    })
  }

  // Handle submit form reset password
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!resetTargetUser) return
    setErrorMsg('')
    setSuccessMsg('')

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru.')
      return
    }

    const val = validatePasswordStrength(resetNewPassword)
    if (!val.isValid) {
      setErrorMsg(val.errors.join(' '))
      return
    }

    const formData = new FormData()
    formData.set('userId', resetTargetUser.id)
    formData.set('newPassword', resetNewPassword)
    formData.set('confirmPassword', resetConfirmPassword)

    startTransition(async () => {
      try {
        const res = await resetUserPasswordAction(formData)
        if (!res.success) {
          setErrorMsg(res.message || 'Gagal mereset password.')
          return
        }
        setSuccessMsg(res.message || `Password untuk @${resetTargetUser.username} berhasil di-reset.`)
        setIsResetModalOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mereset password.'
        setErrorMsg(msg)
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus pengguna "${name}" secara permanen?`)) return
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        const res = await deleteUserAction(formData)
        if (!res.success) {
          setErrorMsg(res.message || 'Gagal menghapus pengguna.')
          return
        }
        setSuccessMsg(`Pengguna "${name}" berhasil dihapus.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghapus pengguna.'
        setErrorMsg(msg)
      }
    })
  }

  const handleToggleStatus = (id: string) => {
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        const res = await toggleUserStatusAction(formData)
        if (!res.success) {
          setErrorMsg(res.message || 'Gagal mengubah status.')
          return
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengubah status.'
        setErrorMsg(msg)
      }
    })
  }

  const totalUsers = users.length + 1 // +1 for Master Admin
  const activeUsers = users.filter((u) => u.isActive).length + 1
  const careerNotifUsers = users.filter((u) => u.canReceiveCareerNotif).length + 1

  // Evaluasi kekuatan password untuk visual feedback di modal
  const formPasswordVal = validatePasswordStrength(formPassword)
  const resetPasswordVal = validatePasswordStrength(resetNewPassword)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-900 dark:text-white">
              Manajemen Pengguna & Role
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Atur hak akses menu untuk tiap pengguna, kelola masa berlaku password (3 bulan / 90 hari), dan atur penerima notifikasi karir.
          </p>
        </div>

        {/* TOMBOL TAMBAH PENGGUNA (KHUSUS ADMIN ROOT) */}
        {isRootAdmin ? (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 select-none">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Penambahan Role Dibatasi Khusus Admin Root</span>
          </div>
        )}
      </div>

      {/* ALERT FEEDBACK */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-70 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:opacity-70 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalUsers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Pengguna</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{activeUsers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pengguna Aktif</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{careerNotifUsers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Penerima Notif Karir</div>
          </div>
        </div>
      </div>

      {/* MASTER ADMIN CARD */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-black flex items-center justify-center text-lg shadow-sm shrink-0">
            ROOT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-gray-900 dark:text-white">Administrator Master (Root)</h3>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Root Superadmin
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Username: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">@{masterAdminUsername}</span> · Pemegang hak eksklusif penambahan role dan user baru
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start md:self-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Akses Penuh Semua Menu & Pengaturan Keamanan</span>
        </div>
      </div>

      {/* DAFTAR PENGGUNA CMS TAMBAHAN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Daftar Pengguna Tambahan ({users.length})
          </h2>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Masa aktif password: <strong className="text-amber-600">3 Bulan (90 Hari)</strong> · Peringatan wajib ganti mulai <strong className="text-amber-600">H-7</strong>
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-3">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum ada pengguna tambahan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Administrator Root dapat membuat akun untuk staf rekrutmen HR, editor konten, atau staf operasional dengan hak akses spesifik.
            </p>
            {isRootAdmin && (
              <button
                onClick={openAddModal}
                className="mt-2 px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors cursor-pointer"
              >
                + Tambah Pengguna Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((u) => {
              const expiry = checkPasswordExpiry(u.passwordUpdatedAt, u.createdAt)
              return (
                <div
                  key={u.id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4 transition-all hover:border-amber-500/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-black text-amber-600 dark:text-amber-400 shrink-0 uppercase">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base text-gray-900 dark:text-white">{u.name}</span>
                          <span className="text-xs text-gray-400 font-mono">@{u.username}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {u.role}
                          </span>
                        </div>

                        {/* STATUS PASSWORD & TANGGAL */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>Dibuat: {new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                          <span>·</span>
                          
                          {/* BADGE MASA BERLAKU PASSWORD (POINT 3 & 4) */}
                          {u.mustResetPassword ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              Wajib Ganti Password (Di-reset)
                            </span>
                          ) : expiry.isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              <Clock className="w-3 h-3" />
                              Password Kedaluwarsa (&gt; 3 Bulan)
                            </span>
                          ) : expiry.isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              H-{expiry.daysRemaining} Kedaluwarsa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Password Aktif (Sisa {expiry.daysRemaining} hari)
                            </span>
                          )}

                          <span>·</span>
                          <span className={u.canReceiveCareerNotif ? 'text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1' : 'text-gray-400 flex items-center gap-1'}>
                            <Bell className="w-3.5 h-3.5" />
                            {u.canReceiveCareerNotif ? 'Notif Karir: Aktif' : 'Notif Karir: Non-aktif'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {/* Apple Switch Toggle Akun */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={u.isActive}
                        onClick={() => handleToggleStatus(u.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                          u.isActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        title={u.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                            u.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* TOMBOL RESET PASSWORD USER LAIN (POINT 2) */}
                      <button
                        type="button"
                        onClick={() => openResetModal(u)}
                        className="p-2 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-colors cursor-pointer"
                        title="Reset Password Pengguna Ini"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-amber-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Edit Profil & Hak Akses"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* MENU PERMISSION TAGS */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Akses Menu ({u.permissions?.length || 0} menu):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {u.permissions?.length === 0 ? (
                        <span className="text-xs text-rose-500 font-semibold italic">Tidak memiliki akses ke menu manapun</span>
                      ) : (
                        u.permissions?.map((menuId) => {
                          const meta = AVAILABLE_MENUS.find((m) => m.id === menuId)
                          return (
                            <span
                              key={menuId}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            >
                              {meta?.label || menuId}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL RESET PASSWORD USER LAIN (POINT 2 & 5) */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Reset Password Pengguna
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Target: <strong className="text-gray-900 dark:text-white">{resetTargetUser.name}</strong> (@{resetTargetUser.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* INDIKATOR PERSYARATAN PASSWORD (POINT 5) */}
              <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/70 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Persyaratan Keamanan Password:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 font-medium ${resetPasswordVal.details.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {resetPasswordVal.details.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Minimal 6 Karakter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${resetPasswordVal.details.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {resetPasswordVal.details.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Huruf Besar (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${resetPasswordVal.details.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {resetPasswordVal.details.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Huruf Kecil (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${resetPasswordVal.details.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {resetPasswordVal.details.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Angka (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${resetPasswordVal.details.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {resetPasswordVal.details.hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Simbol (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !resetPasswordVal.isValid || resetNewPassword !== resetConfirmPassword}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Memproses...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {editingUser ? 'Edit Pengguna & Hak Akses' : 'Tambah Pengguna CMS Baru'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tentukan profil dan centang menu apa saja yang diizinkan untuk diakses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="contoh: hr_budi"
                      disabled={!!editingUser}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500 disabled:opacity-50"
                      required
                    />
                  </div>
                  {editingUser && (
                    <span className="text-[10px] text-gray-400">Username tidak dapat diubah setelah dibuat.</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Budi Santoso, S.Psi"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Password {editingUser && <span className="text-[10px] text-gray-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? '••••••••' : 'Min 6 char, kombinasi'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Role / Jabatan</span>
                    {!isRootAdmin && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold lowercase">hanya root admin</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="HR Recruiter / Content Editor / Staff"
                    disabled={!isRootAdmin}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500 disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* INDIKATOR PERSYARATAN PASSWORD */}
              {(!editingUser || formPassword.length > 0) && (
                <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/70 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Persyaratan Keamanan Password:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 font-medium ${formPasswordVal.details.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formPasswordVal.details.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Minimal 6 Karakter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${formPasswordVal.details.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formPasswordVal.details.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Huruf Besar (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${formPasswordVal.details.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formPasswordVal.details.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Huruf Kecil (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${formPasswordVal.details.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formPasswordVal.details.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Angka (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${formPasswordVal.details.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {formPasswordVal.details.hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Simbol (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* IZIN NOTIFIKASI KARIR */}
              <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/20 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formCanNotif}
                    onChange={(e) => setFormCanNotif(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      Izinkan Menerima Notifikasi Karir & Lamaran
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Hanya pengguna yang dipilih yang akan melihat badge merah dan lonceng notifikasi setiap kali ada kandidat yang melamar lowongan kerja.
                    </p>
                  </div>
                </label>
              </div>

              {/* STATUS AKTIF */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Akun Aktif</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    formIsActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    {formIsActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formIsActive}
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      formIsActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        formIsActive ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* CHECKLIST HAK AKSES MENU */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Hak Akses Menu Website ({formPermissions.length} dipilih)</span>
                  </label>
                  {isRootAdmin ? (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-gray-400 hover:underline font-bold cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Hanya root admin</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  {AVAILABLE_MENUS.map((menu) => {
                    const isChecked = formPermissions.includes(menu.id)
                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          !isRootAdmin ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isChecked 
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs' 
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!isRootAdmin}
                          onChange={() => togglePermission(menu.id)}
                          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span>{menu.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Buat Pengguna')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
