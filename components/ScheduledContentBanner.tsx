// components/ScheduledContentBanner.tsx
'use client'

import { useState } from 'react'
import { 
  SunMedium, 
  Sparkles, 
  Calendar, 
  ChevronDown, 
  Megaphone,
  Bell
} from 'lucide-react'
import type { ScheduledContentItem } from '@/lib/db'

interface ScheduledContentBannerProps {
  contents?: ScheduledContentItem[]
}

function getTodayStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateIndo(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    return dateStr
  } catch {
    return dateStr
  }
}

export default function ScheduledContentBanner({ contents = [] }: ScheduledContentBannerProps) {
  const [showAll, setShowAll] = useState(false)

  const todayStr = getTodayStr()
  const activeItems = contents.filter(
    (item) => item.isActive && todayStr >= item.startDate && todayStr <= item.endDate
  )

  if (activeItems.length === 0) {
    return null
  }

  // Tampilkan maksimal 3 konten secara default, sisanya dibuka dengan tombol "Lihat Lebih Banyak"
  const displayedItems = showAll ? activeItems : activeItems.slice(0, 3)

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      {/* SECTION HEADER KONTEN INFORMASI & HARI BESAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm shrink-0">
            <Megaphone className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Informasi & Pengumuman Resmi
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Agenda & Informasi Khusus
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
            {activeItems.length} Konten Aktif
          </span>
        </div>
      </div>

      {/* JIKA HANYA 1 KONTEN: TAMPILKAN FORMAT FEATURED BANNER HERO CARD BESAR */}
      {activeItems.length === 1 ? (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-white/90 dark:to-gray-900/90 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
            {activeItems[0].imageUrl ? (
              <div className="w-full md:w-2/5 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-amber-500/20 aspect-[16/10] md:aspect-auto md:h-72 bg-gray-950">
                <img 
                  src={activeItems[0].imageUrl} 
                  alt={activeItems[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
              </div>
            ) : (
              <div className="w-full md:w-1/3 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex flex-col items-center justify-center p-8 text-center aspect-[16/10] md:aspect-auto md:h-72">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  {activeItems[0].type === 'daily' ? <SunMedium className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  {activeItems[0].badge || (activeItems[0].type === 'daily' ? 'Informasi Harian' : 'Informasi Bulanan')}
                </span>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-gray-950 shadow-sm">
                  {activeItems[0].badge || (activeItems[0].type === 'daily' ? 'Informasi Harian' : 'Informasi Bulanan')}
                </span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Periode: {formatDateIndo(activeItems[0].startDate)} s/d {formatDateIndo(activeItems[0].endDate)}</span>
                </span>
              </div>

              <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                {activeItems[0].title}
              </h4>

              <div className="p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-950/60 border border-gray-200/80 dark:border-gray-800/80 shadow-inner">
                <p className="text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-line">
                  {activeItems[0].content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* JIKA LEBIH DARI 1 KONTEN: RENDER CARD GRID DENGAN INFORMASI YANG JELAS & BISA DIBACA */
        <div className="space-y-6">
          <div className={`grid grid-cols-1 ${displayedItems.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border shadow-xl backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  item.type === 'daily'
                    ? 'bg-gradient-to-b from-white via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-amber-500/30'
                    : 'bg-gradient-to-b from-white via-white to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-indigo-500/30'
                }`}
              >
                {item.imageUrl && (
                  <div className="h-48 sm:h-52 w-full overflow-hidden relative bg-gray-950">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md ${
                        item.type === 'daily' ? 'bg-amber-500 text-gray-950' : 'bg-indigo-600 text-white'
                      }`}>
                        {item.badge || (item.type === 'daily' ? 'Harian' : 'Bulanan')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {!item.imageUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                          item.type === 'daily' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                        }`}>
                          {item.badge || (item.type === 'daily' ? 'Harian' : 'Bulanan')}
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          item.type === 'daily' ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600'
                        }`}>
                          {item.type === 'daily' ? <SunMedium className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{formatDateIndo(item.startDate)} - {formatDateIndo(item.endDate)}</span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                      {item.title}
                    </h4>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      Informasi Terverifikasi
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* JIKA KONTEN LEBIH DARI 3: TAMPILKAN TOMBOL "LIHAT LEBIH BANYAK" */}
          {activeItems.length > 3 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-sm bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{showAll ? 'Tampilkan Lebih Sedikit' : `Lihat Lebih Banyak (${activeItems.length - 3} informasi lainnya)`}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
