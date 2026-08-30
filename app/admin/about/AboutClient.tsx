// app/admin/about/AboutClient.tsx
'use client'
import { useState, useTransition } from 'react'

interface AboutData {
  subtitle?: string
  title?: string
  p1?: string
  p2?: string
  leadershipTitle?: string
  leadershipDesc?: string
  quote?: string
}

export default function AboutClient({ aboutData, saveAboutAction }: { aboutData: AboutData; saveAboutAction: (formData: FormData) => Promise<void> }) {
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* Toast Notifikasi Berhasil */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Perubahan Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Klik tombol Deploy (🚀) di navigasi atas untuk menerbitkan ke halaman utama.</p>
          </div>
        </div>
      </div>

      {/* Header Halaman Admin */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>🏢 Company Profile Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Kelola Seksi About Us (Who We Are)</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Ubah narasi perusahaan, profil kepemimpinan, dan nilai inti korporat.</p>
        </div>
      </div>

      {/* Form Editor */}
      <form 
        action={async (formData) => {
          startTransition(async () => {
            await saveAboutAction(formData)
            setIsDirty(false)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 4000)
          })
        }} 
        onChange={() => setIsDirty(true)} 
        className="bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-800/80 shadow-xl space-y-8"
      >
        <div className="space-y-6">
          <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-3">
            <span>📝</span> Informasi Utama Perusahaan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Sub-Judul (Tag)</label>
              <input 
                type="text" 
                name="subtitle" 
                defaultValue={aboutData.subtitle || ''} 
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Utama Seksi</label>
              <input 
                type="text" 
                name="title" 
                defaultValue={aboutData.title || ''} 
                className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Paragraf Pertama (P1)</label>
            <textarea 
              name="p1" 
              rows={3} 
              defaultValue={aboutData.p1 || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Paragraf Kedua (P2)</label>
            <textarea 
              name="p2" 
              rows={3} 
              defaultValue={aboutData.p2 || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Quote / Slogan Kotak Perusahaan</label>
            <input 
              type="text" 
              name="quote" 
              defaultValue={aboutData.quote || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-gray-800">
          <h2 className="text-sm font-black text-amber-500 tracking-wider uppercase flex items-center gap-2 border-b border-gray-800 pb-3">
            <span>⭐</span> Kotak Pengalaman & Kepemimpinan (Leadership)
          </h2>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Kotak Leadership</label>
            <input 
              type="text" 
              name="leadershipTitle" 
              defaultValue={aboutData.leadershipTitle || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Rekam Jejak / Pengalaman CEO</label>
            <textarea 
              name="leadershipDesc" 
              rows={3} 
              defaultValue={aboutData.leadershipDesc || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl p-4 text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none"
            ></textarea>
          </div>
        </div>

        {/* Tombol Simpan Mengambang */}
        <div className="fixed bottom-6 right-20 z-45">
          <button 
            type="submit" 
            disabled={!isDirty || isPending}
            className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
              !isDirty || isPending
                ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-xl shadow-amber-900/50 hover:scale-105 animate-pulse'
            }`}
          >
            <span>💾 Simpan ke Draft</span>
          </button>
        </div>
      </form>
    </div>
  )
}