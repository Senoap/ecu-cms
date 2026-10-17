// lib/menus.ts
export const AVAILABLE_MENUS = [
  { id: 'global', label: 'Pengaturan Global', href: '/admin' },
  { id: 'hero', label: 'Hero Section', href: '/admin/hero' },
  { id: 'about', label: 'About Us', href: '/admin/about' },
  { id: 'services', label: 'Layanan', href: '/admin/services' },
  { id: 'portfolio', label: 'Portofolio', href: '/admin/portfolio' },
  { id: 'career', label: 'Karir & Lowongan', href: '/admin/career' },
  { id: 'gallery', label: 'Galeri', href: '/admin/gallery' },
  { id: 'footer', label: 'Kontak & Footer', href: '/admin/footer' },
  { id: 'legal', label: 'Kebijakan & Syarat Ketentuan', href: '/admin/legal' },
  { id: 'applications', label: 'Lamaran Masuk', href: '/admin/applications' },
  { id: 'career-templates', label: 'Template Balasan Karir', href: '/admin/career-templates' },
  { id: 'scheduled-content', label: 'Konten Harian & Bulanan', href: '/admin/scheduled-content' },
  { id: 'audit-log', label: 'Audit Log', href: '/admin/audit-log' },
  { id: 'users', label: 'Manajemen Pengguna & Role', href: '/admin/users' },
] as const

export const ALL_MENU_IDS = AVAILABLE_MENUS.map((m) => m.id)
