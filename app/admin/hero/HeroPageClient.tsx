// app/admin/hero/HeroPageClient.tsx
'use client'
import { useState, useTransition } from 'react'

interface HeroContent {
  badge: string
  titleLine1: string
  titleHighlight: string
  description: string
}

interface HeroPageClientProps {
  initialHero: HeroContent
  updateHeroAction: (formData: FormData) => Promise<void>
}

export default function HeroPageClient({ initialHero, updateHeroAction }: HeroPageClientProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleChange = () => {
    if (!isDirty) setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

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

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <span>✨ Section Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Setting Hero Section</h1>
            <p className="text-gray-400 text-xs md:text-sm font-medium">Ubah teks sambutan utama dan banner di halaman depan website, lalu simpan ke draft.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} onChange={handleChange} className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Teks Badge Atas</label>
            <input type="text" name="badge" defaultValue={initialHero.badge} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Baris 1</label>
              <input type="text" name="titleLine1" defaultValue={initialHero.titleLine1} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Sorotan (Warna Utama)</label>
              <input type="text" name="titleHighlight" defaultValue={initialHero.titleHighlight} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi / Paragraf Hero</label>
            <textarea name="description" rows={4} defaultValue={initialHero.description} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"></textarea>
          </div>

          {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
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