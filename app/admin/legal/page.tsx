// app/admin/legal/page.tsx
import { readDB, defaultPrivacyPolicy, defaultTermsOfService } from '@/lib/db'
import LegalClient from './LegalClient'

export const dynamic = 'force-dynamic'

export default async function AdminLegalPage() {
  const db = await readDB()
  const initialPrivacy = db.privacyPolicy || defaultPrivacyPolicy
  const initialTerms = db.termsOfService || defaultTermsOfService

  return (
    <LegalClient 
      initialPrivacy={initialPrivacy} 
      initialTerms={initialTerms} 
    />
  )
}
