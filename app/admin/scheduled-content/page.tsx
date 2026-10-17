// app/admin/scheduled-content/page.tsx
import { requirePermission } from '@/lib/auth'
import { readDB } from '@/lib/db'
import ScheduledContentClient from './ScheduledContentClient'

export const dynamic = 'force-dynamic'

export default async function ScheduledContentPage() {
  await requirePermission('scheduled-content')

  const db = await readDB()
  const contents = db.scheduledContents || []

  return <ScheduledContentClient contents={contents} />
}
