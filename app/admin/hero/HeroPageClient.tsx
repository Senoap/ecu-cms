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
  Check
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
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl hover:border-amber-500 transition-all text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer shadow-xs min-w-[130px] justify-between"
        title="Klik untuk memilih icon"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            {renderShowcaseIcon(value, 'w-3.5 h-3.5')}
          </span>
          <span className="truncate text-left text-[11px]">{value || 'Pilih Icon'}</span>
        </div>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Pilih Icon Showcase</h3>
                <p className="text-xs text-gray-500">Pilih salah satu icon resmi Lucide atau ketik custom icon/emoji.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xs font-bold px-2 py-1 rounded-lg cursor-pointer"
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
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium"
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
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
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
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="truncate flex-1">{item.id}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Manual input fallback */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="text-[11px] text-gray-500 shrink-0">Atau ketik nama / emoji:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Contoh: Shield, Car, ⚡, 🛡️..."
                className="flex-1 bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white"
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

  // Controlled states untuk input teks
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

  // No-op setter untuk menjaga kompatibilitas jika ada fungsi yang memanggil setIsDirty
  const setIsDirty = (_val: boolean) => {}

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
    <div className="relative pb-32">

      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}>
        <div className="bg-amber-950 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <Save className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Perubahan masuk ke draft. Klik tombol Deploy untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER PAGE (SOLID CORPORATE STYLE - NO GLOW BLUR) */}
        <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-800/80 space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Setting Hero Section & Kartu Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
            Atur teks banner sambutan utama serta kelola komponen kartu showcase interaktif di sebelah kanan hero.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BAGIAN 1: TEKS BANNER HERO UTAMA */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <h2 className="text-base font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />Banner
              </h2>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Tag Line</label>
                <input
                  type="text"
                  name="titleLine1"
                  value={titleLine1}
                  onChange={(e) => setTitleLine1(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Highlight</label>
                <input
                  type="text"
                  name="titleHighlight"
                  value={titleHighlight}
                  onChange={(e) => setTitleHighlight(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi</label>
              <textarea
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* BAGIAN 2: KARTU SHOWCASE KORPORAT */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-800/80 space-y-6">

            {/* Saklar Tampil / Sembunyi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Kartu Showcase Korporat
                  </h2>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Aktifkan atau nonaktifkan tampilan kartu showcase interaktif di sebelah kanan banner hero.
                </p>
              </div>

              {/* Saklar Geser ala Apple (iOS Toggle Switch) */}
              <div className="flex items-center gap-3.5 self-start sm:self-auto">
                <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${
                  showcase.enabled
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
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
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    showcase.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
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
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Kelola Isi Tab & Komponen Kartu
                    </label>
                    <span className="text-[11px] text-amber-600 dark:text-amber-500 font-bold">Pilih Tab untuk Mengedit</span>
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
                          className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate flex items-center justify-center gap-1.5 ${active
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white'
                            }`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
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
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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
                                setIsDirty(true)
                              }}
                            />
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...(showcase.strengths || [])]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, strengths: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Judul Keunggulan"
                              className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...(showcase.strengths || [])]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, strengths: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Deskripsi singkat keunggulan..."
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl p-2.5 text-gray-800 dark:text-gray-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: 4 KARTU METRIK & REKAM JEJAK */}
                {activeShowcaseTab === 'metrics' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Atur 4 angka statistik dan pembuktian kinerja korporat:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(showcase.metrics || []).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500">
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
                                setIsDirty(true)
                              }}
                              placeholder="15+"
                              className="bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-amber-700 dark:text-amber-400 text-sm font-black text-center focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const updated = [...(showcase.metrics || [])]
                                updated[idx].label = e.target.value
                                setShowcase((prev) => ({ ...prev, metrics: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Tahun Pengalaman"
                              className="col-span-2 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={item.sub}
                            onChange={(e) => {
                              const updated = [...(showcase.metrics || [])]
                              updated[idx].sub = e.target.value
                              setShowcase((prev) => ({ ...prev, metrics: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Sub-label (e.g. Pimpinan Teruji)"
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-gray-600 dark:text-gray-400 text-[11px] font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: SEKTOR INDUSTRI */}
                {activeShowcaseTab === 'sectors' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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
                              setIsDirty(true)
                            }}
                          />
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => {
                              const updated = [...(showcase.sectors || [])]
                              updated[idx].name = e.target.value
                              setShowcase((prev) => ({ ...prev, sectors: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Nama Sektor"
                            className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ROSTER PENEMPATAN PERSONEL (MINI TICKER) */}
                {activeShowcaseTab === 'roles' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
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
                                setIsDirty(true)
                              }}
                            />
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => {
                                const updated = [...(showcase.roles || [])]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Judul Peran (e.g. Satuan Pengamanan)"
                              className="flex-1 min-w-[200px] bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={r.tag}
                              onChange={(e) => {
                                const updated = [...(showcase.roles || [])]
                                updated[idx].tag = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Tag (e.g. Personel Tersertifikasi)"
                              className="w-full sm:w-44 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={r.desc}
                            onChange={(e) => {
                              const updated = [...(showcase.roles || [])]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, roles: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Deskripsi singkat peran..."
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: TOMBOL CTA & AKSI */}
                {activeShowcaseTab === 'actions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Atur label dan tautan dua tombol aksi di bagian bawah kartu:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-500">
                          Tombol Utama (Primary Action)
                        </span>
                        <input
                          type="text"
                          value={showcase.ctaText || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaText: e.target.value }))
                            setIsDirty(true)
                          }}
                          placeholder="Teks Tombol (e.g. Konsultasi Kebutuhan Mitra →)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={showcase.ctaLink || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaLink: e.target.value }))
                            setIsDirty(true)
                          }}
                          placeholder="Link Target (e.g. #contact atau /career)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-gray-600 dark:text-gray-400 text-xs font-mono"
                        />
                      </div>

                      <div className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-400">
                          Tombol Sekunder (Secondary Action)
                        </span>
                        <input
                          type="text"
                          value={showcase.profileText || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileText: e.target.value }))
                            setIsDirty(true)
                          }}
                          placeholder="Teks Tombol (e.g. Profil Perusahaan)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={showcase.profileLink || ''}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileLink: e.target.value }))
                            setIsDirty(true)
                          }}
                          placeholder="Link Target (e.g. #about)"
                          className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-gray-600 dark:text-gray-400 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 text-center space-y-2 text-gray-600 dark:text-gray-400">
                <span className="text-3xl">⚪</span>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase">Kartu Showcase Sedang Dinonaktifkan</h4>
                <p className="text-xs max-w-md mx-auto">
                  Hero banner di halaman depan akan tampil dengan layout bersih penuh tanpa kartu di sisi kanan. Aktifkan saklar di atas untuk menampilkan kembali.
                </p>
              </div>
            )}

          </div>

          {/* TOMBOL SIMPAN KE DRAFT MELAYANG (SOLID EXECUTIVE STYLE - NO GRADIENT, NO PULSE) */}
          <div className="fixed bottom-6 right-20 z-45">
            <button
              type="submit"
              disabled={!isDirty || isPending}
              className={`px-5 h-12 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border cursor-pointer ${!isDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-md shadow-amber-950/20 active:scale-95'
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
                  <Save className="w-4 h-4" />
                  <span>Simpan ke Draft</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}