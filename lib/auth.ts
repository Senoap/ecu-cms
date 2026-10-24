// lib/auth.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, getSessionPayload } from './session'
import { readDB } from './db'

import { AVAILABLE_MENUS, ALL_MENU_IDS } from './menus'
export { AVAILABLE_MENUS, ALL_MENU_IDS }

export interface CurrentAdminUser {
  id: string
  username: string
  name: string
  role: string
  isSuperadmin: boolean
  isRootAdmin: boolean
  permissions: string[]
  canReceiveCareerNotif: boolean
}

export async function getCurrentUser(): Promise<CurrentAdminUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getSessionPayload(token)
  if (!payload) return null

  try {
    const db = await readDB()

    // Validasi sesi aktif di database (Single-Device Session Enforcement & Immediate Revocation)
    const activeSession = db.activeSessions?.[payload.userId]
    if (!activeSession || activeSession.token !== token) {
      // Sesi tidak ditemukan di activeSessions (telah di-logout / dinonaktifkan) atau ditimpa di perangkat lain
      return null
    }

    // 1. Jika user 'superadmin' (Tier tertinggi di atas admin, khusus kontrol user)
    if (payload.userId === 'superadmin') {
      return {
        id: 'superadmin',
        username: 'superadmin',
        name: 'Super Administrator',
        role: 'Superadmin',
        isSuperadmin: true,
        isRootAdmin: true,
        permissions: ['users'],
        canReceiveCareerNotif: false,
      }
    }

    // 2. Jika master admin ('admin') -> Di bawah superadmin, akses semua menu CMS
    if (payload.userId === 'admin') {
      return {
        id: 'admin',
        username: 'admin',
        name: 'Administrator Master',
        role: 'Administrator Master',
        isSuperadmin: false,
        isRootAdmin: true,
        permissions: [...ALL_MENU_IDS],
        canReceiveCareerNotif: true,
      }
    }

    // 3. Jika user dari database -> User tambahan
    const user = db.cmsUsers?.find((u) => u.id === payload.userId && u.isActive !== false)
    if (!user) return null

    const hasAllAccess = user.role.toLowerCase() === 'superadmin' || user.permissions.includes('users')
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isSuperadmin: false,
      isRootAdmin: false, // User tambahan tidak pernah menjadi Root Admin
      permissions: hasAllAccess ? [...ALL_MENU_IDS] : user.permissions,
      canReceiveCareerNotif: Boolean(user.canReceiveCareerNotif),
    }
  } catch (err) {
    console.error('Gagal memvalidasi sesi pengguna di getCurrentUser:', err)
    return null
  }
}

export function canUserAccessMenu(user: CurrentAdminUser, menuId: string): boolean {
  // Superadmin hanya punya akses kontrol user ('users'), selain itu tidak bisa akses!
  if (user.isSuperadmin || user.id === 'superadmin') {
    return menuId === 'users'
  }
  if (user.isRootAdmin) return true
  if (menuId === 'career-templates') {
    return user.permissions.includes('career-templates') || user.permissions.includes('career')
  }
  return user.permissions.includes(menuId)
}

export function getDefaultMenuHref(user: CurrentAdminUser): string {
  if (user.isSuperadmin || user.id === 'superadmin') {
    return '/cms/users'
  }
  if (user.isRootAdmin || user.permissions.includes('global')) {
    return '/cms'
  }
  const firstAllowed = AVAILABLE_MENUS.find((m) => canUserAccessMenu(user, m.id))
  return firstAllowed ? firstAllowed.href : '/cms'
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/** Panggil di baris pertama setiap server action admin. */
export async function requireAdmin(): Promise<CurrentAdminUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requirePermission(menuId: string): Promise<CurrentAdminUser> {
  const user = await requireAdmin()
  if (canUserAccessMenu(user, menuId)) {
    return user
  }
  throw new Error(`Akses ditolak: Anda tidak memiliki izin untuk menu "${menuId}".`)
}

/** Panggil di baris pertama setiap Server Component halaman admin (page.tsx). */
export async function requirePagePermission(menuId: string): Promise<CurrentAdminUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  if (canUserAccessMenu(user, menuId)) {
    return user
  }
  const target = getDefaultMenuHref(user)
  const currentMenu = AVAILABLE_MENUS.find((m) => m.id === menuId)
  if (currentMenu && currentMenu.href === target) {
    redirect('/login')
  }
  redirect(target)
}
