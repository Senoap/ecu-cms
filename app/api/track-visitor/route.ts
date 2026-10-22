// app/api/track-visitor/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { addVisitorLog } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const pathName = String(body.path || '/').trim()

    // Ambil IP pengunjung dari header
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               req.headers.get('x-real-ip') ||
               '127.0.0.1'

    const userAgent = req.headers.get('user-agent') || 'Browser'
    const referer = req.headers.get('referer') || undefined

    await addVisitorLog(pathName, ip, userAgent, referer)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
