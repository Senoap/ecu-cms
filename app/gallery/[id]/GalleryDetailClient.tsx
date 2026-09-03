// app/gallery/[id]/GalleryDetailClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/components/LanguageContext'
import { GalleryItem } from '@/lib/db'

export default function GalleryDetailClient({
  item,
  allGalleries,
  setting,
  footer
}: {
  item: GalleryItem
  allGalleries: GalleryItem[]
  setting: any
  footer: any
}) {
  const { locale, t, getFallbackContent } = useLanguage()
  const [showZoom, setShowZoom] = useState(false)

  const fb = getFallbackContent('galleries', item.id)
  const itemTitle = (locale === 'en' && fb?.title) ? fb.title : item.title
  const itemDesc = (locale === 'en' && fb?.desc) ? fb.desc : item.desc
  const itemCat = (locale === 'en' && fb?.category) ? fb.category : (item.category || 'Umum')

  const related = allGalleries.filter((g) => g.id !== item.id).slice(0, 4)

  const waNumber = (footer?.whatsapp || footer?.phone || '').replace(/[^0-9]/g, '')
  const waMessage = encodeURIComponent(
    locale === 'en'
      ? `Hello PT ESU, I saw your documentation photo: ${itemTitle}`
      : `Halo PT ESU, saya melihat dokumentasi kegiatan: ${itemTitle}`
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
            href="/#gallery"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:underline tracking-wide"
          >
            <span>&larr;</span>
            <span>{t.common.backToHome}</span>
          </Link>
        </div>

        {/* Header Dokumentasi */}
        <div className="space-y-4">
          <span className="inline-block text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
            {itemCat}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            {itemTitle}
          </h1>
        </div>

        {/* Featured Large Photo Container with Click to Zoom */}
        {item.imageUrl && (
          <div
            onClick={() => setShowZoom(true)}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-950 h-80 sm:h-[450px] md:h-[560px] group cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={itemTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/20 flex items-center gap-2">
              <span>🔍</span>
              <span>{locale === 'en' ? 'Click to Enlarge Full Photo' : 'Klik untuk Memperbesar Foto'}</span>
            </div>
          </div>
        )}

        {/* Narrative & Description Details */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 md:p-12 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {locale === 'en' ? 'Activity Narrative & Field Context' : 'Narasi Kegiatan & Konteks Lapangan'}
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line text-justify font-medium">
            {itemDesc}
          </p>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {locale === 'en' ? 'Documented by:' : 'Didokumentasikan oleh:'}{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">{setting.siteName}</span>
            </div>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all uppercase tracking-wider shadow-md"
              >
                <span>💬</span>
                <span>{locale === 'en' ? 'Inquire Activity' : 'Tanyakan Kegiatan Ini'}</span>
              </a>
            )}
          </div>
        </div>

        {/* Dokumentasi Terkait */}
        {related.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {locale === 'en' ? 'Other Documentations' : 'Dokumentasi Lainnya'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((rel) => {
                const relFb = getFallbackContent('galleries', rel.id)
                const relTitle = (locale === 'en' && relFb?.title) ? relFb.title : rel.title
                const relDesc = (locale === 'en' && relFb?.desc) ? relFb.desc : rel.desc
                const relCat = (locale === 'en' && relFb?.category) ? relFb.category : (rel.category || 'Umum')

                return (
                  <Link
                    key={rel.id}
                    href={`/gallery/${rel.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-lg hover:shadow-2xl transition-all space-y-3"
                  >
                    <div className="h-40 rounded-xl overflow-hidden bg-gray-950">
                      <img
                        src={rel.imageUrl}
                        alt={relTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                      {relCat}
                    </span>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-1">
                      {relTitle}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {relDesc}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Full Photo Modal Zoom */}
      {showZoom && item.imageUrl && (
        <div
          onClick={() => setShowZoom(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <img src={item.imageUrl} alt={itemTitle} className="w-full h-full object-contain mx-auto rounded-2xl" />
            <button
              onClick={() => setShowZoom(false)}
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
