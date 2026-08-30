// app/admin/portfolio/PortfolioClient.tsx
'use client'
import { useState, useTransition } from 'react'

interface PortfolioItem {
  id: string
  name: string
  desc?: string
  imageUrl?: string
}

interface PortfolioClientProps {
  portfolios: PortfolioItem[]
  portfolioHeader: { tag?: string; heading?: string; note?: string }
  portfolioSection: { subtitle?: string; title?: string; content?: string }
  saveHeaderAction: (formData: FormData) => Promise<void>
  addPortfolioAction: (formData: FormData) => Promise<void>
  updatePortfolioAction: (formData: FormData) => Promise<void>
  deletePortfolioAction: (formData: FormData) => Promise<void>
}

export default function PortfolioClient({
  portfolios,
  portfolioHeader,
  saveHeaderAction,
  addPortfolioAction,
  updatePortfolioAction,
  deletePortfolioAction,
}: PortfolioClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [isHeaderDirty, setIsHeaderDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('Berhasil Disimpan ke Draft!')

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* Toast Notifikasi */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMsg}</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Klik tombol Deploy (🚀) untuk menerbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex justify-between items-center bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>📁 Portfolio Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Kelola Portofolio Klien & Proyek</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Tambah instansi, deskripsi kerja sama, dan foto/logo proyek.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-950/50 cursor-pointer"
        >
          + Tambah Mitra Baru
        </button>
      </div>

      {/* Form Edit Header Seksi Portofolio */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setIsHeaderDirty(false)
          setToastMsg('Header Portofolio berhasil disimpan ke Draft!')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 4000)
        })
      }} onChange={() => setIsHeaderDirty(true)} className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <span>📝</span> Header & Catatan Seksi Portofolio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Sub-Judul (Badge)</label>
            <input type="text" name="subtitle" defaultValue={portfolioHeader.tag || ''} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Utama</label>
            <input type="text" name="title" defaultValue={portfolioHeader.heading || ''} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Catatan Kaki (Note / Keterangan Bawah)</label>
          <input type="text" name="note" defaultValue={portfolioHeader.note || ''} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-amber-500 font-medium shadow-inner" />
        </div>

        <div className="fixed bottom-6 right-20 z-45">
          <button 
            type="submit" 
            disabled={!isHeaderDirty || isPending}
            className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
              !isHeaderDirty || isPending
                ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-xl shadow-amber-900/50 hover:scale-105 animate-pulse'
            }`}
          >
            <span>💾 Simpan ke Draft</span>
          </button>
        </div>
      </form>

      {/* Daftar Portofolio */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
            <span>🏢</span> Daftar Mitra / Proyek Tersimpan ({portfolios.length})
          </h2>
        </div>

        {portfolios.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-12 font-medium">Belum ada portofolio terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolios.map((item) => (
              <div key={item.id} className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center group hover:border-amber-500/50 transition-colors">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-800 flex-shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                  <p className="text-gray-400 text-xs line-clamp-2">{item.desc || 'Tidak ada deskripsi.'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <form action={async (formData) => {
                    if (!confirm(`Hapus "${item.name}" dari portofolio?`)) return
                    startTransition(async () => {
                      await deletePortfolioAction(formData)
                      setToastMsg('Mitra berhasil dihapus dari Draft!')
                      setShowToast(true)
                      setTimeout(() => setShowToast(false), 4000)
                    })
                  }}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="bg-red-950/40 hover:bg-red-900/60 text-red-300 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer" title="Hapus">
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Mitra */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Tambah Mitra / Proyek Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form action={async (formData) => {
              startTransition(async () => {
                await addPortfolioAction(formData)
                setToastMsg('Mitra baru berhasil disimpan ke Draft!')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 4000)
                setIsAddModalOpen(false)
              })
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Nama Instansi / Klien</label>
                <input type="text" name="name" required placeholder="Contoh: KEMENPORA RI" className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:border-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Upload Foto / Logo Proyek</label>
                <input type="file" name="photoFile" accept="image/*" required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Deskripsi Kerjasama / Proyek</label>
                <textarea name="desc" rows={3} required placeholder="Keterangan singkat proyek..." className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:border-amber-500 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer">
                  {isPending ? 'Menyimpan...' : 'Tambah Mitra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Mitra */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Edit Mitra / Proyek</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form action={async (formData) => {
              startTransition(async () => {
                await updatePortfolioAction(formData)
                setToastMsg('Perubahan berhasil disimpan ke Draft!')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 4000)
                setEditingItem(null)
              })
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingItem.id} />
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Nama Instansi / Klien</label>
                <input type="text" name="name" defaultValue={editingItem.name} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:border-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Ganti Foto / Logo (Opsional)</label>
                <input type="file" name="photoFile" accept="image/*" className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs cursor-pointer" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Deskripsi Kerjasama / Proyek</label>
                <textarea name="desc" rows={3} defaultValue={editingItem.desc} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:border-amber-500 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer">
                  {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}