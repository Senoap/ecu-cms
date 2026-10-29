import type { MetadataRoute } from 'next'
import { readPublishedDB } from '@/lib/db'
import { getSiteUrl } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const db = await readPublishedDB()
  const customCanonical = db.seoSetting?.canonicalUrl?.trim()
  const baseUrl = customCanonical ? customCanonical.replace(/\/+$/, '') : getSiteUrl()
  const isNoIndex = db.seoSetting?.indexingRobots === 'noindex'

  if (isNoIndex) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cms/', '/admin/', '/login', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
