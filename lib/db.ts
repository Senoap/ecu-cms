import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { 
  defaultHeroShowcase,
  type HeroShowcaseConfig, 
  type ShowcaseStrengthItem, 
  type ShowcaseMetricItem, 
  type ShowcaseSectorItem, 
  type ShowcaseRoleItem 
} from './showcaseConstants'
import {
  defaultLeadershipPageConfig,
  type LeadershipPageConfig
} from './leadershipConstants'
import {
  defaultCertificationsPageConfig,
  type CertificationsPageConfig
} from './certificationsConstants'
import {
  defaultSeoSetting,
  type SeoConfig
} from './seoConstants'
export {
  defaultLeadershipPageConfig,
  type LeadershipPageConfig,
  defaultCertificationsPageConfig,
  type CertificationsPageConfig,
  defaultSeoSetting,
  type SeoConfig
}

let lastSupabaseFailure = 0
const SUPABASE_COOLDOWN_MS = 15000 // Cooldown 15 detik jika backend Supabase tidak aktif/mati
let cachedSupabaseClient: SupabaseClient | null = null
let cachedSupabaseKey = ''

function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_REST_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (!supabaseUrl || !supabaseKey) return null

  if (!hasServiceRole && process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY] SUPABASE_SERVICE_ROLE_KEY belum diatur di production! Operasi mutasi database CMS berisiko gagal jika Row Level Security (RLS) diaktifkan.')
  }

  // Jika Supabase baru saja gagal dihubungi (misal Docker lokal belum menyala), langsung fallback ke lokal tanpa delay
  if (Date.now() - lastSupabaseFailure < SUPABASE_COOLDOWN_MS) {
    return null
  }

  if (cachedSupabaseClient && cachedSupabaseKey === supabaseKey) {
    return cachedSupabaseClient
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(4000), // Timeout 4 detik untuk latensi cloud yang lebih stabil
          }).catch((err) => {
            lastSupabaseFailure = Date.now()
            throw err
          })
        },
      },
    })
    cachedSupabaseClient = client
    cachedSupabaseKey = supabaseKey
    return client
  } catch {
    lastSupabaseFailure = Date.now()
    return null
  }
}

export interface SectionConfig {
  id: string
  label: string
  isVisible: boolean
  order: number
  type?: 'hero' | 'about' | 'services' | 'portfolio' | 'career' | 'gallery' | 'contact' | 'media' | 'text' | 'features' | string
  badge?: string
  title?: string
  titleLine1?: string
  titleHighlight?: string
  subtitle?: string
  content?: string
  p1?: string
  p2?: string
  leadershipTitle?: string
  leadershipDesc?: string
  quote?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  showcaseCard?: HeroShowcaseConfig
  items?: { id: string; title?: string; name?: string; desc?: string; imageUrl?: string; icon?: string }[]
}

export interface ServiceItem {
  id: string
  title: string
  desc: string
  icon: string
  content?: string
  images?: string[]
}

export interface PortfolioItem {
  id: string
  name: string
  desc?: string
  imageUrl?: string
}

export interface CareerItem {
  id: string
  title: string
  location: string
  type: string
  desc: string
  requirements: string
  isActive: boolean
}

export interface GalleryItem {
  id: string
  title: string
  desc: string
  category: string
  imageUrl: string
}

export interface ScheduledContentItem {
  id: string
  type: 'daily' | 'monthly'
  title: string
  content: string
  imageUrl?: string
  badge?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  isActive: boolean
  createdAt: number
}

export interface CareerReplyTemplate {
  id: string
  name: string
  channel: 'wa' | 'email' | 'both'
  subject?: string
  body: string
  createdAt: number
}

export interface CmsUser {
  id: string
  username: string
  passwordHash: string
  name: string
  role: string
  permissions: string[]
  canReceiveCareerNotif: boolean
  isActive: boolean
  createdAt: number
  passwordUpdatedAt?: number
  mustResetPassword?: boolean
  skipPasswordExpiry?: boolean
}

export interface DirectorItem {
  id: string
  name: string
  position: string
  photoUrl?: string
  bio?: string
  experiences?: string[]
  education?: string
  order: number
  isVisible: boolean
}

export interface CertificationItem {
  id: string
  title: string
  issuer: string
  certNumber?: string
  issueDate?: string
  expiryDate?: string
  desc?: string
  imageUrl: string
  watermarkText?: string
  order: number
  isVisible: boolean
}

export interface ComproRequestItem {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes?: string
  status: 'sent' | 'pending' | 'followed_up'
  createdAt: number
  sentAt?: number
  ip?: string
}

export interface ComproEmailTemplate {
  subject: string
  body: string
  senderName: string
  heading?: string
  bodyIntro?: string
  pdfUrl?: string
  footerText?: string
}

export interface DailyVisitorCount {
  date: string // format: 'YYYY-MM-DD'
  count: number // total counter kunjungan hari ini
  paths?: Record<string, number> // rincian per path yang dikunjungi
}

export interface VisitorLogItem {
  id: string
  path: string
  ip: string
  userAgent: string
  referer?: string
  timestamp: number
}

export interface ActiveSessionRecord {
  token: string
  ip: string
  userAgent: string
  lastSeen: number
  loggedInAt: number
}

export interface LoginAttemptRecord {
  count: number
  resetAt: number
  lastAttemptAt: number
  lockedUntil?: number
}

export interface CmsDraftLock {
  userId: string
  userName: string
  userEmail?: string
  lockedAt: number
  lastActive: number
}

export interface NotificationItem {
  id: string
  message: string
  time: string
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER' | 'COMPRO' | 'VISITOR' | 'AUTH'
  category?: 'system' | 'visitor' | 'career' | 'compro' | string
  viewedAt?: number
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
}

export interface AuditLogItem {
  id: string
  message: string
  timestamp: number
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER' | 'COMPRO' | 'VISITOR' | 'AUTH'
  category: 'system' | 'visitor' | 'career' | 'compro'
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  ip?: string
  details?: Record<string, unknown>
}

export { 
  defaultHeroShowcase,
  type HeroShowcaseConfig, 
  type ShowcaseStrengthItem, 
  type ShowcaseMetricItem, 
  type ShowcaseSectorItem, 
  type ShowcaseRoleItem 
}


export interface HeroContent {
  badge: string
  titleLine1: string
  titleHighlight: string
  description: string
  showcaseCard?: HeroShowcaseConfig
}

export interface AboutContent {
  tag: string
  heading: string
  subtitle: string
  title: string
  p1: string
  p2: string
  leadershipTitle: string
  leadershipDesc: string
  quote: string
}



export interface ServicesHeaderContent {
  tag: string
  heading: string
  note: string
}

export interface PortfolioHeaderContent {
  tag: string
  heading: string
  note: string
}

export interface CareerHeaderContent {
  tag: string
  heading: string
  note: string
}

export interface GalleryHeaderContent {
  tag: string
  heading: string
  note: string
}

export interface FooterSocialMedia {
  enabled: boolean
  instagram?: string
  linkedin?: string
  facebook?: string
  tiktok?: string
  youtube?: string
}

export interface FooterInquiryTemplates {
  waMessage?: string
  emailSubject?: string
  emailBody?: string
}

export interface FooterContent {
  description: string
  address: string
  phone: string
  whatsapp?: string
  email: string
  socialMedia?: FooterSocialMedia
  inquiryTemplates?: FooterInquiryTemplates
}

export interface LegalContent {
  title: string
  lastUpdated: string
  content: string
}

export interface DatabaseContent {
  setting: {
    siteName: string
    tagline: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    loadingBgColor?: string
    fontFamily: string
    logoUrl?: string
    bgImageUrl?: string
    slideDuration: number
    showLeadership?: boolean
    showCertifications?: boolean
    showCompro?: boolean
    leadershipLabel?: string
  }
  sections: SectionConfig[]
  services: ServiceItem[]
  portfolios: PortfolioItem[]
  career: CareerItem[]
  galleries: GalleryItem[]
  galleryCategories?: string[]
  hero: HeroContent
  about: AboutContent
  servicesHeader: ServicesHeaderContent
  portfolioHeader: PortfolioHeaderContent
  careerHeader: CareerHeaderContent
  galleryHeader: GalleryHeaderContent
  footer: FooterContent
  scheduledContents?: ScheduledContentItem[]
  privacyPolicy?: LegalContent
  termsOfService?: LegalContent
  directors?: DirectorItem[]
  certifications?: CertificationItem[]
  comproEmailTemplate?: ComproEmailTemplate
  leadershipPage?: LeadershipPageConfig
  certificationsPage?: CertificationsPageConfig
  seoSetting?: SeoConfig
  lastPublishedAt?: number
}

