// app/admin/services/ServicesClient.tsx
'use client'
import { useState, useMemo, useTransition } from 'react'
import { ServiceItem } from '@/lib/db'
import { AVAILABLE_ICONS, DynamicIcon } from '@/components/DynamicIcon'
import { addService, updateService, deleteService, deleteServiceImage } from './actions'
import Link from 'next/link'

// Gabungkan dan otomatis hapus duplikat berdasarkan 'value' agar key unik
const EXTENDED_ICONS = Array.from(
  new Map(
    [
      ...AVAILABLE_ICONS,
      { label: 'Shield', value: 'Shield' },
      { label: 'Wrench', value: 'Wrench' },
      { label: 'Building', value: 'Building' },
      { label: 'Users', value: 'Users' },
      { label: 'Settings', value: 'Settings' },
      { label: 'Truck', value: 'Truck' },
      { label: 'Globe', value: 'Globe' },
      { label: 'Award', value: 'Award' },
      { label: 'Check Circle', value: 'CheckCircle' },
      { label: 'Clock', value: 'Clock' },
      { label: 'Dollar Sign', value: 'DollarSign' },
      { label: 'File Text', value: 'FileText' },
      { label: 'Headphones', value: 'Headphones' },
      { label: 'Heart', value: 'Heart' },
      { label: 'Home', value: 'Home' },
      { label: 'Layers', value: 'Layers' },
      { label: 'Lock', value: 'Lock' },
      { label: 'Mail', value: 'Mail' },
      { label: 'Map Pin', value: 'MapPin' },
      { label: 'Monitor', value: 'Monitor' },
      { label: 'Package', value: 'Package' },
      { label: 'Phone', value: 'Phone' },
      { label: 'Pie Chart', value: 'PieChart' },
      { label: 'Search', value: 'Search' },
      { label: 'Star', value: 'Star' },
      { label: 'Target', value: 'Target' },
      { label: 'Trending Up', value: 'TrendingUp' },
      { label: 'Cpu', value: 'Cpu' },
      { label: 'Database', value: 'Database' },
      { label: 'Server', value: 'Server' },
      { label: 'Smartphone', value: 'Smartphone' },
      { label: 'Compass', value: 'Compass' },
      { label: 'Key', value: 'Key' },
      { label: 'Map', value: 'Map' },
      { label: 'Shield Check', value: 'ShieldCheck' },
      { label: 'Activity', value: 'Activity' },
      { label: 'Archive', value: 'Archive' },
      { label: 'Bar Chart', value: 'BarChart' },
      { label: 'Bookmark', value: 'Bookmark' },
      { label: 'Camera', value: 'Camera' },
      { label: 'Cloud', value: 'Cloud' },
      { label: 'Code', value: 'Code' },
      { label: 'Coffee', value: 'Coffee' },
      { label: 'Credit Card', value: 'CreditCard' },
      { label: 'Download', value: 'Download' },
      { label: 'Edit', value: 'Edit' },
      { label: 'Eye', value: 'Eye' },
      { label: 'Filter', value: 'Filter' },
      { label: 'Flag', value: 'Flag' },
      { label: 'Folder', value: 'Folder' },
      { label: 'Gift', value: 'Gift' },
      { label: 'Grid', value: 'Grid' },
      { label: 'Image', value: 'Image' },
      { label: 'Info', value: 'Info' },
      { label: 'List', value: 'List' },
      { label: 'Music', value: 'Music' },
      { label: 'Paperclip', value: 'Paperclip' },
      { label: 'Play', value: 'Play' },
      { label: 'Power', value: 'Power' },
      { label: 'Refresh', value: 'RefreshCw' },
      { label: 'Save', value: 'Save' },
      { label: 'Send', value: 'Send' },
      { label: 'Share', value: 'Share' },
      { label: 'Shopping Bag', value: 'ShoppingBag' },
      { label: 'Shopping Cart', value: 'ShoppingCart' },
      { label: 'Smile', value: 'Smile' },
      { label: 'Speaker', value: 'Speaker' },
      { label: 'Sun', value: 'Sun' },
      { label: 'Terminal', value: 'Terminal' },
      { label: 'Tool', value: 'Tool' },
      { label: 'Trash', value: 'Trash' },
      { label: 'Unlock', value: 'Unlock' },
      { label: 'Upload', value: 'Upload' },
      { label: 'User', value: 'User' },
      { label: 'Video', value: 'Video' },
      { label: 'Volume', value: 'Volume' },
      { label: 'Watch', value: 'Watch' },
      { label: 'Wifi', value: 'Wifi' },
      { label: 'Zap', value: 'Zap' },
      { label: 'Anchor', value: 'Anchor' },
      { label: 'Bell', value: 'Bell' },
      { label: 'Book', value: 'Book' },
      { label: 'Calendar', value: 'Calendar' },
      { label: 'Check', value: 'Check' },
      { label: 'Copy', value: 'Copy' },
      { label: 'Disc', value: 'Disc' },
      { label: 'Feather', value: 'Feather' },
      { label: 'Film', value: 'Film' },
      { label: 'Hash', value: 'Hash' },
      { label: 'Help Circle', value: 'HelpCircle' },
      { label: 'Inbox', value: 'Inbox' },
      { label: 'Life Buoy', value: 'LifeBuoy' },
      { label: 'Link', value: 'Link' },
      { label: 'Maximize', value: 'Maximize' },
      { label: 'Minimize', value: 'Minimize' },
      { label: 'Moon', value: 'Moon' },
      { label: 'Navigation', value: 'Navigation' },
      { label: 'Percent', value: 'Percent' },
      { label: 'Printer', value: 'Printer' },
      { label: 'Radio', value: 'Radio' },
      { label: 'Repeat', value: 'Repeat' },
      { label: 'Scissors', value: 'Scissors' },
      { label: 'Sidebar', value: 'Sidebar' },
      { label: 'Sliders', value: 'Sliders' },
      { label: 'Square', value: 'Square' },
      { label: 'Stop Circle', value: 'StopCircle' },
      { label: 'Sunrise', value: 'Sunrise' },
      { label: 'Sunset', value: 'Sunset' },
      { label: 'Tablet', value: 'Tablet' },
      { label: 'Tag', value: 'Tag' },
      { label: 'Thermometer', value: 'Thermometer' },
      { label: 'Thumbs Down', value: 'ThumbsDown' },
      { label: 'Thumbs Up', value: 'ThumbsUp' },
      { label: 'Toggle Left', value: 'ToggleLeft' },
      { label: 'Toggle Right', value: 'ToggleRight' },
      { label: 'Trending Down', value: 'TrendingDown' },
      { label: 'Triangle', value: 'Triangle' },
      { label: 'TV', value: 'Tv' },
      { label: 'Umbrella', value: 'Umbrella' },
      { label: 'Underline', value: 'Underline' },
      { label: 'Video Off', value: 'VideoOff' },
      { label: 'Volume X', value: 'VolumeX' },
      { label: 'Zoom In', value: 'ZoomIn' },
      { label: 'Zoom Out', value: 'ZoomOut' }
    ].map(item => [item.value, item])
  ).values()
)

