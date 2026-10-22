import { 
  readDB, 
  writeDB, 
  addNotification, 
  uploadFile,
  defaultCertificationsPageConfig,
  type CertificationItem,
  type CertificationsPageConfig 
} from '@/lib/db'
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

  async function saveCertificationsPageAction(config: CertificationsPageConfig) {
    'use server'
    const currentUser = await requirePermission('certifications')
    const db = await readDB()
    db.certificationsPage = config
    await writeDB(db, currentUser)
    await addNotification(`Memperbarui tata letak dan teks halaman publik Sertifikasi (/certifications).`, 'UPDATE', 'system', {
      userName: currentUser.name,
      userRole: currentUser.role
    })
    revalidatePath('/admin/certifications')
    revalidatePath('/admin', 'layout')
    revalidatePath('/certifications')
    revalidatePath('/')
  }

  async function uploadCertificateImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    'use server'
    try {
      await requirePermission('certifications')
      const file = formData.get('file') as File | null
      if (!file || !(file instanceof File) || file.size === 0) {
        return { success: false, error: 'Berkas gambar sertifikat tidak valid atau kosong.' }
      }
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'Ukuran berkas melebihi batas maksimal 10MB.' }
      }
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`
      const url = await uploadFile(buffer, filename, file.type)
      return { success: true, url }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
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
      certificationsPageConfig={db.certificationsPage || defaultCertificationsPageConfig}
      saveCertificationsAction={saveCertificationsAction}
      saveCertificationsPageAction={saveCertificationsPageAction}
      uploadCertificateImageAction={uploadCertificateImageAction}
      toggleCertificationsVisibilityAction={toggleCertificationsVisibilityAction}
      siteName={db.setting?.siteName || 'PT Empat Sinergi Utama'}
    />
  )
}
