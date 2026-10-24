// app/admin/portfolio/PortfolioClient.tsx
'use client'
import { useState, useTransition, useMemo } from 'react'
import { Save, FolderKanban, Building2, Pencil, Trash2, X } from 'lucide-react'

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
  
  const [subtitle, setSubtitle] = useState(portfolioHeader.tag || '')
  const [title, setTitle] = useState(portfolioHeader.heading || '')
  const [note, setNote] = useState(portfolioHeader.note || '')

  const [headerBaseline, setHeaderBaseline] = useState({
    subtitle: portfolioHeader.tag || '',
    title: portfolioHeader.heading || '',
    note: portfolioHeader.note || '',
  })

  const isHeaderDirty = useMemo(() => {
    return (
      subtitle !== headerBaseline.subtitle ||
      title !== headerBaseline.title ||
      note !== headerBaseline.note
    )
  }, [subtitle, title, note, headerBaseline])

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
          <Save className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMsg}</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Klik tombol Deploy untuk menerbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex justify-between items-center bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm relative overflow-hidden transition-colors">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Portofolio Klien & Proyek</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">Tambah instansi, deskripsi kerja sama, dan foto/logo proyek.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          + Tambah Mitra Baru
        </button>
      </div>

      {/* Form Edit Header Seksi Portofolio */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setHeaderBaseline({ subtitle, title, note })
          setToastMsg('Header Portofolio berhasil disimpan ke Draft!')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 4000)
        })
      }} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6 transition-colors">
        <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span>Header & Catatan Seksi Portofolio</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Sub-Judul (Badge)</label>
            <input 
              type="text" 
              name="subtitle" 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Judul Utama</label>
            <input 
              type="text" 
              name="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Catatan Kaki (Note / Keterangan Bawah)</label>
          <input 
            type="text" 
            name="note" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors" 
          />
        </div>

        <div style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }} className="fixed right-4 sm:right-6 z-45">
          <button 
            type="submit" 
            disabled={!isHeaderDirty || isPending}
            className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
              !isHeaderDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md shadow-black/20 cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan ke Draft</span>
          </button>
        </div>
      </form>

      {/* Daftar Portofolio */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6 transition-colors">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Daftar Mitra / Proyek Tersimpan ({portfolios.length})
          </h2>
        </div>

        {portfolios.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12 font-medium">Belum ada portofolio terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolios.map((item) => (
              <div key={item.id} className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex gap-4 items-center group hover:border-amber-500/50 transition-colors">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-800 flex-shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{item.desc || 'Tidak ada deskripsi.'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-xs font-bold transition-colors border border-blue-200 dark:border-blue-500/30 cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
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
                    <button type="submit" className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 p-2 rounded-lg text-xs font-bold transition-colors border border-red-200 dark:border-red-500/30 cursor-pointer" title="Hapus">
                      <Trash2 className="w-3.5 h-3.5" />
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
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Tambah Mitra / Proyek Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
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
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Nama Instansi / Klien</label>
                <input type="text" name="name" required placeholder="Contoh: KEMENPORA RI" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Upload Foto / Logo Proyek</label>
                <input type="file" name="photoFile" accept="image/*" required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Kerjasama / Proyek</label>
                <textarea name="desc" rows={3} required placeholder="Keterangan singkat proyek..." className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 resize-none transition-colors"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer">
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
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Edit Mitra / Proyek</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
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
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Nama Instansi / Klien</label>
                <input type="text" name="name" defaultValue={editingItem.name} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Ganti Foto / Logo (Opsional)</label>
                <input type="file" name="photoFile" accept="image/*" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Kerjasama / Proyek</label>
                <textarea name="desc" rows={3} defaultValue={editingItem.desc} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 resize-none transition-colors"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer">
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