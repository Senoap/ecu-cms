// app/admin/applications/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabaseAdmin'
import { APPLICATION_STATUSES, HR_EMAIL_KEY, setAppSetting } from '@/lib/applications'
import { addNotification, readDB } from '@/lib/db'

export async function saveHrEmail(formData: FormData) {
  await requireAdmin()
  const raw = String(formData.get('hrEmail') ?? '').trim()
  if (raw && !z.string().email().safeParse(raw).success) return
  await setAppSetting(HR_EMAIL_KEY, raw)
  await addNotification(raw ? `Email HR penerima lamaran diubah menjadi ${raw}.` : 'Email HR dikosongkan (memakai email footer).', 'UPDATE', 'career')
  revalidatePath('/admin/applications')
  revalidatePath('/career/[id]', 'page')
}

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !(APPLICATION_STATUSES as string[]).includes(status as never)) return
  const { error } = await getAdminClient().from('applications').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  await addNotification(`Status lamaran kerja diperbarui menjadi "${status}".`, 'UPDATE', 'career')
  revalidatePath('/admin/applications')
}

export async function deleteApplication(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const supabase = getAdminClient()
  const { data } = await supabase.from('applications').select('cv_path').eq('id', id).maybeSingle()
  if (data?.cv_path) await supabase.storage.from('cv').remove([data.cv_path as string])
  await supabase.from('applications').delete().eq('id', id)
  await addNotification(`Menghapus data lamaran kerja.`, 'DELETE', 'career')
  revalidatePath('/admin/applications')
}

export async function sendCandidateReplyAction(formData: FormData) {
  await requireAdmin()
  const to = String(formData.get('to') ?? '').trim()
  const candidateName = String(formData.get('candidateName') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()

  if (!to || !subject || !body) {
    throw new Error('Alamat email, subjek, dan isi pesan wajib diisi.')
  }

  const { sendMail, escapeHtml } = await import('@/lib/mailer')
  const db = await readDB()
  const siteName = db.setting?.siteName || 'PT. EMPAT SINERGI UTAMA'

  const formattedHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #9b4d0f; margin-bottom: 16px;">${escapeHtml(subject)}</h2>
      <div style="white-space: pre-line; color: #334155; font-size: 14px;">${escapeHtml(body)}</div>
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 11px; color: #64748b; margin-top: 12px;">
        Pesan ini dikirimkan otomatis oleh Tim HR ${escapeHtml(siteName)}.
      </p>
    </div>
  `

  const sent = await sendMail({
    to,
    subject: `[${siteName}] ${subject}`,
    text: `${body}\n\n---\nTim HR ${siteName}`,
    html: formattedHtml,
  })

  await addNotification(
    `Mengirim email balasan ke pelamar: "${candidateName}" (${to}).`,
    'UPDATE',
    'career'
  )

  revalidatePath('/admin/applications')
  return { success: sent }
}
