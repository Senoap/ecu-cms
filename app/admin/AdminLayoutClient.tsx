// app/admin/AdminLayoutClient.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAdmin } from '@/app/login/actions'

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
  viewedAt?: number
}

interface AdminLayoutClientProps {
  children: React.ReactNode
  sections: SectionConfig[]
  notifications: NotificationItem[]
  hasDraft: boolean
  deployAction: () => Promise<void>
  clearNotificationsAction?: () => Promise<void>
  markAsViewedAction?: () => Promise<void>
}

export default function AdminLayoutClient({ 
  children, 
  sections, 
  notifications, 
  hasDraft, 
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

  // Hitung hanya notifikasi yang belum dilihat (viewedAt belum ada) untuk badge angka
  const unreadCount = notifications.filter(n => !n.viewedAt).length

  useEffect(() => {
    const savedTheme = localStorage.getItem('esu_cms_theme')
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  // TIMER 5 MENIT UNTUK PENGHAPUSAN OTOMATIS SETELAH DIBUKA
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showNotifPanel && notifications.length > 0 && clearNotificationsAction) {
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
  }, [showNotifPanel, notifications.length, clearNotificationsAction])

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

  const getSectionMeta = (id: string) => {
    switch (id) {
      case 'hero': return { href: '/admin/hero', icon: '✨' }
      case 'about': return { href: '/admin/about', icon: '👥' }
      case 'services': return { href: '/admin/services', icon: '💼' }
      case 'portfolio': return { href: '/admin/portfolio', icon: '📁' }
      case 'career': return { href: '/admin/career', icon: '🧑‍💻' }
      case 'gallery': return { href: '/admin/gallery', icon: '🖼️' }
      case 'contact': return { href: '/admin/footer', icon: '📞' }
      default: return null
    }
  }

  return (
    <div className={`h-screen w-screen overflow-hidden flex font-sans transition-colors duration-300 relative ${
      isDarkMode ? 'bg-[#090A0F] text-gray-100' : 'bg-[#F4F6F9] text-gray-900'
    }`}>
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-emerald-950/95 text-emerald-300 border border-emerald-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">🚀</span>
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
          <span>🔔</span>
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
            <div className="flex items-center justify-between border-b pb-3 border-gray-800/60">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <h3 className="text-xs font-black uppercase tracking-wider">Log Perubahan & CRUD</h3>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                Aktif (Batas 5 Mnt)
              </span>
            </div>

            <div className="space-y-2.5">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6 font-medium">Tidak ada notifikasi aktif.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    isDarkMode ? 'bg-gray-900/60 border-gray-800/80' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="text-amber-500 font-extrabold">{n.type}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className="font-medium text-gray-200 leading-relaxed">{n.message}</p>
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
        
        <div className={`w-80 h-screen p-6 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-amber-900/20">
                  ESU
                </div>
                <div>
                  <h2 className={`text-base font-black tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CMS Panel</h2>
                  <p className="text-xs text-amber-500 font-bold tracking-widest uppercase">Enterprise Control</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-900 text-amber-400 border-gray-800 hover:bg-gray-800' 
                    : 'bg-gray-100 text-amber-700 border-gray-200 hover:bg-gray-200'
                }`}
                title="Tutup Panel"
              >
                <span className="text-xl font-bold">☰</span>
              </button>
            </div>

            {/* MENU UTAMA */}
            <nav className="space-y-2 text-sm font-bold">
              <div className="px-3 pb-1 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Menu Utama</div>
              
              <Link 
                href="/admin" 
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group border ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent hover:border-gray-700/50' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent hover:border-gray-200'
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                <span>Pengaturan Global</span>
              </Link>

              {sections.map((sec) => {
                const meta = getSectionMeta(sec.id)
                if (!meta) return null
                return (
                  <Link 
                    key={sec.id}
                    href={meta.href} 
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group border ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent hover:border-gray-700/50' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{meta.icon}</span>
                    <span>{sec.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* BAGIAN BAWAH: KATEGORI SISTEM, WEBSITE UTAMA, & LOGOUT */}
          <div className="space-y-4 pt-4">
            
            {/* KATEGORI SISTEM (AUDIT LOG) */}
            <nav className={`space-y-2 text-sm font-bold pt-3 border-t ${isDarkMode ? 'border-gray-800/80' : 'border-gray-200'}`}>
              <div className="px-3 pb-1 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Sistem</div>
              
              <Link 
                href="/admin/audit-log" 
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group border ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800/60 hover:text-white border-transparent hover:border-gray-700/50' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950 border-transparent hover:border-gray-200'
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">📜</span>
                <span>Audit Log</span>
              </Link>
            </nav>

            {/* TOMBOL LIHAT WEBSITE UTAMA & LOGOUT */}
            <div className={`pt-3 border-t space-y-3 ${isDarkMode ? 'border-gray-800/80' : 'border-gray-200'}`}>
              <Link 
                href="/" 
                target="_blank"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all duration-200 border shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-900 hover:bg-gray-800 text-gray-200 hover:text-white border-gray-800' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-gray-950 border-gray-200'
                }`}
              >
                <span>Lihat Website Utama</span>
                <span>&rarr;</span>
              </Link>

              {/* TOMBOL LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className={`w-full py-3 rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-900/50' 
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
              >
                <span>🚪</span> Keluar (Logout)
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">ESU Engine v2.6</span>
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
          <span>☰</span>
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
            <span>🚀</span>
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
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}