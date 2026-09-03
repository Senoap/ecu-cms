// app/portfolio/[id]/page.tsx
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import PortfolioDetailClient from './PortfolioDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PortfolioDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readPublishedDB()
  const item = (db.portfolios || []).find((p) => p.id === id)

  if (!item) {
    notFound()
  }

  return (
    <PortfolioDetailClient
      item={item}
      allPortfolios={db.portfolios || []}
      setting={db.setting}
      footer={db.footer}
    />
  )
}
