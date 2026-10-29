// app/admin/templates/page.tsx
import { 
  readDB, 
  defaultInquiryTemplates,
  defaultComproEmailTemplate,
  defaultCareerTemplates 
} from '@/lib/db'
import { requirePagePermission } from '@/lib/auth'
import TemplatesPageClient from './TemplatesPageClient'

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  await requirePagePermission('templates')
  const db = await readDB()
  const params = searchParams ? await searchParams : undefined

  const inquiryTemplates = db.footer?.inquiryTemplates || defaultInquiryTemplates
  const comproTemplate = db.comproEmailTemplate || defaultComproEmailTemplate
  const careerTemplates = (db.careerTemplates && db.careerTemplates.length > 0)
    ? db.careerTemplates
    : defaultCareerTemplates
  const servicesList = (db.services || []).map((s) => ({ id: s.id, title: s.title }))
  const companyName = db.setting?.siteName || 'PT. EMPAT SINERGI UTAMA'

  const validTab = (params?.tab === 'compro' || params?.tab === 'career') 
    ? params.tab 
    : 'inquiry'

  return (
    <TemplatesPageClient 
      initialInquiry={inquiryTemplates}
      initialCompro={comproTemplate}
      careerTemplates={careerTemplates}
      servicesList={servicesList}
      companyName={companyName}
      initialTab={validTab}
    />
  )
}
