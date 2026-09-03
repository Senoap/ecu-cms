// components/Navbar.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'
import SmoothLoader from '@/components/SmoothLoader'

interface NavbarProps {
  siteName: string
  tagline: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  loadingBgColor?: string
  logoUrl?: string
}

export default function Navbar({
  siteName,
  tagline,
  primaryColor,
  secondaryColor = '#D4AF37',
  accentColor = '#1E293B',
  loadingBgColor,
  logoUrl
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const { locale, toggleLocale, t } = useLanguage()
  const router = useRouter()

  // Deteksi scroll halaman & otomatis tutup menu jika terbuka saat scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
      setMobileMenuOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fungsi navigasi yang bekerja baik di halaman utama maupun di halaman detail
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setMobileMenuOpen(false)

    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      // Jika berada di halaman selain beranda, biarkan navigasi normal ke `/${hash}`
      return
    }

    if (hash.startsWith('#')) {
      e.preventDefault()
      setTransitioning(true)

      setTimeout(() => {
        const targetElement = document.querySelector(hash)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)

      setTimeout(() => {
        setTransitioning(false)
      }, 500)
    }
  }

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.portfolio, href: '#portfolio' },
  ]

  return (
    <>
      {/* OVERLAY TRANSISI SMOOTH & RINGAN DENGAN WARNA KUSTOM */}
      <SmoothLoader
        active={transitioning}
        loadingBgColor={loadingBgColor}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        text={t.nav.loadingContent}
      />

      {/* NAVBAR UTAMA */}
      <header className="sticky top-4 z-50 w-full px-4 md:px-12 flex justify-between items-start pointer-events-none transition-all duration-700 ease-out font-sans">
        
        {/* 1. LOGO FLOATING CARD (Kiri) */}
        <Link 
          href="/#home" 
          onClick={(e) => handleNavClick(e, '#home')}
          className={`pointer-events-auto flex items-center gap-3 md:gap-4 p-3.5 md:p-4 rounded-2xl border transition-all duration-500 ease-out hover:scale-105 active:scale-95 ${
            isScrolled 
              ? 'bg-white/95 dark:bg-[#0B0E17]/95 backdrop-blur-xl border-white/60 dark:border-gray-800 text-gray-900 dark:text-white shadow-lg scale-95' 
              : 'bg-white/95 dark:bg-[#0B0E17]/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800 text-gray-950 dark:text-white shadow-xl'
          }`}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 md:h-12 w-auto object-contain max-w-[150px] md:max-w-[180px]" />
          ) : (
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-amber-300/40 shadow-inner flex-shrink-0"
              style={{ backgroundColor: `${secondaryColor}25` }}
            >
              <span className="font-black text-sm md:text-base" style={{ color: secondaryColor }}>ESU</span>
            </div>
          )}
          <div className="hidden sm:block pr-2">
            <h1 className="font-black text-sm md:text-lg tracking-wide leading-tight">{siteName}</h1>
            <p className="text-[10px] md:text-xs tracking-widest text-gray-500 dark:text-gray-400 font-extrabold uppercase">{tagline}</p>
          </div>
        </Link>

        {/* 2. NAVIGATION FLOATING CARD (Kanan) */}
        <div className="relative pointer-events-auto">
          <nav 
            className={`flex items-center gap-3 md:gap-8 px-4 md:px-8 py-3.5 md:py-4.5 rounded-2xl shadow-2xl border border-white/20 transition-all duration-700 ease-out backdrop-blur-2xl text-sm md:text-base font-extrabold tracking-wide text-white ${
              isScrolled ? 'shadow-2xl scale-95' : ''
            }`}
            style={{ backgroundColor: primaryColor || '#4A0E17' }}
          >
            {/* TAMPILAN DESKTOP */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {!isScrolled ? (
                <>
                  {navLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={`/${link.href}`} 
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="hover:text-amber-300 transition-colors duration-300 cursor-pointer text-sm lg:text-base tracking-wide"
                    >
                      {link.name}
                    </a>
                  ))}
                  
                  {/* BILINGUAL LANGUAGE SWITCHER (DESKTOP) */}
                  <button
                    type="button"
                    onClick={toggleLocale}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs transition-all duration-300 border border-white/25 shadow-inner cursor-pointer"
                    title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                  >
                    <span>{locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                    <span className="text-[10px] opacity-75">⇄</span>
                  </button>

                  <a 
                    href="/#contact" 
                    onClick={(e) => handleNavClick(e, '#contact')}
                    className="px-6 py-2.5 rounded-xl bg-white text-gray-950 hover:bg-gray-100 shadow-md font-black transition-all duration-300 hover:scale-105 text-xs lg:text-sm cursor-pointer tracking-wider whitespace-nowrap"
                  >
                    {t.nav.contactUs}
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleLocale}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition-all border border-white/25 cursor-pointer"
                  >
                    <span>{locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 shadow-inner cursor-pointer"
                    aria-label="Toggle Menu"
                  >
                    <DynamicIcon name={mobileMenuOpen ? "ChevronLeft" : "Menu"} className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* TAMPILAN MOBILE (Tombol Bahasa + Tombol Hamburger) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleLocale}
                className="px-2.5 py-2 rounded-xl bg-white/20 active:bg-white/30 text-white font-black text-xs transition-all border border-white/25 cursor-pointer touch-manipulation select-none"
                title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              >
                <span>{locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMobileMenuOpen(prev => !prev)
                }}
                className="w-10 h-10 rounded-xl bg-white/20 active:bg-white/40 text-white flex items-center justify-center shadow-inner cursor-pointer touch-manipulation select-none"
                aria-label="Toggle Mobile Menu"
              >
                <DynamicIcon name={mobileMenuOpen ? "ChevronLeft" : "Menu"} className="w-6 h-6" />
              </button>
            </div>
          </nav>

          {/* DROPDOWN MENU MOBILE DENGAN ANIMASI SMOOTH */}
          <div 
            className={`absolute right-0 mt-3 w-64 sm:w-72 rounded-2xl shadow-2xl p-5 space-y-3 border border-white/25 backdrop-blur-2xl z-[10000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
              mobileMenuOpen 
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
            }`}
            style={{ backgroundColor: primaryColor || '#4A0E17' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Language Switcher di dalam Mobile Menu */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{t.common.language}:</span>
              <button
                type="button"
                onClick={toggleLocale}
                className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-black text-xs border border-white/30"
              >
                {locale === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'} ⇄
              </button>
            </div>

            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-sm sm:text-base font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2 border-b border-white/10 cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <a
              href="/#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="block text-sm sm:text-base font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2 cursor-pointer"
            >
              {t.nav.contactUs}
            </a>
          </div>

        </div>

      </header>
    </>
  )
}