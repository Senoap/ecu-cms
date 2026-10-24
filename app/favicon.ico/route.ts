// app/favicon.ico/route.ts
import { NextResponse } from 'next/server'
import { readPublishedDB, readDB } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await readPublishedDB().catch(() => readDB())
    const logoUrl = db?.setting?.logoUrl

    if (logoUrl) {
      if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
        const remoteRes = await fetch(logoUrl, { cache: 'no-store' })
        if (remoteRes.ok) {
          const contentType = remoteRes.headers.get('content-type') || 'image/png'
          const arrayBuffer = await remoteRes.arrayBuffer()
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            },
          })
        }
      } else {
        const cleanPath = logoUrl.startsWith('/') ? logoUrl.slice(1) : logoUrl
        const filePath = path.join(process.cwd(), 'public', cleanPath)
        try {
          const buffer = await fs.readFile(filePath)
          const ext = path.extname(cleanPath).toLowerCase()
          const contentType = ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.webp'
              ? 'image/webp'
              : ext === '.ico'
                ? 'image/x-icon'
                : 'image/png'
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            },
          })
        } catch {}
      }
    }
  } catch {}

  // Fallback 1: public/favicon.ico (multi-resolution .ico generated from logo)
  try {
    const icoPath = path.join(process.cwd(), 'public', 'favicon.ico')
    const icoBuffer = await fs.readFile(icoPath)
    return new NextResponse(icoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    })
  } catch {}

  // Fallback 2: public/icons/icon-192x192.png
  try {
    const pngPath = path.join(process.cwd(), 'public', 'icons', 'icon-192x192.png')
    const pngBuffer = await fs.readFile(pngPath)
    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
