// app/portfolio/[id]/PortfolioDetailClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/components/LanguageContext'
import { PortfolioItem } from '@/lib/db'

export default function PortfolioDetailClient({
  item,
  allPortfolios,
  setting,
  footer
}: {
  item: PortfolioItem
  allPortfolios: PortfolioItem[]
  setting: any
  footer: any
}) {
  const { locale, t, getFallbackContent } = useLanguage()
  const [showImageModal, setShowImageModal] = useState(false)

  const fb = getFallbackContent('portfolios', item.id)
  const itemName = (locale === 'en' && fb?.name) ? fb.name : item.name
  const itemDesc = (locale === 'en' && fb?.desc) ? fb.desc : item.desc

  const otherPortfolios = allPortfolios.filter((p) => p.id !== item.id).slice(0, 3)

  const waNumber = (footer?.whatsapp || footer?.phone || '').replace(/[^0-9]/g, '')
  const waMessage = encodeURIComponent(
    locale === 'en'
      ? `Hello PT ESU, I would like to inquire regarding project portfolio: ${itemName}`
      : `Halo PT ESU, saya ingin berkonsultasi mengenai proyek portofolio: ${itemName}`
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

      <main className="max-w-6xl mx-auto py-16 sm:py-24 px-4 sm:px-6 md:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:underline tracking-wide"
          >
            <span>&larr;</span>
            <span>{t.common.backToHome}</span>
          </Link>
        </div>

        {/* Header Portfolio */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
            <span>📁</span>
            <span>{t.portfolio.tag}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            {itemName}
          </h1>
        </div>

        {/* Featured Image Banner with Zoom */}
        {item.imageUrl && (
          <div
            onClick={() => setShowImageModal(true)}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-950 h-72 sm:h-96 md:h-[480px] group cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={itemName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/20 flex items-center gap-2">
              <span>🔍</span>
              <span>{locale === 'en' ? 'Click to Enlarge' : 'Klik untuk Memperbesar'}</span>
            </div>
          </div>
        )}

        {/* Deskripsi Lengkap Proyek & Spesifikasi (Layout Rapi & Responsif) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ringkasan & Ruang Lingkup Proyek */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="w-2.5 h-6 rounded-full bg-amber-500"></span>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
                {locale === 'en' ? 'Project Overview & Scope' : 'Ringkasan & Ruang Lingkup Proyek'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line text-left font-normal sm:font-medium">
              {itemDesc}
            </p>
          </div>

          {/* Spesifikasi Proyek Card */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span>📋</span>
                <span>{locale === 'en' ? 'Project Details' : 'Spesifikasi Proyek'}</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Row Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3.5">
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0">
                  {locale === 'en' ? 'Status' : 'Status'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider border border-emerald-500/20 w-fit self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {locale === 'en' ? 'Completed & Verified' : 'Selesai & Terverifikasi'}
                </span>
              </div>

              {/* Row Kategori */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 border-b border-gray-100 dark:border-gray-800 pb-3.5">
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0">
                  {locale === 'en' ? 'Category' : 'Kategori'}
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm sm:text-right">
                  Manpower Services
                </span>
              </div>

              {/* Row Penyedia */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-4 border-b border-gray-100 dark:border-gray-800 pb-3.5">
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0">
                  {locale === 'en' ? 'Provider' : 'Penyedia'}
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm sm:text-right break-words">
                  {setting.siteName}
                </span>
              </div>
            </div>

            {waNumber && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl text-xs sm:text-sm font-black text-white text-center bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all duration-300 uppercase tracking-wider active:scale-95 cursor-pointer"
                >
                  <span>💬</span>
                  <span>{locale === 'en' ? 'Inquire Similar Project' : 'Konsultasi Proyek Serupa'}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Portofolio Lainnya */}
        {otherPortfolios.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {locale === 'en' ? 'Explore Other Projects' : 'Eksplorasi Proyek Lainnya'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherPortfolios.map((other) => {
                const otherFb = getFallbackContent('portfolios', other.id)
                const otherName = (locale === 'en' && otherFb?.name) ? otherFb.name : other.name
                const otherDesc = (locale === 'en' && otherFb?.desc) ? otherFb.desc : other.desc

                return (
                  <Link
                    key={other.id}
                    href={`/portfolio/${other.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-lg hover:shadow-2xl transition-all space-y-3"
                  >
                    {other.imageUrl && (
                      <div className="h-44 rounded-xl overflow-hidden bg-gray-950">
                        <img
                          src={other.imageUrl}
                          alt={otherName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="font-black text-base text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-1">
                      {otherName}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {otherDesc}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
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

      {/* Modal Zoom Gambar */}
      {showImageModal && item.imageUrl && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <img src={item.imageUrl} alt={itemName} className="w-full h-full object-contain mx-auto rounded-2xl" />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
