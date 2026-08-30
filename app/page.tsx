// app/page.tsx
import { readPublishedDB } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const db = await readPublishedDB()

  return <HomeClient db={db} />
}