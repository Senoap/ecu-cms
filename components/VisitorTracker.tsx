// components/VisitorTracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { hasAnalyticsConsent, COOKIE_CONSENT_EVENT, type CookieConsentSettings } from '@/lib/cookieConsent'

export default function VisitorTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  const sendTrackHit = (path: string) => {
    if (!path) return
    const cleanPath = path.toLowerCase().split('?')[0].split('#')[0].trim()

    // HANYA catat pengunjung yang mengakses halaman web company profile publik
    if (
      !cleanPath.startsWith('/') ||
      cleanPath.startsWith('/cms') ||
      cleanPath.startsWith('/admin') ||
      cleanPath.startsWith('/api') ||
      cleanPath.startsWith('/login') ||
      cleanPath.includes('..') ||
      cleanPath.includes('.')
    ) {
      return
    }

    // Jangan catat jika admin sedang aktif (sesi login admin terdeteksi di cookies)
    if (typeof document !== 'undefined' && document.cookie.includes('esu_admin_session')) {
      return
    }

    // Script analitik TIDAK BOLEH berjalan tanpa izin eksplisit
    if (!hasAnalyticsConsent()) return
    if (lastTracked.current === cleanPath) return
    lastTracked.current = cleanPath

    try {
      fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: cleanPath }),
      }).catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (pathname) {
      sendTrackHit(pathname)
    }

    // Tanggapi jika pengguna baru saja memberikan/mencabut izin analitik
    const handleConsentUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsentSettings>
      if (customEvent.detail?.analytics && pathname) {
        lastTracked.current = ''
        sendTrackHit(pathname)
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated)
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated)
    }
  }, [pathname])

  return null
}
