// app/leadership/page.tsx
import { readPublishedDB, defaultDirectors } from '@/lib/db'
import LeadershipClient from './LeadershipClient'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const db = await readPublishedDB()
  const siteName = db.setting?.siteName || 'PT Empat Sinergi Utama'
  const leadershipLabel = db.setting?.leadershipLabel || 'Profil Pimpinan'
  return {
    title: `${leadershipLabel} & Tim Manajemen - ${siteName}`,
    description: `Profil pimpinan dan tim manajemen operasional ${siteName}. Mengenal rekam jejak, komitmen mutu, dan integritas ketenagakerjaan kami.`,
  }
}

export default async function LeadershipPage() {
  const db = await readPublishedDB()
  if (db.setting?.showLeadership === false) {
    redirect('/#about')
  }

  const directors = (db.directors && db.directors.length > 0) ? db.directors : defaultDirectors

  return <LeadershipClient db={db} directors={directors} />
}
