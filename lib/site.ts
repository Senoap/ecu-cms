// lib/site.ts
// Sumber tunggal URL situs & helper JSON-LD agar canonical, sitemap, robots, dan structured data konsisten.

const DEFAULT_SITE_URL = 'https://empatsinergiutama.com'

/** URL publik situs tanpa trailing slash. Atur NEXT_PUBLIC_SITE_URL di environment production. */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim()
  return raw.replace(/\/+$/, '')
}

/** Ubah path/URL logo menjadi URL absolut. */
export function toAbsoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${getSiteUrl()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/**
 * Serialisasi JSON-LD yang aman untuk disisipkan di <script>.
 * JSON.stringify saja TIDAK aman: teks CMS berisi "</script>" dapat menutup tag dan menjalankan HTML/JS.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