export const defaultCareerTemplates: CareerReplyTemplate[] = [
  {
    id: 'tpl-interview',
    name: 'Panggilan Wawancara Kerja (Interview)',
    channel: 'both',
    subject: 'Panggilan Wawancara Kerja - {job_title} ({company})',
    body: 'Halo {name},\n\nTerima kasih telah melamar posisi {job_title} di {company}. Kami tertarik dengan kualifikasi Anda dan mengundang Anda untuk mengikuti sesi wawancara kerja (Ref: {ref_code}).\n\nMohon konfirmasi kesediaan Anda dengan membalas pesan/email ini.\n\nSalam hangat,\nTim HR {company}',
    createdAt: 1700000000000
  },
  {
    id: 'tpl-rejection',
    name: 'Pemberitahuan Status Lamaran (Penolakan Halus)',
    channel: 'email',
    subject: 'Pembaruan Status Lamaran {job_title} - {company}',
    body: 'Halo {name},\n\nTerima kasih atas minat Anda melamar posisi {job_title} di {company} (Ref: {ref_code}).\n\nSetelah meninjau berkas Anda secara seksama, saat ini kami memilih untuk melanjutkan proses dengan kandidat yang profilnya lebih mendekati kebutuhan posisi. Data Anda akan kami simpan untuk peluang kerja di masa mendatang.\n\nSemoga sukses selalu dalam perjalanan karir Anda.\n\nSalam hormat,\nTim HR {company}',
    createdAt: 1700000000000
  },
  {
    id: 'tpl-confirm',
    name: 'Konfirmasi Berkas Diterima',
    channel: 'both',
    subject: 'Konfirmasi Berkas Lamaran {job_title} - {company}',
    body: 'Halo {name},\n\nBerkas lamaran Anda untuk posisi {job_title} (Ref: {ref_code}) telah kami terima dan terverifikasi dalam database kami. Tim rekrutmen kami akan segera menghubungi Anda jika profil Anda terpilih untuk tahap selanjutnya.\n\nTerima kasih,\nTim Rekrutmen {company}',
    createdAt: 1700000000000
  }
]

export const defaultFooterSocialMedia: FooterSocialMedia = {
  enabled: true,
  instagram: 'https://instagram.com/empatsinergiutama',
  linkedin: 'https://linkedin.com/company/empat-sinergi-utama',
  facebook: 'https://facebook.com/empatsinergiutama',
  tiktok: '',
  youtube: '',
}

export const defaultInquiryTemplates: FooterInquiryTemplates = {
  waMessage: 'Halo PT. Empat Sinergi Utama, saya ingin berkonsultasi mengenai kebutuhan layanan alih daya / ketenagakerjaan untuk perusahaan kami.',
  emailSubject: 'Konsultasi Layanan Alih Daya & Ketenagakerjaan - PT. Empat Sinergi Utama',
  emailBody: `Halo Tim PT. Empat Sinergi Utama,

Saya ingin mendapatkan informasi dan penawaran terkait kebutuhan operasional perusahaan kami:

Nama: 
Perusahaan / Instansi: 
Kebutuhan Layanan (Keamanan / Kebersihan / Tenaga Pendukung / Taman): 
Kontak / No. Telepon: 

Mohon informasi lebih lanjut. Terima kasih.`
}

export const defaultPrivacyPolicy: LegalContent = {
  title: 'Kebijakan Privasi',
  lastUpdated: '17 Oktober 2026',
  content: `PT. Empat Sinergi Utama berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi yang Anda berikan melalui situs web ini.

1. Pengumpulan Informasi
Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela saat menghubungi kami atau mengirimkan lamaran pekerjaan melalui situs web kami, termasuk namun tidak terbatas pada nama, alamat email, nomor telepon, riwayat pekerjaan, dan dokumen kurikulum vitae (CV).

2. Penggunaan Informasi
Informasi yang kami kumpulkan digunakan untuk:
- Memproses lamaran kerja dan proses seleksi ketenagakerjaan.
- Merespons pertanyaan, permintaan penawaran, atau konsultasi layanan alih daya.
- Meningkatkan kualitas layanan dan pengalaman operasional situs web kami.

3. Perlindungan & Keamanan Data
Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang ketat untuk mencegah akses tanpa izin, pengungkapan, perubahan, atau penghancuran data pribadi Anda. Berkas lamaran dan dokumen sensitif disimpan dalam penyimpanan aman dengan hak akses terbatas.

4. Pembagian Data kepada Pihak Ketiga
Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Data hanya dibagikan kepada mitra bisnis resmi atau klien pengguna jasa tenaga kerja jika relevan dengan penempatan kerja Anda dan dengan persetujuan Anda.

5. Hak Pengguna
Anda berhak untuk meminta akses, perbaikan, atau penghapusan data pribadi Anda yang tersimpan di sistem kami dengan menghubungi tim kami melalui kontak resmi yang tercantum di situs ini.`
}

export const defaultTermsOfService: LegalContent = {
  title: 'Syarat dan Ketentuan',
  lastUpdated: '17 Oktober 2026',
  content: `Selamat datang di situs resmi PT. Empat Sinergi Utama. Dengan mengakses dan menggunakan situs web ini, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan berikut.

1. Penggunaan Situs Web
Situs web ini disediakan untuk tujuan informasi mengenai layanan ketenagakerjaan, manajemen fasilitas, keamanan, kebersihan, serta informasi lowongan kerja resmi PT. Empat Sinergi Utama. Anda setuju untuk menggunakan situs ini hanya untuk tujuan yang sah dan tidak melanggar hukum.

2. Pengajuan Lamaran Pekerjaan
Pengunjung yang melamar pekerjaan melalui formulir karir menjamin bahwa seluruh data, dokumen identitas, dan berkas CV yang diunggah adalah asli, akurat, dan dapat dipertanggungjawabkan kebenarannya. Manipulasi data atau dokumen palsu dapat mengakibatkan diskualifikasi otomatis.

3. Hak Kekayaan Intelektual
Seluruh konten, merek dagang, logo, desain grafis, teks, dan media visual yang terdapat dalam situs web ini adalah hak milik eksklusif PT. Empat Sinergi Utama atau pemegang lisensi terkait. Dilarang menggandakan, menyebarluaskan, atau memodifikasi konten tanpa izin tertulis.

4. Batasan Tanggung Jawab
PT. Empat Sinergi Utama berupaya menjaga keakuratan informasi di situs web, namun tidak menjamin bahwa situs akan selalu bebas gangguan teknis atau kesalahan. Kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan situs ini.

5. Perubahan Ketentuan
Kami berhak untuk mengubah, memperbarui, atau memodifikasi Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan atas situs ini setelah perubahan menandakan persetujuan Anda terhadap ketentuan yang diperbarui.`
}

export const defaultDirectors: DirectorItem[] = [
  {
    id: 'dir-1',
    name: 'Drs. H. Bambang Soeprapto, M.M.',
    position: 'Direktur Utama (President Director)',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    bio: 'Berpengalaman lebih dari 20 tahun dalam kepemimpinan korporasi alih daya ketenagakerjaan dan manajemen fasilitas terpadu. Memiliki keahlian strategis dalam tata kelola SDM, kepatuhan hukum ketenagakerjaan, dan kemitraan skala nasional.',
    experiences: [
      'Mantan Eksekutif Senior Perusahaan Manpower Services Nasional',
      'Pengurus Bidang Hukum Asosiasi Pengusaha Alih Daya Indonesia',
      'Konsultan Kepatuhan UU Ketenagakerjaan & Hubungan Industrial'
    ],
    education: 'Magister Manajemen Sumber Daya Manusia - Universitas Indonesia',
    order: 1,
    isVisible: true
  },
  {
    id: 'dir-2',
    name: 'Ir. Hendra Gunawan, S.T., IPM.',
    position: 'Direktur Operasional & K3 (COO)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'Pakar operasional manajemen fasilitas gedung bertingkat dan pengelolaan keamanan terpadu. Mengantongi lisensi K3 BNSP tingkat utama dan sertifikasi Gada Utama Kepolisian RI.',
    experiences: [
      '15+ Tahun Pengelolaan Operasional Gedung Perkantoran & Kawasan Industri',
      'Auditor Sistem Manajemen K3 & ISO 45001:2018',
      'Pembina Standar Operasional Prosedur Pengamanan Fisik Korporat'
    ],
    education: 'Sarjana Teknik Industri - Institut Teknologi Bandung (ITB)',
    order: 2,
    isVisible: true
  },
  {
    id: 'dir-3',
    name: 'Siti Rahmawati, S.E., Ak., CA.',
    position: 'Direktur Keuangan & Kepatuhan Bisnis (CFO)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    bio: 'Menangani akuntabilitas finansial, transparansi sistem penggajian (payroll), dan kepatuhan perpajakan serta BPJS Ketenagakerjaan dan Kesehatan untuk ribuan tenaga kerja terkelola.',
    experiences: [
      '12+ Tahun Akuntansi Forensik & Manajemen Keuangan Alih Daya',
      'Spesialis Audit Payroll & Perlindungan Jaminan Sosial Tenaga Kerja',
      'Anggota Ikatan Akuntan Indonesia (IAI)'
    ],
    education: 'Sarjana Ekonomi Akuntansi - Universitas Gadjah Mada (UGM)',
    order: 3,
    isVisible: true
  }
]

