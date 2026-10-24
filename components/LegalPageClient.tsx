// components/LegalPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, FileText, Calendar, Moon, Sun } from 'lucide-react'
import type { DatabaseContent, LegalContent } from '@/lib/db'
import { openCookieSettings } from '@/lib/cookieConsent'

interface LegalPageClientProps {
  db: DatabaseContent
  legal: LegalContent
  type: 'privacy' | 'terms'
}

export default function LegalPageClient({ db, legal, type }: LegalPageClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const setting = db.setting

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

  // Pisahkan konten berdasarkan baris baru menjadi paragraf-paragraf rapi
  const paragraphs = legal.content.split('\n\n').filter((p) => p.trim().length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E17] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* HEADER TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0E17]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Kembali ke Beranda</span>
          </Link>

          <Link href="/" className="flex items-center gap-3">
            {setting.logoUrl ? (
              <img 
                src={setting.logoUrl} 
                alt={setting.siteName} 
                className="h-8 md:h-10 w-auto object-contain max-h-8 md:max-h-10 max-w-[140px]" 
                style={{ maxHeight: '40px', width: 'auto' }}
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-sm"
                style={{ backgroundColor: setting.primaryColor || '#7E1D0C' }}
              >
                4SU
              </div>
            )}
            <span className="hidden sm:inline font-black text-xs md:text-sm tracking-wide text-gray-900 dark:text-white">
              {setting.siteName}
            </span>
          </Link>
        </div>
      </header>

      {/* MAIN DOCUMENT BODY */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex-1">
        
        {/* DOCUMENT HEADER */}
        <div className="space-y-4 text-center pb-10 border-b border-gray-200 dark:border-gray-800">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
            {type === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>Dokumen Resmi Perusahaan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {legal.title}
          </h1>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Pembaruan Terakhir: {legal.lastUpdated}</span>
          </div>

          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-2"></div>
        </div>

        {/* DOCUMENT TEXT CONTENT */}
        <article className="mt-10 bg-white dark:bg-[#10131C] p-6 sm:p-10 md:p-14 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6 text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
          {paragraphs.map((para, index) => {
            const trimmed = para.trim()
            // Jika heading pasal/poin numerik
            const isHeading = /^[0-9]+\.\s+[A-Za-z]/.test(trimmed)
            if (isHeading) {
              const lines = trimmed.split('\n')
              const headingText = lines[0]
              const bodyLines = lines.slice(1).join('\n')
              return (
                <div key={index} className="space-y-2 pt-4 first:pt-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-950 dark:text-white tracking-tight text-amber-700 dark:text-amber-400">
                    {headingText}
                  </h2>
                  {bodyLines && (
                    <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                      {bodyLines}
                    </p>
                  )}
                </div>
              )
            }

            return (
              <p key={index} className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                {trimmed}
              </p>
            )
          })}
        </article>

        {/* FOOTNOTE CONTACT */}
        <div className="mt-10 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-gray-900 dark:text-white">Ada pertanyaan terkait ketentuan ini?</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Hubungi tim kepatuhan kami melalui email resmi perusahaan.</p>
          </div>
          <a
            href={`mailto:${db.footer?.email || 'manpower.services@empatsinergiumata.com'}`}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-sm hover:scale-105 active:scale-95"
          >
            Hubungi Kami
          </a>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200/80 dark:border-gray-800/80 py-8 px-4 bg-white/60 dark:bg-[#0B0E17]/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-bold gap-4">
          <p>© 2026 {setting.siteName}. All Rights Reserved.</p>
          
          <div className="flex items-center gap-2 select-none text-[11px]">
            <span>crafted by</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">
              lembahtech
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Syarat & Ketentuan</Link>
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

      {/* FLOATING DARK MODE BUTTON */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white dark:bg-gray-900 text-gray-800 dark:text-amber-300 shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </button>

    </div>
  )
}
