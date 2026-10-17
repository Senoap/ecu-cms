// app/admin/career-templates/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB, defaultCareerTemplates } from '@/lib/db'
import CareerTemplatesClient from './CareerTemplatesClient'

export const dynamic = 'force-dynamic'

export default async function CareerTemplatesPage() {
  await requirePagePermission('career-templates')

  const db = await readDB()
  const templates = (db.careerTemplates && db.careerTemplates.length > 0)
    ? db.careerTemplates
    : defaultCareerTemplates

  return <CareerTemplatesClient templates={templates} />
}
