// app/career/[id]/CareerDetailClient.tsx
'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/components/LanguageContext'
import { CareerItem } from '@/lib/db'

export default function CareerDetailClient({
  job,
  allJobs,
  setting,
  footer
}: {
  job: CareerItem
  allJobs: CareerItem[]
  setting: any
  footer: any
}) {
  const { locale, t, getFallbackContent } = useLanguage()

  const fb = getFallbackContent('career', job.id)
  const jobTitle = (locale === 'en' && fb?.title) ? fb.title : job.title
  const jobDesc = (locale === 'en' && fb?.desc) ? fb.desc : job.desc
  const jobReq = (locale === 'en' && fb?.requirements) ? fb.requirements : job.requirements
  const jobLoc = (locale === 'en' && fb?.location) ? fb.location : job.location

  const otherJobs = allJobs.filter((j) => j.id !== job.id && j.isActive).slice(0, 3)

  const waNumber = (footer?.whatsapp || footer?.phone || '').replace(/[^0-9]/g, '')
  const waMessage = encodeURIComponent(
    locale === 'en'
      ? `Hello PT ESU HR Team, I am interested in applying for the position: ${jobTitle}`
      : `Halo Tim HR PT ESU, saya ingin melamar pekerjaan untuk posisi: ${jobTitle}`
  )

  const mailtoLink = `mailto:${footer?.email || 'hr@esu.co.id'}?subject=${encodeURIComponent(
    `Lamaran Pekerjaan: ${jobTitle} - [Nama Lengkap Pelamar]`
  )}&body=${encodeURIComponent(
    `Halo Tim HR ${setting.siteName},\n\nSaya ingin mengajukan lamaran pekerjaan untuk posisi ${jobTitle}.\nBerikut terlampir Curriculum Vitae (CV) dan dokumen pendukung saya.\n\nTerima kasih.`
  )}`

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
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 hover:underline tracking-wide"
          >
            <span>&larr;</span>
            <span>{t.common.backToHome}</span>
          </Link>
        </div>

        {/* Header Lowongan */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
              {job.type}
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              📍 {jobLoc}
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
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
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
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
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
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                📌 {locale === 'en' ? 'How to Apply' : 'Tata Cara Melamar'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {locale === 'en'
                  ? 'Send your updated Curriculum Vitae (CV) along with required certificates via WhatsApp or email directly to our talent acquisition team. Shortlisted candidates will be contacted for an interview session.'
                  : 'Kirimkan Curriculum Vitae (CV) terbaru beserta berkas sertifikasi pendukung melalui WhatsApp atau email langsung ke tim rekrutmen kami. Kandidat terpilih akan segera dihubungi untuk tahapan seleksi wawancara.'}
              </p>
            </div>
          </div>

          {/* Quick Apply Card (Sticky di Desktop) */}
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6 sticky top-28">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {locale === 'en' ? 'Quick Application' : 'Pusat Lamaran Cepat'}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">{locale === 'en' ? 'Employment' : 'Tipe'}</span>
                <span className="font-bold text-gray-900 dark:text-white">{job.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">{locale === 'en' ? 'Location' : 'Lokasi'}</span>
                <span className="font-bold text-gray-900 dark:text-white">{jobLoc}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">{locale === 'en' ? 'Company' : 'Perusahaan'}</span>
                <span className="font-bold text-gray-900 dark:text-white">{setting.siteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">{locale === 'en' ? 'Recruitment' : 'Penerimaan'}</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {locale === 'en' ? 'Open' : 'Terbuka'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 rounded-xl text-xs sm:text-sm font-black text-white text-center bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>{locale === 'en' ? 'Apply via WhatsApp' : 'Lamar via WhatsApp'}</span>
                </a>
              )}

              {footer?.email && (
                <a
                  href={mailtoLink}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black text-gray-800 dark:text-gray-200 text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 shadow-sm transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>✉️</span>
                  <span>{locale === 'en' ? 'Send Application Email' : 'Kirim Email Lamaran'}</span>
                </a>
              )}
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
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full inline-block">
                      {other.type}
                    </span>
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
    </div>
  )
}
