// app/admin/hero/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import HeroPageClient from './HeroPageClient'

async function updateHero(formData: FormData) {
  'use server'
  const db = readDB()
  
  // Memperbarui seksi 'hero' di dalam array sections agar konsisten
  db.sections = db.sections.map((sec) => {
    if (sec.id === 'hero') {
      return {
        ...sec,
        badge: formData.get('badge') as string,
        titleLine1: formData.get('titleLine1') as string,
        titleHighlight: formData.get('titleHighlight') as string,
        content: formData.get('description') as string,
      }
    }
    return sec
  })

  writeDB(db)
  addNotification('Memperbarui konfigurasi Hero Section.', 'UPDATE')
  revalidatePath('/admin/hero')
}

export default async function AdminHeroPage() {
  const db = readDB()
  const { hero } = db

  return (
    <HeroPageClient 
      initialHero={hero} 
      updateHeroAction={updateHero} 
    />
  )
}