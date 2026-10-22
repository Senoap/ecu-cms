// app/actions/compro.ts
'use server'

import fs from 'fs'
import path from 'path'
import { readDB, writeDB, addComproRequest, updateComproRequestStatus, deleteComproRequest, defaultComproEmailTemplate, type ComproEmailTemplate } from '@/lib/db'
import { sendMail, escapeHtml, verifyAndTestSmtp, type MailAttachment } from '@/lib/mailer'
import { requirePermission } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Mencari dan menyiapkan berkas PDF Company Profile untuk dilampirkan langsung ke email.
 */
async function resolveComproAttachment(pdfUrlOrPath?: string): Promise<MailAttachment | null> {
  const filename = 'Company-Profile-PT-Empat-Sinergi-Utama.pdf'

  try {
    // 1. Cek path custom lokal jika ada
    if (pdfUrlOrPath && !pdfUrlOrPath.startsWith('http')) {
      const clean = pdfUrlOrPath.replace(/^\//, '')
      const customPath = path.join(process.cwd(), 'public', clean)
      if (fs.existsSync(customPath)) {
        return {
          filename,
          path: customPath,
          contentType: 'application/pdf',
        }
      }
    }

    // 2. Cek default file public/compro.pdf
    const defaultLocalPath = path.join(process.cwd(), 'public', 'compro.pdf')
    if (fs.existsSync(defaultLocalPath)) {
      return {
        filename,
        path: defaultLocalPath,
        contentType: 'application/pdf',
      }
    }

    // 3. Jika URL remote HTTP/HTTPS (misal Supabase Storage)
    if (pdfUrlOrPath && (pdfUrlOrPath.startsWith('http://') || pdfUrlOrPath.startsWith('https://'))) {
      return {
        filename,
        path: pdfUrlOrPath,
        contentType: 'application/pdf',
      }
    }
  } catch (err) {
    console.error('[compro] Gagal menyiapkan lampiran PDF:', err)
  }

  return null
}

export async function submitComproRequest(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const name = (formData.get('name') as string)?.trim()
    const company = (formData.get('company') as string)?.trim() || '-'
    const email = (formData.get('email') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const notes = (formData.get('notes') as string)?.trim()

    if (!name || !email || !phone) {
      return { success: false, message: 'Nama Lengkap, Alamat Email, dan Nomor HP/WhatsApp wajib diisi.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Format alamat email tidak valid.' }
    }

    const item = await addComproRequest({
      name,
      company,
      email,
      phone,
      notes,
    })

    // Kirim email otomatis dengan Compro PDF dilampirkan langsung (attachment)
    const db = await readDB()
    const tpl = db.comproEmailTemplate || defaultComproEmailTemplate
    const pdfUrl = tpl.pdfUrl || '/compro.pdf'
    const siteName = db.setting?.siteName || 'PT Empat Sinergi Utama'

    const subject = (tpl.subject || 'Company Profile Resmi').replace('{company}', company).replace('{name}', name)
    const heading = (tpl.heading || tpl.subject || 'Company Profile Resmi').replace('{company}', company).replace('{name}', name)
    const bodyIntro = (tpl.bodyIntro || tpl.body || '').replace('{company}', company).replace('{name}', name)
    const footerText = tpl.footerText || `${siteName} • Dokumen Resmi`

    const attachment = await resolveComproAttachment(pdfUrl)
    const attachments: MailAttachment[] = attachment ? [attachment] : []

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: bold;">${escapeHtml(heading)}</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(bodyIntro).replace(/\n/g, '<br/>')}</p>
        
        <div style="margin: 24px 0; padding: 18px 20px; background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; text-align: center;">
          <div style="font-size: 26px; line-height: 1; margin-bottom: 6px;">📎</div>
          <div style="font-weight: bold; color: #0f172a; font-size: 14px;">Berkas Terlampir Langsung (PDF Attachment):</div>
          <div style="color: #b45309; font-weight: 800; font-size: 13px; margin-top: 3px;">Company-Profile-PT-Empat-Sinergi-Utama.pdf</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.4;">
            Dokumen profil perusahaan resmi telah disertakan langsung sebagai lampiran pada email ini. Anda dapat langsung membuka atau menyimpannya tanpa perlu membuka tautan eksternal.
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">${escapeHtml(footerText)}</p>
      </div>
    `

    const text = `${heading}\n\n${bodyIntro}\n\n[Berkas Terlampir]: Company-Profile-PT-Empat-Sinergi-Utama.pdf telah dilampirkan langsung pada email ini (silakan buka lampiran dokumen PDF di bawah).\n\n${footerText}`

    const sent = await sendMail({
      to: email,
      subject,
      html,
      text,
      attachments,
    })

    if (sent) {
      await updateComproRequestStatus(item.id, 'sent')
    }

    return {
      success: true,
      message: 'Permintaan Anda berhasil diterima! Salinan Company Profile PT Empat Sinergi Utama sedang dikirimkan ke email Anda dengan berkas PDF terlampir langsung.',
    }
  } catch (error: unknown) {
    console.error('Error submitting compro request:', error)
    return { success: false, message: (error as Error).message || 'Terjadi kesalahan sistem saat memproses permintaan.' }
  }
}

export async function resendComproEmailAction(requestId: string): Promise<{ success: boolean; message: string }> {
  try {
    await requirePermission('compro-requests')
    const db = await readDB()
    const req = (db.comproRequests || []).find((r) => r.id === requestId)
    if (!req) return { success: false, message: 'Data permintaan tidak ditemukan.' }

    const tpl = db.comproEmailTemplate || defaultComproEmailTemplate
    const pdfUrl = tpl.pdfUrl || '/compro.pdf'
    const subject = (tpl.subject || 'Company Profile Resmi').replace('{company}', req.company).replace('{name}', req.name)
    const heading = (tpl.heading || tpl.subject || 'Company Profile Resmi').replace('{company}', req.company).replace('{name}', req.name)
    const bodyIntro = (tpl.bodyIntro || tpl.body || '').replace('{company}', req.company).replace('{name}', req.name)
    const footerText = tpl.footerText || 'PT Empat Sinergi Utama • Dokumen Resmi'

    const attachment = await resolveComproAttachment(pdfUrl)
    const attachments: MailAttachment[] = attachment ? [attachment] : []

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: bold;">${escapeHtml(heading)}</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(bodyIntro).replace(/\n/g, '<br/>')}</p>
        
        <div style="margin: 24px 0; padding: 18px 20px; background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; text-align: center;">
          <div style="font-size: 26px; line-height: 1; margin-bottom: 6px;">📎</div>
          <div style="font-weight: bold; color: #0f172a; font-size: 14px;">Berkas Terlampir Langsung (PDF Attachment):</div>
          <div style="color: #b45309; font-weight: 800; font-size: 13px; margin-top: 3px;">Company-Profile-PT-Empat-Sinergi-Utama.pdf</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.4;">
            Dokumen profil perusahaan resmi telah disertakan langsung sebagai lampiran pada email ini. Anda dapat langsung membuka atau menyimpannya tanpa perlu membuka tautan eksternal.
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">${escapeHtml(footerText)}</p>
      </div>
    `

    const text = `${heading}\n\n${bodyIntro}\n\n[Berkas Terlampir]: Company-Profile-PT-Empat-Sinergi-Utama.pdf telah dilampirkan langsung pada email ini (silakan buka lampiran dokumen PDF di bawah).\n\n${footerText}`

    const sent = await sendMail({
      to: req.email,
      subject,
      html,
      text,
      attachments,
    })

    if (sent) {
      await updateComproRequestStatus(req.id, 'sent')
      revalidatePath('/admin/compro-requests')
      return { success: true, message: `Email Compro berhasil dikirim ulang ke ${req.email} beserta lampiran berkas PDF!` }
    } else {
      return { success: false, message: 'Gagal mengirim email. Periksa konfigurasi SMTP server.' }
    }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message || 'Gagal mengirim email.' }
  }
}

