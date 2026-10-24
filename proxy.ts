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
  // Mendukung:
  // - Custom domain & localhost dengan titik: admin.localhost, cms.localhost, admin.4su.co.id, cms.4su.co.id
  // - Subdomain Vercel dengan tanda strip (-): admin-ecu-cms.vercel.app, cms-ecu-cms.vercel.app
  //   (Catatan: SSL wildcard *.vercel.app hanya mencakup 1 level subdomain, sehingga di Vercel gunakan
  //    admin-ecu-cms.vercel.app atau akses langsung ecu-cms.vercel.app/admin)
  const isAdminSubdomain =
    hostname.startsWith('admin.') ||
    hostname.startsWith('cms.') ||
    hostname.startsWith('admin-') ||
    hostname.startsWith('cms-') ||
    hostname === 'admin.localhost' ||
    hostname === 'cms.localhost'

  // Deteksi apakah sedang berjalan di domain preview/staging bawaan Vercel (*.vercel.app)
  // Agar pengetesan di https://ecu-cms.vercel.app/admin atau /login tetap bisa dibuka langsung
  const isVercelStagingDomain = hostname.endsWith('.vercel.app')

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isValidSession = await verifySessionToken(token)

  const isAccessingAdmin = pathname.startsWith('/admin')
  const isAccessingAdminApi = pathname.startsWith('/api/admin')
  const isAccessingLogin = pathname === '/login'

  // =========================================================================
  // KASUS A: AKSES MELALUI SUBDOMAIN ADMIN (admin.domain.com / admin-xxx.vercel.app / admin.localhost)
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
  // KASUS B: AKSES MELALUI DOMAIN STAGING VERCEL (misal: https://ecu-cms.vercel.app/admin)
  // =========================================================================
  // Karena *.vercel.app tidak mengizinkan sub-subdomain bertitik (admin.ecu-cms.vercel.app akan gagal SSL),
  // izinkan akses path /admin, /login, dan /api/admin secara langsung di domain *.vercel.app dengan proteksi sesi penuh.
  if (isVercelStagingDomain && (isAccessingAdmin || isAccessingLogin || isAccessingAdminApi)) {
    if (isAccessingLogin && isValidSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

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

    if (isAccessingAdminApi && !isValidSession) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi tidak ditemukan atau telah berakhir.' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  // =========================================================================
  // KASUS C: AKSES MELALUI DOMAIN UTAMA PRODUKSI / LOCALHOST (4su.co.id / localhost)
  // =========================================================================
  // Rute admin, login CMS, dan API admin HANYA dikenali di subdomain admin.
  // Di domain utama produksi (maupun localhost tanpa admin.), URL ini tidak dikenali (404 Not Found).
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

