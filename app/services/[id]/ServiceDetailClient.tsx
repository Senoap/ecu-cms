// app/services/[id]/ServiceDetailClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'
import { ServiceItem } from '@/lib/db'

export default function ServiceDetailClient({
  srv,
  setting,
  footer
}: {
  srv: ServiceItem
  setting: any
  footer: any
}) {
  const { locale, t, getFallbackContent } = useLanguage()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const fb = getFallbackContent('services', srv.id)
  const title = (locale === 'en' && fb?.title) ? fb.title : srv.title
  const desc = (locale === 'en' && fb?.desc) ? fb.desc : srv.desc
  const content = (locale === 'en' && fb?.content) ? fb.content : (srv.content || srv.desc)

  const waNumber = (footer?.whatsapp || footer?.phone || '').replace(/[^0-9]/g, '')
  const waMessage = encodeURIComponent(
    locale === 'en'
      ? `Hello PT ESU, I would like to inquire about the service: ${title}`
      : `Halo PT ESU, saya ingin berkonsultasi mengenai layanan: ${title}`
  )

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
      />

      <main className="max-w-5xl mx-auto py-16 sm:py-24 px-4 sm:px-6 md:px-8 space-y-12">
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
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
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
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line text-justify">
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
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
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

        {/* CTA Konsultasi & Pengajuan Layanan */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl border border-gray-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
            💬
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {locale === 'en' ? 'Interested in This Service?' : 'Tertarik Menggunakan Layanan Ini?'}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              {locale === 'en'
                ? 'Discuss your operational requirements and workforce deployment directly with our specialized consulting team.'
                : 'Diskusikan kebutuhan operasional dan penempatan tenaga kerja profesional bersama tim konsultan kami.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl transition-all duration-300 active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>{locale === 'en' ? 'Consult via WhatsApp' : 'Konsultasi via WhatsApp'}</span>
              </a>
            )}
            <Link
              href="/#contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs sm:text-sm font-black text-white shadow-xl transition-all duration-300 active:scale-95 uppercase tracking-wider text-center"
              style={{ backgroundColor: setting.primaryColor }}
            >
              {t.common.contactUs} &rarr;
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto py-8 px-4 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-semibold gap-3">
        <span>© 2026 {setting.siteName}. All Rights Reserved.</span>
        <div className="flex items-center gap-2">
          <span>Website by</span>
          <a
            href="https://lembahtech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider"
          >
            lembahtech
          </a>
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
    </div>
  )
}
