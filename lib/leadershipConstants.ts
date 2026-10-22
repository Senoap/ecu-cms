// lib/leadershipConstants.ts
// Konstanta & Interface ringan untuk halaman publik /leadership
// Aman diimpor oleh Server Component maupun Client Component tanpa dependensi native Node.js.

export interface LeadershipPageConfig {
  headerBadge: string
  headerTitle: string
  headerDesc: string
  backButtonText: string
  backButtonLink: string
  showGcgCard: boolean
  gcgBadge: string
  gcgTitle: string
  gcgDesc: string
  gcgCtaText: string
  gcgCtaLink: string
  gcgShowCertBtn: boolean
  gcgCertText: string
  gcgCertLink: string
}

export const defaultLeadershipPageConfig: LeadershipPageConfig = {
  headerBadge: 'Pimpinan & Pengelola Operasional',
  headerTitle: 'Profil Pimpinan & Tim Manajemen',
  headerDesc: 'Mengenal tim pengelola dan pimpinan di balik komitmen mutu pelayanan prima, integritas kerja, dan tata kelola ketenagakerjaan terpercaya {company}.',
  backButtonText: 'Kembali ke Beranda',
  backButtonLink: '/',
  showGcgCard: true,
  gcgBadge: 'Prinsip Good Corporate Governance (GCG)',
  gcgTitle: 'Integritas, Transparansi, dan Akuntabilitas Tanpa Kompromi',
  gcgDesc: 'Pimpinan dan segenap tim manajemen {company} senantiasa memegang teguh kepatuhan terhadap regulasi ketenagakerjaan Republik Indonesia (UU Ketenagakerjaan & UU Cipta Kerja), jaminan perlindungan BPJS Ketenagakerjaan dan Kesehatan seluruh personel, serta ketepatan sistem penggajian yang transparan untuk menjaga reputasi dan stabilitas operasional mitra.',
  gcgCtaText: 'Konsultasi Kemitraan',
  gcgCtaLink: '/#contact',
  gcgShowCertBtn: true,
  gcgCertText: 'Lihat Sertifikasi Perusahaan',
  gcgCertLink: '/certifications',
}
