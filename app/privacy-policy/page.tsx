// app/privacy-policy/page.tsx
import { readPublishedDB, defaultPrivacyPolicy } from '@/lib/db'
import LegalPageClient from '@/components/LegalPageClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const db = await readPublishedDB()
  const title = db.privacyPolicy?.title || 'Kebijakan Privasi'
  return {
    title: `${title} - ${db.setting.siteName}`,
    description: `Kebijakan privasi resmi ${db.setting.siteName}. Ketahui bagaimana kami mengumpulkan dan melindungi data Anda.`,
  }
}

export default async function PrivacyPolicyPage() {
  const db = await readPublishedDB()
  const legal = db.privacyPolicy || defaultPrivacyPolicy

  return <LegalPageClient db={db} legal={legal} type="privacy" />
}
