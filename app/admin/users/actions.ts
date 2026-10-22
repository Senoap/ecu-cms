// app/admin/users/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth'
import { readDB, writeDB, addNotification, type CmsUser } from '@/lib/db'
import { hashPassword, validatePasswordStrength } from '@/lib/password'

export type UserActionResult = {
  success: boolean
  message?: string
}

/**
 * Membuat pengguna baru.
 * Khusus diperbolehkan untuk user Admin Root.
 * Pengguna tambahan (walaupun memiliki role admin) tidak dapat menambahkan role/pengguna baru.
 */
export async function createUserAction(formData: FormData): Promise<UserActionResult> {
  try {
    const currentUser = await requirePermission('users')

    // Aturan 1: Khusus user admin root yang bisa menambahkan role/pengguna baru
    if (!currentUser.isRootAdmin) {
      return { 
        success: false, 
        message: 'Akses ditolak: Hanya Administrator Root yang memiliki wewenang untuk menambahkan role atau pengguna baru.' 
      }
    }

    const username = String(formData.get('username') ?? '').trim().toLowerCase()
    const name = String(formData.get('name') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const role = String(formData.get('role') ?? '').trim() || 'Staff'
    const canReceiveCareerNotif = formData.get('canReceiveCareerNotif') === 'on' || formData.get('canReceiveCareerNotif') === 'true'
    const isActive = formData.get('isActive') !== 'false'

    // Ambil semua permission yang dicentang
    const permissions: string[] = []
    for (const [key, val] of formData.entries()) {
      if (key.startsWith('perm_') && (val === 'on' || val === 'true')) {
        permissions.push(key.replace('perm_', ''))
      }
    }

    if (!username || username.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter.' }
    }
    if (!name) {
      return { success: false, message: 'Nama pengguna wajib diisi.' }
    }

    // Validasi kekuatan password: min 6 char, uppercase, lowercase, number, symbol
    const passwordVal = validatePasswordStrength(password)
    if (!passwordVal.isValid) {
      return { success: false, message: passwordVal.errors.join(' ') }
    }

    const db = await readDB()
    if (!db.cmsUsers) db.cmsUsers = []

    // Cegah duplikasi username
    if (db.cmsUsers.some((u) => u.username.toLowerCase() === username) || username === 'admin') {
      return { success: false, message: `Username "${username}" sudah digunakan. Silakan gunakan username lain.` }
    }

    const now = Date.now()
    const newUser: CmsUser = {
      id: 'usr-' + now + '-' + Math.random().toString(36).substring(2, 6),
      username,
      passwordHash: hashPassword(password),
      name,
      role,
      permissions,
      canReceiveCareerNotif,
      isActive,
      createdAt: now,
      passwordUpdatedAt: now,
      mustResetPassword: false,
    }

    db.cmsUsers.push(newUser)
    await writeDB(db)
    await addNotification(`Menambahkan pengguna CMS baru: "${name}" (@${username}) dengan role "${role}".`, 'CREATE')

    revalidatePath('/admin/users')
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat membuat pengguna.'
    return { success: false, message: msg }
  }
}

/**
 * Memperbarui data profil pengguna atau hak akses.
 */
export async function updateUserAction(formData: FormData): Promise<UserActionResult> {
  try {
    const currentUser = await requirePermission('users')

    const id = String(formData.get('id') ?? '')
    const name = String(formData.get('name') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const inputRole = String(formData.get('role') ?? '').trim()
    const canReceiveCareerNotif = formData.get('canReceiveCareerNotif') === 'on' || formData.get('canReceiveCareerNotif') === 'true'
    const isActive = formData.get('isActive') !== 'false'

    const permissions: string[] = []
    for (const [key, val] of formData.entries()) {
      if (key.startsWith('perm_') && (val === 'on' || val === 'true')) {
        permissions.push(key.replace('perm_', ''))
      }
    }

    const db = await readDB()
    if (!db.cmsUsers) db.cmsUsers = []

    const index = db.cmsUsers.findIndex((u) => u.id === id)
    if (index === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan.' }
    }

    const existing = db.cmsUsers[index]

    // Jika bukan Admin Root, role dan permissions tidak boleh diubah
    const finalRole = currentUser.isRootAdmin ? (inputRole || existing.role) : existing.role
    const finalPermissions = currentUser.isRootAdmin ? permissions : existing.permissions

    const updatedUser: CmsUser = {
      ...existing,
      name: name || existing.name,
      role: finalRole,
      permissions: finalPermissions,
      canReceiveCareerNotif,
      isActive,
    }

    if (password && password.trim().length > 0) {
      const passwordVal = validatePasswordStrength(password.trim())
      if (!passwordVal.isValid) {
        return { success: false, message: passwordVal.errors.join(' ') }
      }
      updatedUser.passwordHash = hashPassword(password.trim())
      updatedUser.passwordUpdatedAt = Date.now()
      updatedUser.mustResetPassword = false
    }

    db.cmsUsers[index] = updatedUser
    await writeDB(db)
    await addNotification(`Memperbarui data pengguna CMS: "${updatedUser.name}".`, 'UPDATE')

    revalidatePath('/admin/users')
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memperbarui pengguna.'
    return { success: false, message: msg }
  }
}

/**
 * Reset password pengguna lain selain user admin master/root.
 * Memvalidasi kekuatan password baru, mencatat passwordUpdatedAt, 
 * dan mencabut sesi aktif target agar harus login ulang.
 */
export async function resetUserPasswordAction(formData: FormData): Promise<UserActionResult> {
  try {
    const currentUser = await requirePermission('users')

    const targetUserId = String(formData.get('userId') ?? '')
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (!targetUserId) {
      return { success: false, message: 'ID pengguna tidak valid.' }
    }

    // Aturan 2: Reset password khusus untuk user lain selain user admin (root master)
    if (targetUserId === 'admin') {
      return { 
        success: false, 
        message: 'Password Administrator Master tidak dapat di-reset melalui menu ini (dikelola langsung melalui sistem/environment).' 
      }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Konfirmasi password baru tidak cocok.' }
    }

    // Validasi kekuatan password: min 6 char, uppercase, lowercase, number, symbol
    const passwordVal = validatePasswordStrength(newPassword)
    if (!passwordVal.isValid) {
      return { success: false, message: passwordVal.errors.join(' ') }
    }

    const db = await readDB()
    if (!db.cmsUsers) return { success: false, message: 'Tidak ada data pengguna terdaftar.' }

    const targetIndex = db.cmsUsers.findIndex((u) => u.id === targetUserId)
    if (targetIndex === -1) {
      return { success: false, message: 'Pengguna target tidak ditemukan.' }
    }

    const targetUser = db.cmsUsers[targetIndex]
    const now = Date.now()

    targetUser.passwordHash = hashPassword(newPassword)
    targetUser.passwordUpdatedAt = now
    targetUser.mustResetPassword = true // Pengguna wajib mengganti password atau verifikasi saat login

    // Cabut sesi aktif pengguna target agar harus login ulang dengan password baru
    if (db.activeSessions && db.activeSessions[targetUserId]) {
      delete db.activeSessions[targetUserId]
    }

    db.cmsUsers[targetIndex] = targetUser
    await writeDB(db)

    await addNotification(
      `Password pengguna "${targetUser.name}" (@${targetUser.username}) telah di-reset oleh ${currentUser.name}.`,
      'UPDATE',
      'system',
      { userName: currentUser.name, userRole: currentUser.role }
    )

    revalidatePath('/admin/users')
    return { 
      success: true, 
      message: `Password untuk pengguna @${targetUser.username} berhasil di-reset. Sesi aktif pengguna telah dicabut.` 
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mereset password pengguna.'
    return { success: false, message: msg }
  }
}

export async function deleteUserAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requirePermission('users')

    const id = String(formData.get('id') ?? '')
    if (!id || id === 'admin') return { success: false, message: 'Pengguna ini tidak dapat dihapus.' }

    const db = await readDB()
    if (!db.cmsUsers) return { success: false, message: 'Tidak ada data pengguna.' }

    const target = db.cmsUsers.find((u) => u.id === id)
    db.cmsUsers = db.cmsUsers.filter((u) => u.id !== id)

    // Bersihkan sesi aktif jika ada
    if (db.activeSessions && db.activeSessions[id]) {
      delete db.activeSessions[id]
    }

    await writeDB(db)
    await addNotification(`Menghapus pengguna CMS: "${target?.name || id}".`, 'DELETE')

    revalidatePath('/admin/users')
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus pengguna.'
    return { success: false, message: msg }
  }
}

export async function toggleUserStatusAction(formData: FormData): Promise<UserActionResult> {
  try {
    await requirePermission('users')

    const id = String(formData.get('id') ?? '')
    if (id === 'admin') return { success: false, message: 'Status Administrator Master tidak dapat diubah.' }

    const db = await readDB()
    if (!db.cmsUsers) return { success: false, message: 'Tidak ada data pengguna.' }

    const user = db.cmsUsers.find((u) => u.id === id)
    if (user) {
      user.isActive = !user.isActive
      // Jika dinonaktifkan, cabut sesi aktifnya
      if (!user.isActive && db.activeSessions && db.activeSessions[id]) {
        delete db.activeSessions[id]
      }
      await writeDB(db)
      await addNotification(`Mengubah status pengguna "${user.name}" menjadi ${user.isActive ? 'Aktif' : 'Non-aktif'}.`, 'UPDATE')
      revalidatePath('/admin/users')
      revalidatePath('/admin', 'layout')
    }
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengubah status pengguna.'
    return { success: false, message: msg }
  }
}
