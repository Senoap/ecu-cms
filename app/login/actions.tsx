// app/login/actions.tsx
'use server'

import { cookies, headers } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/lib/session'
import { readDB } from '@/lib/db'
import { verifyPassword, checkPasswordExpiry } from '@/lib/password'

import { AVAILABLE_MENUS, canUserAccessMenu } from '@/lib/auth'

export type LoginResult = {
  success: boolean
  message?: string
  redirectUrl?: string
  requirePasswordReset?: boolean
  resetToken?: string
  username?: string
  name?: string
  daysRemaining?: number
  isExpired?: boolean
  isWarning?: boolean
  reason?: 'must_reset' | 'expired' | 'warning_h7'
}

// Rate limit persisten & in-memory: 5 percobaan gagal / 15 menit / IP
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const memoryAttempts = new Map<string, { count: number; resetAt: number }>()

async function checkIsLocked(ip: string): Promise<{ locked: boolean; remainingMinutes?: number }> {
  const now = Date.now()

  // 1. Cek cache in-memory cepat
  const memRec = memoryAttempts.get(ip)
  if (memRec && memRec.resetAt > now && memRec.count >= MAX_ATTEMPTS) {
    const remaining = Math.max(1, Math.ceil((memRec.resetAt - now) / 60000))
    return { locked: true, remainingMinutes: remaining }
  }

  // 2. Cek database persisten
  try {
    const db = await readDB()
    const rec = db.loginAttempts?.[`ip_${ip}`]
    if (rec && rec.resetAt > now && rec.count >= MAX_ATTEMPTS) {
      const remaining = Math.max(1, Math.ceil((rec.resetAt - now) / 60000))
      return { locked: true, remainingMinutes: remaining }
    }
  } catch (e) {
    console.warn('Gagal membaca status rate limit:', e)
  }

  return { locked: false }
}

async function recordLoginFailure(ip: string, targetUsername: string) {
  const now = Date.now()
  const resetAt = now + WINDOW_MS

  // 1. Catat ke memory
  const memRec = memoryAttempts.get(ip)
  const newCount = (!memRec || memRec.resetAt < now) ? 1 : memRec.count + 1
  memoryAttempts.set(ip, { count: newCount, resetAt })

  // 2. Catat ke database persisten & audit log
  try {
    const { writeDB } = await import('@/lib/db')
    const db = await readDB()
    if (!db.loginAttempts) db.loginAttempts = {}
    db.loginAttempts[`ip_${ip}`] = {
      count: newCount,
      resetAt,
      lastAttemptAt: now,
      lockedUntil: newCount >= MAX_ATTEMPTS ? resetAt : undefined,
    }

    if (!db.auditLogs) db.auditLogs = []
    if (newCount >= MAX_ATTEMPTS) {
      db.auditLogs.unshift({
        id: 'log-brute-' + now,
        message: `PERINGATAN KEAMANAN: Percobaan login gagal berulang (${newCount}x) terdeteksi dari IP: ${ip} untuk akun: "${targetUsername || 'admin'}". Akses IP ini diblokir sementara selama 15 menit.`,
        timestamp: now,
        type: 'AUTH',
        category: 'system',
        userName: targetUsername || 'Unknown',
        userEmail: '-',
        userRole: 'Unauthenticated',
        ip,
      })
    } else {
      db.auditLogs.unshift({
        id: 'log-fail-' + now,
        message: `Percobaan login gagal (${newCount}/${MAX_ATTEMPTS}) dari IP: ${ip} untuk target user: "${targetUsername || 'admin'}".`,
        timestamp: now,
        type: 'AUTH',
        category: 'system',
        userName: targetUsername || 'Unknown',
        userEmail: '-',
        userRole: 'Unauthenticated',
        ip,
      })
    }

    await writeDB(db)
  } catch (e) {
    console.warn('Gagal mencatat login failure:', e)
  }
}

async function clearLoginAttempts(ip: string) {
  memoryAttempts.delete(ip)
  try {
    const { writeDB } = await import('@/lib/db')
    const db = await readDB()
    if (db.loginAttempts && db.loginAttempts[`ip_${ip}`]) {
      delete db.loginAttempts[`ip_${ip}`]
      await writeDB(db)
    }
  } catch (e) {
    console.warn('Gagal membersihkan login attempts:', e)
  }
}

