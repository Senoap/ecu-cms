// app/admin/AdminPageClient.tsx
'use client'
import { useState, useMemo, useTransition } from 'react'
import { extractColorPalette } from '@/lib/colorExtractor'
import { Save, Building2, Eye, Image as ImageIcon, Users, Award, Shield, Layers, FileDown } from 'lucide-react'

interface Section {
  id: string
  label: string
  isVisible: boolean
  order: number
  type?: string
}

interface AdminPageClientProps {
  initialSetting: {
    siteName: string
    tagline: string
    primaryColor: string
    secondaryColor?: string
    accentColor?: string
    loadingBgColor?: string
    slideDuration: number
    logoUrl?: string
    bgImageUrl?: string
    showLeadership?: boolean
    showCertifications?: boolean
    showCompro?: boolean
    leadershipLabel?: string
  }
  initialSections: Section[]
  updateConfigAction: (formData: FormData) => Promise<void>
}

const PRESET_PALETTES = [
  {
    name: '4SU Royal Prestige',
    desc: 'Maroon & Emas Mewah',
    primary: '#7E1D0C',
    secondary: '#D4AF37',
    accent: '#1E293B',
    loading: '#7E1D0C',
  },
  {
    name: 'Executive Sapphire',
    desc: 'Navy Korporat & Amber',
    primary: '#0F2537',
    secondary: '#F59E0B',
    accent: '#334155',
    loading: '#0F2537',
  },
  {
    name: 'Corporate Emerald',
    desc: 'Hijau Zamrud & Emas',
    primary: '#064E3B',
    secondary: '#EAB308',
    accent: '#18181B',
    loading: '#064E3B',
  },
  {
    name: 'Obsidian Ruby',
    desc: 'Hitam Pekat & Merah Ruby',
    primary: '#991B1B',
    secondary: '#FBBF24',
    accent: '#111827',
    loading: '#991B1B',
  },
  {
    name: 'Modern Cobalt',
    desc: 'Biru Elektrik & Cyan',
    primary: '#1E3A8A',
    secondary: '#06B6D4',
    accent: '#1E1B4B',
    loading: '#1E3A8A',
  },
]

