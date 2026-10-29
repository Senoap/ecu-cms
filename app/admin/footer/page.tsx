// app/admin/footer/page.tsx
import { 
  readDB, 
  writeDB, 
  addNotification, 
  defaultFooterSocialMedia, 
  defaultInquiryTemplates 
} from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import FooterPageClient from './FooterPageClient'

async function updateFooter(formData: FormData) {
  'use server'
  await requirePermission('footer')
  const db = await readDB()
  
  const desc = (formData.get('description') as string)?.trim() || ''
  const addr = (formData.get('address') as string)?.trim() || ''
  const phone = (formData.get('phone') as string)?.trim() || ''
  const wa = ((formData.get('whatsapp') as string)?.trim()) || phone
  const email = (formData.get('email') as string)?.trim() || ''

  const socialEnabled = formData.get('socialEnabled') === 'true' || formData.get('socialEnabled') === 'on'
  const socialMedia = {
    enabled: socialEnabled,
    instagram: (formData.get('instagram') as string)?.trim() || '',
    linkedin: (formData.get('linkedin') as string)?.trim() || '',
    facebook: (formData.get('facebook') as string)?.trim() || '',
    tiktok: (formData.get('tiktok') as string)?.trim() || '',
    youtube: (formData.get('youtube') as string)?.trim() || '',
  }

  const inquiryTemplates = db.footer?.inquiryTemplates || defaultInquiryTemplates

  db.footer = {
    description: desc,
    address: addr,
    phone,
    whatsapp: wa,
    email,
    socialMedia,
    inquiryTemplates,
  }

  // Memperbarui seksi 'contact' di dalam array sections agar konsisten
  db.sections = db.sections.map((sec) => {
    if (sec.id === 'contact') {
      return {
        ...sec,
        content: desc,
        address: addr,
        phone,
        whatsapp: wa,
        email,
      }
    }
    return sec
  })

  await writeDB(db)
  await addNotification('Memperbarui informasi Footer, Media Sosial, dan Template Pertanyaan.', 'UPDATE')
  revalidatePath('/admin/footer')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
}

export default async function AdminFooterPage() {
  await requirePagePermission('footer')
  const db = await readDB()
  const footer = {
    ...db.footer,
    socialMedia: db.footer.socialMedia || defaultFooterSocialMedia,
    inquiryTemplates: db.footer.inquiryTemplates || defaultInquiryTemplates,
  }

  return (
    <FooterPageClient 
      initialFooter={footer} 
      updateFooterAction={updateFooter} 
    />
  )
}