// app/admin/career/page.tsx
import { readDB, writeDB, addNotification, CareerItem } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import CareerClient from './CareerClient'

export default async function CareerPage() {
  await requirePagePermission('career')
  const db = await readDB()
  const careers = db.career || []

  const careerSection = db.sections.find(s => s.id === 'career') || {
    subtitle: 'JOIN OUR TEAM',
    title: 'CAREER OPPORTUNITIES',
    content: 'Mari bergabung dan berkembang bersama korporat profesional kami.'
  }

  async function handleSaveHeader(formData: FormData) {
    'use server'
    await requirePermission('career')
    const db = await readDB()
    const subtitle = formData.get('subtitle') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const secIndex = db.sections.findIndex(s => s.id === 'career')
    if (secIndex !== -1) {
      db.sections[secIndex].subtitle = subtitle
      db.sections[secIndex].title = title
      db.sections[secIndex].content = content
    }

    await writeDB(db)
    await addNotification('Memperbarui konfigurasi Header Career Section.', 'UPDATE')
    revalidatePath('/admin/career')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function handleAddCareer(formData: FormData) {
    'use server'
    await requirePermission('career')
    const db = await readDB()
    if (!db.career) db.career = []

    const newCareer: CareerItem = {
      id: 'career-' + Date.now(),
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      desc: formData.get('desc') as string,
      requirements: formData.get('requirements') as string,
      isActive: formData.get('isActive') === 'true',
    }

    db.career.push(newCareer)
    await writeDB(db)
    await addNotification(`Menambahkan lowongan kerja baru: "${newCareer.title}".`, 'CREATE')
    revalidatePath('/admin/career')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function handleUpdateCareer(formData: FormData) {
    'use server'
    await requirePermission('career')
    const db = await readDB()
    const id = formData.get('id') as string

    db.career = db.career.map(c => {
      if (c.id === id) {
        return {
          ...c,
          title: formData.get('title') as string,
          location: formData.get('location') as string,
          type: formData.get('type') as string,
          desc: formData.get('desc') as string,
          requirements: formData.get('requirements') as string,
          isActive: formData.get('isActive') === 'true',
        }
      }
      return c
    })

    await writeDB(db)
    await addNotification('Memperbarui data lowongan kerja.', 'UPDATE')
    revalidatePath('/admin/career')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  async function handleDeleteCareer(formData: FormData) {
    'use server'
    await requirePermission('career')
    const db = await readDB()
    const id = formData.get('id') as string

    db.career = db.career.filter(c => c.id !== id)
    await writeDB(db)
    await addNotification('Menghapus posisi lowongan kerja.', 'DELETE')
    revalidatePath('/admin/career')
    revalidatePath('/admin', 'layout')
    revalidatePath('/')
  }

  return (
    <CareerClient 
      careers={careers}
      careerSection={careerSection}
      saveHeaderAction={handleSaveHeader}
      addCareerAction={handleAddCareer}
      updateCareerAction={handleUpdateCareer}
      deleteCareerAction={handleDeleteCareer}
    />
  )
}