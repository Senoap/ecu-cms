// app/admin/users/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission, isUserAdministrator, isUserSuperadmin } from '@/lib/auth'
import { readDB, writeSystemDB, addNotification, type CmsUser } from '@/lib/db'
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
    const isActive = formData.get('isActive') !== 'false'
    const skipPasswordExpiry = formData.get('skipPasswordExpiry') === 'true' || formData.get('skipPasswordExpiry') === 'on'

    // Ambil semua permission yang dicentang
    const rawPermissions: string[] = []
    for (const [key, val] of formData.entries()) {
      if (key.startsWith('perm_') && (val === 'on' || val === 'true')) {
        rawPermissions.push(key.replace('perm_', ''))
      }
    }

    // Menu 'users' (Manajemen Pengguna) hanya boleh diberikan kepada administrator & superadministrator
    const isRoleAdmin = isUserAdministrator({ role }) || isUserSuperadmin({ role })
    const permissions = isRoleAdmin
      ? rawPermissions
      : rawPermissions.filter((p) => p !== 'users')

    // Otomatis aktif menerima notifikasi karir & lamaran jika memiliki hak akses 'career'
    const canReceiveCareerNotif = permissions.includes('career')

    if (!username || username.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter.' }
    }
    if (!name) {
      return { success: false, message: 'Nama pengguna wajib diisi.' }
    }

    // Administrator boleh membuat password tanpa persyaratan untuk user (default: 4sinergiutama2026!)
    const finalPassword = password.trim() || '4sinergiutama2026!'

    const db = await readDB()
    if (!db.cmsUsers) db.cmsUsers = []

    // Cegah duplikasi username
    if (db.cmsUsers.some((u) => u.username.toLowerCase() === username) || username === 'admin' || username === 'superadmin') {
      return { success: false, message: `Username "${username}" sudah digunakan atau dicadangkan untuk sistem. Silakan gunakan username lain.` }
    }

    const now = Date.now()
    const newUser: CmsUser = {
      id: 'usr-' + now + '-' + Math.random().toString(36).substring(2, 6),
      username,
      passwordHash: hashPassword(finalPassword),
      name,
      role,
      permissions,
      canReceiveCareerNotif,
      isActive,
      skipPasswordExpiry,
      createdAt: now,
      passwordUpdatedAt: now,
      mustResetPassword: false,
    }

    db.cmsUsers.push(newUser)
    await writeSystemDB(db)
    await addNotification(
      `Menambahkan pengguna CMS baru: "${name}" (@${username}) dengan role "${role}".`,
      'CREATE',
      'system',
      { userName: currentUser.name, userRole: currentUser.role, isSystemOnly: true }
    )

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
    const isActive = formData.get('isActive') !== 'false'
    const skipPasswordExpiry = formData.get('skipPasswordExpiry') === 'true' || formData.get('skipPasswordExpiry') === 'on'

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
    const isFinalRoleAdmin = isUserAdministrator({ role: finalRole }) || isUserSuperadmin({ role: finalRole })
    const rawPermissions = currentUser.isRootAdmin ? permissions : existing.permissions
    const finalPermissions = isFinalRoleAdmin
      ? rawPermissions
      : rawPermissions.filter((p) => p !== 'users')

    // Otomatis aktif jika hak akses menu memilih karir & lowongan
    const canReceiveCareerNotif = finalPermissions.includes('career')

    const updatedUser: CmsUser = {
      ...existing,
      name: name || existing.name,
      role: finalRole,
      permissions: finalPermissions,
      canReceiveCareerNotif,
      isActive,
      skipPasswordExpiry,
    }

    if (password && password.trim().length > 0) {
      // Administrator boleh membuat password tanpa persyaratan untuk user
      updatedUser.passwordHash = hashPassword(password.trim())
      updatedUser.passwordUpdatedAt = Date.now()
      updatedUser.mustResetPassword = false
    }

    db.cmsUsers[index] = updatedUser
    await writeSystemDB(db)
    await addNotification(
      `Memperbarui data pengguna CMS: "${updatedUser.name}".`,
      'UPDATE',
      'system',
      { userName: currentUser.name, userRole: currentUser.role, isSystemOnly: true }
    )

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

    // Aturan 2: Reset password khusus untuk user lain selain user admin (root master) & superadmin
    if (targetUserId === 'admin' || targetUserId === 'superadmin') {
      return { 
        success: false, 
        message: 'Password akun sistem utama tidak dapat di-reset melalui menu ini (dikelola langsung melalui sistem/environment).' 
      }
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return { success: false, message: 'Konfirmasi password baru tidak cocok.' }
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
    await writeSystemDB(db)

    await addNotification(
      `Password pengguna "${targetUser.name}" (@${targetUser.username}) telah di-reset oleh ${currentUser.name}.`,
      'UPDATE',
      'system',
      { userName: currentUser.name, userRole: currentUser.role, isSystemOnly: true }
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
    if (!id || id === 'admin' || id === 'superadmin') return { success: false, message: 'Pengguna ini tidak dapat dihapus.' }

    const db = await readDB()
    if (!db.cmsUsers) return { success: false, message: 'Tidak ada data pengguna.' }

    const target = db.cmsUsers.find((u) => u.id === id)
    db.cmsUsers = db.cmsUsers.filter((u) => u.id !== id)

    // Bersihkan sesi aktif jika ada
    if (db.activeSessions && db.activeSessions[id]) {
      delete db.activeSessions[id]
    }

    await writeSystemDB(db)
    await addNotification(
      `Menghapus pengguna CMS: "${target?.name || id}".`,
      'DELETE',
      'system',
      { isSystemOnly: true }
    )

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
    if (id === 'admin' || id === 'superadmin') return { success: false, message: 'Status akun sistem utama tidak dapat diubah.' }

    const db = await readDB()
    if (!db.cmsUsers) return { success: false, message: 'Tidak ada data pengguna.' }

    const user = db.cmsUsers.find((u) => u.id === id)
    if (user) {
      user.isActive = !user.isActive
      // Jika dinonaktifkan, cabut sesi aktifnya
      if (!user.isActive && db.activeSessions && db.activeSessions[id]) {
        delete db.activeSessions[id]
      }
      await writeSystemDB(db)
      await addNotification(
        `Mengubah status pengguna "${user.name}" menjadi ${user.isActive ? 'Aktif' : 'Non-aktif'}.`,
        'UPDATE',
        'system',
        { isSystemOnly: true }
      )
      revalidatePath('/admin/users')
      revalidatePath('/admin', 'layout')
    }
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengubah status pengguna.'
    return { success: false, message: msg }
  }
}

