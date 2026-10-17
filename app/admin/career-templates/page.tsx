// app/admin/career-templates/page.tsx
import { requireAdmin } from '@/lib/auth'
import { readDB, defaultCareerTemplates } from '@/lib/db'
import CareerTemplatesClient from './CareerTemplatesClient'

export const dynamic = 'force-dynamic'

export default async function CareerTemplatesPage() {
  await requireAdmin()

  const db = await readDB()
  const templates = (db.careerTemplates && db.careerTemplates.length > 0)
    ? db.careerTemplates
    : defaultCareerTemplates

  return <CareerTemplatesClient templates={templates} />
}
