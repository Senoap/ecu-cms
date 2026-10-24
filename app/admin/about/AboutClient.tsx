// app/admin/about/AboutClient.tsx
'use client'

import { useState, useMemo, useTransition, useRef } from 'react'
import { Save, Building2, Award, Users, Plus, Trash2, Edit3, Eye, EyeOff, Check, X, ArrowUp, ArrowDown, UploadCloud, Image as ImageIcon, Loader2, Globe, ExternalLink, ShieldCheck } from 'lucide-react'
import type { DirectorItem } from '@/lib/db'
import { defaultLeadershipPageConfig, type LeadershipPageConfig } from '@/lib/leadershipConstants'

interface AboutData {
  subtitle?: string
  title?: string
  p1?: string
  p2?: string
  leadershipTitle?: string
  leadershipDesc?: string
  quote?: string
}

interface AboutClientProps {
  aboutData: AboutData
  directors: DirectorItem[]
  showLeadership?: boolean
  leadershipLabel?: string
  leadershipPageConfig?: LeadershipPageConfig
  saveAboutAction: (formData: FormData) => Promise<void>
  saveDirectorsAction: (directors: DirectorItem[]) => Promise<void>
  saveLeadershipPageAction?: (config: LeadershipPageConfig) => Promise<void>
  uploadDirectorPhotoAction?: (formData: FormData) => Promise<{ success: boolean; url?: string; error?: string }>
  toggleLeadershipVisibilityAction?: (showLeadership: boolean) => Promise<void>
}

