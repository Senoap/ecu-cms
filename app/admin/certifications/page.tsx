import { readDB, writeDB, addNotification, type CertificationItem } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { requirePermission, requirePagePermission } from '@/lib/auth'
import CertificationsAdminClient from '@/app/admin/certifications/CertificationsAdminClient'

export default async function AdminCertificationsPage() {
  await requirePagePermission('certifications')
  const db = await readDB()

  async function saveCertificationsAction(certifications: CertificationItem[]) {
    'use server'
    const currentUser = await requirePermission('certifications')
    const db = await readDB()
    db.certifications = certifications
    await writeDB(db, currentUser)
    await addNotification(`Memperbarui daftar sertifikasi perusahaan (${certifications.length} dokumen).`, 'UPDATE', 'system', {
      userName: currentUser.name,
      userRole: currentUser.role
    })
    revalidatePath('/admin/certifications')
    revalidatePath('/admin', 'layout')
    revalidatePath('/certifications')
    revalidatePath('/')
  }

  async function toggleCertificationsVisibilityAction(showCertifications: boolean) {
    'use server'
    const currentUser = await requirePermission('certifications')
    const db = await readDB()
    db.setting = {
      ...db.setting,
      showCertifications,
    }
    await writeDB(db, currentUser)
    await addNotification(
      showCertifications 
        ? 'Mengaktifkan publikasi Halaman Sertifikasi ke website.' 
        : 'Menonaktifkan / menyembunyikan Halaman Sertifikasi dari website.', 
      'UPDATE', 
      'system', 
      {
        userName: currentUser.name,
        userRole: currentUser.role
      }
    )
    revalidatePath('/admin/certifications')
    revalidatePath('/admin')
    revalidatePath('/admin', 'layout')
    revalidatePath('/certifications')
    revalidatePath('/')
  }

  return (
    <CertificationsAdminClient
      certifications={db.certifications || []}
      showCertifications={db.setting?.showCertifications !== false}
      saveCertificationsAction={saveCertificationsAction}
      toggleCertificationsVisibilityAction={toggleCertificationsVisibilityAction}
      siteName={db.setting?.siteName || 'PT Empat Sinergi Utama'}
    />
  )
}
