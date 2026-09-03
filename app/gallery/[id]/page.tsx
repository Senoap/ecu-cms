// app/gallery/[id]/page.tsx
import { readPublishedDB } from '@/lib/db'
import { notFound } from 'next/navigation'
import GalleryDetailClient from './GalleryDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
