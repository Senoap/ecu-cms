// app/page.tsx
import { readPublishedDB } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const db = await readPublishedDB()

  return <HomeClient db={db} />
}