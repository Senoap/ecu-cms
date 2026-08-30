// app/admin/services/actions.tsx
'use server'
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

export async function addService(formData: FormData) {
  const title = formData.get('title') as string
  const desc = formData.get('desc') as string
  const icon = formData.get('icon') as string || 'Briefcase'

  if (!title) return

  const db = readDB()
  db.services.push({
    id: Date.now().toString(),
    title,
    desc,
    icon,
    content: desc,
    images: []
  })
  writeDB(db)
  addNotification(`Menambahkan layanan baru: "${title}".`, 'CREATE')
  revalidatePath('/admin/services')
}

export async function updateService(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const desc = formData.get('desc') as string
  const icon = formData.get('icon') as string
  const content = formData.get('content') as string
  const watermarkText = formData.get('watermarkText') as string || 'PT. EMPAT SINERGI UTAMA'
  const applyWatermark = formData.get('applyWatermark') === 'on'
  const photoFiles = formData.getAll('photoFile') as File[]

  const db = readDB()
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

      const bytes = await photoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `service-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const imageInstance = sharp(buffer)
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
        const fontSize = Math.round(targetWidth * 0.045)

        const svgWatermark = Buffer.from(`
          <svg width="${targetWidth}" height="${targetHeight}">
            <style>
              .text { 
                fill: rgba(255, 255, 255, 0.6); 
                stroke: rgba(0, 0, 0, 0.65); 
                stroke-width: 1.5px; 
                font-size: ${fontSize}px; 
                font-weight: bold; 
                font-family: Arial, sans-serif; 
                letter-spacing: 3px; 
                text-anchor: middle;
                dominant-baseline: central;
              }
            </style>
            <text x="50%" y="50%" transform="rotate(-30 ${targetWidth / 2} ${targetHeight / 2})" class="text">© ${watermarkText}</text>
          </svg>
        `)

        processedBuffer = processedBuffer.composite([
          {
            input: svgWatermark,
            gravity: 'center'
          }
        ])
      }

      const finalBuffer = await processedBuffer.jpeg({ quality: 85 }).toBuffer()

      fs.writeFileSync(path.join(uploadDir, filename), finalBuffer)
      srv.images.push(`/uploads/${filename}`)
    }
  }

  writeDB(db)
  addNotification(`Memperbarui layanan: "${title}".`, 'UPDATE')
  revalidatePath('/admin/services')
}

export async function deleteServiceImage(formData: FormData) {
  const serviceId = formData.get('serviceId') as string
  const imagePath = formData.get('imagePath') as string

  const db = readDB()
  const srv = db.services.find(s => s.id === serviceId)
  if (!srv) return

  if (srv.images) {
    srv.images = srv.images.filter(img => img !== imagePath)

    try {
      const filePath = path.join(process.cwd(), 'public', imagePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (e) {
      console.error('Gagal menghapus file fisik:', e)
    }
  }

  writeDB(db)
  addNotification(`Menghapus foto galeri layanan "${srv.title}".`, 'DELETE')
  revalidatePath('/admin/services')
}

export async function deleteService(formData: FormData) {
  const id = formData.get('id') as string
  const db = readDB()
  const target = db.services.find(s => s.id === id)
  db.services = db.services.filter((s) => s.id !== id)
  writeDB(db)
  addNotification(`Menghapus layanan: "${target?.title || id}".`, 'DELETE')
  revalidatePath('/admin/services')
}