// app/api/track-visitor/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { addVisitorLog } from '@/lib/db'

// Rate limit: maksimal 1 tracking per 10 detik per IP untuk mencegah race condition DB write
const TRACK_WINDOW_MS = 10 * 1000
const recentTracks = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side Cookie Consent Guard: Jangan catat apapun sebelum pengunjung setuju analitik
    const consentCookie = req.cookies.get('esu_cookie_consent')?.value
    if (!consentCookie) {
      return NextResponse.json({ ok: true, skipped: 'no_consent' })
    }
    try {
      const parsedConsent = JSON.parse(decodeURIComponent(consentCookie))
      if (!parsedConsent?.analytics) {
        return NextResponse.json({ ok: true, skipped: 'analytics_disabled' })
      }
    } catch {
      return NextResponse.json({ ok: true, skipped: 'invalid_consent' })
    }

    // 2. Anti-spoof IP: Baca X-Real-IP langsung dari Nginx
    const ip = req.headers.get('x-real-ip') ||
               req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               '127.0.0.1'

    const now = Date.now()
    const lastTrack = recentTracks.get(ip)
    if (lastTrack && now - lastTrack < TRACK_WINDOW_MS) {
      // Abaikan request berlebih secara senyap (200 OK) agar tidak membebani database
      return NextResponse.json({ ok: true, rateLimited: true })
    }
    recentTracks.set(ip, now)

    // Bersihkan memori cache jika sudah terlalu besar
    if (recentTracks.size > 5000) {
      for (const [k, v] of recentTracks.entries()) {
        if (now - v > TRACK_WINDOW_MS * 2) {
          recentTracks.delete(k)
        }
      }
    }

    const body = await req.json().catch(() => ({}))
    let pathName = String(body.path || '/').trim()

    // Validasi panjang dan karakter path
    if (pathName.length > 100) {
      pathName = pathName.slice(0, 100)
    }

    // Hanya izinkan path yang valid
    if (!pathName.startsWith('/') || pathName.includes('..') || pathName.startsWith('/cms') || pathName.startsWith('/admin') || pathName.startsWith('/api') || pathName.startsWith('/login')) {
      return NextResponse.json({ ok: true })
    }

    const userAgent = (req.headers.get('user-agent') || 'Browser').slice(0, 200)
    const referer = req.headers.get('referer')?.slice(0, 200) || undefined

    await addVisitorLog(pathName, ip, userAgent, referer)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[track-visitor] Error recording visitor log:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
