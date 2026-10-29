// app/admin/services/actions.tsx
'use server'
import { readDB, writeDB, addNotification, uploadFile, deleteFile } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import sharp, { type Sharp } from 'sharp'
import { requirePermission } from '@/lib/auth'
import { WATERMARK_FONT_BASE64 } from '@/lib/watermarkFont'
import { validateImageBuffer } from '@/lib/fileSecurity'
import { MAX_IMAGE_FILE_SIZE, isHeicFormat, decodeHeicToSharp } from '@/lib/imageOptimizer'
import type { Font } from 'opentype.js'

// Cache singleton untuk parsing font OpenType agar performa kilat dan hemat memori
let cachedWatermarkFont: Font | null = null

async function getWatermarkFont(): Promise<Font> {
  if (cachedWatermarkFont) return cachedWatermarkFont
  const opentypeMod = await import('opentype.js')
  const opentype = ((opentypeMod as unknown as { default?: unknown }).default || opentypeMod) as typeof import('opentype.js')
  const fontBuffer = Buffer.from(WATERMARK_FONT_BASE64, 'base64')
  const ab = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
  cachedWatermarkFont = opentype.parse(ab)
  return cachedWatermarkFont
}

export async function addService(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission('services')
    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const icon = formData.get('icon') as string || 'Briefcase'

    if (!title) return { success: false, error: 'Judul layanan wajib diisi.' }

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
    return { success: true }
  } catch (err: unknown) {
    console.error('Error saat addService:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menambahkan layanan.'
    }
  }
}

export async function updateService(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission('services')
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const desc = formData.get('desc') as string
    const icon = formData.get('icon') as string
    const content = formData.get('content') as string
    const watermarkText = (formData.get('watermarkText') as string) || 'PT. EMPAT SINERGI UTAMA'
    const applyWatermark = formData.get('applyWatermark') === 'true' || formData.get('applyWatermark') === 'on'
    const photoFiles = formData.getAll('photoFile') as File[]

    const db = await readDB()
    const srv = db.services.find((s) => s.id === id)
    if (!srv) return { success: false, error: 'Layanan tidak ditemukan.' }

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

        const filename = `service-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`

        // 1. Dekode & normalisasi orientasi EXIF serta resize proporsional ke buffer terlebih dahulu.
        // Untuk HEIC: langsung didekode ke raw RGBA buffer via WebAssembly (heic-decode) sehingga sangat cepat (milidetik).
        let imageInstance: Sharp
        if (isHeicFormat(buffer, photoFile.name)) {
          try {
            imageInstance = await decodeHeicToSharp(buffer)
          } catch (heicErr) {
            console.warn('[ServicesAction] Gagal decode HEIC dengan heic-decode:', heicErr)
            imageInstance = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate()
          }
        } else {
          imageInstance = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate()
        }

        const normalizedBuffer = await imageInstance
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .toBuffer()

        const finalMeta = await sharp(normalizedBuffer).metadata()
        const targetWidth = finalMeta.width || 1200
        const targetHeight = finalMeta.height || 800

        let processedSharp = sharp(normalizedBuffer)

        if (applyWatermark) {
          try {
            const font = await getWatermarkFont()
            const minDim = Math.min(targetWidth, targetHeight)
            const fontSize = Math.max(18, Math.round(minDim * 0.055))
            const cleanWatermark = `© ${watermarkText || 'PT. EMPAT SINERGI UTAMA'}`

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

            processedSharp = processedSharp.composite([
              {
                input: svgWatermark,
                gravity: 'center',
              },
            ])
          } catch (wmErr) {
            console.warn('[Watermark] Gagal mengaplikasikan watermark, melanjutkan tanpa watermark:', wmErr)
          }
        }

        const finalBuffer = await processedSharp.webp({ quality: 86, smartSubsample: true }).toBuffer()
        const imageUrl = await uploadFile(finalBuffer, filename, 'image/webp')
        srv.images.push(imageUrl)
      }
    }

    await writeDB(db)
    await addNotification(`Memperbarui layanan: "${title}".`, 'UPDATE')
    revalidatePath('/admin/services')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
    return { success: true }
  } catch (err: unknown) {
    console.error('Error saat updateService:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kendala saat memperbarui layanan.',
    }
  }
}

export async function deleteServiceImage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission('services')
    const serviceId = formData.get('serviceId') as string
    const imagePath = formData.get('imagePath') as string

    const db = await readDB()
    const srv = db.services.find(s => s.id === serviceId)
    if (!srv) return { success: false, error: 'Layanan tidak ditemukan.' }

    if (srv.images && srv.images.includes(imagePath)) {
      srv.images = srv.images.filter(img => img !== imagePath)

      try {
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
    return { success: true }
  } catch (err: unknown) {
    console.error('Error saat deleteServiceImage:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus foto layanan.'
    }
  }
}

export async function deleteService(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
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
    return { success: true }
  } catch (err: unknown) {
    console.error('Error saat deleteService:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus layanan.'
    }
  }
}
