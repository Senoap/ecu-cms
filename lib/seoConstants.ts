// lib/seoConstants.ts

export interface SeoConfig {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  canonicalUrl: string
  ogImageUrl: string
  googleSiteVerification: string
  indexingRobots: 'all' | 'noindex'
  lastUpdated?: number
  updatedBy?: string
}

export const defaultSeoSetting: SeoConfig = {
  metaTitle: 'PT. EMPAT SINERGI UTAMA — MANPOWER SERVICES',
  metaDescription: 'Penyedia solusi terintegrasi kebutuhan operasional bisnis, manajemen fasilitas gedung, dan pemenuhan ketenagakerjaan ahli (manpower, cleaning, security, logistic) di Indonesia.',
  metaKeywords: 'outsourcing, manpower services, penyedia tenaga kerja, alih daya, jasa cleaning service, jasa keamanan security, pt empat sinergi utama, rekrutmen tenaga kerja indonesia',
  canonicalUrl: '',
  ogImageUrl: '',
  googleSiteVerification: '',
  indexingRobots: 'all',
}

