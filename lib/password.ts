// lib/password.ts
import crypto from 'crypto'

// Masa berlaku password: 3 bulan (90 hari)
export const PASSWORD_EXPIRY_DAYS = 90
export const PASSWORD_EXPIRY_MS = PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000

// Periode peringatan kedaluwarsa: H-7 sebelum expired
export const PASSWORD_WARN_DAYS = 7
export const PASSWORD_WARN_MS = PASSWORD_WARN_DAYS * 24 * 60 * 60 * 1000

export interface PasswordStrengthDetails {
  minLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  hasSymbol: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  details: PasswordStrengthDetails
}

export const PBKDF2_ITERATIONS = 210000

/**
 * Validasi kekuatan password:
 * - Panjang minimal 8 karakter
 * - Mengandung huruf besar (uppercase: A-Z)
 * - Mengandung huruf kecil (lowercase: a-z)
 * - Mengandung angka (number: 0-9)
 * - Mengandung simbol / karakter khusus (!@#$%^&* dsb.)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const minLength = (password ?? '').length >= 8
  const hasUpper = /[A-Z]/.test(password ?? '')
  const hasLower = /[a-z]/.test(password ?? '')
  const hasNumber = /[0-9]/.test(password ?? '')
  const hasSymbol = /[^A-Za-z0-9]/.test(password ?? '')

  const errors: string[] = []
  if (!minLength) errors.push('Panjang password minimal 8 karakter.')
  if (!hasUpper) errors.push('Wajib mengandung minimal 1 huruf besar (A-Z).')
  if (!hasLower) errors.push('Wajib mengandung minimal 1 huruf kecil (a-z).')
  if (!hasNumber) errors.push('Wajib mengandung minimal 1 angka (0-9).')
  if (!hasSymbol) errors.push('Wajib mengandung minimal 1 simbol / karakter khusus (contoh: @, #, $, !, %, dsb.).')

  return {
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSymbol,
    errors,
    details: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
    },
  }
}

export interface PasswordExpiryStatus {
  isExpired: boolean
  isWarning: boolean
  daysRemaining: number
  expiresAt: number
  lastUpdatedAt: number
}

/**
 * Hitung status kedaluwarsa password (3 bulan / 90 hari):
 * Menghasilkan apakah password sudah kedaluwarsa atau berada dalam rentang H-7.
 */
export function checkPasswordExpiry(passwordUpdatedAt?: number, createdAt?: number): PasswordExpiryStatus {
  const lastUpdatedAt = passwordUpdatedAt || createdAt || Date.now()
  const expiresAt = lastUpdatedAt + PASSWORD_EXPIRY_MS
  const now = Date.now()
  const msRemaining = expiresAt - now
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000))

  const isExpired = msRemaining <= 0
  const isWarning = !isExpired && msRemaining <= PASSWORD_WARN_MS

  return {
    isExpired,
    isWarning,
    daysRemaining: Math.max(0, daysRemaining),
    expiresAt,
    lastUpdatedAt,
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  return `pbkdf2$sha512$${PBKDF2_ITERATIONS}$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (!stored) return false
    // Format modern: pbkdf2$algo$iterations$salt$hash
    if (stored.startsWith('pbkdf2$')) {
      const parts = stored.split('$')
      if (parts.length !== 5) return false
      const [, algo, iterStr, salt, originalHash] = parts
      const iterations = Number(iterStr)
      if (!Number.isFinite(iterations) || iterations < 1) return false
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, algo || 'sha512').toString('hex')
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash))
    }

    // Fallback backwards-compatibility untuk hash legacy (salt:hash dengan 10.000 iterasi)
    const [salt, originalHash] = stored.split(':')
    if (!salt || !originalHash) return false
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash))
  } catch {
    return false
  }
}

export function needsRehash(stored: string): boolean {
  if (!stored) return true
  if (!stored.startsWith('pbkdf2$')) return true
  const parts = stored.split('$')
  if (parts.length !== 5) return true
  const iter = Number(parts[2])
  return iter < PBKDF2_ITERATIONS
}

export const DEFAULT_ADMIN_SET_PASSWORD = '4sinergiutama2026!'

export function passwordMatches(input: string, secret: string): boolean {
  try {
    const a = Buffer.from(input)
    const b = Buffer.from(secret)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}


