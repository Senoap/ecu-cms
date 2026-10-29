import type { Metadata } from 'next'
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import CareerDetailClient from './CareerDetailClient'
import { getAppSetting, HR_EMAIL_KEY } from '@/lib/applications'
import { getSiteUrl, toAbsoluteUrl, safeJsonLd } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const db = await readPublishedDB()
  const job = (db.career || []).find((j) => j.id === id)
  if (!job) return { title: 'Lowongan Kerja Tidak Ditemukan' }
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  return {
    title: `Karir: ${job.title} | ${siteName}`,
    description: job.desc || `Lowongan pekerjaan ${job.title} (${job.type || 'Full Time'}) di ${job.location || 'Indonesia'}. Bergabunglah bersama ${siteName}.`,
    openGraph: {
      title: `Lowongan Kerja: ${job.title} - ${siteName}`,
      description: job.desc || `Peluang karir ${job.title} di ${siteName}.`,
      type: 'article',
    },
  }
}

export default async function CareerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readPublishedDB()
  const job = (db.career || []).find((j) => j.id === id)

  if (!job) {
    notFound()
  }

  const hrEmail = await getAppSetting(HR_EMAIL_KEY)

  const customDomain = db.seoSetting?.canonicalUrl?.trim()
  const siteUrl = customDomain ? customDomain.replace(/\/+$/, '') : getSiteUrl()
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.desc || `Lowongan kerja ${job.title} di ${db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'}`,
    datePosted: new Date().toISOString().split('T')[0],
    employmentType: job.type?.toLowerCase().includes('part')
      ? 'PART_TIME'
      : job.type?.toLowerCase().includes('contract') || job.type?.toLowerCase().includes('kontrak')
        ? 'CONTRACTOR'
        : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: db.setting.siteName || 'PT. EMPAT SINERGI UTAMA',
      sameAs: siteUrl,
      logo: toAbsoluteUrl(db.setting.logoUrl),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || 'Indonesia',
        addressCountry: 'ID',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jobPostingJsonLd) }}
      />
      <CareerDetailClient
        job={job}
        allJobs={db.career || []}
        setting={db.setting}
        footer={db.footer}
        hrEmail={hrEmail}
      />
    </>
  )
}
