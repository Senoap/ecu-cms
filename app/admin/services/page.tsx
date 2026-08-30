// app/admin/services/page.tsx
import { readDB } from '@/lib/db'
import ServicesClient from './ServicesClient'

export default async function AdminServicesPage() {
  const db = await readDB()
  return <ServicesClient initialServices={db.services} />
}