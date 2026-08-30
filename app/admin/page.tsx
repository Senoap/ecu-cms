// app/admin/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import AdminPageClient from './AdminPageClient'

async function updateConfig(formData: FormData) {
  'use server'

  const db = await readDB()
  const siteName = formData.get('siteName') as string
  const tagline = formData.get('tagline') as string
  const primaryColor = formData.get('primaryColor') as string
  const slideDuration = parseInt(formData.get('slideDuration') as string) || 3
  const logoFile = formData.get('logoFile') as File
  const bgImageFile = formData.get('bgImageFile') as File

  let logoUrl = db.setting.logoUrl
  let bgImageUrl = db.setting.bgImageUrl

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  if (logoFile && logoFile.size > 0) {
    const bytes = await logoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `logo-${Date.now()}${path.extname(logoFile.name)}`
    fs.writeFileSync(path.join(uploadDir, filename), buffer)
    logoUrl = `/uploads/${filename}`
  }

  if (bgImageFile && bgImageFile.size > 0) {
    const bytes = await bgImageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `bg-${Date.now()}${path.extname(bgImageFile.name)}`
    fs.writeFileSync(path.join(uploadDir, filename), buffer)
    bgImageUrl = `/uploads/${filename}`
  }

  db.setting = {
    ...db.setting,
    siteName,
    tagline,
    primaryColor,
    logoUrl,
    bgImageUrl,
    slideDuration,
  }

  db.sections = db.sections.map((sec) => {
    const isVisible = formData.get(`visible_${sec.id}`) === 'on'
    const orderStr = formData.get(`order_${sec.id}`) as string
    const order = orderStr ? parseInt(orderStr) : sec.order
    const label = (formData.get(`label_${sec.id}`) as string) || sec.label
    return { ...sec, isVisible, order, label }
  })
  db.sections.sort((a, b) => a.order - b.order)

  await writeDB(db)

  await addNotification('Memperbarui Pengaturan Global, Logo, Background, dan Tata Letak Seksi.', 'UPDATE')

  revalidatePath('/admin')
}

export default async function AdminDashboardPage() {
  const db = await readDB()
  
  return (
    <AdminPageClient 
      initialSetting={db.setting} 
      initialSections={db.sections} 
      updateConfigAction={updateConfig} 
    />
  )
}