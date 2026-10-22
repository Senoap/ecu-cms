// app/admin/about/page.tsx
import { readDB, writeDB, addNotification, uploadFile, DirectorItem, defaultLeadershipPageConfig, type LeadershipPageConfig } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import AboutClient from './AboutClient'

export default async function AdminAboutPage() {
  await requirePagePermission('about')
  const db = await readDB()
  const aboutSec = db.sections.find(s => s.id === 'about') || {
    subtitle: 'ABOUT US',
    title: 'Mitra Strategis Ketenagakerjaan Anda',
    p1: '',
    p2: '',
    leadershipTitle: 'Rekam Jejak Teruji',
    leadershipDesc: '',
    quote: 'Integritas, Profesionalisme, Kualitas'
  }

  async function saveAboutAction(formData: FormData) {
    'use server'
    const currentUser = await requirePermission('about')
    const db = await readDB()
    const subtitle = formData.get('subtitle') as string
    const title = formData.get('title') as string
    const p1 = formData.get('p1') as string
    const p2 = formData.get('p2') as string
    const leadershipTitle = formData.get('leadershipTitle') as string
    const leadershipDesc = formData.get('leadershipDesc') as string
    const quote = formData.get('quote') as string

    const secIndex = db.sections.findIndex(s => s.id === 'about')
    if (secIndex !== -1) {
      db.sections[secIndex].subtitle = subtitle
      db.sections[secIndex].title = title
      db.sections[secIndex].p1 = p1
      db.sections[secIndex].p2 = p2
      db.sections[secIndex].leadershipTitle = leadershipTitle
      db.sections[secIndex].leadershipDesc = leadershipDesc
      db.sections[secIndex].quote = quote
    }

    await writeDB(db, currentUser)
    await addNotification('Memperbarui informasi seksi About Us (Who We Are).', 'UPDATE', 'system', {
      userName: currentUser.name,
      userRole: currentUser.role
    })
    revalidatePath('/admin/about')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function saveDirectorsAction(directors: DirectorItem[]) {
    'use server'
    const currentUser = await requirePermission('about')
    const db = await readDB()
    db.directors = directors
    await writeDB(db, currentUser)
    await addNotification(`Memperbarui daftar Profil Pimpinan & Tim Manajemen (${directors.length} figur).`, 'UPDATE', 'system', {
      userName: currentUser.name,
      userRole: currentUser.role
    })
    revalidatePath('/admin/about')
    revalidatePath('/admin', 'layout')
    revalidatePath('/leadership')
    revalidatePath('/')
  }

  async function uploadDirectorPhotoAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    'use server'
    await requirePermission('about')
    try {
      const file = formData.get('photo') as File | null
      if (!file || file.size === 0) {
        return { success: false, error: 'Tidak ada berkas gambar yang dipilih.' }
      }

      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'Ukuran berkas melebihi batas maksimal 10MB.' }
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const rawName = file.name || 'director.jpg'
      const cleanFileName = `director-${timestamp}-${rawName.replace(/\s+/g, '_')}`

      const uploadedUrl = await uploadFile(buffer, cleanFileName, file.type || 'image/jpeg')
      return { success: true, url: uploadedUrl }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto profil.'
      return { success: false, error: msg }
    }
  }

  async function saveLeadershipPageAction(config: LeadershipPageConfig) {
    'use server'
    const currentUser = await requirePermission('about')
    const db = await readDB()
    db.leadershipPage = config
    await writeDB(db, currentUser)
    await addNotification('Memperbarui kustomisasi konten & narasi halaman /leadership.', 'UPDATE', 'system', {
      userName: currentUser.name,
      userRole: currentUser.role
    })
    revalidatePath('/admin/about')
    revalidatePath('/admin', 'layout')
    revalidatePath('/leadership')
    revalidatePath('/')
  }

  async function toggleLeadershipVisibilityAction(showLeadership: boolean) {
    'use server'
    const currentUser = await requirePermission('about')
    const db = await readDB()
    db.setting = {
      ...db.setting,
      showLeadership,
    }
    await writeDB(db, currentUser)
    await addNotification(
      showLeadership 
        ? 'Mengaktifkan publikasi Profil Pimpinan ke website.' 
        : 'Menonaktifkan / menyembunyikan Profil Pimpinan dari website.', 
      'UPDATE', 
      'system', 
      {
        userName: currentUser.name,
        userRole: currentUser.role
      }
    )
    revalidatePath('/admin/about')
    revalidatePath('/admin')
    revalidatePath('/admin', 'layout')
    revalidatePath('/leadership')
    revalidatePath('/')
  }

  return (
    <AboutClient
      aboutData={aboutSec}
      directors={db.directors || []}
      showLeadership={db.setting?.showLeadership !== false}
      leadershipLabel={db.setting?.leadershipLabel || 'Profil Pimpinan'}
      leadershipPageConfig={db.leadershipPage || defaultLeadershipPageConfig}
      saveAboutAction={saveAboutAction}
      saveDirectorsAction={saveDirectorsAction}
      saveLeadershipPageAction={saveLeadershipPageAction}
      uploadDirectorPhotoAction={uploadDirectorPhotoAction}
      toggleLeadershipVisibilityAction={toggleLeadershipVisibilityAction}
    />
  )
}