export default function AdminPageClient({ initialSetting, initialSections, updateConfigAction }: AdminPageClientProps) {
  const [sections, setSections] = useState<Section[]>(
    [...initialSections].sort((a, b) => a.order - b.order)
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Controlled form states
  const [siteName, setSiteName] = useState(initialSetting.siteName || '')
  const [tagline, setTagline] = useState(initialSetting.tagline || '')
  const [primaryColor, setPrimaryColor] = useState(initialSetting.primaryColor || '#7E1D0C')
  const [secondaryColor, setSecondaryColor] = useState(initialSetting.secondaryColor || '#D4AF37')
  const [accentColor, setAccentColor] = useState(initialSetting.accentColor || '#1E293B')
  const [loadingBgColor, setLoadingBgColor] = useState(initialSetting.loadingBgColor || initialSetting.primaryColor || '#7E1D0C')
  const [slideDuration, setSlideDuration] = useState(Number(initialSetting.slideDuration) || 3)
  const [showLeadership, setShowLeadership] = useState(initialSetting.showLeadership !== false)
  const [leadershipLabel, setLeadershipLabel] = useState(initialSetting.leadershipLabel || 'Profil Pimpinan')
  const [showCertifications, setShowCertifications] = useState(initialSetting.showCertifications !== false)
  const [showCompro, setShowCompro] = useState(initialSetting.showCompro !== false)
  const [hasLogoFile, setHasLogoFile] = useState(false)
  const [hasBgImageFile, setHasBgImageFile] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  // Baseline data tersimpan untuk evaluasi reaktif
  const initialSectionsNormalized = useMemo(() => {
    return [...initialSections]
      .sort((a, b) => a.order - b.order)
      .map((s, idx) => ({ id: s.id, isVisible: s.isVisible, order: idx + 1, label: (s.label || '').trim() }))
  }, [initialSections])

  const [savedBaseline, setSavedBaseline] = useState(() => ({
    siteName: (initialSetting.siteName || '').trim(),
    tagline: (initialSetting.tagline || '').trim(),
    primaryColor: (initialSetting.primaryColor || '#7E1D0C').toLowerCase(),
    secondaryColor: (initialSetting.secondaryColor || '#D4AF37').toLowerCase(),
    accentColor: (initialSetting.accentColor || '#1E293B').toLowerCase(),
    loadingBgColor: (initialSetting.loadingBgColor || initialSetting.primaryColor || '#7E1D0C').toLowerCase(),
    slideDuration: Number(initialSetting.slideDuration) || 3,
    showLeadership: initialSetting.showLeadership !== false,
    leadershipLabel: (initialSetting.leadershipLabel || 'Profil Pimpinan').trim(),
    showCertifications: initialSetting.showCertifications !== false,
    showCompro: initialSetting.showCompro !== false,
    sections: initialSectionsNormalized,
  }))

  // Evaluasi isDirty dinamis: hanya bernilai TRUE jika ada perbedaan aktual dengan baseline data
  const isDirty = useMemo(() => {
    if (hasLogoFile || hasBgImageFile) return true
    const current = {
      siteName: (siteName || '').trim(),
      tagline: (tagline || '').trim(),
      primaryColor: (primaryColor || '#7E1D0C').toLowerCase(),
      secondaryColor: (secondaryColor || '#D4AF37').toLowerCase(),
      accentColor: (accentColor || '#1E293B').toLowerCase(),
      loadingBgColor: (loadingBgColor || primaryColor || '#7E1D0C').toLowerCase(),
      slideDuration: Number(slideDuration) || 3,
      showLeadership,
      leadershipLabel: (leadershipLabel || 'Profil Pimpinan').trim(),
      showCertifications,
      showCompro,
      sections: sections.map((s, idx) => ({ id: s.id, isVisible: s.isVisible, order: idx + 1, label: (s.label || '').trim() })),
    }
    return JSON.stringify(current) !== JSON.stringify(savedBaseline)
  }, [
    siteName, tagline, primaryColor, secondaryColor, accentColor, loadingBgColor,
    slideDuration, showLeadership, leadershipLabel, showCertifications, showCompro, sections,
    hasLogoFile, hasBgImageFile, savedBaseline
  ])

  // No-op setter untuk kompatibilitas jika ada fungsi yang memanggil setIsDirty
  const setIsDirty = (_val: boolean) => {}

  // Terapkan Palet Preset
  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    setAccentColor(preset.accent)
    setLoadingBgColor(preset.loading)
  }

  // Auto-generate 3 warna sekaligus dari logo
  const handleAutoGenerateColor = async () => {
    if (!initialSetting.logoUrl) {
      alert('Tidak ada logo aktif yang dapat dibaca. Silakan simpan/unggah logo terlebih dahulu.')
      return
    }

    setIsExtracting(true)
    try {
      const palette = await extractColorPalette(initialSetting.logoUrl)
      setPrimaryColor(palette.primary)
      setSecondaryColor(palette.secondary)
      setAccentColor(palette.accent)
      setLoadingBgColor(palette.primary)
      alert(`Berhasil mendeteksi kombinasi 3 warna dari logo:\n• Warna Utama: ${palette.primary}\n• Warna Sekunder: ${palette.secondary}\n• Warna Tersier: ${palette.accent}`)
    } catch (error) {
      console.error(error)
      alert('Gagal membaca warna dari logo. Pastikan format gambar valid.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const updatedSections = [...sections]
    const [movedItem] = updatedSections.splice(draggedIndex, 1)
    updatedSections.splice(dropIndex, 0, movedItem)

    setSections(updatedSections)
    setDraggedIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Menyimpan form data terpadu ke database
    formData.set('siteName', siteName)
    formData.set('tagline', tagline)
    formData.set('primaryColor', primaryColor)
    formData.set('secondaryColor', secondaryColor)
    formData.set('accentColor', accentColor)
    formData.set('loadingBgColor', loadingBgColor)
    formData.set('slideDuration', String(slideDuration))
    formData.set('showLeadership', showLeadership ? 'on' : 'off')
    formData.set('leadershipLabel', leadershipLabel)
    formData.set('showCertifications', showCertifications ? 'on' : 'off')
    formData.set('showCompro', showCompro ? 'on' : 'off')

    sections.forEach((sec, idx) => {
      formData.set(`order_${sec.id}`, String(idx + 1))
      if (sec.isVisible) {
        formData.set(`visible_${sec.id}`, 'on')
      } else {
        formData.delete(`visible_${sec.id}`)
      }
      formData.set(`label_${sec.id}`, sec.label)
    })

    startTransition(async () => {
      await updateConfigAction(formData)
      setSavedBaseline({
        siteName: (siteName || '').trim(),
        tagline: (tagline || '').trim(),
        primaryColor: (primaryColor || '#7E1D0C').toLowerCase(),
        secondaryColor: (secondaryColor || '#D4AF37').toLowerCase(),
        accentColor: (accentColor || '#1E293B').toLowerCase(),
        loadingBgColor: (loadingBgColor || primaryColor || '#7E1D0C').toLowerCase(),
        slideDuration: Number(slideDuration) || 3,
        showLeadership,
        leadershipLabel: (leadershipLabel || 'Profil Pimpinan').trim(),
        showCertifications,
        showCompro,
        sections: sections.map((s, idx) => ({ id: s.id, isVisible: s.isVisible, order: idx + 1, label: (s.label || '').trim() })),
      })
      setHasLogoFile(false)
      setHasBgImageFile(false)
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 4000)
    })
  }

  return (
    <div className="relative">

      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}>
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-gray-300" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-gray-300 font-medium">Masuk ke log notifikasi. Klik tombol Deploy untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 font-sans pb-32">

        {/* Top Header Banner (STICKY) */}
        <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Pengaturan Global &amp; Logo
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Atur identitas korporat, logo resmi, palet warna, urutan seksi, dan simpan perubahan ke draft.
            </p>
          </div>
        </div>

        {/* Identitas & Konfigurasi Card */}
        <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Identitas Korporat & Tampilan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Nama Perusahaan</label>
              <input
                type="text"
                name="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Tagline Website</label>
              <input
                type="text"
                name="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-medium"
              />
            </div>
            
            {/* PRESET PALET WARNA KORPORAT (1-KLIK) */}
            <div className="space-y-3 md:col-span-2 pt-2 border-t border-gray-200 dark:border-gray-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Palet Warna Korporat (3 Warna Harmonis)
                  </label>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                    Pilih preset 1-klik di bawah atau sesuaikan manual 3 warna korporat Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateColor}
                  disabled={isExtracting}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  {isExtracting ? 'Menganalisis Logo...' : 'Auto-Generate 3 Warna dari Logo'}
                </button>
              </div>

              {/* Grid Tombol Preset Palet */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {PRESET_PALETTES.map((p) => {
                  const isCurrent = primaryColor.toUpperCase() === p.primary.toUpperCase() && secondaryColor.toUpperCase() === p.secondary.toUpperCase()
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between space-y-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/30'
                          : 'bg-gray-50 dark:bg-[#090A0F] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-black/10 dark:border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.primary }} />
                        <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.accent }} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-900 dark:text-white leading-tight truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">{p.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3 WARNA KORPORAT DETAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2 pt-2">
              {/* Warna 1: Utama */}
              <div className="space-y-2 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">1. Warna Utama</label>
                  <span className="text-[10px] font-bold text-gray-500">Brand / Header</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="color"
                    name="primaryColorPicker"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="w-10 h-10 bg-transparent rounded-xl cursor-pointer border-0 flex-shrink-0"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Tombol CTA, navbar, dan identitas utama.</p>
              </div>

              {/* Warna 2: Sekunder / Aksen Emas */}
              <div className="space-y-2 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">2. Warna Sekunder</label>
                  <span className="text-[10px] font-bold text-gray-500">Highlight / Aksen</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="color"
                    name="secondaryColorPicker"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="w-10 h-10 bg-transparent rounded-xl cursor-pointer border-0 flex-shrink-0"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Ikon, garis aksen, badge & bintang kepuasan.</p>
              </div>

              {/* Warna 3: Tersier / Slate Contrast */}
              <div className="space-y-2 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-slate-300">3. Warna Tersier</label>
                  <span className="text-[10px] font-bold text-gray-500">Kontras / Kartu</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="color"
                    name="accentColorPicker"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="w-10 h-10 bg-transparent rounded-xl cursor-pointer border-0 flex-shrink-0"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value)
                      setIsDirty(true)
                    }}
                    className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Latar kartu kontras, teks pendukung & tag.</p>
              </div>
            </div>

            {/* WARNA LAYAR LOADING & TRANSISI */}
            <div className="space-y-2 md:col-span-2 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  ⏳ Warna Layar Loading & Transisi Halaman (Custom)
                </label>
                <span className="text-[10px] text-gray-500">Smooth Background</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  name="loadingBgColorPicker"
                  value={loadingBgColor}
                  onChange={(e) => {
                    setLoadingBgColor(e.target.value)
                    setIsDirty(true)
                  }}
                  className="w-10 h-10 bg-transparent rounded-xl cursor-pointer border-0 flex-shrink-0"
                />
                <input
                  type="text"
                  name="loadingBgColor"
                  value={loadingBgColor}
                  onChange={(e) => {
                    setLoadingBgColor(e.target.value)
                    setIsDirty(true)
                  }}
                  className="flex-1 bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLoadingBgColor(primaryColor)
                    setIsDirty(true)
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Samakan dengan Warna Utama
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Warna ini akan digunakan pada layar transisi loading perpindahan halaman dan modal layanan secara halus.
              </p>
            </div>

            {/* LIVE PREVIEW HARMONISASI 3 WARNA */}
            <div className="md:col-span-2 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-[#07090E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /> Live Preview Harmonisasi 3 Warna
                </span>
                <span className="text-[10px] text-gray-500">Real-time Visual Check</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Mode Terang (Light Mode Preview) */}
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-gray-300 text-gray-900 space-y-2 shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">Pratinjau Mode Terang</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black" style={{ color: primaryColor }}>PT 4SU</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs font-bold" style={{ color: secondaryColor }}>Korporat</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">Teks terbaca jelas dengan aksen harmonis.</p>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg text-xs font-black text-white shadow"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Tombol Utama
                  </button>
                </div>

                {/* Mode Gelap (Dark Mode Preview) */}
                <div className="p-4 rounded-xl bg-[#090A0F] border border-gray-800 text-white space-y-2 shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pratinjau Mode Gelap</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">PT 4SU</span>
                    <span className="text-gray-700">|</span>
                    <span className="text-xs font-bold" style={{ color: secondaryColor }}>99.8%</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium">Kontras tinggi & nyaman dibaca di layar gelap.</p>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg text-xs font-black text-white border transition-all"
                    style={{ backgroundColor: primaryColor, borderColor: secondaryColor }}
                  >
                    Tombol Glow
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Durasi Auto-Slide Galeri (Detik)</label>
              <input
                type="number"
                name="slideDuration"
                value={slideDuration}
                onChange={(e) => setSlideDuration(Number(e.target.value) || 3)}
                min={1}
                max={10}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Upload Logo Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800/80 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Upload Logo Perusahaan (Semua Format — Otomatis Dikonversi ke Vektor SVG)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                onChange={(e) => setHasLogoFile(!!(e.target.files && e.target.files.length > 0))}
                className="w-full sm:flex-1 text-gray-600 dark:text-gray-400 text-xs file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white hover:file:bg-gray-300 dark:hover:file:bg-gray-700 cursor-pointer"
              />
              {initialSetting.logoUrl && (
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 self-stretch sm:self-auto justify-center">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Aktif:</span>
                  <img src={initialSetting.logoUrl} alt="Logo Preview" className="h-8 w-auto object-contain bg-white px-2 py-0.5 rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BAGIAN UPLOAD BACKGROUND IMAGE (TAMBAHAN) */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Foto Latar Belakang (Global Background)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Upload Foto Background Baru</label>
              <input
                type="file"
                name="bgImageFile"
                accept="image/*"
                onChange={(e) => setHasBgImageFile(!!(e.target.files && e.target.files.length > 0))}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer"
              />
              <p className="text-[11px] text-gray-500">Dukungan semua format gambar (JPG, PNG, WebP, GIF, SVG, BMP, TIFF, AVIF). Otomatis dikonversi ke WebP tajam &amp; terkompresi efisien.</p>
            </div>

            {initialSetting.bgImageUrl && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Background Aktif Saat Ini</label>
                <div className="h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative bg-black">
                  <img src={initialSetting.bgImageUrl} alt="Background Preview" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modul Visibilitas Tambahan Card */}
        <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-base font-black text-black dark:text-white tracking-wide uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Visibilitas Modul Publik (Pimpinan & Sertifikasi)</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              Aktifkan atau sembunyikan modul khusus jika perusahaan sedang dalam masa perintisan dan belum ingin mempublikasikan pimpinan atau dokumen sertifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Toggle 1: Profil Pimpinan */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#090A0F] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Modul Profil Pimpinan</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="showLeadership"
                      checked={showLeadership}
                      onChange={(e) => setShowLeadership(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-7"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tampilkan halaman /leadership dan submenu di bawah &quot;Tentang Kami&quot;. Jika dinonaktifkan, pimpinan tidak akan ditampilkan di website.
                </p>
              </div>
              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Label Menu / Tombol</label>
                <input
                  type="text"
                  name="leadershipLabel"
                  value={leadershipLabel}
                  onChange={(e) => setLeadershipLabel(e.target.value)}
                  placeholder="Profil Pimpinan"
                  className="w-full bg-white dark:bg-[#10131C] border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Toggle 2: Sertifikasi Perusahaan */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#090A0F] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Modul Sertifikasi</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="showCertifications"
                      checked={showCertifications}
                      onChange={(e) => setShowCertifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-7"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tampilkan halaman /certifications dan submenu di bawah &quot;Tentang Kami&quot;. Jika dinonaktifkan, sertifikasi tidak akan ditampilkan di website.
                </p>
              </div>
            </div>

            {/* Toggle 3: Permintaan Compro PDF */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#090A0F] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Fitur Compro (PDF)</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="showCompro"
                      checked={showCompro}
                      onChange={(e) => setShowCompro(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-7"></div>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tampilkan tombol unduh/permintaan Company Profile di header dan menu navigasi. Jika dinonaktifkan, tombol disembunyikan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tata Letak & Urutan Seksi Card */}
        <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-black dark:text-white tracking-wide uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Tata Letak & Urutan Seksi Website</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Seret dan letakkan (*drag*) kotak seksi untuk mengubah susunan tampilan website.</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              Total: {sections.length} seksi
            </span>

          </div>

          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border transition-all shadow-sm cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-40 border-blue-500 dashed' : 'border-gray-200 dark:border-gray-800/90 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3.5 w-full">
                  <input type="hidden" name={`order_${sec.id}`} value={index + 1} />

                  <div className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 font-bold text-lg select-none px-1" title="Seret untuk geser">
                    ⠿
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0" title={sec.isVisible ? 'Seksi Aktif' : 'Seksi Nonaktif'}>
                    <input
                      type="checkbox"
                      name={`visible_${sec.id}`}
                      checked={sec.isVisible}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setSections(prev => prev.map((s, i) => i === index ? { ...s, isVisible: checked } : s))
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300 ease-in-out"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out peer-checked:translate-x-5"></div>
                  </label>

                  <div className="flex-1">
                    <input
                      type="text"
                      name={`label_${sec.id}`}
                      value={sec.label}
                      onChange={(e) => {
                        const val = e.target.value
                        setSections(prev => prev.map((s, i) => i === index ? { ...s, label: val } : s))
                      }}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-3.5 py-2 text-gray-900 dark:text-white text-xs font-extrabold focus:border-blue-500 focus:outline-none shadow-inner"
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block mt-1">
                      ID: {sec.id} {sec.type ? `• Tipe: ${sec.type}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
        <div style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }} className="fixed right-4 sm:right-6 z-45">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className={`px-5 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${!isDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-black/20 cursor-pointer'
              }`}
            title={isDirty ? 'Simpan perubahan ke draft' : 'Belum ada perubahan untuk disimpan'}
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
  )
}