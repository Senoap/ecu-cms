// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { readDB, clearNotifications, markNotificationsAsViewed, checkDraftLock } from '@/lib/db'
import { deployWithAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import AdminLayoutClient from './AdminLayoutClient'

async function handleDeployAction() {
  'use server'
  await requireAdmin()
  await deployWithAudit()
  revalidatePath('/', 'layout')
  revalidatePath('/admin', 'layout')
}

async function handleClearNotifications() {
  'use server'
  await requireAdmin()
  await clearNotifications()
  revalidatePath('/admin')
}

async function handleMarkAsViewed() {
  'use server'
  await requireAdmin()
  await markNotificationsAsViewed()
  revalidatePath('/admin')
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. CEK AUTENTIKASI (Keamanan Akses CMS)
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // 2. AMBIL DATA DATABASE JIKA SUDAH LOGIN
  const db = await readDB()
  const sections = [...(db.sections || [])].sort((a, b) => a.order - b.order)
  const notifications = db.notifications || []
  const hasDraft = db.hasDraft ?? false
  const isDraftLocked = checkDraftLock(user, db).isLockedByOther

  return (
    <AdminLayoutClient 
      currentUser={user}
      sections={sections} 
      notifications={notifications} 
      hasDraft={hasDraft} 
      draftLock={db.draftLock}
      isLockedByOther={isDraftLocked}
      logoUrl={db.setting?.logoUrl}
      deployAction={handleDeployAction}
      clearNotificationsAction={handleClearNotifications}
      markAsViewedAction={handleMarkAsViewed}
    >
      {children}
    </AdminLayoutClient>
  )
}