// app/admin/services/page.tsx
import { readDB } from '@/lib/db'
import ServicesClient from './ServicesClient'

export default function AdminServicesPage() {
  const db = readDB()
  return <ServicesClient initialServices={db.services} />
}