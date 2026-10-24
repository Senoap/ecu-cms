// components/AboutSectionClient.tsx
'use client'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageContext'
import { useSmartViewport } from '@/components/SmartViewportProvider'
import { Award, ArrowRight, Users, ShieldCheck } from 'lucide-react'

interface AboutContent {
  tag: string
  heading: string
  subtitle: string
  title: string
  p1: string
  p2: string
  leadershipTitle: string
  leadershipDesc: string
  quote: string
}

interface AboutSectionClientProps {
  about: AboutContent
  primaryColor: string
  showLeadership?: boolean
  showCertifications?: boolean
  leadershipLabel?: string
}

export default function AboutSectionClient({ 
  about, 
  primaryColor,
  showLeadership = true,
  showCertifications = true,
  leadershipLabel = 'Profil Pimpinan'
}: AboutSectionClientProps) {
  const { t } = useLanguage()
  const { isCompactViewport, isQuadSplit } = useSmartViewport()

  const subtitle = about.subtitle || t.about.subtitle
  const title = about.title || t.about.title
  const leadershipTitle = about.leadershipTitle || t.about.leadershipTitle
  const leadershipDesc = about.leadershipDesc || t.about.leadershipDesc
  const quote = about.quote || t.about.quote

  return (
    <section id="about" data-smart-container className="w-full py-20 md:py-28 px-4 sm:px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center scroll-mt-20">
      <div className={`grid gap-10 md:gap-16 items-center ${
        isQuadSplit || isCompactViewport ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        
        {/* Kolom Kiri: Narasi Utama & Paragraf Perusahaan */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <div className="space-y-3">
            <span className="inline-block text-xs font-extrabold tracking-widest text-amber-700 dark:text-amber-300 uppercase bg-amber-50 dark:bg-amber-900/30 px-3.5 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-700/40 shadow-sm">
              {subtitle}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.15]">
              {title}
            </h2>
            <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
          </div>

          <div className="space-y-4 md:space-y-5 text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed font-medium text-justify">
            <p>{about.p1}</p>
            <p>{about.p2}</p>
          </div>

          {/* Quote / Nilai Perusahaan */}
          {quote && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 shadow-lg relative overflow-hidden border-l-4" style={{ borderLeftColor: primaryColor }}>
              <div className="absolute top-2 right-4 text-6xl text-amber-500/10 font-serif select-none pointer-events-none">&ldquo;</div>
              <p className="text-xs sm:text-sm md:text-base font-extrabold text-gray-900 dark:text-gray-100 tracking-wide uppercase">
                {quote}
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Kotak Rekam Jejak & Pengalaman Pimpinan (Desain Korporat Elegan) */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="bg-white dark:bg-[#0E111A] text-gray-900 dark:text-white p-7 sm:p-9 md:p-10 rounded-2xl shadow-xl border border-gray-200/90 dark:border-gray-800 space-y-6 relative overflow-hidden transition-all duration-300 border-t-4 sm:border-t-0 sm:border-l-4"
            style={{ borderLeftColor: primaryColor || '#6B0808', borderTopColor: primaryColor || '#6B0808' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-400 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/40">
                {t.about.leadershipBadge}
              </span>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {leadershipTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium text-justify">
                {leadershipDesc}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span>{t.about.corporateBadge}</span>
              <span className="font-extrabold text-amber-800 dark:text-amber-400">{t.about.established}</span>
            </div>

            {/* TOMBOL SUBMENU TENTANG KAMI: PIMPINAN & SERTIFIKASI (KONDISIONAL SESUAI FITUR AKTIF, LABEL LENGKAP TANPA TRUNCATE) */}
            {(showLeadership || showCertifications) && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {showLeadership && (
                  <Link
                    href="/leadership"
                    className="flex-1 py-3 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer group/btn"
                    style={{ backgroundColor: primaryColor || '#6B0808' }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{leadershipLabel || 'Profil Pimpinan'}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                  </Link>
                )}

                {showCertifications && (
                  <Link
                    href="/certifications"
                    className="flex-1 py-3 px-4 rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-800 dark:text-gray-200 font-bold text-xs uppercase tracking-wider flex items-center justify-between border border-gray-300 dark:border-gray-700 shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer group/btn"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Sertifikasi Resmi</span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}