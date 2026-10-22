// proxy.ts
import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isValidSession = await verifySessionToken(token)

  const isAccessingAdmin = pathname.startsWith('/admin')
  const isAccessingAdminApi = pathname.startsWith('/api/admin')
  const isAccessingLogin = pathname === '/login'

  // 1. Jika sudah login dan mencoba membuka /login, alihkan langsung ke /admin
  if (isAccessingLogin && isValidSession) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // 2. Proteksi Halaman Admin (/admin/*)
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

  // 3. Proteksi API Admin (/api/admin/*)
  if (isAccessingAdminApi && !isValidSession) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses ditolak. Sesi tidak ditemukan atau telah berakhir.' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
}
