// app/admin/gallery/GalleryClient.tsx
'use client'
import { useState, useTransition, useMemo } from 'react'
import { Save, Image as ImageIcon, Pencil, Trash2, X, Plus, FolderPlus, Folder } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  desc: string
  category: string
  imageUrl: string
}

interface GalleryClientProps {
  galleries: GalleryItem[]
  categories?: string[]
  gallerySection: { subtitle?: string; title?: string; content?: string }
  saveHeaderAction: (formData: FormData) => Promise<void>
  addGalleryAction: (formData: FormData) => Promise<void>
  updateGalleryAction: (formData: FormData) => Promise<void>
  deleteGalleryAction: (formData: FormData) => Promise<void>
  addCategoryAction: (formData: FormData) => Promise<void>
  updateCategoryAction: (formData: FormData) => Promise<void>
  deleteCategoryAction: (formData: FormData) => Promise<void>
}

export default function GalleryClient({
  galleries,
  categories: initialCategories = [],
  gallerySection,
  saveHeaderAction,
  addGalleryAction,
  updateGalleryAction,
  deleteGalleryAction,
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
}: GalleryClientProps) {
  // Modal Upload / Edit Foto
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState('')
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  // Modal Tambah / Edit Kategori
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [editingCategoryOldName, setEditingCategoryOldName] = useState('')
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('')
  const [categoryErrorMsg, setCategoryErrorMsg] = useState('')

  // State Form Header Galeri
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

  // Gabungan kategori tersimpan dari prop dan kategori foto saat ini
  const allCategories = useMemo(() => {
    const list = Array.from(new Set([
      ...initialCategories,
      ...galleries.map(g => g.category || 'Umum')
    ])).map(c => c.trim()).filter(Boolean)

    if (list.length === 0) return ['Keamanan', 'Kebersihan']
    return list
  }, [initialCategories, galleries])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 4000)
  }

  const handleOpenAddModal = (defaultCategory = '') => {
    setSelectedCategoryForAdd(defaultCategory || allCategories[0] || 'Umum')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleOpenEditCategory = (catName: string) => {
    setEditingCategoryOldName(catName)
    setEditingCategoryNewName(catName)
    setCategoryErrorMsg('')
    setIsEditCategoryModalOpen(true)
  }

  const handleAddCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      setCategoryErrorMsg('Nama kategori tidak boleh kosong.')
      return
    }

    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryErrorMsg(`Kategori "${trimmed}" sudah ada. Silakan gunakan nama lain.`)
      return
    }

    setCategoryErrorMsg('')
    const formData = new FormData()
    formData.set('name', trimmed)

    startTransition(async () => {
      await addCategoryAction(formData)
      triggerToast(`Kategori "${trimmed}" berhasil ditambahkan!`)
      setNewCategoryName('')
      setIsAddCategoryModalOpen(false)
    })
  }

  const handleEditCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = editingCategoryNewName.trim()
    if (!trimmed) {
      setCategoryErrorMsg('Nama kategori tidak boleh kosong.')
      return
    }

    if (
      trimmed.toLowerCase() !== editingCategoryOldName.toLowerCase() &&
      allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setCategoryErrorMsg(`Kategori "${trimmed}" sudah digunakan.`)
      return
    }

    setCategoryErrorMsg('')
    const formData = new FormData()
    formData.set('oldName', editingCategoryOldName)
    formData.set('newName', trimmed)

    startTransition(async () => {
      await updateCategoryAction(formData)
      triggerToast(`Nama kategori berhasil diubah menjadi "${trimmed}"!`)
      setIsEditCategoryModalOpen(false)
    })
  }

  const handleDeleteCategory = (catName: string) => {
    const itemsInCat = galleries.filter(g => (g.category || 'Umum').toLowerCase() === catName.toLowerCase())
    const confirmPrompt = itemsInCat.length > 0
      ? `Hapus kategori "${catName}"? Sebanyak ${itemsInCat.length} foto di dalamnya akan dipindahkan ke kategori "Umum".`
      : `Hapus kategori kosong "${catName}"?`

    if (!confirm(confirmPrompt)) return

    const formData = new FormData()
    formData.set('name', catName)

    startTransition(async () => {
      await deleteCategoryAction(formData)
      triggerToast(`Kategori "${catName}" berhasil dihapus.`)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* Toast Notifikasi */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-gray-300 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMessage}</h4>
            <p className="text-[11px] text-gray-300 font-medium">Masuk ke log notifikasi. Klik tombol Deploy untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      {/* Header Banner (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Kelola Galeri Foto &amp; Kategori
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload foto, kelola kategori album, dan atur deskripsi dokumentasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* TOMBOL TAMBAH KATEGORI */}
          <button
            type="button"
            onClick={() => {
              setNewCategoryName('')
              setCategoryErrorMsg('')
              setIsAddCategoryModalOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#181B26] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#202534] transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tambah Kategori</span>
          </button>

          {/* TOMBOL UPLOAD FOTO BARU */}
          <button
            type="button"
            onClick={() => handleOpenAddModal('')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Foto Baru</span>
          </button>
        </div>
      </div>

      {/* Form Header Seksi Galeri */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setHeaderBaseline({ subtitle, title, content })
          triggerToast('Header Galeri berhasil disimpan ke Draft!')
        })
      }} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6 transition-colors">
        <h2 className="text-base font-black text-black dark:text-white tracking-wide uppercase flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-black dark:text-white" />
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
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 font-medium shadow-inner transition-colors" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Judul Utama</label>
            <input 
              type="text" 
              name="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 font-medium shadow-inner transition-colors" 
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
            className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 font-medium shadow-inner resize-none transition-colors"
          ></textarea>
        </div>

        <div style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }} className="fixed right-4 sm:right-6 z-45">
          <button 
            type="submit" 
            disabled={!isHeaderDirty || isPending}
            className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
              !isHeaderDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-black/20 cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan ke Draft</span>
          </button>
        </div>
      </form>

      {/* Daftar Foto Galeri Dikelompokkan Perkategori */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-8 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-base font-black text-black dark:text-white tracking-wide uppercase flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Daftar Foto Galeri Perkategori ({galleries.length} Total Foto)
          </h2>
          <button
            type="button"
            onClick={() => {
              setNewCategoryName('')
              setCategoryErrorMsg('')
              setIsAddCategoryModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer self-start sm:self-auto"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Kategori Baru</span>
          </button>
        </div>

        {allCategories.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Belum ada kategori dalam galeri.</p>
            <button
              type="button"
              onClick={() => {
                setNewCategoryName('')
                setCategoryErrorMsg('')
                setIsAddCategoryModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Buat Kategori Pertama</span>
            </button>
          </div>
        ) : (
          allCategories.map((category) => {
            const itemsInCat = galleries.filter(g => (g.category || 'Umum').toLowerCase() === category.toLowerCase())
            return (
              <div key={category} className="space-y-4 bg-gray-50 dark:bg-[#090A0F] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      {category} ({itemsInCat.length} Foto)
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tombol Ubah Nama Kategori */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(category)}
                      className="text-[11px] font-bold bg-white dark:bg-[#181B26] hover:bg-gray-100 dark:hover:bg-[#202534] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Ubah nama kategori"
                    >
                      <Pencil className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span>Ubah Nama</span>
                    </button>

                    {/* Tombol Hapus Kategori */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-[11px] font-bold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Hapus kategori ini"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Hapus</span>
                    </button>

                    {/* Tombol Tambah Foto di Kategori Ini */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(category)}
                      className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Foto di Kategori Ini</span>
                    </button>
                  </div>
                </div>

                {itemsInCat.length === 0 ? (
                  <div className="bg-white/60 dark:bg-[#10131C]/60 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl p-8 text-center space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Kategori ini belum memiliki foto dokumentasi.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(category)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload foto pertama ke kategori &quot;{category}&quot;</span>
                    </button>
                  </div>
                ) : (
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
                              triggerToast('Foto berhasil dihapus dari Draft!')
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
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH KATEGORI BARU                                             */}
      {/* ========================================================================= */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Tambah Kategori Baru
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Buat album untuk mengelompokkan dokumentasi foto.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              {categoryErrorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {categoryErrorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase">
                  Nama Kategori
                </label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value)
                    if (categoryErrorMsg) setCategoryErrorMsg('')
                  }}
                  required 
                  autoFocus
                  placeholder="Contoh: Pelatihan, Event & Gathering, Fasilitas..." 
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors shadow-inner" 
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Kategori akan langsung muncul di daftar galeri dan siap diisi foto.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddCategoryModalOpen(false)} 
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !newCategoryName.trim()} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UBAH NAMA KATEGORI                                               */}
      {/* ========================================================================= */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    Ubah Nama Kategori
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Memperbarui nama kategori &amp; semua foto di dalamnya.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditCategoryModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit} className="space-y-4">
              {categoryErrorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {categoryErrorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase">
                  Nama Kategori Baru
                </label>
                <input 
                  type="text" 
                  value={editingCategoryNewName}
                  onChange={(e) => {
                    setEditingCategoryNewName(e.target.value)
                    if (categoryErrorMsg) setCategoryErrorMsg('')
                  }}
                  required 
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors shadow-inner" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditCategoryModalOpen(false)} 
                  className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !editingCategoryNewName.trim()} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD FOTO BARU                                                 */}
      {/* ========================================================================= */}
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
                triggerToast('Foto berhasil disimpan ke Draft!')
                setIsModalOpen(false)
              })
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Judul Foto</label>
                <input type="text" name="title" required placeholder="Contoh: Apel Pagi Personel" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Kategori (Pilih atau Ketik)</label>
                  <input 
                    type="text" 
                    name="category" 
                    defaultValue={selectedCategoryForAdd} 
                    list="saved-categories-list" 
                    required 
                    placeholder="Pilih/ketik kategori..." 
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors" 
                  />
                  <datalist id="saved-categories-list">
                    {allCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Pilih File Foto</label>
                  <input type="file" name="photoFile" accept="image/*" required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Singkat</label>
                <textarea name="desc" rows={2} required placeholder="Keterangan singkat foto..." className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 resize-none transition-colors"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                  {isPending ? 'Mengunggah...' : 'Upload Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT FOTO                                                        */}
      {/* ========================================================================= */}
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
                triggerToast('Perubahan foto berhasil disimpan ke Draft!')
                setIsEditModalOpen(false)
              })
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingItem.id} />
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Judul Foto</label>
                <input type="text" name="title" defaultValue={editingItem.title} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors" />
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
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 transition-colors" 
                  />
                  <datalist id="saved-categories-list-edit">
                    {allCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Ganti Foto (Opsional)</label>
                  <input type="file" name="photoFile" accept="image/*" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-800 dark:file:text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Singkat</label>
                <textarea name="desc" rows={2} defaultValue={editingItem.desc} required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:border-blue-500 resize-none transition-colors"></textarea>
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
