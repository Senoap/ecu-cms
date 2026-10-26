// app/admin/users/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import UsersClient, { type CmsUserDisplay } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const currentUser = await requirePagePermission('users')

  const db = await readDB()
  const users: CmsUserDisplay[] = (db.cmsUsers || []).map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    permissions: u.permissions || [],
    canReceiveCareerNotif: Boolean(u.canReceiveCareerNotif),
    isActive: u.isActive !== false,
    createdAt: u.createdAt || 0,
    passwordUpdatedAt: u.passwordUpdatedAt || u.createdAt || 0,
    mustResetPassword: Boolean(u.mustResetPassword),
    skipPasswordExpiry: Boolean(u.skipPasswordExpiry),
  }))

  return (
    <UsersClient 
      users={users} 
      masterAdminUsername="admin" 
      isRootAdmin={currentUser.isRootAdmin}
      isSuperadmin={currentUser.isSuperadmin}
      currentUserId={currentUser.id}
      activeSessions={db.activeSessions || {}}
      // eslint-disable-next-line react-hooks/purity
      serverTimestamp={Date.now()}
    />
  )
}
