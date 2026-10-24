// components/HeroShowcaseCard.tsx
'use client'
import { useState, useEffect } from 'react'
import type { HeroShowcaseConfig } from '@/lib/showcaseConstants'
import {
  Award,
  BarChart3,
  Globe,
} from 'lucide-react'
import { renderShowcaseIcon } from '@/lib/showcaseIcons'

interface HeroShowcaseCardProps {
  siteName?: string
  tagline?: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  logoUrl?: string
  isDarkMode: boolean
  showcaseData?: HeroShowcaseConfig
}

export default function HeroShowcaseCard({
  primaryColor,
  secondaryColor = '#D4AF37',
  isDarkMode,
  showcaseData
}: HeroShowcaseCardProps) {
  const [activeTab, setActiveTab] = useState<'strengths' | 'metrics' | 'coverage'>('strengths')
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)

  // Roles default jika belum diatur di CMS
  const defaultRoles = [
    {
      icon: 'ShieldCheck',
      title: 'Satuan Pengamanan (Gada Pratama / Madya)',
      tag: 'Personel Tersertifikasi',
      desc: 'Perlindungan aset fisik & korporat berstandar regulasi'
    },
    {
      icon: 'Sparkles',
      title: 'Jasa Kebersihan & Manajemen Fasilitas',
      tag: 'Standar Higienis',
      desc: 'Perawatan gedung, kantor, dan fasilitas komersial prima'
    },
    {
      icon: 'Car',
      title: 'Pengemudi Profesional & Eksekutif',
      tag: 'Safety Driving',
      desc: 'Disiplin waktu, berlisensi, dan penguasaan rute handal'
    },
    {
      icon: 'Wrench',
      title: 'Operator Pabrik & Teknisi Pemeliharaan',
      tag: 'Siap Kerja',
      desc: 'Tenaga terampil siap dukung target operasional industri'
    }
  ]

  const roles = (showcaseData?.roles && showcaseData.roles.length > 0) ? showcaseData.roles : defaultRoles

  // Auto-cycle mini role ticker
  useEffect(() => {
    if (!roles || roles.length <= 1) return
    const timer = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [roles])

  // Data Statistik / Metrik dari CMS
  const defaultMetrics = [
    {
      num: '15+',
      label: 'Tahun Pengalaman',
      sub: 'Pimpinan Teruji'
    },
    {
      num: '500+',
      label: 'Tenaga Siap Kerja',
      sub: 'Penempatan Cepat'
    },
    {
      num: '99.8%',
      label: 'Kepuasan Klien',
      sub: 'Pemenuhan SLA'
    },
    {
      num: '100%',
      label: 'Kepatuhan Legalitas',
      sub: 'Izin Kemenaker Resmi'
    }
  ]

  const metrics = (showcaseData?.metrics && showcaseData.metrics.length > 0) ? showcaseData.metrics : defaultMetrics

  // Data Keunggulan Utama dari CMS
  const defaultStrengths = [
    {
      icon: 'Zap',
      title: 'Respons Tanggap Cepat 24/7',
      desc: 'Penanganan insiden & pergantian personel darurat < 2 jam.'
    },
    {
      icon: 'Award',
      title: 'Personel Tersertifikasi Legal',
      desc: 'Tersertifikasi resmi BNSP dan dibekali pelatihan berkala.'
    },
    {
      icon: 'Users',
      title: 'Bebas Sengketa & Akuntabel',
      desc: 'Jaminan kepatuhan UU Ketenagakerjaan, BPJS, & payroll transparan.'
    },
    {
      icon: 'ShieldCheck',
      title: 'Budaya K3 & Zero-Accident',
      desc: 'Disiplin keselamatan kerja tinggi untuk perlindungan aset optimal.'
    }
  ]

  const strengths = (showcaseData?.strengths && showcaseData.strengths.length > 0) ? showcaseData.strengths : defaultStrengths

  // Sektor Industri dari CMS
  const defaultSectors = [
    { icon: 'Building2', name: 'Perkantoran Komersial' },
    { icon: 'Factory', name: 'Pabrik & Kawasan Industri' },
    { icon: 'Store', name: 'Mall & Pusat Perbelanjaan' },
    { icon: 'Activity', name: 'Rumah Sakit & Fasilitas Medis' },
    { icon: 'Truck', name: 'Pergudangan & Logistik' },
    { icon: 'GraduationCap', name: 'Institusi Pendidikan' }
  ]

  const sectors = (showcaseData?.sectors && showcaseData.sectors.length > 0) ? showcaseData.sectors : defaultSectors

  const ctaText = showcaseData?.ctaText || 'Konsultasi Kebutuhan Mitra →'
  const ctaLink = showcaseData?.ctaLink || '#contact'
  const profileText = showcaseData?.profileText || 'Profil Perusahaan'
  const profileLink = showcaseData?.profileLink || '#about'

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-500 flex flex-col justify-between ${
      isDarkMode
        ? 'bg-[#0E111A]/95 border-gray-800 text-white shadow-black/60'
        : 'bg-white/95 border-gray-200/90 text-gray-900 shadow-xl shadow-gray-200/40'
    } backdrop-blur-xl p-6 sm:p-7 space-y-5 group`}>
      {/* INTERACTIVE TAB NAVIGATION */}
      <div className="relative z-10 flex items-center bg-gray-100 dark:bg-gray-900/90 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-800 text-xs font-black">
        <button
          type="button"
          onClick={() => setActiveTab('strengths')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate flex items-center justify-center gap-1.5 ${
            activeTab === 'strengths'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Keunggulan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate flex items-center justify-center gap-1.5 ${
            activeTab === 'metrics'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
          <span>Metrik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all duration-300 text-center cursor-pointer truncate flex items-center justify-center gap-1.5 ${
            activeTab === 'coverage'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>Sektor</span>
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
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  {renderShowcaseIcon(s.icon, 'w-3.5 h-3.5')}
                </span>
                <h4 className="text-xs font-black tracking-tight leading-tight truncate text-gray-900 dark:text-white">{s.title}</h4>
              </div>
              <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug line-clamp-2 font-medium">
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
              <div className="text-xs font-black tracking-wide truncate text-gray-900 dark:text-white">{m.label}</div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 font-bold truncate">{m.sub}</div>
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
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                isDarkMode
                  ? 'bg-gray-900/60 border-gray-800/80 text-gray-200'
                  : 'bg-gray-50 border-gray-200/80 text-gray-800'
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                {renderShowcaseIcon(sec.icon, 'w-3.5 h-3.5')}
              </span>
              <span className="text-[11px] font-bold tracking-tight truncate">{sec.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* AUTO-CYCLING ROLE TICKER (MINI CAROUSEL) */}
      {roles && roles.length > 0 && (
        <div className="relative z-10 overflow-hidden rounded-xl p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">
            <span className="uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Penempatan Personel Unggulan</span>
            </span>
            <span className="font-mono text-[10px]">{currentRoleIndex + 1} / {roles.length}</span>
          </div>

          <div className="flex items-center gap-3 transition-all duration-500">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
              {renderShowcaseIcon(roles[currentRoleIndex]?.icon, 'w-4 h-4')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">
                  {roles[currentRoleIndex]?.title}
                </h5>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 flex-shrink-0">
                  {roles[currentRoleIndex]?.tag}
                </span>
              </div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 truncate font-medium">
                {roles[currentRoleIndex]?.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTION FOOTER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-800 text-xs">
        <a
          href={ctaLink}
          className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl text-center font-black text-white shadow-md transition-all duration-300 hover:opacity-95 uppercase tracking-wider text-[11px] active:scale-95 flex items-center justify-center gap-1.5"
          style={{ backgroundColor: primaryColor }}
        >
          <span>{ctaText}</span>
        </a>
        <a
          href={profileLink}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-center font-bold text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 transition-all text-[11px] active:scale-95"
        >
          {profileText}
        </a>
      </div>

    </div>
  )
}

