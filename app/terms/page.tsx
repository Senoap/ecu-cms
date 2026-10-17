// app/terms/page.tsx
import { readPublishedDB, defaultTermsOfService } from '@/lib/db'
import LegalPageClient from '@/components/LegalPageClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const db = await readPublishedDB()
  const title = db.termsOfService?.title || 'Syarat dan Ketentuan'
  return {
    title: `${title} - ${db.setting.siteName}`,
    description: `Syarat dan ketentuan resmi penggunaan situs web ${db.setting.siteName}.`,
  }
}

export default async function TermsPage() {
  const db = await readPublishedDB()
  const legal = db.termsOfService || defaultTermsOfService

  return <LegalPageClient db={db} legal={legal} type="terms" />
}
