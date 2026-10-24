// app/favicon.ico/route.ts
import { NextResponse } from 'next/server'
import { readPublishedDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const db = await readPublishedDB()
    const logoUrl = db.setting?.logoUrl
    if (logoUrl) {
      if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
        return NextResponse.redirect(logoUrl, { status: 302 })
      }
      return NextResponse.redirect(new URL(logoUrl, request.url), { status: 302 })
    }
  } catch {}
  return NextResponse.redirect(new URL('/icons/icon-192x192.png', request.url), { status: 302 })
}
