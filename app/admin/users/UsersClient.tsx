// app/admin/users/UsersClient.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Lock,
  User,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  UserX,
  RefreshCw
} from 'lucide-react'
import { AVAILABLE_MENUS } from '@/lib/menus'
import { checkPasswordExpiry, DEFAULT_ADMIN_SET_PASSWORD } from '@/lib/password'
import type { ActiveSessionRecord } from '@/lib/db'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
  kickUserSessionAction
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
  skipPasswordExpiry?: boolean
}

interface UsersClientProps {
  users: CmsUserDisplay[]
  masterAdminUsername: string
  isRootAdmin: boolean
  isSuperadmin?: boolean
  currentUserId: string
  activeSessions?: Record<string, ActiveSessionRecord>
  serverTimestamp?: number
}

const SESSION_ONLINE_WINDOW_MS = 30 * 60 * 1000 // 30 menit

function parseUserAgentSimple(ua: string): string {
  if (!ua) return 'Perangkat Tidak Diketahui'
  let browser = 'Browser'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Firefox/')) browser = 'Firefox'

  let os = 'OS'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return `${browser} (${os})`
}

function isRoleAdminOrSuperadmin(role: string): boolean {
  const r = (role || '').toLowerCase().trim()
  return r === 'admin' || r === 'administrator' || r === 'superadmin' || r === 'superadministrator' || r === 'administrator master' || r === 'root admin'
}

