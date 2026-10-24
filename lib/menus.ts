// lib/menus.ts
export const AVAILABLE_MENUS = [
  { id: 'global', label: 'Pengaturan Global', href: '/cms' },
  { id: 'hero', label: 'Hero Section', href: '/cms/hero' },
  { id: 'about', label: 'About Us & Pimpinan', href: '/cms/about' },
  { id: 'certifications', label: 'Sertifikasi Perusahaan', href: '/cms/certifications' },
  { id: 'services', label: 'Layanan', href: '/cms/services' },
  { id: 'portfolio', label: 'Portofolio', href: '/cms/portfolio' },
  { id: 'career', label: 'Karir & Lowongan', href: '/cms/career' },
  { id: 'gallery', label: 'Galeri', href: '/cms/gallery' },
  { id: 'footer', label: 'Kontak & Footer', href: '/cms/footer' },
  { id: 'legal', label: 'Kebijakan & Syarat Ketentuan', href: '/cms/legal' },
  { id: 'applications', label: 'Lamaran Masuk', href: '/cms/applications' },
  { id: 'career-templates', label: 'Template Balasan Karir', href: '/cms/career-templates' },
  { id: 'compro-requests', label: 'Permintaan Compro PDF', href: '/cms/compro-requests' },
  { id: 'scheduled-content', label: 'Konten Harian & Bulanan', href: '/cms/scheduled-content' },
  { id: 'audit-log', label: 'Audit Log', href: '/cms/audit-log' },
  { id: 'users', label: 'Manajemen Pengguna & Role', href: '/cms/users' },
] as const

export const ALL_MENU_IDS = AVAILABLE_MENUS.map((m) => m.id)
