import type { MetadataRoute } from 'next'
import { readPublishedDB } from '@/lib/db'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await readPublishedDB()
  const customCanonical = db.seoSetting?.canonicalUrl?.trim()
  const baseUrl = customCanonical ? customCanonical.replace(/\/+$/, '') : getSiteUrl()

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/leadership`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic services
  for (const s of db.services || []) {
    routes.push({
      url: `${baseUrl}/services/${s.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // Dynamic portfolios
  for (const p of db.portfolios || []) {
    routes.push({
      url: `${baseUrl}/portfolio/${p.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  // Dynamic active career
  for (const c of (db.career || []).filter(j => j.isActive)) {
    routes.push({
      url: `${baseUrl}/career/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
  }

  // Dynamic galleries
  for (const g of db.galleries || []) {
    routes.push({
      url: `${baseUrl}/gallery/${g.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return routes
}