function passwordMatches(input: string, secret: string): boolean {
  const a = Buffer.from(input)
  const b = Buffer.from(secret)
  if (a.length !== b.length) {
    timingSafeEqual(b, b)
    return false
  }
  return timingSafeEqual(a, b)
}

export async function loginAdmin(formData: FormData): Promise<LoginResult> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const secretPassword = process.env.ADMIN_PASSWORD

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
  const userAgent = h.get('user-agent') || 'Perangkat Tidak Dikenal'

  const lockStatus = await checkIsLocked(ip)
  if (lockStatus.locked) {
    return {
      success: false,
      message: `Terlalu banyak percobaan gagal. Akses diblokir sementara. Coba lagi dalam ${lockStatus.remainingMinutes || 15} menit.`
    }
  }

  const SESSION_INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 menit

  // 1. Cek Admin Master (jika username kosong atau 'admin', dan password cocok dengan ADMIN_PASSWORD)
  if (!username || username.toLowerCase() === 'admin') {
    if (secretPassword && passwordMatches(password, secretPassword)) {
      await clearLoginAttempts(ip)

      // Cek single session enforcement (Point 7)
      const db = await readDB()
      const existingSession = db.activeSessions?.['admin']
      const now = Date.now()
      if (existingSession && (now - existingSession.lastSeen < SESSION_INACTIVITY_LIMIT)) {
        const isSameDevice = existingSession.ip === ip && existingSession.userAgent === userAgent
        if (!isSameDevice) {
          return {
            success: false,
            message: `Akun Administrator sedang aktif di perangkat lain (IP: ${existingSession.ip}). Untuk alasan keamanan, login bersamaan tidak diizinkan. Silakan logout dari perangkat tersebut terlebih dahulu.`
          }
        }
      }

      const token = await createSessionToken('admin')
      if (!db.activeSessions) db.activeSessions = {}
      db.activeSessions['admin'] = {
        token,
        ip,
        userAgent,
        lastSeen: now,
        loggedInAt: now,
      }

      if (!db.auditLogs) db.auditLogs = []
      db.auditLogs.unshift({
        id: 'log-auth-' + now,
        message: `Login berhasil oleh Administrator Master dari IP: ${ip}.`,
        timestamp: now,
        type: 'AUTH',
        category: 'system',
        userName: 'Administrator Master',
        userEmail: 'admin',
        userRole: 'Superadmin',
        ip,
      })

      const { writeDB } = await import('@/lib/db')
      await writeDB(db)

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })
      return { success: true, redirectUrl: '/admin' }
    }
  }

  // 2. Cek Pengguna CMS Terdaftar di Database
  try {
    const db = await readDB()
    const users = db.cmsUsers || []

    let matchedUser = null
    if (username) {
      matchedUser = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.isActive !== false
      )
    } else {
      // Jika username dikosongkan tetapi password cocok dengan salah satu user
      matchedUser = users.find((u) => u.isActive !== false && verifyPassword(password, u.passwordHash))
    }

    if (matchedUser && verifyPassword(password, matchedUser.passwordHash)) {
      await clearLoginAttempts(ip)

      // Cek Kedaluwarsa Password 3 Bulan & Peringatan H-7 (Point 3 & Point 4)
      const expiryStatus = checkPasswordExpiry(matchedUser.passwordUpdatedAt, matchedUser.createdAt)
      const needsPasswordReset = matchedUser.mustResetPassword || expiryStatus.isExpired || expiryStatus.isWarning

      if (needsPasswordReset) {
        const { createPasswordResetToken } = await import('@/lib/session')
        const resetToken = await createPasswordResetToken(matchedUser.id)
        return {
          success: true,
          requirePasswordReset: true,
          resetToken,
          username: matchedUser.username,
          name: matchedUser.name,
          daysRemaining: expiryStatus.daysRemaining,
          isExpired: expiryStatus.isExpired,
          isWarning: expiryStatus.isWarning,
          reason: matchedUser.mustResetPassword 
            ? 'must_reset' 
            : expiryStatus.isExpired 
              ? 'expired' 
              : 'warning_h7'
        }
      }

      // Cek single session enforcement (Point 7)
      const existingSession = db.activeSessions?.[matchedUser.id]
      const now = Date.now()
      if (existingSession && (now - existingSession.lastSeen < SESSION_INACTIVITY_LIMIT)) {
        const isSameDevice = existingSession.ip === ip && existingSession.userAgent === userAgent
        if (!isSameDevice) {
          return {
            success: false,
            message: `Akun "${matchedUser.name}" sedang aktif di perangkat lain (IP: ${existingSession.ip}). Login bersamaan tidak diizinkan. Silakan logout dari perangkat sebelumnya terlebih dahulu.`
          }
        }
      }

      const token = await createSessionToken(matchedUser.id)
      if (!db.activeSessions) db.activeSessions = {}
      db.activeSessions[matchedUser.id] = {
        token,
        ip,
        userAgent,
        lastSeen: now,
        loggedInAt: now,
      }

      if (!db.auditLogs) db.auditLogs = []
      db.auditLogs.unshift({
        id: 'log-auth-' + now,
        message: `Login berhasil oleh pengguna "${matchedUser.name}" (${matchedUser.role}) dari IP: ${ip}.`,
        timestamp: now,
        type: 'AUTH',
        category: 'system',
        userName: matchedUser.name,
        userEmail: matchedUser.username,
        userRole: matchedUser.role,
        ip,
      })

      const { writeDB } = await import('@/lib/db')
      await writeDB(db)

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })

      const isSuper = matchedUser.role.toLowerCase() === 'superadmin' || matchedUser.permissions.includes('users')
      let redirectUrl = '/admin'
      if (!isSuper && !matchedUser.permissions.includes('global')) {
        const dummyUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role,
          isSuperadmin: isSuper,
          isRootAdmin: false,
          permissions: matchedUser.permissions || [],
          canReceiveCareerNotif: Boolean(matchedUser.canReceiveCareerNotif),
        }
        const first = AVAILABLE_MENUS.find((m) => canUserAccessMenu(dummyUser, m.id))
        if (first) redirectUrl = first.href
      }

      return { success: true, redirectUrl }
    }
    await recordLoginFailure(ip, username)
    return { success: false, message: 'Username atau password salah, silakan coba lagi.' }
  } catch (err) {
    console.warn('Gagal membaca pengguna CMS saat login:', err)
    await recordLoginFailure(ip, username)
    return { success: false, message: 'Terjadi kesalahan sistem saat memproses login.' }
  }
}

