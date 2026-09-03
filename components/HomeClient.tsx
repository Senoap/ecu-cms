// components/HomeClient.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from './Navbar'
import ServicesSectionClient from '@/components/ServicesSectionClient'
import AboutSectionClient from '@/components/AboutSectionClient'
import GallerySectionClient from '@/components/GallerySectionClient'
import HeroShowcaseCard from '@/components/HeroShowcaseCard'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'

export default function HomeClient({ db }: { db: any }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showContactActions, setShowContactActions] = useState(false)
  const contactRef = useRef<HTMLDivElement>(null)

  // Sinkronisasi tema khusus website publik menggunakan key 'esu_site_theme'
  useEffect(() => {
    const savedTheme = localStorage.getItem('esu_site_theme')
    const dark = savedTheme === 'dark'
    setIsDarkMode(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Event listener untuk scroll & menutup popover ketika klik di luar area
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
      setShowContactActions(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setShowContactActions(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fungsi toggle tema khusus untuk pengunjung website utama
  const toggleSiteTheme = () => {
    const nextMode = !isDarkMode
    setIsDarkMode(nextMode)
    localStorage.setItem('esu_site_theme', nextMode ? 'dark' : 'light')
    if (nextMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Fungsi untuk scroll kembali ke atas secara smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const { locale, t, getFallbackContent } = useLanguage()
  const { setting, hero, about, servicesHeader, portfolioHeader, careerHeader, galleryHeader, footer, sections } = db
  const activeSections = (sections || []).filter((sec: any) => sec.isVisible)

  // Konten Hero terjemahan bilingual
  const heroBadge = (locale === 'en' && !hero.badge) ? t.hero.badge : (hero.badge || t.hero.badge)
  const heroTitleLine1 = (locale === 'en' && !hero.titleLine1) ? t.hero.titleLine1 : (hero.titleLine1 || t.hero.titleLine1)
  const heroTitleHighlight = (locale === 'en' && !hero.titleHighlight) ? t.hero.titleHighlight : (hero.titleHighlight || t.hero.titleHighlight)
  const heroDesc = (locale === 'en' && !hero.description) ? t.hero.description : (hero.description || t.hero.description)

  return (
    <div
      className={`min-h-screen font-sans selection:bg-amber-500/20 selection:text-amber-400 relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#090A0F] text-gray-100' : 'bg-[#F8F7F4] text-gray-800'
      }`}
    >
      {/* Background Image Container yang 100% Kompatibel dengan iOS Safari & Android */}
      {setting.bgImageUrl && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${setting.bgImageUrl})` }}
        />
      )}

      {/* Overlay Tipis agar teks tetap kontras terbaca di atas background foto */}
      <div className={`absolute inset-0 pointer-events-none fixed z-0 ${
        isDarkMode ? 'bg-black/85' : 'bg-[#F8F7F4]/90'
      } backdrop-blur-[1px]`}></div>

      <div className="relative z-10">
        {/* 1. NAVBAR */}
        <Navbar
          siteName={setting.siteName}
          tagline={setting.tagline}
          primaryColor={setting.primaryColor}
          secondaryColor={setting.secondaryColor}
          accentColor={setting.accentColor}
          loadingBgColor={setting.loadingBgColor}
          logoUrl={setting.logoUrl}
        />

        {/* RENDER SECTIONS BERDASARKAN URUTAN DI CMS SECARA FULL SCREEN */}
        {activeSections.map((sec: any) => {
          switch (sec.id) {
            case 'hero': {
              const showcaseConfig = db.hero?.showcaseCard || sec.showcaseCard
              const isShowcaseActive = showcaseConfig?.enabled !== false

              return (
                <section key={sec.id} id="home" className="min-h-screen w-full relative py-24 md:py-28 px-4 sm:px-8 md:px-20 bg-transparent border-b border-gray-200/10 overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none blur-3xl" style={{ backgroundColor: setting.primaryColor }}></div>

                  <div className={`max-w-7xl mx-auto items-center relative z-10 w-full gap-10 md:gap-12 ${
                    isShowcaseActive ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col max-w-4xl text-center mx-auto'
                  }`}>
                    <div className={`space-y-6 ${!isShowcaseActive ? 'flex flex-col items-center' : ''}`}>
                      <div className={`inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 backdrop-blur-sm border rounded-full text-xs md:text-sm font-extrabold tracking-wider shadow-sm ${
                        isDarkMode ? 'bg-gray-900/80 border-amber-500/30 text-amber-400' : 'bg-amber-50/90 border-amber-200/80 text-amber-800'
                      }`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="truncate max-w-[280px] sm:max-w-none">{heroBadge}</span>
                      </div>

                      {/* Judul Utama Responsif */}
                      <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] sm:leading-[1.08] ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {heroTitleLine1} <br />
                        <span className="underline decoration-amber-500/30 decoration-wavy break-words" style={{ color: setting.primaryColor }}>
                          {heroTitleHighlight}
                        </span>
                      </h1>

                      {/* Deskripsi Hero */}
                      <p className={`text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-medium max-w-2xl backdrop-blur-sm p-4 sm:p-5 rounded-2xl border ${
                        isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-300' : 'bg-white/60 border-gray-200/60 text-gray-700'
                      }`}>
                        {heroDesc}
                      </p>

                      <div className={`flex flex-wrap gap-3 sm:gap-4 pt-2 ${!isShowcaseActive ? 'justify-center' : ''}`}>
                        <a
                          href="#services"
                          className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm md:text-base font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 tracking-wide text-center active:scale-95"
                          style={{ backgroundColor: setting.primaryColor }}
                        >
                          {t.hero.exploreServices} &rarr;
                        </a>
                        <a
                          href="#about"
                          className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm md:text-base font-black backdrop-blur-sm border transition-all duration-300 shadow-sm tracking-wide text-center active:scale-95 ${
                            isDarkMode
                              ? 'bg-gray-900/80 border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                              : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {t.hero.whoWeAre}
                        </a>
                      </div>
                    </div>

                    {/* HERO SHOWCASE CARD KORPORAT INTERAKTIF (BISA DIATUR & DIAKTIFKAN / DINONAKTIFKAN DI CMS) */}
                    {isShowcaseActive && (
                      <HeroShowcaseCard
                        siteName={setting.siteName}
                        tagline={setting.tagline}
                        primaryColor={setting.primaryColor}
                        secondaryColor={setting.secondaryColor}
                        accentColor={setting.accentColor}
                        logoUrl={setting.logoUrl}
                        isDarkMode={isDarkMode}
                        showcaseData={showcaseConfig}
                      />
                    )}
                  </div>
                </section>
              )
            }

            case 'about':
              return (
                <AboutSectionClient
                  key={sec.id}
                  about={about}
                  primaryColor={setting.primaryColor}
                />
              )

            case 'services':
              return (
                <ServicesSectionClient
                  key={sec.id}
                  services={db.services}
                  headerTag={servicesHeader.tag}
                  headerHeading={servicesHeader.heading}
                  headerNote={servicesHeader.note}
                  slideDuration={setting.slideDuration || 3}
                  primaryColor={setting.primaryColor}
                  secondaryColor={setting.secondaryColor}
                  accentColor={setting.accentColor}
                  loadingBgColor={setting.loadingBgColor}
                  logoUrl={setting.logoUrl}
                />
              )

            case 'portfolio':
              const portTag = (locale === 'en' && !portfolioHeader.tag) ? t.portfolio.tag : (portfolioHeader.tag || t.portfolio.tag)
              const portHeading = (locale === 'en' && !portfolioHeader.heading) ? t.portfolio.heading : (portfolioHeader.heading || t.portfolio.heading)
              const portNote = (locale === 'en' && !portfolioHeader.note) ? t.portfolio.note : (portfolioHeader.note || '')

              return (
                <section key={sec.id} id="portfolio" className="min-h-screen w-full py-24 md:py-28 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-4 text-center">
                    <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 rounded-full border shadow-sm ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                    }`}>
                      {portTag}
                    </span>
                    <h2 className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {portHeading}
                    </h2>
                    <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full mt-3"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {(db.portfolios || []).map((item: any) => {
                      const fb = getFallbackContent('portfolios', item.id)
                      const itemName = (locale === 'en' && fb?.name) ? fb.name : item.name
                      const itemDesc = (locale === 'en' && fb?.desc) ? fb.desc : item.desc

                      return (
                        <div
                          key={item.id}
                          className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group ${
                            isDarkMode ? 'bg-gray-900/80 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/80 hover:shadow-2xl'
                          }`}
                        >
                          {item.imageUrl && (
                            <Link href={`/portfolio/${item.id}`} className="block h-52 sm:h-56 rounded-2xl overflow-hidden bg-gray-900 relative">
                              <img src={item.imageUrl} alt={itemName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </Link>
                          )}
                          <div className="space-y-3 flex-1">
                            <Link href={`/portfolio/${item.id}`}>
                              <h3 className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${
                                isDarkMode ? 'text-white group-hover:text-amber-400' : 'text-gray-900 group-hover:text-amber-700'
                              }`}>
                                {itemName}
                              </h3>
                            </Link>
                            <p className={`text-sm sm:text-base leading-relaxed font-medium line-clamp-3 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {itemDesc}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-200/40 dark:border-gray-800 flex items-center justify-between">
                            <Link
                              href={`/portfolio/${item.id}`}
                              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-600 hover:text-amber-500 transition-all transform group-hover:translate-x-1"
                            >
                              <span>{t.portfolio.viewDetail}</span>
                              <span>&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {portNote && (
                    <p className="text-xs sm:text-sm text-gray-500 italic text-center">{portNote}</p>
                  )}
                </section>
              )

            case 'career':
              const crTag = (locale === 'en' && !careerHeader?.tag) ? t.career.tag : (careerHeader?.tag || sec.subtitle || t.career.tag)
              const crHeading = (locale === 'en' && !careerHeader?.heading) ? t.career.heading : (careerHeader?.heading || sec.title || t.career.heading)
              const crNote = (locale === 'en' && !careerHeader?.note) ? t.career.note : (careerHeader?.note || '')

              return (
                <section key={sec.id} id="career" className="min-h-screen w-full py-24 md:py-28 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-4 text-center">
                    <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 rounded-full border shadow-sm ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                    }`}>
                      {crTag}
                    </span>
                    <h2 className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {crHeading}
                    </h2>
                    <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full mt-3"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {(db.career || []).filter((job: any) => job.isActive).length === 0 ? (
                      <div className={`col-span-full text-center py-16 rounded-3xl border shadow-sm ${
                        isDarkMode ? 'bg-gray-900/80 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
                      }`}>
                        <p className="text-base md:text-lg font-bold">{t.career.noJobs}</p>
                      </div>
                    ) : (
                      (db.career || []).filter((job: any) => job.isActive).map((job: any) => {
                        const fb = getFallbackContent('career', job.id)
                        const jobTitle = (locale === 'en' && fb?.title) ? fb.title : job.title
                        const jobDesc = (locale === 'en' && fb?.desc) ? fb.desc : job.desc
                        const jobReq = (locale === 'en' && fb?.requirements) ? fb.requirements : job.requirements
                        const jobLoc = (locale === 'en' && fb?.location) ? fb.location : job.location

                        return (
                          <div key={job.id} className={`p-6 sm:p-8 md:p-10 rounded-3xl border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group ${
                            isDarkMode ? 'bg-gray-900/80 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/80 hover:shadow-2xl'
                          }`}>
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
                                  {job.type}
                                </span>
                                <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                                  📍 {jobLoc}
                                </span>
                              </div>
                              <Link href={`/career/${job.id}`}>
                                <h3 className={`text-2xl md:text-3xl font-black transition-colors ${
                                  isDarkMode ? 'text-white group-hover:text-amber-400' : 'text-gray-900 group-hover:text-amber-700'
                                }`}>
                                  {jobTitle}
                                </h3>
                              </Link>
                              <p className={`text-sm sm:text-base leading-relaxed font-medium line-clamp-3 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {jobDesc}
                              </p>
                              <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
                                isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-100'
                              }`}>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                                  {t.career.mainRequirements}
                                </span>
                                <p className={`text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  {jobReq}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <Link
                                href={`/career/${job.id}`}
                                className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black text-center uppercase tracking-wider border transition-all ${
                                  isDarkMode 
                                    ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' 
                                    : 'border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100'
                                }`}
                              >
                                {t.career.viewDetail} &rarr;
                              </Link>
                              <a
                                href={`https://wa.me/${(((footer as any).whatsapp || footer.phone || '')).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  locale === 'en'
                                    ? `Hello PT ESU, I would like to apply for the position: ${jobTitle}`
                                    : `Halo PT ESU, saya ingin melamar pekerjaan untuk posisi: ${jobTitle}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3.5 px-4 rounded-xl text-xs font-black text-center text-white shadow-md transition-all hover:opacity-90 uppercase tracking-wider"
                                style={{ backgroundColor: setting.primaryColor }}
                              >
                                {t.career.applyNow}
                              </a>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {crNote && (
                    <p className="text-xs sm:text-sm text-gray-500 italic text-center">{crNote}</p>
                  )}
                </section>
              )

            case 'gallery':
              return (
                <GallerySectionClient
                  key={sec.id}
                  sec={sec}
                  galleryHeader={galleryHeader}
                  galleries={db.galleries || []}
                  primaryColor={setting.primaryColor}
                />
              )

            case 'contact':
              return (
                <footer
                  key={sec.id}
                  id="contact"
                  className="relative text-white pt-20 pb-12 px-4 sm:px-8 md:px-12 lg:px-20 overflow-hidden rounded-t-[40px] shadow-2xl -mt-6 z-25 w-full font-sans"
                  style={{ backgroundColor: setting.primaryColor }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

                  <div className="relative z-10 space-y-12 w-full max-w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 border-b border-white/15 pb-12 items-center justify-between">

                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-inner">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span className="text-sm sm:text-base font-extrabold tracking-widest uppercase">{setting.siteName}</span>
                        </div>
                        <p className="text-base sm:text-lg md:text-xl text-gray-100 leading-relaxed font-bold tracking-wide text-justify max-w-2xl">
                          {footer.description}
                        </p>
                      </div>

                      <div className="space-y-6 lg:text-right">
                        <h4 className="font-black text-base tracking-widest uppercase text-amber-300">
                          {t.footer.contactInfo}
                        </h4>
                        <div className="space-y-5 text-sm sm:text-base md:text-lg text-gray-100 font-bold tracking-wide lg:flex lg:flex-col lg:items-end">

                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(footer.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 leading-relaxed text-left lg:text-right lg:flex-row-reverse hover:text-amber-300 transition-colors"
                            title={t.footer.addressTitle}
                          >
                            <span className="text-2xl flex-shrink-0">📍</span>
                            <span>{footer.address}</span>
                          </a>

                          <div className="space-y-3 lg:flex lg:flex-col lg:items-end w-full">
                            {/* Wrapper untuk Nomor Telepon & Popover Transparan Melayang di Atasnya */}
                            <div className="relative inline-block text-left lg:text-right" ref={contactRef}>
                              <div
                                onClick={() => setShowContactActions(!showContactActions)}
                                className="flex items-center gap-4 text-left lg:text-right lg:flex-row-reverse cursor-pointer group select-none"
                                title={t.footer.phoneClickTitle}
                              >
                                <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">📞</span>
                                <span className="hover:text-amber-300 transition-colors underline decoration-dotted underline-offset-4">{footer.phone}</span>
                              </div>

                              {/* Popover Menu Melayang dengan Efek Transparan Glassmorphism */}
                              <div className={`absolute bottom-full mb-3 left-0 lg:left-auto lg:right-0 flex items-center gap-3 p-3 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom ${
                                showContactActions 
                                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                                  : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                              }`}>
                                <a
                                  href={`tel:${footer.phone}`}
                                  onClick={() => setShowContactActions(false)}
                                  className="bg-white/10 hover:bg-white/20 px-4.5 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-black text-white flex items-center gap-2 border border-white/15 shadow-sm whitespace-nowrap backdrop-blur-md"
                                  title="Panggil nomor telepon"
                                >
                                  <span>📞</span> {t.footer.call}
                                </a>
                                <a
                                  href={`https://wa.me/${(((footer as any).whatsapp || footer.phone || '')).replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowContactActions(false)}
                                  className="bg-emerald-600/90 hover:bg-emerald-500 px-4.5 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-black text-white flex items-center gap-2 shadow-md whitespace-nowrap backdrop-blur-md border border-emerald-500/30"
                                  title="Chat langsung via WhatsApp"
                                >
                                  <span>💬</span> {t.footer.whatsapp}
                                </a>
                              </div>
                            </div>
                          </div>

                          <a
                            href={`mailto:${footer.email}`}
                            className="flex items-center gap-4 text-left lg:text-right lg:flex-row-reverse hover:text-amber-300 transition-colors"
                            title="Kirim email"
                          >
                            <span className="text-2xl flex-shrink-0">✉️</span>
                            <span>{footer.email}</span>
                          </a>

                        </div>
                      </div>

                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-gray-200 gap-4 font-black tracking-wider uppercase w-full pt-4 border-t border-white/10">
                      <p>© 2026 {setting.siteName}. {t.footer.rightsReserved}</p>

                      {/* LEMBAHTECH CREATOR WATERMARK (HARDCODED IN CODE - DASHBOARD ADMIN TIDAK BISA UBAH) */}
                      <div className="flex items-center gap-2 text-xs font-bold lowercase tracking-normal">
                        <span className="text-gray-300">crafted by</span>
                        <a 
                          href="https://lembahtech.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 font-extrabold uppercase tracking-widest border border-white/25 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          lembahtech
                        </a>
                      </div>

                      <div className="flex items-center gap-6 sm:gap-8">
                        <a href="/#home" className="hover:text-amber-300 transition-colors">{t.footer.privacyPolicy}</a>
                        <a href="/#home" className="hover:text-amber-300 transition-colors">{t.footer.termsOfService}</a>
                      </div>
                    </div>
                  </div>
                </footer>
              )

            default:
              return (
                <section key={sec.id} id={sec.id} className="min-h-screen w-full py-28 px-6 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-4">
                    <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                      }`}>
                      {sec.label}
                    </span>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {sec.title || sec.label}
                    </h2>
                    <div className="w-20 h-1.5 bg-amber-500 rounded-full mt-3"></div>
                  </div>

                  {sec.type === 'text' && (
                    <div className={`p-10 md:p-14 rounded-3xl shadow-xl border space-y-6 ${isDarkMode ? 'bg-gray-900/80 border-gray-800 text-gray-200' : 'bg-white border-gray-100 text-gray-800'
                      }`}>
                      <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line font-medium text-justify">
                        {sec.content || 'Belum ada konten.'}
                      </p>
                    </div>
                  )}

                  {sec.type === 'media' && (
                    <div className="space-y-10">
                      <p className={`text-lg md:text-xl leading-relaxed font-medium text-justify ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {sec.content}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {(sec.items && sec.items.length > 0 ? sec.items : []).map((item: any) => (
                          <div key={item.id} className={`rounded-3xl overflow-hidden shadow-xl border group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200/80'
                            }`}>
                            <div>
                              {item.imageUrl ? (
                                <div className="h-64 overflow-hidden relative bg-black">
                                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                              ) : (
                                <div className="h-64 bg-gray-900 flex items-center justify-center text-white font-bold">
                                  No Image
                                </div>
                              )}
                              <div className="p-8 space-y-4">
                                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                                {item.desc && <p className={`text-base md:text-lg leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'features' && (
                    <div className="space-y-10">
                      <p className={`text-lg md:text-xl leading-relaxed font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {sec.content || 'Poin keunggulan layanan.'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['Integritas Tinggi', 'Profesionalisme Mutlak', 'Kualitas Teruji'].map((feat, idx) => (
                          <div key={idx} className={`p-8 md:p-10 rounded-3xl shadow-xl border-t-4 border-amber-500 space-y-4 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-100'
                            }`}>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-lg border border-amber-500/20">
                              0{idx + 1}
                            </div>
                            <h3 className={`text-xl md:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feat}</h3>
                            <p className={`text-sm md:text-base leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Standar operasional terbaik untuk memastikan pencapaian target korporat klien secara optimal.
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )
          }
        })}

        {/* TOMBOL KONTROL MELAYANG DI POJOK KANAN BAWAH */}
        <div className="fixed bottom-6 right-6 z-50 w-12 h-12 pointer-events-none">

          {/* TOMBOL SCROLL TO TOP (PROPOSIONAL & MENGGUNAKAN DYNAMIC ICON) */}
          <button
            type="button"
            onClick={scrollToTop}
            className={`absolute bottom-0 right-0 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md pointer-events-auto cursor-pointer ${showScrollTop
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
              } ${isDarkMode
                ? 'bg-gray-900/95 text-amber-400 border-gray-700/80 shadow-amber-900/40 hover:bg-gray-800 hover:border-amber-500/50'
                : 'bg-white/95 text-amber-700 border-gray-200 shadow-xl hover:bg-gray-50 hover:border-amber-600/40'
              }`}
            title="Kembali ke atas"
          >
            <DynamicIcon name="ChevronUp" className="w-6 h-6" />
          </button>

          {/* TOMBOL TOGGLE DARK/LIGHT MODE */}
          <button
            type="button"
            onClick={toggleSiteTheme}
            className={`absolute bottom-0 right-0 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md pointer-events-auto cursor-pointer ${showScrollTop ? '-translate-y-[60px]' : 'translate-y-0'
              } ${isDarkMode
                ? 'bg-gray-900/95 text-amber-400 border-gray-700/80 shadow-amber-900/40 hover:bg-gray-800 hover:border-amber-500/50'
                : 'bg-white/95 text-amber-700 border-gray-200 shadow-xl hover:bg-gray-50 hover:border-amber-600/40'
              }`}
            title={isDarkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Malam'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

      </div>
    </div>
  )
}