// lib/db.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// Prioritaskan Service Role Key agar operasi backend/admin bisa bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

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
}

export interface NotificationItem {
  id: string
  message: string
  time: string
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER'
  category?: 'system' | 'career' | string
  viewedAt?: number
}

export interface AuditLogItem {
  id: string
  message: string
  timestamp: number
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER'
  category?: 'system' | 'career' | string
  userName?: string
  userEmail?: string
  userRole?: string
}

export interface HeroShowcaseConfig {
  enabled: boolean
  liveBadgeText: string
  strengths: Array<{
    icon: string
    title: string
    desc: string
  }>
  metrics: Array<{
    num: string
    label: string
    sub: string
  }>
  sectors: Array<{
    icon: string
    name: string
  }>
  roles: Array<{
    icon: string
    title: string
    tag: string
    desc: string
  }>
  ctaText?: string
  ctaLink?: string
  profileText?: string
  profileLink?: string
}

export const defaultHeroShowcase: HeroShowcaseConfig = {
  enabled: true,
  liveBadgeText: 'SISTEM AKTIF',
  strengths: [
    {
      icon: 'Zap',
      title: 'Respons Tanggap Cepat 24/7',
      desc: 'Penanganan insiden & pergantian personel darurat < 2 jam.'
    },
    {
      icon: 'Award',
      title: 'Personel Tersertifikasi Legal',
      desc: 'Tersertifikasi resmi BNSP dan dibekali pelatihan berkala.'
    },
    {
      icon: 'Users',
      title: 'Bebas Sengketa & Akuntabel',
      desc: 'Jaminan kepatuhan UU Ketenagakerjaan, BPJS, & payroll transparan.'
    },
    {
      icon: 'ShieldCheck',
      title: 'Budaya K3 & Zero-Accident',
      desc: 'Disiplin keselamatan kerja tinggi untuk perlindungan aset optimal.'
    }
  ],
  metrics: [
    {
      num: '15+',
      label: 'Tahun Pengalaman',
      sub: 'Pimpinan Teruji'
    },
    {
      num: '500+',
      label: 'Tenaga Siap Kerja',
      sub: 'Penempatan Cepat'
    },
    {
      num: '99.8%',
      label: 'Kepuasan Klien',
      sub: 'Pemenuhan SLA'
    },
    {
      num: '100%',
      label: 'Kepatuhan Legalitas',
      sub: 'Izin Kemenaker Resmi'
    }
  ],
  sectors: [
    { icon: 'Building2', name: 'Perkantoran Komersial' },
    { icon: 'Factory', name: 'Pabrik & Kawasan Industri' },
    { icon: 'Store', name: 'Mall & Pusat Perbelanjaan' },
    { icon: 'Activity', name: 'Rumah Sakit & Fasilitas Medis' },
    { icon: 'Truck', name: 'Pergudangan & Logistik' },
    { icon: 'GraduationCap', name: 'Institusi Pendidikan' }
  ],
  roles: [
    {
      icon: 'ShieldCheck',
      title: 'Satuan Pengamanan (Gada Pratama / Madya)',
      tag: 'Personel Tersertifikasi',
      desc: 'Perlindungan aset fisik & korporat berstandar regulasi'
    },
    {
      icon: 'Sparkles',
      title: 'Jasa Kebersihan & Manajemen Fasilitas',
      tag: 'Standar Higienis',
      desc: 'Perawatan gedung, kantor, dan fasilitas komersial prima'
    },
    {
      icon: 'Car',
      title: 'Pengemudi Profesional & Eksekutif',
      tag: 'Safety Driving',
      desc: 'Disiplin waktu, berlisensi, dan penguasaan rute handal'
    },
    {
      icon: 'Wrench',
      title: 'Operator Pabrik & Teknisi Pemeliharaan',
      tag: 'Siap Kerja',
      desc: 'Tenaga terampil siap dukung target operasional industri'
    }
  ],
  ctaText: 'Konsultasi Kebutuhan Mitra →',
  ctaLink: '#contact',
  profileText: 'Profil Perusahaan',
  profileLink: '#about'
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
  }
  sections: SectionConfig[]
  services: ServiceItem[]
  portfolios: PortfolioItem[]
  career: CareerItem[]
  galleries: GalleryItem[]
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

export interface Database extends DatabaseContent {
  published: DatabaseContent
  notifications: NotificationItem[]
  auditLogs: AuditLogItem[]
  hasDraft: boolean
  cmsUsers?: CmsUser[]
  careerTemplates?: CareerReplyTemplate[]
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
  },
  sections: [
    {
      id: 'hero',
      label: 'Banner Teks Hero',
      isVisible: true,
      order: 1,
      type: 'hero',
      badge: 'PT. EMPAT SINERGI UTAMA',
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
    }
  ],
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
  termsOfService: defaultTermsOfService
}

const defaultData: Database = {
  ...defaultDataContent,
  published: JSON.parse(JSON.stringify(defaultDataContent)),
  notifications: [],
  auditLogs: [],
  hasDraft: false,
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
      showcaseCard: heroSec.showcaseCard || content.hero?.showcaseCard || defaultHeroShowcase,
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
  }
}