export const defaultCertifications: CertificationItem[] = [
  {
    id: 'cert-1',
    title: 'ISO 9001:2015 - Sistem Manajemen Mutu',
    issuer: 'Badan Sertifikasi Mutu Internasional',
    certNumber: 'QMS/2024/4SU-88912',
    issueDate: '15 Januari 2024',
    expiryDate: '14 Januari 2027',
    desc: 'Standar pengakuan internasional untuk mutu pelayanan jasa penyedia tenaga kerja, manajemen fasilitas, dan sistem operasional alih daya yang konsisten dan prima.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 1,
    isVisible: true
  },
  {
    id: 'cert-2',
    title: 'ISO 45001:2018 - Keselamatan & Kesehatan Kerja (K3)',
    issuer: 'Badan Akreditasi K3 Internasional',
    certNumber: 'OHSAS/2023/4SU-45019',
    issueDate: '20 Mei 2023',
    expiryDate: '19 Mei 2026',
    desc: 'Sertifikasi kepatuhan sistem manajemen keselamatan dan kesehatan kerja guna menjamin perlindungan maksimal bagi seluruh personel lapangan dan aset mitra.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 2,
    isVisible: true
  },
  {
    id: 'cert-3',
    title: 'Surat Izin Operasional Badan Usaha Jasa Pengamanan (SIO-BUJP)',
    issuer: 'Kepolisian Negara Republik Indonesia (MABES POLRI)',
    certNumber: 'SIO/POLRI/BUJP/2023-9912',
    issueDate: '10 Februari 2023',
    expiryDate: '09 Februari 2028',
    desc: 'Izin legal resmi dari Mabes POLRI untuk menyelenggarakan jasa penyediaan, pelatihan, dan pengelolaan personel satuan pengamanan (Satpam).',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 3,
    isVisible: true
  },
  {
    id: 'cert-4',
    title: 'Surat Izin Penyalur Penyedia Jasa Pekerja (PPJP)',
    issuer: 'Kementerian Ketenagakerjaan Republik Indonesia (KEMENAKER)',
    certNumber: 'KEP.541/MENAKER/PPJP/2022',
    issueDate: '18 Oktober 2022',
    expiryDate: '17 Oktober 2027',
    desc: 'Legalitas resmi kementerian ketenagakerjaan sebagai perusahaan alih daya yang memenuhi syarat UU Ketenagakerjaan dan perlindungan hak pekerja.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 4,
    isVisible: true
  },
  {
    id: 'cert-5',
    title: 'Sertifikat Keanggotaan ABUJAPI',
    issuer: 'Asosiasi Badan Usaha Jasa Pengamanan Indonesia (ABUJAPI)',
    certNumber: 'ABUJAPI/DKI/2023-01827',
    issueDate: '05 Maret 2023',
    expiryDate: '04 Maret 2026',
    desc: 'Keanggotaan aktif dalam asosiasi resmi jasa pengamanan Indonesia yang menjamin standar kompetensi personel Satpam.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 5,
    isVisible: true
  },
  {
    id: 'cert-6',
    title: 'Sertifikat Keanggotaan APKLINDO',
    issuer: 'Asosiasi Perusahaan Klining Servis Indonesia (APKLINDO)',
    certNumber: 'APKLINDO/BANTEN/2023-5521',
    issueDate: '12 Agustus 2023',
    expiryDate: '11 Agustus 2026',
    desc: 'Standarisasi metode pembersihan, higienitas fasilitas, dan tata kelola bahan kimia ramah lingkungan.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    watermarkText: 'PT. EMPAT SINERGI UTAMA - DOKUMEN RESMI - TIDAK UNTUK DIKANDANGKAN',
    order: 6,
    isVisible: true
  }
]

export const defaultComproEmailTemplate: ComproEmailTemplate = {
  subject: 'Company Profile Resmi - PT. Empat Sinergi Utama',
  senderName: 'PT. Empat Sinergi Utama',
  heading: 'Company Profile Resmi - PT. Empat Sinergi Utama',
  bodyIntro: 'Terima kasih atas minat dan kepercayaan Anda kepada PT. Empat Sinergi Utama. Menindaklanjuti permintaan yang Anda ajukan, dokumen resmi Company Profile telah kami lampirkan langsung pada email ini.',
  pdfUrl: '/compro.pdf',
  footerText: 'PT Empat Sinergi Utama • Mitra Strategis Ketenagakerjaan & Fasilitas Korporat Terpadu',
  body: `Yth. Bapak/Ibu {name},
Dari {company},

Terima kasih atas minat dan kepercayaan Anda kepada PT. Empat Sinergi Utama.

Menindaklanjuti permintaan Company Profile yang Anda ajukan melalui situs web resmi kami, bersama pesan ini kami lampirkan langsung berkas dokumen Company Profile resmi PT. Empat Sinergi Utama (terlampir berkas PDF).

Dokumen ini memuat informasi lengkap mengenai:
- Profil dan legalitas resmi perusahaan
- Portofolio layanan alih daya (Keamanan, Kebersihan, Tenaga Pendukung, Fasilitas)
- Rekam jejak mitra dan sertifikasi mutu (ISO 9001, ISO 45001, SIO-BUJP, PPJP Kemenaker)
- Skema kemitraan yang fleksibel, transparan, dan akuntabel

Berkas dokumen resmi dapat Anda buka dan unduh langsung melalui lampiran (attachment) pada email ini.

Tim konsultan kami siap berdiskusi lebih lanjut mengenai solusi operasional di perusahaan Anda. Silakan hubungi kami via balasan email ini atau WhatsApp di nomor hotline resmi kami.

Salam hormat,
Tim Kemitraan Korporat
PT. Empat Sinergi Utama
Hotline: +62 815 8480 5000`
}



export interface Database extends DatabaseContent {
  published: DatabaseContent
  notifications: NotificationItem[]
  auditLogs: AuditLogItem[]
  hasDraft: boolean
  cmsUsers?: CmsUser[]
  careerTemplates?: CareerReplyTemplate[]
  comproRequests?: ComproRequestItem[]
  visitorLogs?: VisitorLogItem[]
  dailyVisitorCounts?: DailyVisitorCount[]
  activeSessions?: Record<string, ActiveSessionRecord>
  loginAttempts?: Record<string, LoginAttemptRecord>
  draftLock?: CmsDraftLock
}

const defaultDataContent: DatabaseContent = {
  setting: {
    siteName: 'PT. EMPAT SINERGI UTAMA',
    tagline: 'MANPOWER SERVICES',
    primaryColor: '#7E1D0C',
    secondaryColor: '#D4AF37',
    accentColor: '#1E293B',
    loadingBgColor: '#7E1D0C',
    fontFamily: 'Inter',
    logoUrl: '',
    bgImageUrl: '',
    slideDuration: 3,
    showLeadership: true,
    showCertifications: true,
    showCompro: true,
    leadershipLabel: 'Profil Pimpinan',
  },
  seoSetting: defaultSeoSetting,
  sections: [
    {
      id: 'hero',
      label: 'Banner Teks Hero',
      isVisible: true,
      order: 1,
      type: 'hero',
      badge: '',
      titleLine1: 'WE ARE YOUR',
      titleHighlight: 'SOLUTION',
      content: 'Penyedia Solusi Terintegrasi Kebutuhan Operasional Bisnis, Manajemen Fasilitas Gedung, dan Pemenuhan Ketenagakerjaan Ahli.',
      showcaseCard: defaultHeroShowcase,
    },
    {
      id: 'scheduled-content',
      label: 'Konten Terjadwal & Agenda Khusus',
      isVisible: true,
      order: 2,
      type: 'scheduled-content',
    },
    {
      id: 'about',
      label: 'About & Leadership',
      isVisible: true,
      order: 3,
      type: 'about',
      subtitle: 'ABOUT US',
      title: 'Mitra Strategis Ketenagakerjaan Anda',
      p1: 'PT. Empat Sinergi Utama adalah perusahaan penyedia tenaga kerja alih daya yang berkomitmen memberikan solusi terbaik untuk kebutuhan operasional bisnis Anda.',
      p2: 'Sumber daya manusia yang kami miliki adalah tenaga kerja yang sudah dieksekusi pelatihan di bidangnya masing-masing, siap bekerja.',
      leadershipTitle: 'Rekam Jejak Teruji',
      leadershipDesc: 'Dengan pengalaman CEO selama lebih dari 15 tahun bekerja di industri Penyedia Jasa Tenaga Kerja Non Grade.',
      quote: 'Integritas, Profesionalisme, Kualitas',
    },
    {
      id: 'services',
      label: 'Kelola Layanan (Services)',
      isVisible: true,
      order: 4,
      type: 'services',
      subtitle: 'OUR CAPABILITIES',
      title: 'LAYANAN ALIH DAYA KAMI',
      content: '*Seluruh penempatan dikontrol sah melalui Perjanjian Kerja Waktu Tertentu (PKWT).',
    },
    {
      id: 'portfolio',
      label: 'Portofolio / Proyek',
      isVisible: true,
      order: 5,
      type: 'portfolio',
      subtitle: 'PROVEN TRACK RECORD',
      title: 'PROJECT PORTFOLIO',
      content: 'Serta dipercaya mendukung pengerjaan proyek harian entitas swasta nasional.',
    },
    {
      id: 'career',
      label: 'Lowongan Kerja (Career)',
      isVisible: true,
      order: 6,
      type: 'career',
      subtitle: 'JOIN OUR TEAM',
      title: 'CAREER OPPORTUNITIES',
      content: 'Mari bergabung dan berkembang bersama korporat profesional kami.',
    },
    {
      id: 'gallery',
      label: 'Galeri & Dokumentasi',
      isVisible: true,
      order: 7,
      type: 'gallery',
      subtitle: 'OUR MOMENTS',
      title: 'GALERI DOKUMENTASI',
      content: 'Dokumentasi kegiatan operasional, fasilitas, dan proyek perusahaan.',
    },
    {
      id: 'contact',
      label: 'Footer & Kontak',
      isVisible: true,
      order: 8,
      type: 'contact',
      content: 'Penyedia Layanan Jasa Tenaga Kerja Alih Daya terpercaya, unggul, dan akuntabel di Indonesia.',
      address: 'Casa De Bosco No.3, Tangerang Selatan',
      phone: '+62 815 8480 5000',
      email: 'manpower.services@empatsinergiumata.com',
    },
  ],
  services: [
    { id: '1', title: 'JASA KEAMANAN', desc: 'Pengamanan fisik dan aset terpercaya.', icon: 'Shield', content: '...', images: [] },
    { id: '2', title: 'JASA KEBERSIHAN', desc: 'Kebersihan gedung dan fasilitas optimal.', icon: 'Building', content: '...', images: [] },
    { id: '3', title: 'TENAGA PENDUNGUNG', desc: 'SDM pendukung operasional handal.', icon: 'Users', content: '...', images: [] },
    { id: '4', title: 'PERAWATAN TAMAN', desc: 'Landscape dan perawatan taman profesional.', icon: 'Wrench', content: '...', images: [] },
  ],
  portfolios: [
    {
      id: '1',
      name: 'KEMENPORA RI',
      desc: 'Penyediaan tenaga pengamanan dan pendukung operasional gedung instansi.',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      name: 'KOTA TANGERANG SELATAN',
      desc: 'Dukungan fasilitas pelayanan publik dan pemeliharaan kawasan.',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    },
  ],
  career: [
    { id: '1', title: 'Security Officer (Satpam)', location: 'Jakarta Selatan', type: 'Full-time', desc: 'Melakukan pengamanan area gedung korporat.', requirements: 'Memiliki KTA resmi, berpengalaman min. 1 tahun.', isActive: true },
  ],
  galleries: [
    {
      id: '1',
      title: 'Pengamanan Gedung Korporat',
      desc: 'Standar operasional prosedur pengamanan fisik area gedung oleh personel bersertifikasi.',
      category: 'Keamanan',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Kebersihan Fasilitas Gedung',
      desc: 'Pemeliharaan kebersihan harian area publik dan perkantoran.',
      category: 'Kebersihan',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sec-patroli',
      title: 'Patroli & Pengawasan Area Fasilitas',
      desc: 'Inspeksi rutin titik rawan dan pengawasan sistem keamanan 24 jam.',
      category: 'Keamanan',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sec-access',
      title: 'Pengendalian Akses & Pemeriksaan Gedung',
      desc: 'Sistem alur masuk keluar tamu dan verifikasi keamanan profesional.',
      category: 'Keamanan',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'cln-sanitasi',
      title: 'Sanitasi & Perawatan Ruang Kerja',
      desc: 'Deep cleaning harian area perkantoran untuk kenyamanan karyawan.',
      category: 'Kebersihan',
      imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'cln-fasad',
      title: 'Pembersihan Kaca & Fasad Gedung',
      desc: 'Pembersihan kaca arsitektural dan pemolesan lantai gedung komersial.',
      category: 'Kebersihan',
      imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80'
    }
  ],
  galleryCategories: ['Keamanan', 'Kebersihan'],
  hero: { badge: '', titleLine1: '', titleHighlight: '', description: '' },
  about: { tag: '', heading: '', subtitle: '', title: '', p1: '', p2: '', leadershipTitle: '', leadershipDesc: '', quote: '' },
  servicesHeader: { tag: '', heading: '', note: '' },
  portfolioHeader: { tag: '', heading: '', note: '' },
  careerHeader: { tag: '', heading: '', note: '' },
  galleryHeader: { tag: '', heading: '', note: '' },
  footer: { 
    description: '', 
    address: '', 
    phone: '', 
    email: '',
    socialMedia: defaultFooterSocialMedia,
    inquiryTemplates: defaultInquiryTemplates
  },
  privacyPolicy: defaultPrivacyPolicy,
  termsOfService: defaultTermsOfService,
  directors: defaultDirectors,
  certifications: defaultCertifications,
  comproEmailTemplate: defaultComproEmailTemplate,
  leadershipPage: defaultLeadershipPageConfig,
  certificationsPage: defaultCertificationsPageConfig
}

