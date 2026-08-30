// app/admin/audit-log/page.tsx
import { readDB } from '@/lib/db'
import AuditLogClient from './AuditLogClient'

export default async function AuditLogPage() {
  const db = await readDB()
  const logs = db.auditLogs || []

  return <AuditLogClient initialLogs={logs} />
}