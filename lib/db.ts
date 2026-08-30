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
  email?: string
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

export interface NotificationItem {
  id: string
  message: string
  time: string
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY'
  viewedAt?: number
}

export interface AuditLogItem {
  id: string
  message: string
  timestamp: number
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY'
}

export interface HeroContent {
  badge: string
  titleLine1: string
  titleHighlight: string
  description: string
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

export interface FooterContent {
  description: string
  address: string
  phone: string
  whatsapp?: string
  email: string
}

export interface DatabaseContent {
  setting: {
    siteName: string
    tagline: string
    primaryColor: string
    accentColor: string
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
}

export interface Database extends DatabaseContent {
  published: DatabaseContent
  notifications: NotificationItem[]
  auditLogs: AuditLogItem[]
  hasDraft: boolean
}

const defaultDataContent: DatabaseContent = {
  setting: {
    siteName: 'PT. EMPAT SINERGI UTAMA',
    tagline: 'MANPOWER SERVICES',
    primaryColor: '#58111A',
    accentColor: '#D4AF37',
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
    },
    {
      id: 'about',
      label: 'About & Leadership',
      isVisible: true,
      order: 2,
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
      order: 3,
      type: 'services',
      subtitle: 'OUR CAPABILITIES',
      title: 'LAYANAN ALIH DAYA KAMI',
      content: '*Seluruh penempatan dikontrol sah melalui Perjanjian Kerja Waktu Tertentu (PKWT).',
    },
    {
      id: 'portfolio',
      label: 'Portofolio / Proyek',
      isVisible: true,
      order: 4,
      type: 'portfolio',
      subtitle: 'PROVEN TRACK RECORD',
      title: 'PROJECT PORTFOLIO',
      content: 'Serta dipercaya mendukung pengerjaan proyek harian entitas swasta nasional.',
    },
    {
      id: 'career',
      label: 'Lowongan Kerja (Career)',
      isVisible: true,
      order: 5,
      type: 'career',
      subtitle: 'JOIN OUR TEAM',
      title: 'CAREER OPPORTUNITIES',
      content: 'Mari bergabung dan berkembang bersama korporat profesional kami.',
    },
    {
      id: 'gallery',
      label: 'Galeri & Dokumentasi',
      isVisible: true,
      order: 6,
      type: 'gallery',
      subtitle: 'OUR MOMENTS',
      title: 'GALERI DOKUMENTASI',
      content: 'Dokumentasi kegiatan operasional, fasilitas, dan proyek perusahaan.',
    },
    {
      id: 'contact',
      label: 'Footer & Kontak',
      isVisible: true,
      order: 7,
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
  footer: { description: '', address: '', phone: '', email: '' }
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
      email: contactSec.email || '',
    },
  }
}

async function initializeSupabaseDB() {
  try {
    await supabase
      .from('site_content')
      .upsert({ id: 1, data: defaultData })
  } catch (e) {
    console.error('Gagal inisialisasi database Supabase:', e)
  }
}

function processParsedData(parsed: any): Database {
  let sections = parsed.sections || parsed.published?.sections || defaultData.sections
  if (!sections.some((s: any) => s.id === 'career')) {
    const careerDefault = defaultDataContent.sections.find(s => s.id === 'career')
    if (careerDefault) sections.push(careerDefault)
  }
  if (!sections.some((s: any) => s.id === 'gallery')) {
    const galleryDefault = defaultDataContent.sections.find(s => s.id === 'gallery')
    if (galleryDefault) sections.push(galleryDefault)
  }
  sections.sort((a: any, b: any) => a.order - b.order)

  let published = parsed.published || JSON.parse(JSON.stringify(defaultDataContent))
  if (!published.career) published.career = defaultDataContent.career
  if (!published.galleries) published.galleries = defaultDataContent.galleries
  if (!published.careerHeader) published.careerHeader = defaultDataContent.careerHeader
  if (!published.galleryHeader) published.galleryHeader = defaultDataContent.galleryHeader
  if (!published.sections || !published.sections.some((s: any) => s.id === 'gallery')) {
    const gallerySec = defaultDataContent.sections.find(s => s.id === 'gallery')
    if (gallerySec) published.sections.push(gallerySec)
  }

  const rawBase = {
    ...defaultData,
    ...parsed,
    setting: {
      ...defaultData.setting,
      ...(parsed.setting || parsed.published?.setting),
      slideDuration: parsed.setting?.slideDuration ?? parsed.published?.setting?.slideDuration ?? defaultData.setting.slideDuration
    },
    sections,
    services: (parsed.services || parsed.published?.services || defaultData.services).map((s: any) => ({
      ...s,
      icon: s.icon || 'Briefcase',
      content: s.content || s.desc,
      images: s.images || []
    })),
    portfolios: parsed.portfolios || parsed.published?.portfolios || defaultData.portfolios,
    career: parsed.career || parsed.published?.career || defaultData.career,
    galleries: parsed.galleries || parsed.published?.galleries || defaultData.galleries,
    published,
    notifications: parsed.notifications || [],
    auditLogs: parsed.auditLogs || [],
    hasDraft: parsed.hasDraft ?? false,
  }

  return {
    ...rawBase,
    ...enrichContent(rawBase),
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

    if (error || !data || !data.data) {
      await initializeSupabaseDB()
      return defaultData
    }

    return processParsedData(data.data)
  } catch (err) {
    console.error('Error readDB Supabase:', err)
    return defaultData
  }
}

export async function readPublishedDB(): Promise<DatabaseContent> {
  const db = await readDB()
  return db.published || enrichContent({
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
    footer: defaultDataContent.footer
  })
}

async function writeSupabaseRaw(data: Database) {
  try {
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: 1, data })

    if (error) {
      console.error('Gagal menulis ke Supabase:', error.message)
      throw new Error(error.message)
    }
  } catch (err) {
    console.error('Error writeSupabaseRaw:', err)
    throw err
  }
}

export async function writeDB(data: Database) {
  const payload = {
    ...data,
    hasDraft: true
  }
  await writeSupabaseRaw(payload)
}

export async function deployDB() {
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
    footer: JSON.parse(JSON.stringify(db.footer))
  }
  db.published = enrichContent(db.published)
  db.hasDraft = false

  if (!db.notifications) db.notifications = []
  if (!db.auditLogs) db.auditLogs = []

  const logItem = {
    id: 'log-' + Date.now(),
    message: 'Semua perubahan draft berhasil di-deploy ke halaman utama.',
    timestamp: Date.now(),
    type: 'DEPLOY' as const,
  }

  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    message: logItem.message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type: 'DEPLOY',
  })
  db.auditLogs.unshift(logItem)

  await writeSupabaseRaw(db)
}

export async function addNotification(message: string, type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY') {
  const db = await readDB()
  if (!db.notifications) db.notifications = []
  if (!db.auditLogs) db.auditLogs = []

  const logItem = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    message,
    timestamp: Date.now(),
    type,
  }

  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    message,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    type,
  })
  db.auditLogs.unshift(logItem)

  db.hasDraft = type !== 'DEPLOY'
  await writeSupabaseRaw(db)
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

// ==================== UPLOAD FILE KE SUPABASE STORAGE ====================
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const { error } = await supabase.storage
    .from('uploads')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('Gagal upload ke Supabase Storage:', error.message)
    throw new Error(error.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

export async function deleteFile(fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('uploads')
      .remove([fileName])

    if (error) {
      console.error('Gagal menghapus file dari Supabase Storage:', error.message)
    }
  } catch (e) {
    console.error('Error deleteFile:', e)
  }
}