export default function UsersClient({
  users,
  masterAdminUsername,
  isRootAdmin,
  isSuperadmin = false,
  currentUserId,
  activeSessions = {},
  serverTimestamp = 0
}: UsersClientProps) {
  const router = useRouter()
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
  const [formSkipPasswordExpiry, setFormSkipPasswordExpiry] = useState(false)
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
    setFormPassword('4sinergiutama2026!')
    setFormRole('Staff')
    setFormCanNotif(false)
    setFormIsActive(true)
    setFormSkipPasswordExpiry(false)
    setFormPermissions(['career', 'applications'])
    setShowPassword(false)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const isFormRoleAdmin = isRoleAdminOrSuperadmin(formRole)

  const handleRoleChange = (newRole: string) => {
    setFormRole(newRole)
    const isNewRoleAdmin = isRoleAdminOrSuperadmin(newRole)
    if (!isNewRoleAdmin) {
      setFormPermissions((prev) => prev.filter((p) => p !== 'users'))
    }
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
    setFormSkipPasswordExpiry(Boolean(user.skipPasswordExpiry))
    const isUserRoleAdmin = isRoleAdminOrSuperadmin(user.role)
    const sanitizedPermissions = isUserRoleAdmin
      ? (user.permissions || [])
      : (user.permissions || []).filter((p) => p !== 'users' && p !== 'seo')
    setFormPermissions(sanitizedPermissions)
    setShowPassword(false)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // Buka modal reset password user lain
  const openResetModal = (user: CmsUserDisplay) => {
    setResetTargetUser(user)
    setResetNewPassword('4sinergiutama2026!')
    setResetConfirmPassword('4sinergiutama2026!')
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
    setFormPermissions(AVAILABLE_MENUS.filter((m) => m.id !== 'users' && m.id !== 'seo').map((m) => m.id))
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

    const formData = new FormData()
    if (editingUser) {
      formData.set('id', editingUser.id)
    }
    formData.set('username', formUsername)
    formData.set('name', formName)
    formData.set('password', formPassword)
    formData.set('role', formRole)
    // Otomatis aktif jika hak akses menu memilih karir & lowongan ('career')
    formData.set('canReceiveCareerNotif', formPermissions.includes('career') ? 'on' : 'off')
    formData.set('isActive', formIsActive ? 'true' : 'false')
    formData.set('skipPasswordExpiry', formSkipPasswordExpiry ? 'true' : 'false')

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

    if (!resetNewPassword) {
      setErrorMsg('Password baru wajib diisi.')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password baru.')
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

  const [currentTimestamp, setCurrentTimestamp] = useState(() => serverTimestamp || 0)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTimestamp(Date.now()), 15000)
    return () => clearInterval(interval)
  }, [])

  const handleKickUser = (targetUserId: string, targetName: string) => {
    if (!confirm(`Putuskan paksa (Kick) sesi login untuk "${targetName}"? Pengguna tersebut akan langsung dikeluarkan dari halaman CMS.`)) return
    setErrorMsg('')
    setSuccessMsg('')
    const formData = new FormData()
    formData.set('targetUserId', targetUserId)
    startTransition(async () => {
      try {
        const res = await kickUserSessionAction(formData)
        if (!res.success) {
          setErrorMsg(res.message || 'Gagal meng-kick sesi pengguna.')
          return
        }
        setSuccessMsg(res.message || `Sesi pengguna "${targetName}" berhasil dihentikan paksa.`)
        setCurrentTimestamp(Date.now())
        router.refresh()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal meng-kick sesi pengguna.'
        setErrorMsg(msg)
      }
    })
  }

  const getSessionStatus = (userId: string) => {
    const sess = activeSessions[userId]
    if (!sess) return { isLoggedIn: false, isOnline: false, session: null }
    const isOnline = currentTimestamp - sess.lastSeen < SESSION_ONLINE_WINDOW_MS
    return { isLoggedIn: true, isOnline, session: sess }
  }

  const totalUsers = users.length // Administrator Master & Superadmin dikecualikan dari perhitungan akun terdaftar
  const activeUsers = users.filter((u) => u.isActive).length
  const adminSessionStatus = getSessionStatus('admin')
  const onlineBelowSuperadminCount =
    (adminSessionStatus.isLoggedIn ? 1 : 0) +
    users.filter((u) => getSessionStatus(u.id).isLoggedIn).length


  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* HEADER SECTION — BERSIH TANPA BADGE TEMPLATE (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Kontrol Pengguna & Sesi Aktif
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola akun pengguna.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentTimestamp(Date.now())
              router.refresh()
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181B26] border border-gray-300 dark:border-[#222736] text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-[#202534] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {isRootAdmin ? (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Penambahan akun khusus Admin Root
            </span>
          )}
        </div>
      </div>

      {/* ALERT FEEDBACK */}
      {successMsg && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-70 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="px-4 py-3 rounded-lg bg-rose-500/10 border-l-4 border-rose-500 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:opacity-70 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* RINGKASAN METRIK — 3 STRIP BERSIH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 dark:border-[#222736] rounded-xl bg-white dark:bg-[#13161F] divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-[#222736]">
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Akun Terdaftar</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{totalUsers}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Status Akun Aktif</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{activeUsers}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Sesi Login</div>
          <div className="text-xl font-black text-black dark:text-white mt-0.5 tabular-nums">{onlineBelowSuperadminCount}</div>
        </div>
      </div>

      {/* TABEL TERPADU: DAFTAR PENGGUNA & SESI KONEKSI AKTIF */}
      <div className="border border-gray-200 dark:border-[#222736] rounded-xl bg-white dark:bg-[#13161F] overflow-hidden shadow-xs">
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/70 dark:bg-[#171B26]">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Daftar Pengguna & Sesi Aktif
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola akun pengguna, hak akses menu, dan pantau sesi koneksi real-time dalam satu tabel terpadu.
            </p>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
            <span>Sesi Aktif: <strong className="text-gray-900 dark:text-white font-bold">{onlineBelowSuperadminCount}</strong> Sesi Online</span>
            <span>·</span>
            <span>Siklus Password: 90 Hari</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 min-w-[200px]">Pengguna & Peran</th>
                <th className="px-4 py-3 min-w-[210px]">Sesi & Perangkat</th>
                <th className="px-4 py-3 min-w-[170px]">Keamanan & Password</th>
                <th className="px-4 py-3 min-w-[100px]">Status Akun</th>
                <th className="px-4 py-3 text-right min-w-[130px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {/* 1. Baris Administrator Master (@admin) */}
              <tr className="hover:bg-gray-50/60 dark:hover:bg-[#181C28] transition-colors">
                <td className="px-4 py-3.5 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                        AD
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#13161F] ${adminSessionStatus.isLoggedIn
                          ? adminSessionStatus.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                          : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        title={adminSessionStatus.isLoggedIn ? (adminSessionStatus.isOnline ? 'Online' : 'Login (Idle)') : 'Offline'}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        Administrator Master
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                        <span>@{masterAdminUsername}</span>
                        <span>·</span>
                        <span className="font-sans font-medium text-gray-600 dark:text-gray-300">Admin Master</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  {adminSessionStatus.session ? (
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${adminSessionStatus.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                          {adminSessionStatus.isOnline ? 'Online' : 'Login (Idle)'}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{adminSessionStatus.session.ip}</span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate max-w-[210px]" title={adminSessionStatus.session.userAgent}>
                        {parseUserAgentSimple(adminSessionStatus.session.userAgent)}
                      </div>
                      <div className="text-[10px] text-gray-400" suppressHydrationWarning>
                        Masuk: {new Date(adminSessionStatus.session.loggedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · Aktif: {new Date(adminSessionStatus.session.lastSeen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400">Offline</div>
                  )}
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <div className="space-y-0.5 text-[11px]">
                    <div className="text-gray-600 dark:text-gray-300 font-medium">
                      Bebas Siklus (Permanen)
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Akun Sistem Utama
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                    Aktif
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle text-right">
                  {isSuperadmin && adminSessionStatus.isLoggedIn ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleKickUser('admin', 'Administrator Master (@admin)')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-900/30 transition-colors cursor-pointer disabled:opacity-50"
                      title="Putuskan Sesi Login (Kick)"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Kick</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Sistem Utama</span>
                  )}
                </td>
              </tr>

              {/* 2. Baris Akun Pengguna Tambahan */}
              {users.map((u) => {
                const st = getSessionStatus(u.id)
                const expiry = checkPasswordExpiry(u.passwordUpdatedAt, u.createdAt)

                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-[#181C28] transition-colors">
                    {/* Pengguna & Peran */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#13161F] ${st.isLoggedIn
                              ? st.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                              : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            title={st.isLoggedIn ? (st.isOnline ? 'Online' : 'Login (Idle)') : 'Offline'}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white truncate">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                            <span>@{u.username}</span>
                            <span>·</span>
                            <span className="font-sans font-medium text-gray-600 dark:text-gray-300">{u.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sesi & Perangkat */}
                    <td className="px-4 py-3.5 align-middle">
                      {st.session ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold ${st.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                              {st.isOnline ? 'Online' : 'Login (Idle)'}
                            </span>
                            <span>·</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300">{st.session.ip}</span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-[10px] truncate max-w-[210px]" title={st.session.userAgent}>
                            {parseUserAgentSimple(st.session.userAgent)}
                          </div>
                          <div className="text-[10px] text-gray-400" suppressHydrationWarning>
                            Masuk: {new Date(st.session.loggedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · Aktif: {new Date(st.session.lastSeen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Offline</div>
                      )}
                    </td>

                    {/* Keamanan & Password */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="space-y-0.5 text-[11px]">
                        {u.mustResetPassword ? (
                          <div className="text-rose-600 dark:text-rose-400 font-semibold">
                            Wajib Reset Saat Login
                          </div>
                        ) : u.skipPasswordExpiry ? (
                          <div className="text-gray-600 dark:text-gray-300 font-medium">
                            Bebas Siklus (Permanen)
                          </div>
                        ) : expiry.isExpired ? (
                          <div className="text-rose-600 dark:text-rose-400 font-semibold">
                            Kedaluwarsa (&gt;90 hari)
                          </div>
                        ) : expiry.isWarning ? (
                          <div className="text-black dark:text-white font-bold">
                            Kedaluwarsa dlm {expiry.daysRemaining} hari
                          </div>
                        ) : (
                          <div className="text-gray-600 dark:text-gray-300">
                            Sisa {expiry.daysRemaining} hari
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400" suppressHydrationWarning>
                          Terdaftar: {new Date(u.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </td>

                    {/* Status Akun */}
                    <td className="px-4 py-3.5 align-middle">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={u.isActive}
                        onClick={() => handleToggleStatus(u.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${u.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        title={u.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${u.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1 shrink-0">
                        {isSuperadmin && st.isLoggedIn && currentUserId !== u.id && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleKickUser(u.id, `${u.name} (@${u.username})`)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                            title="Putuskan Sesi Login (Kick)"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openResetModal(u)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Edit Akun & Hak Akses"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RESET PASSWORD USER LAIN (POINT 2 & 5) */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Password Baru
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetNewPassword(DEFAULT_ADMIN_SET_PASSWORD)
                      setResetConfirmPassword(DEFAULT_ADMIN_SET_PASSWORD)
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Default
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                    required
                  />
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
                  disabled={isPending || !resetNewPassword || resetNewPassword !== resetConfirmPassword}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 disabled:opacity-50"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Password {editingUser && <span className="text-[10px] text-gray-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormPassword(DEFAULT_ADMIN_SET_PASSWORD)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Default
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? '••••••••' : 'Password pengguna...'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
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
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 font-bold lowercase">hanya root admin</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    placeholder="HR Recruiter / Content Editor / Staff"
                    disabled={!isRootAdmin}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* OPSI & STATUS AKUN (1 BAGIAN TERPADU) */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/70 divide-y divide-gray-200/60 dark:divide-gray-800/60 overflow-hidden">
                {/* Status Akun Aktif */}
                <div className="flex items-center justify-between p-3.5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Status Akun Aktif</div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Pengguna nonaktif tidak dapat masuk ke sistem.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${formIsActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'
                      }`}>
                      {formIsActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formIsActive}
                      onClick={() => setFormIsActive(!formIsActive)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${formIsActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${formIsActive ? 'translate-x-7' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Bebaskan Siklus Ganti Password 90 Hari */}
                <div className="p-3.5 hover:bg-gray-100/40 dark:hover:bg-gray-900/40 transition-colors">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSkipPasswordExpiry}
                      onChange={(e) => setFormSkipPasswordExpiry(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 accent-blue-600 cursor-pointer focus:ring-blue-500/20"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Bebaskan dari Siklus Ganti Password 90 Hari
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        Jika diaktifkan, akun ini tidak wajib mengganti password setiap 90 hari (password permanen).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* CHECKLIST HAK AKSES MENU */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>Hak Akses Menu Website ({formPermissions.length} dipilih)</span>
                    </label>
                    {isRootAdmin ? (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={selectAllPermissions}
                          className="text-black dark:text-white hover:underline font-bold cursor-pointer"
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
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    *Notifikasi penerimaan pelamar karir otomatis aktif untuk akun yang diberikan hak akses menu Karir &amp; Lowongan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  {AVAILABLE_MENUS.filter((menu) => menu.id !== 'users' && menu.id !== 'seo').map((menu) => {
                    const isChecked = formPermissions.includes(menu.id)
                    const isDisabled = !isRootAdmin
                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${isChecked
                            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white shadow-xs'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => togglePermission(menu.id)}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="truncate">{menu.label}</span>
                        </div>
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
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
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