async function _initializeSupabaseDB() {
  try {
    await supabase
      .from('site_content')
      .upsert({ id: 1, data: defaultData })
  } catch (e) {
    console.error('Gagal inisialisasi database Supabase:', e)
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
      slideDuration: parsed.setting?.slideDuration ?? parsed.published?.setting?.slideDuration ?? defaultData.setting.slideDuration
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
    scheduledContents: (parsed.scheduledContents as ScheduledContentItem[]) || (parsed.published?.scheduledContents as ScheduledContentItem[]) || [],
    cmsUsers: (parsed.cmsUsers as CmsUser[]) || [],
    careerTemplates: (parsed.careerTemplates && parsed.careerTemplates.length > 0) ? parsed.careerTemplates : defaultCareerTemplates,
    privacyPolicy: (parsed.privacyPolicy as LegalContent) || (parsed.published?.privacyPolicy as LegalContent) || defaultPrivacyPolicy,
    termsOfService: (parsed.termsOfService as LegalContent) || (parsed.published?.termsOfService as LegalContent) || defaultTermsOfService,
    published,
    notifications: parsed.notifications || [],
    auditLogs: parsed.auditLogs || [],
    hasDraft: typeof parsed.hasDraft === 'boolean' ? parsed.hasDraft : false,
  }

  const enriched = enrichContent(rawBase)
  return {
    ...rawBase,
    ...enriched,
    published: enrichContent(rawBase.published)
  }
}

export async function readDB(): Promise<Database> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 1)
      .single()

    if (!error && data && data.data) {
      return processParsedData(data.data as Partial<Database>)
    }
  } catch (err) {
    console.warn('Supabase tidak dapat dihubungi saat readDB, menggunakan data lokal:', err)
  }

  // Fallback: baca dari data/db.json jika ada
  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const localContent = await fs.readFile(path.join(process.cwd(), 'data/db.json'), 'utf-8')
    const parsed = JSON.parse(localContent)
    return processParsedData(parsed)
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
  let supabaseSuccess = false
  try {
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: 1, data })

    if (!error) {
      supabaseSuccess = true
    } else {
      console.warn('Gagal menulis ke Supabase:', error.message)
    }
  } catch (err) {
    console.warn('Supabase tidak dapat dihubungi saat writeDB:', err)
  }

  // Selalu cadangkan / fallback ke data/db.json secara lokal
  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(path.join(dataDir, 'db.json'), JSON.stringify(data, null, 2), 'utf-8')
  } catch (fileErr) {
    console.error('Gagal menyimpan ke data/db.json:', fileErr)
    if (!supabaseSuccess) {
      throw new Error('Gagal menyimpan data ke database cloud maupun lokal.')
    }
  }
}

export async function writeDB(data: Database) {
  const payload = {
    ...data,
    hasDraft: true
  }
  await writeSupabaseRaw(payload)
}

export async function deployDB(customUser?: { userName?: string; userEmail?: string; userRole?: string }) {
  const db = await readDB()
  db.published = {
    setting: JSON.parse(JSON.stringify(db.setting)),
    sections: JSON.parse(JSON.stringify(db.sections)),
    services: JSON.parse(JSON.stringify(db.services)),
    portfolios: JSON.parse(JSON.stringify(db.portfolios)),
    career: JSON.parse(JSON.stringify(db.career)),
    galleries: JSON.parse(JSON.stringify(db.galleries)),
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
  }
  db.published = enrichContent(db.published)
  db.hasDraft = false

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
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY' | 'CAREER',
  category: 'system' | 'career' = 'system',
  customUser?: { userName?: string; userEmail?: string; userRole?: string }
) {
  const db = await readDB()
  if (!db.notifications) db.notifications = []
  if (!db.auditLogs) db.auditLogs = []

  const logItem: AuditLogItem = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    message,
    timestamp: Date.now(),
    type,
    category,
    userName: customUser?.userName || 'Administrator',
    userEmail: customUser?.userEmail || 'admin',
    userRole: customUser?.userRole || 'Superadmin',
  }

  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type,
    category,
  })
  db.auditLogs.unshift(logItem)

  db.hasDraft = type !== 'DEPLOY'
}

export async function markNotificationsAsViewed() {
  const db = await readDB()
  const now = Date.now()
  if (db.notifications) {
    db.notifications = db.notifications.map(n => ({
      ...n,
      viewedAt: n.viewedAt || now
    }))
  }
  await writeSupabaseRaw(db)
}

export async function clearNotifications() {
  const db = await readDB()
  db.notifications = []
  await writeSupabaseRaw(db)
}

// ==================== UPLOAD FILE KE SUPABASE STORAGE DENGAN FALLBACK LOKAL ====================
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      })

    if (!error) {
      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)
      return publicUrlData.publicUrl
    }
    console.warn('Gagal upload ke Supabase Storage, beralih ke penyimpanan lokal:', error.message)
  } catch (err) {
    console.warn('Supabase Storage tidak dapat dihubungi (fetch failed), beralih ke penyimpanan lokal:', err)
  }

  // Fallback: Simpan file ke public/uploads/
  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(path.join(uploadsDir, fileName), buffer)
    return `/uploads/${fileName}`
  } catch (localErr) {
    console.error('Gagal upload ke penyimpanan lokal:', localErr)
    throw new Error('Gagal menyimpan file.')
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    await supabase.storage.from('uploads').remove([fileName])
  } catch {
    // Abaikan jika Supabase offline
  }

  try {
    const fs = (await import('fs')).promises
    const path = await import('path')
    const localPath = path.join(process.cwd(), 'public', 'uploads', fileName)
    await fs.unlink(localPath)
  } catch {
    // Abaikan jika file tidak ditemukan
  }
}