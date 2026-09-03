// app/admin/hero/HeroPageClient.tsx
'use client'
import { useState, useTransition } from 'react'
import { HeroContent, HeroShowcaseConfig, defaultHeroShowcase } from '@/lib/db'

interface HeroPageClientProps {
  initialHero: HeroContent
  updateHeroAction: (formData: FormData) => Promise<void>
}

export default function HeroPageClient({ initialHero, updateHeroAction }: HeroPageClientProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // State untuk Kartu Showcase Korporat (Nomor 1 & Nomor 2)
  const [showcase, setShowcase] = useState<HeroShowcaseConfig>(
    initialHero.showcaseCard || defaultHeroShowcase
  )
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'strengths' | 'metrics' | 'sectors' | 'roles' | 'actions'>('strengths')

  const handleChange = () => {
    if (!isDirty) setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Menyimpan seluruh konfigurasi kartu showcase (Nomor 1 & 2) dalam bentuk JSON terstruktur
    formData.set('showcaseCardJson', JSON.stringify(showcase))

    startTransition(async () => {
      await updateHeroAction(formData)
      setIsDirty(false)
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 4000)
    })
  }

  return (
    <div className="relative pb-32">
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Masuk ke log notifikasi. Klik tombol Deploy (🚀) untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER PAGE */}
        <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>✨ Section Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Setting Hero Section & Showcase Card</h1>
            <p className="text-gray-400 text-xs md:text-sm font-medium">
              Atur teks banner sambutan utama serta kelola kartu showcase interaktif di sebelah kanan hero.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} onChange={handleChange} className="space-y-8">
          
          {/* BAGIAN 1: TEKS BANNER HERO UTAMA */}
          <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h2 className="text-base font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <span>📝</span> Teks Hero Banner (Sebelah Kiri)
              </h2>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Main Banner</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Teks Badge Atas</label>
              <input 
                type="text" 
                name="badge" 
                defaultValue={initialHero.badge} 
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Baris 1</label>
                <input 
                  type="text" 
                  name="titleLine1" 
                  defaultValue={initialHero.titleLine1} 
                  className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Sorotan (Highlight)</label>
                <input 
                  type="text" 
                  name="titleHighlight" 
                  defaultValue={initialHero.titleHighlight} 
                  className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi / Paragraf Hero</label>
              <textarea 
                name="description" 
                rows={3} 
                defaultValue={initialHero.description} 
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"
              />
            </div>
          </div>

          {/* BAGIAN 2: KARTU SHOWCASE KORPORAT (NOMOR 1 & NOMOR 2) */}
          <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
            
            {/* SAKLAR AKTIF / NONAKTIFKAN KARTU SHOWCASE (NOMOR 2) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  <h2 className="text-base font-black text-white uppercase tracking-wide">
                    Kartu Showcase Korporat (Nomor 2)
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Aktifkan atau nonaktifkan tampilan kartu showcase interaktif di sebelah kanan banner hero.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowcase((prev) => ({ ...prev, enabled: !prev.enabled }))
                  setIsDirty(true)
                }}
                className={`px-5 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md self-start sm:self-auto ${
                  showcase.enabled
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${showcase.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                <span>{showcase.enabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}</span>
              </button>
            </div>

            {/* PENGATURAN DETAIL ISI KONTEN (NOMOR 1) */}
            {showcase.enabled ? (
              <div className="space-y-6 pt-2 animate-fadeIn">
                
                {/* Live Status Badge */}
                <div className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
                    🟢 Teks Status Live Badge (Pojok Kanan Atas Kartu)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={showcase.liveBadgeText || 'SISTEM AKTIF'}
                      onChange={(e) => {
                        setShowcase((prev) => ({ ...prev, liveBadgeText: e.target.value }))
                        setIsDirty(true)
                      }}
                      placeholder="Contoh: SISTEM AKTIF atau VERIFIED ENTERPRISE"
                      className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">Teks ini tampil dengan titik denyut hijau berkedip di pojok kanan kartu.</p>
                </div>

                {/* Sub-Tab Navigasi Editor Isi Kartu */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300">
                      📑 Kelola Isi Tab & Komponen Kartu (Nomor 1)
                    </label>
                    <span className="text-[11px] text-amber-500 font-bold">Pilih Tab untuk Mengedit</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#090A0F] p-1.5 rounded-2xl border border-gray-800">
                    <button
                      type="button"
                      onClick={() => setActiveShowcaseTab('strengths')}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate ${
                        activeShowcaseTab === 'strengths'
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ⭐ Keunggulan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveShowcaseTab('metrics')}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate ${
                        activeShowcaseTab === 'metrics'
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      📊 Metrik
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveShowcaseTab('sectors')}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate ${
                        activeShowcaseTab === 'sectors'
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌐 Sektor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveShowcaseTab('roles')}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate ${
                        activeShowcaseTab === 'roles'
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🔄 Roster Peran
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveShowcaseTab('actions')}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer truncate ${
                        activeShowcaseTab === 'actions'
                          ? 'bg-amber-500 text-gray-950 shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🔗 Tombol CTA
                    </button>
                  </div>
                </div>

                {/* TAB 1: 4 KEUNGGULAN UTAMA (STRENGTHS) */}
                {activeShowcaseTab === 'strengths' && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-gray-400 font-medium">
                      Atur 4 poin keunggulan utama perusahaan yang tampil saat tab Keunggulan aktif:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {showcase.strengths.map((item, idx) => (
                        <div key={idx} className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.icon}
                              onChange={(e) => {
                                const updated = [...showcase.strengths]
                                updated[idx].icon = e.target.value
                                setShowcase((prev) => ({ ...prev, strengths: updated }))
                                setIsDirty(true)
                              }}
                              className="w-12 text-center bg-[#10131C] border border-gray-800 rounded-xl py-1.5 text-base focus:outline-none focus:border-amber-500"
                              title="Ikon Emoji"
                            />
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...showcase.strengths]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, strengths: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Judul Keunggulan"
                              className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...showcase.strengths]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, strengths: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Deskripsi singkat keunggulan..."
                            className="w-full bg-[#10131C] border border-gray-800 rounded-xl p-2.5 text-gray-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: 4 KARTU METRIK & REKAM JEJAK */}
                {activeShowcaseTab === 'metrics' && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-gray-400 font-medium">
                      Atur 4 angka statistik dan pembuktian kinerja korporat:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {showcase.metrics.map((item, idx) => (
                        <div key={idx} className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                              Metrik #{idx + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={item.num}
                              onChange={(e) => {
                                const updated = [...showcase.metrics]
                                updated[idx].num = e.target.value
                                setShowcase((prev) => ({ ...prev, metrics: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="15+"
                              className="bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-amber-400 text-sm font-black text-center focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const updated = [...showcase.metrics]
                                updated[idx].label = e.target.value
                                setShowcase((prev) => ({ ...prev, metrics: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Tahun Pengalaman"
                              className="col-span-2 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={item.sub}
                            onChange={(e) => {
                              const updated = [...showcase.metrics]
                              updated[idx].sub = e.target.value
                              setShowcase((prev) => ({ ...prev, metrics: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Sub-label (e.g. Pimpinan Teruji)"
                            className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-gray-400 text-[11px] font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: SEKTOR INDUSTRI */}
                {activeShowcaseTab === 'sectors' && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-gray-400 font-medium">
                      Atur 6 sektor industri yang dilayani oleh perusahaan:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {showcase.sectors.map((sec, idx) => (
                        <div key={idx} className="bg-[#090A0F] p-3 rounded-2xl border border-gray-800 flex items-center gap-2.5">
                          <input
                            type="text"
                            value={sec.icon}
                            onChange={(e) => {
                              const updated = [...showcase.sectors]
                              updated[idx].icon = e.target.value
                              setShowcase((prev) => ({ ...prev, sectors: updated }))
                              setIsDirty(true)
                            }}
                            className="w-10 text-center bg-[#10131C] border border-gray-800 rounded-xl py-1 text-base focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="text"
                            value={sec.name}
                            onChange={(e) => {
                              const updated = [...showcase.sectors]
                              updated[idx].name = e.target.value
                              setShowcase((prev) => ({ ...prev, sectors: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Nama Sektor"
                            className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: ROSTER PENEMPATAN PERSONEL (MINI CAROUSEL TICKER) */}
                {activeShowcaseTab === 'roles' && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-gray-400 font-medium">
                      Atur peran tenaga kerja yang otomatis berputar pada mini ticker di bagian bawah kartu:
                    </p>
                    <div className="space-y-3">
                      {showcase.roles.map((r, idx) => (
                        <div key={idx} className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={r.icon}
                              onChange={(e) => {
                                const updated = [...showcase.roles]
                                updated[idx].icon = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                                setIsDirty(true)
                              }}
                              className="w-10 text-center bg-[#10131C] border border-gray-800 rounded-xl py-1 text-base focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={r.title}
                              onChange={(e) => {
                                const updated = [...showcase.roles]
                                updated[idx].title = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Judul Peran (e.g. Satuan Pengamanan)"
                              className="flex-1 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={r.tag}
                              onChange={(e) => {
                                const updated = [...showcase.roles]
                                updated[idx].tag = e.target.value
                                setShowcase((prev) => ({ ...prev, roles: updated }))
                                setIsDirty(true)
                              }}
                              placeholder="Tag Badge (e.g. Tersertifikasi)"
                              className="w-36 bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-amber-400 text-xs font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={r.desc}
                            onChange={(e) => {
                              const updated = [...showcase.roles]
                              updated[idx].desc = e.target.value
                              setShowcase((prev) => ({ ...prev, roles: updated }))
                              setIsDirty(true)
                            }}
                            placeholder="Deskripsi singkat tugas peran..."
                            className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-gray-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: TOMBOL TINDAKAN CTA */}
                {activeShowcaseTab === 'actions' && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-xs text-gray-400 font-medium">
                      Atur label teks dan tautan aksi tombol di bagian bawah kartu:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-2">
                        <label className="text-xs font-black uppercase text-amber-400">Tombol Utama (CTA)</label>
                        <input
                          type="text"
                          value={showcase.ctaText || 'Konsultasi Kebutuhan Mitra →'}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaText: e.target.value }))
                            setIsDirty(true)
                          }}
                          className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          placeholder="Teks Tombol"
                        />
                        <input
                          type="text"
                          value={showcase.ctaLink || '#contact'}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, ctaLink: e.target.value }))
                            setIsDirty(true)
                          }}
                          className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-gray-400 text-xs font-medium focus:outline-none focus:border-amber-500"
                          placeholder="Link (e.g. #contact)"
                        />
                      </div>

                      <div className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 space-y-2">
                        <label className="text-xs font-black uppercase text-gray-300">Tombol Sekunder</label>
                        <input
                          type="text"
                          value={showcase.profileText || 'Profil Perusahaan'}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileText: e.target.value }))
                            setIsDirty(true)
                          }}
                          className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          placeholder="Teks Tombol"
                        />
                        <input
                          type="text"
                          value={showcase.profileLink || '#about'}
                          onChange={(e) => {
                            setShowcase((prev) => ({ ...prev, profileLink: e.target.value }))
                            setIsDirty(true)
                          }}
                          className="w-full bg-[#10131C] border border-gray-800 rounded-xl px-3 py-1.5 text-gray-400 text-xs font-medium focus:outline-none focus:border-amber-500"
                          placeholder="Link (e.g. #about)"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#090A0F] border border-gray-800 text-center space-y-2 text-gray-400">
                <span className="text-3xl">⚪</span>
                <h4 className="text-sm font-black text-white uppercase">Kartu Showcase Sedang Dinonaktifkan</h4>
                <p className="text-xs max-w-md mx-auto">
                  Hero banner di halaman depan akan tampil dengan layout bersih penuh tanpa kartu di sisi kanan. Aktifkan saklar di atas untuk menampilkan kembali.
                </p>
              </div>
            )}

          </div>

          {/* TOMBOL SIMPAN KE DRAFT MELAYANG */}
          <div className="fixed bottom-6 right-20 z-45">
            <button 
              type="submit" 
              disabled={!isDirty || isPending}
              className={`px-5 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                !isDirty || isPending
                  ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-xl shadow-amber-900/50 hover:scale-105 animate-pulse'
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
                  <span className="text-base">💾</span>
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