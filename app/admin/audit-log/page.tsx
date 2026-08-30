// app/admin/audit-log/page.tsx
import { readDB } from '@/lib/db'
import AuditLogClient from './AuditLogClient'

export default function AuditLogPage() {
  const db = readDB()
  const logs = db.auditLogs || []

  return <AuditLogClient initialLogs={logs} />
}