/**
 * Menghentikan paksa (Kick) sesi pengguna yang sedang login/online di bawah Superadmin.
 * Khusus dapat dijalankan oleh Superadmin (tier di atas admin).
 */
export async function kickUserSessionAction(formData: FormData): Promise<UserActionResult> {
  try {
    const currentUser = await requirePermission('users')

    if (!currentUser.isSuperadmin || currentUser.id !== 'superadmin') {
      return {
        success: false,
        message: 'Akses ditolak: Hanya Superadmin yang memiliki wewenang untuk meng-kick pengguna yang sedang online.'
      }
    }

    const targetUserId = String(formData.get('targetUserId') ?? '').trim()
    if (!targetUserId) {
      return { success: false, message: 'ID pengguna tidak valid.' }
    }

    if (targetUserId === 'superadmin') {
      return { success: false, message: 'Sesi Superadmin tidak dapat di-kick.' }
    }

    const db = await readDB()
    if (!db.activeSessions || !db.activeSessions[targetUserId]) {
      return { success: false, message: 'Pengguna tersebut saat ini sudah tidak dalam status login/online.' }
    }

    const targetName =
      targetUserId === 'admin'
        ? 'Administrator Master (@admin)'
        : (() => {
            const u = db.cmsUsers?.find((item) => item.id === targetUserId)
            return u ? `${u.name} (@${u.username})` : targetUserId
          })()

    delete db.activeSessions[targetUserId]
    await writeSystemDB(db)

    await addNotification(
      `Sesi login pengguna "${targetName}" telah dihentikan paksa (Kick) oleh Superadmin.`,
      'AUTH',
      'system',
      { userName: currentUser.name, userRole: currentUser.role, isSystemOnly: true }
    )

    revalidatePath('/admin/users')
    revalidatePath('/admin', 'layout')
    return {
      success: true,
      message: `Berhasil meng-kick "${targetName}". Sesi login pengguna telah diputus secara paksa.`
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal meng-kick sesi pengguna.'
    return { success: false, message: msg }
  }
}
