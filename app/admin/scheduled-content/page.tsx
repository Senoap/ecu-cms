// app/admin/scheduled-content/page.tsx
import { requirePagePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import ScheduledContentClient from './ScheduledContentClient'

export const dynamic = 'force-dynamic'

export default async function ScheduledContentPage() {
  await requirePagePermission('scheduled-content')

  const db = await readDB()
  const contents = db.scheduledContents || []

  return <ScheduledContentClient contents={contents} />
}
