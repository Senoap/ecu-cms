// components/Navbar.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DynamicIcon } from '@/components/DynamicIcon'

interface NavbarProps {
  siteName: string
  tagline: string
  primaryColor: string
  logoUrl?: string
}

export default function Navbar({ siteName, tagline, primaryColor, logoUrl }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [randomEffect, setRandomEffect] = useState(0)

  // Deteksi scroll halaman
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fungsi transisi acak saat menu diklik
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      setMobileMenuOpen(false)

      const effectIndex = Math.floor(Math.random() * 4)
      setRandomEffect(effectIndex)
      setTransitioning(true)

      setTimeout(() => {
        const targetElement = document.querySelector(href)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 400)

      setTimeout(() => {
        setTransitioning(false)
      }, 900)
    }
  }

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'WHO WE ARE', href: '#about' },
    { name: 'SERVICES', href: '#services' },
    { name: 'PORTFOLIO', href: '#portfolio' },
  ]

  return (
    <>
      {/* OVERLAY TRANSISI FULL LAYAR */}
      <div 
        className={`fixed inset-0 z-[999] pointer-events-none transition-all duration-900 ${
          transitioning ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: primaryColor || '#4A0E17',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transform: 
            randomEffect === 1 ? (transitioning ? 'translateY(0%)' : 'translateY(-100%)') :
            randomEffect === 2 ? (transitioning ? 'scale(1)' : 'scale(1.15)') :
            randomEffect === 3 ? (transitioning ? 'translateX(0%)' : 'translateX(100%)') :
            'none',
          filter: randomEffect === 0 ? (transitioning ? 'blur(0px)' : 'blur(15px)') : 'none',
          opacity: randomEffect === 0 ? (transitioning ? '0.94' : '0') : transitioning ? '1' : '0'
        }}
      >
        <div className={`absolute inset-0 flex items-center justify-center text-white text-2xl font-bold tracking-[0.3em] transition-all duration-700 ${transitioning ? 'scale-100 opacity-90' : 'scale-90 opacity-0'}`}>
          MEMUAT KONTEN...
        </div>
      </div>

      {/* NAVBAR UTAMA (Sticky agar konten bawah tidak tumpang tindih di semua perangkat) */}
      <header className="sticky top-4 z-50 w-full px-4 md:px-12 flex justify-between items-start pointer-events-none transition-all duration-700 ease-out font-sans">
        
        {/* 1. LOGO FLOATING CARD (Kiri) - Diperbesar */}
        <Link 
          href="#home" 
          onClick={(e) => handleNavClick(e, '#home')}
          className={`pointer-events-auto flex items-center gap-4 p-4 md:p-4.5 rounded-2xl border transition-all duration-700 ease-out hover:scale-105 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-xl border-white/60 text-gray-900 shadow-lg scale-95' 
              : 'bg-white/95 backdrop-blur-xl border-gray-200/60 text-gray-950 shadow-xl'
          }`}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-11 md:h-12 w-auto object-contain max-w-[180px]" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-300 shadow-inner">
              <span className="text-amber-800 font-black text-base">ESU</span>
            </div>
          )}
          <div className="hidden sm:block pr-2">
            <h1 className="font-black text-base md:text-lg tracking-wide leading-tight">{siteName}</h1>
            <p className="text-xs tracking-widest text-gray-500 font-extrabold uppercase">{tagline}</p>
          </div>
        </Link>

        {/* 2. NAVIGATION FLOATING CARD (Kanan) - Diperbesar */}
        <div className="relative pointer-events-auto">
          <nav 
            className={`flex items-center gap-6 md:gap-8 px-6 md:px-8 py-4 md:py-5 rounded-2xl shadow-2xl border border-white/20 transition-all duration-700 ease-out backdrop-blur-2xl text-base md:text-lg font-extrabold tracking-wide text-white ${
              isScrolled ? 'shadow-2xl scale-95' : ''
            }`}
            style={{ backgroundColor: primaryColor || '#4A0E17' }}
          >
            {/* TAMPILAN DESKTOP (Teks Menu Lengkap) */}
            <div className="hidden md:flex items-center gap-8">
              {!isScrolled ? (
                <>
                  {navLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="hover:text-amber-300 transition-colors duration-300 cursor-pointer text-base md:text-lg tracking-wide"
                    >
                      {link.name}
                    </a>
                  ))}
                  
                  <a 
                    href="#contact" 
                    onClick={(e) => handleNavClick(e, '#contact')}
                    className="px-7 py-3 rounded-xl bg-white text-gray-950 hover:bg-gray-100 shadow-md font-black transition-all duration-300 hover:scale-105 text-base cursor-pointer tracking-wider"
                  >
                    CONTACT US
                  </a>
                  
                  <Link 
                    href="/admin" 
                    className="text-sm bg-black/20 hover:bg-black/40 px-3.5 py-2.5 rounded-xl text-white/90 transition-colors duration-300 font-bold cursor-pointer"
                    title="Admin CMS"
                  >
                    CMS
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 shadow-inner cursor-pointer"
                  aria-label="Toggle Menu"
                >
                  <DynamicIcon name={mobileMenuOpen ? "ChevronLeft" : "Menu"} className="w-7 h-7" />
                </button>
              )}
            </div>

            {/* TAMPILAN MOBILE (Tombol Hamburger Diperbesar) */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMobileMenuOpen(prev => !prev)
                }}
                className="w-12 h-12 rounded-xl bg-white/20 active:bg-white/40 text-white flex items-center justify-center shadow-inner cursor-pointer touch-manipulation select-none"
                aria-label="Toggle Mobile Menu"
              >
                <DynamicIcon name={mobileMenuOpen ? "ChevronLeft" : "Menu"} className="w-7 h-7" />
              </button>
            </div>
          </nav>

          {/* DROPDOWN MENU (Diperbesar agar mudah dibaca) */}
          {mobileMenuOpen && (
            <div 
              className="absolute right-0 mt-3 w-64 md:w-72 rounded-2xl shadow-2xl p-6 space-y-4 border border-white/25 backdrop-blur-2xl z-[10000]"
              style={{ backgroundColor: primaryColor || '#4A0E17' }}
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block text-base md:text-lg font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2.5 border-b border-white/10 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="block text-base md:text-lg font-extrabold tracking-wide text-white hover:text-amber-300 transition-colors py-2.5 border-b border-white/10 cursor-pointer"
              >
                CONTACT US
              </a>
              <div className="pt-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-3 rounded-xl text-sm font-extrabold tracking-wider bg-white/30 hover:bg-white/40 text-white uppercase cursor-pointer"
                >
                  Admin CMS
                </Link>
              </div>
            </div>
          )}

        </div>

      </header>
    </>
  )
}