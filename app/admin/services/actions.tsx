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
      const validation = validateImageBuffer(buffer, photoFile.name)
      if (!validation.valid) continue

      let inputBuffer = buffer
      const isHeic = (
        photoFile.name.toLowerCase().endsWith('.heic') ||
        photoFile.name.toLowerCase().endsWith('.heif') ||
        photoFile.type.includes('heic') ||
        photoFile.type.includes('heif') ||
        (buffer.length >= 12 && buffer.subarray(4, 12).toString('ascii').includes('ftyp') && !buffer.subarray(4, 12).toString('ascii').toLowerCase().includes('avif'))
      )

      if (isHeic) {
        try {
          const heicConvertMod = await import('heic-convert')
          const heicConvert = ((heicConvertMod as unknown as { default?: unknown }).default || heicConvertMod) as (options: {
            buffer: Uint8Array
            format: 'JPEG' | 'PNG'
            quality?: number
          }) => Promise<Uint8Array>

          const converted = await heicConvert({
            buffer,
            format: 'JPEG',
            quality: 0.94,
          })
          inputBuffer = Buffer.from(converted)
        } catch (heicErr) {
          console.warn('[ServicesAction] Gagal decode HEIC dengan heic-convert:', heicErr)
        }
      }

      const filename = `service-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`

      const imageInstance = sharp(inputBuffer, { limitInputPixels: 100_000_000 }).rotate()
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
        const cleanWatermark = `© ${watermarkText || 'PT. EMPAT SINERGI UTAMA'}`

        // Konversi teks watermark ke kurva geometri vektor SVG murni menggunakan opentype.js
        // 100% bebas dari ketergantungan font OS / sistem Vercel Linux sehingga kotak tahu (tofu) mustahil muncul!
        const opentypeMod = await import('opentype.js')
        const opentype = ((opentypeMod as unknown as { default?: unknown }).default || opentypeMod) as typeof import('opentype.js')
        const fontBuffer = Buffer.from(WATERMARK_FONT_BASE64, 'base64')
        const ab = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
        const font = opentype.parse(ab)

        const textWidth = font.getAdvanceWidth(cleanWatermark, fontSize)
        const x = (targetWidth - textWidth) / 2
        const y = targetHeight / 2 + Math.round(fontSize * 0.35)

        const textPath = font.getPath(cleanWatermark, x, y, fontSize)
        const pathData = textPath.toPathData(2)
        const strokeWidth = Math.max(1, Math.round(fontSize * 0.035))

        const svgWatermark = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(-30 ${targetWidth / 2} ${targetHeight / 2})">
    <path 
      d="${pathData}" 
      fill="rgba(255, 255, 255, 0.75)" 
      stroke="rgba(0, 0, 0, 0.6)" 
      stroke-width="${strokeWidth}" 
      paint-order="stroke fill"
    />
  </g>
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