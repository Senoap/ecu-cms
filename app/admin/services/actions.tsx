// app/admin/services/actions.tsx
'use server'
import { readDB, writeDB, addNotification, uploadFile, deleteFile } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { requirePermission } from '@/lib/auth'
import { WATERMARK_FONT_BASE64 } from '@/lib/watermarkFont'
import { validateImageBuffer } from '@/lib/fileSecurity'
import { MAX_IMAGE_FILE_SIZE } from '@/lib/imageOptimizer'


function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string))
}

export async function addService(formData: FormData) {
  await requirePermission('services')
  const title = formData.get('title') as string
  const desc = formData.get('desc') as string
  const icon = formData.get('icon') as string || 'Briefcase'

  if (!title) return

  const db = await readDB()
  db.services.push({
    id: crypto.randomUUID(),
    title,
    desc,
    icon,
    content: desc,
    images: []
  })
  await writeDB(db)
  await addNotification(`Menambahkan layanan baru: "${title}".`, 'CREATE')
  revalidatePath('/admin/services')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}

export async function updateService(formData: FormData) {
  await requirePermission('services')
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const desc = formData.get('desc') as string
  const icon = formData.get('icon') as string
  const content = formData.get('content') as string
  const watermarkText = formData.get('watermarkText') as string || 'PT. EMPAT SINERGI UTAMA'
  const applyWatermark = formData.get('applyWatermark') === 'true' || formData.get('applyWatermark') === 'on'
  const photoFiles = formData.getAll('photoFile') as File[]

  const db = await readDB()
  const srv = db.services.find(s => s.id === id)
  if (!srv) return

  srv.title = title
  srv.desc = desc
  srv.icon = icon
  srv.content = content

  if (!srv.images) srv.images = []

  for (const photoFile of photoFiles) {
    if (photoFile && photoFile.size > 0) {
      if (srv.images.length >= 10) break
      if (photoFile.size > MAX_IMAGE_FILE_SIZE) continue

      const bytes = await photoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Validasi biner gambar (Mendukung JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF, HEIC/HEIF, SVG)
      const validation = validateImageBuffer(buffer)
      if (!validation.valid) continue

      const filename = `service-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`

      const imageInstance = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate()
      const metadata = await imageInstance.metadata()
      const origWidth = metadata.width || 1200
      const origHeight = metadata.height || 800

      let targetWidth = origWidth
      let targetHeight = origHeight
      if (origWidth > 1200) {
        targetWidth = 1200
        targetHeight = Math.round(origHeight * (1200 / origWidth))
      }

      let processedBuffer = imageInstance.resize({ width: 1200, withoutEnlargement: true })

      if (applyWatermark) {
        const fontSize = Math.max(22, Math.round(targetWidth * 0.045))
        const strokeWidth = Math.max(1, Math.round(fontSize * 0.035))
        const cleanWatermark = escapeXml(watermarkText || 'PT. EMPAT SINERGI UTAMA')

        const svgWatermark = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'WatermarkCustomFont';
        src: url(data:font/truetype;charset=utf-8;base64,${WATERMARK_FONT_BASE64}) format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      .wm-text {
        font-family: 'WatermarkCustomFont', sans-serif;
        font-size: ${fontSize}px;
        font-weight: bold;
        fill: rgba(255, 255, 255, 0.75);
        stroke: rgba(0, 0, 0, 0.6);
        stroke-width: ${strokeWidth}px;
        paint-order: stroke fill;
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>
  <text 
    x="50%" 
    y="50%" 
    transform="rotate(-30 ${targetWidth / 2} ${targetHeight / 2})" 
    class="wm-text"
  >&#169; ${cleanWatermark}</text>
</svg>`)

        processedBuffer = processedBuffer.composite([
          {
            input: svgWatermark,
            gravity: 'center'
          }
        ])
      }

      const finalBuffer = await processedBuffer.webp({ quality: 86, smartSubsample: true }).toBuffer()

      const imageUrl = await uploadFile(finalBuffer, filename, 'image/webp')
      srv.images.push(imageUrl)
    }
  }

  await writeDB(db)
  await addNotification(`Memperbarui layanan: "${title}".`, 'UPDATE')
  revalidatePath('/admin/services')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}

export async function deleteServiceImage(formData: FormData) {
  await requirePermission('services')
  const serviceId = formData.get('serviceId') as string
  const imagePath = formData.get('imagePath') as string

  const db = await readDB()
  const srv = db.services.find(s => s.id === serviceId)
  if (!srv) return

  if (srv.images && srv.images.includes(imagePath)) {
    srv.images = srv.images.filter(img => img !== imagePath)

    try {
      // Ekstrak nama file dari URL publik Supabase, lalu hapus dari storage
      const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1)
      await deleteFile(fileName)
    } catch (e) {
      console.error('Gagal menghapus file dari storage:', e)
    }
  }

  await writeDB(db)
  await addNotification(`Menghapus foto galeri layanan "${srv.title}".`, 'DELETE')
  revalidatePath('/admin/services')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}

export async function deleteService(formData: FormData) {
  await requirePermission('services')
  const id = formData.get('id') as string
  const db = await readDB()
  const target = db.services.find(s => s.id === id)
  db.services = db.services.filter((s) => s.id !== id)
  await writeDB(db)
  await addNotification(`Menghapus layanan: "${target?.title || id}".`, 'DELETE')
  revalidatePath('/admin/services')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}