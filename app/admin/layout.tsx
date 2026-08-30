// app/admin/layout.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readDB, deployDB, clearNotifications, markNotificationsAsViewed } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import AdminLayoutClient from './AdminLayoutClient'

async function handleDeployAction() {
  'use server'
  deployDB()
  revalidatePath('/')
  revalidatePath('/admin')
}

async function handleClearNotifications() {
  'use server'
  clearNotifications()
  revalidatePath('/admin')
}

async function handleMarkAsViewed() {
  'use server'
  markNotificationsAsViewed()
  revalidatePath('/admin')
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. CEK AUTENTIKASI (Keamanan Akses CMS)
  const cookieStore = await cookies()
  const session = cookieStore.get('esu_admin_session')

  if (!session || session.value !== 'authenticated') {
    redirect('/login')
  }

  // 2. AMBIL DATA DATABASE JIKA SUDAH LOGIN
  const db = readDB()
  const sections = [...(db.sections || [])].sort((a, b) => a.order - b.order)
  const notifications = db.notifications || []
  const hasDraft = db.hasDraft ?? false

  return (
    <AdminLayoutClient 
      sections={sections} 
      notifications={notifications} 
      hasDraft={hasDraft} 
      deployAction={handleDeployAction}
      clearNotificationsAction={handleClearNotifications}
      markAsViewedAction={handleMarkAsViewed}
    >
      {children}
    </AdminLayoutClient>
  )
}