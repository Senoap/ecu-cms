// components/ServicesSectionClient.tsx
'use client'
import { useState, useEffect } from 'react'
import { ServiceItem } from '@/lib/db'
import { DynamicIcon } from '@/components/DynamicIcon'

interface ServicesProps {
  services: ServiceItem[]
  headerTag: string
  headerHeading: string
  headerNote: string
  slideDuration: number
  primaryColor: string
}

export default function ServicesSectionClient({ services, headerTag, headerHeading, headerNote, slideDuration, primaryColor }: ServicesProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // State untuk efek transisi acak saat membuka & menutup konten modal
  const [transitioning, setTransitioning] = useState(false)
  const [randomEffect, setRandomEffect] = useState(0)

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

  // Fungsi membuka modal dengan transisi acak yang super halus
  const handleOpenModal = (srv: ServiceItem) => {
    const effectIndex = Math.floor(Math.random() * 4)
    setRandomEffect(effectIndex)
    setTransitioning(true)

    setTimeout(() => {
      setSelectedService(srv)
      setCurrentImageIndex(0)
    }, 400)

    setTimeout(() => {
      setTransitioning(false)
    }, 900)
  }

  // Fungsi menutup modal dengan transisi acak yang selaras
  const handleCloseModal = () => {
    const effectIndex = Math.floor(Math.random() * 4)
    setRandomEffect(effectIndex)
    setTransitioning(true)

    setTimeout(() => {
      setSelectedService(null)
    }, 400)

    setTimeout(() => {
      setTransitioning(false)
    }, 900)
  }

  return (
    <>
      {/* OVERLAY TRANSISI FULL LAYAR (SAAT MEMBUKA & MENUTUP KONTEN) */}
      <div 
        className={`fixed inset-0 z-[999] pointer-events-none transition-all duration-900 ${
          transitioning ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: primaryColor || '#4A0E17',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transform: 
            randomEffect === 1 ? (transitioning ? 'translateY(0%)' : 'translateY(-100%)') :
            randomEffect === 2 ? (transitioning ? 'scale(1)' : 'scale(1.15)') :
            randomEffect === 3 ? (transitioning ? 'translateX(0%)' : 'translateX(100%)') :
            'none',
          filter: randomEffect === 0 ? (transitioning ? 'blur(0px)' : 'blur(15px)') : 'none',
          opacity: randomEffect === 0 ? (transitioning ? '0.94' : '0') : transitioning ? '1' : '0'
        }}
      >
        <div className={`absolute inset-0 flex items-center justify-center text-white text-2xl font-bold tracking-[0.3em] transition-all duration-700 ${transitioning ? 'scale-100 opacity-90' : 'scale-90 opacity-0'}`}>
          MEMUAT KONTEN...
        </div>
      </div>

      <section id="services" className="py-24 bg-white border-t border-b border-gray-200 px-6 md:px-16 relative">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto text-center space-y-3 mb-16">
          <span className="inline-block text-xs font-extrabold tracking-widest text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full">
            {headerTag}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{headerHeading}</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-2"></div>
        </div>

        {/* Kontainer Layanan (Tata Letak Sesuai Existing Anda) */}
        <div className="max-w-7xl mx-auto flex flex-wrap justify-around lg:justify-between items-start gap-8 px-4">
          {(services || []).map((srv) => (
            <div
              key={srv.id}
              onClick={() => handleOpenModal(srv)}
              className="group relative flex flex-col items-center text-center space-y-3 cursor-pointer transition-transform duration-300 hover:-translate-y-2 w-32 sm:w-36 flex-shrink-0"
            >
              {/* Ikon Lingkaran */}
              <div className="w-20 h-20 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-800 transition-all duration-300 shadow-sm border border-amber-200/60">
                <DynamicIcon name={srv.icon} className="w-9 h-9" />
              </div>

              {/* Judul Layanan */}
              <h3 className="font-bold text-xs md:text-sm text-gray-900 tracking-wide group-hover:text-amber-800 transition-colors leading-tight relative z-0">
                {srv.title}
              </h3>

              {/* Hover Preview Box (Smooth bloom dari tengah ikon, transparan, dan sangat mudah dibaca) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-72 bg-gray-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out flex flex-col text-left shadow-2xl z-25 scale-50 group-hover:scale-100 origin-center">
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider border-b border-white/20 pb-2">
                    <DynamicIcon name={srv.icon} className="w-4 h-4" />
                    <span className="truncate">{srv.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-100 leading-relaxed line-clamp-3 font-medium drop-shadow-sm">
                    {srv.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-semibold text-amber-300">
                  <span>Klik Detail & Galeri &rarr;</span>
                  {srv.images && srv.images.length > 0 && (
                    <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm border border-white/10">{srv.images.length} Foto</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="max-w-7xl mx-auto text-center text-xs text-gray-500 mt-16 italic">
          {headerNote}
        </p>

        {/* POPUP MODAL UKURAN SANGAT BESAR (MAX-W-6XL) DENGAN AUTO-SLIDE GALERI */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white text-gray-900 border border-gray-200 w-full max-w-6xl rounded-3xl p-8 md:p-14 shadow-2xl space-y-10 my-8 relative animate-in fade-in zoom-in duration-200">

              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors shadow-sm"
              >
                ✕
              </button>

              <div className="flex items-center gap-5 border-b border-gray-100 pb-6 pr-14">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-inner border border-amber-200 flex-shrink-0">
                  <DynamicIcon name={selectedService.icon} className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-amber-700 uppercase">Detail Layanan Korporat</span>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mt-1">{selectedService.title}</h2>
                </div>
              </div>

              {/* Grid diubah ke items-start dan min-w-0 agar teks tidak meluber menimpa gambar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-5 min-w-0">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Ruang Lingkup & Konten</h3>
                  {/* Ditambahkan break-words agar teks panjang otomatis turun ke bawah */}
                  <p className="text-gray-700 leading-relaxed text-base md:text-lg whitespace-pre-line break-words">
                    {selectedService.content || selectedService.desc}
                  </p>
                  <div className="pt-6">
                    <a
                      href="#contact"
                      onClick={handleCloseModal}
                      className="inline-block px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      AJUKAN PENAWARAN LAYANAN &rarr;
                    </a>
                  </div>
                </div>

                <div className="space-y-4 min-w-0">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span>Dokumentasi Proyek</span>
                    {selectedService.images && selectedService.images.length > 0 && (
                      <span>Slide {currentImageIndex + 1} dari {selectedService.images.length} (Durasi: {slideDuration}s)</span>
                    )}
                  </div>

                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-100 h-80 md:h-[420px] flex items-center justify-center">
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
                      <div className="text-gray-400 text-sm italic text-center p-6">
                        [ Belum ada dokumentasi foto yang diunggah untuk layanan ini ]
                      </div>
                    )}
                  </div>

                  {selectedService.images && selectedService.images.length > 1 && (
                    <div className="flex justify-center gap-2.5 pt-2">
                      {selectedService.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-amber-600' : 'w-2.5 bg-gray-300'}`}
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