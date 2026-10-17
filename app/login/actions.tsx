// app/login/actions.tsx
'use server'

import { cookies, headers } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/lib/session'
import { readDB } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

// Rate limit sederhana (in-memory per instance): 5 percobaan gagal / 15 menit / IP
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function isLocked(ip: string): boolean {
  const rec = attempts.get(ip)
  if (!rec) return false
  if (rec.resetAt < Date.now()) {
    attempts.delete(ip)
    return false
  }
  return rec.count >= MAX_ATTEMPTS
}

function registerFailure(ip: string) {
  const rec = attempts.get(ip)
  if (!rec || rec.resetAt < Date.now()) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS })
  } else {
    rec.count++
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

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const secretPassword = process.env.ADMIN_PASSWORD

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'

  if (isLocked(ip)) {
    return { success: false, message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }
  }

  // 1. Cek Admin Master (jika username kosong atau 'admin', dan password cocok dengan ADMIN_PASSWORD)
  if (!username || username.toLowerCase() === 'admin') {
    if (secretPassword && passwordMatches(password, secretPassword)) {
      attempts.delete(ip)
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, await createSessionToken('admin'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })
      return { success: true }
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
      attempts.delete(ip)
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE, await createSessionToken(matchedUser.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      })
      return { success: true }
    }
  } catch (err) {
    console.warn('Gagal membaca pengguna CMS saat login:', err)
  }

  registerFailure(ip)
  return { success: false, message: 'Username atau password salah, silakan coba lagi.' }
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return { success: true }
}