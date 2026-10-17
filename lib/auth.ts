// lib/auth.ts
import { cookies } from 'next/headers'
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
  permissions: string[]
  canReceiveCareerNotif: boolean
}

export async function getCurrentUser(): Promise<CurrentAdminUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  const payload = await getSessionPayload(token)
  if (!payload) return null

  // Jika master admin ('admin')
  if (payload.userId === 'admin') {
    return {
      id: 'admin',
      username: 'admin',
      name: 'Administrator Master',
      role: 'Superadmin',
      isSuperadmin: true,
      permissions: [...ALL_MENU_IDS],
      canReceiveCareerNotif: true,
    }
  }

  // Jika user dari database
  try {
    const db = await readDB()
    const user = db.cmsUsers?.find((u) => u.id === payload.userId && u.isActive !== false)
    if (!user) return null

    const isSuper = user.role.toLowerCase() === 'superadmin' || user.permissions.includes('users')
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isSuperadmin: isSuper,
      permissions: isSuper ? [...ALL_MENU_IDS] : user.permissions,
      canReceiveCareerNotif: Boolean(user.canReceiveCareerNotif),
    }
  } catch {
    return null
  }
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
  if (user.isSuperadmin || user.permissions.includes(menuId)) {
    return user
  }
  throw new Error(`Akses ditolak: Anda tidak memiliki izin untuk menu "${menuId}".`)
}