const defaultData: Database = {
  ...defaultDataContent,
  published: JSON.parse(JSON.stringify(defaultDataContent)),
  notifications: [],
  auditLogs: [],
  hasDraft: false,
  comproRequests: [],
  visitorLogs: [],
  dailyVisitorCounts: [],
  activeSessions: {},
}

function enrichContent(content: DatabaseContent): DatabaseContent {
  const sections = content.sections || []
  if (!sections.some((s) => s.id === 'scheduled-content' || s.type === 'scheduled-content')) {
    const heroIdx = sections.findIndex((s) => s.id === 'hero')
    const insertIdx = heroIdx !== -1 ? heroIdx + 1 : 0
    sections.splice(insertIdx, 0, {
      id: 'scheduled-content',
      label: 'Konten Terjadwal & Agenda Khusus',
      isVisible: true,
      order: insertIdx + 1,
      type: 'scheduled-content',
    })
    sections.forEach((s, idx) => {
      s.order = idx + 1
    })
    content.sections = sections
  }

  const heroSec = (sections.find((s) => s.id === 'hero') || {}) as SectionConfig
  const aboutSec = (sections.find((s) => s.id === 'about') || {}) as SectionConfig
  const servicesSec = (sections.find((s) => s.id === 'services') || {}) as SectionConfig
  const portfolioSec = (sections.find((s) => s.id === 'portfolio') || {}) as SectionConfig
  const careerSec = (sections.find((s) => s.id === 'career') || {}) as SectionConfig
  const gallerySec = (sections.find((s) => s.id === 'gallery') || {}) as SectionConfig
  const contactSec = (sections.find((s) => s.id === 'contact') || {}) as SectionConfig

  return {
    ...content,
    hero: {
      badge: heroSec.badge || '',
      titleLine1: heroSec.titleLine1 || '',
      titleHighlight: heroSec.titleHighlight || '',
      description: heroSec.content || '',
      showcaseCard: (() => {
        const raw = heroSec.showcaseCard || content.hero?.showcaseCard || defaultHeroShowcase
        return {
          ...defaultHeroShowcase,
          ...raw,
          strengths: (raw.strengths && raw.strengths.length > 0) ? raw.strengths : defaultHeroShowcase.strengths,
          metrics: (raw.metrics && raw.metrics.length > 0) ? raw.metrics : defaultHeroShowcase.metrics,
          sectors: (raw.sectors && raw.sectors.length > 0) ? raw.sectors : defaultHeroShowcase.sectors,
          roles: (raw.roles && raw.roles.length > 0) ? raw.roles : defaultHeroShowcase.roles,
        }
      })(),
    },
    about: {
      tag: aboutSec.subtitle || '',
      heading: aboutSec.title || '',
      subtitle: aboutSec.subtitle || '',
      title: aboutSec.title || '',
      p1: aboutSec.p1 || '',
      p2: aboutSec.p2 || '',
      leadershipTitle: aboutSec.leadershipTitle || '',
      leadershipDesc: aboutSec.leadershipDesc || '',
      quote: aboutSec.quote || '',
    },
    servicesHeader: {
      tag: servicesSec.subtitle || '',
      heading: servicesSec.title || '',
      note: servicesSec.content || '',
    },
    portfolioHeader: {
      tag: portfolioSec.subtitle || '',
      heading: portfolioSec.title || '',
      note: portfolioSec.content || '',
    },
    careerHeader: {
      tag: careerSec.subtitle || '',
      heading: careerSec.title || '',
      note: careerSec.content || '',
    },
    galleryHeader: {
      tag: gallerySec.subtitle || '',
      heading: gallerySec.title || '',
      note: gallerySec.content || '',
    },
    footer: {
      description: contactSec.content || '',
      address: contactSec.address || '',
      phone: contactSec.phone || '',
      whatsapp: contactSec.whatsapp || contactSec.phone || '',
      email: contactSec.email || '',
      socialMedia: content.footer?.socialMedia || defaultFooterSocialMedia,
      inquiryTemplates: content.footer?.inquiryTemplates || defaultInquiryTemplates,
    },
    privacyPolicy: content.privacyPolicy || defaultPrivacyPolicy,
    termsOfService: content.termsOfService || defaultTermsOfService,
    leadershipPage: {
      ...defaultLeadershipPageConfig,
      ...(content.leadershipPage || {}),
    },
    certificationsPage: {
      ...defaultCertificationsPageConfig,
      ...(content.certificationsPage || {}),
    },
  }
}

export async function initializeSupabaseDB() {
  try {
    const client = getSupabase()
    if (!client) return
    await client
      .from('site_content')
      .upsert({ id: 1, data: defaultData })
  } catch (e) {
    console.error('Gagal inisialisasi database Supabase:', e)
  }
}

/**
 * Memfilter konten terjadwal yang telah kedaluwarsa lebih dari 7 hari (H+7).
 * Konten dengan endDate + 7 hari < waktu sekarang otomatis terhapus permanen.
 */
export function filterExpiredScheduledContentsH7(
  items?: ScheduledContentItem[]
): { kept: ScheduledContentItem[]; purged: ScheduledContentItem[] } {
  if (!items || items.length === 0) return { kept: [], purged: [] }
  const now = Date.now()
  const kept: ScheduledContentItem[] = []
  const purged: ScheduledContentItem[] = []

  for (const item of items) {
    if (!item.endDate) {
      kept.push(item)
      continue
    }
    // Akhir hari tanggal berakhir tayang (23:59:59.999)
    const endTime = item.endTime || '23:59'
    const endDateTime = new Date(`${item.endDate}T${endTime}:59.999Z`).getTime()
    if (isNaN(endDateTime)) {
      kept.push(item)
      continue
    }
    // H+7: 7 hari pasca tanggal kedaluwarsa (7 * 86,400,000 ms = 604,800,000 ms)
    const purgeThreshold = endDateTime + (7 * 24 * 60 * 60 * 1000)
    if (now > purgeThreshold) {
      purged.push(item)
    } else {
      kept.push(item)
    }
  }

  return { kept, purged }
}

/**
 * Pembersihan otomatis konten terjadwal kedaluwarsa H+7.
 * Menghapus data dari db dan berkas fisik gambar di media penyimpanan.
 */
