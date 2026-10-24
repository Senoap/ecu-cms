// app/certifications/CertificationsClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Award, ShieldCheck, Calendar, FileText, Sun, Moon, Maximize2, X, PhoneCall, CheckCircle, Users } from 'lucide-react'
import type { DatabaseContent, CertificationItem } from '@/lib/db'
import { defaultCertificationsPageConfig, type CertificationsPageConfig } from '@/lib/certificationsConstants'
import { openCookieSettings } from '@/lib/cookieConsent'

interface CertificationsClientProps {
  db: DatabaseContent
  certifications: CertificationItem[]
}

export default function CertificationsClient({ db, certifications }: CertificationsClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null)
  const setting = db.setting
  const pageConfig: CertificationsPageConfig = {
    ...defaultCertificationsPageConfig,
    ...(db.certificationsPage || {}),
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

  const activeCerts = certifications
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E17] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* HEADER TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0E17]/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href={pageConfig.backButtonLink || '/'}
            className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group cursor-pointer"
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
          {pageConfig.headerBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{pageConfig.headerBadge}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {pageConfig.headerTitle || 'Sertifikasi & Izin Operasional Resmi'}
          </h1>
          {pageConfig.headerDesc && (
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              {pageConfig.headerDesc.replace('{company}', setting.siteName)}
            </p>
          )}
          <div className="w-16 h-1 mx-auto rounded-full mt-4" style={{ backgroundColor: setting.primaryColor || '#6B0808' }}></div>
        </div>

        {/* GRID SERTIFIKASI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeCerts.map((cert) => {
            const watermark = cert.watermarkText || `${setting.siteName} • DOKUMEN RESMI • TIDAK UNTUK DIKANDANGKAN`
            
            return (
              <div
                key={cert.id}
                className="bg-white dark:bg-[#10131C] rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 group"
              >
                <div>
                  {/* GAMBAR DOKUMEN SERTIFIKAT DENGAN WATERMARK OVERLAY (POINT 2) */}
                  <div 
                    className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-900 cursor-pointer select-none group/img"
                    onClick={() => setSelectedCert(cert)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 pointer-events-none select-none"
                    />

                    {/* OVERLAY WATERMARK DIAGONAL REPEATING */}
                    <div 
                      className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden opacity-40 mix-blend-difference"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='120px' width='360px'><text transform='translate(20, 100) rotate(-28)' fill='white' font-size='10' font-family='sans-serif' font-weight='900' letter-spacing='2'>${encodeURIComponent(watermark)}</text></svg>")`,
                        backgroundRepeat: 'repeat',
                      }}
                    />

                    {/* BADGE WATERMARK PROTECTED */}
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[9px] font-black tracking-widest text-amber-400 uppercase px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5 shadow-lg">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>Watermark Dilindungi</span>
                    </div>

                    {/* TOMBOL ZOOM PREVIEW */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-2xl bg-white/90 text-gray-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xl backdrop-blur-md transform scale-95 group-hover/img:scale-100 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Pratinjau Dokumen</span>
                      </span>
                    </div>
                  </div>

                  {/* DETAIL INFORMASI SERTIFIKASI */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 inline-block">
                        {cert.issuer}
                      </span>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                        {cert.title}
                      </h2>
                    </div>

                    {cert.certNumber && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-mono text-[11px] truncate">No: {cert.certNumber}</span>
                      </div>
                    )}

                    {cert.desc && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-justify">
                        {cert.desc}
                      </p>
                    )}

                    {(cert.issueDate || cert.expiryDate) && (
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Terbit: {cert.issueDate || '-'}</span>
                        </div>
                        {cert.expiryDate && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            s.d {cert.expiryDate}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER KARTU */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Terverifikasi Aktif</span>
                  </span>
                  <span className="text-amber-500 font-black">{setting.siteName}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* BANNER INFORMASI KEASLIAN DOKUMEN - Desain Korporat Elegan Selaras */}
        {pageConfig.showProtectionCard !== false && (
          <div
            className="bg-white dark:bg-[#0E111A] text-gray-900 dark:text-white p-8 sm:p-10 md:p-12 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xl space-y-6 relative overflow-hidden transition-all duration-300 border-l-8"
            style={{ borderLeftColor: setting.primaryColor || '#6B0808' }}
          >
            <div className="relative z-10 max-w-3xl space-y-4">
              {pageConfig.protectionBadge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-200/80 dark:border-amber-800/40">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{pageConfig.protectionBadge}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {pageConfig.protectionTitle || 'Verifikasi & Validasi Dokumen Legal Perusahaan'}
              </h2>
              {pageConfig.protectionDesc && (
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium text-justify">
                  {pageConfig.protectionDesc.replace('{company}', setting.siteName)}
                </p>
              )}
            </div>

            <div className="relative z-10 pt-4 flex flex-wrap gap-4 items-center">
              {pageConfig.protectionCtaText && (
                <Link
                  href={pageConfig.protectionCtaLink || '/#contact'}
                  className="px-6 py-3.5 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: setting.primaryColor || '#6B0808' }}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{pageConfig.protectionCtaText}</span>
                </Link>
              )}
              {pageConfig.protectionShowLeadershipBtn !== false && setting.showLeadership !== false && (
                <Link
                  href={pageConfig.protectionLeadershipLink || '/leadership'}
                  className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs uppercase tracking-wider border border-gray-300 dark:border-gray-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>{pageConfig.protectionLeadershipText || `Lihat ${setting.leadershipLabel || 'Profil Pimpinan'}`}</span>
                </Link>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL PRATINJAU DOKUMEN SERTIFIKAT DENGAN WATERMARK PENUH */}
      {selectedCert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div 
            className="bg-gray-950 text-white w-full max-w-4xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{selectedCert.title}</h3>
                <p className="text-xs text-amber-400 font-bold">{selectedCert.issuer} {selectedCert.certNumber && `• No: ${selectedCert.certNumber}`}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Gambar dengan Watermark Padat */}
            <div className="relative flex-1 overflow-auto bg-black p-4 flex items-center justify-center select-none">
              <div className="relative max-w-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src={selectedCert.imageUrl}
                  alt={selectedCert.title}
                  className="max-h-[68vh] w-auto object-contain pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* OVERLAY WATERMARK DIAGONAL REPEATING */}
                <div 
                  className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden opacity-50 mix-blend-difference"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='130px' width='380px'><text transform='translate(20, 110) rotate(-28)' fill='white' font-size='12' font-family='sans-serif' font-weight='900' letter-spacing='2'>${encodeURIComponent(selectedCert.watermarkText || `${setting.siteName} • DOKUMEN RESMI RESMI`)}</text></svg>")`,
                    backgroundRepeat: 'repeat',
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-900/90 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Dokumen Resmi Terverifikasi Watermark {setting.siteName}</span>
              </span>
              <span>Dilarang menyebarluaskan dokumen tanpa izin tertulis korporat.</span>
            </div>
          </div>
        </div>
      )}

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
