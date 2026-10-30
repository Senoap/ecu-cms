// lib/session.ts
// Token sesi bertanda tangan (HMAC-SHA256) + masa berlaku. Aman dipakai di proxy & server.
export const SESSION_COOKIE = 'esu_admin_session'

// Waktu timeout inaktivitas: logout otomatis jika tidak ada aksi pengguna selama 3 hari
export const INACTIVITY_TIMEOUT_DAYS = 3
export const INACTIVITY_TIMEOUT_SECONDS = INACTIVITY_TIMEOUT_DAYS * 24 * 60 * 60 // 259.200 detik (3 hari)
export const INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT_SECONDS * 1000 // 259.200.000 milidetik (3 hari)

// Masa berlaku cookie & token sesi selaras dengan batas inaktivitas 3 hari
export const SESSION_MAX_AGE = INACTIVITY_TIMEOUT_SECONDS

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 16) {
    return secret
  }
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 16) {
      throw new Error('[SECURITY] SESSION_SECRET wajib diatur di production (minimal 16 karakter, disarankan 32+).')
    }
  }
  const fallback = secret || process.env.ADMIN_PASSWORD
  if (!fallback) throw new Error('SESSION_SECRET (atau ADMIN_PASSWORD) belum di-set.')
  return fallback
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(userId: string = 'admin'): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const nonce = crypto.randomUUID()
  const payload = `${exp}.${nonce}.${userId}`
  return `${payload}.${await hmac(payload)}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  // Wajib format 4 bagian: exp.nonce.userId.sig
  if (parts.length === 4) {
    const [expStr, nonce, userId, sig] = parts
    const exp = Number(expStr)
    if (!Number.isFinite(exp) || exp < Date.now()) return false
    try {
      return safeEqual(sig, await hmac(`${expStr}.${nonce}.${userId}`))
    } catch {
      return false
    }
  }
  return false
}

export async function getSessionPayload(token: string | undefined): Promise<{ userId: string } | null> {
  if (!token) return null
  const parts = token.split('.')
  // Wajib format 4 bagian: exp.nonce.userId.sig
  if (parts.length === 4) {
    const [expStr, nonce, userId, sig] = parts
    const exp = Number(expStr)
    if (!Number.isFinite(exp) || exp < Date.now()) return null
    try {
      if (!safeEqual(sig, await hmac(`${expStr}.${nonce}.${userId}`))) return null
      return { userId }
    } catch {
      return null
    }
  }
  return null
}

/**
 * Buat token reset password bertanda tangan HMAC dengan masa berlaku 15 menit.
 * Digunakan untuk alur pergantian password saat login ketika password expired/H-7.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const exp = Date.now() + 15 * 60 * 1000 // 15 menit
  const nonce = crypto.randomUUID()
  const payload = `pwdreset.${exp}.${nonce}.${userId}`
  return `${payload}.${await hmac(payload)}`
}

/**
 * Verifikasi token reset password bertanda tangan HMAC.
 */
export async function verifyPasswordResetToken(token: string | undefined): Promise<{ valid: boolean; userId?: string }> {
  if (!token) return { valid: false }
  const parts = token.split('.')
  if (parts.length !== 5 || parts[0] !== 'pwdreset') return { valid: false }
  const [prefix, expStr, nonce, userId, sig] = parts
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) return { valid: false }
  try {
    const payload = `${prefix}.${expStr}.${nonce}.${userId}`
    const isValid = safeEqual(sig, await hmac(payload))
    if (!isValid) return { valid: false }
    return { valid: true, userId }
  } catch {
    return { valid: false }
  }
}
