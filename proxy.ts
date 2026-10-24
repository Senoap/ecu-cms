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
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0].toLowerCase()

  // 1. Deteksi apakah request berasal dari subdomain admin / CMS
  // Mendukung: admin.localhost, cms.localhost, admin.esu.co.id, cms.esu.co.id, dsb.
  const isAdminSubdomain =
    hostname.startsWith('admin.') ||
    hostname.startsWith('cms.') ||
    hostname === 'admin.localhost' ||
    hostname === 'cms.localhost'

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isValidSession = await verifySessionToken(token)

  const isAccessingAdmin = pathname.startsWith('/admin')
  const isAccessingAdminApi = pathname.startsWith('/api/admin')
  const isAccessingLogin = pathname === '/login'

  // =========================================================================
  // KASUS A: AKSES MELALUI SUBDOMAIN ADMIN (admin.domain.com / admin.localhost)
  // =========================================================================
  if (isAdminSubdomain) {
    // A.1. Mengakses root (/) di subdomain admin
    if (pathname === '/') {
      if (isValidSession) {
        // Sudah login -> render dashboard admin (/admin) tanpa ubah URL browser
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.rewrite(url)
      } else {
        // Belum login -> arahkan ke halaman login
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // A.2. Shortcut: jika admin mengetik /users, /hero, /services langsung di subdomain admin
    const firstSegment = pathname.split('/')[1]
    if (KNOWN_ADMIN_MENUS.includes(firstSegment)) {
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url))
    }

    // A.3. Jika sudah login dan mencoba membuka /login -> alihkan ke /admin
    if (isAccessingLogin && isValidSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // A.4. Proteksi Halaman Admin (/admin/*)
    if (isAccessingAdmin && !isValidSession) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new NextResponse('Unauthorized: Sesi tidak ditemukan atau telah berakhir.', { status: 401 })
      }
      const loginUrl = new URL('/login', request.url)
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname)
      }
      const res = NextResponse.redirect(loginUrl)
      if (token) {
        res.cookies.delete(SESSION_COOKIE)
      }
      return res
    }

    // A.5. Proteksi API Admin (/api/admin/*)
    if (isAccessingAdminApi && !isValidSession) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi tidak ditemukan atau telah berakhir.' },
        { status: 401 }
      )
    }

    // Lewatkan request normal di subdomain admin (misal: /login, /admin/*, assets)
    return NextResponse.next()
  }

  // =========================================================================
  // KASUS B: AKSES MELALUI DOMAIN UTAMA (esu.co.id / localhost)
  // =========================================================================
  // Rute admin, login CMS, dan API admin HANYA dikenali di subdomain admin.
  // Di domain utama (baik localhost maupun domain publik), URL ini tidak dikenali (404 Not Found).
  if (isAccessingAdmin || isAccessingLogin || isAccessingAdminApi) {
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

