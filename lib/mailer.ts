// lib/mailer.ts
import nodemailer from 'nodemailer'

export interface MailAttachment {
  filename: string
  content?: Buffer | string
  path?: string
  contentType?: string
}

export interface MailInput {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  attachments?: MailAttachment[]
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function createTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  const port = Number(process.env.SMTP_PORT || 587)
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    tls: {
      // Mengizinkan koneksi aman ke Mailspace / cPanel / Webmail dengan sertifikat shared hosting
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true' ? true : false,
    },
  })
}

/**
 * Kirim email via SMTP generik (Mailspace, Google Workspace, Brevo, cPanel, atau domain sendiri).
 * Jika SMTP belum dikonfigurasi, email dicatat ke log sistem (mode dev) dan mengembalikan false.
 * Tidak pernah melempar unhandled exception agar alur kerja utama tidak terhenti.
 */
export async function sendMail(input: MailInput): Promise<boolean> {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@empatsinergiutama.com'
  const transport = createTransport()
  if (!transport) {
    console.warn(`[mailer] SMTP belum dikonfigurasi. Email ke ${input.to} tidak dikirim. Subjek: ${input.subject}`)
    return false
  }
  try {
    await transport.sendMail({ from, ...input })
    return true
  } catch (err) {
    console.error('[mailer] Gagal mengirim email via SMTP:', err)
    return false
  }
}

/**
 * Verifikasi koneksi ke server SMTP dan opsional kirim email uji coba.
 */
export async function verifyAndTestSmtp(testEmail?: string): Promise<{ success: boolean; message: string }> {
  const host = process.env.SMTP_HOST
  if (!host) {
    return {
      success: false,
      message: 'SMTP_HOST belum dikonfigurasi di file environment (.env). Silakan atur SMTP_HOST, SMTP_PORT, SMTP_USER, dan SMTP_PASS.',
    }
  }

  const transport = createTransport()
  if (!transport) {
    return {
      success: false,
      message: 'Gagal membuat transport koneksi SMTP.',
    }
  }

  try {
    await transport.verify()

    if (testEmail) {
      const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@empatsinergiutama.com'
      await transport.sendMail({
        from,
        to: testEmail,
        subject: 'Uji Coba Koneksi SMTP - PT Empat Sinergi Utama',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">Koneksi SMTP Berhasil!</h3>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Email uji coba ini berhasil dikirim melalui server SMTP <strong>${escapeHtml(host)}</strong> (Mailspace / Custom Domain Email).
            </p>
            <div style="margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;">
              Status: <strong>Terverifikasi & Aktif</strong><br/>
              Waktu: ${new Date().toLocaleString('id-ID')}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
              Sistem pengiriman email otomatis dan lampiran Company Profile PT Empat Sinergi Utama siap beroperasi.
            </p>
          </div>
        `,
        text: `Koneksi SMTP Berhasil!\n\nEmail uji coba ini berhasil dikirim melalui server SMTP ${host} (Mailspace / Custom Domain Email).\nStatus: Terverifikasi & Aktif.\nWaktu: ${new Date().toLocaleString('id-ID')}`,
      })
      return {
        success: true,
        message: `Koneksi SMTP terhubung dan email uji coba berhasil dikirim ke ${testEmail}!`,
      }
    }

    return {
      success: true,
      message: `Koneksi ke server SMTP (${host}) berhasil diverifikasi dan siap digunakan!`,
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: `Gagal verifikasi SMTP: ${(err as Error).message}`,
    }
  }
}