export default function AboutClient({
  aboutData,
  directors: initialDirectors,
  showLeadership = true,
  leadershipLabel = 'Profil Pimpinan',
  leadershipPageConfig = defaultLeadershipPageConfig,
  saveAboutAction,
  saveDirectorsAction,
  saveLeadershipPageAction,
  uploadDirectorPhotoAction,
  toggleLeadershipVisibilityAction,
}: AboutClientProps) {
  const [activeTab, setActiveTab] = useState<'narrative' | 'directors' | 'leadershipPage'>('narrative')
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Perubahan Berhasil Disimpan ke Draft!')

  // Controlled states untuk Kustomisasi Halaman /leadership
  const [headerBadge, setHeaderBadge] = useState(leadershipPageConfig?.headerBadge || 'Pimpinan & Pengelola Operasional')
  const [headerTitle, setHeaderTitle] = useState(leadershipPageConfig?.headerTitle || 'Profil Pimpinan & Tim Manajemen')
  const [headerDesc, setHeaderDesc] = useState(leadershipPageConfig?.headerDesc || '')
  const [backButtonText, setBackButtonText] = useState(leadershipPageConfig?.backButtonText || 'Kembali ke Beranda')
  const [backButtonLink, setBackButtonLink] = useState(leadershipPageConfig?.backButtonLink || '/')
  const [showGcgCard, setShowGcgCard] = useState(leadershipPageConfig?.showGcgCard !== false)
  const [gcgBadge, setGcgBadge] = useState(leadershipPageConfig?.gcgBadge || 'Prinsip Good Corporate Governance (GCG)')
  const [gcgTitle, setGcgTitle] = useState(leadershipPageConfig?.gcgTitle || 'Integritas, Transparansi, dan Akuntabilitas Tanpa Kompromi')
  const [gcgDesc, setGcgDesc] = useState(leadershipPageConfig?.gcgDesc || '')
  const [gcgCtaText, setGcgCtaText] = useState(leadershipPageConfig?.gcgCtaText || 'Konsultasi Kemitraan')
  const [gcgCtaLink, setGcgCtaLink] = useState(leadershipPageConfig?.gcgCtaLink || '/#contact')
  const [gcgShowCertBtn, setGcgShowCertBtn] = useState(leadershipPageConfig?.gcgShowCertBtn !== false)
  const [gcgCertText, setGcgCertText] = useState(leadershipPageConfig?.gcgCertText || 'Lihat Sertifikasi Perusahaan')
  const [gcgCertLink, setGcgCertLink] = useState(leadershipPageConfig?.gcgCertLink || '/certifications')

  // Baseline data tersimpan untuk Halaman /leadership (dirty detection)
  const [savedLeadershipBaseline, setSavedLeadershipBaseline] = useState(() => ({
    headerBadge: (leadershipPageConfig?.headerBadge || '').trim(),
    headerTitle: (leadershipPageConfig?.headerTitle || '').trim(),
    headerDesc: (leadershipPageConfig?.headerDesc || '').trim(),
    backButtonText: (leadershipPageConfig?.backButtonText || '').trim(),
    backButtonLink: (leadershipPageConfig?.backButtonLink || '').trim(),
    showGcgCard: leadershipPageConfig?.showGcgCard !== false,
    gcgBadge: (leadershipPageConfig?.gcgBadge || '').trim(),
    gcgTitle: (leadershipPageConfig?.gcgTitle || '').trim(),
    gcgDesc: (leadershipPageConfig?.gcgDesc || '').trim(),
    gcgCtaText: (leadershipPageConfig?.gcgCtaText || '').trim(),
    gcgCtaLink: (leadershipPageConfig?.gcgCtaLink || '').trim(),
    gcgShowCertBtn: leadershipPageConfig?.gcgShowCertBtn !== false,
    gcgCertText: (leadershipPageConfig?.gcgCertText || '').trim(),
    gcgCertLink: (leadershipPageConfig?.gcgCertLink || '').trim(),
  }))

  const isLeadershipDirty = useMemo(() => {
    const current = {
      headerBadge: headerBadge.trim(),
      headerTitle: headerTitle.trim(),
      headerDesc: headerDesc.trim(),
      backButtonText: backButtonText.trim(),
      backButtonLink: backButtonLink.trim(),
      showGcgCard,
      gcgBadge: gcgBadge.trim(),
      gcgTitle: gcgTitle.trim(),
      gcgDesc: gcgDesc.trim(),
      gcgCtaText: gcgCtaText.trim(),
      gcgCtaLink: gcgCtaLink.trim(),
      gcgShowCertBtn,
      gcgCertText: gcgCertText.trim(),
      gcgCertLink: gcgCertLink.trim(),
    }
    return JSON.stringify(current) !== JSON.stringify(savedLeadershipBaseline)
  }, [
    headerBadge, headerTitle, headerDesc, backButtonText, backButtonLink,
    showGcgCard, gcgBadge, gcgTitle, gcgDesc, gcgCtaText, gcgCtaLink,
    gcgShowCertBtn, gcgCertText, gcgCertLink, savedLeadershipBaseline,
  ])

  const handleSaveLeadershipPage = () => {
    if (!saveLeadershipPageAction) return
    const payload: LeadershipPageConfig = {
      headerBadge,
      headerTitle,
      headerDesc,
      backButtonText,
      backButtonLink,
      showGcgCard,
      gcgBadge,
      gcgTitle,
      gcgDesc,
      gcgCtaText,
      gcgCtaLink,
      gcgShowCertBtn,
      gcgCertText,
      gcgCertLink,
    }

    startTransition(async () => {
      await saveLeadershipPageAction(payload)
      setSavedLeadershipBaseline({
        headerBadge: headerBadge.trim(),
        headerTitle: headerTitle.trim(),
        headerDesc: headerDesc.trim(),
        backButtonText: backButtonText.trim(),
        backButtonLink: backButtonLink.trim(),
        showGcgCard,
        gcgBadge: gcgBadge.trim(),
        gcgTitle: gcgTitle.trim(),
        gcgDesc: gcgDesc.trim(),
        gcgCtaText: gcgCtaText.trim(),
        gcgCtaLink: gcgCtaLink.trim(),
        gcgShowCertBtn,
        gcgCertText: gcgCertText.trim(),
        gcgCertLink: gcgCertLink.trim(),
      })
      triggerToast('Pengaturan Halaman /leadership Berhasil Disimpan ke Draft!')
    })
  }

  // Controlled states untuk Narasi About Us
  const [subtitle, setSubtitle] = useState(aboutData.subtitle || '')
  const [title, setTitle] = useState(aboutData.title || '')
  const [p1, setP1] = useState(aboutData.p1 || '')
  const [p2, setP2] = useState(aboutData.p2 || '')
  const [quote, setQuote] = useState(aboutData.quote || '')
  const [leadershipTitle, setLeadershipTitle] = useState(aboutData.leadershipTitle || '')
  const [leadershipDesc, setLeadershipDesc] = useState(aboutData.leadershipDesc || '')

  // Baseline data tersimpan untuk membandingkan perubahan secara reaktif
  const [savedBaseline, setSavedBaseline] = useState(() => ({
    subtitle: (aboutData.subtitle || '').trim(),
    title: (aboutData.title || '').trim(),
    p1: (aboutData.p1 || '').trim(),
    p2: (aboutData.p2 || '').trim(),
    quote: (aboutData.quote || '').trim(),
    leadershipTitle: (aboutData.leadershipTitle || '').trim(),
    leadershipDesc: (aboutData.leadershipDesc || '').trim(),
  }))

  // Evaluasi isDirty dinamis: hanya bernilai TRUE jika ada perbedaan aktual dengan baseline data
  const isDirty = useMemo(() => {
    const current = {
      subtitle: (subtitle || '').trim(),
      title: (title || '').trim(),
      p1: (p1 || '').trim(),
      p2: (p2 || '').trim(),
      quote: (quote || '').trim(),
      leadershipTitle: (leadershipTitle || '').trim(),
      leadershipDesc: (leadershipDesc || '').trim(),
    }
    return JSON.stringify(current) !== JSON.stringify(savedBaseline)
  }, [subtitle, title, p1, p2, quote, leadershipTitle, leadershipDesc, savedBaseline])

  // No-op setter untuk kompatibilitas
  const setIsDirty = (_val: boolean) => { }

  // State untuk Direksi
  const [directorsList, setDirectorsList] = useState<DirectorItem[]>(initialDirectors)
  const [editingDirector, setEditingDirector] = useState<DirectorItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expInput, setExpInput] = useState('')
  const [isLeadershipEnabled, setIsLeadershipEnabled] = useState(showLeadership !== false)

  // State & Handler Upload Foto Direksi
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingDirector) return

    // 1. Validasi Batas Ukuran Maksimal 10MB
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      alert(`Ukuran berkas (${sizeMB} MB) melebihi batas maksimal 10MB. Harap pilih gambar yang lebih kecil.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // 2. Validasi format gambar
    if (!file.type.startsWith('image/')) {
      alert('Format berkas tidak valid. Harap unggah berkas gambar (JPG, PNG, atau WEBP).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploadingPhoto(true)
    setPhotoUploadError(null)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      if (uploadDirectorPhotoAction) {
        const res = await uploadDirectorPhotoAction(formData)
        if (res.success && res.url) {
          setEditingDirector({ ...editingDirector, photoUrl: res.url })
          triggerToast('Foto profil berhasil diunggah & dikompresi ke WebP cerdas!')
        } else {
          const err = res.error || 'Gagal mengunggah foto profil.'
          setPhotoUploadError(err)
          alert(err)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah foto.'
      setPhotoUploadError(msg)
      alert(msg)
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleToggleGlobalLeadership = () => {
    const nextVal = !isLeadershipEnabled
    setIsLeadershipEnabled(nextVal)
    startTransition(async () => {
      if (toggleLeadershipVisibilityAction) {
        await toggleLeadershipVisibilityAction(nextVal)
        triggerToast(nextVal ? 'Profil Pimpinan sekarang ditampilkan di website.' : 'Profil Pimpinan berhasil disembunyikan dari website.')
      }
    })
  }

  const triggerToast = (msg?: string) => {
    if (msg) setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  // Handle CRUD Direksi
  const handleOpenAddModal = () => {
    setEditingDirector({
      id: 'dir-' + Date.now(),
      name: '',
      position: '',
      photoUrl: '',
      bio: '',
      education: '',
      experiences: [],
      order: directorsList.length + 1,
      isVisible: true,
    })
    setExpInput('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (director: DirectorItem) => {
    setEditingDirector({ ...director, experiences: [...(director.experiences || [])] })
    setExpInput('')
    setIsModalOpen(true)
  }

  const handleSaveDirectorModal = () => {
    if (!editingDirector || !editingDirector.name.trim() || !editingDirector.position.trim()) {
      alert('Nama dan Jabatan Direktur wajib diisi.')
      return
    }

    let updatedList: DirectorItem[]
    const exists = directorsList.some((d) => d.id === editingDirector.id)
    if (exists) {
      updatedList = directorsList.map((d) => (d.id === editingDirector.id ? editingDirector : d))
    } else {
      updatedList = [...directorsList, editingDirector]
    }

    setDirectorsList(updatedList)
    setIsModalOpen(false)
    setEditingDirector(null)

    startTransition(async () => {
      await saveDirectorsAction(updatedList)
      triggerToast('Data Direksi berhasil disimpan ke draft!')
    })
  }

  const handleDeleteDirector = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus profil direktur ini?')) return
    const updatedList = directorsList.filter((d) => d.id !== id)
    setDirectorsList(updatedList)
    startTransition(async () => {
      await saveDirectorsAction(updatedList)
      triggerToast('Profil Direktur berhasil dihapus.')
    })
  }

  const handleToggleVisibility = (id: string) => {
    const updatedList = directorsList.map((d) => (d.id === id ? { ...d, isVisible: !d.isVisible } : d))
    setDirectorsList(updatedList)
    startTransition(async () => {
      await saveDirectorsAction(updatedList)
      triggerToast('Status visibilitas profil direktur diperbarui.')
    })
  }

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === directorsList.length - 1)) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newList = [...directorsList]
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp

    // Re-assign order numbers
    const orderedList = newList.map((item, idx) => ({ ...item, order: idx + 1 }))
    setDirectorsList(orderedList)
    startTransition(async () => {
      await saveDirectorsAction(orderedList)
      triggerToast('Urutan direksi diperbarui.')
    })
  }

  const handleAddExperience = () => {
    if (!expInput.trim() || !editingDirector) return
    setEditingDirector({
      ...editingDirector,
      experiences: [...(editingDirector.experiences || []), expInput.trim()],
    })
    setExpInput('')
  }

  const handleRemoveExperience = (idx: number) => {
    if (!editingDirector) return
    const newExp = [...(editingDirector.experiences || [])]
    newExp.splice(idx, 1)
    setEditingDirector({
      ...editingDirector,
      experiences: newExp,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      {/* Toast Notifikasi Berhasil */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMessage}</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Klik tombol Deploy di pojok kanan bawah untuk menerbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* Header Halaman Admin */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm relative overflow-hidden transition-colors">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Seksi About Us & Dewan Direksi</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
            Ubah narasi profil perusahaan dan kelola profil dewan direksi untuk halaman detail /leadership.
          </p>
        </div>

        {/* Tab Navigasi Seksi */}
        <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('narrative')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'narrative'
              ? 'bg-amber-500 text-gray-950 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-500'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Narasi Utama About Us</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directors')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'directors'
              ? 'bg-amber-500 text-gray-950 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-500'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>{leadershipLabel || 'Profil Pimpinan'} & Manajemen ({directorsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leadershipPage')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'leadershipPage'
              ? 'bg-amber-500 text-gray-950 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-500'
              }`}
          >
            <Globe className="w-4 h-4" />
            <span>Kustomisasi Halaman /leadership</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NARASI ABOUT US */}
      {activeTab === 'narrative' && (
        <form
          action={async (formData) => {
            formData.set('subtitle', subtitle)
            formData.set('title', title)
            formData.set('p1', p1)
            formData.set('p2', p2)
            formData.set('quote', quote)
            formData.set('leadershipTitle', leadershipTitle)
            formData.set('leadershipDesc', leadershipDesc)

            startTransition(async () => {
              await saveAboutAction(formData)
              setSavedBaseline({
                subtitle: (subtitle || '').trim(),
                title: (title || '').trim(),
                p1: (p1 || '').trim(),
                p2: (p2 || '').trim(),
                quote: (quote || '').trim(),
                leadershipTitle: (leadershipTitle || '').trim(),
                leadershipDesc: (leadershipDesc || '').trim(),
              })
              triggerToast('Perubahan Narasi About Us Berhasil Disimpan ke Draft!')
            })
          }}
          className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-8 transition-colors"
        >
          <div className="space-y-6">
            <h2 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-wider uppercase flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span>Informasi Utama Perusahaan</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Sub-Judul (Tag)</label>
                <input
                  type="text"
                  name="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Judul Utama Seksi</label>
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
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Paragraf Pertama (P1)</label>
              <textarea
                name="p1"
                rows={3}
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none transition-colors"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Paragraf Kedua (P2)</label>
              <textarea
                name="p2"
                rows={3}
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none transition-colors"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Quote / Slogan Kotak Perusahaan</label>
              <input
                type="text"
                name="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-wider uppercase flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <Award className="w-4 h-4" /> Kotak Pengalaman & Kepemimpinan (Leadership Callout di Beranda)
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Judul Kotak Leadership</label>
              <input
                type="text"
                name="leadershipTitle"
                value={leadershipTitle}
                onChange={(e) => setLeadershipTitle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi Rekam Jejak / Pengalaman CEO</label>
              <textarea
                name="leadershipDesc"
                rows={3}
                value={leadershipDesc}
                onChange={(e) => setLeadershipDesc(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner resize-none transition-colors"
              ></textarea>
            </div>
          </div>

          {/* Tombol Simpan Mengambang */}
          <div style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }} className="fixed right-4 sm:right-6 z-45">
            <button
              type="submit"
              disabled={!isDirty || isPending}
              className={`px-6 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${!isDirty || isPending
                ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md shadow-black/20 cursor-pointer'
                }`}
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Draft</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAJEMEN PROFIL PIMPINAN */}
      {activeTab === 'directors' && (
        <div className="space-y-6">
          {/* CARD KONTROL VISIBILITAS PUBLIK PROFIL PIMPINAN */}
          <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${isLeadershipEnabled
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/30'
            : 'bg-red-50/60 dark:bg-red-950/20 border-red-500/30'
            }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isLeadershipEnabled ? 'bg-amber-600' : 'bg-red-500'}`} />
                <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Status Publikasi: {isLeadershipEnabled ? 'AKTIF DITAMPILKAN DI WEBSITE' : 'NONAKTIF / DISEMBUNYIKAN DARI WEBSITE'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isLeadershipEnabled
                  ? 'Profil pimpinan aktif muncul di navbar submenu Tentang Kami, beranda About Us, dan halaman publik /leadership.'
                  : 'Profil pimpinan disembunyikan sepenuhnya dari navigasi & beranda. URL /leadership akan otomatis dialihkan ke beranda.'}
              </p>
            </div>
            {/* Saklar Geser ala Apple (iOS Toggle Switch) Berwarna Maroon Sesuai Palet Perusahaan */}
            <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
              <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${isLeadershipEnabled
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-gray-400 dark:text-gray-500'
                }`}>
                {isLeadershipEnabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isLeadershipEnabled}
                aria-label="Toggle Publikasi Profil Pimpinan"
                onClick={handleToggleGlobalLeadership}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${isLeadershipEnabled ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${isLeadershipEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Daftar Tim Manajemen & Pengelola</span>
            </h2>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Profil Pimpinan</span>
            </button>
          </div>

          <div className="space-y-4">
            {directorsList.length === 0 ? (
              <div className="bg-white dark:bg-[#10131C] p-12 text-center rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-40" />
                <p className="text-sm font-bold">Belum ada data direksi yang ditambahkan.</p>
                <p className="text-xs text-gray-400 mt-1">Klik tombol &ldquo;Tambah Profil Direktur&rdquo; untuk menambahkan profil baru.</p>
              </div>
            ) : (
              directorsList.map((director, idx) => (
                <div
                  key={director.id}
                  className={`bg-white dark:bg-[#10131C] p-6 rounded-3xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${director.isVisible ? 'border-gray-200 dark:border-gray-800 shadow-md' : 'border-gray-200 dark:border-gray-800/40 opacity-60 bg-gray-50/50 dark:bg-gray-900/30'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Urutan */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOrder(idx, 'up')}
                        className="p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === directorsList.length - 1}
                        onClick={() => handleMoveOrder(idx, 'down')}
                        className="p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Foto */}
                    <div className="w-16 h-16 rounded-2xl bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                      {director.photoUrl ? (
                        <img src={director.photoUrl} alt={director.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Users className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Informasi Direktur */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">{director.name}</h3>
                        {!director.isVisible && (
                          <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                            Disembunyikan
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{director.position}</p>
                      {director.education && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{director.education}</p>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(director.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${director.isVisible
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-amber-500'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200 dark:border-red-800/40'
                        }`}
                      title={director.isVisible ? 'Sembunyikan dari web' : 'Tampilkan di web'}
                    >
                      {director.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(director)}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                      title="Edit Profil"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDirector(director.id)}
                      className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                      title="Hapus Profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KUSTOMISASI KONTEN HALAMAN PUBLIK /leadership */}
      {activeTab === 'leadershipPage' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-8 transition-colors">
            
            {/* Header Pengaturan & Tombol Preview */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
              <div className="space-y-1">
                <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  <span>Kustomisasi Teks & Banner Halaman /leadership</span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Seluruh teks banner atas, tombol navigasi kembali, dan kotak komitmen Good Corporate Governance (GCG) dapat diatur langsung dari sini.
                </p>
              </div>

              <a
                href="/leadership"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors shrink-0"
              >
                <span>Lihat Halaman Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* SEKSI 1: BANNER HEADER & NAVIGASI */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 border-b border-gray-100 dark:border-gray-800 pb-2">
                <Users className="w-4 h-4" />
                <span>1. Banner Header & Navigasi Halaman</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Badge / Tag Header
                  </label>
                  <input
                    type="text"
                    value={headerBadge}
                    onChange={(e) => setHeaderBadge(e.target.value)}
                    placeholder="Contoh: Pimpinan & Pengelola Operasional"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Judul Utama Halaman
                  </label>
                  <input
                    type="text"
                    value={headerTitle}
                    onChange={(e) => setHeaderTitle(e.target.value)}
                    placeholder="Contoh: Profil Pimpinan & Tim Manajemen"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Deskripsi Pengantar Halaman
                </label>
                <textarea
                  rows={3}
                  value={headerDesc}
                  onChange={(e) => setHeaderDesc(e.target.value)}
                  placeholder="Gunakan variabel {company} untuk menyisipkan nama perusahaan secara otomatis..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors resize-none leading-relaxed"
                ></textarea>
                <span className="text-[11px] text-gray-400 font-medium">Tips: Variabel <code className="text-amber-600 dark:text-amber-400 font-bold">{'{company}'}</code> akan otomatis diganti dengan nama resmi perusahaan.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Teks Tombol Kembali
                  </label>
                  <input
                    type="text"
                    value={backButtonText}
                    onChange={(e) => setBackButtonText(e.target.value)}
                    placeholder="Contoh: Kembali ke Beranda"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Tautan Link Tombol Kembali
                  </label>
                  <input
                    type="text"
                    value={backButtonLink}
                    onChange={(e) => setBackButtonLink(e.target.value)}
                    placeholder="Contoh: /"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 2: KOTAK KOMITMEN TATA KELOLA (GCG) */}
            <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Kotak Komitmen Tata Kelola (Good Corporate Governance - GCG)</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    showGcgCard ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'
                  }`}>
                    {showGcgCard ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showGcgCard}
                    onClick={() => setShowGcgCard(!showGcgCard)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      showGcgCard ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        showGcgCard ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {showGcgCard && (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Badge Kotak GCG
                      </label>
                      <input
                        type="text"
                        value={gcgBadge}
                        onChange={(e) => setGcgBadge(e.target.value)}
                        placeholder="Contoh: Prinsip Good Corporate Governance (GCG)"
                        className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Judul Komitmen GCG
                      </label>
                      <input
                        type="text"
                        value={gcgTitle}
                        onChange={(e) => setGcgTitle(e.target.value)}
                        placeholder="Contoh: Integritas, Transparansi, dan Akuntabilitas Tanpa Kompromi"
                        className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Narasi Komitmen Tata Kelola (GCG)
                    </label>
                    <textarea
                      rows={4}
                      value={gcgDesc}
                      onChange={(e) => setGcgDesc(e.target.value)}
                      placeholder="Jelaskan komitmen kepatuhan regulasi, perlindungan tenaga kerja, dan integritas perusahaan..."
                      className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors resize-none leading-relaxed"
                    ></textarea>
                    <span className="text-[11px] text-gray-400 font-medium">Tips: Variabel <code className="text-amber-600 dark:text-amber-400 font-bold">{'{company}'}</code> akan otomatis diganti dengan nama resmi perusahaan.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Label Tombol Aksi Utama (CTA)
                      </label>
                      <input
                        type="text"
                        value={gcgCtaText}
                        onChange={(e) => setGcgCtaText(e.target.value)}
                        placeholder="Contoh: Konsultasi Kemitraan"
                        className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Tautan Link Tombol Aksi Utama
                      </label>
                      <input
                        type="text"
                        value={gcgCtaLink}
                        onChange={(e) => setGcgCtaLink(e.target.value)}
                        placeholder="Contoh: /#contact"
                        className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                      />
                    </div>
                  </div>

                  {/* Tombol Sekunder Sertifikasi */}
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#090A0F] space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Tampilkan Tombol Sertifikasi Perusahaan
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={gcgShowCertBtn}
                        onClick={() => setGcgShowCertBtn(!gcgShowCertBtn)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                          gcgShowCertBtn ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                            gcgShowCertBtn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {gcgShowCertBtn && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                            Label Tombol Sertifikasi
                          </label>
                          <input
                            type="text"
                            value={gcgCertText}
                            onChange={(e) => setGcgCertText(e.target.value)}
                            placeholder="Lihat Sertifikasi Perusahaan"
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                            Tautan Link Tombol Sertifikasi
                          </label>
                          <input
                            type="text"
                            value={gcgCertLink}
                            onChange={(e) => setGcgCertLink(e.target.value)}
                            placeholder="/certifications"
                            className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* STICKY BOTTOM ACTION BAR UNTUK TAB /leadership */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className={`text-xs font-bold transition-opacity ${
                isLeadershipDirty ? 'text-amber-600 dark:text-amber-400 opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                ● Ada perubahan yang belum disimpan ke draft
              </span>

              <button
                type="button"
                onClick={handleSaveLeadershipPage}
                disabled={!isLeadershipDirty || isPending}
                className={`px-6 h-12 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  !isLeadershipDirty || isPending
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Simpan ke Draft</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT DIREKTUR */}
      {isModalOpen && editingDirector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#10131C] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>{editingDirector.name ? `Edit Profil: ${editingDirector.name}` : 'Tambah Profil Direktur Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    value={editingDirector.name}
                    onChange={(e) => setEditingDirector({ ...editingDirector, name: e.target.value })}
                    placeholder="Contoh: Drs. Bambang Soeprapto, M.M."
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Jabatan Korporat *</label>
                  <input
                    type="text"
                    value={editingDirector.position}
                    onChange={(e) => setEditingDirector({ ...editingDirector, position: e.target.value })}
                    placeholder="Contoh: Direktur Utama (President Director)"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* UPLOAD FOTO PORTRET DIREKTUR DENGAN SISTEM PINTAR KOMPRESI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Foto Portret Direktur</span>
                  </label>
                </div>

                {editingDirector.photoUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#090A0F]">
                    <div className="relative w-20 h-24 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-500/20 shadow-md shrink-0 bg-gray-200 dark:bg-gray-800">
                      <img
                        src={editingDirector.photoUrl}
                        alt="Preview Foto Direktur"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Foto Aktif
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[220px]" title={editingDirector.photoUrl}>
                          {editingDirector.photoUrl.split('/').pop()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Foto tersimpan dalam format WebP berkualitas jernih & ukuran ringan untuk menghemat kapasitas storage.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                              <span>Mengompresi...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ganti Foto</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDirector({ ...editingDirector, photoUrl: '' })}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${isUploadingPhoto
                      ? 'border-amber-500/50 bg-amber-500/5 cursor-wait'
                      : 'border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 bg-gray-50/50 dark:bg-[#090A0F] hover:bg-gray-50 dark:hover:bg-[#121520]'
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {isUploadingPhoto ? 'Sedang Memproses & Mengompresi Foto...' : 'Klik untuk Unggah Foto'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Format JPG, PNG, WEBP
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {photoUploadError && (
                  <p className="text-xs text-red-500 font-medium">{photoUploadError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Latar Belakang Akademis / Pendidikan</label>
                <input
                  type="text"
                  value={editingDirector.education || ''}
                  onChange={(e) => setEditingDirector({ ...editingDirector, education: e.target.value })}
                  placeholder="Contoh: Magister Manajemen SDM - Universitas Indonesia"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Biografi & Narasi Kepemimpinan</label>
                <textarea
                  rows={3}
                  value={editingDirector.bio || ''}
                  onChange={(e) => setEditingDirector({ ...editingDirector, bio: e.target.value })}
                  placeholder="Deskripsikan rekam jejak, keahlian, dan komitmen kepemimpinan beliau..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium resize-none"
                ></textarea>
              </div>

              {/* LIST PENGALAMAN & REKAM JEJAK */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  Poin Rekam Jejak / Keahlian Kunci
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expInput}
                    onChange={(e) => setExpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddExperience()
                      }
                    }}
                    placeholder="Tuliskan pengalaman atau lisensi penting, lalu tekan Tambah"
                    className="flex-1 bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider"
                  >
                    Tambah
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {(editingDirector.experiences || []).map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span className="line-clamp-1">✓ {exp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tampilkan di Halaman Profil Direksi (/leadership)</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${editingDirector.isVisible ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'
                    }`}>
                    {editingDirector.isVisible ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingDirector.isVisible}
                    onClick={() => setEditingDirector({ ...editingDirector, isVisible: !editingDirector.isVisible })}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${editingDirector.isVisible ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${editingDirector.isVisible ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDirectorModal}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Profil Direktur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}