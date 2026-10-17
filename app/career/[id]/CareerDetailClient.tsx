// app/career/[id]/CareerDetailClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/components/LanguageContext'
import { CareerItem, DatabaseContent, FooterContent } from '@/lib/db'
import ApplyForm from './ApplyForm'
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  Info,
  Building2,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  X
} from 'lucide-react'

export default function CareerDetailClient({
  job,
  allJobs,
  setting,
  footer,
  hrEmail
}: {
  job: CareerItem
  allJobs: CareerItem[]
  setting: DatabaseContent['setting']
  footer: FooterContent
  hrEmail: string
}) {
  const { locale, t, getFallbackContent } = useLanguage()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sinkronisasi tema dengan document.documentElement & event esu-theme-change
  useEffect(() => {
    const syncTheme = () => {
      const dark = document.documentElement.classList.contains('dark') || localStorage.getItem('esu_site_theme') === 'dark'
      setIsDarkMode(dark)
    }
    syncTheme()
    window.addEventListener('esu-theme-change', syncTheme)
    return () => window.removeEventListener('esu-theme-change', syncTheme)
  }, [])

  // Listener kunci Escape untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowApplyModal(false)
      }
    }
    if (showApplyModal) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showApplyModal])

  const toggleSiteTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    localStorage.setItem('esu_site_theme', next ? 'dark' : 'light')
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    window.dispatchEvent(new Event('esu-theme-change'))
  }

  const fb = getFallbackContent('career', job.id)
  const jobTitle = (locale === 'en' && fb?.title) ? fb.title : job.title
  const jobDesc = (locale === 'en' && fb?.desc) ? fb.desc : job.desc
  const jobReq = (locale === 'en' && fb?.requirements) ? fb.requirements : job.requirements
  const jobLoc = (locale === 'en' && fb?.location) ? fb.location : job.location

  const otherJobs = allJobs.filter((j) => j.id !== job.id && j.isActive).slice(0, 3)

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
            href="/#career"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:underline tracking-wide group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t.common.backToHome}</span>
          </Link>
        </div>

        {/* Header Lowongan */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{job.type}</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{jobLoc}</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            {jobTitle}
          </h1>
        </div>

        {/* Konten 2 Kolom: Detail Tugas di Kiri, Box Lamar di Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Deskripsi Pekerjaan */}
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  {locale === 'en' ? 'Job Description & Responsibilities' : 'Deskripsi & Tanggung Jawab Pekerjaan'}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line text-justify font-medium">
                {jobDesc}
              </p>
            </div>

            {/* Kualifikasi & Persyaratan */}
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  {t.career.mainRequirements}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line text-justify font-medium">
                {jobReq}
              </p>
            </div>

            {/* Panduan Pendaftaran */}
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                  {locale === 'en' ? 'How to Apply' : 'Tata Cara Melamar'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {locale === 'en'
                  ? 'Submit your application and updated Curriculum Vitae (CV) via the official form on this page by clicking the "Apply Now" button. Our talent acquisition team will review and contact shortlisted candidates for the interview session.'
                  : 'Kirimkan lamaran dan Curriculum Vitae (CV) terbaru Anda melalui formulir pendaftaran resmi yang disediakan pada halaman ini dengan mengklik tombol "Lamar Sekarang". Tim rekrutmen kami akan segera menghubungi kandidat terpilih untuk tahapan seleksi wawancara.'}
              </p>
              {hrEmail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  {locale === 'en' ? 'Inquiries about this position? Contact HR at ' : 'Pertanyaan mengenai posisi ini? Hubungi HR di '}
                  <a href={`mailto:${hrEmail}`} className="font-bold underline text-amber-700 dark:text-amber-400 hover:text-amber-800">
                    {hrEmail}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Quick Apply Card (Sticky di Desktop) */}
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6 sticky top-28">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                {locale === 'en' ? 'Quick Application' : 'Pusat Lamaran Cepat'}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{locale === 'en' ? 'Employment' : 'Tipe'}</span>
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white sm:text-right">{job.type}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locale === 'en' ? 'Location' : 'Lokasi'}</span>
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white sm:text-right">{jobLoc}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{locale === 'en' ? 'Company' : 'Perusahaan'}</span>
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white sm:text-right break-words">{setting.siteName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-1">
                <span className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0">{locale === 'en' ? 'Recruitment' : 'Penerimaan'}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider border border-emerald-500/20 w-fit self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {locale === 'en' ? 'Open' : 'Terbuka'}
                </span>
              </div>
            </div>

            {/* Tombol Lamar Sekarang yang memicu Popup Form */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="w-full py-4 px-6 rounded-2xl font-black text-white text-sm uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: setting.primaryColor }}
              >
                <span>{locale === 'en' ? 'Apply Now' : 'Lamar Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center font-medium">
                {locale === 'en' ? 'Submission only via online form' : 'Pendaftaran hanya melalui formulir online'}
              </p>
            </div>
          </div>
        </div>

        {/* Lowongan Lainnya */}
        {otherJobs.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {locale === 'en' ? 'Other Open Positions' : 'Lowongan Kerja Lainnya'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherJobs.map((other) => {
                const otherFb = getFallbackContent('career', other.id)
                const otherTitle = (locale === 'en' && otherFb?.title) ? otherFb.title : other.title
                const otherDesc = (locale === 'en' && otherFb?.desc) ? otherFb.desc : other.desc

                return (
                  <Link
                    key={other.id}
                    href={`/career/${other.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg hover:shadow-2xl transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full inline-block">
                        {other.type}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-1">
                      {otherTitle}
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

      {/* POPUP MODAL FORMULIR LAMARAN */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          showApplyModal
            ? 'opacity-100 pointer-events-auto bg-black/80 backdrop-blur-md'
            : 'opacity-0 pointer-events-none hidden'
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowApplyModal(false)
        }}
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {locale === 'en' ? 'Official Job Application' : 'Formulir Lamaran Pekerjaan'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                {jobTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup form modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ApplyForm careerId={job.id} locale={locale} />
        </div>
      </div>

      {/* TOMBOL KONTROL MELAYANG DI POJOK KANAN BAWAH */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={toggleSiteTheme}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 border backdrop-blur-md cursor-pointer ${
            isDarkMode
              ? 'bg-gray-900/95 text-amber-400 border-gray-700/80 shadow-amber-900/40 hover:bg-gray-800 hover:border-amber-500/50'
              : 'bg-white text-amber-800 border-gray-300 shadow-xl hover:bg-gray-50 hover:border-amber-600/60'
          }`}
          title={isDarkMode ? (locale === 'en' ? 'Switch to Light Mode' : 'Ubah ke Mode Terang') : (locale === 'en' ? 'Switch to Dark Mode' : 'Ubah ke Mode Malam')}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-amber-800" />}
        </button>
      </div>

      <footer className="max-w-5xl mx-auto py-8 px-4 border-t border-gray-200/60 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-semibold gap-3">
        <span>© 2026 {setting.siteName}. All Rights Reserved.</span>
        <div className="flex items-center gap-2 select-none">
          <span>Website by</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">
            lembahtech
          </span>
        </div>
      </footer>
    </div>
  )
}
