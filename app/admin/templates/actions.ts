// app/admin/templates/actions.ts
'use server'

import { 
  readDB, 
  writeDB, 
  addNotification, 
  defaultInquiryTemplates,
  defaultComproEmailTemplate,
  defaultCareerTemplates,
  type CareerReplyTemplate
} from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth'

export async function updateTemplatesAction(formData: FormData) {
  await requirePermission('templates')
  const db = await readDB()

  // 1. Template Konsultasi Layanan & Umum (WhatsApp & Email)
  const waMessage = (formData.get('waMessage') as string)?.trim() || defaultInquiryTemplates.waMessage
  const emailSubject = (formData.get('emailSubject') as string)?.trim() || defaultInquiryTemplates.emailSubject
  const emailBody = (formData.get('emailBody') as string)?.trim() || defaultInquiryTemplates.emailBody

  if (!db.footer) {
    db.footer = {
      description: '',
      address: '',
      phone: '',
      email: '',
      inquiryTemplates: defaultInquiryTemplates,
    }
  }

  db.footer.inquiryTemplates = {
    waMessage,
    emailSubject,
    emailBody,
  }

  // 2. Template Balasan Email Compro PDF
  const comproSubject = (formData.get('comproSubject') as string)?.trim() || defaultComproEmailTemplate.subject
  const comproSenderName = (formData.get('comproSenderName') as string)?.trim() || defaultComproEmailTemplate.senderName
  const comproHeading = (formData.get('comproHeading') as string)?.trim() || defaultComproEmailTemplate.heading
  const comproBody = (formData.get('comproBody') as string)?.trim() || defaultComproEmailTemplate.body
  const comproFooterText = (formData.get('comproFooterText') as string)?.trim() || defaultComproEmailTemplate.footerText

  db.comproEmailTemplate = {
    ...(db.comproEmailTemplate || defaultComproEmailTemplate),
    subject: comproSubject,
    senderName: comproSenderName,
    heading: comproHeading,
    body: comproBody,
    footerText: comproFooterText,
  }

  await writeDB(db)
  await addNotification('Memperbarui Template Pesan WhatsApp dan Email Konsultasi.', 'UPDATE')
  revalidatePath('/admin/templates')
  revalidatePath('/admin/footer')
  revalidatePath('/admin', 'layout')
  revalidatePath('/')
  revalidatePath('/services/[id]', 'page')
}

// =========================================================================
// 3. TEMPLATE BALASAN KARIR & REKRUTMEN (PELAMAR KERJA)
// =========================================================================

export async function createCareerTemplateAction(formData: FormData) {
  await requirePermission('templates')

  const name = String(formData.get('name') ?? '').trim()
  const channel = (String(formData.get('channel') ?? 'both') as 'wa' | 'email' | 'both')
  const subject = String(formData.get('subject') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()

  if (!name) throw new Error('Nama template wajib diisi.')
  if (!body) throw new Error('Isi template pesan wajib diisi.')
  if (channel !== 'wa' && !subject) throw new Error('Subjek email wajib diisi untuk template email.')

  const db = await readDB()
  if (!db.careerTemplates || db.careerTemplates.length === 0) {
    db.careerTemplates = [...defaultCareerTemplates]
  }

  const newTemplate: CareerReplyTemplate = {
    id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name,
    channel,
    subject: subject || undefined,
    body,
    createdAt: Date.now(),
  }

  db.careerTemplates.unshift(newTemplate)
  await writeDB(db)
  await addNotification(`Menambahkan template balasan karir: "${name}".`, 'CREATE', 'career')

  revalidatePath('/admin/templates')
  revalidatePath('/admin/career-templates')
  revalidatePath('/admin/applications')
}

export async function updateCareerTemplateAction(formData: FormData) {
  await requirePermission('templates')

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const channel = (String(formData.get('channel') ?? 'both') as 'wa' | 'email' | 'both')
  const subject = String(formData.get('subject') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()

  if (!id) throw new Error('ID template tidak valid.')
  if (!name) throw new Error('Nama template wajib diisi.')
  if (!body) throw new Error('Isi template pesan wajib diisi.')
  if (channel !== 'wa' && !subject) throw new Error('Subjek email wajib diisi untuk template email.')

  const db = await readDB()
  if (!db.careerTemplates || db.careerTemplates.length === 0) {
    db.careerTemplates = [...defaultCareerTemplates]
  }

  const idx = db.careerTemplates.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error('Template tidak ditemukan.')

  db.careerTemplates[idx] = {
    ...db.careerTemplates[idx],
    name,
    channel,
    subject: subject || undefined,
    body,
  }

  await writeDB(db)
  await addNotification(`Memperbarui template balasan karir: "${name}".`, 'UPDATE', 'career')

  revalidatePath('/admin/templates')
  revalidatePath('/admin/career-templates')
  revalidatePath('/admin/applications')
}

export async function deleteCareerTemplateAction(formData: FormData) {
  await requirePermission('templates')

  const id = String(formData.get('id') ?? '')
  if (!id) return

  const db = await readDB()
  if (!db.careerTemplates) return

  const target = db.careerTemplates.find((t) => t.id === id)
  db.careerTemplates = db.careerTemplates.filter((t) => t.id !== id)

  await writeDB(db)
  await addNotification(`Menghapus template balasan karir: "${target?.name || id}".`, 'DELETE', 'career')

  revalidatePath('/admin/templates')
  revalidatePath('/admin/career-templates')
  revalidatePath('/admin/applications')
}