export async function autoPurgeExpiredScheduledContents(): Promise<{ purgedCount: number; purgedTitles: string[] }> {
  try {
    const db = await readDB()
    const { kept, purged } = filterExpiredScheduledContentsH7(db.scheduledContents)
    if (purged.length === 0) {
      return { purgedCount: 0, purgedTitles: [] }
    }

    // Hapus berkas gambar yang tersimpan jika ada
    for (const item of purged) {
      if (item.imageUrl) {
        const fileName = item.imageUrl.split('/').pop()
        if (fileName) {
          try {
            await deleteFile(fileName)
          } catch {
            // Abaikan error penghapusan berkas fisik
          }
        }
      }
    }

    db.scheduledContents = kept
    if (db.published?.scheduledContents) {
      db.published.scheduledContents = filterExpiredScheduledContentsH7(db.published.scheduledContents).kept
    }

    await writeDB(db)
    const titles = purged.map((p) => p.title)
    console.log(`[Auto-Purge H+7] Otomatis menghapus ${purged.length} konten terjadwal kedaluwarsa H+7: ${titles.join(', ')}`)

    return { purgedCount: purged.length, purgedTitles: titles }
  } catch (err) {
    console.error('Gagal menjalankan autoPurgeExpiredScheduledContents:', err)
    return { purgedCount: 0, purgedTitles: [] }
  }
}

function processParsedData(parsed: Partial<Database>): Database {
  const sections: SectionConfig[] = (parsed.sections as SectionConfig[]) || (parsed.published?.sections as SectionConfig[]) || defaultData.sections
  if (!sections.some((s: SectionConfig) => s.id === 'scheduled-content')) {
    const schedDefault = defaultDataContent.sections.find(s => s.id === 'scheduled-content')
    if (schedDefault) sections.push(schedDefault)
  }
  if (!sections.some((s: SectionConfig) => s.id === 'career')) {
    const careerDefault = defaultDataContent.sections.find(s => s.id === 'career')
    if (careerDefault) sections.push(careerDefault)
  }
  if (!sections.some((s: SectionConfig) => s.id === 'gallery')) {
    const galleryDefault = defaultDataContent.sections.find(s => s.id === 'gallery')
    if (galleryDefault) sections.push(galleryDefault)
  }
  sections.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order)

  const published = (parsed.published || JSON.parse(JSON.stringify(defaultDataContent))) as DatabaseContent
  if (!published.career) published.career = defaultDataContent.career
  if (!published.galleries) published.galleries = defaultDataContent.galleries
  if (!published.careerHeader) published.careerHeader = defaultDataContent.careerHeader
  if (!published.galleryHeader) published.galleryHeader = defaultDataContent.galleryHeader
  if (!published.sections || !published.sections.some((s: SectionConfig) => s.id === 'scheduled-content')) {
    const schedSec = defaultDataContent.sections.find(s => s.id === 'scheduled-content')
    if (schedSec) {
      if (!published.sections) published.sections = []
      published.sections.push(schedSec)
    }
  }
  if (!published.sections || !published.sections.some((s: SectionConfig) => s.id === 'gallery')) {
    const gallerySec = defaultDataContent.sections.find(s => s.id === 'gallery')
    if (gallerySec) published.sections.push(gallerySec)
  }

  const rawBase: Database = {
    ...defaultData,
    ...parsed,
    setting: {
      ...defaultData.setting,
      ...(parsed.setting || parsed.published?.setting),
      primaryColor: parsed.setting?.primaryColor || parsed.published?.setting?.primaryColor || defaultData.setting.primaryColor,
      secondaryColor: parsed.setting?.secondaryColor || parsed.published?.setting?.secondaryColor || defaultData.setting.secondaryColor,
      accentColor: parsed.setting?.accentColor || parsed.published?.setting?.accentColor || defaultData.setting.accentColor,
      loadingBgColor: parsed.setting?.loadingBgColor || parsed.published?.setting?.loadingBgColor || parsed.setting?.primaryColor || defaultData.setting.primaryColor,
      slideDuration: parsed.setting?.slideDuration ?? parsed.published?.setting?.slideDuration ?? defaultData.setting.slideDuration,
      showLeadership: typeof (parsed.setting?.showLeadership ?? parsed.published?.setting?.showLeadership) === 'boolean'
        ? (parsed.setting?.showLeadership ?? parsed.published?.setting?.showLeadership)
        : true,
      showCertifications: typeof (parsed.setting?.showCertifications ?? parsed.published?.setting?.showCertifications) === 'boolean'
        ? (parsed.setting?.showCertifications ?? parsed.published?.setting?.showCertifications)
        : true,
      showCompro: typeof (parsed.setting?.showCompro ?? parsed.published?.setting?.showCompro) === 'boolean'
        ? (parsed.setting?.showCompro ?? parsed.published?.setting?.showCompro)
        : true,
      leadershipLabel: parsed.setting?.leadershipLabel || parsed.published?.setting?.leadershipLabel || 'Profil Pimpinan',
    },
    sections,
    services: ((parsed.services as ServiceItem[]) || (parsed.published?.services as ServiceItem[]) || defaultData.services).map((s: ServiceItem & { desc?: string }) => ({
      ...s,
      icon: s.icon || 'Briefcase',
      content: s.content || s.desc,
      images: s.images || []
    })),
    portfolios: (parsed.portfolios as PortfolioItem[]) || (parsed.published?.portfolios as PortfolioItem[]) || defaultData.portfolios,
    career: (parsed.career as CareerItem[]) || (parsed.published?.career as CareerItem[]) || defaultData.career,
    galleries: parsed.galleries || parsed.published?.galleries || defaultData.galleries,
    galleryCategories: (parsed.galleryCategories as string[]) || (parsed.published?.galleryCategories as string[]) || Array.from(new Set(((parsed.galleries || defaultData.galleries) as GalleryItem[]).map((g: GalleryItem) => g.category || 'Umum'))).filter(Boolean),
    scheduledContents: filterExpiredScheduledContentsH7(
      (parsed.scheduledContents as ScheduledContentItem[]) || (parsed.published?.scheduledContents as ScheduledContentItem[]) || []
    ).kept,
    cmsUsers: ((parsed.cmsUsers as Array<CmsUser & { mustChangePassword?: boolean }>) || []).map((u) => {
      const { mustChangePassword, ...rest } = u
      return {
        ...rest,
        mustResetPassword: Boolean(u.mustResetPassword ?? mustChangePassword),
        skipPasswordExpiry: Boolean(u.skipPasswordExpiry),
      }
    }),
    careerTemplates: (parsed.careerTemplates && parsed.careerTemplates.length > 0) ? parsed.careerTemplates : defaultCareerTemplates,
    privacyPolicy: (parsed.privacyPolicy as LegalContent) || (parsed.published?.privacyPolicy as LegalContent) || defaultPrivacyPolicy,
    termsOfService: (parsed.termsOfService as LegalContent) || (parsed.published?.termsOfService as LegalContent) || defaultTermsOfService,
    directors: (parsed.directors && parsed.directors.length > 0) ? parsed.directors : ((parsed.published?.directors && parsed.published.directors.length > 0) ? parsed.published.directors : defaultDirectors),
    certifications: (parsed.certifications && parsed.certifications.length > 0) ? parsed.certifications : ((parsed.published?.certifications && parsed.published.certifications.length > 0) ? parsed.published.certifications : defaultCertifications),
    comproEmailTemplate: parsed.comproEmailTemplate || parsed.published?.comproEmailTemplate || defaultComproEmailTemplate,
    leadershipPage: {
      ...defaultLeadershipPageConfig,
      ...(parsed.published?.leadershipPage || {}),
      ...(parsed.leadershipPage || {}),
    },
    certificationsPage: {
      ...defaultCertificationsPageConfig,
      ...(parsed.published?.certificationsPage || {}),
      ...(parsed.certificationsPage || {}),
    },
    seoSetting: parsed.seoSetting || parsed.published?.seoSetting || defaultSeoSetting,
    published,
    notifications: parsed.notifications || [],
    auditLogs: parsed.auditLogs || [],
    hasDraft: typeof parsed.hasDraft === 'boolean' ? parsed.hasDraft : false,
    comproRequests: parsed.comproRequests || [],
    visitorLogs: parsed.visitorLogs || [],
    dailyVisitorCounts: parsed.dailyVisitorCounts || [],
    activeSessions: parsed.activeSessions || {},
    loginAttempts: parsed.loginAttempts || {},
    draftLock: parsed.draftLock,
    lastPublishedAt: parsed.lastPublishedAt || parsed.published?.lastPublishedAt,
  }

  const enriched = enrichContent(rawBase)
  return {
    ...rawBase,
    ...enriched,
    published: enrichContent(rawBase.published)
  }
}

// Helper aman untuk fs dan path agar bundler Turbopack / client tidak membundel node built-in
async function getFs() {
  if (typeof window !== 'undefined') return null
  try {
    return (await import('node:fs')).promises
  } catch {
    return null
  }
}

async function getPath() {
  if (typeof window !== 'undefined') return null
  try {
    const p = await import('node:path')
    return p.default || p
  } catch {
    return null
  }
}

export async function readDB(): Promise<Database> {
  try {
    const client = getSupabase()
    if (client) {
      const { data, error } = await client
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single()

      if (!error && data && data.data) {
        const parsed = processParsedData(data.data as Partial<Database>)
        ;(parsed as unknown as Record<string, unknown>)._readSource = 'supabase'
        return parsed
      }
      if (error) {
        lastSupabaseFailure = Date.now()
      }
    }
  } catch (err) {
    lastSupabaseFailure = Date.now()
    console.warn('Supabase tidak dapat dihubungi saat readDB, menggunakan data lokal:', err)
  }

  // Fallback: baca dari data/db.json jika ada
  try {
    const fs = await getFs()
    const path = await getPath()
    if (!fs || !path) return defaultData
    const localContent = await fs.readFile(path.join(process.cwd(), 'data', 'db.json'), 'utf-8')
    const parsed = processParsedData(JSON.parse(localContent))
    ;(parsed as unknown as Record<string, unknown>)._readSource = 'local'
    return parsed
  } catch {
    return defaultData
  }
}

