// app/page.tsx
import { readPublishedDB } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  // Aman karena berjalan di Server (bisa akses fs)
  const db = readPublishedDB() 

  return <HomeClient db={db} />
}