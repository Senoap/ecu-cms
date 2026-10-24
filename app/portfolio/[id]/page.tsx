import type { Metadata } from 'next'
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import PortfolioDetailClient from './PortfolioDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const db = await readPublishedDB()
  const item = (db.portfolios || []).find((p) => p.id === id)
  if (!item) return { title: 'Portofolio Tidak Ditemukan' }
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  return {
    title: `${item.name} | ${siteName}`,
    description: item.desc || `Proyek dan Portofolio ${item.name} oleh ${siteName}`,
    openGraph: {
      title: `${item.name} | ${siteName}`,
      description: item.desc || `Proyek dan Portofolio ${item.name} oleh ${siteName}`,
      images: item.imageUrl ? [item.imageUrl] : undefined,
    },
  }
}

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
