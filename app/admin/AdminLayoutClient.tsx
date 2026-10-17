// app/admin/AdminLayoutClient.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAdmin } from '@/app/login/actions'
import {
  Rocket,
  Bell,
  Menu,
  Settings,
  Inbox,
  FileText,
  LogOut,
  Sun,
  Moon,
  Layout,
  Users,
  Briefcase,
  FolderKanban,
  UserCheck,
  Image as ImageIcon,
  PhoneCall,
  ArrowRight,
  LucideIcon,
  Calendar,
  MessageSquare,
  Shield,
  ChevronDown,
  Layers
} from 'lucide-react'
import type { CurrentAdminUser } from '@/lib/auth'

interface SectionConfig {
  id: string
  label: string
  isVisible: boolean
  order: number
  type?: string
}

interface NotificationItem {
  id: string
  message: string
  time: string
  type: string
  category?: string
  viewedAt?: number
}

interface AdminLayoutClientProps {
  children: React.ReactNode
  currentUser?: CurrentAdminUser
  sections: SectionConfig[]
  notifications: NotificationItem[]
  hasDraft: boolean
  logoUrl?: string
  deployAction: () => Promise<void>
  clearNotificationsAction?: () => Promise<void>
  markAsViewedAction?: () => Promise<void>
}

export default function AdminLayoutClient({ 
  children, 
  currentUser,
  sections, 
  notifications, 
  hasDraft, 
  logoUrl, 
  deployAction,
  clearNotificationsAction,
  markAsViewedAction
}: AdminLayoutClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // State Submenus (terbuka / tertutup)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => ({
    website: ['/admin/hero', '/admin/scheduled-content', '/admin/about', '/admin/services', '/admin/portfolio', '/admin/gallery', '/admin/footer', '/admin/legal'].some((p) => pathname?.startsWith(p)),
    career: ['/admin/career', '/admin/applications', '/admin/career-templates'].some((p) => pathname?.startsWith(p)),
    system: ['/admin/users', '/admin/audit-log'].some((p) => pathname?.startsWith(p)),
  }))

  // Buka otomatis submenu yang rutenya sedang aktif saat halaman berpindah
  useEffect(() => {
    queueMicrotask(() => {
      if (['/admin/hero', '/admin/scheduled-content', '/admin/about', '/admin/services', '/admin/portfolio', '/admin/gallery', '/admin/footer', '/admin/legal'].some((p) => pathname?.startsWith(p))) {
        setOpenSubmenus((prev) => ({ ...prev, website: true }))
      } else if (['/admin/career', '/admin/applications', '/admin/career-templates'].some((p) => pathname?.startsWith(p))) {
        setOpenSubmenus((prev) => ({ ...prev, career: true }))
      } else if (['/admin/users', '/admin/audit-log'].some((p) => pathname?.startsWith(p))) {
        setOpenSubmenus((prev) => ({ ...prev, system: true }))
      }
    })
  }, [pathname])

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Filter notifikasi karir sesuai izin pengguna (Point 3)
  const isCareerNotif = (n: NotificationItem) =>
    n.category === 'career' ||
    n.type === 'CAREER' ||
    n.message.toLowerCase().includes('lamaran') ||
    n.message.toLowerCase().includes('lowongan')

  const visibleNotifications = notifications.filter((n) => {
    if (isCareerNotif(n)) {
      return currentUser?.canReceiveCareerNotif ?? true
    }
    return true
  })

  // Hitung hanya notifikasi yang belum dilihat untuk badge angka
  const unreadCount = visibleNotifications.filter(n => !n.viewedAt).length

  useEffect(() => {
    const savedTheme = localStorage.getItem('esu_cms_theme')
    const dark = savedTheme !== null ? savedTheme === 'dark' : true
    queueMicrotask(() => {
      setIsDarkMode(dark)
    })
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // TIMER 5 MENIT UNTUK PENGHAPUSAN OTOMATIS SETELAH DIBUKA
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showNotifPanel && visibleNotifications.length > 0 && clearNotificationsAction) {
      timer = setTimeout(() => {
        startTransition(async () => {
          if (clearNotificationsAction) {
            await clearNotificationsAction()
          }
        })
      }, 5 * 60 * 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showNotifPanel, visibleNotifications.length, clearNotificationsAction])

  // EVENT LISTENER: Kunci ESC & Klik di luar area notifikasi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifPanel(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const container = document.getElementById('notif-container')
      if (container && !container.contains(e.target as Node)) {
        setShowNotifPanel(false)
      }
    }

    if (showNotifPanel) {
      window.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifPanel])

  const toggleTheme = () => {
    const nextMode = !isDarkMode
    setIsDarkMode(nextMode)
    localStorage.setItem('esu_cms_theme', nextMode ? 'dark' : 'light')
    if (nextMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleDeploy = () => {
    startTransition(async () => {
      await deployAction()
      setShowNotifPanel(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 4000)
    })
  }

  const handleToggleNotif = () => {
    const nextState = !showNotifPanel
    setShowNotifPanel(nextState)

    if (nextState && unreadCount > 0 && markAsViewedAction) {
      startTransition(async () => {
        await markAsViewedAction()
      })
    }
  }

  const handleLogout = async () => {
    await logoutAdmin()
    localStorage.removeItem('esu_admin_logged')
    router.push('/admin/login')
    router.refresh()
  }

  const canAccess = (menuId: string): boolean => {
    if (!currentUser || currentUser.isSuperadmin) return true
    return currentUser.permissions.includes(menuId)
  }

  const getSectionLabel = (id: string, defaultLabel: string) => {
    const found = sections.find((s) => s.id === id)
    return found?.label || defaultLabel
  }

  // 1. Group Halaman Website
  const websiteItems = [
    { id: 'hero', label: getSectionLabel('hero', 'Hero Section'), href: '/admin/hero', icon: Layout },
    { id: 'scheduled-content', label: getSectionLabel('scheduled-content', 'Konten Harian & Bulanan'), href: '/admin/scheduled-content', icon: Calendar },
    { id: 'about', label: getSectionLabel('about', 'Tentang Kami'), href: '/admin/about', icon: Users },
    { id: 'services', label: getSectionLabel('services', 'Layanan'), href: '/admin/services', icon: Briefcase },
    { id: 'portfolio', label: getSectionLabel('portfolio', 'Portofolio'), href: '/admin/portfolio', icon: FolderKanban },
    { id: 'gallery', label: getSectionLabel('gallery', 'Galeri Foto'), href: '/admin/gallery', icon: ImageIcon },
    { id: 'footer', label: getSectionLabel('contact', 'Kontak & Footer'), href: '/admin/footer', icon: PhoneCall },
    { id: 'legal', label: 'Kebijakan & Ketentuan', href: '/admin/legal', icon: FileText },
  ].filter((item) => canAccess(item.id))

  // 2. Group Karir & Rekrutmen
  const careerItems = [
    { id: 'career', label: getSectionLabel('career', 'Lowongan Karir'), href: '/admin/career', icon: UserCheck },
    { id: 'applications', label: 'Lamaran Masuk', href: '/admin/applications', icon: Inbox },
    { id: 'career-templates', label: 'Template Balasan', href: '/admin/career-templates', icon: MessageSquare },
  ].filter((item) => {
    if (item.id === 'career-templates') return canAccess('career-templates') || canAccess('career')
    return canAccess(item.id)
  })

  // 4. Group Sistem & Hak Akses
  const systemItems = [
    { id: 'users', label: 'Manajemen Pengguna & Role', href: '/admin/users', icon: Shield },
    { id: 'audit-log', label: 'Audit Log Aktivitas', href: '/admin/audit-log', icon: FileText },
  ].filter((item) => canAccess(item.id))

  return (
    <div className={`h-screen w-screen overflow-hidden flex font-sans transition-colors duration-300 relative ${
      isDarkMode ? 'dark bg-[#090A0F] text-gray-100' : 'bg-[#F4F6F9] text-gray-900'
    }`}>
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-emerald-950/95 text-emerald-300 border border-emerald-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Rocket className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Deployment Berhasil!</h4>
            <p className="text-[11px] text-emerald-400/80 font-medium">Semua draft perubahan telah diterbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* KONTTAINER NOTIFIKASI DI KANAN ATAS */}
      <div id="notif-container" className="fixed top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleToggleNotif}
          className={`relative w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            isDarkMode 
              ? 'bg-gray-900/90 text-amber-400 border-gray-700 shadow-amber-900/40 hover:bg-gray-800' 
              : 'bg-white/90 text-amber-700 border-gray-200 shadow-xl hover:bg-gray-50'
          }`}
          title="Log Notifikasi Perubahan"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-gray-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* PANEL DROPDOWN NOTIFIKASI */}
        {showNotifPanel && (
          <div className={`absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-3xl shadow-2xl border backdrop-blur-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 ${
            isDarkMode ? 'bg-gray-950/95 border-gray-800 text-gray-200' : 'bg-white/95 border-gray-200 text-gray-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? 'border-gray-800/60' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Log Perubahan & CRUD</h3>
              </div>
              <span className="text-[10px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Aktif (Batas 5 Mnt)
              </span>
            </div>

            <div className="space-y-2.5">
              {visibleNotifications.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6 font-medium">Tidak ada notifikasi aktif.</p>
              ) : (
                visibleNotifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-800/80' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      <span className="text-amber-500 font-extrabold">{n.type}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className={`font-medium leading-relaxed ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR PANEL */}
      <aside className={`h-screen border-r flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-transparent'
      } ${isDarkMode ? 'bg-[#0E1017] border-gray-800/80' : 'bg-white border-gray-200'}`}>
        
        <div className={`w-80 h-screen p-5 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          
          {/* HEADER SIDEBAR (LOGO, JUDUL & PROFIL USER) */}
          <div className="flex-shrink-0 space-y-3 pb-2">
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-amber-900/20 overflow-hidden p-1 flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="CMS Logo" className="w-full h-full object-contain bg-white rounded-lg p-0.5" />
                  ) : (
                    'ESU'
                  )}
                </div>
                <div>
                  <h2 className={`text-sm font-black tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CMS Panel</h2>
                  <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Enterprise Control</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-900 text-amber-400 border-gray-800 hover:bg-gray-800' 
                    : 'bg-gray-100 text-amber-700 border-gray-200 hover:bg-gray-200'
                }`}
                title="Tutup Panel"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* PROFIL PENGGUNA YANG LOGIN */}
            {currentUser && (
              <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {currentUser.role}
                  </div>
                </div>
                {currentUser.isSuperadmin && (
                  <span className="text-[8px] bg-amber-500 text-gray-950 font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                    Master
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KONTEN MENU DENGAN SUBMENU (SCROLLABLE & TIDAK MENUMPUK) */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-2 pr-1">
            
            {/* PENGATURAN GLOBAL (DASHBOARD) */}
            {canAccess('global') && (
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Navigasi Utama
                </div>
                <Link 
                  href="/admin" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs font-bold uppercase tracking-wide ${
                    pathname === '/admin'
                      ? isDarkMode 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black shadow-sm' 
                        : 'bg-amber-100/90 text-amber-950 border-amber-400/80 font-black shadow-sm'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-transform ${
                    pathname === '/admin' ? 'text-amber-500' : 'text-gray-400'
                  }`} />
                  <span>Pengaturan Global</span>
                </Link>
              </div>
            )}

            {/* DAFTAR SUBMENU KATEGORI */}
            <div className="space-y-1.5 pt-1">
              <div className="px-2.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Kategori & Submenu
              </div>

              {/* 1. SUBMENU: HALAMAN WEBSITE */}
              {websiteItems.length > 0 && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu('website')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs font-black uppercase tracking-wider cursor-pointer ${
                      websiteItems.some((i) => pathname?.startsWith(i.href))
                        ? isDarkMode
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>Halaman Website</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                        isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {websiteItems.length}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        openSubmenus.website ? 'rotate-180 text-amber-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenus.website ? 'max-h-96 opacity-100 pt-0.5 pb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 dark:border-gray-800/80 space-y-1">
                      {websiteItems.map((item) => {
                        const isItemActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                              isItemActive
                                ? isDarkMode
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black shadow-sm'
                                  : 'bg-amber-100/90 text-amber-950 border-amber-400/80 font-black shadow-sm'
                                : isDarkMode
                                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 border-transparent'
                                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100 border-transparent'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isItemActive ? 'text-amber-500' : 'text-gray-400'
                            }`} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SUBMENU: KARIR & REKRUTMEN */}
              {careerItems.length > 0 && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu('career')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs font-black uppercase tracking-wider cursor-pointer ${
                      careerItems.some((i) => pathname?.startsWith(i.href))
                        ? isDarkMode
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-amber-500" />
                      <span>Karir & Rekrutmen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-amber-500 text-gray-950">
                          {unreadCount}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        openSubmenus.career ? 'rotate-180 text-amber-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenus.career ? 'max-h-96 opacity-100 pt-0.5 pb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 dark:border-gray-800/80 space-y-1">
                      {careerItems.map((item) => {
                        const isItemActive = pathname === item.href || pathname?.startsWith(item.href)
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                              isItemActive
                                ? isDarkMode
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black shadow-sm'
                                  : 'bg-amber-100/90 text-amber-950 border-amber-400/80 font-black shadow-sm'
                                : isDarkMode
                                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 border-transparent'
                                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                                isItemActive ? 'text-amber-500' : 'text-gray-400'
                              }`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.id === 'applications' && unreadCount > 0 && (
                              <span className="text-[10px] bg-amber-500 text-gray-950 font-black px-1.5 py-0.2 rounded-full shrink-0">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SUBMENU: SISTEM & HAK AKSES */}
              {systemItems.length > 0 && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu('system')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs font-black uppercase tracking-wider cursor-pointer ${
                      systemItems.some((i) => pathname?.startsWith(i.href))
                        ? isDarkMode
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Sistem & Akses</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      openSubmenus.system ? 'rotate-180 text-amber-500' : 'text-gray-400'
                    }`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenus.system ? 'max-h-96 opacity-100 pt-0.5 pb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 dark:border-gray-800/80 space-y-1">
                      {systemItems.map((item) => {
                        const isItemActive = pathname === item.href || pathname?.startsWith(item.href)
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                              isItemActive
                                ? isDarkMode
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black shadow-sm'
                                  : 'bg-amber-100/90 text-amber-950 border-amber-400/80 font-black shadow-sm'
                                : isDarkMode
                                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 border-transparent'
                                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100 border-transparent'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isItemActive ? 'text-amber-500' : 'text-gray-400'
                            }`} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER ACTIONS (DITAMBATKAN DI BAGIAN BAWAH) */}
          <div className={`flex-shrink-0 pt-3 border-t space-y-2.5 ${isDarkMode ? 'border-gray-800/80' : 'border-gray-200'}`}>
            <Link 
              href="/" 
              target="_blank"
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border shadow-sm ${
                isDarkMode 
                  ? 'bg-gray-900 hover:bg-gray-800 text-gray-200 hover:text-white border-gray-800' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-950 border-gray-200'
              }`}
            >
              <span>Lihat Website Utama</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`w-full py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer ${
                isDarkMode 
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-900/50' 
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>

            <div className="text-center pt-1 space-y-0.5">
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">ESU Engine v2.6</div>
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                Developed by{' '}
                <span className="text-amber-600 dark:text-amber-400 font-black tracking-wider uppercase select-none">
                  lembahtech
                </span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* TOMBOL GARIS 3 MELAYANG KETIKA PANEL DITUTUP */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-6 left-6 z-50 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            isDarkMode 
              ? 'bg-gray-900/90 text-amber-400 border-gray-700 shadow-amber-900/40 hover:bg-gray-800' 
              : 'bg-white/90 text-amber-700 border-gray-200 shadow-xl hover:bg-gray-50'
          }`}
          title="Buka Panel"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* KONTEN UTAMA */}
      <main className={`flex-1 h-screen p-6 md:p-12 overflow-y-auto relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#090A0F]' : 'bg-[#F4F6F9]'
      }`}>
        <div className="max-w-4xl mx-auto relative z-10 pb-32 pt-10">
          {children}
        </div>
      </main>

      {/* TOMBOL KONTROL MELAYANG DI POJOK KANAN BAWAH */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* TOMBOL DEPLOY MELAYANG */}
        <button
          type="button"
          onClick={handleDeploy}
          disabled={!hasDraft || isPending}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            !hasDraft || isPending
              ? isDarkMode 
                ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50 shadow-none' 
                : 'bg-gray-200/50 text-gray-400 border-gray-300/40 cursor-not-allowed opacity-50 shadow-none'
              : 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white border-amber-400/40 shadow-amber-900/50 cursor-pointer animate-pulse'
          }`}
          title={hasDraft ? 'Terbitkan draft perubahan ke website' : 'Belum ada perubahan baru (Draft kosong)'}
        >
          {isPending ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Rocket className="w-5 h-5 text-white" />
          )}
        </button>

        {/* TOMBOL DARK/LIGHT MODE MELAYANG */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            isDarkMode 
              ? 'bg-gray-900/90 text-amber-400 border-gray-700 shadow-amber-900/40 hover:bg-gray-800' 
              : 'bg-white/90 text-amber-700 border-gray-200 shadow-xl hover:bg-gray-50'
          }`}
          title={isDarkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Malam'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-600" />}
        </button>
      </div>
    </div>
  )
}