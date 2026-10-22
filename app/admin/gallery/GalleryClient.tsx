// app/admin/gallery/GalleryClient.tsx
'use client'
import { useState, useTransition, useMemo } from 'react'
import { Save, Image as ImageIcon, Pencil, Trash2, X, Plus } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  desc: string
  category: string
  imageUrl: string
}

interface GalleryClientProps {
  galleries: GalleryItem[]
  gallerySection: { subtitle?: string; title?: string; content?: string }
  saveHeaderAction: (formData: FormData) => Promise<void>
  addGalleryAction: (formData: FormData) => Promise<void>
  updateGalleryAction: (formData: FormData) => Promise<void>
  deleteGalleryAction: (formData: FormData) => Promise<void>
}

export default function GalleryClient({
  galleries,
  gallerySection,
  saveHeaderAction,
  addGalleryAction,
  updateGalleryAction,
  deleteGalleryAction,
}: GalleryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState('')
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  const [subtitle, setSubtitle] = useState(gallerySection.subtitle || '')
  const [title, setTitle] = useState(gallerySection.title || '')
  const [content, setContent] = useState(gallerySection.content || '')

  const [headerBaseline, setHeaderBaseline] = useState({
    subtitle: gallerySection.subtitle || '',
    title: gallerySection.title || '',
    content: gallerySection.content || '',
  })

  const isHeaderDirty = useMemo(() => {
    return (
      subtitle !== headerBaseline.subtitle ||
      title !== headerBaseline.title ||
      content !== headerBaseline.content
    )
  }, [subtitle, title, content, headerBaseline])

  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Berhasil Disimpan ke Draft!')

  // Kumpulan kategori unik yang sudah ada (untuk droplist)
  const savedCategories = Array.from(new Set(galleries.map(g => g.category || 'Umum')))

  const handleOpenAddModal = (defaultCategory = '') => {
    setSelectedCategoryForAdd(defaultCategory)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* Toast Notifikasi */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMessage}</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Masuk ke log notifikasi. Klik tombol Deploy untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex justify-between items-center bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm relative overflow-hidden transition-colors">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Galeri Foto & Kategori</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">Upload foto, pilih/tambah kategori, dan kelola deskripsi.</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenAddModal('')}
          className="relative z-10 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Foto Baru</span>
        </button>
      </div>

      {/* Form Header Seksi Galeri */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setHeaderBaseline({ subtitle, title, content })
          setToastMessage('Header Galeri berhasil disimpan ke Draft!')
          setShowSuccessToast(true)
          setTimeout(() => setShowSuccessToast(false), 4000)
        })
      }} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6 transition-colors">
        <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span>Header & Judul Seksi Galeri</span>
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
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi Singkat</label>
          <textarea 
            name="content" 
            rows={2} 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none transition-colors"
          ></textarea>
        </div>

        <div className="fixed bottom-6 right-20 z-45">
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

      {/* Daftar Foto Galeri Dikelompokkan Perkategori */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-8 transition-colors">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Daftar Foto Galeri Perkategori ({galleries.length} Total Foto)
          </h2>
        </div>

        {savedCategories.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12 font-medium">Belum ada kategori atau foto dalam galeri.</p>
        ) : (
          savedCategories.map((category) => {
            const itemsInCat = galleries.filter(g => (g.category || 'Umum') === category)
            return (
              <div key={category} className="space-y-4 bg-gray-50 dark:bg-[#090A0F] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{category} ({itemsInCat.length})</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(category)}
                    className="text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Foto di Kategori Ini</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {itemsInCat.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-[#10131C] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex gap-4 items-center group transition-colors">
                      <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-800 flex-shrink-0" />
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{item.desc}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 p-2 rounded-lg text-xs font-bold transition-colors border border-blue-200 dark:border-blue-500/30 cursor-pointer"
                          title="Edit Foto & Deskripsi"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <form action={async (formData) => {
                          if (!confirm(`Hapus foto "${item.title}"?`)) return
                          startTransition(async () => {
                            await deleteGalleryAction(formData)
                            setToastMessage('Foto berhasil dihapus dari Draft!')
                            setShowSuccessToast(true)
                            setTimeout(() => setShowSuccessToast(false), 4000)
                          })
                        }}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 p-2 rounded-lg text-xs font-bold transition-colors border border-red-200 dark:border-red-500/30 cursor-pointer" title="Hapus Foto">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Upload Foto Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Upload Foto Galeri Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await addGalleryAction(formData)
                setToastMessage('Foto berhasil disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                setIsModalOpen(false)
              })
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Judul Foto</label>
                <input type="text" name="title" required placeholder="Contoh: Apel Pagi Personel" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Kategori (Pilih atau Ketik Baru)</label>
                  <input 
                    type="text" 
                    name="category" 
                    defaultValue={selectedCategoryForAdd} 
                    list="saved-categories-list" 
                    required 
                    placeholder="Pilih/ketik kategori..." 
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" 
                  />
                  <datalist id="saved-categories-list">
                    {savedCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Pilih File Foto</label>
                  <input type="file" name="photoFile" accept="image/*" required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Singkat</label>
                <textarea name="desc" rows={2} required placeholder="Keterangan singkat foto..." className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 resize-none transition-colors"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                  {isPending ? 'Mengunggah...' : 'Upload Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Foto */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Edit Foto Galeri</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await updateGalleryAction(formData)
                setToastMessage('Perubahan foto berhasil disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                setIsEditModalOpen(false)
              })
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingItem.id} />
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Judul Foto</label>
                <input type="text" name="title" defaultValue={editingItem.title} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Kategori</label>
                  <input 
                    type="text" 
                    name="category" 
                    defaultValue={editingItem.category} 
                    list="saved-categories-list-edit" 
                    required 
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 transition-colors" 
                  />
                  <datalist id="saved-categories-list-edit">
                    {savedCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Ganti Foto (Opsional)</label>
                  <input type="file" name="photoFile" accept="image/*" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Singkat</label>
                <textarea name="desc" rows={2} defaultValue={editingItem.desc} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-amber-500 resize-none transition-colors"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
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