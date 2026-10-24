// app/api/cron/purge-cv/route.ts
// Endpoint terproteksi untuk pembersihan CV kedaluwarsa (retensi 60 hari, UU PDP).
// Dipanggil oleh cron VPS harian: scripts/purge-expired-cv.mjs
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { autoPurgeExpiredCvs } from '@/lib/applications'

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
  const purged = await autoPurgeExpiredCvs(60)
  return NextResponse.json({ ok: true, purged })
}