export default function ServicesClient({ initialServices }: { initialServices: ServiceItem[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)

  // State untuk Preview Foto, Caption, dan Watermark
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [watermarkCaption, setWatermarkCaption] = useState('PT. EMPAT SINERGI UTAMA')
  const [applyWatermark, setApplyWatermark] = useState(true)

  // State untuk Popup Pemilihan Ikon Visual
  const [isIconModalOpen, setIsIconModalOpen] = useState(false)
  const [iconTarget, setIconTarget] = useState<'add' | 'edit'>('add')
  const [newServiceIcon, setNewServiceIcon] = useState('Briefcase')
  const [editServiceIcon, setEditServiceIcon] = useState('Briefcase')
  const [iconSearchQuery, setIconSearchQuery] = useState('')

  // State untuk Draft & Transisi
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Berhasil Disimpan ke Draft!')

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv)
    setEditServiceIcon(srv.icon || 'Briefcase')
    setPreviewUrls([])
    setApplyWatermark(true)
    setWatermarkCaption('PT. EMPAT SINERGI UTAMA')
    setIsDirty(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    setPreviewUrls([])
    setIsDirty(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const urls = filesArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
      setIsDirty(true)
    }
  }

  const handleDeleteSavedImage = async (imagePath: string) => {
    if (!editingService) return
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return

    const formData = new FormData()
    formData.append('serviceId', editingService.id)
    formData.append('imagePath', imagePath)

    startTransition(async () => {
      await deleteServiceImage(formData)
      setEditingService({
        ...editingService,
        images: (editingService.images || []).filter(img => img !== imagePath)
      })
      setToastMessage('Foto berhasil dihapus dari Draft!')
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 4000)
    })
  }

  const handleSelectIcon = (iconValue: string) => {
    if (iconTarget === 'add') {
      setNewServiceIcon(iconValue)
    } else {
      setEditServiceIcon(iconValue)
      setIsDirty(true)
    }
    setIsIconModalOpen(false)
    setIconSearchQuery('')
  }

  const filteredIcons = useMemo(() => {
    return EXTENDED_ICONS.filter((ic) =>
      ic.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      ic.value.toLowerCase().includes(iconSearchQuery.toLowerCase())
    )
  }, [iconSearchQuery])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMessage}</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Masuk ke log notifikasi. Klik tombol Deploy (🚀) untuk menerbitkan.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>💼 Section Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Kelola Layanan (Services)</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Tambah, edit isi konten, ikon visual, dan foto galeri dengan opsi watermark diagonal.</p>
        </div>
      </div>

      {/* Form Tambah Layanan Baru */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <span>➕</span> Tambah Layanan Baru
        </h2>
        <form action={async (formData) => {
          startTransition(async () => {
            await addService(formData)
            setToastMessage('Layanan baru berhasil disimpan ke Draft!')
            setShowSuccessToast(true)
            setTimeout(() => setShowSuccessToast(false), 4000)
          })
        }} className="space-y-4">
          <input type="hidden" name="icon" value={newServiceIcon} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Layanan</label>
              <input type="text" name="title" required placeholder="Contoh: Jasa Pengamanan" className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Pilih Ikon Visual</label>
              <button
                type="button"
                onClick={() => { setIconTarget('add'); setIsIconModalOpen(true); }}
                className="w-full bg-[#090A0F] border border-gray-800 hover:border-amber-500 rounded-2xl px-4 py-3 text-white flex items-center justify-between transition-colors shadow-inner"
              >
                <div className="flex items-center gap-2.5">
                  <DynamicIcon name={newServiceIcon} className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold">{newServiceIcon}</span>
                </div>
                <span className="text-xs text-amber-400 font-bold underline">Ganti</span>
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Singkat (Card Home)</label>
            <textarea name="desc" rows={2} placeholder="Penjelasan ringkas..." className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"></textarea>
          </div>
          <button type="submit" disabled={isPending} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer">
            {isPending ? 'Menyimpan...' : 'Simpan Layanan Baru ke Draft'}
          </button>
        </form>
      </div>

      {/* List Daftar Layanan */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <span>📋</span> Daftar Layanan Saat Ini
        </h2>
        <div className="space-y-4">
          {(initialServices || []).map((srv) => (
            <div key={srv.id} className="flex justify-between items-center bg-[#090A0F] p-5 rounded-2xl border border-gray-800/90 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center text-amber-500 shadow-inner">
                  <DynamicIcon name={srv.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{srv.title}</h3>
                  <p className="text-gray-400 text-xs font-medium">{srv.desc}</p>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block border border-amber-500/20">
                    {(srv.images || []).length} Foto Galeri Terlampir
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(srv)}
                  className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-blue-500/30 cursor-pointer shadow-sm"
                >
                  Edit Konten & Watermark
                </button>
                <form action={async (formData) => {
                  if (!confirm('Yakin ingin menghapus layanan ini?')) return
                  startTransition(async () => {
                    await deleteService(formData)
                    setToastMessage('Layanan berhasil dihapus dari Draft!')
                    setShowSuccessToast(true)
                    setTimeout(() => setShowSuccessToast(false), 4000)
                  })
                }}>
                  <input type="hidden" name="id" value={srv.id} />
                  <button type="submit" className="bg-red-950/40 hover:bg-red-900/60 text-red-300 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-red-500/30 cursor-pointer shadow-sm">
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL EDIT KONTEN & WATERMARK */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-3xl rounded-3xl p-8 shadow-2xl space-y-6 my-8 relative">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">Edit Konten & Watermark: {editingService.title}</h2>
                <p className="text-gray-400 text-xs font-medium">Atur opsi watermark diagonal, preview foto, lalu simpan ke draft.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await updateService(formData)
                setToastMessage('Perubahan layanan disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                handleCloseModal()
              })
            }} onChange={() => setIsDirty(true)} className="space-y-5">
              <input type="hidden" name="id" value={editingService.id} />
              <input type="hidden" name="icon" value={editServiceIcon} />
              <input type="hidden" name="watermarkText" value={watermarkCaption} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Layanan</label>
                  <input type="text" name="title" defaultValue={editingService.title} required className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Pilih Ikon Visual</label>
                  <button
                    type="button"
                    onClick={() => { setIconTarget('edit'); setIsIconModalOpen(true); }}
                    className="w-full bg-[#090A0F] border border-gray-800 hover:border-amber-500 rounded-2xl px-4 py-3 text-white flex items-center justify-between transition-colors shadow-inner cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <DynamicIcon name={editServiceIcon} className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold">{editServiceIcon}</span>
                    </div>
                    <span className="text-xs text-amber-400 font-bold underline">Ganti</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Singkat (Card Home)</label>
                <input type="text" name="desc" defaultValue={editingService.desc} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Konten / Deskripsi Lengkap (Halaman Detail)</label>
                <textarea name="content" rows={4} defaultValue={editingService.content || editingService.desc} className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner leading-relaxed"></textarea>
              </div>

              {/* PENGATURAN WATERMARK & UPLOAD FOTO */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Konfigurasi Watermark & Galeri Foto</h3>

                <div className="flex items-center justify-between bg-[#090A0F] p-4 rounded-2xl border border-gray-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Terapkan Watermark Diagonal</span>
                    <span className="text-[11px] text-gray-400">Geser untuk mengaktifkan/menonaktifkan watermark transparan pada foto baru.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="applyWatermark"
                      checked={applyWatermark}
                      onChange={(e) => setApplyWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Caption Teks Watermark</label>
                    <input
                      type="text"
                      value={watermarkCaption}
                      onChange={(e) => setWatermarkCaption(e.target.value)}
                      placeholder="Contoh: PT. EMPAT SINERGI UTAMA"
                      className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm font-medium shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Pilih Foto Baru (Maks. 10)</label>
                    <input
                      type="file"
                      name="photoFile"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-3 py-2 text-white text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                    />
                  </div>
                </div>

                {/* Pratinjau Foto Sebelum Disimpan */}
                {previewUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400">Pratinjau Foto Sebelum Disimpan:</p>
                    <div className="grid grid-cols-4 gap-3">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-700 bg-[#090A0F] h-24 flex items-center justify-center">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          {applyWatermark && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span
                                className="font-bold text-[10px] transform -rotate-30 tracking-wider text-center px-1"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.65)',
                                  WebkitTextStroke: '0.6px rgba(0, 0, 0, 0.7)'
                                }}
                              >
                                © {watermarkCaption}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foto Galeri Tersimpan */}
                {editingService.images && editingService.images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-amber-500">Galeri Foto Tersimpan Saat Ini (Klik ✕ untuk menghapus):</p>
                    <div className="grid grid-cols-4 gap-3">
                      {editingService.images.map((img, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#090A0F] h-24 group">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedImage(img)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
                            title="Hapus foto ini"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TOMBOL SIMPAN KE DRAFT DI DALAM MODAL */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || isPending}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                    !isDirty || isPending
                      ? 'bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-lg shadow-amber-900/50 hover:scale-105 animate-pulse'
                  }`}
                >
                  {isPending ? 'Menyimpan...' : '💾 Simpan ke Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL PILIH IKON */}
      {isIconModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-6xl rounded-3xl p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
              <div>
                <h3 className="text-lg font-black text-white">Pilih Ikon Layanan ({filteredIcons.length} Tersedia)</h3>
                <p className="text-gray-400 text-xs font-medium">Cari dan klik salah satu ikon di bawah ini untuk menggunakannya.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  placeholder="Cari ikon..."
                  className="bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-2.5 text-white text-xs w-full sm:w-64 focus:border-amber-500 focus:outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center font-bold text-base transition-colors shadow flex-shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[70vh] overflow-y-auto pr-2">
              {filteredIcons.map((ic) => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => handleSelectIcon(ic.value)}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#090A0F] hover:bg-amber-500/20 border border-gray-800 hover:border-amber-500 transition-all duration-200 text-gray-300 hover:text-white cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-amber-500/30 flex items-center justify-center text-amber-500 transition-colors shadow-inner">
                    <DynamicIcon name={ic.value} className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] text-center truncate w-full font-bold">{ic.label}</span>
                </button>
              ))}

              {filteredIcons.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 text-sm font-medium">
                  Ikon tidak ditemukan untuk pencarian "<span className="text-amber-500">{iconSearchQuery}</span>"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}