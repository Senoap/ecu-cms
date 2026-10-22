// app/certifications/page.tsx
import { readPublishedDB, defaultCertifications } from '@/lib/db'
import CertificationsClient from './CertificationsClient'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const db = await readPublishedDB()
  const siteName = db.setting?.siteName || 'PT Empat Sinergi Utama'
  const title = db.certificationsPage?.headerTitle || 'Sertifikasi & Izin Operasional Resmi'
  const desc = db.certificationsPage?.headerDesc
    ? db.certificationsPage.headerDesc.replace('{company}', siteName)
    : `Daftar sertifikasi ISO 9001, ISO 45001, dan izin operasional resmi BUJP POLRI milik ${siteName} terlindungi watermark digital.`
  return {
    title: `${title} - ${siteName}`,
    description: desc,
  }
}

export default async function CertificationsPage() {
  const db = await readPublishedDB()
  if (db.setting?.showCertifications === false) {
    redirect('/#about')
  }

  const certifications = (db.certifications && db.certifications.length > 0) ? db.certifications : defaultCertifications

  return <CertificationsClient db={db} certifications={certifications} />
}