export async function readPublishedDB(): Promise<DatabaseContent> {
  const db = await readDB()
  const pub = db.published || enrichContent({
    setting: db.setting,
    sections: db.sections,
    services: db.services,
    portfolios: db.portfolios,
    career: db.career,
    galleries: db.galleries,
    hero: defaultDataContent.hero,
    about: defaultDataContent.about,
    servicesHeader: defaultDataContent.servicesHeader,
    portfolioHeader: defaultDataContent.portfolioHeader,
    careerHeader: defaultDataContent.careerHeader,
    galleryHeader: defaultDataContent.galleryHeader,
    footer: defaultDataContent.footer,
    scheduledContents: db.scheduledContents || [],
    privacyPolicy: db.privacyPolicy || defaultPrivacyPolicy,
    termsOfService: db.termsOfService || defaultTermsOfService,
    directors: db.directors || defaultDirectors,
    certifications: db.certifications || defaultCertifications,
    comproEmailTemplate: db.comproEmailTemplate || defaultComproEmailTemplate,
  })

  if (!pub.scheduledContents || pub.scheduledContents.length === 0) {
    pub.scheduledContents = db.scheduledContents || []
  }
  if (!pub.privacyPolicy) {
    pub.privacyPolicy = db.privacyPolicy || defaultPrivacyPolicy
  }
  if (!pub.termsOfService) {
    pub.termsOfService = db.termsOfService || defaultTermsOfService
  }
  if (!pub.directors || pub.directors.length === 0) {
    pub.directors = db.directors || defaultDirectors
  }
  if (!pub.certifications || pub.certifications.length === 0) {
    pub.certifications = db.certifications || defaultCertifications
  }
  if (!pub.comproEmailTemplate) {
    pub.comproEmailTemplate = db.comproEmailTemplate || defaultComproEmailTemplate
  }
  if (!pub.leadershipPage) {
    pub.leadershipPage = db.leadershipPage || defaultLeadershipPageConfig
  }
  if (!pub.certificationsPage) {
    pub.certificationsPage = db.certificationsPage || defaultCertificationsPageConfig
  }
  if (!pub.setting) {
    pub.setting = { ...db.setting }
  } else if (!pub.setting.logoUrl && db.setting?.logoUrl) {
    pub.setting.logoUrl = db.setting.logoUrl
  }
  if (pub.setting && typeof pub.setting.showCompro !== 'boolean') {
    pub.setting.showCompro = typeof db.setting?.showCompro === 'boolean' ? db.setting.showCompro : true
  }
  if (!pub.footer) {
    pub.footer = { ...defaultDataContent.footer }
  }
  if (!pub.footer.socialMedia) {
    pub.footer.socialMedia = db.footer?.socialMedia || defaultFooterSocialMedia
  }
  if (!pub.footer.inquiryTemplates) {
    pub.footer.inquiryTemplates = db.footer?.inquiryTemplates || defaultInquiryTemplates
  }

  return pub
}

async function writeSupabaseRaw(data: Database) {
  // Pastikan konten kedaluwarsa H+7 otomatis terhapus saat penulisan database
  if (data.scheduledContents) {
    data.scheduledContents = filterExpiredScheduledContentsH7(data.scheduledContents).kept
  }
  if (data.published?.scheduledContents) {
    data.published.scheduledContents = filterExpiredScheduledContentsH7(data.published.scheduledContents).kept
  }
  let supabaseSuccess = false

  // Optimistic versioning & timestamp (T2)
  const currentRecord = data as unknown as Record<string, unknown>
  currentRecord.version = (Number(currentRecord.version) || 0) + 1
  currentRecord.updatedAt = Date.now()

  try {
    const client = getSupabase()
    if (client) {
      // Jika data dibaca dari fallback lokal di production, cegah menimpa data Supabase yang lebih baru (T3)
      if (currentRecord._readSource === 'local' && process.env.NODE_ENV === 'production') {
        const { data: currentCloud } = await client
          .from('site_content')
          .select('data')
          .eq('id', 1)
          .single()

        if (currentCloud && currentCloud.data) {
          const cloudVersion = Number((currentCloud.data as Record<string, unknown>).version) || 0
          const localVersion = Number(currentRecord.version) || 0
          if (cloudVersion >= localVersion) {
            console.warn('[DB INTEGRITY] Penulisan dibatalkan: data lokal terdeteksi usang dibandingkan data Supabase cloud.')
            return
          }
        }
      }

      const { error } = await client
        .from('site_content')
        .upsert({ id: 1, data })

      if (!error) {
        supabaseSuccess = true
        currentRecord._readSource = 'supabase'
      } else {
        lastSupabaseFailure = Date.now()
        console.warn('Gagal menulis ke Supabase:', error.message)
      }
    }
  } catch (err) {
    lastSupabaseFailure = Date.now()
    console.warn('Supabase tidak dapat dihubungi saat writeDB:', err)
  }

  // Selalu cadangkan / fallback ke data/db.json secara lokal
  try {
    const fs = await getFs()
    const path = await getPath()
    if (fs && path) {
      const dataDir = path.join(process.cwd(), 'data')
      await fs.mkdir(dataDir, { recursive: true })
      const filePath = path.join(dataDir, 'db.json')
      const tmpPath = path.join(dataDir, 'db.json.tmp.' + Date.now())
      await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
      try {
        await fs.rename(tmpPath, filePath)
      } catch {
        await fs.copyFile(tmpPath, filePath)
        await fs.unlink(tmpPath).catch(() => {})
      }
    }
  } catch (fileErr) {
    console.error('Gagal menyimpan ke data/db.json:', fileErr)
    if (!supabaseSuccess) {
      throw new Error('Gagal menyimpan data ke database cloud maupun lokal.')
    }
  }
}

export async function writeSystemDB(data: Database) {
  await writeSupabaseRaw(data)
}

export async function writeDB(data: Database, customUser?: { id?: string; name?: string; username?: string }) {
  if (customUser && customUser.id) {
    if (data.draftLock && data.draftLock.userId !== customUser.id) {
      const DRAFT_LOCK_TIMEOUT = 30 * 60 * 1000
      if (Date.now() - data.draftLock.lastActive < DRAFT_LOCK_TIMEOUT) {
        throw new Error(`Perubahan ditolak: Draft sedang dikunci oleh ${data.draftLock.userName}. Tunggu hingga pengguna tersebut selesai atau sesi berakhir.`)
      }
    }
    data.draftLock = {
      userId: customUser.id,
      userName: customUser.name || 'User CMS',
      userEmail: customUser.username,
      lockedAt: data.draftLock?.userId === customUser.id ? data.draftLock.lockedAt : Date.now(),
      lastActive: Date.now(),
    }
  }

  const payload = {
    ...data,
    hasDraft: true
  }
  await writeSupabaseRaw(payload)
}

export async function deployDB(customUser?: { userName?: string; userEmail?: string; userRole?: string; id?: string }) {
  const db = await readDB()

  // Periksa draft lock (Point 8)
  if (db.draftLock) {
    const DRAFT_LOCK_TIMEOUT = 30 * 60 * 1000
    if (Date.now() - db.draftLock.lastActive < DRAFT_LOCK_TIMEOUT) {
      if (customUser?.id && db.draftLock.userId !== customUser.id && customUser.userRole?.toLowerCase() !== 'superadmin') {
        throw new Error(`Deploy ditolak: Konten draft sedang dikunci dan dikerjakan oleh ${db.draftLock.userName}. Hanya pengguna tersebut yang dapat men-deploy perubahan.`)
      }
    }
  }

  db.published = {
    setting: JSON.parse(JSON.stringify(db.setting)),
    sections: JSON.parse(JSON.stringify(db.sections)),
    services: JSON.parse(JSON.stringify(db.services)),
    portfolios: JSON.parse(JSON.stringify(db.portfolios)),
    career: JSON.parse(JSON.stringify(db.career)),
    galleries: JSON.parse(JSON.stringify(db.galleries)),
    galleryCategories: JSON.parse(JSON.stringify(db.galleryCategories || [])),
    hero: JSON.parse(JSON.stringify(db.hero)),
    about: JSON.parse(JSON.stringify(db.about)),
    servicesHeader: JSON.parse(JSON.stringify(db.servicesHeader)),
    portfolioHeader: JSON.parse(JSON.stringify(db.portfolioHeader)),
    careerHeader: JSON.parse(JSON.stringify(db.careerHeader)),
    galleryHeader: JSON.parse(JSON.stringify(db.galleryHeader)),
    footer: JSON.parse(JSON.stringify(db.footer)),
    scheduledContents: JSON.parse(JSON.stringify(db.scheduledContents || [])),
    privacyPolicy: JSON.parse(JSON.stringify(db.privacyPolicy || defaultPrivacyPolicy)),
    termsOfService: JSON.parse(JSON.stringify(db.termsOfService || defaultTermsOfService)),
    directors: JSON.parse(JSON.stringify(db.directors || defaultDirectors)),
    certifications: JSON.parse(JSON.stringify(db.certifications || defaultCertifications)),
    comproEmailTemplate: JSON.parse(JSON.stringify(db.comproEmailTemplate || defaultComproEmailTemplate)),
    leadershipPage: JSON.parse(JSON.stringify(db.leadershipPage || defaultLeadershipPageConfig)),
    certificationsPage: JSON.parse(JSON.stringify(db.certificationsPage || defaultCertificationsPageConfig)),
    seoSetting: JSON.parse(JSON.stringify(db.seoSetting || defaultSeoSetting)),
  }
  db.published = enrichContent(db.published)
  const publishTime = Date.now()
  db.lastPublishedAt = publishTime
  db.published.lastPublishedAt = publishTime
  db.hasDraft = false
  db.draftLock = undefined // Release draft lock on deploy!

  if (!db.notifications) db.notifications = []
  if (!db.auditLogs) db.auditLogs = []

  const logItem: AuditLogItem = {
    id: 'log-' + Date.now(),
    message: 'Semua perubahan draft berhasil di-deploy ke halaman utama.',
    timestamp: Date.now(),
    type: 'DEPLOY' as const,
    category: 'system' as const,
    userName: customUser?.userName || 'Administrator',
    userEmail: customUser?.userEmail || 'admin',
    userRole: customUser?.userRole || 'Superadmin',
  }

  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    message: logItem.message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type: 'DEPLOY',
    category: 'system',
  })
  db.auditLogs.unshift(logItem)

  await writeSupabaseRaw(db)
}

