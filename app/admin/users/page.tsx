// app/admin/users/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import UsersClient, { type CmsUserDisplay } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  await requirePagePermission('users')

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
  }))

  return (
    <UsersClient 
      users={users} 
      masterAdminUsername="admin" 
    />
  )
}
