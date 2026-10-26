// app/admin/layout.tsx
import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin, isUserAdministrator, isUserSuperadmin } from '@/lib/auth'
import { readDB, clearNotifications, markNotificationsAsViewed, checkDraftLock } from '@/lib/db'
import { deployWithAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import AdminLayoutClient from './AdminLayoutClient'

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export async function generateMetadata(): Promise<Metadata> {
  const db = await readDB()
  const siteName = db.setting?.siteName || 'PT. EMPAT SINERGI UTAMA'
  const rawLogoUrl = db.setting?.logoUrl || '/icons/icon-192x192.png'
  const iconMimeType = rawLogoUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : rawLogoUrl.endsWith('.webp')
      ? 'image/webp'
      : 'image/png'

  return {
    title: {
      absolute: `CMS | ${siteName}`,
    },
    description: `Panel Manajemen Konten & Administrasi Resmi ${siteName}`,
    manifest: '/admin-manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `CMS | ${siteName}`,
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
  const user = await requireAdmin()
  const isPrivileged = isUserAdministrator(user) || isUserSuperadmin(user)
  await clearNotifications(user.id, isPrivileged)
  revalidatePath('/admin')
}

async function handleMarkAsViewed() {
  'use server'
  const user = await requireAdmin()
  const isPrivileged = isUserAdministrator(user) || isUserSuperadmin(user)
  await markNotificationsAsViewed(user.id, isPrivileged)
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

  const isPrivilegedAdmin = isUserAdministrator(user) || isUserSuperadmin(user)

  // 2. AMBIL DATA DATABASE JIKA SUDAH LOGIN
  const db = await readDB()
  const sections = [...(db.sections || [])].sort((a, b) => a.order - b.order)

  // Aturan Notifikasi:
  // - Admin & Superadmin wajib melihat keseluruhan notifikasi dari user di bawahnya.
  // - User/staf biasa tidak melihat perubahan selain yang dibuat oleh user itu sendiri.
  const allNotifications = db.notifications || []
  const notifications = allNotifications.filter((n) => {
    if (isPrivilegedAdmin) return true
    return (
      (n.userId && n.userId === user.id) ||
      (n.userEmail && n.userEmail.toLowerCase() === user.username.toLowerCase()) ||
      (n.userName && n.userName.toLowerCase() === user.name.toLowerCase())
    )
  })
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
      lastPublishedAt={db.lastPublishedAt || db.published?.lastPublishedAt}
      deployAction={handleDeployAction}
      clearNotificationsAction={handleClearNotifications}
      markAsViewedAction={handleMarkAsViewed}
    >
      {children}
    </AdminLayoutClient>
  )
}