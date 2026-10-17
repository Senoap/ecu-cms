// app/admin/audit-log/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import AuditLogClient from './AuditLogClient'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  await requirePagePermission('audit-log')
  const db = await readDB()
  const logs = db.auditLogs || []

  return <AuditLogClient initialLogs={logs} />
}