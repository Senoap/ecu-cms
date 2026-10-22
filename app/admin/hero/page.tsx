// app/admin/hero/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import HeroPageClient from './HeroPageClient'

async function updateHero(formData: FormData) {
  'use server'
  await requirePermission('hero')
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
  const updatedHero = {
    badge: (formData.get('badge') as string) || '',
    titleLine1: (formData.get('titleLine1') as string) || '',
    titleHighlight: (formData.get('titleHighlight') as string) || '',
    content: (formData.get('description') as string) || '',
    showcaseCard: showcaseCard !== undefined ? showcaseCard : db.hero?.showcaseCard,
  }

  db.sections = db.sections.map((sec) => {
    if (sec.id === 'hero') {
      return {
        ...sec,
        ...updatedHero,
      }
    }
    return sec
  })

  db.hero = {
    ...db.hero,
    badge: updatedHero.badge,
    titleLine1: updatedHero.titleLine1,
    titleHighlight: updatedHero.titleHighlight,
    description: updatedHero.content,
    showcaseCard: updatedHero.showcaseCard,
  }

  const currentUser = await requirePermission('hero')
  await writeDB(db, currentUser)
  await addNotification('Memperbarui konfigurasi Hero Section & Kartu Showcase Korporat.', 'UPDATE', 'system', {
    userName: currentUser.name,
    userRole: currentUser.role
  })
  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export default async function AdminHeroPage() {
  await requirePagePermission('hero')
  const db = await readDB()
  const { hero } = db

  return (
    <HeroPageClient 
      initialHero={hero} 
      updateHeroAction={updateHero} 
    />
  )
}