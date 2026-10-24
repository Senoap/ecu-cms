// lib/cookieConsent.ts
// Manajemen preferensi cookie sesuai regulasi privasi & UU PDP.

export interface CookieConsentSettings {
  essential: true // Selalu aktif
  analytics: boolean
  updatedAt: number
}

export const COOKIE_CONSENT_KEY = 'esu_cookie_consent'
export const COOKIE_CONSENT_EVENT = 'esu-cookie-consent-updated'
export const OPEN_COOKIE_SETTINGS_EVENT = 'open-cookie-settings'

/**
 * Membaca preferensi cookie dari localStorage / document.cookie.
 * Mengembalikan null jika pengguna belum membuat pilihan.
 */
export function getCookieConsent(): CookieConsentSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null && parsed.essential === true) {
        return {
          essential: true,
          analytics: Boolean(parsed.analytics),
          updatedAt: Number(parsed.updatedAt) || Date.now(),
        }
      }
    }

    // Fallback baca dari document.cookie jika localStorage kosong
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_KEY}=([^;]*)`))
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1]))
      if (typeof parsed === 'object' && parsed !== null && parsed.essential === true) {
        return {
          essential: true,
          analytics: Boolean(parsed.analytics),
          updatedAt: Number(parsed.updatedAt) || Date.now(),
        }
      }
    }
  } catch {}
  return null
}

/**
 * Menyimpan preferensi cookie ke localStorage & document.cookie,
 * lalu menyiarkan event agar script pelacak (VisitorTracker dll.) langsung merespons.
 */
export function saveCookieConsent(analytics: boolean): CookieConsentSettings {
  const settings: CookieConsentSettings = {
    essential: true,
    analytics: Boolean(analytics),
    updatedAt: Date.now(),
  }

  if (typeof window !== 'undefined') {
    try {
      const json = JSON.stringify(settings)
      localStorage.setItem(COOKIE_CONSENT_KEY, json)
      // Cookie berlaku 365 hari
      document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(json)}; path=/; max-age=31536000; SameSite=Lax`
      window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: settings }))
    } catch {}
  }

  return settings
}

/**
 * Memeriksa apakah pelacakan analitik diizinkan oleh pengguna.
 * Jika belum ada izin eksplisit, kembalikan FALSE.
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent()
  return Boolean(consent?.analytics)
}

/**
 * Membuka panel preferensi cookie dari footer atau menu lain kapan saja.
 */
export function openCookieSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))
  }
}
