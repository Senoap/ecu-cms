// app/admin/services/page.tsx
import { readDB } from '@/lib/db'
import { requirePagePermission } from '@/lib/auth'
import ServicesClient from './ServicesClient'

export default async function AdminServicesPage() {
  await requirePagePermission('services')
  const db = await readDB()
  return <ServicesClient initialServices={db.services} />
}