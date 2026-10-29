// app/services/[id]/ServiceDetailClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Mail, Sun, Moon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'
import type { ServiceItem, DatabaseContent, FooterContent } from '@/lib/db'
import { formatWhatsAppNumber } from '@/lib/phone'
import { openCookieSettings } from '@/lib/cookieConsent'

export default function ServiceDetailClient({
  srv,
  setting,
  footer
}: {
  srv: ServiceItem
  setting: DatabaseContent['setting']
  footer: FooterContent
}) {
  const { t } = useLanguage()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sinkronisasi tema dengan document.documentElement & event esu-theme-change
  useEffect(() => {
    const syncTheme = () => {
      const dark = document.documentElement.classList.contains('dark') || localStorage.getItem('esu_site_theme') === 'dark'
      setIsDarkMode(dark)
    }
    syncTheme()
    window.addEventListener('esu-theme-change', syncTheme)
    return () => window.removeEventListener('esu-theme-change', syncTheme)
  }, [])

  const toggleSiteTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    localStorage.setItem('esu_site_theme', next ? 'dark' : 'light')
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    window.dispatchEvent(new Event('esu-theme-change'))
  }

  const title = srv.title
  const desc = srv.desc
  const content = srv.content || srv.desc

  const companyName = setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  const waNumber = formatWhatsAppNumber(footer?.whatsapp || footer?.phone)

  // Template WA diambil dari CMS (Menu Kontak & Footer) dengan dukungan variabel dinamis {layanan} dan {perusahaan}
  const rawWaTemplate = footer?.inquiryTemplates?.waMessage || 
    `Halo Tim {perusahaan},\n\nSaya ingin berkonsultasi mengenai layanan: *{layanan}*.\n\nMohon informasi mengenai ruang lingkup operasional, kualifikasi penempatan personel, dan penawaran kerjasamanya.\n\nTerima kasih.`

  const parsedWaText = rawWaTemplate
    .replace(/{layanan}|{service}/gi, title)
    .replace(/{company}|{perusahaan}/gi, companyName)

  const finalWaText = parsedWaText.includes(title) 
    ? parsedWaText 
    : `${parsedWaText}\n\n(Layanan yang ditanyakan: *${title}*)`

  const waMessage = encodeURIComponent(finalWaText)

  const emailRecipient = footer?.email || 'manpower.services@empatsinergiumata.com'
  
  // Template Subjek Email dari CMS dengan variabel dinamis
  const rawEmailSubject = footer?.inquiryTemplates?.emailSubject || 
    `Konsultasi Layanan: {layanan} - [Nama Perusahaan]`

  const parsedEmailSubject = rawEmailSubject
    .replace(/{layanan}|{service}/gi, title)
    .replace(/{company}|{perusahaan}/gi, companyName)

  const finalEmailSubject = parsedEmailSubject.includes(title)
    ? parsedEmailSubject
    : `${parsedEmailSubject} - ${title}`

  const emailSubject = encodeURIComponent(finalEmailSubject)

  // Template Isi Pesan Email dari CMS dengan variabel dinamis
  const rawEmailBody = footer?.inquiryTemplates?.emailBody ||
    `Kepada Yth. Tim Konsultan {perusahaan},\n\n` +
    `Kami tertarik untuk berkonsultasi lebih lanjut mengenai layanan:\n` +
    `Layanan: {layanan}\n\n` +
    `Berikut ringkasan kebutuhan awal kami:\n` +
    `• Nama Perusahaan / Instansi : \n` +
    `• Kontak Person (Nama & HP) : \n` +
    `• Lokasi Penempatan Operasional: \n` +
    `• Estimasi Jumlah Personel / Volume: \n` +
    `• Catatan Kebutuhan Khusus   : \n\n` +
    `Mohon informasi mengenai proposal penawaran, proses kerja sama, atau jadwal pertemuan/survei lokasi.\n\n` +
    `Terima kasih.\n\n` +
    `Hormat kami,\n` +
    `[Nama Anda / Jabatan]`

  const parsedEmailBody = rawEmailBody
    .replace(/{layanan}|{service}/gi, title)
    .replace(/{company}|{perusahaan}/gi, companyName)

  const finalEmailBody = parsedEmailBody.includes(title)
    ? parsedEmailBody
    : `Layanan yang ditanyakan: ${title}\n\n${parsedEmailBody}`

  const emailBody = encodeURIComponent(finalEmailBody)

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#090A0F] text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
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
        showCompro={setting.showCompro !== false}
        leadershipLabel={setting.leadershipLabel || 'Profil Pimpinan'}
      />

      <main className="max-w-5xl mx-auto pt-24 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 md:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/#services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:underline tracking-wide"
          >
            <span>&larr;</span>
            <span>{t.common.backToHome}</span>
          </Link>
        </div>

        {/* Hero Header Layanan */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <DynamicIcon name={srv.icon} className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <span className="inline-block text-xs font-black tracking-widest text-amber-700 dark:text-amber-300 uppercase bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
            {t.services.corporateDetail}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Scope & Description Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 md:p-14 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {t.services.scopeAndContent}
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line text-justify font-medium">
            {content}
          </p>
        </div>

        {/* Galeri Dokumentasi Proyek */}
        {srv.images && srv.images.length > 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {t.services.projectDocs}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {srv.images.length} {t.gallery.photoCount}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {srv.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(img)}
                  className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-gray-950 h-64 relative group cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Dokumentasi ${title} ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                    {t.gallery.viewDetail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KONSULTASI LAYANAN (MINIMALIS & PROFESIONAL) */}
        <div className="bg-white dark:bg-[#10131C] border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Sisi Kiri: Informasi Singkat & Elegan */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Konsultasi & Penawaran Resmi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Diskusikan Kebutuhan {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Dapatkan proposal kerja sama resmi, survei lokasi operasional, dan estimasi penempatan tenaga kerja profesional dari tim konsultan kami.
              </p>
            </div>

            {/* Sisi Kanan: Opsi WhatsApp & Email yang Selaras & Elegan */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white transition-all duration-300 hover:opacity-90 active:scale-95 shadow-sm"
                  style={{ backgroundColor: '#25D366' }}
                  title="Konsultasi langsung via WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Konsultasi WhatsApp</span>
                </a>
              )}

              {emailRecipient && (
                <a
                  href={`mailto:${emailRecipient}?subject=${emailSubject}&body=${emailBody}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold border transition-all duration-300 active:scale-95 shadow-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  title="Kirim permohonan via Email"
                >
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Kirim Email</span>
                </a>
              )}
            </div>

          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto py-8 px-4 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-semibold gap-3">
        <span>© 2026 {setting.siteName}. All Rights Reserved.</span>
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
        
      </footer>

      {/* Modal Zoom Foto */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full rounded-2xl overflow-hidden">
            <img src={selectedPhoto} alt="Zoom" className="w-full h-full object-contain mx-auto" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TOMBOL KONTROL MELAYANG DI POJOK KANAN BAWAH */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={toggleSiteTheme}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            isDarkMode
              ? 'bg-gray-900/95 text-amber-400 border-gray-700/80 shadow-amber-900/40 hover:bg-gray-800 hover:border-amber-500/50'
              : 'bg-white text-amber-800 border-gray-300 shadow-xl hover:bg-gray-50 hover:border-amber-600/60'
          }`}
          title={isDarkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Malam'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-800" />}
        </button>
      </div>
    </div>
  )
}
