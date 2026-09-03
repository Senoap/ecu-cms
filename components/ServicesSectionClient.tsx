// components/ServicesSectionClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ServiceItem } from '@/lib/db'
import { DynamicIcon } from '@/components/DynamicIcon'
import { useLanguage } from '@/components/LanguageContext'
import SmoothLoader from '@/components/SmoothLoader'

interface ServicesProps {
  services: ServiceItem[]
  headerTag: string
  headerHeading: string
  headerNote: string
  slideDuration: number
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  loadingBgColor?: string
  logoUrl?: string
}

export default function ServicesSectionClient({
  services,
  headerTag,
  headerHeading,
  headerNote,
  slideDuration,
  primaryColor,
  secondaryColor = '#D4AF37',
  accentColor = '#1E293B',
  loadingBgColor,
  logoUrl
}: ServicesProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { locale, t, getFallbackContent } = useLanguage()

  // State untuk efek transisi acak saat membuka & menutup konten modal
  const [transitioning, setTransitioning] = useState(false)

  // Efek Auto-Slide untuk galeri foto di dalam Modal Popup
  useEffect(() => {
    if (!selectedService || !selectedService.images || selectedService.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % selectedService.images!.length
      )
    }, (slideDuration || 3) * 1000)

    return () => clearInterval(interval)
  }, [selectedService, slideDuration])

  // Fungsi membuka modal dengan transisi super halus
  const handleOpenModal = (srv: ServiceItem) => {
    setTransitioning(true)

    setTimeout(() => {
      setSelectedService(srv)
      setCurrentImageIndex(0)
    }, 250)

    setTimeout(() => {
      setTransitioning(false)
    }, 450)
  }

  // Fungsi menutup modal dengan transisi selaras
  const handleCloseModal = () => {
    setTransitioning(true)

    setTimeout(() => {
      setSelectedService(null)
    }, 250)

    setTimeout(() => {
      setTransitioning(false)
    }, 450)
  }

  const srvTag = (locale === 'en' && !headerTag) ? t.services.tag : (headerTag || t.services.tag)
  const srvHeading = (locale === 'en' && !headerHeading) ? t.services.heading : (headerHeading || t.services.heading)
  const srvNote = (locale === 'en' && !headerNote) ? t.services.note : (headerNote || '')

  const selectedFb = selectedService ? getFallbackContent('services', selectedService.id) : null
  const selectedTitle = (locale === 'en' && selectedFb?.title) ? selectedFb.title : selectedService?.title
  const selectedContent = (locale === 'en' && selectedFb?.content) ? selectedFb.content : (selectedService?.content || selectedService?.desc)

  return (
    <>
      {/* OVERLAY TRANSISI SMOOTH & RINGAN */}
      <SmoothLoader
        active={transitioning}
        loadingBgColor={loadingBgColor}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        logoUrl={logoUrl}
        text={t.nav.loadingContent}
      />

      <section id="services" className="py-24 bg-white dark:bg-[#090A0F] border-t border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 md:px-16 relative transition-colors duration-500">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto text-center space-y-3 mb-16">
          <span className="inline-block text-xs font-extrabold tracking-widest text-amber-700 dark:text-amber-300 uppercase bg-amber-50 dark:bg-amber-900/30 px-3.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-700/30">
            {srvTag}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{srvHeading}</h2>
          <div className="w-16 h-1 mx-auto rounded-full mt-2" style={{ backgroundColor: secondaryColor }}></div>
        </div>

        {/* Kontainer Layanan */}
        <div className="max-w-7xl mx-auto flex flex-wrap justify-around lg:justify-between items-start gap-6 sm:gap-8 px-2 sm:px-4">
          {(services || []).map((srv) => {
            const fb = getFallbackContent('services', srv.id)
            const srvTitle = (locale === 'en' && fb?.title) ? fb.title : srv.title
            const srvDesc = (locale === 'en' && fb?.desc) ? fb.desc : srv.desc

            return (
              <div
                key={srv.id}
                onClick={() => handleOpenModal(srv)}
                className="group relative flex flex-col items-center text-center space-y-3 cursor-pointer transition-transform duration-300 hover:-translate-y-2 active:scale-95 w-32 sm:w-36 flex-shrink-0"
              >
                {/* Ikon Lingkaran */}
                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-gray-800/90 group-hover:bg-amber-100 dark:group-hover:bg-gray-700/90 flex items-center justify-center text-amber-800 dark:text-amber-400 transition-all duration-300 shadow-sm border border-amber-200/60 dark:border-gray-700">
                  <DynamicIcon name={srv.icon} className="w-9 h-9" />
                </div>

                {/* Judul Layanan */}
                <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-gray-100 tracking-wide group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight relative z-0">
                  {srvTitle}
                </h3>

                {/* Hover Preview Box */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-72 bg-gray-900/80 dark:bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out flex flex-col text-left shadow-2xl z-25 scale-50 group-hover:scale-100 origin-center">
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider border-b border-white/20 pb-2">
                      <DynamicIcon name={srv.icon} className="w-4 h-4" />
                      <span className="truncate">{srvTitle}</span>
                    </div>
                    <p className="text-[11px] text-gray-100 leading-relaxed line-clamp-3 font-medium drop-shadow-sm">
                      {srvDesc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-semibold text-amber-300">
                    <span>{t.services.clickForDetail} &rarr;</span>
                    {srv.images && srv.images.length > 0 && (
                      <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm border border-white/10">{srv.images.length} {t.gallery.photoCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {srvNote && (
          <p className="max-w-7xl mx-auto text-center text-xs text-gray-500 dark:text-gray-400 mt-16 italic">
            {srvNote}
          </p>
        )}

        {/* POPUP MODAL UKURAN SANGAT BESAR DENGAN LINK DETAIL LENGKAP */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0D1017] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 w-full max-w-6xl rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl space-y-8 my-8 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-lg transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 sm:gap-5 border-b border-gray-100 dark:border-gray-800 pb-6 pr-14">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 dark:bg-gray-800 flex items-center justify-center text-amber-800 dark:text-amber-400 shadow-inner border border-amber-200 dark:border-gray-700 flex-shrink-0">
                  <DynamicIcon name={selectedService.icon} className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase">{t.services.corporateDetail}</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-1">{selectedTitle}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
                <div className="space-y-5 min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t.services.scopeAndContent}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line break-words font-medium">
                    {selectedContent}
                  </p>
                  
                  {/* Action Buttons: Ajukan Penawaran & Buka Halaman Detail Penuh */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <a
                      href="#contact"
                      onClick={handleCloseModal}
                      className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black text-white shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 text-center uppercase tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t.services.requestQuote} &rarr;
                    </a>
                    <Link
                      href={`/services/${selectedService.id}`}
                      className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 shadow-sm transition-all duration-300 active:scale-95 text-center uppercase tracking-wider"
                    >
                      {t.services.viewFullPage} &rarr;
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 min-w-0">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span>{t.services.projectDocs}</span>
                    {selectedService.images && selectedService.images.length > 0 && (
                      <span>Slide {currentImageIndex + 1} {t.gallery.of} {selectedService.images.length} ({slideDuration}s)</span>
                    )}
                  </div>

                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 h-64 sm:h-80 md:h-[380px] flex items-center justify-center">
                    {selectedService.images && selectedService.images.length > 0 ? (
                      selectedService.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                          <img
                            src={img}
                            alt={`Galeri ${selectedService.title} ${idx}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm italic text-center p-6">
                        [ {t.services.noImages} ]
                      </div>
                    )}
                  </div>

                  {selectedService.images && selectedService.images.length > 1 && (
                    <div className="flex justify-center gap-2.5 pt-2">
                      {selectedService.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentImageIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}