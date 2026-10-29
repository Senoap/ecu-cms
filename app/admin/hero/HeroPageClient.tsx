// app/admin/hero/HeroPageClient.tsx
'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Save,
  FileText,
  Building2,
  Award,
  BarChart3,
  Globe,
  Users,
  Link2,
  Search,
  Check,
  Sparkles
} from 'lucide-react'
import type { HeroContent } from '@/lib/db'
import { defaultHeroShowcase, type HeroShowcaseConfig } from '@/lib/showcaseConstants'
import { SHOWCASE_ICON_OPTIONS, renderShowcaseIcon } from '@/lib/showcaseIcons'

interface HeroPageClientProps {
  initialHero: HeroContent
  updateHeroAction: (formData: FormData) => Promise<void>
}

// Komponen Pemilih Icon Interaktif
function ShowcaseIconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (newIcon: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')

  const filtered = useMemo(() => {
    return SHOWCASE_ICON_OPTIONS.filter((item) => {
      if (filterCat !== 'all' && item.category !== filterCat) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return item.id.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    })
  }, [search, filterCat])

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl hover:border-gray-400 dark:hover:border-gray-700 transition-all text-xs font-bold text-black dark:text-white cursor-pointer shadow-xs min-w-[130px] justify-between"
        title="Klik untuk memilih icon"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
            {renderShowcaseIcon(value, 'w-3.5 h-3.5')}
          </span>
          <span className="truncate text-left text-[11px] text-black dark:text-white">{value || 'Pilih Icon'}</span>
        </div>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-black dark:text-white">Pilih Icon Showcase</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pilih salah satu icon resmi Lucide atau ketik custom icon/emoji.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Pencarian & Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari icon (contoh: Shield, User, Car, Zap, Building)..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  { id: 'all', label: 'Semua' },
                  { id: 'security', label: 'Keamanan' },
                  { id: 'workforce', label: 'Personel' },
                  { id: 'facilities', label: 'Fasilitas' },
                  { id: 'business', label: 'Kualitas' },
                  { id: 'service', label: 'Layanan' },
                ] as const).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCat(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${filterCat === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Icon Pilihan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1 max-h-64">
              {filtered.map((item) => {
                const isSelected = item.id.toLowerCase() === (value || '').toLowerCase()
                const IconComp = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id)
                      setIsOpen(false)
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left text-xs transition-all cursor-pointer ${isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-black dark:text-white font-black'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 text-black dark:text-white'
                      }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                    <span className="truncate flex-1">{item.id}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Manual input fallback */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">Atau ketik nama / emoji:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Contoh: Shield, Car, ⚡, 🛡️..."
                className="flex-1 bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HeroPageClient({ initialHero, updateHeroAction }: HeroPageClientProps) {
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [mainTab, setMainTab] = useState<'banner' | 'showcase'>('banner')

  // Controlled states untuk input teks banner
  const [titleLine1, setTitleLine1] = useState(initialHero.titleLine1 || '')
  const [titleHighlight, setTitleHighlight] = useState(initialHero.titleHighlight || '')
  const [description, setDescription] = useState(initialHero.description || '')

  // Inisialisasi showcaseCard dengan deep fallback dari defaultHeroShowcase
  const initialShowcase = useMemo<HeroShowcaseConfig>(() => {
    const raw = initialHero.showcaseCard || defaultHeroShowcase
    return {
      ...defaultHeroShowcase,
      ...raw,
      strengths: (raw.strengths && raw.strengths.length > 0) ? raw.strengths : defaultHeroShowcase.strengths,
      metrics: (raw.metrics && raw.metrics.length > 0) ? raw.metrics : defaultHeroShowcase.metrics,
      sectors: (raw.sectors && raw.sectors.length > 0) ? raw.sectors : defaultHeroShowcase.sectors,
      roles: (raw.roles && raw.roles.length > 0) ? raw.roles : defaultHeroShowcase.roles,
    }
  }, [initialHero.showcaseCard])

  const [showcase, setShowcase] = useState<HeroShowcaseConfig>(initialShowcase)

  // Baseline data tersimpan untuk membandingkan perubahan nyata secara reaktif
  const [savedBaseline, setSavedBaseline] = useState(() => ({
    titleLine1: (initialHero.titleLine1 || '').trim(),
    titleHighlight: (initialHero.titleHighlight || '').trim(),
    description: (initialHero.description || '').trim(),
    showcase: initialShowcase,
  }))

  // Evaluasi isDirty dinamis: hanya bernilai TRUE jika ada perbedaan aktual dengan baseline data
  const isDirty = useMemo(() => {
    const current = {
      titleLine1: (titleLine1 || '').trim(),
      titleHighlight: (titleHighlight || '').trim(),
      description: (description || '').trim(),
      showcase,
    }
    return JSON.stringify(current) !== JSON.stringify(savedBaseline)
  }, [titleLine1, titleHighlight, description, showcase, savedBaseline])

  // Sub-tab untuk detail showcase
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'strengths' | 'metrics' | 'sectors' | 'roles' | 'actions'>('strengths')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    formData.set('titleLine1', titleLine1)
    formData.set('titleHighlight', titleHighlight)
    formData.set('description', description)
    formData.set('showcaseCardJson', JSON.stringify(showcase))

    startTransition(async () => {
      await updateHeroAction(formData)
      setSavedBaseline({
        titleLine1: (titleLine1 || '').trim(),
        titleHighlight: (titleHighlight || '').trim(),
        description: (description || '').trim(),
        showcase,
      })
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 4000)
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-32">

      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <Save className="w-5 h-5 text-gray-300 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-gray-300 font-medium">Perubahan masuk ke draft. Klik tombol Deploy untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      {/* HEADER (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Banner Teks Hero
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Atur teks narasi sambutan utama, highlight, serta kelola kartu showcase interaktif di sebelah kanan hero.
          </p>
        </div>
      </div>

      {/* FILTER / SECTION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setMainTab('banner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === 'banner'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 shadow-sm'
              : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>Teks Banner Hero</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab('showcase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === 'showcase'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 shadow-sm'
              : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          <span>Kartu Showcase Korporat</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${showcase.enabled ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
            {showcase.enabled ? 'Aktif' : 'Off'}
          </span>
        </button>
      </div>

      <form id="hero-form" onSubmit={handleSubmit} className="space-y-8">

        {/* ========================================================================= */}
        {/* TAB 1: TEKS BANNER HERO UTAMA                                             */}
        {/* ========================================================================= */}
        {mainTab === 'banner' && (
          <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
                  Narasi & Konten Banner Utama
                </h2>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Halaman Beranda Depan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Tag Line
                </label>
                <input
                  type="text"
                  name="titleLine1"
                  value={titleLine1}
                  onChange={(e) => setTitleLine1(e.target.value)}
                  placeholder="Contoh: Solusi Terpadu & Terpercaya"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Highlight
                </label>
                <input
                  type="text"
                  name="titleHighlight"
                  value={titleHighlight}
                  onChange={(e) => setTitleHighlight(e.target.value)}
                  placeholder="Contoh: Pengamanan & Tenaga Kerja Profesional"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                Deskripsi Singkat Sambutan
              </label>
              <textarea
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan narasi sambutan utama perusahaan di sini..."
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-black dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KARTU SHOWCASE KORPORAT                                            */}
        {/* ========================================================================= */}
        {mainTab === 'showcase' && (
          <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">

            {/* Saklar Tampil / Sembunyi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">
                    Kartu Showcase Korporat
                  </h2>
                </div>
                <p className="text-xs text-black dark:text-white font-medium">
                  Aktifkan atau nonaktifkan tampilan kartu showcase interaktif di sebelah kanan banner hero.
                </p>
              </div>

              {/* Saklar Geser ala Apple (iOS Toggle Switch) */}
              <div className="flex items-center gap-3.5 self-start sm:self-auto">
                <span className="text-xs font-black uppercase tracking-wider select-none text-black dark:text-white">
                  {showcase.enabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={showcase.enabled}
                  aria-label="Toggle Tampilan Kartu Showcase"
                  onClick={() => {
                    setShowcase((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    showcase.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      showcase.enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* PENGATURAN DETAIL ISI KONTEN */}
            {showcase.enabled ? (
              <div className="space-y-6 pt-2">

                {/* Sub-Tab Navigasi Editor Isi Kartu */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                      Kelola Isi Tab & Komponen Kartu
                    </label>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">Pilih Tab untuk Mengedit</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-100 dark:bg-[#090A0F] p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
                    {([
                      { id: 'strengths', label: 'Keunggulan', icon: Award },
                      { id: 'metrics', label: 'Metrik', icon: BarChart3 },
                      { id: 'sectors', label: 'Sektor', icon: Globe },
                      { id: 'roles', label: 'Roster Peran', icon: Users },
                      { id: 'actions', label: 'Tombol CTA', icon: Link2 },
                    ] as const).map((tab) => {
                      const IconComp = tab.icon
                      const active = activeShowcaseTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveShowcaseTab(tab.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate flex items-center justify-center gap-1.5 ${
                            active
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-black dark:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800'
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* TAB 1: 4 KEUNGGULAN UTAMA (STRENGTHS) */}
                {activeShowcaseTab === 'strengths' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-black dark:text-white font-medium">
                        Atur 4 poin keunggulan utama perusahaan beserta icon yang mewakilinya:
                      </p>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {showcase.strengths?.length || 0} Keunggulan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(showcase.strengths || []).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                          <div className="flex items-center gap-2">
                            {/* Pemilih Icon Dinamis */}
                            <ShowcaseIconPicker
                              value={item.icon}
                              onChange={(newIcon) => {
                                const updated = [...(showcase.strengths || [])]
                                updated[idx].icon = newIcon
                                setShowcase((prev) => ({ ...prev, strengths: updated }))
                              }}
                            />
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...(showcase.strengths || [])]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, strengths: updated }))
                              }}
                              placeholder="Judul Keunggulan"
                              className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...(showcase.strengths || [])]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, strengths: updated }))
                            }}
                            placeholder="Deskripsi singkat keunggulan..."
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl p-2.5 text-black dark:text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: 4 KARTU METRIK & REKAM JEJAK */}
                {activeShowcaseTab === 'metrics' && (
                  <div className="space-y-4">
                    <p className="text-xs text-black dark:text-white font-medium">
                      Atur 4 angka statistik dan pembuktian kinerja korporat:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(showcase.metrics || []).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                              Metrik #{idx + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={item.num}
                              onChange={(e) => {
                                const updated = [...(showcase.metrics || [])]
                                updated[idx].num = e.target.value
                                setShowcase((prev) => ({ ...prev, metrics: updated }))
                              }}
                              placeholder="15+"
                              className="bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-sm font-black text-center focus:outline-none focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const updated = [...(showcase.metrics || [])]
                                updated[idx].label = e.target.value
                                setShowcase((prev) => ({ ...prev, metrics: updated }))
                              }}
                              placeholder="Tahun Pengalaman"
                              className="col-span-2 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={item.sub}
                            onChange={(e) => {
                              const updated = [...(showcase.metrics || [])]
                              updated[idx].sub = e.target.value
                              setShowcase((prev) => ({ ...prev, metrics: updated }))
                            }}
                            placeholder="Sub-label (e.g. Pimpinan Teruji)"
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-black dark:text-white text-[11px] font-medium focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: SEKTOR INDUSTRI */}
                {activeShowcaseTab === 'sectors' && (
                  <div className="space-y-4">
                    <p className="text-xs text-black dark:text-white font-medium">
                      Atur 6 sektor industri yang dilayani beserta icon representasinya:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(showcase.sectors || []).map((sec, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#090A0F] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
                          {/* Pemilih Icon Dinamis */}
                          <ShowcaseIconPicker
                            value={sec.icon}
                            onChange={(newIcon) => {
                              const updated = [...(showcase.sectors || [])]
                              updated[idx].icon = newIcon
                              setShowcase((prev) => ({ ...prev, sectors: updated }))
                            }}
                          />
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => {
                              const updated = [...(showcase.sectors || [])]
                              updated[idx].name = e.target.value
                              setShowcase((prev) => ({ ...prev, sectors: updated }))
                            }}
                            placeholder="Nama Sektor"
                            className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ROSTER PENEMPATAN PERSONEL (MINI TICKER) */}
                {activeShowcaseTab === 'roles' && (
                  <div className="space-y-4">
                    <p className="text-xs text-black dark:text-white font-medium">
                      Atur peran tenaga kerja beserta icon penempatan yang berputar di kartu:
                    </p>
                    <div className="space-y-3">
                      {(showcase.roles || []).map((r, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2.5">
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {/* Pemilih Icon Dinamis */}
                            <ShowcaseIconPicker
                              value={r.icon}
                              onChange={(newIcon) => {
                                const updated = [...(showcase.roles || [])]
                                updated[idx].icon = newIcon
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                              }}
                            />
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => {
                                const updated = [...(showcase.roles || [])]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                              }}
                              placeholder="Judul Peran (e.g. Satuan Pengamanan)"
                              className="flex-1 min-w-[200px] bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={r.tag}
                              onChange={(e) => {
                                const updated = [...(showcase.roles || [])]
                                updated[idx].tag = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                              }}
                              placeholder="Tag (e.g. Personel Tersertifikasi)"
                              className="w-full sm:w-44 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-black uppercase tracking-wider focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={r.desc}
                            onChange={(e) => {
                              const updated = [...(showcase.roles || [])]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, roles: updated }))
                            }}
                            placeholder="Deskripsi singkat peran..."
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: TOMBOL CTA & AKSI */}
                {activeShowcaseTab === 'actions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-black dark:text-white font-medium">
                      Atur label dan tautan dua tombol aksi di bagian bawah kartu:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                          Tombol Utama (Primary Action)
                        </span>
                        <input
                          type="text"
                          value={showcase.ctaText || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaText: e.target.value }))
                          }}
                          placeholder="Teks Tombol (e.g. Konsultasi Kebutuhan Mitra →)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={showcase.ctaLink || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaLink: e.target.value }))
                          }}
                          placeholder="Link Target (e.g. #contact atau /career)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                          Tombol Sekunder (Secondary Action)
                        </span>
                        <input
                          type="text"
                          value={showcase.profileText || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileText: e.target.value }))
                          }}
                          placeholder="Teks Tombol (e.g. Profil Perusahaan)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-black dark:text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={showcase.profileLink || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileLink: e.target.value }))
                          }}
                          placeholder="Link Target (e.g. #about)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-black dark:text-white uppercase tracking-wider">Kartu Showcase Sedang Dinonaktifkan</h4>
                <p className="text-xs text-black dark:text-white max-w-md mx-auto leading-relaxed">
                  Hero banner di halaman depan akan tampil dengan layout bersih penuh tanpa kartu di sisi kanan. Aktifkan saklar di atas untuk menampilkan kembali.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TOMBOL SIMPAN KE DRAFT MELAYANG (Hanya muncul jika dirty atau untuk kemudahan akses cepat) */}
        <div style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }} className="fixed right-4 sm:right-6 z-45">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className={`px-5 h-12 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
              !isDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-md shadow-blue-950/20 active:scale-95'
            }`}
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Simpan ke Draft</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
