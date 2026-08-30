// components/HomeClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import ServicesSectionClient from '@/components/ServicesSectionClient'
import AboutSectionClient from '@/components/AboutSectionClient'
import GallerySectionClient from '@/components/GallerySectionClient'
import { DynamicIcon } from '@/components/DynamicIcon'

export default function HomeClient({ db }: { db: any }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

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

  // Event listener untuk memantau posisi scroll halaman
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  const { setting, hero, about, servicesHeader, portfolioHeader, careerHeader, galleryHeader, footer, sections } = db
  const activeSections = (sections || []).filter((sec: any) => sec.isVisible)

  return (
    <div
      className={`min-h-screen font-sans selection:bg-amber-500/20 selection:text-amber-400 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#090A0F] text-gray-100' : 'bg-[#F8F7F4] text-gray-800'
        }`}
      style={setting.bgImageUrl ? {
        backgroundImage: `url(${setting.bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : { backgroundColor: isDarkMode ? '#090A0F' : '#F8F7F4' }}
    >
      {/* Overlay Tipis agar teks tetap kontras terbaca di atas background foto */}
      <div className={`absolute inset-0 pointer-events-none fixed z-0 ${isDarkMode ? 'bg-black/85' : 'bg-[#F8F7F4]/90'
        } backdrop-blur-[1px]`}></div>

      <div className="relative z-10">
        {/* 1. NAVBAR */}
        <Navbar
          siteName={setting.siteName}
          tagline={setting.tagline}
          primaryColor={setting.primaryColor}
          logoUrl={setting.logoUrl}
        />

        {/* RENDER SECTIONS BERDASARKAN URUTAN DI CMS SECARA FULL SCREEN */}
        {activeSections.map((sec: any) => {
          switch (sec.id) {
            case 'hero':
              return (
                <section key={sec.id} id="home" className="min-h-screen w-full relative py-28 px-6 md:px-20 bg-transparent border-b border-gray-200/10 overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none blur-3xl" style={{ backgroundColor: setting.primaryColor }}></div>

                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 w-full">
                    <div className="space-y-6">
                      <div className={`inline-flex items-center gap-2.5 px-4 py-2 backdrop-blur-sm border rounded-full text-xs md:text-sm font-extrabold tracking-wider shadow-sm ${isDarkMode ? 'bg-gray-900/80 border-amber-500/30 text-amber-400' : 'bg-amber-50/90 border-amber-200/80 text-amber-800'
                        }`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>{hero.badge}</span>
                      </div>

                      {/* Judul Utama Diperbesar */}
                      <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {hero.titleLine1} <br />
                        <span className="underline decoration-amber-500/30 decoration-wavy" style={{ color: setting.primaryColor }}>
                          {hero.titleHighlight}
                        </span>
                      </h1>

                      {/* Deskripsi Hero Diperbesar */}
                      <p className={`text-base md:text-lg lg:text-xl leading-relaxed font-medium max-w-2xl backdrop-blur-sm p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-300' : 'bg-white/60 border-gray-200/60 text-gray-700'
                        }`}>
                        {hero.description}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <a
                          href="#services"
                          className="px-8 py-4 rounded-xl text-sm md:text-base font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 tracking-wide"
                          style={{ backgroundColor: setting.primaryColor }}
                        >
                          EXPLORE OUR SERVICES &rarr;
                        </a>
                        <a
                          href="#about"
                          className={`px-8 py-4 rounded-xl text-sm md:text-base font-black backdrop-blur-sm border transition-all duration-300 shadow-sm tracking-wide ${isDarkMode
                              ? 'bg-gray-900/80 border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                              : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                          WHO WE ARE
                        </a>
                      </div>
                    </div>

                    <div className="relative h-80 md:h-[480px] rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center group">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="relative z-10 text-center p-8 space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
                          🏢
                        </div>
                        <h3 className="text-white font-extrabold text-2xl tracking-wide">{setting.siteName}</h3>
                        <p className="text-gray-300 text-sm md:text-base tracking-widest uppercase font-bold">{setting.tagline}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )

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
                />
              )

            case 'portfolio':
              return (
                <section key={sec.id} id="portfolio" className="min-h-screen w-full py-28 px-6 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-4 text-center">
                    <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                      }`}>
                      {portfolioHeader.tag}
                    </span>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {portfolioHeader.heading}
                    </h2>
                    <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full mt-3"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(db.portfolios || []).map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-8 rounded-3xl border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group ${isDarkMode ? 'bg-gray-900/80 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/80 hover:shadow-2xl'
                          }`}
                      >
                        {item.imageUrl && (
                          <div className="h-56 rounded-2xl overflow-hidden bg-gray-900 relative">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </div>
                        )}
                        <div className="space-y-3 flex-1">
                          <h3 className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white group-hover:text-amber-400' : 'text-gray-900 group-hover:text-amber-700'
                            }`}>
                            {item.name}
                          </h3>
                          <p className={`text-base md:text-lg leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {portfolioHeader?.note && (
                    <p className="text-sm text-gray-500 italic text-center">{portfolioHeader.note}</p>
                  )}
                </section>
              )

            case 'career':
              return (
                <section key={sec.id} id="career" className="min-h-screen w-full py-28 px-6 md:px-20 max-w-7xl mx-auto flex flex-col justify-center space-y-12">
                  <div className="space-y-4 text-center">
                    <span className={`inline-block text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200/60 text-amber-800'
                      }`}>
                      {careerHeader?.tag || sec.subtitle}
                    </span>
                    <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {careerHeader?.heading || sec.title}
                    </h2>
                    <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full mt-3"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(db.career || []).filter((job: any) => job.isActive).length === 0 ? (
                      <div className={`col-span-full text-center py-16 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-gray-900/80 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
                        }`}>
                        <p className="text-base md:text-lg font-bold">Belum ada lowongan pekerjaan aktif saat ini.</p>
                      </div>
                    ) : (
                      (db.career || []).filter((job: any) => job.isActive).map((job: any) => (
                        <div key={job.id} className={`p-8 md:p-10 rounded-3xl border shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group ${isDarkMode ? 'bg-gray-900/80 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/80 hover:shadow-2xl'
                          }`}>
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
                                {job.type}
                              </span>
                              <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                                📍 {job.location}
                              </span>
                            </div>
                            <h3 className={`text-2xl md:text-3xl font-black transition-colors ${isDarkMode ? 'text-white group-hover:text-amber-400' : 'text-gray-900 group-hover:text-amber-700'
                              }`}>
                              {job.title}
                            </h3>
                            <p className={`text-base md:text-lg leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {job.desc}
                            </p>
                            <div className={`p-5 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50 border-gray-100'
                              }`}>
                              <span className="text-xs font-black uppercase tracking-wider text-amber-500">Persyaratan Utama:</span>
                              <p className={`text-sm md:text-base font-medium leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {job.requirements}
                              </p>
                            </div>
                          </div>

                          <a
                            href="#contact"
                            className="w-full py-4 rounded-xl text-sm md:text-base font-black text-center text-white shadow-md transition-all duration-300 hover:opacity-90 uppercase tracking-wider"
                            style={{ backgroundColor: setting.primaryColor }}
                          >
                            Lamar Sekarang &rarr;
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                  {careerHeader?.note && (
                    <p className="text-sm text-gray-500 italic text-center">{careerHeader.note}</p>
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
                  className="relative text-white pt-20 pb-12 px-8 md:px-20 lg:px-28 overflow-hidden rounded-t-[40px] shadow-2xl -mt-6 z-25 w-full font-sans"
                  style={{ backgroundColor: setting.primaryColor }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

                  <div className="relative z-10 space-y-12 w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-white/15 pb-12 items-center justify-between">

                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-inner">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span className="text-base font-extrabold tracking-widest uppercase">{setting.siteName}</span>
                        </div>
                        <p className="text-lg md:text-xl text-gray-100 leading-relaxed font-bold tracking-wide text-justify max-w-2xl">
                          {footer.description}
                        </p>
                      </div>

                      <div className="space-y-6 lg:text-right">
                        <h4 className="font-black text-base tracking-widest uppercase text-amber-300">
                          Contact Information
                        </h4>
                        <div className="space-y-6 text-base md:text-lg text-gray-100 font-bold tracking-wide lg:flex lg:flex-col lg:items-end">

                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(footer.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 leading-relaxed text-right flex-row-reverse hover:text-amber-300 transition-colors"
                            title="Buka alamat di Google Maps"
                          >
                            <span className="text-2xl flex-shrink-0">📍</span>
                            <span>{footer.address}</span>
                          </a>

                          <div className="space-y-3 lg:flex lg:flex-col lg:items-end">
                            <div className="flex items-center gap-4 text-right flex-row-reverse">
                              <span className="text-2xl flex-shrink-0">📞</span>
                              <span>{footer.phone}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1 justify-end">
                              <a
                                href={`tel:${footer.phone}`}
                                className="bg-white/15 hover:bg-white/25 px-4.5 py-2 rounded-xl transition-all text-sm font-black text-white flex items-center gap-2 border border-white/20 shadow-sm"
                                title="Panggil nomor telepon"
                              >
                                <span>📞</span> Panggil
                              </a>
                              <a
                                href={`https://wa.me/${(((footer as any).whatsapp || footer.phone)).replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-500 px-4.5 py-2 rounded-xl transition-all text-sm font-black text-white flex items-center gap-2 shadow-md"
                                title="Chat langsung via WhatsApp"
                              >
                                <span>💬</span> WhatsApp
                              </a>
                            </div>
                          </div>

                          <a
                            href={`mailto:${footer.email}`}
                            className="flex items-center gap-4 text-right flex-row-reverse hover:text-amber-300 transition-colors"
                            title="Kirim email"
                          >
                            <span className="text-2xl flex-shrink-0">✉️</span>
                            <span>{footer.email}</span>
                          </a>

                        </div>
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between text-sm md:text-base text-gray-200 gap-4 font-black tracking-wider uppercase w-full">
                      <p>© 2026 {setting.siteName}. All Rights Reserved.</p>
                      <div className="flex items-center gap-8">
                        <a href="#home" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
                        <a href="#home" className="hover:text-amber-300 transition-colors">Terms of Service</a>
                        <a href="/admin" className="hover:text-amber-300 transition-colors">CMS Admin</a>
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