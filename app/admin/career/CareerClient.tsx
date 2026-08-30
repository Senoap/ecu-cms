// app/admin/career/CareerClient.tsx
'use client'
import { useState, useTransition } from 'react'

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

  // State untuk Header Section Form & Edit Modal Form
  const [isHeaderDirty, setIsHeaderDirty] = useState(false)
  const [isEditDirty, setIsEditDirty] = useState(false)

  // State Transisi & Toast
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Berhasil Disimpan ke Draft!')

  const handleOpenEdit = (career: CareerItem) => {
    setEditingCareer(career)
    setIsEditDirty(false)
  }

  const handleCloseEdit = () => {
    setEditingCareer(null)
    setIsEditDirty(false)
  }

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

      {/* Banner Header Halaman */}
      <div className="flex justify-between items-center bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>🧑‍💻 Recruitment Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Kelola Lowongan Kerja (Career)</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Atur informasi header seksi karir dan daftar posisi lowongan pekerjaan.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-950/50 cursor-pointer"
        >
          + Tambah Lowongan
        </button>
      </div>

      {/* Form Pengaturan Header Seksi Career */}
      <form action={async (formData) => {
        startTransition(async () => {
          await saveHeaderAction(formData)
          setIsHeaderDirty(false)
          setToastMessage('Header Career berhasil disimpan ke Draft!')
          setShowSuccessToast(true)
          setTimeout(() => setShowSuccessToast(false), 4000)
        })
      }} onChange={() => setIsHeaderDirty(true)} className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <span>📝</span> Header & Judul Seksi Karir
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Sub-Judul (Badge / Tag)</label>
            <input 
              type="text" 
              name="subtitle" 
              defaultValue={careerSection.subtitle || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Judul Utama</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={careerSection.title || ''} 
              className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300">Deskripsi Singkat / Catatan</label>
          <textarea 
            name="content" 
            rows={2} 
            defaultValue={careerSection.content || ''} 
            className="w-full bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner resize-none"
          ></textarea>
        </div>

        {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
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

      {/* List Daftar Lowongan Kerja */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
          <span>📋</span> Daftar Posisi Lowongan ({careers.length})
        </h2>

        <div className="space-y-4">
          {careers.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-12 font-medium">Belum ada lowongan pekerjaan yang ditambahkan.</p>
          ) : (
            careers.map((job) => (
              <div key={job.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#090A0F] p-5 rounded-2xl border border-gray-800/90 shadow-sm gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${job.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {job.isActive ? 'Aktif' : 'Non-Aktif'}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {job.type}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">📍 {job.location}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{job.title}</h3>
                  <p className="text-gray-400 text-xs font-medium">{job.desc}</p>
                </div>
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(job)}
                    className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-blue-500/30 cursor-pointer shadow-sm"
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
                    <button type="submit" className="bg-red-950/40 hover:bg-red-900/60 text-red-300 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors border border-red-500/30 cursor-pointer shadow-sm">
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
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Tambah Lowongan Kerja Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
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
                <label className="text-xs font-extrabold text-gray-400 uppercase">Posisi / Jabatan</label>
                <input type="text" name="title" required placeholder="Contoh: Security Officer" className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-400 uppercase">Lokasi Penempatan</label>
                  <input type="text" name="location" required placeholder="Contoh: Jakarta Selatan" className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-400 uppercase">Tipe Pekerjaan</label>
                  <select name="type" required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Deskripsi Pekerjaan</label>
                <textarea name="desc" rows={2} required placeholder="Deskripsi ringkas posisi..." className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Kualifikasi / Persyaratan</label>
                <textarea name="requirements" rows={2} required placeholder="Persyaratan utama pelamar..." className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>
              <input type="hidden" name="isActive" value="true" />
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-extrabold uppercase transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isPending} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer">
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
          <div className="bg-[#10131C] border border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Edit Lowongan: {editingCareer.title}</h3>
              <button onClick={handleCloseEdit} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await updateCareerAction(formData)
                setToastMessage('Perubahan lowongan disimpan ke Draft!')
                setShowSuccessToast(true)
                setTimeout(() => setShowSuccessToast(false), 4000)
                handleCloseEdit()
              })
            }} onChange={() => setIsEditDirty(true)} className="space-y-4">
              <input type="hidden" name="id" value={editingCareer.id} />
              
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Posisi / Jabatan</label>
                <input type="text" name="title" defaultValue={editingCareer.title} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-400 uppercase">Lokasi Penempatan</label>
                  <input type="text" name="location" defaultValue={editingCareer.location} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-400 uppercase">Tipe Pekerjaan</label>
                  <select name="type" defaultValue={editingCareer.type} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Deskripsi Pekerjaan</label>
                <textarea name="desc" rows={2} defaultValue={editingCareer.desc} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-400 uppercase">Kualifikasi / Persyaratan</label>
                <textarea name="requirements" rows={2} defaultValue={editingCareer.requirements} required className="w-full bg-[#090A0F] border border-gray-800 rounded-xl p-3 text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="hidden" name="isActive" value="true" />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" value="true" defaultChecked={editingCareer.isActive} className="rounded border-gray-700 bg-gray-900 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer" />
                  <span className="text-xs text-gray-300 font-bold">Status Aktif di Website</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={handleCloseEdit} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-extrabold uppercase transition-colors cursor-pointer">Batal</button>
                <button 
                  type="submit" 
                  disabled={!isEditDirty || isPending}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                    !isEditDirty || isPending
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

    </div>
  )
}