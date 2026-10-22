// app/admin/scheduled-content/ScheduledContentClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { 
  Calendar, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  CalendarCheck,
  CalendarDays,
  SunMedium
} from 'lucide-react'
import type { ScheduledContentItem } from '@/lib/db'
import { 
  createScheduledContentAction, 
  updateScheduledContentAction, 
  deleteScheduledContentAction, 
  toggleScheduledContentActiveAction 
} from './actions'

interface ScheduledContentClientProps {
  contents: ScheduledContentItem[]
}

function getTodayStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ScheduledContentClient({ contents }: ScheduledContentClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'monthly'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduledContentItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form states
  const todayStr = getTodayStr()
  const [formType, setFormType] = useState<'daily' | 'monthly'>('daily')
  const [formTitle, setFormTitle] = useState('')
  const [formBadge, setFormBadge] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formStartDate, setFormStartDate] = useState(todayStr)
  const [formEndDate, setFormEndDate] = useState(todayStr)
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const openAddModal = (presetType: 'daily' | 'monthly' = 'daily') => {
    setEditingItem(null)
    setFormType(presetType)
    setFormTitle('')
    setFormBadge(presetType === 'daily' ? 'DAILY HIGHLIGHT' : 'EDISI BULAN INI')
    setFormContent('')
    setFormStartDate(todayStr)
    
    // Default endDate: 1 hari untuk daily, 30 hari untuk monthly
    const nextDate = new Date()
    if (presetType === 'monthly') {
      nextDate.setDate(nextDate.getDate() + 30)
    } else {
      nextDate.setDate(nextDate.getDate() + 1)
    }
    const endStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
    setFormEndDate(endStr)

    setFormImageUrl('')
    setFormIsActive(true)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (item: ScheduledContentItem) => {
    setEditingItem(item)
    setFormType(item.type)
    setFormTitle(item.title)
    setFormBadge(item.badge || '')
    setFormContent(item.content)
    setFormStartDate(item.startDate)
    setFormEndDate(item.endDate)
    setFormImageUrl(item.imageUrl || '')
    setFormIsActive(item.isActive)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData(e.currentTarget)
    if (editingItem) {
      formData.set('id', editingItem.id)
    }
    formData.set('type', formType)
    formData.set('title', formTitle)
    formData.set('badge', formBadge)
    formData.set('content', formContent)
    formData.set('startDate', formStartDate)
    formData.set('endDate', formEndDate)
    formData.set('imageUrl', formImageUrl)
    formData.set('isActive', formIsActive ? 'true' : 'false')

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateScheduledContentAction(formData)
          setSuccessMsg(`Konten "${formTitle}" berhasil diperbarui.`)
        } else {
          await createScheduledContentAction(formData)
          setSuccessMsg(`Konten baru "${formTitle}" berhasil dijadwalkan.`)
        }
        setIsModalOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
        setErrorMsg(msg)
      }
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus konten terjadwal "${title}"?`)) return
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteScheduledContentAction(formData)
        setSuccessMsg(`Konten "${title}" berhasil dihapus.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghapus konten.'
        setErrorMsg(msg)
      }
    })
  }

  const handleToggleActive = (id: string) => {
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await toggleScheduledContentActiveAction(formData)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengubah status.'
        setErrorMsg(msg)
      }
    })
  }

  const filteredContents = contents.filter((c) => {
    if (activeTab === 'all') return true
    return c.type === activeTab
  })

  // Perhitungan status realtime
  const getScheduleStatus = (item: ScheduledContentItem) => {
    if (!item.isActive) {
      return { label: 'Non-aktif', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
    }
    if (todayStr < item.startDate) {
      return { label: 'Terjadwal', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' }
    }
    if (todayStr > item.endDate) {
      return { label: 'Kedaluwarsa', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' }
    }
    return { label: 'Sedang Tayang', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-black' }
  }

  const totalLive = contents.filter((c) => c.isActive && todayStr >= c.startDate && todayStr <= c.endDate).length
  const totalUpcoming = contents.filter((c) => c.isActive && todayStr < c.startDate).length

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-900 dark:text-white">
              Konten Harian & Bulanan
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Jadwalkan konten harian (daily update) dan buletin/promo bulanan dengan rentang tanggal tayang otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal('daily')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Konten</span>
        </button>
      </div>

      {/* FEEDBACK STATUS */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{contents.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Konten</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalLive}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Sedang Tayang Hari Ini</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalUpcoming}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Terjadwal Mendatang</div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Semua Konten ({contents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'daily'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <SunMedium className="w-3.5 h-3.5" />
          <span>Harian / Daily ({contents.filter((c) => c.type === 'daily').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Bulanan / Monthly ({contents.filter((c) => c.type === 'monthly').length})</span>
        </button>
      </div>

      {/* LIST KONTEN */}
      <div className="space-y-4">
        {filteredContents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-3">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum ada konten terjadwal</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Siapkan konten harian (seperti tips keselamatan, daily bulletin) atau promosi bulanan untuk tampil di website dalam jangka waktu tertentu.
            </p>
            <button
              onClick={() => openAddModal(activeTab === 'monthly' ? 'monthly' : 'daily')}
              className="mt-2 px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors cursor-pointer"
            >
              + Tambah Konten Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContents.map((item) => {
              const status = getScheduleStatus(item)
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                          {item.type === 'daily' ? <SunMedium className="w-7 h-7 text-amber-500" /> : <CalendarCheck className="w-7 h-7 text-indigo-500" />}
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            item.type === 'daily' 
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25' 
                              : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/25'
                          }`}>
                            {item.type === 'daily' ? 'Harian' : 'Bulanan'}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-extrabold uppercase text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              {item.badge}
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white mt-1.5">{item.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Berlaku: <b className="text-gray-700 dark:text-gray-300">{item.startDate}</b> s/d <b className="text-gray-700 dark:text-gray-300">{item.endDate}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {/* Apple Switch Toggle Konten */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.isActive}
                        onClick={() => handleToggleActive(item.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                          item.isActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        title={item.isActive ? 'Nonaktifkan konten' : 'Aktifkan konten'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                            item.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-amber-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Edit Konten"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                        title="Hapus Konten"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50 dark:bg-gray-950/70 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    {item.content}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT KONTEN TERJADWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {editingItem ? 'Edit Konten Terjadwal' : 'Buat Konten Terjadwal Baru'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tentukan jenis konten dan periode waktu tayang yang diinginkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* TIPE KONTEN: HARIAN VS BULANAN */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Jenis Konten
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('daily')
                      if (!formBadge || formBadge === 'EDISI BULAN INI') setFormBadge('DAILY HIGHLIGHT')
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'daily'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <SunMedium className="w-4 h-4" />
                    <span>Konten Harian (Daily)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('monthly')
                      if (!formBadge || formBadge === 'DAILY HIGHLIGHT') setFormBadge('EDISI BULAN INI')
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'monthly'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Konten Bulanan (Monthly)</span>
                  </button>
                </div>
              </div>

              {/* JUDUL & BADGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Judul Konten
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Tips K3 Hari Ini"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Label / Badge
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="DAILY TIPS / PROGRAM OKTOBER"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* JANGKA WAKTU TANGGAL (START DATE - END DATE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tanggal Mulai Tayang</span>
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500 cursor-pointer"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tanggal Berakhir Tayang</span>
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* GAMBAR BANNER / FOTO */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Foto / Banner Pendukung (Opsional)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="URL gambar (https://...)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload File</span>
                      <input type="file" name="imageFile" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* ISI KONTEN */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Isi Konten / Pesan
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={6}
                  placeholder="Ketik isi pengumuman, tips, agenda, atau program kerja..."
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              {/* STATUS AKTIF */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Status Tayang Konten</div>
                  <div className="text-[10px] text-gray-400">Jika dinonaktifkan, konten tidak akan tampil di website publik meskipun tanggal masih berlaku.</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    formIsActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    {formIsActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formIsActive}
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      formIsActive ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        formIsActive ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Jadwalkan Konten')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
