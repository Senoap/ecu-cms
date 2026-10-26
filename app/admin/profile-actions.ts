// app/admin/profile-actions.ts
'use server'

import { requireAdmin } from '@/lib/auth'
import { readDB, writeSystemDB, addNotification } from '@/lib/db'
import { validatePasswordStrength, verifyPassword, hashPassword } from '@/lib/password'

export interface ChangePasswordResult {
  success: boolean
  message?: string
}

/**
 * Menu untuk user ganti password mandiri.
 * Persyaratan:
 * - Wajib isi old password, new password, dan verify new password.
 * - Password baru wajib memenuhi seluruh persyaratan keamanan password (min 8 char, huruf besar, huruf kecil, angka, simbol).
 * - Password baru tidak boleh sama dengan password lama.
 * - Jika user tidak mengingat password lama, diarahkan untuk menghubungi Administrator.
 */
export async function changeSelfPasswordAction(formData: FormData): Promise<ChangePasswordResult> {
  try {
    const currentUser = await requireAdmin()
    const oldPassword = String(formData.get('oldPassword') ?? '')
    const newPassword = String(formData.get('newPassword') ?? '')
    const verifyPasswordInput = String(formData.get('verifyPassword') ?? '')

    if (!oldPassword) {
      return { 
        success: false, 
        message: 'Password lama wajib diisi. Jika tidak mengingat password lama, silakan hubungi Administrator agar password Anda diubah.' 
      }
    }
    if (!newPassword) {
      return { success: false, message: 'Password baru wajib diisi.' }
    }
    if (newPassword !== verifyPasswordInput) {
      return { success: false, message: 'Verifikasi password baru tidak cocok dengan password baru.' }
    }
    if (oldPassword === newPassword) {
      return { success: false, message: 'Password baru tidak boleh sama persis dengan password lama.' }
    }

    // User wajib memenuhi persyaratan keamanan password
    const strength = validatePasswordStrength(newPassword)
    if (!strength.isValid) {
      return { success: false, message: strength.errors.join(' ') }
    }

    const db = await readDB()

    // 1. Akun sistem (Superadmin & Administrator Master) dikelola lewat environment server.
    // Tidak ada verifikasi password lama di sini agar tidak ada fallback/rahasia hardcode.
    if (currentUser.id === 'superadmin') {
      return {
        success: false,
        message: 'Password akun Superadmin sistem dikelola langsung melalui environment server (SUPERADMIN_PASSWORD).'
      }
    }

    if (currentUser.id === 'admin') {
      return {
        success: false,
        message: 'Password akun Administrator Master dikelola langsung melalui environment server (ADMIN_PASSWORD).'
      }
    }

    // 3. Jika pengguna terdaftar di database CMS
    if (!db.cmsUsers) db.cmsUsers = []
    const userIndex = db.cmsUsers.findIndex((u) => u.id === currentUser.id && u.isActive !== false)
    if (userIndex === -1) {
      return { success: false, message: 'Akun pengguna tidak ditemukan atau telah dinonaktifkan.' }
    }

    const user = db.cmsUsers[userIndex]
    if (!verifyPassword(oldPassword, user.passwordHash)) {
      return { 
        success: false, 
        message: 'Password lama yang Anda masukkan salah. Jika tidak mengingat password lama, silakan hubungi Administrator agar diubah passwordnya.' 
      }
    }

    const now = Date.now()
    user.passwordHash = hashPassword(newPassword)
    user.passwordUpdatedAt = now
    user.mustResetPassword = false
    db.cmsUsers[userIndex] = user
    await writeSystemDB(db)

    await addNotification(
      `Pengguna "${user.name}" (@${user.username}) berhasil memperbarui password mandiri.`,
      'UPDATE',
      'system',
      { userName: user.name, userRole: user.role, isSystemOnly: true }
    )

    return { 
      success: true, 
      message: 'Password akun Anda berhasil diubah.' 
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memperbarui password.'
    return { success: false, message: msg }
  }
}
