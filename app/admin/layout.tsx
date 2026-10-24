// app/admin/layout.tsx
import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { readDB, clearNotifications, markNotificationsAsViewed, checkDraftLock } from '@/lib/db'
import { deployWithAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import AdminLayoutClient from './AdminLayoutClient'

export const viewport: Viewport = {
  themeColor: '#6B0808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const db = await readDB()
  const rawLogoUrl = db.setting?.logoUrl || '/icons/icon-192x192.png'
  const iconMimeType = rawLogoUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : rawLogoUrl.endsWith('.webp')
      ? 'image/webp'
      : 'image/png'

  return {
    title: '4SU Company CMS',
    description: 'Panel Manajemen Konten & Administrasi Resmi PT Empat Sinergi Utama (4SU)',
    manifest: '/admin-manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: '4SU CMS',
    },
    icons: {
      icon: [
        { url: rawLogoUrl, type: iconMimeType },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: [{ url: rawLogoUrl, type: iconMimeType }],
      apple: [{ url: rawLogoUrl }],
    },
  }
}

async function handleDeployAction() {
  'use server'
  const user = await requireAdmin()
  if (user.isSuperadmin || user.id === 'superadmin') {
    throw new Error('Akses ditolak: Superadmin hanya memiliki akses kontrol pengguna.')
  }
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