// app/admin/seo/actions.ts
'use server'

import { readDB, writeDB, addNotification } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { defaultSeoSetting, type SeoConfig } from '@/lib/seoConstants'
import { normalizeDomainUrl } from '@/lib/site'
import { revalidatePath } from 'next/cache'

export async function updateSeoAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !user.isRootAdmin) {
    return {
      success: false,
      message: 'Akses ditolak: Pengaturan SEO & Sitemap hanya dapat dikelola oleh akun level Root (Administrator Master / Superadmin).',
    }
  }

  const metaTitle = (formData.get('metaTitle') as string)?.trim() || defaultSeoSetting.metaTitle
  const metaDescription = (formData.get('metaDescription') as string)?.trim() || defaultSeoSetting.metaDescription
  const metaKeywords = (formData.get('metaKeywords') as string)?.trim() || defaultSeoSetting.metaKeywords
  const rawCanonical = (formData.get('canonicalUrl') as string)?.trim() || ''
  const canonicalUrl = normalizeDomainUrl(rawCanonical)
  const ogImageUrl = (formData.get('ogImageUrl') as string)?.trim() || ''
  const googleSiteVerification = (formData.get('googleSiteVerification') as string)?.trim() || ''
  const indexingRobots = (formData.get('indexingRobots') as string) === 'noindex' ? 'noindex' : 'all'

  const db = await readDB()
  const now = Date.now()

  const updatedSeo: SeoConfig = {
    metaTitle,
    metaDescription,
    metaKeywords,
    canonicalUrl,
    ogImageUrl,
    googleSiteVerification,
    indexingRobots,
    lastUpdated: now,
    updatedBy: user.name || user.username,
  }

  db.seoSetting = updatedSeo

  if (!db.auditLogs) db.auditLogs = []
  db.auditLogs.unshift({
    id: 'log-seo-' + now,
    message: `Pengaturan SEO & Sitemap diperbarui oleh ${user.name} (${user.role}). Kebijakan perayap: ${indexingRobots === 'noindex' ? 'Noindex (Tertutup)' : 'Index & Follow (Terbuka)'}.`,
    timestamp: now,
    type: 'UPDATE',
    category: 'system',
    userName: user.name,
    userEmail: user.username,
    userRole: user.role,
  })

  await writeDB(db)
  await addNotification('Memperbarui Pengaturan SEO & Peta Situs (Sitemap).', 'UPDATE')

  revalidatePath('/admin/seo')
  revalidatePath('/sitemap.xml')
  revalidatePath('/robots.txt')
  revalidatePath('/')

  return {
    success: true,
    message: 'Pengaturan SEO & Sitemap berhasil diperbarui. Klik tombol "Deploy" untuk mempublikasikan ke live website.',
  }
}

