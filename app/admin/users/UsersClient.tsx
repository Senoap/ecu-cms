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
  XCircle,
  Eye,
  EyeOff,
  UserX,
  RefreshCw
} from 'lucide-react'
import { AVAILABLE_MENUS } from '@/lib/menus'
import { checkPasswordExpiry, validatePasswordStrength } from '@/lib/password'
import { useSmartViewport } from '@/components/SmartViewportProvider'
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

  const totalUsers = users.length + 2 // +2 for Superadmin & Master Admin
  const activeUsers = users.filter((u) => u.isActive).length + 2
  const careerNotifUsers = users.filter((u) => u.canReceiveCareerNotif).length + 1
  const adminSessionStatus = getSessionStatus('admin')
  const onlineBelowSuperadminCount =
    (adminSessionStatus.isLoggedIn ? 1 : 0) +
    users.filter((u) => getSessionStatus(u.id).isLoggedIn).length

  // Evaluasi kekuatan password untuk visual feedback di modal
  const formPasswordVal = validatePasswordStrength(formPassword)
  const resetPasswordVal = validatePasswordStrength(resetNewPassword)
  const { isQuadSplit } = useSmartViewport()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER SECTION — BERSIH TANPA BADGE TEMPLATE */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {isSuperadmin ? 'Otoritas Kontrol Tertinggi · Superadmin' : 'Sistem Otorisasi & Akses Halaman CMS'}
          </p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white mt-0.5">
            Kontrol Pengguna & Sesi Aktif
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola akun pengguna, pantau sesi login langsung, putuskan koneksi (kick), dan atur hak akses menu halaman CMS.
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
            <span>Segarkan Data</span>
          </button>

          {isRootAdmin ? (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
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

      {/* RINGKASAN METRIK — STRIP BERSIH TANPA KARTU AI TEMPLATE */}
      <div className={`grid border border-gray-200 dark:border-[#222736] rounded-xl bg-white dark:bg-[#13161F] divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-[#222736] ${
        isQuadSplit ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
      }`}>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Akun Terdaftar</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{totalUsers}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Status Akun Aktif</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{activeUsers}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Sesi Login Di Bawah Superadmin</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{onlineBelowSuperadminCount}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Penerima Notifikasi Karir</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{careerNotifUsers}</div>
        </div>
      </div>

      {/* PANEL MONITORING SESI LOGIN & ONLINE (TABEL DIREKTORI LANGSUNG TANPA BADGE) */}
      <div className="border border-gray-200 dark:border-[#222736] rounded-xl bg-white dark:bg-[#13161F] overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/70 dark:bg-[#171B26]">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Daftar Sesi Login & Koneksi Aktif
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Daftar real-time akun di bawah Superadmin beserta status koneksi, alamat IP, perangkat, dan kontrol pemutusan sesi (Kick).
            </p>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
            Aktif: {onlineBelowSuperadminCount} dari {users.length + 1} akun
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {/* 1. Baris Administrator Master (@admin) */}
          <div className="px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#181C28] transition-colors">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  adminSessionStatus.isLoggedIn
                    ? adminSessionStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`} />
                <span className="font-bold text-gray-900 dark:text-white">Administrator Master</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">@{masterAdminUsername}</span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Admin Master</span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className={`text-xs font-semibold ${
                  adminSessionStatus.isLoggedIn
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {adminSessionStatus.isLoggedIn
                    ? adminSessionStatus.isOnline ? 'Online' : 'Login (Idle)'
                    : 'Offline'}
                </span>
              </div>

              {adminSessionStatus.session ? (
                <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pl-3.5">
                  <span>IP: <strong className="font-mono text-gray-800 dark:text-gray-200">{adminSessionStatus.session.ip}</strong></span>
                  <span>·</span>
                  <span suppressHydrationWarning>Masuk: {new Date(adminSessionStatus.session.loggedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>·</span>
                  <span suppressHydrationWarning>Aktivitas: {new Date(adminSessionStatus.session.lastSeen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="block w-full text-[10px] text-gray-400 truncate max-w-full" title={adminSessionStatus.session.userAgent}>
                    Perangkat: {adminSessionStatus.session.userAgent}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 pl-3.5">Tidak ada sesi login yang sedang berlangsung.</p>
              )}
            </div>

            {isSuperadmin && adminSessionStatus.isLoggedIn && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleKickUser('admin', 'Administrator Master (@admin)')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 self-start sm:self-center disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Kick Sesi</span>
              </button>
            )}
          </div>

          {/* 2. Baris Setiap Pengguna CMS */}
          {users.map((u) => {
            const st = getSessionStatus(u.id)
            return (
              <div
                key={`sess-${u.id}`}
                className="px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      st.isLoggedIn
                        ? st.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                    <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">@{u.username}</span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{u.role}</span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className={`text-xs font-semibold ${
                      st.isLoggedIn
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {st.isLoggedIn
                        ? st.isOnline ? 'Online' : 'Login (Idle)'
                        : 'Offline'}
                    </span>
                  </div>

                  {st.session ? (
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pl-3.5">
                      <span>IP: <strong className="font-mono text-gray-800 dark:text-gray-200">{st.session.ip}</strong></span>
                      <span>·</span>
                      <span suppressHydrationWarning>Masuk: {new Date(st.session.loggedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span suppressHydrationWarning>Aktivitas: {new Date(st.session.lastSeen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="block w-full text-[10px] text-gray-400 truncate max-w-full" title={st.session.userAgent}>
                        Perangkat: {st.session.userAgent}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 pl-3.5">Tidak ada sesi login yang sedang berlangsung.</p>
                  )}
                </div>

                {isSuperadmin && st.isLoggedIn && currentUserId !== u.id && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleKickUser(u.id, `${u.name} (@${u.username})`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 self-start sm:self-center disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Kick Sesi</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* STRUKTUR OTORITAS UTAMA (SUPERADMIN & ADMIN MASTER) — TANPA BADGE */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/90 divide-y divide-gray-200 dark:divide-gray-800">
        <div className="px-4 sm:px-5 py-3 bg-gray-50/70 dark:bg-gray-950/50">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Struktur Akun Sistem Utama
          </h2>
        </div>

        <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">
              Super Administrator <span className="font-mono font-normal text-gray-500 dark:text-gray-400 ml-1">@superadmin</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">
              Otoritas tertinggi di atas Admin Master. Hanya memiliki akses ke halaman Kontrol Pengguna, pemantauan sesi online, dan pemutusan sesi (kick).
            </p>
          </div>
          <div className="text-gray-500 dark:text-gray-400 font-medium shrink-0">
            Lingkup: Khusus Kontrol User
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">
              Administrator Master <span className="font-mono font-normal text-gray-500 dark:text-gray-400 ml-1">@{masterAdminUsername}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">
              Pemegang akses penuh seluruh modul konten CMS dan publikasi draft website utama.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Lingkup: Seluruh Modul CMS</span>
            {isSuperadmin && adminSessionStatus.isLoggedIn && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleKickUser('admin', 'Administrator Master (@admin)')}
                className="px-2.5 py-1 rounded text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors cursor-pointer"
              >
                Kick Sesi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DAFTAR PENGGUNA CMS TAMBAHAN — BERSIH TANPA BADGE PILL */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/90 overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/70 dark:bg-gray-950/50">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Daftar Akun Staf & Editor ({users.length})
          </h2>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Siklus password: 90 Hari (peringatan mulai H-7)
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum ada akun staf tambahan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Tambahkan akun staf HR, rekrutmen, atau editor konten dengan hak akses menu yang terukur.
            </p>
            {isRootAdmin && (
              <button
                onClick={openAddModal}
                className="mt-2 px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
              >
                + Tambah Akun Baru
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((u) => {
              const expiry = checkPasswordExpiry(u.passwordUpdatedAt, u.createdAt)
              const userSess = getSessionStatus(u.id)
              const accessibleMenuLabels = (u.permissions || [])
                .map((menuId) => AVAILABLE_MENUS.find((m) => m.id === menuId)?.label || menuId)
                .join(', ')

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 space-y-3 hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{u.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">@{u.username}</span>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{u.role}</span>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className={`text-xs font-semibold ${
                          userSess.isLoggedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}>
                          {userSess.isLoggedIn ? (userSess.isOnline ? 'Online' : 'Sedang Login') : 'Offline'}
                        </span>
                      </div>

                      {/* STATUS PASSWORD & NOTIFIKASI TANPA BADGE */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span suppressHydrationWarning>Terdaftar: {new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                        <span>·</span>
                        {u.mustResetPassword ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Status Password: Wajib Ganti Saat Login
                          </span>
                        ) : expiry.isExpired ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Status Password: Kedaluwarsa (&gt; 90 Hari)
                          </span>
                        ) : expiry.isWarning ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            Status Password: Kedaluwarsa dalam {expiry.daysRemaining} hari
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300">
                            Masa Aktif Password: Sisa {expiry.daysRemaining} hari
                          </span>
                        )}
                        <span>·</span>
                        <span>
                          Notifikasi Lamaran Karir: <strong className={u.canReceiveCareerNotif ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{u.canReceiveCareerNotif ? 'Aktif' : 'Nonaktif'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start shrink-0">
                      {/* Switch Status Akun */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={u.isActive}
                        onClick={() => handleToggleStatus(u.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          u.isActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        title={u.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                            u.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {isSuperadmin && userSess.isLoggedIn && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleKickUser(u.id, `${u.name} (@${u.username})`)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Putuskan Sesi Login Pengguna Ini"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Kick</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openResetModal(u)}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Edit Akun & Hak Akses"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* DAFTAR AKSES MENU DALAM TEKS BERSIH TANPA BADGE */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Hak Akses Modul ({u.permissions?.length || 0}):{' '}
                    </span>
                    {u.permissions?.length === 0 ? (
                      <span className="text-rose-500 italic">Tidak ada modul yang diizinkan</span>
                    ) : (
                      <span>{accessibleMenuLabels}</span>
                    )}
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
