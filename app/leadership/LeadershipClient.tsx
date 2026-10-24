// app/leadership/LeadershipClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, GraduationCap, Briefcase, Award, ShieldCheck, Sun, Moon, PhoneCall } from 'lucide-react'
import type { DatabaseContent, DirectorItem } from '@/lib/db'
import { defaultLeadershipPageConfig, type LeadershipPageConfig } from '@/lib/leadershipConstants'
import { openCookieSettings } from '@/lib/cookieConsent'

interface LeadershipClientProps {
  db: DatabaseContent
  directors: DirectorItem[]
}

export default function LeadershipClient({ db, directors }: LeadershipClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const setting = db.setting
  const pageConfig: LeadershipPageConfig = {
    ...defaultLeadershipPageConfig,
    ...(db.leadershipPage || {}),
  }

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    queueMicrotask(() => setIsDarkMode(isDark))
  }, [])

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('esu_site_theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('esu_site_theme', 'dark')
      setIsDarkMode(true)
    }
  }

  const activeDirectors = directors
    .filter((d) => d.isVisible !== false)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E17] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 flex flex-col justify-between selection:bg-primary selection:text-white">

      {/* HEADER TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0E17]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href={pageConfig.backButtonLink || '/'}
            className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>{pageConfig.backButtonText || 'Kembali ke Beranda'}</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            {setting.logoUrl ? (
              <img
                src={setting.logoUrl}
                alt={setting.siteName}
                className="h-8 md:h-10 w-auto object-contain max-h-8 md:max-h-10 max-w-[140px]"
              />
            ) : (
              <span className="font-black text-lg text-gray-900 dark:text-white tracking-wider">
                {setting.siteName}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-primary hover:scale-105 transition-all shadow-sm"
            title="Ganti Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-1 w-full space-y-16">

        {/* BANNER HEADER */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {pageConfig.headerBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Users className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{pageConfig.headerBadge}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {pageConfig.headerTitle || 'Profil Pimpinan & Tim Manajemen'}
          </h1>
          {pageConfig.headerDesc && (
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              {pageConfig.headerDesc.replace('{company}', setting.siteName)}
            </p>
          )}
          <div className="w-16 h-1 mx-auto rounded-full mt-4" style={{ backgroundColor: setting.primaryColor || '#6B0808' }}></div>
        </div>

        {/* DAFTAR DIREKSI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeDirectors.map((director) => (
            <div
              key={director.id}
              className="bg-white dark:bg-[#10131C] rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 group"
            >
              <div>
                {/* FOTO DIREKTUR */}
                <div className="relative h-72 w-full overflow-hidden bg-gray-900">
                  {director.photoUrl ? (
                    <img
                      src={director.photoUrl}
                      alt={director.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                      <Users className="w-16 h-16 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* BADGE JABATAN */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-md">
                      {director.position}
                    </span>
                  </div>
                </div>

                {/* DETAIL INFORMASI */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                      {director.name}
                    </h2>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">
                      {director.position}
                    </p>
                  </div>

                  {/* BIO / NARASI */}
                  {director.bio && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-justify">
                      {director.bio}
                    </p>
                  )}

                  {/* PENDIDIKAN */}
                  {director.education && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Latar Belakang Akademis</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {director.education}
                      </p>
                    </div>
                  )}

                  {/* PENGALAMAN & REKAM JEJAK */}
                  {director.experiences && director.experiences.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                        <span>Keahlian & Rekam Jejak</span>
                      </div>
                      <ul className="space-y-1.5">
                        {director.experiences.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                            <span className="text-amber-500 font-bold shrink-0">✓</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KOTAK KOMITMEN TATA KELOLA (GCG) - Desain Korporat Elegan Selaras */}
        {pageConfig.showGcgCard !== false && (
          <div
            className="bg-white dark:bg-[#0E111A] text-gray-900 dark:text-white p-8 sm:p-10 md:p-12 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xl space-y-6 relative overflow-hidden transition-all duration-300 border-l-8"
            style={{ borderLeftColor: setting.primaryColor || '#6B0808' }}
          >
            <div className="relative z-10 max-w-3xl space-y-4">
              {pageConfig.gcgBadge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-200/80 dark:border-amber-800/40">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{pageConfig.gcgBadge}</span>
                </div>
              )}
              {pageConfig.gcgTitle && (
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  {pageConfig.gcgTitle}
                </h2>
              )}
              {pageConfig.gcgDesc && (
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium text-justify">
                  {pageConfig.gcgDesc.replace('{company}', setting.siteName)}
                </p>
              )}
            </div>

            <div className="relative z-10 pt-4 flex flex-wrap gap-4 items-center">
              {pageConfig.gcgCtaText && (
                <Link
                  href={pageConfig.gcgCtaLink || '/#contact'}
                  className="px-6 py-3.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: setting.primaryColor || '#6B0808' }}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{pageConfig.gcgCtaText}</span>
                </Link>
              )}
              {pageConfig.gcgShowCertBtn !== false && setting.showCertifications !== false && (
                <Link
                  href={pageConfig.gcgCertLink || '/certifications'}
                  className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs uppercase tracking-wider border border-gray-300 dark:border-gray-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{pageConfig.gcgCertText || 'Lihat Sertifikasi Perusahaan'}</span>
                </Link>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-[#0B0E17]/50 backdrop-blur-md py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} {setting.siteName}. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              Pengaturan Cookie
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}
