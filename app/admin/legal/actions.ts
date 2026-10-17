// app/admin/legal/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { readDB, writeDB, addNotification, type LegalContent } from '@/lib/db'

export async function updatePrivacyPolicyAction(formData: FormData) {
  const title = (formData.get('title') as string)?.trim() || 'Kebijakan Privasi'
  const lastUpdated = (formData.get('lastUpdated') as string)?.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const content = (formData.get('content') as string)?.trim() || ''

  const db = await readDB()
  const privacyPolicy: LegalContent = {
    title,
    lastUpdated,
    content,
  }

  db.privacyPolicy = privacyPolicy
  if (db.published) {
    db.published.privacyPolicy = privacyPolicy
  }

  await writeDB(db)
  await addNotification(`Memperbarui halaman Kebijakan Privasi.`, 'UPDATE', 'system')

  revalidatePath('/admin/legal')
  revalidatePath('/privacy-policy')
  revalidatePath('/')
}

export async function updateTermsAction(formData: FormData) {
  const title = (formData.get('title') as string)?.trim() || 'Syarat dan Ketentuan'
  const lastUpdated = (formData.get('lastUpdated') as string)?.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const content = (formData.get('content') as string)?.trim() || ''

  const db = await readDB()
  const termsOfService: LegalContent = {
    title,
    lastUpdated,
    content,
  }

  db.termsOfService = termsOfService
  if (db.published) {
    db.published.termsOfService = termsOfService
  }

  await writeDB(db)
  await addNotification(`Memperbarui halaman Syarat & Ketentuan.`, 'UPDATE', 'system')

  revalidatePath('/admin/legal')
  revalidatePath('/terms')
  revalidatePath('/')
}
