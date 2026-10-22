// lib/certificationsConstants.ts
// Konstanta & Interface ringan untuk halaman publik /certifications
// Aman diimpor oleh Server Component maupun Client Component tanpa dependensi native Node.js.

export interface CertificationsPageConfig {
  headerBadge: string
  headerTitle: string
  headerDesc: string
  backButtonText: string
  backButtonLink: string
  showProtectionCard: boolean
  protectionBadge: string
  protectionTitle: string
  protectionDesc: string
  protectionCtaText: string
  protectionCtaLink: string
  protectionShowLeadershipBtn: boolean
  protectionLeadershipText: string
  protectionLeadershipLink: string
}

export const defaultCertificationsPageConfig: CertificationsPageConfig = {
  headerBadge: 'Kepatuhan Regulasi & Standar Mutu',
  headerTitle: 'Sertifikasi & Izin Operasional Resmi',
  headerDesc: 'Bukti legalitas, keabsahan akreditasi internasional, dan izin resmi dari lembaga berwenang Republik Indonesia yang mengukuhkan dedikasi kualitas layanan {company}.',
  backButtonText: 'Kembali ke Beranda',
  backButtonLink: '/',
  showProtectionCard: true,
  protectionBadge: 'Proteksi Keaslian Dokumen Legal',
  protectionTitle: 'Verifikasi & Validasi Dokumen Legal Perusahaan',
  protectionDesc: 'Seluruh sertifikat akreditasi ISO, lisensi operasional BUJP POLRI, serta izin ketenagakerjaan yang ditampilkan telah melewati audit kepatuhan resmi. Seluruh tampilan gambar dilindungi watermark anti-duplikasi digital untuk menjaga integritas korporat {company}.',
  protectionCtaText: 'Verifikasi Berkas Kemitraan',
  protectionCtaLink: '/#contact',
  protectionShowLeadershipBtn: true,
  protectionLeadershipText: 'Lihat Profil Pimpinan',
  protectionLeadershipLink: '/leadership',
}
