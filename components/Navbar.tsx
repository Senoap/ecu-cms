// components/Navbar.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'
import { useSmartViewport } from '@/components/SmartViewportProvider'
import SmoothLoader from '@/components/SmoothLoader'
import { FileDown, ChevronDown, Building2, Users, Award } from 'lucide-react'
import ComproRequestModal from '@/components/ComproRequestModal'

interface NavbarProps {
  siteName: string
  tagline: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  loadingBgColor?: string
  logoUrl?: string
  showLeadership?: boolean
  showCertifications?: boolean
  showCompro?: boolean
  leadershipLabel?: string
}

export default function Navbar({
  siteName,
  tagline,
  primaryColor,
  secondaryColor = '#D4AF37',
  loadingBgColor,
  logoUrl,
  showLeadership = true,
  showCertifications = true,
  showCompro = true,
  leadershipLabel = 'Profil Pimpinan',
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [comproModalOpen, setComproModalOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const { t } = useLanguage()
  const { isCompactViewport, isShortViewport, isQuadSplit } = useSmartViewport()
  const isCompactNav = isScrolled || isCompactViewport || isShortViewport
  const menuContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Pembersihan PWA Publik: Pastikan hanya halaman CMS yang menggunakan PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.scope && !reg.scope.includes('/admin')) {
            reg.unregister().catch(() => {})
          }
        }
      }).catch(() => {})
    }
  }, [])

  // Deteksi scroll halaman & tutup menu hanya jika ada pergerakan scroll nyata
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 40)

      // Hanya otomatis tutup menu jika pengguna benar-benar scroll halaman (> 10px perbedaan)
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setMobileMenuOpen(false)
        setAboutDropdownOpen(false)
        lastScrollY = currentScrollY
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Menutup menu saat pengguna menyentuh/klik di luar area menu
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [mobileMenuOpen])

  // Fungsi navigasi yang bekerja baik di halaman utama maupun di halaman detail
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    setMobileMenuOpen(false)

    if (target.startsWith('#')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        return
      }
      e.preventDefault()
      setTransitioning(true)

      setTimeout(() => {
        const targetElement = document.querySelector(target)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)

      setTimeout(() => {
        setTransitioning(false)
      }, 500)
    }
  }

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  interface NavSublink {
    name: string
    href: string
    desc: string
    icon: 'Building2' | 'Users' | 'Award'
  }

  interface NavLinkItem {
    name: string
    href: string
    isHash: boolean
    sublinks?: NavSublink[]
  }

  // Buat daftar sublinks Tentang Kami secara dinamis sesuai fitur yang aktif
  const aboutSublinks: NavSublink[] = [
    { name: 'Tentang Kami', href: '/#about', desc: 'Profil & Rekam Jejak Perusahaan', icon: 'Building2' },
  ]
  if (showLeadership !== false) {
    aboutSublinks.push({
      name: leadershipLabel || 'Profil Pimpinan',
      href: '/leadership',
      desc: 'Tim Manajemen & Pengelola',
      icon: 'Users',
    })
  }
  if (showCertifications !== false) {
    aboutSublinks.push({
      name: 'Sertifikasi Perusahaan',
      href: '/certifications',
      desc: 'Izin Operasional & Standar ISO',
      icon: 'Award',
    })
  }

  const hasAboutSubmenu = aboutSublinks.length > 1

  const navLinks: NavLinkItem[] = [
    { name: t.nav.home, href: '/#home', isHash: true },
    { 
      name: t.nav.about, 
      href: '/#about', 
      isHash: true,
      sublinks: hasAboutSubmenu ? aboutSublinks : undefined
    },
    { name: t.nav.services, href: '/#services', isHash: true },
    { name: t.nav.portfolio, href: '/#portfolio', isHash: true },
    { name: t.nav.career, href: '/#career', isHash: true },
    { name: t.nav.gallery, href: '/#gallery', isHash: true },
  ]

  return (
    <>
      {/* OVERLAY TRANSISI SMOOTH & RINGAN DENGAN WARNA KUSTOM */}
      <SmoothLoader
        active={transitioning}
        loadingBgColor={loadingBgColor}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        logoUrl={logoUrl}
        text={t.nav.loadingContent}
      />

      {/* NAVBAR UTAMA (FIXED MELAYANG DI ATAS LAYAR DENGAN SPASING ATAS YANG ELEGAN & SMART MULTI-WINDOW) */}
      <header 
        className={`fixed left-0 right-0 z-50 w-full px-3 sm:px-6 md:px-10 lg:px-16 flex justify-between items-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans ${
          isCompactNav ? 'top-2.5 sm:top-3.5' : 'top-5 sm:top-7 lg:top-8'
        }`}
      >
        
        {/* 1. LOGO FLOATING CARD (Kiri: Menyusut menampilkan hanya logo saat di-scroll atau saat layar dibagi 2/4 jendela) */}
        <Link 
          href="/#home" 
          onClick={(e) => handleNavClick(e, '#home')}
          className={`pointer-events-auto flex items-center rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 active:scale-95 ${
            isScrolled || isQuadSplit
              ? 'h-11 w-11 sm:h-12 sm:w-12 justify-center p-0 bg-white/95 dark:bg-[#0B0E17]/95 backdrop-blur-xl border-white/60 dark:border-gray-800 text-gray-900 dark:text-white shadow-lg gap-0' 
              : 'h-13 sm:h-15 md:h-16 px-3.5 sm:px-4 md:px-5 bg-white/95 dark:bg-[#0B0E17]/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800 text-gray-950 dark:text-white shadow-xl gap-2.5 md:gap-3.5'
          }`}
          title={siteName}
        >
          {logoUrl ? (
            <div className={`transition-all duration-500 flex items-center justify-center shrink-0 ${
              isScrolled || isQuadSplit ? 'w-7 h-7 sm:w-8 sm:h-8' : 'h-8 sm:h-10 md:h-11 w-auto max-w-[130px] md:max-w-[170px]'
            }`}>
              <img 
                src={logoUrl} 
                alt={siteName} 
                className={`w-auto object-contain shrink-0 transition-all duration-500 ${
                  isScrolled || isQuadSplit ? 'max-h-7 max-w-7 sm:max-h-8 sm:max-w-8' : 'h-8 sm:h-10 md:h-11 max-h-8 sm:max-h-10 md:max-h-11 max-w-[130px] md:max-w-[170px]'
                }`}
              />
            </div>
          ) : (
            <div
              className={`rounded-xl flex items-center justify-center border border-amber-300/40 shadow-inner shrink-0 transition-all duration-500 ${
                isScrolled || isQuadSplit ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11'
              }`}
              style={{ backgroundColor: `${secondaryColor}25` }}
            >
              <span className="font-black text-xs md:text-sm" style={{ color: secondaryColor }}>4SU</span>
            </div>
          )}
          <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap flex flex-col justify-center ${
              isScrolled || isQuadSplit
                ? 'max-w-0 opacity-0 pointer-events-none scale-95 pr-0' 
                : 'max-w-[280px] opacity-100 pointer-events-auto scale-100 hidden sm:flex pr-1.5'
            }`}
          >
            <h1 className="font-black text-xs md:text-base tracking-wide leading-tight">{siteName}</h1>
            <p className="text-[9px] md:text-[11px] tracking-widest text-gray-500 dark:text-gray-400 font-extrabold uppercase leading-none mt-0.5">{tagline}</p>
          </div>
        </Link>

        {/* 2. NAVIGATION FLOATING CARD (Kanan) */}
        <div ref={menuContainerRef} className="relative pointer-events-auto">
          <nav 
            className={`flex items-center rounded-2xl shadow-xl border border-white/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] backdrop-blur-2xl text-xs md:text-sm font-black tracking-wide text-white ${
              isCompactNav 
                ? 'h-11 w-11 sm:h-12 sm:w-12 justify-center p-0' 
                : 'h-13 sm:h-15 md:h-16 w-13 sm:w-15 lg:w-auto justify-center lg:justify-start px-0 lg:px-5 xl:px-7'
            }`}
            style={{ backgroundColor: primaryColor || '#4A0E17' }}
          >
            {/* TAMPILAN DESKTOP & LAPTOP (Menutup secara soft & smooth saat di-scroll atau saat layar dipisah menjadi 2/4 jendela) */}
            <div 
              className={`hidden lg:flex items-center gap-3 xl:gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap h-full ${
                isCompactNav 
                  ? 'max-w-0 opacity-0 pointer-events-none scale-95' 
                  : 'max-w-[1400px] opacity-100 pointer-events-auto scale-100'
              }`}
            >
              {navLinks.map((link) => {
                if (link.sublinks) {
                  return (
                    <div 
                      key={link.name} 
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setAboutDropdownOpen(true)}
                      onMouseLeave={() => setAboutDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-1">
                        <Link 
                          href={link.href} 
                          onClick={(e) => {
                            setAboutDropdownOpen(false)
                            handleNavClick(e, link.href)
                          }}
                          className="hover:text-amber-300 transition-colors duration-300 cursor-pointer text-xs xl:text-sm font-black tracking-wider uppercase whitespace-nowrap py-1 flex items-center gap-1"
                        >
                          <span>{link.name}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180 text-amber-300' : 'text-white/70'}`} />
                        </Link>
                      </div>

                      {/* DROPDOWN SUBMENU DENGAN AESTHETIC ELEGAN */}
                      <div 
                        className={`absolute top-full left-1/2 -translate-x-1/2 pt-2.5 transition-all duration-300 ${
                          aboutDropdownOpen 
                            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                        }`}
                      >
                        <div 
                          className="w-72 rounded-2xl shadow-2xl p-2 border border-white/20 backdrop-blur-2xl space-y-1"
                          style={{ backgroundColor: primaryColor || '#4A0E17' }}
                        >
                          {link.sublinks.map((sub) => {
                            const IconComp = sub.icon === 'Building2' ? Building2 : sub.icon === 'Users' ? Users : Award
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={(e) => {
                                  setAboutDropdownOpen(false)
                                  handleNavClick(e, sub.href)
                                }}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group/sub text-left cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/15 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 group-hover/sub:bg-amber-500 group-hover/sub:text-gray-950 transition-colors shadow-sm">
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-white group-hover/sub:text-amber-300 transition-colors tracking-wide">
                                    {sub.name}
                                  </div>
                                  <div className="text-[10px] text-gray-200/80 font-medium leading-tight mt-0.5">
                                    {sub.desc}
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="hover:text-amber-300 transition-colors duration-300 cursor-pointer text-xs xl:text-sm font-black tracking-wider uppercase whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                )
              })}
              


              {/* Tombol Minta Compro PDF */}
              {showCompro !== false && (
                <button
                  type="button"
                  onClick={() => setComproModalOpen(true)}
                  className="px-3 xl:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black transition-all duration-300 hover:scale-105 text-xs xl:text-sm cursor-pointer tracking-wider whitespace-nowrap flex items-center gap-1.5 shadow-sm ml-1 shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Compro PDF</span>
                </button>
              )}

              {/* Tombol Hubungi Kami */}
              <Link 
                href="/#contact" 
                onClick={(e) => handleNavClick(e, '#contact')}
                className="px-3.5 xl:px-4 py-1.5 sm:py-2 rounded-xl bg-white text-gray-950 hover:bg-gray-100 shadow-md font-black transition-all duration-300 hover:scale-105 text-xs xl:text-sm cursor-pointer tracking-wider whitespace-nowrap shrink-0"
              >
                {t.nav.contactUs}
              </Link>
            </div>

            {/* TOMBOL HAMBURGER (Selalu ada di mobile & split-screen 2/4 jendela, muncul secara soft di desktop saat di-scroll) */}
            <div 
              className={`items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] h-full ${
                isCompactNav 
                  ? 'flex opacity-100 scale-100 pointer-events-auto w-full' 
                  : 'flex lg:hidden lg:opacity-0 lg:scale-90 lg:pointer-events-none w-full'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMobileMenuOpen((prev) => !prev)
                }}
                className={`rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer touch-manipulation select-none ${
                  isCompactNav 
                    ? 'w-full h-full hover:bg-white/15 active:bg-white/25 text-white' 
                    : 'w-10 h-10 sm:w-11 sm:h-11 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white shadow-inner'
                }`}
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
              >
                <DynamicIcon name={mobileMenuOpen ? "ChevronLeft" : "Menu"} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </nav>

          {/* DROPDOWN MENU DENGAN ANIMASI SMOOTH */}
          <div 
            className={`absolute right-0 mt-3 w-64 sm:w-72 max-h-[calc(100dvh-100px)] overflow-y-auto overscroll-contain rounded-2xl shadow-2xl p-5 space-y-2 border border-white/25 backdrop-blur-2xl z-[10000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
              mobileMenuOpen 
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
            }`}
            style={{ backgroundColor: primaryColor || '#4A0E17' }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              if (link.sublinks) {
                return (
                  <div key={link.name} className="border-b border-white/10 pb-2">
                    <div className="flex items-center justify-between text-sm sm:text-base font-extrabold tracking-wide text-white py-1">
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="hover:text-amber-300 transition-colors"
                      >
                        {link.name}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMobileAboutOpen((prev) => !prev)
                        }}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-amber-300 transition-colors cursor-pointer"
                        aria-label="Toggle Submenu"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-amber-300' : ''}`} />
                      </button>
                    </div>

                    <div className={`space-y-1 pl-3 pt-1 border-l-2 border-amber-500/50 ml-1 transition-all ${mobileAboutOpen ? 'block' : 'hidden'}`}>
                      {link.sublinks.map((sub) => {
                        const IconComp = sub.icon === 'Building2' ? Building2 : sub.icon === 'Users' ? Users : Award
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => handleNavClick(e, sub.href)}
                            className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200 hover:text-amber-300 transition-colors py-1.5"
                          >
                            <IconComp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{sub.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block text-sm sm:text-base font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2 border-b border-white/10 cursor-pointer"
                >
                  {link.name}
                </Link>
              )
            })}



            {/* Tombol Minta Compro PDF di Mobile Menu */}
            {showCompro !== false && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setComproModalOpen(true)
                }}
                className="w-full text-left text-sm sm:text-base font-extrabold tracking-wide text-amber-300 hover:text-white transition-colors py-2 border-b border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>Minta Compro (PDF)</span>
              </button>
            )}

            <Link
              href="/#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="block text-sm sm:text-base font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2 cursor-pointer"
            >
              {t.nav.contactUs}
            </Link>
          </div>

        </div>

      </header>



      {/* MODAL MINTA COMPRO PDF (POINT 3 & 4) */}
      <ComproRequestModal
        isOpen={comproModalOpen}
        onClose={() => setComproModalOpen(false)}
        siteName={siteName}
      />
    </>
  )
}