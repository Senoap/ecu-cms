// app/admin/audit-log/page.tsx
import { requirePagePermission, isUserAdministrator, isUserSuperadmin } from '@/lib/auth'
import { readDB } from '@/lib/db'
import AuditLogClient from './AuditLogClient'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const currentUser = await requirePagePermission('audit-log')
  const isPrivilegedAdmin = isUserAdministrator(currentUser) || isUserSuperadmin(currentUser)

  const db = await readDB()
  // Superadministrator & Administrator melihat 4 kategori (Perubahan CMS / 'system', Lamaran & Karir, Permintaan Compro, Pengunjung Web).
  // User/staf biasa yang dibuat oleh superadmin/admin hanya melihat 3 kategori (Lamaran & Karir, Permintaan Compro, Pengunjung Web).
  const logs = (db.auditLogs || []).filter((l) => {
    if (l.category === 'visitor' || l.type === 'VISITOR') return false
    if (!isPrivilegedAdmin) {
      return l.category === 'career' || l.category === 'compro'
    }
    return true
  })
  const dailyVisitors = (db.dailyVisitorCounts || []).slice(0, 30)

  return (
    <AuditLogClient
      initialLogs={logs}
      dailyVisitors={dailyVisitors}
      isPrivilegedAdmin={isPrivilegedAdmin}
    />
  )
}