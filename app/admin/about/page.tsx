// app/admin/about/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import AboutClient from './AboutClient'

export default function AdminAboutPage() {
  const db = readDB()
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
    const db = readDB()
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

    writeDB(db)
    addNotification('Memperbarui informasi seksi About Us (Who We Are).', 'UPDATE')
    revalidatePath('/admin/about')
    revalidatePath('/')
  }

  return (
    <AboutClient
      aboutData={aboutSec}
      saveAboutAction={saveAboutAction}
    />
  )
}