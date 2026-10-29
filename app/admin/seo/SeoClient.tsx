// app/admin/seo/SeoClient.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  Globe,
  Search,
  Share2,
  ShieldAlert,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Layers,
  Lock,
  Compass,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  HelpCircle,
  X
} from 'lucide-react'
import type { SeoConfig } from '@/lib/seoConstants'
import { updateSeoAction } from './actions'

interface SitemapItem {
  id: string
  title: string
  url: string
}

interface StaticPageItem {
  label: string
  url: string
  priority: string
  changeFreq: string
}

interface SitemapData {
  totalIndexedUrls: number
  staticPages: StaticPageItem[]
  services: SitemapItem[]
  portfolios: SitemapItem[]
  activeJobs: SitemapItem[]
  galleries: SitemapItem[]
}

interface SeoClientProps {
  initialSeo: SeoConfig
  baseUrl: string
  defaultBaseUrl: string
  currentUserName: string
  sitemapData: SitemapData
}

export default function SeoClient({
  initialSeo,
  baseUrl,
  defaultBaseUrl,
  currentUserName,
  sitemapData,
}: SeoClientProps) {
  const [activeTab, setActiveTab] = useState<'meta' | 'social' | 'robots' | 'sitemap'>('meta')
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Pengaturan SEO berhasil disimpan!')
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [metaTitle, setMetaTitle] = useState(initialSeo.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialSeo.metaDescription || '')
  const [metaKeywords, setMetaKeywords] = useState(initialSeo.metaKeywords || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialSeo.canonicalUrl || '')
  const [ogImageUrl, setOgImageUrl] = useState(initialSeo.ogImageUrl || '')
  const [googleSiteVerification, setGoogleSiteVerification] = useState(initialSeo.googleSiteVerification || '')
  const [indexingRobots, setIndexingRobots] = useState<'all' | 'noindex'>(initialSeo.indexingRobots || 'all')

  const effectiveBaseUrl = canonicalUrl.trim()
    ? (canonicalUrl.trim().startsWith('http') ? canonicalUrl.trim().replace(/\/+$/, '') : `https://${canonicalUrl.trim().replace(/\/+$/, '')}`)
    : (baseUrl || 'https://domain.anda')

  const formatSitemapUrl = (rawUrl: string) => {
    return rawUrl.replace(/^https?:\/\/[^\/]+/, effectiveBaseUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    const formData = new FormData()
    formData.set('metaTitle', metaTitle)
    formData.set('metaDescription', metaDescription)
    formData.set('metaKeywords', metaKeywords)
    formData.set('canonicalUrl', canonicalUrl)
    formData.set('ogImageUrl', ogImageUrl)
    formData.set('googleSiteVerification', googleSiteVerification)
    formData.set('indexingRobots', indexingRobots)

    startTransition(async () => {
      try {
        const res = await updateSeoAction(formData)
        if (res.success) {
          setToastMessage(res.message || 'Pengaturan SEO & Sitemap berhasil diperbarui ke draft!')
          setShowSuccessToast(true)
          setTimeout(() => setShowSuccessToast(false), 4000)
        } else {
          setErrorMsg(res.message || 'Gagal menyimpan pengaturan SEO.')
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan SEO.')
      }
    })
  }

  const titleLength = metaTitle.length
  const descLength = metaDescription.length

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-32 relative">

      {/* TOAST NOTIFIKASI SUKSES (KONSISTEN DENGAN HALAMAN LAIN) */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-gray-300 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-gray-300 font-medium">{toastMessage}</p>
          </div>
        </div>
      </div>

      {/* HEADER & TAB NAVIGASI SECTION (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-4 border-b border-gray-200 dark:border-gray-800 transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Pengaturan SEO &amp; Sitemap
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Konfigurasi metadata mesin pencari (Google &amp; Bing), pratinjau cuplikan sosial, verifikasi domain, dan pemantauan sitemap publik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="seo-settings-form"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Menyimpan...' : 'Simpan Pengaturan SEO'}</span>
            </button>
          </div>
        </div>

        {/* ALERT ERROR */}
        {errorMsg && (
          <div className="px-4 py-3 rounded-lg bg-rose-500/10 border-l-4 border-rose-500 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:opacity-70 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB NAVIGASI SEKSI (KONSISTEN DENGAN HALAMAN ABOUT US & LAINNYA) */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'meta'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>1. Meta &amp; Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>2. Sosial (OG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('robots')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'robots'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3. Perayap &amp; Domain</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sitemap'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>4. Peta Situs</span>
          </button>
        </div>
      </div>

      {/* FORMULIR UTAMA */}
      <form id="seo-settings-form" onSubmit={handleSubmit} className="space-y-6">

        {/* TAB 1: META TAG & GOOGLE SNIPPET */}
        {activeTab === 'meta' && (
          <div className="space-y-6">

            {/* INPUTS CONTAINER */}
            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Metadata Halaman Utama (Default Site Metadata)
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Metadata ini menjadi judul dan cuplikan utama yang dibaca oleh Google saat menampilkan beranda website Anda.
                </p>
              </div>

              {/* META TITLE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Meta Title (Judul di Google)
                  </label>
                  <span className={`text-[11px] font-semibold ${titleLength >= 50 && titleLength <= 60
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : titleLength > 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400'
                    }`}>
                    {titleLength} / 60 karakter {titleLength >= 50 && titleLength <= 60 ? '(Optimal)' : titleLength > 60 ? '(Terpotong di Google)' : ''}
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="PT. EMPAT SINERGI UTAMA — MANPOWER SERVICES"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner"
                  required
                />
                <p className="text-[11px] text-gray-400">
                  Rekomendasi Google: 50–60 karakter agar tidak terpotong dengan tanda titik-titik (...) di layar desktop dan ponsel.
                </p>
              </div>

              {/* META DESCRIPTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Meta Description (Cuplikan Deskripsi Pencarian)
                  </label>
                  <span className={`text-[11px] font-semibold ${descLength >= 140 && descLength <= 160
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : descLength > 160
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-400'
                    }`}>
                    {descLength} / 160 karakter {descLength >= 140 && descLength <= 160 ? '(Optimal)' : descLength > 160 ? '(Terpotong di Google)' : ''}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Tuliskan rangkuman layanan dan keunggulan perusahaan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-normal focus:outline-none focus:border-blue-500 shadow-inner resize-y"
                  required
                />
                <p className="text-[11px] text-gray-400">
                  Rekomendasi Google: 140–160 karakter. Berikan ringkasan menarik yang mendorong calon klien mengklik website Anda.
                </p>
              </div>

              {/* META KEYWORDS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Meta Keywords (Kata Kunci Pencarian Utama)
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="outsourcing, manpower services, penyedia tenaga kerja, jasa cleaning service, security"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <p className="text-[11px] text-gray-400">
                  Pisahkan setiap kata kunci dengan tanda koma (,). Masukkan istilah yang biasa dicari oleh calon klien korporat.
                </p>
              </div>
            </div>

            {/* LIVE SIMULATOR: GOOGLE SEARCH SNIPPET PREVIEW */}
            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Simulasi Cuplikan Hasil Pencarian Google
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Pratinjau Nyata</span>
              </div>

              {/* MOCKUP GOOGLE SEARCH CARD */}
              <div className="p-4 sm:p-5 rounded-xl bg-gray-50/80 dark:bg-[#0A0C13] border border-gray-200/80 dark:border-gray-800/90 font-sans space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-[10px] font-black text-amber-600">
                    4S
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-medium text-gray-900 dark:text-gray-100 truncate">
                      PT. Empat Sinergi Utama
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {effectiveBaseUrl}
                    </span>
                  </div>
                </div>

                <div className="pt-0.5">
                  <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                    {metaTitle || 'PT. EMPAT SINERGI UTAMA — MANPOWER SERVICES'}
                  </h4>
                </div>

                <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {metaDescription || 'Penyedia solusi terintegrasi kebutuhan operasional bisnis, manajemen fasilitas gedung, dan pemenuhan ketenagakerjaan ahli di Indonesia.'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SOCIAL SHARE / OPEN GRAPH */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Open Graph &amp; Banner Berbagi Sosial
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gambar banner dan deskripsi yang otomatis tampil saat link website dibagikan ke WhatsApp, LinkedIn, Facebook, atau Telegram.
                </p>
              </div>

              {/* OG IMAGE URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  URL Gambar Banner Sosial (Open Graph Image)
                </label>
                <input
                  type="text"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  placeholder="https://domain.anda/images/og-banner.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <p className="text-[11px] text-gray-400">
                  Rekomendasi dimensi gambar: <strong>1200 x 630 pixel</strong> (rasio 1.91:1) format JPG/PNG/WebP. Jika dikosongkan, sistem otomatis menggunakan logo perusahaan.
                </p>
              </div>
            </div>

            {/* LIVE SIMULATOR: WHATSAPP & LINKEDIN CARD PREVIEW */}
            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Simulasi Kartu Berbagi WhatsApp &amp; Media Sosial
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">WhatsApp / LinkedIn</span>
              </div>

              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0E1017] shadow-sm">
                <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
                  {ogImageUrl ? (
                    <img
                      src={ogImageUrl}
                      alt="Pratinjau Sosial"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Globe className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-500">Pratinjau Banner Default</span>
                      <span className="text-[10px] text-gray-400">1200 × 630 px</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1 bg-white dark:bg-[#13161F]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                    {effectiveBaseUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {metaTitle || 'PT. EMPAT SINERGI UTAMA — MANPOWER SERVICES'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {metaDescription || 'Penyedia solusi terintegrasi kebutuhan operasional bisnis dan tenaga kerja ahli.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ROBOTS & VERIFICATION */}
        {activeTab === 'robots' && (
          <div className="space-y-6">

            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Kebijakan Robot Perayap Mesin Pencari (robots.txt &amp; Meta Robots)
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Atur apakah mesin pencari diizinkan mencatat dan menampilkan seluruh halaman website Anda di hasil pencarian.
                </p>
              </div>

              {/* ROBOTS DIRECTIVE SELECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${indexingRobots === 'all'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}>
                  <input
                    type="radio"
                    name="indexingRobots"
                    value="all"
                    checked={indexingRobots === 'all'}
                    onChange={() => setIndexingRobots('all')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold block">Izinkan Mesin Pencari (index, follow)</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block leading-relaxed">
                      <strong>Rekomendasi Produksi.</strong> Google, Bing, dan mesin pencari lainnya diizinkan merayapi dan menampilkan halaman publik website Anda.
                    </span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${indexingRobots === 'noindex'
                  ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}>
                  <input
                    type="radio"
                    name="indexingRobots"
                    value="noindex"
                    checked={indexingRobots === 'noindex'}
                    onChange={() => setIndexingRobots('noindex')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                      Blokir Mesin Pencari (noindex, nofollow)
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block leading-relaxed">
                      <strong>Mode Pemeliharaan / Uji Coba.</strong> Melarang Google mengindeks website jika sedang perbaikan total agar tidak muncul di pencarian.
                    </span>
                  </div>
                </label>
              </div>

              {/* DOMAIN UTAMA RESMI (CANONICAL URL) */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Domain Utama Resmi (Canonical URL)
                  </label>
                  {canonicalUrl && (
                    <button
                      type="button"
                      onClick={() => setCanonicalUrl('')}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-semibold"
                    >
                      Reset ke Default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  name="canonicalUrl"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://domain.anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>
                    URL dasar website Anda. Masukkan domain resmi perusahaan Anda (misal: <code>https://domain.anda</code> atau <code>domain.anda</code>). Sistem otomatis menggunakannya untuk sitemap.xml dan seluruh tautan publik.
                  </span>
                  <span>
                    URL Aktif: <strong className="font-mono text-blue-600 dark:text-blue-400">{effectiveBaseUrl}</strong>
                  </span>
                </div>
              </div>

              {/* GOOGLE SITE VERIFICATION TOKEN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Kode Verifikasi Google Search Console (HTML Tag Content)
                </label>
                <input
                  type="text"
                  value={googleSiteVerification}
                  onChange={(e) => setGoogleSiteVerification(e.target.value)}
                  placeholder="misal: aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#090A0F] text-gray-900 dark:text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <p className="text-[11px] text-gray-400">
                  Masukkan nilai kode dari tag <code>&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot;&gt;</code> yang diberikan Google Search Console saat verifikasi domain.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: SITEMAP MONITOR */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">

            {/* STATUS RINGKASAN SITEMAP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13161F]">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase">Total URL Sitemap</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
                  {sitemapData.totalIndexedUrls}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13161F]">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase">Layanan Terdaftar</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                  {sitemapData.services.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13161F]">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase">Lowongan Karir Aktif</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  {sitemapData.activeJobs.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13161F]">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase">Portofolio &amp; Galeri</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-1 tabular-nums">
                  {sitemapData.portfolios.length + sitemapData.galleries.length}
                </div>
              </div>
            </div>

            {/* SHORTCUT FILE LANGSUNG */}
            <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Tautan Langsung Berkas Peta Situs &amp; Robot
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Berkas ini dihasilkan secara otomatis dan selalu sinkron dengan database konten CMS Anda.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>Buka /sitemap.xml</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>Buka /robots.txt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* DAFTAR URL SITEMAP */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Daftar Rincian Halaman Terdaftar di Sitemap ({sitemapData.totalIndexedUrls} URL):
                </h4>

                <div className="space-y-1.5">
                  {/* Halaman Statis */}
                  {sitemapData.staticPages.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#0A0C13] border border-gray-200/60 dark:border-gray-800/60 text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">{p.label}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">{formatSitemapUrl(p.url)}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 shrink-0">
                        P: {p.priority} · {p.changeFreq}
                      </span>
                    </div>
                  ))}

                  {/* Layanan */}
                  {sitemapData.services.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#0A0C13] border border-gray-200/60 dark:border-gray-800/60 text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">Layanan: {s.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">{formatSitemapUrl(s.url)}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 shrink-0">
                        Layanan (P: 0.8)
                      </span>
                    </div>
                  ))}

                  {/* Karir */}
                  {sitemapData.activeJobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#0A0C13] border border-gray-200/60 dark:border-gray-800/60 text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">Lowongan: {j.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">{formatSitemapUrl(j.url)}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 shrink-0">
                        Karir Aktif (P: 0.9)
                      </span>
                    </div>
                  ))}

                  {/* Portofolio */}
                  {sitemapData.portfolios.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#0A0C13] border border-gray-200/60 dark:border-gray-800/60 text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">Portofolio: {p.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">{formatSitemapUrl(p.url)}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 shrink-0">
                        Portofolio (P: 0.8)
                      </span>
                    </div>
                  ))}

                  {/* Galeri */}
                  {sitemapData.galleries.map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#0A0C13] border border-gray-200/60 dark:border-gray-800/60 text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">Galeri: {g.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono block truncate">{formatSitemapUrl(g.url)}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-500/10 text-gray-600 shrink-0">
                        Galeri (P: 0.6)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PANDUAN SUBMIT KE GOOGLE */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs space-y-2 text-blue-950 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Panduan Submit ke Google Search Console:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Buka dashboard <strong>Google Search Console</strong> dan tambahkan properti domain resmi Anda.</li>
                  <li>Pada menu sebelah kiri, pilih <strong>Sitemaps (Peta Situs)</strong>.</li>
                  <li>Masukkan URL: <code>sitemap.xml</code> lalu klik tombol <strong>Kirim (Submit)</strong>.</li>
                  <li>Google akan mulai merayapi seluruh halaman yang terdaftar di atas secara otomatis.</li>
                </ol>
              </div>

            </div>

          </div>
        )}

      </form>
    </div>
  )
}

