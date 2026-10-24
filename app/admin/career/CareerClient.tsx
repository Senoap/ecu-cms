// app/admin/career/CareerClient.tsx
'use client'
import { useState, useTransition, useMemo } from 'react'
import { Save, Briefcase, MapPin, ClipboardList, Plus, X } from 'lucide-react'

interface CareerItem {
  id: string
  title: string
  location: string
  type: string
  desc: string
  requirements: string
  isActive: boolean
}

interface CareerClientProps {
  careers: CareerItem[]
  careerSection: { subtitle?: string; title?: string; content?: string }
  saveHeaderAction: (formData: FormData) => Promise<void>
  addCareerAction: (formData: FormData) => Promise<void>
  updateCareerAction: (formData: FormData) => Promise<void>
  deleteCareerAction: (formData: FormData) => Promise<void>
}

export default function CareerClient({
  careers,
  careerSection,
  saveHeaderAction,
  addCareerAction,
  updateCareerAction,
  deleteCareerAction,
}: CareerClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCareer, setEditingCareer] = useState<CareerItem | null>(null)

  // Controlled states untuk Header Section
  const [headerSubtitle, setHeaderSubtitle] = useState(careerSection.subtitle || '')
  const [headerTitle, setHeaderTitle] = useState(careerSection.title || '')
  const [headerContent, setHeaderContent] = useState(careerSection.content || '')
  const [headerBaseline, setHeaderBaseline] = useState({
    subtitle: careerSection.subtitle || '',
    title: careerSection.title || '',
    content: careerSection.content || '',
  })

  const isHeaderDirty = useMemo(() => {
    return (
      headerSubtitle !== headerBaseline.subtitle ||
      headerTitle !== headerBaseline.title ||
      headerContent !== headerBaseline.content
    )
  }, [headerSubtitle, headerTitle, headerContent, headerBaseline])

  // Controlled states untuk Edit Modal
  const [editTitle, setEditTitle] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editType, setEditType] = useState('Full-time')
  const [editDesc, setEditDesc] = useState('')
  const [editRequirements, setEditRequirements] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)

  const isEditDirty = useMemo(() => {
    if (!editingCareer) return false
    return (
      editTitle !== (editingCareer.title || '') ||
      editLocation !== (editingCareer.location || '') ||
      editType !== (editingCareer.type || 'Full-time') ||
      editDesc !== (editingCareer.desc || '') ||
      editRequirements !== (editingCareer.requirements || '') ||
      editIsActive !== (editingCareer.isActive !== false)
    )
  }, [editingCareer, editTitle, editLocation, editType, editDesc, editRequirements, editIsActive])

  // State Transisi & Toast
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Berhasil Disimpan ke Draft!')

  const handleOpenEdit = (career: CareerItem) => {
    setEditingCareer(career)
    setEditTitle(career.title || '')
    setEditLocation(career.location || '')
    setEditType(career.type || 'Full-time')
    setEditDesc(career.desc || '')
    setEditRequirements(career.requirements || '')
    setEditIsActive(career.isActive !== false)
  }

  const handleCloseEdit = () => {
    setEditingCareer(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      
      {/* TOAST NOTIFIKASI SUKSES */}
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

      {/* Banner Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Kelola Lowongan Kerja (Career)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Atur informasi header seksi karir dan daftar posisi lowongan pekerjaan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lowongan</span>
        </button>
      </div>

      {/* Form Pengaturan Header Seksi Career */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setHeaderBaseline({
            subtitle: headerSubtitle,
            title: headerTitle,
            content: headerContent,
          })
          setToastMessage('Header Career berhasil disimpan ke Draft!')
          setShowSuccessToast(true)
          setTimeout(() => setShowSuccessToast(false), 4000)
        })
      }} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span>Header & Judul Seksi Karir</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Sub-Judul (Badge / Tag)</label>
            <input 
              type="text" 
              name="subtitle" 
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Judul Utama</label>
            <input 
              type="text" 
              name="title" 
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi Singkat / Catatan</label>
          <textarea 
            name="content" 
            rows={2} 
            value={headerContent}
            onChange={(e) => setHeaderContent(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner resize-none"
          ></textarea>
        </div>

        {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
        <div 
          style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }}
          className="fixed right-4 sm:right-6 z-45"
        >
          <button 
            type="submit" 
            disabled={!isHeaderDirty || isPending}
            className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
              !isHeaderDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md shadow-black/20 cursor-pointer'
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
                <Save className="w-4 h-4" />
                <span>Simpan ke Draft</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* List Daftar Lowongan Kerja */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> Daftar Posisi Lowongan ({careers.length})
        </h2>

        <div className="space-y-4">
          {careers.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12 font-medium">Belum ada lowongan pekerjaan yang ditambahkan.</p>
          ) : (
            careers.map((job) => (
              <div key={job.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-[#090A0F] p-5 rounded-2xl border border-gray-200 dark:border-gray-800/90 shadow-sm gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`font-bold ${job.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {job.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {job.type}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">{job.desc}</p>
                </div>
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(job)}
                    className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-blue-200 dark:border-blue-500/30 cursor-pointer shadow-sm"
                  >
                    Edit Lowongan
                  </button>
                  <form action={async (formData) => {
                    if (!confirm('Yakin ingin menghapus lowongan ini?')) return
                    startTransition(async () => {
                      await deleteCareerAction(formData)
                      setToastMessage('Lowongan berhasil dihapus dari Draft!')
                      setShowSuccessToast(true)
                      setTimeout(() => setShowSuccessToast(false), 4000)
                    })
                  }}>
                    <input type="hidden" name="id" value={job.id} />
                    <button type="submit" className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-red-200 dark:border-red-500/30 cursor-pointer shadow-sm">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL TAMBAH LOWONGAN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Tambah Lowongan Kerja Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await addCareerAction(formData)
                setToastMessage('Lowongan baru berhasil disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                setIsAddModalOpen(false)
              })
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Posisi / Jabatan</label>
                <input type="text" name="title" required placeholder="Contoh: Security Officer" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Lokasi Penempatan</label>
                  <input type="text" name="location" required placeholder="Contoh: Jakarta Selatan" className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Tipe Pekerjaan</label>
                  <select name="type" required className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Pekerjaan</label>
                <textarea name="desc" rows={2} required placeholder="Deskripsi ringkas posisi..." className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Kualifikasi / Persyaratan</label>
                <textarea name="requirements" rows={2} required placeholder="Persyaratan utama pelamar..." className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>
              <input type="hidden" name="isActive" value="true" />
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-xl text-xs font-extrabold uppercase transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                  {isPending ? 'Menyimpan...' : 'Simpan Lowongan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT LOWONGAN */}
      {editingCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Edit Lowongan: {editingCareer.title}</h3>
              <button onClick={handleCloseEdit} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('isActive', editIsActive ? 'true' : 'false')
              startTransition(async () => {
                await updateCareerAction(formData)
                setToastMessage('Perubahan lowongan disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                handleCloseEdit()
              })
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingCareer.id} />
              <input type="hidden" name="isActive" value={editIsActive ? 'true' : 'false'} />
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Posisi / Jabatan</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required 
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Lokasi Penempatan</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required 
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Tipe Pekerjaan</label>
                  <select 
                    name="type" 
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    required 
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Deskripsi Pekerjaan</label>
                <textarea 
                  name="desc" 
                  rows={2} 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required 
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-400 uppercase">Kualifikasi / Persyaratan</label>
                <textarea 
                  name="requirements" 
                  rows={2} 
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  required 
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl p-3 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Aktif di Website</span>
                  <span className={`text-[10px] font-bold ${editIsActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    {editIsActive ? 'Lowongan Dibuka' : 'Lowongan Ditutup'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editIsActive}
                  aria-label="Toggle Status Aktif Lowongan"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    editIsActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      editIsActive ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={handleCloseEdit} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-xl text-xs font-extrabold uppercase transition-colors cursor-pointer">Batal</button>
                <button 
                  type="submit" 
                  disabled={!isEditDirty || isPending}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                    !isEditDirty || isPending
                      ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50'
                      : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-sm cursor-pointer'
                  }`}
                >
                  {isPending ? 'Menyimpan...' : (
                    <span className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" />
                      <span>Simpan ke Draft</span>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}