export async function addNotification(
  message: string, 
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER' | 'COMPRO' | 'VISITOR' | 'AUTH',
  category: 'system' | 'visitor' | 'career' | 'compro' = 'system',
  customUser?: { userId?: string; userName?: string; userEmail?: string; userRole?: string; ip?: string; isSystemOnly?: boolean }
) {
  const db = await readDB()
  if (!db.notifications) db.notifications = []
  if (!db.auditLogs) db.auditLogs = []

  let activeUserId = customUser?.userId
  let activeUserName = customUser?.userName
  let activeUserEmail = customUser?.userEmail
  let activeUserRole = customUser?.userRole

  if (!activeUserId && !activeUserName) {
    try {
      const { getCurrentUser } = await import('./auth')
      const curr = await getCurrentUser()
      if (curr) {
        activeUserId = curr.id
        activeUserName = curr.name
        activeUserEmail = curr.username
        activeUserRole = curr.role
      }
    } catch {}
  }

  const resolvedUserId = activeUserId || (category === 'visitor' ? 'visitor' : 'admin')
  const resolvedUserName = activeUserName || (category === 'visitor' ? 'Pengunjung' : 'Administrator')
  const resolvedUserEmail = activeUserEmail || (category === 'visitor' ? 'visitor' : 'admin')
  const resolvedUserRole = activeUserRole || (category === 'visitor' ? 'Pengunjung Web' : 'Administrator')

  const logItem: AuditLogItem = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    message,
    timestamp: Date.now(),
    type,
    category,
    userId: resolvedUserId,
    userName: resolvedUserName,
    userEmail: resolvedUserEmail,
    userRole: resolvedUserRole,
    ip: customUser?.ip,
  }

  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type,
    category,
    userId: resolvedUserId,
    userName: resolvedUserName,
    userEmail: resolvedUserEmail,
    userRole: resolvedUserRole,
  })
  db.auditLogs.unshift(logItem)

  // Otomasi Retensi 90 Hari & Backup TXT (Point 10)
  try {
    await archiveAndPurgeAuditLogs(db)
  } catch (purgeErr) {
    console.warn('Gagal memproses arsip audit log 90 hari:', purgeErr)
  }

  if (category === 'system' && type !== 'DEPLOY' && type !== 'AUTH' && !customUser?.isSystemOnly) {
    db.hasDraft = true
  }
  await writeSupabaseRaw(db)
}

export async function markNotificationsAsViewed(forUserId?: string, isPrivileged?: boolean) {
  const db = await readDB()
  const now = Date.now()
  if (db.notifications) {
    db.notifications = db.notifications.map(n => {
      const isTarget = isPrivileged || !forUserId || n.userId === forUserId || n.userEmail === forUserId
      if (isTarget) {
        return {
          ...n,
          viewedAt: n.viewedAt || now
        }
      }
      return n
    })
  }
  await writeSupabaseRaw(db)
}

export async function clearNotifications(forUserId?: string, isPrivileged?: boolean) {
  const db = await readDB()
  if (!db.notifications) return
  if (isPrivileged || !forUserId) {
    db.notifications = []
  } else {
    db.notifications = db.notifications.filter(
      (n) => n.userId !== forUserId && n.userEmail !== forUserId
    )
  }
  await writeSupabaseRaw(db)
}

// ==================== UPLOAD FILE KE SUPABASE STORAGE DENGAN FALLBACK LOKAL ====================
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg',
  options?: { isLogo?: boolean }
): Promise<string> {
  const { sanitizeFilename, validateImageBuffer } = await import('@/lib/fileSecurity')
  const { MAX_IMAGE_FILE_SIZE } = await import('@/lib/imageOptimizer')
  const safeName = sanitizeFilename(fileName)

  // 1. Validasi batas maksimal 10MB
  if (buffer.length > MAX_IMAGE_FILE_SIZE) {
    const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2)
    throw new Error(`Ukuran berkas (${sizeInMB}MB) melebihi batas maksimal 10MB.`)
  }

  // 2. Validasi biner berkas gambar demi mencegah Stored XSS / file script
  const imgCheck = validateImageBuffer(buffer, safeName)
  if (!imgCheck.valid) {
    throw new Error(imgCheck.message || 'Berkas bukan gambar yang valid atau format ditolak demi alasan keamanan.')
  }

  const effectiveContentType = imgCheck.mime || contentType

  // 3. Sistem Pintar Konversi Berkas Gambar:
  // - Logo: Semua format (PNG, JPG, WebP, GIF, SVG, BMP, TIFF) otomatis di-convert ke vektor SVG (.svg)
  // - Foto/Gambar umum: Semua format otomatis di-convert ke WebP (.webp) dengan ketajaman tinggi & kompresi efisien
  let uploadBuffer = buffer
  let targetFileName = safeName
  let finalContentType = effectiveContentType

  const isLogo = Boolean(
    options?.isLogo ||
    safeName.toLowerCase().startsWith('logo') ||
    safeName.toLowerCase().includes('logo-') ||
    effectiveContentType === 'image/svg+xml'
  )

  try {
    if (isLogo) {
      const { convertLogoToSvg } = await import('@/lib/imageOptimizer')
      const logoResult = await convertLogoToSvg(buffer, safeName)
      uploadBuffer = logoResult.buffer
      targetFileName = logoResult.fileName
      finalContentType = logoResult.contentType
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[LogoEngine] Berhasil konversi logo ke SVG: ${safeName} -> ${targetFileName}`)
      }
    } else {
      const { optimizeImage } = await import('@/lib/imageOptimizer')
      const optResult = await optimizeImage(buffer, safeName)
      uploadBuffer = optResult.buffer
      targetFileName = optResult.fileName
      finalContentType = optResult.contentType
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[ImageOptimizer] Berhasil konversi ke WebP tajam: ${safeName} (${optResult.originalSizeKB}KB) -> ${targetFileName} (${optResult.optimizedSizeKB}KB, hemat ${optResult.compressionRatio})`
        )
      }
    }
  } catch (optErr) {
    console.warn('[ImageEngine] Konversi gambar gagal atau dilewati, menggunakan buffer asli:', optErr)
  }

  // 4. Selalu simpan salinan lokal di public/uploads/ agar file terjamin selalu ada
  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(path.join(uploadsDir, targetFileName), uploadBuffer)
  } catch (localErr) {
    console.warn('Gagal menyimpan file ke public/uploads lokal:', localErr)
  }

  const isLocalStorage = process.env.STORAGE_DRIVER === 'local'

  if (!isLocalStorage) {
    try {
      const client = getSupabase()
      if (client) {
        const { error } = await client.storage
          .from('uploads')
          .upload(targetFileName, uploadBuffer, {
            contentType: finalContentType,
            upsert: true,
          })

        if (!error) {
          const { data: publicUrlData } = client.storage
            .from('uploads')
            .getPublicUrl(targetFileName)
          // Jika URL Supabase adalah remote publik HTTPS (produksi), gunakan URL tersebut
          if (publicUrlData.publicUrl && publicUrlData.publicUrl.startsWith('https://')) {
            return publicUrlData.publicUrl
          }
        } else {
          console.warn('Gagal upload ke Supabase Storage, menggunakan path lokal:', error.message)
        }
      }
    } catch (err) {
      console.warn('Supabase Storage tidak dapat dihubungi, menggunakan path lokal:', err)
    }
  }

  return `/uploads/${targetFileName}`
}

export async function deleteFile(fileName: string): Promise<void> {
  const { sanitizeFilename } = await import('@/lib/fileSecurity')
  const safeName = sanitizeFilename(fileName)

  if (process.env.STORAGE_DRIVER !== 'local') {
    try {
      const client = getSupabase()
      if (client) {
        await client.storage.from('uploads').remove([safeName])
      }
    } catch {
      // Abaikan jika Supabase offline
    }
  }

  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const localPath = path.join(process.cwd(), 'public', 'uploads', safeName)
    await fs.unlink(localPath)
  } catch {
    // Abaikan jika file tidak ditemukan
  }
}

