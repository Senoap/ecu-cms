import { readDB, writeDB, addNotification, uploadFile, deleteFile } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import AdminPageClient from './AdminPageClient'

async function updateConfig(formData: FormData) {
  'use server'
  await requirePermission('global')

  const db = await readDB()
  const siteName = formData.get('siteName') as string
  const tagline = formData.get('tagline') as string
  const primaryColor = formData.get('primaryColor') as string
  const secondaryColor = (formData.get('secondaryColor') as string) || db.setting.secondaryColor || '#D4AF37'
  const accentColor = (formData.get('accentColor') as string) || db.setting.accentColor || '#1E293B'
  const loadingBgColor = (formData.get('loadingBgColor') as string) || primaryColor || '#7E1D0C'
  const slideDuration = parseInt(formData.get('slideDuration') as string) || 3
  const logoFile = formData.get('logoFile') as File
  const bgImageFile = formData.get('bgImageFile') as File

  let logoUrl = db.setting.logoUrl
  let bgImageUrl = db.setting.bgImageUrl

  // Handle Logo Upload (hapus logo lama jika diganti)
  if (logoFile && logoFile.size > 0) {
    if (db.setting.logoUrl) {
      const oldName = db.setting.logoUrl.split('/').pop()
      if (oldName && oldName.startsWith('logo-')) {
        await deleteFile(oldName)
      }
    }
    const bytes = await logoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `logo-${Date.now()}${logoFile.name.substring(logoFile.name.lastIndexOf('.'))}`
    logoUrl = await uploadFile(buffer, filename, logoFile.type)
  }

  // Handle Background Image Upload (hapus background lama jika diganti)
  if (bgImageFile && bgImageFile.size > 0) {
    if (db.setting.bgImageUrl) {
      const oldName = db.setting.bgImageUrl.split('/').pop()
      if (oldName && oldName.startsWith('bg-')) {
        await deleteFile(oldName)
      }
    }
    const bytes = await bgImageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `bg-${Date.now()}${bgImageFile.name.substring(bgImageFile.name.lastIndexOf('.'))}`
    bgImageUrl = await uploadFile(buffer, filename, bgImageFile.type)
  }

  const showLeadership = formData.get('showLeadership') === 'on'
  const showCertifications = formData.get('showCertifications') === 'on'
  const showCompro = formData.has('showCompro') ? formData.get('showCompro') === 'on' : db.setting.showCompro !== false
  const leadershipLabel = (formData.get('leadershipLabel') as string) || db.setting.leadershipLabel || 'Profil Pimpinan'

  db.setting = {
    ...db.setting,
    siteName,
    tagline,
    primaryColor,
    secondaryColor,
    accentColor,
    loadingBgColor,
    logoUrl,
    bgImageUrl,
    slideDuration,
    showLeadership,
    showCertifications,
    showCompro,
    leadershipLabel,
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

  await addNotification('Memperbarui Pengaturan Global, Logo, Background, Visibilitas Modul, dan Tata Letak Seksi.', 'UPDATE')

  revalidatePath('/admin', 'layout')
  revalidatePath('/admin')
  revalidatePath('/')
}

export default async function AdminDashboardPage() {
  await requirePagePermission('global')
  const db = await readDB()
  
  return (
    <AdminPageClient 
      initialSetting={db.setting} 
      initialSections={db.sections} 
      updateConfigAction={updateConfig} 
    />
  )
}