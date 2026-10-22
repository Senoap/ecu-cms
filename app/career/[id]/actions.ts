// app/career/[id]/actions.ts
'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { readPublishedDB, addNotification } from '@/lib/db'
import { getAppSetting, HR_EMAIL_KEY, saveNewApplication } from '@/lib/applications'
import { sendMail, escapeHtml } from '@/lib/mailer'

export interface ApplyState {
  ok: boolean
  message: string
  ref?: string
  emailSent?: boolean
}

const MAX_CV_BYTES = 5 * 1024 * 1024
const ALLOWED_EXT = ['pdf', 'doc', 'docx']

// Rate limit sederhana (in-memory): 3 lamaran / jam / IP
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 3
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list)
    return true
  }
  list.push(now)
  hits.set(ip, list)
  return false
}

const schema = z.object({
  careerId: z.string().min(1),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{8,20}$/, 'Nomor HP tidak valid'),
  email: z.string().trim().email('Email tidak valid').max(150),
  education: z.string().trim().max(100).optional(),
  coverNote: z.string().trim().max(1500).optional(),
  consent: z.literal('on', { message: 'Anda harus menyetujui penggunaan data' }),
})

/** Cek isi file sebenarnya (magic bytes), bukan hanya ekstensi. */
function detectCvType(buf: Buffer): 'pdf' | 'docx' | 'doc' | null {
  if (buf.length < 8) return null
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf'
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return 'docx'
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return 'doc'
  return null
}

function makeRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  for (const b of bytes) s += chars[b % chars.length]
  return `ESU-${s}`
}

export async function submitApplication(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  // Honeypot: bot biasanya mengisi field tersembunyi ini
  if (formData.get('website')) return { ok: true, message: 'Terkirim.' }

  const h = await headers()
  const ip = h.get('x-test-ip') || h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) {
    return { ok: false, message: 'Terlalu banyak pengiriman. Silakan coba lagi dalam 1 jam.' }
  }

  const parsed = schema.safeParse({
    careerId: formData.get('careerId'),
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    education: (formData.get('education') as string) || undefined,
    coverNote: (formData.get('coverNote') as string) || undefined,
    consent: formData.get('consent') ?? undefined,
  })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data tidak valid.' }
  }
  const data = parsed.data

  // Lowongan harus ada & aktif (berdasarkan data yang sudah dipublikasikan)
  const pub = await readPublishedDB()
  const job = (pub.career || []).find((j) => j.id === data.careerId)
  if (!job || !job.isActive) {
    return { ok: false, message: 'Lowongan ini sudah ditutup atau tidak ditemukan.' }
  }

  // CV wajib
  const cv = formData.get('cv')
  if (!(cv instanceof File) || cv.size === 0) {
    return { ok: false, message: 'CV wajib diunggah.' }
  }
  const ext = cv.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXT.includes(ext)) return { ok: false, message: 'Format CV harus PDF, DOC, atau DOCX.' }
  if (cv.size > MAX_CV_BYTES) return { ok: false, message: 'Ukuran CV maksimal 5 MB.' }

  const buffer = Buffer.from(await cv.arrayBuffer())
  const detected = detectCvType(buffer)
  if (!detected) return { ok: false, message: 'Isi file CV tidak valid (bukan PDF/DOC/DOCX).' }

  const mime =
    detected === 'pdf'
      ? 'application/pdf'
      : detected === 'doc'
        ? 'application/msword'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  const ref = makeRef()
  const cvPath = `${data.careerId}/${ref}-${crypto.randomUUID().slice(0, 8)}.${detected}`

  try {
    await saveNewApplication(
      {
        ref_code: ref,
        career_id: job.id,
        career_title: job.title,
        name: data.name,
        phone: data.phone,
        email: data.email,
        education: data.education || null,
        cover_note: data.coverNote || null,
        cv_path: cvPath,
        status: 'new',
      },
      buffer,
      mime
    )

    try {
      await addNotification(
        `Lamaran baru diterima untuk posisi "${job.title}" dari ${data.name} (${ref}).`,
        'CREATE',
        'career'
      )
    } catch (notifErr) {
      console.warn('Gagal menambah notifikasi karir:', notifErr)
    }
  } catch (err) {
    console.error('[apply] gagal:', err)
    return { ok: false, message: 'Maaf, terjadi kesalahan pada server. Silakan coba lagi nanti.' }
  }

  // ---- Email (kegagalan email tidak membatalkan lamaran) ----
  const hrEmail = (await getAppSetting(HR_EMAIL_KEY)) || pub.footer?.email || ''
  const site = pub.setting.siteName
  const safe = {
    name: escapeHtml(data.name),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email),
    job: escapeHtml(job.title),
    edu: escapeHtml(data.education || '-'),
    note: escapeHtml(data.coverNote || '-'),
    site: escapeHtml(site),
  }

  if (hrEmail) {
    await sendMail({
      to: hrEmail,
      replyTo: data.email,
      subject: `[Lamaran Baru] ${job.title} - ${data.name} (${ref})`,
      text: `Lamaran baru untuk ${job.title}\nRef: ${ref}\nNama: ${data.name}\nHP: ${data.phone}\nEmail: ${data.email}\nPendidikan: ${data.education || '-'}\nCatatan: ${data.coverNote || '-'}\n\nCV dapat diunduh dari panel admin > Lamaran.`,
      html: `<h3>Lamaran baru: ${safe.job}</h3><p><b>Ref:</b> ${ref}<br><b>Nama:</b> ${safe.name}<br><b>HP:</b> ${safe.phone}<br><b>Email:</b> ${safe.email}<br><b>Pendidikan:</b> ${safe.edu}<br><b>Catatan:</b> ${safe.note}</p><p>CV dapat diunduh dari panel admin &gt; Lamaran.</p>`,
    })
  }

  const emailSent = await sendMail({
    to: data.email,
    subject: `Lamaran Anda telah kami terima (${ref}) - ${site}`,
    text: `Halo ${data.name},\n\nTerima kasih telah melamar posisi ${job.title} di ${site}. Lamaran Anda sudah kami terima dengan nomor referensi ${ref}.\n\nTim HR akan meninjau berkas Anda. Jika profil Anda sesuai, kami akan menghubungi Anda untuk tahap selanjutnya.\n\nSalam hangat,\nTim HR ${site}`,
    html: `<p>Halo <b>${safe.name}</b>,</p><p>Terima kasih telah melamar posisi <b>${safe.job}</b> di ${safe.site}. Lamaran Anda sudah kami terima dengan nomor referensi <b>${ref}</b>.</p><p>Tim HR akan meninjau berkas Anda. Jika profil Anda sesuai, kami akan menghubungi Anda untuk tahap selanjutnya.</p><p>Salam hangat,<br>Tim HR ${safe.site}</p>`,
  })

  return { ok: true, message: 'Lamaran berhasil dikirim.', ref, emailSent }
}