export async function updateComproStatusAction(requestId: string, status: 'sent' | 'pending' | 'followed_up'): Promise<{ success: boolean }> {
  await requirePermission('compro-requests')
  await updateComproRequestStatus(requestId, status)
  revalidatePath('/admin/compro-requests')
  return { success: true }
}

export async function deleteComproRequestAction(requestId: string): Promise<{ success: boolean }> {
  await requirePermission('compro-requests')
  await deleteComproRequest(requestId)
  revalidatePath('/admin/compro-requests')
  return { success: true }
}

export async function saveComproTemplateAction(template: ComproEmailTemplate): Promise<{ success: boolean; message?: string }> {
  const currentUser = await requirePermission('compro-requests')
  const db = await readDB()
  db.comproEmailTemplate = {
    ...defaultComproEmailTemplate,
    ...db.comproEmailTemplate,
    ...template,
  }
  await writeDB(db, currentUser)
  revalidatePath('/admin/compro-requests')
  return { success: true, message: 'Template email berhasil diperbarui.' }
}

export async function uploadComproPdfAction(formData: FormData): Promise<{ success: boolean; message: string; pdfUrl?: string; sizeKb?: number }> {
  try {
    const currentUser = await requirePermission('compro-requests')
    const file = formData.get('file') as File
    if (!file || file.size === 0) {
      return { success: false, message: 'Pilih file PDF terlebih dahulu.' }
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return { success: false, message: 'Berkas harus berformat PDF (.pdf).' }
    }

    // Maksimal 15 MB untuk lampiran email
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, message: 'Ukuran file PDF maksimal 15 MB agar dapat terkirim lancar via lampiran email.' }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { validatePdfBuffer } = await import('@/lib/fileSecurity')
    const pdfCheck = validatePdfBuffer(buffer)
    if (!pdfCheck.valid) {
      return { success: false, message: pdfCheck.message || 'Berkas bukan dokumen PDF yang sah.' }
    }

    const publicDir = path.join(process.cwd(), 'public')
    const targetFile = path.join(publicDir, 'compro.pdf')
    await fs.promises.writeFile(targetFile, buffer)

    const db = await readDB()
    db.comproEmailTemplate = {
      ...defaultComproEmailTemplate,
      ...db.comproEmailTemplate,
      pdfUrl: '/compro.pdf',
    }
    await writeDB(db, currentUser)
    revalidatePath('/admin/compro-requests')

    const sizeKb = Math.round(file.size / 1024)
    return {
      success: true,
      message: `Berkas PDF Company Profile (${sizeKb} KB) berhasil diperbarui dan siap dikirim sebagai lampiran email langsung!`,
      pdfUrl: '/compro.pdf',
      sizeKb,
    }
  } catch (error: unknown) {
    return { success: false, message: (error as Error).message || 'Gagal mengunggah berkas PDF.' }
  }
}

