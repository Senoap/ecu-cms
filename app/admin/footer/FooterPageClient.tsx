// app/admin/footer/FooterPageClient.tsx
'use client'
import { useState, useTransition } from 'react'

interface FooterContent {
  description: string
  address: string
  phone: string
  whatsapp?: string // Tambahan field whatsapp opsional
  email: string
}

interface FooterPageClientProps {
  initialFooter: FooterContent
  updateFooterAction: (formData: FormData) => Promise<void>
}

export default function FooterPageClient({ initialFooter, updateFooterAction }: FooterPageClientProps) {
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
      await updateFooterAction(formData)
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
              <span>📞 Section Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Setting Footer & Kontak</h1>
            <p className="text-gray-400 text-xs md:text-sm font-medium">Ubah informasi kontak interaktif, alamat, dan deskripsi footer website.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} onChange={handleChange} className="bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-800/80 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Footer</label>
            <textarea name="description" rows={3} defaultValue={initialFooter.description} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Alamat Perusahaan</label>
            <input type="text" name="address" defaultValue={initialFooter.address} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" placeholder="Contoh: Jl. Sudirman No. 10, Jakarta Selatan" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Telepon (Seluler)</label>
              <input type="text" name="phone" defaultValue={initialFooter.phone} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" placeholder="021-5551234" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Nomor WhatsApp</label>
              <input type="text" name="whatsapp" defaultValue={initialFooter.whatsapp || initialFooter.phone} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" placeholder="6281234567890" />
              <p className="text-[10px] text-gray-500">Gunakan format kode negara (contoh: 628...)</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Email Tujuan</label>
              <input type="text" name="email" defaultValue={initialFooter.email} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" placeholder="info@perusahaan.com" />
            </div>
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