// proxy.ts
import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

// Daftar sub-path menu admin untuk kenyamanan URL shortcut di subdomain admin
const KNOWN_ADMIN_MENUS = [
  'hero',
  'about',
  'services',
  'portfolio',
  'gallery',
  'certifications',
  'compro-requests',
  'footer',
  'legal',
  'scheduled-content',
  'users',
  'audit-log',
  'applications',
  'career',
  'career-templates',
  'templates',
  'seo',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0].toLowerCase()

  // 1. Deteksi apakah request berasal dari subdomain CMS
  // Mendukung:
  // - Custom domain & localhost dengan titik: cms.4sinergiutama.co.id, cms-4su.4sinergiutama.co.id, cms.localhost, cms-4su.localhost
  // - Subdomain Vercel dengan tanda strip (-): cms-4su-ecu-cms.vercel.app, cms-4su.vercel.app, cms-ecu-cms.vercel.app
  const isCmsSubdomain =
    hostname.startsWith('cms-4su.') ||
    hostname.startsWith('cms.') ||
    hostname.startsWith('admin.') ||
    hostname.startsWith('cms-4su-') ||
    hostname.startsWith('cms-') ||
    hostname.startsWith('admin-') ||
    hostname === 'cms-4su.vercel.app' ||
    hostname === 'cms.localhost' ||
    hostname === 'cms-4su.localhost' ||
    hostname === 'admin.localhost'

  // Deteksi apakah sedang berjalan di domain preview/staging bawaan Vercel (*.vercel.app)
  // Di Vercel, halaman CMS dibuka menggunakan path */cms (misal: https://ecu-cms.vercel.app/cms)
  const isVercelStagingDomain = hostname.endsWith('.vercel.app')

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isValidSession = await verifySessionToken(token)

  const isAccessingCms = pathname === '/cms' || pathname.startsWith('/cms/')
  const isAccessingLegacyAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAccessingAdminApi = pathname.startsWith('/api/admin')
  const isAccessingLogin = pathname === '/login'

  // =========================================================================
  // KASUS A: AKSES MELALUI SUBDOMAIN CMS (cms.4sinergiutama.co.id / cms-4su-*.vercel.app / cms.localhost)
  // =========================================================================
  if (isCmsSubdomain) {
    // A.1. Mengakses root (/) di subdomain CMS
    if (pathname === '/') {
      if (isValidSession) {
        // Sudah login -> render dashboard CMS tanpa ubah URL browser
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.rewrite(url)
      } else {
        // Belum login -> arahkan ke halaman login
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // A.2. Jika masih ada yang mengakses /admin atau /admin/* di subdomain CMS -> arahkan ke /cms/*
    if (isAccessingLegacyAdmin) {
      const newPath = pathname === '/admin' ? '/cms' : pathname.replace(/^\/admin/, '/cms')
      return NextResponse.redirect(new URL(newPath, request.url))
    }

    // A.3. Shortcut: jika user mengetik /users, /hero, /services langsung di subdomain CMS -> arahkan ke /cms/...
    const firstSegment = pathname.split('/')[1]
    if (KNOWN_ADMIN_MENUS.includes(firstSegment)) {
      return NextResponse.redirect(new URL(`/cms${pathname}`, request.url))
    }

    // A.4. Jika sudah login dan mencoba membuka /login -> alihkan ke /cms
    if (isAccessingLogin && isValidSession) {
      return NextResponse.redirect(new URL('/cms', request.url))
    }

    // A.5. Proteksi Halaman CMS (/cms/*)
    if (isAccessingCms) {
      if (!isValidSession) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return new NextResponse('Unauthorized: Sesi tidak ditemukan atau telah berakhir.', { status: 401 })
        }
        const loginUrl = new URL('/login', request.url)
        if (pathname !== '/cms') {
          loginUrl.searchParams.set('redirect', pathname)
        }
        const res = NextResponse.redirect(loginUrl)
        if (token) {
          res.cookies.delete(SESSION_COOKIE)
        }
        return res
      }

      // Sesudah terautentikasi, rewrite internal /cms/* -> /admin/* (App Router folder) tanpa mengubah URL /cms di browser
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = pathname === '/cms' ? '/admin' : pathname.replace(/^\/cms/, '/admin')
      return NextResponse.rewrite(rewriteUrl)
    }

    // A.6. Proteksi API CMS (/api/admin/*)
    if (isAccessingAdminApi && !isValidSession) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi tidak ditemukan atau telah berakhir.' },
        { status: 401 }
      )
    }

    // Lewatkan request normal di subdomain CMS (misal: /login, assets)
    return NextResponse.next()
  }

  // =========================================================================
  // KASUS B: AKSES MELALUI DOMAIN STAGING VERCEL (https://ecu-cms.vercel.app/cms)
  // =========================================================================
  // Di Vercel, akses CMS menggunakan */cms (sedangkan */admin dikunci 404).
  if (isVercelStagingDomain && (isAccessingCms || isAccessingLogin || isAccessingAdminApi)) {
    if (isAccessingLogin && isValidSession) {
      return NextResponse.redirect(new URL('/cms', request.url))
    }

    if (isAccessingCms) {
      if (!isValidSession) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return new NextResponse('Unauthorized: Sesi tidak ditemukan atau telah berakhir.', { status: 401 })
        }
        const loginUrl = new URL('/login', request.url)
        if (pathname !== '/cms') {
          loginUrl.searchParams.set('redirect', pathname)
        }
        const res = NextResponse.redirect(loginUrl)
        if (token) {
          res.cookies.delete(SESSION_COOKIE)
        }
        return res
      }

      // Rewrite internal /cms/* -> /admin/* agar URL browser tetap */cms
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = pathname === '/cms' ? '/admin' : pathname.replace(/^\/cms/, '/admin')
      return NextResponse.rewrite(rewriteUrl)
    }

    if (isAccessingAdminApi && !isValidSession) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi tidak ditemukan atau telah berakhir.' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  // =========================================================================
  // KASUS C: AKSES MELALUI DOMAIN UTAMA PRODUKSI / LOCALHOST (4sinergiutama.co.id / localhost)
  // =========================================================================
  // Rute /cms, /admin, /login, dan /api/admin di domain utama dikunci 404 Not Found.
  // (Di Vercel pun jika mengakses /admin juga kena 404 karena di Vercel wajib pakai /cms).
  if (isAccessingCms || isAccessingLegacyAdmin || isAccessingLogin || isAccessingAdminApi) {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = '/404'
    return NextResponse.rewrite(notFoundUrl, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static chunks)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - file statis dengan ekstensi umum (.svg, .png, .jpg, .ico, .pdf, dsb)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)',
  ],
}

