// components/VisitorTracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { hasAnalyticsConsent, COOKIE_CONSENT_EVENT, type CookieConsentSettings } from '@/lib/cookieConsent'

export default function VisitorTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')

  const sendTrackHit = (path: string) => {
    if (!path || path.startsWith('/cms') || path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/login')) return
    // Script analitik TIDAK BOLEH berjalan tanpa izin eksplisit
    if (!hasAnalyticsConsent()) return
    if (lastTracked.current === path) return
    lastTracked.current = path

    try {
      fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
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
