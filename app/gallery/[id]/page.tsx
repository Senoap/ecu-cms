import type { Metadata } from 'next'
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import GalleryDetailClient from './GalleryDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const db = await readPublishedDB()
  const item = (db.galleries || []).find((g) => g.id === id)
  if (!item) return { title: 'Dokumentasi Tidak Ditemukan' }
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  return {
    title: `Galeri: ${item.title} | ${siteName}`,
    description: item.desc || `Dokumentasi kegiatan dan operasional ${item.title} oleh ${siteName}`,
    openGraph: {
      title: `Galeri: ${item.title} - ${siteName}`,
      description: item.desc || `Dokumentasi ${item.title}`,
      images: item.imageUrl ? [item.imageUrl] : undefined,
    },
  }
}

export default async function GalleryDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = await readPublishedDB()
  const item = (db.galleries || []).find((g) => g.id === id)

  if (!item) {
    notFound()
  }

  return (
    <GalleryDetailClient
      item={item}
      allGalleries={db.galleries || []}
      setting={db.setting}
      footer={db.footer}
    />
  )
}
