// app/api/admin/audit-log/download/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { readDB, generateAuditLogTxt } from '@/lib/db'

export async function GET() {
  try {
    const user = await requireAdmin()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const db = await readDB()
    const logs = (db.auditLogs || []).filter((l) => l.category !== 'visitor' && l.type !== 'VISITOR')
    const dailyVisitors = db.dailyVisitorCounts || []
    const txtContent = generateAuditLogTxt(logs, dailyVisitors)

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `audit_logs_export_${dateStr}.txt`

    return new NextResponse(txtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return new NextResponse('Gagal mengunduh audit log: ' + String(error), { status: 500 })
  }
}
