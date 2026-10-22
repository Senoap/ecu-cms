// app/leadership/LeadershipClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, GraduationCap, Briefcase, Award, ShieldCheck, Sun, Moon, PhoneCall } from 'lucide-react'
import type { DatabaseContent, DirectorItem } from '@/lib/db'

interface LeadershipClientProps {
  db: DatabaseContent
  directors: DirectorItem[]
}

export default function LeadershipClient({ db, directors }: LeadershipClientProps) {
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

  const activeDirectors = directors
    .filter((d) => d.isVisible !== false)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E17] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* HEADER TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0E17]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
            className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-amber-400 hover:scale-105 transition-all shadow-sm"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Pimpinan & Pengelola Operasional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Profil Pimpinan & Tim Manajemen
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
            Mengenal tim pengelola dan pimpinan di balik komitmen mutu pelayanan prima, integritas kerja, dan tata kelola ketenagakerjaan terpercaya {setting.siteName}.
          </p>
          <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full mt-4"></div>
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
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-gray-950 shadow-md">
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

              {/* FOOTER KARTU */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                <span>Manajemen Eksekutif</span>
                <span className="text-amber-500 font-extrabold">{setting.siteName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* KOTAK KOMITMEN TATA KELOLA (GCG) */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950 text-white p-8 sm:p-10 md:p-12 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>Prinsip Good Corporate Governance (GCG)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Integritas, Transparansi, dan Akuntabilitas Tanpa Kompromi
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium text-justify">
              Pimpinan dan segenap tim manajemen {setting.siteName} senantiasa memegang teguh kepatuhan terhadap regulasi ketenagakerjaan Republik Indonesia (UU Ketenagakerjaan & UU Cipta Kerja), jaminan perlindungan BPJS Ketenagakerjaan dan Kesehatan seluruh personel, serta ketepatan sistem penggajian yang transparan untuk menjaga reputasi dan stabilitas operasional mitra.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap gap-4 items-center">
            <Link
              href="/#contact"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Konsultasi Kemitraan</span>
            </Link>
            {setting.showCertifications !== false && (
              <Link
                href="/certifications"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Lihat Sertifikasi Perusahaan</span>
              </Link>
            )}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-[#0B0E17]/50 backdrop-blur-md py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} {setting.siteName}. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  )
}
