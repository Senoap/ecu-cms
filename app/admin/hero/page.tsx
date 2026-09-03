// app/admin/hero/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import HeroPageClient from './HeroPageClient'

async function updateHero(formData: FormData) {
  'use server'
  const db = await readDB()
  
  const showcaseCardRaw = formData.get('showcaseCardJson') as string
  let showcaseCard = undefined
  if (showcaseCardRaw) {
    try {
      showcaseCard = JSON.parse(showcaseCardRaw)
    } catch (e) {
      console.error('Gagal parse showcaseCardJson:', e)
    }
  }

  // Memperbarui seksi 'hero' di dalam array sections agar konsisten
  db.sections = db.sections.map((sec) => {
    if (sec.id === 'hero') {
      return {
        ...sec,
        badge: formData.get('badge') as string,
        titleLine1: formData.get('titleLine1') as string,
        titleHighlight: formData.get('titleHighlight') as string,
        content: formData.get('description') as string,
        showcaseCard: showcaseCard !== undefined ? showcaseCard : sec.showcaseCard,
      }
    }
    return sec
  })

  await writeDB(db)
  await addNotification('Memperbarui konfigurasi Hero Section & Kartu Showcase Korporat.', 'UPDATE')
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export default async function AdminHeroPage() {
  const db = await readDB()
  const { hero } = db

  return (
    <HeroPageClient 
      initialHero={hero} 
      updateHeroAction={updateHero} 
    />
  )
}