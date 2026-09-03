// app/admin/AdminPageClient.tsx
'use client'
import { useState, useTransition } from 'react'
import { extractDominantColor, extractColorPalette } from '@/lib/colorExtractor'

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
  }
  initialSections: Section[]
  updateConfigAction: (formData: FormData) => Promise<void>
}

const PRESET_PALETTES = [
  {
    name: '👑 ESU Royal Prestige',
    desc: 'Maroon & Emas Mewah',
    primary: '#7E1D0C',
    secondary: '#D4AF37',
    accent: '#1E293B',
    loading: '#7E1D0C',
  },
  {
    name: '🏛️ Executive Sapphire',
    desc: 'Navy Korporat & Amber',
    primary: '#0F2537',
    secondary: '#F59E0B',
    accent: '#334155',
    loading: '#0F2537',
  },
  {
    name: '🌲 Corporate Emerald',
    desc: 'Hijau Zamrud & Emas',
    primary: '#064E3B',
    secondary: '#EAB308',
    accent: '#18181B',
    loading: '#064E3B',
  },
  {
    name: '💎 Obsidian Ruby',
    desc: 'Hitam Pekat & Merah Ruby',
    primary: '#991B1B',
    secondary: '#FBBF24',
    accent: '#111827',
    loading: '#991B1B',
  },
  {
    name: '⚡ Modern Cobalt',
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
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // 3 Warna Utama & Warna Layar Loading
  const [primaryColor, setPrimaryColor] = useState(initialSetting.primaryColor || '#7E1D0C')
  const [secondaryColor, setSecondaryColor] = useState(initialSetting.secondaryColor || '#D4AF37')
  const [accentColor, setAccentColor] = useState(initialSetting.accentColor || '#1E293B')
  const [loadingBgColor, setLoadingBgColor] = useState(initialSetting.loadingBgColor || initialSetting.primaryColor || '#7E1D0C')
  const [isExtracting, setIsExtracting] = useState(false)

  // Terapkan Palet Preset
  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    setAccentColor(preset.accent)
    setLoadingBgColor(preset.loading)
    setIsDirty(true)
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
      setIsDirty(true)
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

  const handleDragOver = (e: React.DragEvent, index: number) => {
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
    setIsDirty(true)
  }

  const handleChange = () => {
    if (!isDirty) setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Menyimpan 3 warna korporat + warna loading ke database
    formData.set('primaryColor', primaryColor)
    formData.set('secondaryColor', secondaryColor)
    formData.set('accentColor', accentColor)
    formData.set('loadingBgColor', loadingBgColor)

    startTransition(async () => {
      await updateConfigAction(formData)
      setIsDirty(false)
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
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Masuk ke log notifikasi. Klik tombol Deploy (🚀) untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} onChange={handleChange} className="space-y-8 font-sans pb-32">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#141721] to-[#0E1017] p-8 rounded-3xl shadow-xl border border-gray-800/80 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>⚡ System Core</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Pengaturan Global & Logo</h1>
            <p className="text-gray-400 text-xs md:text-sm font-medium">Atur identitas korporat, logo, urutan seksi, dan simpan perubahan ke draft.</p>
          </div>
        </div>

        {/* Identitas & Konfigurasi Card */}
        <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
              <span>🏢</span> Identitas Korporat & Tampilan
            </h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Setting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Nama Perusahaan</label>
              <input
                type="text"
                name="siteName"
                defaultValue={initialSetting.siteName}
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Tagline Website</label>
              <input
                type="text"
                name="tagline"
                defaultValue={initialSetting.tagline}
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-medium"
              />
            </div>
            
            {/* PRESET PALET WARNA KORPORAT (1-KLIK) */}
            <div className="space-y-3 md:col-span-2 pt-2 border-t border-gray-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
                    🎨 Palet Warna Korporat (3 Warna Harmonis)
                  </label>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Pilih preset 1-klik di bawah atau sesuaikan manual 3 warna korporat Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateColor}
                  disabled={isExtracting}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wider hover:bg-amber-500/30 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  {isExtracting ? '✨ Menganalisis Logo...' : '✨ Auto-Generate 3 Warna dari Logo'}
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
                          ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40'
                          : 'bg-[#090A0F] border-gray-800 hover:border-gray-700 hover:bg-gray-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.primary }} />
                        <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: p.accent }} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white leading-tight truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium truncate">{p.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3 WARNA KORPORAT DETAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2 pt-2">
              {/* Warna 1: Utama */}
              <div className="space-y-2 bg-[#090A0F] p-4 rounded-2xl border border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300">1. Warna Utama</label>
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
                    className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Tombol CTA, navbar, dan identitas utama.</p>
              </div>

              {/* Warna 2: Sekunder / Aksen Emas */}
              <div className="space-y-2 bg-[#090A0F] p-4 rounded-2xl border border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400">2. Warna Sekunder</label>
                  <span className="text-[10px] font-bold text-amber-500/80">Highlight / Aksen</span>
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
                    className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Ikon, garis aksen, badge & bintang kepuasan.</p>
              </div>

              {/* Warna 3: Tersier / Slate Contrast */}
              <div className="space-y-2 bg-[#090A0F] p-4 rounded-2xl border border-gray-800/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300">3. Warna Tersier</label>
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
                    className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">Latar kartu kontras, teks pendukung & tag.</p>
              </div>
            </div>

            {/* WARNA LAYAR LOADING & TRANSISI */}
            <div className="space-y-2 md:col-span-2 bg-[#090A0F] p-4 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300">
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
                  className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLoadingBgColor(primaryColor)
                    setIsDirty(true)
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 cursor-pointer"
                >
                  Samakan dengan Warna Utama
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Warna ini akan digunakan pada layar transisi loading perpindahan halaman dan modal layanan secara halus.
              </p>
            </div>

            {/* LIVE PREVIEW HARMONISASI 3 WARNA */}
            <div className="md:col-span-2 p-5 rounded-2xl border border-gray-800 bg-[#07090E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  👁️ Live Preview Harmonisasi 3 Warna
                </span>
                <span className="text-[10px] text-gray-500">Real-time Visual Check</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Mode Terang (Light Mode Preview) */}
                <div className="p-4 rounded-xl bg-[#F8F7F4] border border-gray-300 text-gray-900 space-y-2 shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">Pratinjau Mode Terang</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black" style={{ color: primaryColor }}>PT ESU</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white" style={{ backgroundColor: secondaryColor }}>
                      PRO
                    </span>
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
                    <span className="text-xs font-black text-white">PT ESU</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                      LIVE
                    </span>
                    <span className="text-xs font-bold" style={{ color: secondaryColor }}>★ 99.8%</span>
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
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Durasi Auto-Slide Galeri (Detik)</label>
              <input
                type="number"
                name="slideDuration"
                defaultValue={initialSetting.slideDuration || 3}
                min={1}
                max={10}
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Upload Logo Section */}
          <div className="pt-4 border-t border-gray-800/80 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Upload Logo Perusahaan (PNG / JPG)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#090A0F] p-4 rounded-2xl border border-gray-800">
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                className="w-full sm:flex-1 text-gray-400 text-xs file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
              />
              {initialSetting.logoUrl && (
                <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 self-stretch sm:self-auto justify-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Aktif:</span>
                  <img src={initialSetting.logoUrl} alt="Logo Preview" className="h-8 w-auto object-contain bg-white px-2 py-0.5 rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BAGIAN UPLOAD BACKGROUND IMAGE (TAMBAHAN) */}
        <div className="space-y-4 pt-6 border-t border-gray-800">
          <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase flex items-center gap-2">
            <span>🖼️</span> Foto Latar Belakang (Global Background)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Upload Foto Background Baru</label>
              <input
                type="file"
                name="bgImageFile"
                accept="image/*"
                className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs cursor-pointer"
              />
              <p className="text-[11px] text-gray-500">Format: JPG, PNG, WebP. Disarankan resolusi tinggi (HD/4K).</p>
            </div>

            {initialSetting.bgImageUrl && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Background Aktif Saat Ini</label>
                <div className="h-28 rounded-2xl overflow-hidden border border-gray-800 relative bg-black">
                  <img src={initialSetting.bgImageUrl} alt="Background Preview" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tata Letak & Urutan Seksi Card */}
        <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
                <span>📋</span> Tata Letak & Urutan Seksi Website
              </h2>
              <p className="text-xs text-gray-400 font-medium">Seret dan letakkan (*drag*) kotak seksi untuk mengubah susunan tampilan website.</p>
            </div>
            <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300 font-bold border border-gray-700/50">
              {sections.length} Seksi Aktif
            </span>

          </div>

          <div className="space-y-3">
            {sections.map((sec, index) => (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center justify-between gap-4 bg-[#090A0F] p-4 rounded-2xl border transition-all shadow-sm cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-40 border-amber-500 dashed' : 'border-gray-800/90 hover:border-gray-700'
                  }`}
              >
                <div className="flex items-center gap-3.5 w-full">
                  <input type="hidden" name={`order_${sec.id}`} value={index + 1} />

                  <div className="text-gray-600 hover:text-gray-400 font-bold text-lg select-none px-1" title="Seret untuk geser">
                    ⠿
                  </div>

                  <input
                    type="checkbox"
                    name={`visible_${sec.id}`}
                    defaultChecked={sec.isVisible}
                    className="w-5 h-5 accent-amber-600 rounded-lg cursor-pointer flex-shrink-0"
                  />

                  <div className="flex-1">
                    <input
                      type="text"
                      name={`label_${sec.id}`}
                      defaultValue={sec.label}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white text-xs font-extrabold focus:border-amber-500 focus:outline-none shadow-inner"
                    />
                    <span className="text-[10px] text-amber-500/90 font-bold uppercase tracking-wider block mt-1">
                      ID: {sec.id} {sec.type ? `• Tipe: ${sec.type}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
        <div className="fixed bottom-6 right-20 z-45">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className={`px-5 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${!isDirty || isPending
                ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-xl shadow-amber-900/50 hover:scale-105 animate-pulse'
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
                <span className="text-base">💾</span>
                <span>Simpan ke Draft</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}