export async function getComproPdfInfoAction(): Promise<{ exists: boolean; sizeKb: number; filename: string }> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'compro.pdf')
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      return {
        exists: true,
        sizeKb: Math.round(stats.size / 1024),
        filename: 'compro.pdf',
      }
    }
  } catch (err) {
    console.error('Gagal mengecek file PDF compro:', err)
  }
  return { exists: false, sizeKb: 0, filename: 'compro.pdf' }
}

export async function getSmtpStatusAction(): Promise<{
  configured: boolean
  host?: string
  port?: number
  userMasked?: string
  from?: string
  secure?: boolean
}> {
  await requirePermission('compro-requests')
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const configured = Boolean(host && user)

  let userMasked = undefined
  if (user) {
    const parts = user.split('@')
    if (parts.length === 2) {
      const name = parts[0]
      const visible = name.slice(0, 3)
      userMasked = `${visible}***@${parts[1]}`
    } else {
      userMasked = `${user.slice(0, 3)}***`
    }
  }

  return {
    configured,
    host: host || undefined,
    port: Number(process.env.SMTP_PORT || 587),
    userMasked,
    from: process.env.MAIL_FROM || user || undefined,
    secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
  }
}

export async function testSmtpAction(testEmail?: string): Promise<{ success: boolean; message: string }> {
  await requirePermission('compro-requests')
  return await verifyAndTestSmtp(testEmail)
}
