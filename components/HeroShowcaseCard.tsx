// components/HeroShowcaseCard.tsx
'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/LanguageContext'

interface HeroShowcaseCardProps {
  siteName: string
  tagline: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  logoUrl?: string
  isDarkMode: boolean
}

export default function HeroShowcaseCard({
  siteName,
  tagline,
  primaryColor,
  secondaryColor = '#D4AF37',
  accentColor = '#1E293B',
  logoUrl,
  isDarkMode
}: HeroShowcaseCardProps) {
  const { locale } = useLanguage()
  const [activeTab, setActiveTab] = useState<'strengths' | 'metrics' | 'coverage'>('strengths')
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)

  // Roles untuk auto-cycling ticker mini showcase
  const roles = [
    {
      icon: '🛡️',
      title: locale === 'en' ? 'Security & Asset Protection' : 'Satuan Pengamanan (Gada Pratama / Madya)',
      tag: locale === 'en' ? 'Certified Officers' : 'Personel Tersertifikasi',
      desc: locale === 'en' ? 'Trained physical & executive security personnel' : 'Perlindungan aset fisik & korporat berstandar regulasi'
    },
    {
      icon: '🧹',
      title: locale === 'en' ? 'Facility & Cleaning Services' : 'Jasa Kebersihan & Manajemen Fasilitas',
      tag: locale === 'en' ? 'Hygiene Standard' : 'Standar Higienis',
      desc: locale === 'en' ? 'Professional building housekeeping & maintenance' : 'Perawatan gedung, kantor, dan fasilitas komersial prima'
    },
    {
      icon: '🚗',
      title: locale === 'en' ? 'Executive Corporate Drivers' : 'Pengemudi Profesional & Eksekutif',
      tag: locale === 'en' ? 'Defensive Driving' : 'Safety Driving',
      desc: locale === 'en' ? 'Punctual, vetted and protocol-trained drivers' : 'Disiplin waktu, berlisensi, dan penguasaan rute handal'
    },
    {
      icon: '⚙️',
      title: locale === 'en' ? 'Industrial & Technical Crew' : 'Operator Pabrik & Teknisi Pemeliharaan',
      tag: locale === 'en' ? 'Production Ready' : 'Siap Kerja',
      desc: locale === 'en' ? 'Skilled non-grade operators for manufacturing & logistics' : 'Tenaga terampil siap dukung target operasional industri'
    }
  ]

  // Auto-cycle mini role ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [roles.length])

  // Data Statistik / Metrik
  const metrics = [
    {
      num: '15+',
      label: locale === 'en' ? 'Years Experience' : 'Tahun Pengalaman',
      sub: locale === 'en' ? 'Executive Leadership' : 'Pimpinan Teruji'
    },
    {
      num: '500+',
      label: locale === 'en' ? 'Trained Personnel' : 'Tenaga Siap Kerja',
      sub: locale === 'en' ? 'Active in Field' : 'Penempatan Cepat'
    },
    {
      num: '99.8%',
      label: locale === 'en' ? 'Client Satisfaction' : 'Kepuasan Klien',
      sub: locale === 'en' ? 'SLA Fulfillment' : 'Pemenuhan SLA'
    },
    {
      num: '100%',
      label: locale === 'en' ? 'Legal Compliance' : 'Kepatuhan Legalitas',
      sub: locale === 'en' ? 'Official Licenses' : 'Izin Kemenaker Resmi'
    }
  ]

  // Data Keunggulan Utama
  const strengths = [
    {
      icon: '⚡',
      title: locale === 'en' ? 'Rapid 24/7 SLA Response' : 'Respons Tanggap Cepat 24/7',
      desc: locale === 'en' ? 'Incident mitigation and emergency replacement within < 2 hours.' : 'Penanganan insiden & pergantian personel darurat < 2 jam.'
    },
    {
      icon: '🎖️',
      title: locale === 'en' ? 'Certified Workforce' : 'Personel Tersertifikasi Legal',
      desc: locale === 'en' ? 'Officially qualified via BNSP and Ministry of Manpower training.' : 'Tersertifikasi resmi BNSP dan dibekali pelatihan berkala.'
    },
    {
      icon: '🤝',
      title: locale === 'en' ? 'Zero Dispute Guarantee' : 'Bebas Sengketa & Akuntabel',
      desc: locale === 'en' ? 'Complete regulatory compliance, BPJS, and transparent payroll.' : 'Jaminan kepatuhan UU Ketenagakerjaan, BPJS, & payroll transparan.'
    },
    {
      icon: '🛡️',
      title: locale === 'en' ? 'Zero-Accident Safety' : 'Budaya K3 & Zero-Accident',
      desc: locale === 'en' ? 'Strict workplace safety protocols tailored to your industry.' : 'Disiplin keselamatan kerja tinggi untuk perlindungan aset optimal.'
    }
  ]

  // Sektor Industri yang Dilayani
  const sectors = [
    { icon: '🏢', name: locale === 'en' ? 'Commercial Offices' : 'Perkantoran Komersial' },
    { icon: '🏭', name: locale === 'en' ? 'Industrial Plants & Factories' : 'Pabrik & Kawasan Industri' },
    { icon: '🏬', name: locale === 'en' ? 'Shopping Malls & Retail' : 'Mall & Pusat Perbelanjaan' },
    { icon: '🏥', name: locale === 'en' ? 'Healthcare & Hospitals' : 'Rumah Sakit & Fasilitas Medis' },
    { icon: '🚛', name: locale === 'en' ? 'Logistics & Warehouses' : 'Pergudangan & Logistik' },
    { icon: '🏫', name: locale === 'en' ? 'Educational Institutions' : 'Institusi Pendidikan' }
  ]

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 flex flex-col justify-between ${
      isDarkMode
        ? 'bg-[#0B0E17]/90 border-gray-800 text-white shadow-black/80'
        : 'bg-white/95 border-gray-200/90 text-gray-900 shadow-xl shadow-gray-200/50'
    } backdrop-blur-2xl p-6 sm:p-7 space-y-5 group`}>
      
      {/* Dynamic Ambient Glow Behind Card */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: secondaryColor }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: primaryColor }}
      />

      {/* TOP HEADER: Verified Partner Beacon & Brand Identity */}
      <div className="relative z-10 flex items-center justify-between border-b pb-4 gap-3 ${
        isDarkMode ? 'border-gray-800/80' : 'border-gray-100'
      }">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md border border-gray-200/80 flex items-center justify-center flex-shrink-0">
              <img src={logoUrl} alt={siteName} className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              🏢
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`font-black text-sm sm:text-base tracking-tight truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {siteName}
            </h3>
            <p className="text-[11px] font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400 truncate">
              {tagline}
            </p>
          </div>
        </div>

        {/* Live System Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{locale === 'en' ? 'Active System' : 'Sistem Aktif'}</span>
        </div>
      </div>

      {/* INTERACTIVE TAB NAVIGATION */}
      <div className="relative z-10 flex items-center bg-gray-100 dark:bg-gray-900/90 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-800 text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('strengths')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate ${
            activeTab === 'strengths'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? '⭐ Strengths' : '⭐ Keunggulan'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate ${
            activeTab === 'metrics'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? '📊 Metrics' : '📊 Metrik'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate ${
            activeTab === 'coverage'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? '🌐 Sectors' : '🌐 Sektor'}
        </button>
      </div>

      {/* TAB CONTENT 1: KEUNGGULAN (STRENGTHS) */}
      {activeTab === 'strengths' && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
          {strengths.map((s, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
                  : 'bg-gray-50/90 border-gray-200/70 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{s.icon}</span>
                <h4 className="text-xs font-black tracking-tight leading-tight truncate">{s.title}</h4>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug line-clamp-2 font-medium">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 2: METRIK & STATISTIK */}
      {activeTab === 'metrics' && (
        <div className="relative z-10 grid grid-cols-2 gap-2.5 animate-fadeIn">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-900/60 border-gray-800/80'
                  : 'bg-gray-50/90 border-gray-200/70'
              }`}
            >
              <div
                className="text-2xl sm:text-3xl font-black tracking-tight mb-0.5"
                style={{ color: secondaryColor }}
              >
                {m.num}
              </div>
              <div className="text-xs font-black tracking-wide truncate">{m.label}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 3: SEKTOR INDUSTRI */}
      {activeTab === 'coverage' && (
        <div className="relative z-10 grid grid-cols-2 gap-2 animate-fadeIn">
          {sectors.map((sec, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-900/60 border-gray-800/80 text-gray-200'
                  : 'bg-gray-50 border-gray-200/80 text-gray-800'
              }`}
            >
              <span className="text-base">{sec.icon}</span>
              <span className="text-[11px] font-bold tracking-tight truncate">{sec.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* AUTO-CYCLING ROLE TICKER (MINI CAROUSEL) */}
      <div className="relative z-10 overflow-hidden rounded-2xl p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25">
        <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">
          <span className="uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            {locale === 'en' ? 'Active Deployment Roster' : 'Penempatan Personel Unggulan'}
          </span>
          <span>{currentRoleIndex + 1} / {roles.length}</span>
        </div>

        <div className="flex items-center gap-3 transition-all duration-500">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-amber-500/30 flex items-center justify-center text-lg flex-shrink-0">
            {roles[currentRoleIndex].icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">
                {roles[currentRoleIndex].title}
              </h5>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 flex-shrink-0">
                {roles[currentRoleIndex].tag}
              </span>
            </div>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate font-medium">
              {roles[currentRoleIndex].desc}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-800 text-xs">
        <a
          href="#contact"
          className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl text-center font-black text-white shadow-md transition-all duration-300 hover:opacity-95 uppercase tracking-wider text-[11px] active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {locale === 'en' ? 'Consult Enterprise Workforce &rarr;' : 'Konsultasi Kebutuhan Mitra &rarr;'}
        </a>
        <a
          href="#about"
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all text-[11px] active:scale-95"
        >
          {locale === 'en' ? 'Company Profile' : 'Profil Perusahaan'}
        </a>
      </div>

    </div>
  )
}
