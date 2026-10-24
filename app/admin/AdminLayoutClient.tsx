// app/admin/AdminLayoutClient.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAdmin, heartbeatAdminSession } from '@/app/login/actions'
import {
  UploadCloud,
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
  Calendar,
  MessageSquare,
  Shield,
  ChevronDown,
  Layers,
  Award,
  FileDown,
  Lock,
  Smartphone,
  Download,
  Share,
  CheckCircle2,
  X
} from 'lucide-react'
import type { CurrentAdminUser } from '@/lib/auth'
import type { CmsDraftLock } from '@/lib/db'
import { useSmartViewport } from '@/components/SmartViewportProvider'

const WEBSITE_PATHS = ['/cms/hero', '/cms/scheduled-content', '/cms/about', '/cms/services', '/cms/portfolio', '/cms/gallery', '/cms/certifications', '/cms/compro-requests', '/cms/footer', '/cms/legal', '/admin/hero', '/admin/scheduled-content', '/admin/about', '/admin/services', '/admin/portfolio', '/admin/gallery', '/admin/certifications', '/admin/compro-requests', '/admin/footer', '/admin/legal']

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
  draftLock?: CmsDraftLock
  isLockedByOther?: boolean
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
  draftLock,
  isLockedByOther = false,
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
  const { isCompactViewport, isShortViewport, isSplitScreen } = useSmartViewport()

  // Otomatis lipat sidebar saat layar sempit atau dibagi multi-window (2 atau 4 jendela)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth < 1024 || isCompactViewport || isSplitScreen) {
      queueMicrotask(() => {
        setIsSidebarOpen(false)
      })
    }
  }, [isCompactViewport, isSplitScreen])

  // Sesi tunggal & heartbeat berkala (Point 7)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await heartbeatAdminSession()
        if (res && !res.valid && res.message) {
          alert(res.message)
          router.push('/login')
        }
      } catch (err) {
        console.warn('Heartbeat check error:', err)
      }
    }, 15 * 1000)
    return () => clearInterval(interval)
  }, [router])

  // PWA (Progressive Web App) States (Point 4)
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isSafariDesktop, setIsSafariDesktop] = useState(false)
  const [showIosInstallModal, setShowIosInstallModal] = useState(false)
  const [showInstalledToast, setShowInstalledToast] = useState(false)

  // Inisialisasi Service Worker, Deteksi PWA & Device khusus CMS Admin
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    const isAppleMobile = /iphone|ipad|ipod/.test(ua)
    const isIPadOS = ua.includes('macintosh') && Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
    const iosDevice = isAppleMobile || isIPadOS
    const macSafari = ua.includes('macintosh') && !isIPadOS && ua.includes('safari') && !/chrome|crios|edg|opr|firefox/.test(ua)

    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://')
      )
    }

    const winWithPrompt = window as unknown as { __deferredPwaPrompt?: BeforeInstallPromptEvent | null }

    queueMicrotask(() => {
      setIsIos(iosDevice)
      setIsSafariDesktop(macSafari)
      setIsStandalone(checkStandalone())
      if (winWithPrompt.__deferredPwaPrompt) {
        setDeferredPrompt(winWithPrompt.__deferredPwaPrompt)
      }
    })

    // 1. Daftarkan Service Worker pada scope '/' agar mendukung baik subdomain penuh (cms.4sinergiutama.co.id) maupun path /cms
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/admin-sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service Worker terdaftar pada scope:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker gagal mendaftar:', err)
        })
    }

    // 2. Pantau perubahan display-mode jika pengguna menginstal PWA saat sesi aktif
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches)
    }
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    // 3. Tangkap event prompt instalasi otomatis untuk browser Chromium (Windows, Android, macOS Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      winWithPrompt.__deferredPwaPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleGlobalPromptReady = () => {
      if (winWithPrompt.__deferredPwaPrompt) {
        setDeferredPrompt(winWithPrompt.__deferredPwaPrompt)
      }
    }

    const handleAppInstalled = () => {
      winWithPrompt.__deferredPwaPrompt = null
      setDeferredPrompt(null)
      setIsStandalone(true)
      setShowInstalledToast(true)
      setTimeout(() => setShowInstalledToast(false), 3500)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('esu-pwa-prompt-ready', handleGlobalPromptReady)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('esu-pwa-prompt-ready', handleGlobalPromptReady)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallPwa = async () => {
    if (isStandalone) {
      setShowInstalledToast(true)
      setTimeout(() => setShowInstalledToast(false), 3000)
      return
    }

    const winWithPrompt = window as unknown as { __deferredPwaPrompt?: BeforeInstallPromptEvent | null }
    const activePrompt = deferredPrompt || winWithPrompt.__deferredPwaPrompt

    if (activePrompt) {
      try {
        await activePrompt.prompt()
        const choice = await activePrompt.userChoice
        if (choice.outcome === 'accepted') {
          winWithPrompt.__deferredPwaPrompt = null
          setDeferredPrompt(null)
          setIsStandalone(true)
        }
      } catch (err) {
        console.warn('Install prompt error:', err)
      }
      return
    }

    // Hanya tampilkan modal khusus untuk iOS (iPhone/iPad) atau Safari macOS karena Apple memblokir API beforeinstallprompt
    if (isIos || isSafariDesktop) {
      setShowIosInstallModal(true)
    } else {
      // Pada Windows / Android / macOS Chromium jika aplikasi sudah terpasang di browser
      setShowInstalledToast(true)
      setTimeout(() => setShowInstalledToast(false), 3000)
    }
  }

  // State Submenus (terbuka / tertutup)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => ({
    website: WEBSITE_PATHS.some((p) => pathname?.startsWith(p)),
    career: ['/cms/career', '/cms/applications', '/cms/career-templates', '/admin/career', '/admin/applications', '/admin/career-templates'].some((p) => pathname?.startsWith(p)),
    system: ['/cms/users', '/cms/audit-log', '/admin/users', '/admin/audit-log'].some((p) => pathname?.startsWith(p)),
  }))

  // Buka otomatis submenu yang rutenya sedang aktif & auto-close sidebar pada mobile saat rute berganti
  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
      if (WEBSITE_PATHS.some((p) => pathname?.startsWith(p))) {
        setOpenSubmenus((prev) => ({ ...prev, website: true }))
      } else if (['/cms/career', '/cms/applications', '/cms/career-templates', '/admin/career', '/admin/applications', '/admin/career-templates'].some((p) => pathname?.startsWith(p))) {
        setOpenSubmenus((prev) => ({ ...prev, career: true }))
      } else if (['/cms/users', '/cms/audit-log', '/admin/users', '/admin/audit-log'].some((p) => pathname?.startsWith(p))) {
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

  // Handler navigasi ke website publik saat panel CMS dibuka dari subdomain CMS
  const handleOpenMainSite = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined') {
      const { hostname, host, protocol } = window.location
      if (/^(cms-4su|cms|admin)[.-]/i.test(hostname)) {
        e.preventDefault()
        const mainHost = host.replace(/^(cms-4su|cms|admin)[.-]/i, '')
        window.open(`${protocol}//${mainHost}/`, '_blank', 'noopener,noreferrer')
      }
    }
  }

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
    try {
      if (typeof window !== 'undefined') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ action: 'LOGOUT' })
        }
        if ('caches' in window) {
          await caches.delete('4su-admin-pwa-v1')
        }
        localStorage.removeItem('esu_admin_logged')
      }
    } catch {}
    await logoutAdmin()
    router.push('/login')
    router.refresh()
  }

  const canAccess = (menuId: string): boolean => {
    if (!currentUser) return false
    if (currentUser.isSuperadmin || currentUser.id === 'superadmin') {
      return menuId === 'users'
    }
    if (currentUser.isRootAdmin) return true
    return currentUser.permissions.includes(menuId)
  }

  const getSectionLabel = (id: string, defaultLabel: string) => {
    const found = sections.find((s) => s.id === id)
    return found?.label || defaultLabel
  }

  // 1. Group Halaman Website
  const websiteItems = [
    { id: 'hero', label: getSectionLabel('hero', 'Hero Section'), href: '/cms/hero', icon: Layout },
    { id: 'scheduled-content', label: getSectionLabel('scheduled-content', 'Konten Harian & Bulanan'), href: '/cms/scheduled-content', icon: Calendar },
    { id: 'about', label: getSectionLabel('about', 'Tentang Kami'), href: '/cms/about', icon: Users },
    { id: 'services', label: getSectionLabel('services', 'Layanan'), href: '/cms/services', icon: Briefcase },
    { id: 'portfolio', label: getSectionLabel('portfolio', 'Portofolio'), href: '/cms/portfolio', icon: FolderKanban },
    { id: 'gallery', label: getSectionLabel('gallery', 'Galeri Foto'), href: '/cms/gallery', icon: ImageIcon },
    { id: 'certifications', label: 'Sertifikasi Perusahaan', href: '/cms/certifications', icon: Award },
    { id: 'compro-requests', label: 'Permintaan Compro PDF', href: '/cms/compro-requests', icon: FileDown },
    { id: 'footer', label: getSectionLabel('contact', 'Kontak & Footer'), href: '/cms/footer', icon: PhoneCall },
    { id: 'legal', label: 'Kebijakan & Ketentuan', href: '/cms/legal', icon: FileText },
  ].filter((item) => canAccess(item.id))

  // 2. Group Karir & Rekrutmen
  const careerItems = [
    { id: 'career', label: getSectionLabel('career', 'Lowongan Karir'), href: '/cms/career', icon: UserCheck },
    { id: 'applications', label: 'Lamaran Masuk', href: '/cms/applications', icon: Inbox },
    { id: 'career-templates', label: 'Template Balasan', href: '/cms/career-templates', icon: MessageSquare },
  ].filter((item) => {
    if (item.id === 'career-templates') return canAccess('career-templates') || canAccess('career')
    return canAccess(item.id)
  })

  // 4. Group Sistem & Hak Akses
  const systemItems = [
    { id: 'users', label: 'Manajemen Pengguna & Role', href: '/cms/users', icon: Shield },
    { id: 'audit-log', label: 'Audit Log Aktivitas', href: '/cms/audit-log', icon: FileText },
  ].filter((item) => canAccess(item.id))

  return (
    <div 
      translate="no" 
      data-admin-scope="true"
      className={`notranslate h-screen h-[100dvh] w-full max-w-full overflow-hidden flex font-sans transition-colors duration-300 relative ${
      isDarkMode ? 'dark bg-[#0C0D12] text-zinc-100' : 'bg-[#F4F6F9] text-gray-900'
    }`}>
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-[#12151D] text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <UploadCloud className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Deployment Berhasil!</h4>
            <p className="text-[11px] text-emerald-400/80 font-medium">Semua draft perubahan telah diterbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* MOBILE & MULTI-WINDOW BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer ${
            isCompactViewport || isSplitScreen ? 'block' : 'lg:hidden'
          }`}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside className={`h-screen h-[100dvh] border-r flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden z-50 ${
        isCompactViewport || isSplitScreen ? 'fixed' : 'fixed lg:relative'
      } ${
        isSidebarOpen ? 'w-72 sm:w-80 opacity-100 shadow-2xl lg:shadow-none' : 'w-0 opacity-0 border-transparent pointer-events-none'
      } ${isDarkMode ? 'bg-[#12141C] border-[#1E222D]' : 'bg-white border-gray-200'}`}>
        
        <div 
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
          }}
          className={`w-72 sm:w-80 h-full px-4 sm:px-5 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          
          {/* HEADER SIDEBAR (LOGO, JUDUL & PROFIL USER) */}
          <div className="flex-shrink-0 space-y-3 pb-2">
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6B0808] flex items-center justify-center text-white font-black text-sm shadow-sm overflow-hidden p-1 flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="CMS Logo" className="w-full h-full object-contain bg-white rounded-lg p-0.5" />
                  ) : (
                    '4SU'
                  )}
                </div>
                <div>
                  <h2 className={`text-sm font-bold tracking-wider uppercase ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>Halaman CMS</h2>
                  <p className="text-[10px] text-[#A12323] dark:text-[#E05252] font-semibold tracking-wider uppercase">Enterprise Control</p>
                </div>
              </div>
            </div>

            {/* PROFIL PENGGUNA YANG LOGIN */}
            {currentUser && (
              <div className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'border-[#222736] bg-[#181B26]' : 'border-gray-200 bg-gray-50'}`}>
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-gray-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#A12323] dark:text-[#E05252] font-semibold">
                    {currentUser.role}
                  </div>
                </div>
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
                  href="/cms" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 border text-xs font-bold uppercase tracking-wide ${
                    pathname === '/cms' || pathname === '/admin'
                      ? isDarkMode 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black shadow-sm' 
                        : 'bg-amber-100/90 text-amber-950 border-amber-400/80 font-black shadow-sm'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-transform ${
                    pathname === '/cms' || pathname === '/admin' ? 'text-amber-500' : 'text-gray-400'
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
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      openSubmenus.website ? 'rotate-180 text-amber-500' : 'text-gray-400'
                    }`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenus.website ? 'max-h-96 opacity-100 pt-0.5 pb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 dark:border-gray-800/80 space-y-1">
                      {websiteItems.map((item) => {
                        const isItemActive = pathname === item.href || pathname?.startsWith(item.href) || pathname?.startsWith(item.href.replace('/cms/', '/admin/'))
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
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      openSubmenus.career ? 'rotate-180 text-amber-500' : 'text-gray-400'
                    }`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenus.career ? 'max-h-96 opacity-100 pt-0.5 pb-1' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <div className="ml-3 pl-2.5 border-l-2 border-gray-200 dark:border-gray-800/80 space-y-1">
                      {careerItems.map((item) => {
                        const isItemActive = pathname === item.href || pathname?.startsWith(item.href) || pathname?.startsWith(item.href.replace('/cms/', '/admin/'))
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
                        const isItemActive = pathname === item.href || pathname?.startsWith(item.href) || pathname?.startsWith(item.href.replace('/cms/', '/admin/'))
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
            {/* TOMBOL INSTALASI / STATUS PWA */}
            <button
              type="button"
              onClick={handleInstallPwa}
              className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border shadow-sm cursor-pointer ${
                isStandalone
                  ? isDarkMode
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-[#6B0808] hover:bg-[#8B1E1E] text-white border-[#6B0808] shadow-sm'
              }`}
              title="Install 4SU CMS sebagai Aplikasi PWA"
            >
              <div className="flex items-center gap-2 truncate">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span className="truncate">{isStandalone ? 'Aplikasi 4SU Terpasang' : 'Install PWA 4SU CMS'}</span>
              </div>
              {isStandalone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Download className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>

            <Link 
              href="/" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenMainSite}
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
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">4SU Engine v2.6</div>
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

      {/* AREA KANAN: TOPBAR TERPADU + KONTEN UTAMA (BEBAS TABRAKAN TOMBOL FLOATING) */}
      <div className="flex-1 flex flex-col h-screen h-[100dvh] overflow-hidden min-w-0 relative">
        
        {/* STICKY TOPBAR HEADER CMS (DENGAN SAFE-AREA INSET TOP UNTUK NOTCH / DYNAMIC ISLAND IPHONE) */}
        <header 
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
          }}
          className={`flex-shrink-0 z-30 border-b transition-colors select-none ${
            isDarkMode ? 'bg-[#12141C]/95 border-[#1E222D] text-zinc-100' : 'bg-white/95 border-gray-200 text-gray-900'
          }`}
        >
          <div className="h-13 sm:h-14 sm:px-2 flex items-center justify-between">
          {/* SISI KIRI: Tombol Toggle Menu Sidebar & Judul Modul */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer hover:scale-105 shrink-0 ${
                isDarkMode 
                  ? 'bg-gray-900 text-amber-400 border-gray-800 hover:bg-gray-800' 
                  : 'bg-gray-100 text-amber-700 border-gray-200 hover:bg-gray-200'
              }`}
              title={isSidebarOpen ? "Tutup Panel Sidebar" : "Buka Panel Sidebar"}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0 flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-gray-900 dark:text-white truncate">
                4SU CMS
              </span>
            </div>
          </div>

          {/* SISI KANAN: Aksi Terpadu (Deploy, Log Notifikasi, Toggle Tema) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* TOMBOL DEPLOY */}
            {currentUser?.id !== 'superadmin' && !currentUser?.isSuperadmin && (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={!hasDraft || isPending || isLockedByOther}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  !hasDraft || isPending || isLockedByOther
                    ? 'opacity-40 cursor-not-allowed border-transparent text-gray-400'
                    : isDarkMode ? 'bg-[#8B1E1E] hover:bg-[#A32626] text-white border-[#8B1E1E] shadow-sm' : 'bg-[#6B0808] hover:bg-[#8B1E1E] text-white border-[#6B0808] shadow-sm'
                }`}
                title={
                  isLockedByOther 
                    ? `Terkunci: Sedang dikelola oleh ${draftLock?.userName}` 
                    : hasDraft 
                      ? 'Terbitkan draft perubahan ke website' 
                      : 'Belum ada perubahan baru (Draft kosong)'
                }
              >
                {isPending ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                )}
                <span className="hidden sm:inline">Deploy</span>
              </button>
            )}

            {/* NOTIFIKASI DROPDOWN */}
            <div id="notif-container" className="relative">
              <button
                type="button"
                onClick={handleToggleNotif}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all border cursor-pointer relative ${
                  isDarkMode 
                    ? 'bg-[#181B26] text-zinc-300 border-[#222736] hover:bg-[#202534] hover:text-white' 
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
                title="Log Notifikasi Perubahan"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8B1E1E] text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* PANEL DROPDOWN NOTIFIKASI */}
              {showNotifPanel && (
                <div className={`absolute right-0 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-xl shadow-xl border p-3.5 space-y-2.5 z-50 ${
                  isDarkMode ? 'bg-[#151822] border-[#222736] text-zinc-200' : 'bg-white border-gray-200 text-gray-800'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2.5 ${
                    isDarkMode ? 'border-gray-800/80' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Log Perubahan</h3>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                      5 Menit
                    </span>
                  </div>

                  <div className="space-y-2">
                    {visibleNotifications.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 font-medium">Tidak ada notifikasi aktif.</p>
                    ) : (
                      visibleNotifications.map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-xl border text-xs space-y-1 ${
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

            {/* TOGGLE TEMA (MATAHARI / BULAN) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#181B26] text-zinc-300 border-[#222736] hover:bg-[#202534] hover:text-white' 
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
              title={isDarkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Malam'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-600" />}
            </button>
          </div>
          </div>
        </header>

        {/* KONTEN UTAMA */}
        <main 
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          className={`flex-1 overflow-y-auto relative transition-colors ${
          isDarkMode ? 'bg-[#0C0D12]' : 'bg-[#F4F6F9]'
        }`}>
          <div className={`mx-auto ${
            isCompactViewport || isShortViewport 
              ? 'p-2.5 sm:p-4 max-w-full pb-16 pt-3' 
              : 'p-6 md:p-8 max-w-5xl pb-24 pt-6'
          }`}>
            {/* BANNER DRAFT LOCK */}
            {isLockedByOther && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3 backdrop-blur-md">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold uppercase tracking-wider text-amber-400 block mb-0.5">Mode Read-Only Aktif</span>
                  Draf sedang dikelola oleh <strong className="font-semibold text-white">{draftLock?.userName}</strong>.
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      {/* TOAST SUDAH TERPASANG */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showInstalledToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Aplikasi PWA Sudah Aktif!</h4>
            <p className="text-[11px] text-amber-300/80 font-medium">Anda sedang menjalankan 4SU CMS langsung dari Layar Utama perangkat Anda.</p>
          </div>
        </div>
      </div>

      {/* MODAL KHUSUS SAFARI IOS & SAFARI MACOS (KARENA APPLE WEBKIT MEMBLOKIR AUTO-PROMPT) */}
      {showIosInstallModal && (isIos || isSafariDesktop) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-[#12141C] text-white border-[#222736]' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6B0808] flex items-center justify-center text-white shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Pasang Aplikasi CMS (Apple)</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isIos ? 'Instalasi untuk iPhone & iPad' : 'Instalasi untuk Safari macOS'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstallModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos ? (
              <div className="space-y-3.5 text-xs">
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Sistem keamanan Apple iOS mewajibkan konfirmasi dari tombol Share bawaan browser untuk memasang <strong className="text-[#A12323] dark:text-[#E05252] font-bold">4SU CMS</strong>:
                </p>
                <div className="space-y-2.5 bg-gray-50 dark:bg-[#181B26] p-4 rounded-xl border border-gray-200 dark:border-[#222736]">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#6B0808] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <p className="text-gray-600 dark:text-gray-300 flex items-center flex-wrap gap-1">
                      Ketuk ikon <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"><Share className="w-3.5 h-3.5" /> Bagikan (Share)</strong> di bilah browser Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#6B0808] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Pilih <strong className="text-gray-900 dark:text-white font-bold">&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong> lalu ketuk <strong className="text-gray-900 dark:text-white font-bold">&quot;Tambah&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Di macOS, instalasi 1-klik langsung tersedia jika Anda membuka halaman ini di <strong className="text-gray-900 dark:text-white">Google Chrome / Edge</strong>. Jika menggunakan <strong className="text-gray-900 dark:text-white">Safari macOS</strong>:
                </p>
                <div className="space-y-2.5 bg-gray-50 dark:bg-[#181B26] p-4 rounded-xl border border-gray-200 dark:border-[#222736]">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#6B0808] text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Klik menu <strong className="text-gray-900 dark:text-white font-bold">File</strong> di pojok kiri atas layar Mac atau tombol <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"><Share className="w-3.5 h-3.5" /> Share</strong> di kanan atas Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#6B0808] text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Pilih <strong className="text-gray-900 dark:text-white font-bold">&quot;Add to Dock&quot; (Tambahkan ke Dock)</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowIosInstallModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#6B0808] hover:bg-[#8B1E1E] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}