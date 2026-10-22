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
import { DatabaseContent, SectionConfig, PortfolioItem, CareerItem } from '@/lib/db'
import { MapPin, Phone, Mail, MessageSquare, Sun, Moon, ChevronDown } from 'lucide-react'
import ScheduledContentBanner from '@/components/ScheduledContentBanner'

export default function HomeClient({ db }: { db: DatabaseContent }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showContactActions, setShowContactActions] = useState(false)
  const [showAllPortfolios, setShowAllPortfolios] = useState(false)
  const [showAllCareers, setShowAllCareers] = useState(false)
  const contactRef = useRef<HTMLDivElement>(null)

  // Sinkronisasi tema khusus website publik menggunakan key 'esu_site_theme'
  useEffect(() => {
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('esu_site_theme')
      const dark = savedTheme === 'dark'
      setIsDarkMode(dark)
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    syncTheme()
    window.addEventListener('esu-theme-change', syncTheme)
    return () => window.removeEventListener('esu-theme-change', syncTheme)
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
    window.dispatchEvent(new Event('esu-theme-change'))
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
  const activeSections = (sections || []).filter((sec: SectionConfig) => sec.isVisible)

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
        isDarkMode ? 'bg-black/90' : 'bg-[#F9F8F5]/92'
      }`}></div>

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
          showLeadership={setting.showLeadership !== false}
          showCertifications={setting.showCertifications !== false}
          leadershipLabel={setting.leadershipLabel || 'Profil Pimpinan'}
        />

        {/* RENDER FALLBACK HANYA JIKA SEKSI KONTEN TERJADWAL BELUM ADA SAMA SEKALI DI CONFIG */}
        {!sections.some((s) => s.id === 'scheduled-content' || s.type === 'scheduled-content') && (
          <ScheduledContentBanner contents={db.scheduledContents} />
        )}

        {/* RENDER SECTIONS BERDASARKAN URUTAN DI CMS SECARA FULL SCREEN */}
        {activeSections.map((sec: SectionConfig) => {
          if (sec.id === 'scheduled-content' || sec.type === 'scheduled-content') {
            return (
              <div key={sec.id} id="scheduled-content" className="w-full">
                <ScheduledContentBanner contents={db.scheduledContents} />
              </div>
            )
          }

          switch (sec.id) {
            case 'hero': {
              const showcaseConfig = db.hero?.showcaseCard || sec.showcaseCard
              const isShowcaseActive = showcaseConfig?.enabled !== false

              return (
                <section key={sec.id} id="home" className="min-h-screen w-full relative py-24 md:py-28 px-4 sm:px-8 md:px-20 bg-transparent border-b border-gray-200/10 overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none blur-3xl" style={{ backgroundColor: setting.primaryColor }}></div>

                  <div className={`max-w-7xl mx-auto items-center relative z-10 w-full gap-10 md:gap-14 ${
                    isShowcaseActive ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col max-w-4xl text-center mx-auto'
                  }`}>
                    <div className={`space-y-6 sm:space-y-7 ${!isShowcaseActive ? 'flex flex-col items-center' : ''}`}>
                      {/* Judul Utama Responsif */}
                      <h1 className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] sm:leading-[1.08] ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {heroTitleLine1} <br />
                        <span className="inline-block break-words" style={{ color: setting.primaryColor }}>
                          {heroTitleHighlight}
                        </span>
                      </h1>

                      {/* Deskripsi Hero - Bersih & Tipografi Terbaca Nyaman */}
                      <p className={`text-base sm:text-lg md:text-xl leading-relaxed font-normal max-w-2xl ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {heroDesc}
                      </p>

                      <div className={`flex flex-wrap gap-3.5 sm:gap-4 pt-1 ${!isShowcaseActive ? 'justify-center' : ''}`}>
                        <a
                          href="#services"
                          className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm md:text-base font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 tracking-wide text-center active:scale-95 flex items-center gap-2 group"
                          style={{ backgroundColor: setting.primaryColor }}
                        >
                          <span>{t.hero.exploreServices}</span>
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </a>
                        <a
                          href="#about"
                          className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm md:text-base font-black border transition-all duration-300 shadow-sm tracking-wide text-center active:scale-95 ${
                            isDarkMode
                              ? 'bg-gray-900/80 border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
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
                  showLeadership={setting.showLeadership !== false}
                  showCertifications={setting.showCertifications !== false}
                  leadershipLabel={setting.leadershipLabel || 'Profil Pimpinan'}
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

              const allPortfolios = db.portfolios || []
              const displayedPortfolios = showAllPortfolios ? allPortfolios : allPortfolios.slice(0, 3)

              return (
                <section key={sec.id} id="portfolio" className="min-h-screen w-full py-24 md:py-28 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-3.5 text-center">
                    <span className={`inline-block text-xs md:text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border shadow-sm ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                    }`}>
                      {portTag}
                    </span>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {portHeading}
                    </h2>
                    <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full mt-2.5"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {displayedPortfolios.map((item: PortfolioItem) => {
                      const fb = getFallbackContent('portfolios', item.id)
                      const itemName = (locale === 'en' && fb?.name) ? fb.name : item.name
                      const itemDesc = (locale === 'en' && fb?.desc) ? fb.desc : item.desc

                      return (
                        <div
                          key={item.id}
                          className={`p-6 sm:p-7 rounded-2xl border shadow-sm transition-all duration-300 flex flex-col justify-between space-y-5 group hover:-translate-y-1 hover:shadow-xl ${
                            isDarkMode ? 'bg-[#0E111A] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/90 hover:border-amber-500/40'
                          }`}
                        >
                          {item.imageUrl && (
                            <Link href={`/portfolio/${item.id}`} className="block h-52 sm:h-56 rounded-xl overflow-hidden bg-gray-900 relative">
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
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {itemDesc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <Link
                              href={`/portfolio/${item.id}`}
                              className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-all transform group-hover:translate-x-1"
                            >
                              <span>{t.portfolio.viewDetail}</span>
                              <span>&rarr;</span>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {allPortfolios.length > 3 && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAllPortfolios(!showAllPortfolios)}
                        className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-lg cursor-pointer transform hover:-translate-y-0.5 ${
                          isDarkMode 
                            ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-amber-900/30' 
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-700/20'
                        }`}
                      >
                        <span>
                          {showAllPortfolios 
                            ? 'Tampilkan Lebih Sedikit' 
                            : `Lihat Lebih Banyak (${allPortfolios.length - 3} project lainnya)`}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllPortfolios ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}

                  {portNote && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic text-center">{portNote}</p>
                  )}
                </section>
              )

            case 'career':
              const crTag = (locale === 'en' && !careerHeader?.tag) ? t.career.tag : (careerHeader?.tag || sec.subtitle || t.career.tag)
              const crHeading = (locale === 'en' && !careerHeader?.heading) ? t.career.heading : (careerHeader?.heading || sec.title || t.career.heading)
              const crNote = (locale === 'en' && !careerHeader?.note) ? t.career.note : (careerHeader?.note || '')

              const activeJobs = (db.career || []).filter((job: CareerItem) => job.isActive)
              const displayedCareers = showAllCareers ? activeJobs : activeJobs.slice(0, 2)

              return (
                <section key={sec.id} id="career" className="min-h-screen w-full py-24 md:py-28 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-3.5 text-center">
                    <span className={`inline-block text-xs md:text-sm font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-xl border shadow-sm ${
                      isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                    }`}>
                      {crTag}
                    </span>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {crHeading}
                    </h2>
                    <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full mt-2.5"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {activeJobs.length === 0 ? (
                      <div className={`col-span-full text-center py-16 rounded-2xl border shadow-sm ${
                        isDarkMode ? 'bg-gray-900/80 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-600'
                      }`}>
                        <p className="text-base md:text-lg font-bold">{t.career.noJobs}</p>
                      </div>
                    ) : (
                      displayedCareers.map((job: CareerItem) => {
                        const fb = getFallbackContent('career', job.id)
                        const jobTitle = (locale === 'en' && fb?.title) ? fb.title : job.title
                        const jobDesc = (locale === 'en' && fb?.desc) ? fb.desc : job.desc
                        const jobReq = (locale === 'en' && fb?.requirements) ? fb.requirements : job.requirements
                        const jobLoc = (locale === 'en' && fb?.location) ? fb.location : job.location

                        return (
                          <div key={job.id} className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all duration-300 flex flex-col justify-between space-y-6 group hover:-translate-y-1 hover:shadow-xl ${
                            isDarkMode ? 'bg-[#0E111A] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/90 hover:border-amber-500/40'
                          }`}>
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
                                  {job.type}
                                </span>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span>{jobLoc}</span>
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
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {jobDesc}
                              </p>
                              <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
                                isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-200/80'
                              }`}>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                  {t.career.mainRequirements}
                                </span>
                                <p className={`text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  {jobReq}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2">
                              <Link
                                href={`/career/${job.id}`}
                                className="block w-full py-3.5 px-4 rounded-xl text-xs font-black text-center text-white shadow-md transition-all hover:opacity-90 uppercase tracking-wider"
                                style={{ backgroundColor: setting.primaryColor }}
                              >
                                {t.career.viewDetail} &rarr;
                              </Link>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {activeJobs.length > 2 && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAllCareers(!showAllCareers)}
                        className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-lg cursor-pointer transform hover:-translate-y-0.5 ${
                          isDarkMode 
                            ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-amber-900/30' 
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-700/20'
                        }`}
                      >
                        <span>
                          {showAllCareers 
                            ? 'Tampilkan Lebih Sedikit' 
                            : `Lihat Lebih Banyak (${activeJobs.length - 2} lowongan lainnya)`}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllCareers ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}

                  {crNote && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic text-center">{crNote}</p>
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

                        {/* MEDIA SOSIAL OPSIONAL (POINT 6) */}
                        {footer.socialMedia?.enabled !== false && (footer.socialMedia?.instagram || footer.socialMedia?.linkedin || footer.socialMedia?.facebook || footer.socialMedia?.tiktok || footer.socialMedia?.youtube) && (
                          <div className="pt-2 space-y-3">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                              Media Sosial
                            </span>
                            <div className="flex items-center gap-3 flex-wrap">
                              {footer.socialMedia?.instagram && (
                                <a
                                  href={footer.socialMedia.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-500 hover:text-white border border-white/15 flex items-center justify-center text-gray-200 transition-all duration-300 shadow-sm hover:scale-110"
                                  title="Instagram"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                </a>
                              )}
                              {footer.socialMedia?.linkedin && (
                                <a
                                  href={footer.socialMedia.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#0077b5] hover:text-white border border-white/15 flex items-center justify-center text-gray-200 transition-all duration-300 shadow-sm hover:scale-110"
                                  title="LinkedIn"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                  </svg>
                                </a>
                              )}
                              {footer.socialMedia?.facebook && (
                                <a
                                  href={footer.socialMedia.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#1877f2] hover:text-white border border-white/15 flex items-center justify-center text-gray-200 transition-all duration-300 shadow-sm hover:scale-110"
                                  title="Facebook"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/>
                                  </svg>
                                </a>
                              )}
                              {footer.socialMedia?.tiktok && (
                                <a
                                  href={footer.socialMedia.tiktok}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-black hover:text-white border border-white/15 flex items-center justify-center text-gray-200 transition-all duration-300 shadow-sm hover:scale-110"
                                  title="TikTok"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                  </svg>
                                </a>
                              )}
                              {footer.socialMedia?.youtube && (
                                <a
                                  href={footer.socialMedia.youtube}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#ff0000] hover:text-white border border-white/15 flex items-center justify-center text-gray-200 transition-all duration-300 shadow-sm hover:scale-110"
                                  title="YouTube"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
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
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-amber-300">
                              <MapPin className="w-5 h-5" />
                            </div>
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
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-amber-300 transition-transform duration-300 group-hover:scale-110">
                                  <Phone className="w-5 h-5" />
                                </div>
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
                                  <Phone className="w-4 h-4" /> {t.footer.call}
                                </a>
                                <a
                                  href={`https://wa.me/${(footer.whatsapp || footer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(footer.inquiryTemplates?.waMessage || 'Halo, saya ingin bertanya tentang layanan Anda.')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowContactActions(false)}
                                  className="bg-emerald-600/90 hover:bg-emerald-500 px-4.5 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-black text-white flex items-center gap-2 shadow-md whitespace-nowrap backdrop-blur-md border border-emerald-500/30"
                                  title="Chat langsung via WhatsApp"
                                >
                                  <MessageSquare className="w-4 h-4" /> {t.footer.whatsapp}
                                </a>
                              </div>
                            </div>
                          </div>

                          <a
                            href={`mailto:${footer.email}?subject=${encodeURIComponent(footer.inquiryTemplates?.emailSubject || 'Pertanyaan Layanan')}&body=${encodeURIComponent(footer.inquiryTemplates?.emailBody || 'Halo, saya ingin mendapatkan informasi lebih lanjut...')}`}
                            className="flex items-center gap-4 text-left lg:text-right lg:flex-row-reverse hover:text-amber-300 transition-colors"
                            title="Kirim email"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-amber-300">
                              <Mail className="w-5 h-5" />
                            </div>
                            <span>{footer.email}</span>
                          </a>

                        </div>
                      </div>

                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-gray-200 gap-4 font-black tracking-wider uppercase w-full pt-4 border-t border-white/10">
                      <p>© 2026 {setting.siteName}. {t.footer.rightsReserved}</p>

                      {/* LEMBAHTECH CREATOR WATERMARK (HARDCODED IN CODE - DASHBOARD ADMIN TIDAK BISA UBAH) */}
                      <div className="flex items-center gap-2 text-xs font-bold lowercase tracking-normal select-none">
                        <span className="text-gray-300">crafted by</span>
                        <span className="px-3 py-1 rounded-xl bg-white/15 text-amber-300 font-extrabold uppercase tracking-widest border border-white/25 shadow-sm">
                          lembahtech
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        {setting.showLeadership !== false && (
                          <Link href="/leadership" className="hover:text-amber-300 transition-colors">
                            {setting.leadershipLabel || 'Profil Pimpinan'}
                          </Link>
                        )}
                        {setting.showCertifications !== false && (
                          <Link href="/certifications" className="hover:text-amber-300 transition-colors">
                            Sertifikasi
                          </Link>
                        )}
                        <Link href="/privacy-policy" className="hover:text-amber-300 transition-colors">{t.footer.privacyPolicy}</Link>
                        <Link href="/terms" className="hover:text-amber-300 transition-colors">{t.footer.termsOfService}</Link>
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
                        {(sec.items && sec.items.length > 0 ? sec.items : []).map((item: NonNullable<SectionConfig['items']>[number]) => (
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
                : 'bg-white text-amber-800 border-gray-300 shadow-xl hover:bg-gray-50 hover:border-amber-600/60'
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
                : 'bg-white text-amber-800 border-gray-300 shadow-xl hover:bg-gray-50 hover:border-amber-600/60'
              }`}
            title={isDarkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Malam'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-800" />}
          </button>
        </div>

      </div>
    </div>
  )
}