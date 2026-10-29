// app/admin/seo/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import { getSiteUrl } from '@/lib/site'
import { defaultSeoSetting } from '@/lib/seoConstants'
import SeoClient from './SeoClient'

export const dynamic = 'force-dynamic'

export default async function SeoAdminPage() {
  const user = await requirePagePermission('seo')
  const db = await readDB()

  const seo = db.seoSetting || defaultSeoSetting
  const defaultBaseUrl = getSiteUrl() || 'https://domain.anda'
  const activeBaseUrl = seo.canonicalUrl?.trim()
    ? (seo.canonicalUrl.trim().startsWith('http') ? seo.canonicalUrl.trim().replace(/\/+$/, '') : `https://${seo.canonicalUrl.trim().replace(/\/+$/, '')}`)
    : 'https://domain.anda'

  const services = (db.services || []).map((s) => ({
    id: s.id,
    title: s.title,
    url: `${activeBaseUrl}/services/${s.id}`,
  }))

  const portfolios = (db.portfolios || []).map((p) => ({
    id: p.id,
    title: p.name,
    url: `${activeBaseUrl}/portfolio/${p.id}`,
  }))

  const activeJobs = (db.career || [])
    .filter((j) => j.isActive)
    .map((j) => ({
      id: j.id,
      title: j.title,
      url: `${activeBaseUrl}/career/${j.id}`,
    }))

  const galleries = (db.galleries || []).map((g) => ({
    id: g.id,
    title: g.title,
    url: `${activeBaseUrl}/gallery/${g.id}`,
  }))

  const staticPages = [
    { label: 'Beranda Utama (Homepage)', url: activeBaseUrl, priority: '1.0', changeFreq: 'Mingguan' },
    { label: 'Profil Pimpinan (Leadership)', url: `${activeBaseUrl}/leadership`, priority: '0.7', changeFreq: 'Bulanan' },
    { label: 'Sertifikasi Perusahaan', url: `${activeBaseUrl}/certifications`, priority: '0.7', changeFreq: 'Bulanan' },
    { label: 'Kebijakan Privasi (Privacy Policy)', url: `${activeBaseUrl}/privacy-policy`, priority: '0.3', changeFreq: 'Tahunan' },
    { label: 'Syarat & Ketentuan (Terms of Service)', url: `${activeBaseUrl}/terms`, priority: '0.3', changeFreq: 'Tahunan' },
  ]

  const totalIndexedUrls =
    staticPages.length + services.length + portfolios.length + activeJobs.length + galleries.length

  return (
    <SeoClient
      initialSeo={seo}
      baseUrl={activeBaseUrl}
      defaultBaseUrl={defaultBaseUrl}
      currentUserName={user.name}
      sitemapData={{
        totalIndexedUrls,
        staticPages,
        services,
        portfolios,
        activeJobs,
        galleries,
      }}
    />
  )
}