// ==================== POINT 10: AUDIT LOG AUTO-PURGE (90 HARI) & TXT BACKUP ====================
export async function archiveAndPurgeAuditLogs(db: Database): Promise<{ purgedCount: number; backupPath?: string }> {
  if (!db.auditLogs || db.auditLogs.length === 0) return { purgedCount: 0 }
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
  const cutoff = Date.now() - NINETY_DAYS_MS

  const oldLogs = db.auditLogs.filter((l) => l.timestamp < cutoff)
  if (oldLogs.length === 0) return { purgedCount: 0 }

  const fs = await getFs()
  const path = await getPath()
  if (!fs || !path) return { purgedCount: 0 }
  let backupPath: string | undefined
  try {
    const backupDir = path.join(process.cwd(), 'data', 'backups')
    await fs.mkdir(backupDir, { recursive: true })

    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const fileName = `audit_backup_${dateStr}_${Date.now()}.txt`
    const filePath = path.join(backupDir, fileName)

    let content = `================================================================================\n`
    content += `ARSIF AUDIT LOG OTOMATIS (RETENSI 90 HARI) - PT EMPAT SINERGI UTAMA\n`
    content += `Tanggal Backup: ${now.toLocaleString('id-ID')}\n`
    content += `Jumlah Entri Terbackup: ${oldLogs.length} entri\n`
    content += `================================================================================\n\n`

    for (const log of oldLogs) {
      const t = new Date(log.timestamp).toLocaleString('id-ID')
      const user = log.userName ? `${log.userName} (${log.userRole || 'User'})` : 'Sistem'
      content += `[${t}] [${(log.category || 'system').toUpperCase()}] [${log.type}] [${user}]\n`
      content += `Pesan: ${log.message}\n`
      if (log.ip) content += `IP: ${log.ip}\n`
      content += `--------------------------------------------------------------------------------\n`
    }

    await fs.writeFile(filePath, content, 'utf-8')
    backupPath = filePath
  } catch {
    // Pada environment read-only (seperti Vercel), lewati penulisan backup fisik
  }

  // Pangkas dari array database aktif
  db.auditLogs = db.auditLogs.filter((l) => l.timestamp >= cutoff)
  return { purgedCount: oldLogs.length, backupPath }
}

export function generateAuditLogTxt(logs: AuditLogItem[], dailyVisitors?: DailyVisitorCount[]): string {
  let content = `================================================================================\n`
  content += `EKSPOR RIWAYAT AUDIT LOG & STATISTIK - PT EMPAT SINERGI UTAMA\n`
  content += `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}\n`
  content += `Total Rekaman Log: ${logs.length} entri\n`
  content += `================================================================================\n\n`

  if (dailyVisitors && dailyVisitors.length > 0) {
    content += `================================================================================\n`
    content += `REKAPITULASI COUNTER PENGUNJUNG HARIAN (MAKSIMAL 30 HARI BERGULIR)\n`
    content += `================================================================================\n`
    for (const v of dailyVisitors) {
      content += `Tanggal: ${v.date} | Total Kunjungan: ${v.count} kali\n`
      if (v.paths) {
        const breakdown = Object.entries(v.paths).map(([p, c]) => `${p}: ${c}`).join(', ')
        content += `  Rincian Halaman: ${breakdown}\n`
      }
    }
    content += `================================================================================\n\n`
  }

  content += `--------------------------------------------------------------------------------\n`
  content += `LOG AKTIVITAS SISTEM, LAMARAN & COMPRO\n`
  content += `--------------------------------------------------------------------------------\n`
  for (const log of logs) {
    const t = new Date(log.timestamp).toLocaleString('id-ID')
    const user = log.userName ? `${log.userName} (${log.userRole || 'User'})` : 'Sistem'
    content += `[${t}] [${(log.category || 'system').toUpperCase()}] [${log.type}] [${user}]\n`
    content += `Pesan: ${log.message}\n`
    if (log.ip) content += `IP: ${log.ip}\n`
    content += `--------------------------------------------------------------------------------\n`
  }
  return content
}

// ==================== POINT 6 REVISI: VISITOR DAILY COUNTER (30 HARI BERGULIR) ====================
export function isComproPath(pathName: string): boolean {
  if (!pathName || typeof pathName !== "string") return false
  const normalized = pathName.toLowerCase().split("?")[0].split("#")[0].replace(/\/+/g, "/").trim()
  if (
    !normalized.startsWith("/") ||
    normalized.startsWith("/cms") ||
    normalized.startsWith("/admin") ||
    normalized.startsWith("/login") ||
    normalized.startsWith("/api") ||
    normalized.includes("..") ||
    normalized.includes(".")
  ) {
    return false
  }
  return true
}

export async function addVisitorLog(pathName: string, _ip?: string, _userAgent?: string, _referer?: string) {
  void _ip
  void _userAgent
  void _referer
  try {
    if (!isComproPath(pathName)) {
      return
    }

    const db = await readDB()
    if (!db.dailyVisitorCounts) db.dailyVisitorCounts = []
    // Bersihkan jalur non-compro (seperti /login) dari data harian yang tersimpan
    for (const item of db.dailyVisitorCounts) {
      if (item.paths) {
        let dirty = false
        const cleanPaths: Record<string, number> = {}
        for (const [p, c] of Object.entries(item.paths)) {
          if (isComproPath(p)) {
            cleanPaths[p] = c
          } else {
            dirty = true
          }
        }
        if (dirty) {
          item.paths = cleanPaths
          item.count = Object.values(cleanPaths).reduce((acc, val) => acc + val, 0)
        }
      }
    }

    // Format tanggal hari ini WIB / Asia/Jakarta (YYYY-MM-DD)
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())

    let todayEntry = db.dailyVisitorCounts.find((item) => item.date === todayStr)
    if (!todayEntry) {
      todayEntry = {
        date: todayStr,
        count: 1,
        paths: { [pathName]: 1 }
      }
      db.dailyVisitorCounts.unshift(todayEntry)
    } else {
      todayEntry.count = (todayEntry.count || 0) + 1
      if (!todayEntry.paths) todayEntry.paths = {}
      todayEntry.paths[pathName] = (todayEntry.paths[pathName] || 0) + 1
    }

    // Urutkan tanggal terbaru ke terlama
    db.dailyVisitorCounts.sort((a, b) => b.date.localeCompare(a.date))

    // Batasi strictly 30 hari. Jika sudah hari ke-31, data hari pertama (terlama) otomatis tertimpa / terhapus
    if (db.dailyVisitorCounts.length > 30) {
      db.dailyVisitorCounts = db.dailyVisitorCounts.slice(0, 30)
    }

    // Bersihkan auditLogs dari catatan visitor individual lama agar database tetap ramping
    if (db.auditLogs && db.auditLogs.some((l) => l.category === 'visitor' || l.type === 'VISITOR')) {
      db.auditLogs = db.auditLogs.filter((l) => l.category !== 'visitor' && l.type !== 'VISITOR')
    }
    // Hapus visitorLogs lama jika ada
    if (db.visitorLogs) {
      delete db.visitorLogs
    }

    await writeSupabaseRaw(db)
  } catch (err) {
    console.warn('Gagal mencatat visitor counter:', err)
  }
}

// ==================== POINT 8: DRAFT LOCK LOGIC ====================
export function checkDraftLock(
  user: { id: string; name: string },
  db: Database
): { isLockedByOther: boolean; lockHolderName?: string; lockedAt?: number } {
  if (!db.draftLock) return { isLockedByOther: false }
  const now = Date.now()
  const DRAFT_LOCK_TIMEOUT = 30 * 60 * 1000 // 30 menit
  if (now - db.draftLock.lastActive > DRAFT_LOCK_TIMEOUT) {
    return { isLockedByOther: false }
  }
  if (db.draftLock.userId === user.id) {
    return { isLockedByOther: false }
  }
  return {
    isLockedByOther: true,
    lockHolderName: db.draftLock.userName,
    lockedAt: db.draftLock.lockedAt,
  }
}

export function releaseDraftLock(db: Database) {
  db.draftLock = undefined
}

// ==================== POINT 3 & 5: PERMINTAAN COMPRO PDF ====================
export async function addComproRequest(item: Omit<ComproRequestItem, 'id' | 'createdAt' | 'status'>): Promise<ComproRequestItem> {
  const db = await readDB()
  if (!db.comproRequests) db.comproRequests = []
  if (!db.auditLogs) db.auditLogs = []

  const now = Date.now()
  const newRequest: ComproRequestItem = {
    ...item,
    id: 'req-' + now + '-' + Math.random().toString(36).substring(2, 6),
    status: 'sent',
    createdAt: now,
    sentAt: now,
  }

  db.comproRequests.unshift(newRequest)

  // Catat ke Audit Log kategori 'compro' (Point 6)
  db.auditLogs.unshift({
    id: 'log-compro-' + now,
    message: `Permintaan Compro PDF baru dari "${newRequest.name}" (${newRequest.company || 'Pribadi/Instansi'}). Email: ${newRequest.email}, Telp: ${newRequest.phone}.`,
    timestamp: now,
    type: 'COMPRO',
    category: 'compro',
    userName: newRequest.name,
    userRole: 'Klien Pemohon',
    ip: newRequest.ip,
  })

  await archiveAndPurgeAuditLogs(db)
  await writeSupabaseRaw(db)
  return newRequest
}

export async function updateComproRequestStatus(id: string, status: 'sent' | 'pending' | 'followed_up') {
  const db = await readDB()
  if (!db.comproRequests) return
  const req = db.comproRequests.find((r) => r.id === id)
  if (req) {
    req.status = status
    await writeSupabaseRaw(db)
  }
}

export async function deleteComproRequest(id: string) {
  const db = await readDB()
  if (!db.comproRequests) return
  db.comproRequests = db.comproRequests.filter((r) => r.id !== id)
  await writeSupabaseRaw(db)
}