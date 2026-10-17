// app/career/[id]/page.tsx
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import CareerDetailClient from './CareerDetailClient'
import { getAppSetting, HR_EMAIL_KEY } from '@/lib/applications'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CareerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readPublishedDB()
  const job = (db.career || []).find((j) => j.id === id)

  if (!job) {
    notFound()
  }

  const hrEmail = await getAppSetting(HR_EMAIL_KEY)

  return (
    <CareerDetailClient
      job={job}
      allJobs={db.career || []}
      setting={db.setting}
      footer={db.footer}
      hrEmail={hrEmail}
    />
  )
}
