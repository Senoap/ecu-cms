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

/**
 * Pengecekan apakah user memiliki peran Superadministrator
 */
export function isUserSuperadmin(user: { id?: string; role?: string; isSuperadmin?: boolean } | null | undefined): boolean {
  if (!user) return false
  if (user.isSuperadmin || user.id === 'superadmin') return true
  const role = user.role?.toLowerCase().trim() || ''
  return role === 'superadmin' || role === 'superadministrator' || role === 'super administrator'
}

/**
 * Pengecekan apakah user memiliki peran Administrator
 */
export function isUserAdministrator(user: { id?: string; role?: string; isRootAdmin?: boolean } | null | undefined): boolean {
  if (!user) return false
  if (user.isRootAdmin || user.id === 'admin') return true
  const role = user.role?.toLowerCase().trim() || ''
  return role === 'admin' || role === 'administrator' || role === 'administrator master' || role === 'root admin'
}

/**
 * Pengecekan apakah user berhak mengakses grup menu "Sistem & Hak Akses" (users dan audit-log)
 * Aturan: Menu sistem dan akses hanya bisa diakses oleh administrator dan superadministrator
 */
export function isSystemAndAccessAuthorized(user: { id?: string; role?: string; isSuperadmin?: boolean; isRootAdmin?: boolean } | null | undefined): boolean {
  return isUserSuperadmin(user) || isUserAdministrator(user)
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

    // 1. Jika user 'superadmin' (Tier kontrol sistem, user & audit log)
    if (payload.userId === 'superadmin') {
      return {
        id: 'superadmin',
        username: 'superadmin',
        name: 'Super Administrator',
        role: 'Superadmin',
        isSuperadmin: true,
        isRootAdmin: true,
        permissions: ['users', 'audit-log'],
        canReceiveCareerNotif: false,
      }
    }

    // 2. Jika master admin ('admin') -> Akses penuh seluruh menu CMS
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

    const isSuper = isUserSuperadmin(user)
    const isAdmin = isUserAdministrator(user)

    // Menu 'users' (Manajemen Pengguna) hanya untuk administrator dan superadministrator
    let finalPermissions: string[]
    if (isSuper) {
      finalPermissions = ['users', 'audit-log']
    } else if (isAdmin) {
      finalPermissions = (user.permissions && user.permissions.length > 0) ? [...user.permissions] : [...ALL_MENU_IDS]
      if (!finalPermissions.includes('users')) finalPermissions.push('users')
      if (!finalPermissions.includes('audit-log')) finalPermissions.push('audit-log')
    } else {
      // Non-admin/staff biasa: 'users' tidak bisa diakses, 'audit-log' tetap bisa jika dipilih
      finalPermissions = (user.permissions || []).filter((p) => p !== 'users')
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isSuperadmin: isSuper,
      isRootAdmin: false, // User tambahan bukan Root Admin sistem utama
      permissions: finalPermissions,
      canReceiveCareerNotif: Boolean(user.canReceiveCareerNotif),
    }
  } catch (err) {
    console.error('Gagal memvalidasi sesi pengguna di getCurrentUser:', err)
    return null
  }
}

export function canUserAccessMenu(user: CurrentAdminUser, menuId: string): boolean {
  // 1. Menu Manajemen Pengguna ('users')
  // HANYA BISA DIAKSES OLEH ADMINISTRATOR DAN SUPERADMINISTRATOR
  if (menuId === 'users') {
    return isSystemAndAccessAuthorized(user)
  }

  // 2. Menu Audit Log ('audit-log')
  // Administrator & Superadministrator selalu bisa mengakses; user/staf tambahan bisa mengakses jika memiliki izin 'audit-log'
  if (menuId === 'audit-log') {
    if (isSystemAndAccessAuthorized(user)) return true
    return user.permissions.includes('audit-log')
  }

  // 3. Superadministrator hanya mengelola menu sistem ('users' dan 'audit-log'), tidak mengakses modul website
  if (isUserSuperadmin(user)) {
    return false
  }

  // 4. Administrator Root utama memiliki akses ke semua menu CMS
  if (user.isRootAdmin || user.id === 'admin') return true

  // 5. Modul template balasan karir
  if (menuId === 'career-templates') {
    return user.permissions.includes('career-templates') || user.permissions.includes('career')
  }

  // 6. Modul lainnya berdasarkan permissions yang dimiliki
  return user.permissions.includes(menuId)
}

export function getDefaultMenuHref(user: CurrentAdminUser): string {
  if (isUserSuperadmin(user)) {
    return '/cms/users'
  }
  if (user.isRootAdmin || user.id === 'admin' || user.permissions.includes('global')) {
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
