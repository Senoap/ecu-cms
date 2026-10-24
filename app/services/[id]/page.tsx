import type { Metadata } from 'next'
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import ServiceDetailClient from './ServiceDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const db = await readPublishedDB()
  const srv = (db.services || []).find((s) => s.id === id)
  if (!srv) return { title: 'Layanan Tidak Ditemukan' }
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  const firstImage = srv.images && srv.images.length > 0 ? srv.images[0] : undefined
  return {
    title: `${srv.title} | ${siteName}`,
    description: srv.desc || `Layanan ${srv.title} dari ${siteName}`,
    openGraph: {
      title: `${srv.title} | ${siteName}`,
      description: srv.desc || `Layanan ${srv.title} dari ${siteName}`,
      images: firstImage ? [firstImage] : undefined,
    },
  }
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readPublishedDB()
  const srv = (db.services || []).find((s) => s.id === id)

  if (!srv) {
    notFound()
  }

  return (
    <ServiceDetailClient
      srv={srv}
      setting={db.setting}
      footer={db.footer}
    />
  )
}