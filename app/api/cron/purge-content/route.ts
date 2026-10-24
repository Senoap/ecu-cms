// app/api/cron/purge-content/route.ts
// Endpoint terproteksi untuk auto-purge konten kedaluwarsa H+7.
// Dipanggil oleh cron VPS berkala atau pasca-event jadwal konten.
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { autoPurgeExpiredScheduledContents } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) return false
  const header = request.headers.get('authorization') || ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : ''
  const a = Buffer.from(provided)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET belum dikonfigurasi.' }, { status: 503 })
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await autoPurgeExpiredScheduledContents()
  return NextResponse.json({ ok: true, ...result })
}
