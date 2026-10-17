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
  ShieldAlert
} from 'lucide-react'
import { AVAILABLE_MENUS } from '@/lib/menus'
import { createUserAction, updateUserAction, deleteUserAction, toggleUserStatusAction } from './actions'

export interface CmsUserDisplay {
  id: string
  username: string
  name: string
  role: string
  permissions: string[]
  canReceiveCareerNotif: boolean
  isActive: boolean
  createdAt: number
}

interface UsersClientProps {
  users: CmsUserDisplay[]
  masterAdminUsername: string
}

export default function UsersClient({ users, masterAdminUsername }: UsersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<CmsUserDisplay | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State form modal
  const [formUsername, setFormUsername] = useState('')
  const [formName, setFormName] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('Staff')
  const [formCanNotif, setFormCanNotif] = useState(false)
  const [formIsActive, setFormIsActive] = useState(true)
  const [formPermissions, setFormPermissions] = useState<string[]>([])

  const openAddModal = () => {
    setEditingUser(null)
    setFormUsername('')
    setFormName('')
    setFormPassword('')
    setFormRole('Staff')
    setFormCanNotif(false)
    setFormIsActive(true)
    setFormPermissions(['career', 'applications'])
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (user: CmsUserDisplay) => {
    setEditingUser(user)
    setFormUsername(user.username)
    setFormName(user.name)
    setFormPassword('')
    setFormRole(user.role)
    setFormCanNotif(user.canReceiveCareerNotif)
    setFormIsActive(user.isActive)
    setFormPermissions(user.permissions || [])
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const togglePermission = (menuId: string) => {
    setFormPermissions((prev) => 
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    )
  }

  const selectAllPermissions = () => {
    setFormPermissions(AVAILABLE_MENUS.map((m) => m.id))
  }

  const clearAllPermissions = () => {
    setFormPermissions([])
  }

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
    formData.set('canReceiveCareerNotif', formCanNotif ? 'on' : 'off')
    formData.set('isActive', formIsActive ? 'true' : 'false')

    formPermissions.forEach((perm) => {
      formData.set(`perm_${perm}`, 'on')
    })

    startTransition(async () => {
      try {
        if (editingUser) {
          await updateUserAction(formData)
          setSuccessMsg(`Data pengguna "${formName}" berhasil diperbarui.`)
        } else {
          await createUserAction(formData)
          setSuccessMsg(`Pengguna baru "${formName}" berhasil dibuat.`)
        }
        setIsModalOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
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
        await deleteUserAction(formData)
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
        await toggleUserStatusAction(formData)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengubah status.'
        setErrorMsg(msg)
      }
    })
  }

  const totalUsers = users.length + 1 // +1 for Master Admin
  const activeUsers = users.filter((u) => u.isActive).length + 1
  const careerNotifUsers = users.filter((u) => u.canReceiveCareerNotif).length + 1

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
            Atur hak akses menu untuk tiap pengguna dan tentukan siapa saja yang berhak melihat notifikasi karir.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* ALERT FEEDBACK */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
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
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-600/5 to-transparent dark:bg-amber-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
            ADM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-gray-900 dark:text-white">Administrator Master</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-gray-950">
                Superadmin
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Username: <span className="font-mono font-bold text-amber-700 dark:text-amber-400">@{masterAdminUsername}</span> · Terotentikasi via Environment Variable (<code className="font-mono">ADMIN_PASSWORD</code>)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start md:self-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Akses Penuh Semua Menu & Notifikasi</span>
        </div>
      </div>

      {/* DAFTAR PENGGUNA CMS TAMBAHAN */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Daftar Pengguna Tambahan ({users.length})
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-3">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum ada pengguna tambahan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Administrator dapat membuat akun untuk staf rekrutmen HR, editor konten, atau staf operasional dengan hak akses spesifik.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors cursor-pointer"
            >
              + Tambah Pengguna Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((u) => (
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
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-900 dark:text-white">{u.name}</span>
                        <span className="text-xs text-gray-400 font-mono">@{u.username}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {u.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Dibuat: {new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                        <span>·</span>
                        <span className={u.canReceiveCareerNotif ? 'text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1' : 'text-gray-400 flex items-center gap-1'}>
                          <Bell className="w-3.5 h-3.5" />
                          {u.canReceiveCareerNotif ? 'Notif Karir: Aktif' : 'Notif Karir: Non-aktif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-gray-200'
                      }`}
                      title={u.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                    >
                      {u.isActive ? '● Aktif' : '○ Non-aktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-amber-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                      title="Edit Pengguna & Hak Akses"
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
            ))}
          </div>
        )}
      </div>

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
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? '••••••••' : 'Minimal 5 karakter'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                      required={!editingUser}
                      minLength={5}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Role / Jabatan
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="HR Recruiter / Content Editor / Staff"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* IZIN NOTIFIKASI KARIR (POINT 3) */}
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
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Akun Aktif</span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer transition-colors ${
                    formIsActive 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {formIsActive ? 'AKTIF' : 'NON-AKTIF'}
                </button>
              </div>

              {/* CHECKLIST HAK AKSES MENU (POINT 1) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span>Hak Akses Menu Website ({formPermissions.length} dipilih)</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-bold"
                    >
                      Pilih Semua
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-gray-400 hover:underline font-bold"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                  {AVAILABLE_MENUS.map((menu) => {
                    const isChecked = formPermissions.includes(menu.id)
                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs' 
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(menu.id)}
                          className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
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
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
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
