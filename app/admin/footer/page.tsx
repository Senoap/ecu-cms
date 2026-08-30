// app/admin/footer/page.tsx
import { readDB, writeDB, addNotification } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import FooterPageClient from './FooterPageClient'

async function updateFooter(formData: FormData) {
  'use server'
  const db = await readDB()
  
  // Memperbarui seksi 'contact' di dalam array sections agar konsisten
  db.sections = db.sections.map((sec) => {
    if (sec.id === 'contact') {
      return {
        ...sec,
        content: formData.get('description') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
      }
    }
    return sec
  })

  await writeDB(db)
  await addNotification('Memperbarui informasi Footer & Kontak.', 'UPDATE')
  revalidatePath('/admin/footer')
}

export default async function AdminFooterPage() {
  const db = await readDB()
  const { footer } = db

  return (
    <FooterPageClient 
      initialFooter={footer} 
      updateFooterAction={updateFooter} 
    />
  )
}