/**
 * Server action khusus untuk pengguna yang harus mereset password saat login
 * (karena sudah kedaluwarsa 3 bulan, peringatan H-7, atau di-reset oleh admin).
 * Memvalidasi old password, new password, dan verify password.
 */
export async function changePasswordOnLoginAction(formData: FormData): Promise<{
  success: boolean
  message?: string
  redirectUrl?: string
}> {
  try {
    const resetToken = String(formData.get('resetToken') ?? '')
    const oldPassword = String(formData.get('oldPassword') ?? '')
    const newPassword = String(formData.get('newPassword') ?? '')
    const verifyPassword = String(formData.get('verifyPassword') ?? '')

    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
    const userAgent = h.get('user-agent') || 'Perangkat Tidak Dikenal'

    const { verifyPasswordResetToken, createSessionToken } = await import('@/lib/session')
    const tokenVerif = await verifyPasswordResetToken(resetToken)
    if (!tokenVerif.valid || !tokenVerif.userId) {
      return { 
        success: false, 
        message: 'Sesi pergantian password telah kedaluwarsa atau tidak valid. Silakan lakukan login kembali.' 
      }
    }

    if (!oldPassword) {
      return { success: false, message: 'Password lama wajib diisi untuk verifikasi identitas.' }
    }

    if (!newPassword) {
      return { success: false, message: 'Password baru wajib diisi.' }
    }

    if (newPassword !== verifyPassword) {
      return { success: false, message: 'Konfirmasi password baru (verify password) tidak cocok.' }
    }

    if (oldPassword === newPassword) {
      return { success: false, message: 'Password baru tidak boleh sama persis dengan password lama.' }
    }

    // Validasi kekuatan password: min 6 char, uppercase, lowercase, number, symbol (Point 5)
    const { validatePasswordStrength, verifyPassword: verifyPwd, hashPassword: hashPwd } = await import('@/lib/password')
    const passwordVal = validatePasswordStrength(newPassword)
    if (!passwordVal.isValid) {
      return { success: false, message: passwordVal.errors.join(' ') }
    }

    const db = await readDB()
    const user = db.cmsUsers?.find((u) => u.id === tokenVerif.userId && u.isActive !== false)
    if (!user) {
      return { success: false, message: 'Akun pengguna tidak ditemukan atau telah dinonaktifkan.' }
    }

    // Verifikasi kecocokan password lama
    if (!verifyPwd(oldPassword, user.passwordHash)) {
      return { success: false, message: 'Password lama yang Anda masukkan tidak sesuai.' }
    }

    const now = Date.now()
    user.passwordHash = hashPwd(newPassword)
    user.passwordUpdatedAt = now
    user.mustResetPassword = false

    // Buat sesi aktif penuh setelah berhasil ganti password
    const token = await createSessionToken(user.id)
    if (!db.activeSessions) db.activeSessions = {}
    db.activeSessions[user.id] = {
      token,
      ip,
      userAgent,
      lastSeen: now,
      loggedInAt: now,
    }

    if (!db.auditLogs) db.auditLogs = []
    db.auditLogs.unshift({
      id: 'log-pwdreset-' + now,
      message: `Pembaruan password berkala (3 bulan) berhasil diselesaikan oleh pengguna "${user.name}" (@${user.username}) dari IP: ${ip}.`,
      timestamp: now,
      type: 'AUTH',
      category: 'system',
      userName: user.name,
      userEmail: user.username,
      userRole: user.role,
      ip,
    })

    const { writeDB } = await import('@/lib/db')
    await writeDB(db)

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    const isSuper = user.role.toLowerCase() === 'superadmin' || user.permissions.includes('users')
    let redirectUrl = '/admin'
    if (!isSuper && !user.permissions.includes('global')) {
      const dummyUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        isSuperadmin: isSuper,
        isRootAdmin: false,
        permissions: user.permissions || [],
        canReceiveCareerNotif: Boolean(user.canReceiveCareerNotif),
      }
      const first = AVAILABLE_MENUS.find((m) => canUserAccessMenu(dummyUser, m.id))
      if (first) redirectUrl = first.href
    }

    return { success: true, redirectUrl }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memperbarui password.'
    return { success: false, message: msg }
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    try {
      const { getSessionPayload } = await import('@/lib/session')
      const payload = await getSessionPayload(token)
      if (payload?.userId) {
        const { readDB, writeDB, addNotification } = await import('@/lib/db')
        const db = await readDB()
        if (db.activeSessions && db.activeSessions[payload.userId]) {
          delete db.activeSessions[payload.userId]
          await writeDB(db)
        }
        await addNotification(
          `Pengguna "${payload.userId}" telah logout dari sistem CMS.`,
          'AUTH',
          'system',
          { userName: payload.userId, userRole: 'CMS User' }
        )
      }
    } catch (e) {
      console.warn('Gagal menghapus active session saat logout:', e)
    }
  }
  cookieStore.delete(SESSION_COOKIE)
  return { success: true }
}

export async function heartbeatAdminSession(): Promise<{ valid: boolean; message?: string }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return { valid: false, message: 'Tidak ada sesi aktif.' }

    const { getSessionPayload } = await import('@/lib/session')
    const payload = await getSessionPayload(token)
    if (!payload?.userId) return { valid: false, message: 'Token sesi tidak valid.' }

    const { readDB, writeDB } = await import('@/lib/db')
    const db = await readDB()
    const session = db.activeSessions?.[payload.userId]
    if (!session) {
      return { valid: true }
    }

    if (session.token !== token) {
      return { valid: false, message: 'Akun Anda telah masuk di perangkat lain. Sesi di perangkat ini dinonaktifkan.' }
    }

    session.lastSeen = Date.now()
    await writeDB(db)
    return { valid: true }
  } catch {
    return { valid: true }
  }
}