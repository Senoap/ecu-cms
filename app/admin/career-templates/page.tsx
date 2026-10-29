// app/admin/career-templates/page.tsx
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CareerTemplatesPage() {
  redirect('/cms/templates?tab=career')
}
