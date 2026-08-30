// components/GallerySectionClient.tsx
'use client'
import { useState, useEffect } from 'react'

interface GalleryItem {
  id: string
  title: string
  desc: string
  category: string
  imageUrl: string
}

export default function GallerySectionClient({ sec, galleryHeader, galleries, primaryColor }: { sec: any; galleryHeader: any; galleries: GalleryItem[]; primaryColor: string }) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const categories = Array.from(new Set(galleries.map(g => g.category || 'Umum')))

  return (
    <section key={sec.id} id="gallery" className="min-h-screen w-full py-24 px-6 md:px-16 max-w-7xl mx-auto flex flex-col justify-center space-y-16">
      <div className="space-y-3 text-center">
        <span className="inline-block text-xs font-extrabold tracking-widest text-amber-700 uppercase bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-sm">
          {galleryHeader?.tag || sec.subtitle}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{galleryHeader?.heading || sec.title}</h2>
        <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mt-2"></div>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">{sec.content}</p>
      </div>

      <div className="space-y-16">
        {categories.map((cat) => {
          const itemsInCat = galleries.filter(g => (g.category || 'Umum') === cat)
          return (
            <CategoryUniformSlider 
              key={cat} 
              categoryName={cat} 
              items={itemsInCat} 
              primaryColor={primaryColor} 
              onImageClick={(item) => setSelectedImage(item)}
            />
          )
        })}
      </div>

      {/* Popup / Modal Detail Foto Saat Diklik */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative border border-gray-100 flex flex-col md:flex-row">
            <button 
              type="button"
              onClick={() => setSelectedImage(null)} 
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[300px]">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-700 border border-amber-200 px-3 py-1 rounded-full inline-block">
                  {selectedImage.category}
                </span>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedImage.title}</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">{selectedImage.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="w-full py-3 rounded-xl text-xs font-extrabold text-white uppercase tracking-wider shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function CategoryUniformSlider({ categoryName, items, primaryColor, onImageClick }: { categoryName: string; items: GalleryItem[]; primaryColor: string; onImageClick: (item: GalleryItem) => void }) {
  const N = items.length
  // Mulai dari set tengah (indeks N) agar bisa bergeser ke depan maupun ke belakang secara kontinu
  const [currentIndex, setCurrentIndex] = useState(N)
  const [enableTransition, setEnableTransition] = useState(true)

  // Gandakan array menjadi 3 set (Triple-Buffer) untuk infinite loop seamless
  const extendedItems = [...items, ...items, ...items]

  // Auto slide 1 foto per interval 4 detik
  useEffect(() => {
    if (N <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [N])

  // Reset posisi secara instan tanpa animasi saat mencapai batas set terakhir
  const handleTransitionEnd = () => {
    if (currentIndex >= N * 2) {
      setEnableTransition(false)
      setCurrentIndex(N)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true)
        })
      })
    }
  }

  if (N === 0) return null

  const cardWidth = 340
  const gap = 24

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-gray-900 tracking-wide flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          <span>{categoryName}</span>
        </h3>
        <span className="text-xs font-bold text-gray-400">
          Foto {(currentIndex % N) + 1} dari {N}
        </span>
      </div>

      {/* Container Slider dengan Continuous Infinite Loop & Posisi Tengah */}
      <div className="relative overflow-hidden w-full py-6 px-2">
        <div 
          onTransitionEnd={handleTransitionEnd}
          className={`flex items-center ${enableTransition ? 'transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]' : 'transition-none'}`}
          style={{ 
            gap: `${gap}px`,
            transform: `translateX(calc(50% - ${cardWidth / 2}px - ${currentIndex} * (${cardWidth}px + ${gap}px)))` 
          }}
        >
          {extendedItems.map((item, idx) => {
            const isActive = currentIndex === idx
            return (
              <div 
                key={`${item.id}-${idx}`}
                onClick={() => onImageClick(item)}
                style={{ width: `${cardWidth}px` }}
                className={`flex-shrink-0 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive 
                    ? 'scale-105 shadow-2xl ring-2 ring-amber-500/50 z-10 opacity-100' 
                    : 'scale-95 opacity-60 hover:opacity-85'
                }`}
              >
                <div className="relative h-72 w-full overflow-hidden bg-gray-900">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-2.5 py-0.5 rounded-full inline-block">
                      {item.category}
                    </span>
                    <h4 className="text-lg font-black tracking-tight text-white line-clamp-1">{item.title}</h4>
                    <p className="text-gray-200 text-xs line-clamp-2 font-medium">{item.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}