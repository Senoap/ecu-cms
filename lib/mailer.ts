// lib/mailer.ts
import nodemailer from 'nodemailer'

export interface MailInput {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function createTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  const port = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
}

/**
 * Kirim email via SMTP generik (Brevo / Gmail / domain sendiri).
 * Jika SMTP belum dikonfigurasi, email hanya dicatat ke console (mode dev) dan mengembalikan false.
 * Tidak pernah melempar error agar proses lamaran tidak gagal hanya karena email.
 */
export async function sendMail(input: MailInput): Promise<boolean> {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost'
  const transport = createTransport()
  if (!transport) {
    console.warn(`[mailer] SMTP belum dikonfigurasi. Email ke ${input.to} tidak dikirim. Subjek: ${input.subject}`)
    return false
  }
  try {
    await transport.sendMail({ from, ...input })
    return true
  } catch (err) {
    console.error('[mailer] Gagal mengirim email:', err)
    return false
  }
}
