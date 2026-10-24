// app/admin/certifications/CertificationsAdminClient.tsx
'use client'

import { useState, useTransition, useMemo, useRef } from 'react'
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Globe,
  UploadCloud,
  Loader2,
  FileText,
  PhoneCall,
  Users
} from 'lucide-react'
import type { CertificationItem } from '@/lib/db'
import { defaultCertificationsPageConfig, type CertificationsPageConfig } from '@/lib/certificationsConstants'

interface CertificationsAdminClientProps {
  certifications: CertificationItem[]
  showCertifications?: boolean
  certificationsPageConfig?: CertificationsPageConfig
  saveCertificationsAction: (certifications: CertificationItem[]) => Promise<void>
  saveCertificationsPageAction?: (config: CertificationsPageConfig) => Promise<void>
  uploadCertificateImageAction?: (formData: FormData) => Promise<{ success: boolean; url?: string; error?: string }>
  toggleCertificationsVisibilityAction?: (showCertifications: boolean) => Promise<void>
  siteName: string
}

export function CertificationsAdminClient({
  certifications: initialCerts,
  showCertifications = true,
  certificationsPageConfig: initialPageConfig = defaultCertificationsPageConfig,
  saveCertificationsAction,
  saveCertificationsPageAction,
  uploadCertificateImageAction,
  toggleCertificationsVisibilityAction,
  siteName,
}: CertificationsAdminClientProps) {
  // State Dokumen Sertifikasi
  const [certsList, setCertsList] = useState<CertificationItem[]>(initialCerts)
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Perubahan Berhasil Disimpan ke Draft!')
  const [isCertificationsEnabled, setIsCertificationsEnabled] = useState(showCertifications !== false)

  // State Upload Berkas Gambar Sertifikat
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState('')

  // State Kustomisasi Halaman Publik /certifications
  const [pageConfig, setPageConfig] = useState<CertificationsPageConfig>({
    ...defaultCertificationsPageConfig,
    ...(initialPageConfig || {}),
  })

  // Baseline untuk Dirty Tracking Kustomisasi Halaman
  const [savedPageBaseline, setSavedPageBaseline] = useState<CertificationsPageConfig>({
    ...defaultCertificationsPageConfig,
    ...(initialPageConfig || {}),
  })

  const isPageDirty = useMemo(() => {
    return JSON.stringify(pageConfig) !== JSON.stringify(savedPageBaseline)
  }, [pageConfig, savedPageBaseline])

  const triggerToast = (msg?: string) => {
    if (msg) setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  // Toggle Publikasi Halaman Publik /certifications
  const handleToggleGlobalCertifications = () => {
    const nextVal = !isCertificationsEnabled
    setIsCertificationsEnabled(nextVal)
    startTransition(async () => {
      if (toggleCertificationsVisibilityAction) {
        await toggleCertificationsVisibilityAction(nextVal)
        triggerToast(
          nextVal 
            ? 'Halaman Sertifikasi sekarang ditampilkan di website.' 
            : 'Halaman Sertifikasi berhasil disembunyikan dari website.'
        )
      }
    })
  }

  // Buka Modal Tambah Dokumen
  const handleOpenAdd = () => {
    setImageUploadError('')
    setEditingCert({
      id: 'cert-' + Date.now(),
      title: '',
      issuer: '',
      certNumber: '',
      issueDate: '',
      expiryDate: '',
      desc: '',
      imageUrl: '',
      watermarkText: `${siteName} • DOKUMEN RESMI • TIDAK UNTUK DIKANDANGKAN`,
      order: certsList.length + 1,
      isVisible: true,
    })
    setIsModalOpen(true)
  }

  // Buka Modal Edit Dokumen
  const handleOpenEdit = (cert: CertificationItem) => {
    setImageUploadError('')
    setEditingCert({ ...cert })
    setIsModalOpen(true)
  }

  // Upload Gambar Dokumen Sertifikat (Sharp WebP kompresi otomatis)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingCert) return

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError('Ukuran file melebihi batas maksimal 10MB.')
      if (e.target) e.target.value = ''
      return
    }

    setImageUploadError('')
    setIsUploadingImage(true)

    try {
      if (uploadCertificateImageAction) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await uploadCertificateImageAction(formData)
        if (res.success && res.url) {
          setEditingCert((prev) => prev ? { ...prev, imageUrl: res.url! } : null)
        } else {
          setImageUploadError(res.error || 'Gagal mengunggah gambar sertifikat.')
        }
      } else {
        setImageUploadError('Fungsi upload server tidak tersedia.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setImageUploadError(`Gagal upload: ${msg}`)
    } finally {
      setIsUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  // Simpan Modal Dokumen Sertifikat
  const handleSaveModal = () => {
    if (!editingCert || !editingCert.title.trim() || !editingCert.issuer.trim() || !editingCert.imageUrl.trim()) {
      alert('Judul Sertifikasi, Badan Penerbit, dan URL/Foto Dokumen Sertifikat wajib diisi.')
      return
    }

    let updatedList: CertificationItem[]
    const exists = certsList.some((c) => c.id === editingCert.id)
    if (exists) {
      updatedList = certsList.map((c) => (c.id === editingCert.id ? editingCert : c))
    } else {
      updatedList = [...certsList, editingCert]
    }

    setCertsList(updatedList)
    setIsModalOpen(false)
    setEditingCert(null)

    startTransition(async () => {
      await saveCertificationsAction(updatedList)
      triggerToast('Sertifikasi berhasil disimpan ke draft!')
    })
  }

  // Hapus Dokumen Sertifikat
  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data sertifikasi ini?')) return
    const updatedList = certsList.filter((c) => c.id !== id)
    setCertsList(updatedList)
    startTransition(async () => {
      await saveCertificationsAction(updatedList)
      triggerToast('Data sertifikasi berhasil dihapus.')
    })
  }

  // Toggle Visibilitas Item Tertentu
  const handleToggleVisibility = (id: string) => {
    const updatedList = certsList.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c))
    setCertsList(updatedList)
    startTransition(async () => {
      await saveCertificationsAction(updatedList)
      triggerToast('Status visibilitas sertifikasi diperbarui.')
    })
  }

  // Ubah Urutan Dokumen
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === certsList.length - 1)) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newList = [...certsList]
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp

    const orderedList = newList.map((item, idx) => ({ ...item, order: idx + 1 }))
    setCertsList(orderedList)
    startTransition(async () => {
      await saveCertificationsAction(orderedList)
      triggerToast('Urutan sertifikasi diperbarui.')
    })
  }

  // Simpan Kustomisasi Halaman Publik /certifications
  const handleSavePageConfig = () => {
    if (!saveCertificationsPageAction) return

    startTransition(async () => {
      await saveCertificationsPageAction(pageConfig)
      setSavedPageBaseline({ ...pageConfig })
      triggerToast('Pengaturan halaman /certifications berhasil disimpan ke draft!')
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 relative">
      {/* Toast Notifikasi Berhasil */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
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

      {/* Header Banner - Persis seperti di Portofolio, Layanan, dan Galeri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm relative overflow-hidden transition-colors">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Kelola Sertifikasi & Lisensi Perusahaan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
            Tambah dokumen mutu resmi, izin operasional, watermark perlindungan, dan kustomisasi halaman <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">/certifications</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="relative z-10 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Dokumen Baru</span>
        </button>
      </div>

      {/* CARD KONTROL VISIBILITAS PUBLIK SERTIFIKASI */}
      <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        isCertificationsEnabled
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/30'
          : 'bg-red-50/60 dark:bg-red-950/20 border-red-500/30'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCertificationsEnabled ? 'bg-amber-600' : 'bg-red-500'}`} />
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Publikasi Halaman Sertifikasi (/certifications)
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
            {isCertificationsEnabled
              ? 'Halaman sertifikasi aktif dan dapat diakses publik melalui menu navigasi maupun tautan langsung.'
              : 'Halaman sertifikasi saat ini dinonaktifkan / disembunyikan dari pengunjung publik website.'}
          </p>
        </div>

        {/* Saklar Geser ala Apple (iOS Toggle Switch) Berwarna Maroon Sesuai Palet Perusahaan */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
          <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${
            isCertificationsEnabled
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {isCertificationsEnabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isCertificationsEnabled}
            aria-label="Toggle Publikasi Halaman Sertifikasi"
            onClick={handleToggleGlobalCertifications}
            disabled={isPending}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
              isCertificationsEnabled ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                isCertificationsEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* FORM CARD: HEADER & KONTEN HALAMAN PUBLIK /certifications - Persis seperti Form Header di Portofolio & Galeri */}
      <div className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-8 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-wider uppercase flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <span>Header & Konten Halaman Publik (/certifications)</span>
          </h2>
          <a
            href="/certifications"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Pratinjau Halaman</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 1. Banner Header & Navigasi */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 border-b border-gray-100 dark:border-gray-800 pb-2">
            <FileText className="w-4 h-4" />
            <span>1. Banner Header & Tombol Navigasi Kembali</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Sub-Judul (Badge Header)
              </label>
              <input
                type="text"
                value={pageConfig.headerBadge}
                onChange={(e) => setPageConfig({ ...pageConfig, headerBadge: e.target.value })}
                placeholder="Contoh: Kepatuhan Regulasi & Standar Mutu"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Judul Utama Halaman
              </label>
              <input
                type="text"
                value={pageConfig.headerTitle}
                onChange={(e) => setPageConfig({ ...pageConfig, headerTitle: e.target.value })}
                placeholder="Contoh: Sertifikasi & Izin Operasional Resmi"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Deskripsi Pengantar Halaman
              </label>
              <span className="text-[11px] text-gray-400 font-medium">
                Gunakan variabel <code className="text-amber-600 dark:text-amber-400 font-bold">&#123;company&#125;</code> untuk nama perusahaan otomatis
              </span>
            </div>
            <textarea
              rows={3}
              value={pageConfig.headerDesc}
              onChange={(e) => setPageConfig({ ...pageConfig, headerDesc: e.target.value })}
              placeholder="Bukti legalitas, keabsahan akreditasi internasional..."
              className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Teks Tombol Kembali
              </label>
              <input
                type="text"
                value={pageConfig.backButtonText}
                onChange={(e) => setPageConfig({ ...pageConfig, backButtonText: e.target.value })}
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
                value={pageConfig.backButtonLink}
                onChange={(e) => setPageConfig({ ...pageConfig, backButtonLink: e.target.value })}
                placeholder="Contoh: /"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 2. Kotak Proteksi Keaslian Dokumen */}
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Kotak Informasi Proteksi Keaslian Dokumen Legal</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-black uppercase tracking-wider ${
                pageConfig.showProtectionCard ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'
              }`}>
                {pageConfig.showProtectionCard ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={pageConfig.showProtectionCard}
                onClick={() => setPageConfig({ ...pageConfig, showProtectionCard: !pageConfig.showProtectionCard })}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  pageConfig.showProtectionCard ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                    pageConfig.showProtectionCard ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {pageConfig.showProtectionCard && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Badge Proteksi Dokumen
                  </label>
                  <input
                    type="text"
                    value={pageConfig.protectionBadge}
                    onChange={(e) => setPageConfig({ ...pageConfig, protectionBadge: e.target.value })}
                    placeholder="Contoh: Proteksi Keaslian Dokumen Legal"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Judul Kotak Proteksi
                  </label>
                  <input
                    type="text"
                    value={pageConfig.protectionTitle}
                    onChange={(e) => setPageConfig({ ...pageConfig, protectionTitle: e.target.value })}
                    placeholder="Contoh: Verifikasi & Validasi Dokumen Legal Perusahaan"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Narasi / Penjelasan Proteksi Dokumen
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Gunakan variabel <code className="text-amber-600 dark:text-amber-400 font-bold">&#123;company&#125;</code> untuk nama perusahaan otomatis
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={pageConfig.protectionDesc}
                  onChange={(e) => setPageConfig({ ...pageConfig, protectionDesc: e.target.value })}
                  placeholder="Seluruh sertifikat akreditasi ISO, lisensi operasional BUJP POLRI..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:border-amber-500 font-medium shadow-inner transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Tombol Aksi Utama */}
              <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#090A0F] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <span>Tombol Aksi Utama (Verifikasi / Kontak)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      Label Teks Tombol
                    </label>
                    <input
                      type="text"
                      value={pageConfig.protectionCtaText}
                      onChange={(e) => setPageConfig({ ...pageConfig, protectionCtaText: e.target.value })}
                      placeholder="Contoh: Verifikasi Berkas Kemitraan"
                      className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      Tautan Link Tombol
                    </label>
                    <input
                      type="text"
                      value={pageConfig.protectionCtaLink}
                      onChange={(e) => setPageConfig({ ...pageConfig, protectionCtaLink: e.target.value })}
                      placeholder="Contoh: /#contact"
                      className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Sekunder ke Leadership */}
              <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#090A0F] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <span>Tampilkan Tombol Navigasi ke Halaman Pimpinan (/leadership)</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pageConfig.protectionShowLeadershipBtn}
                    onClick={() => setPageConfig({ ...pageConfig, protectionShowLeadershipBtn: !pageConfig.protectionShowLeadershipBtn })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      pageConfig.protectionShowLeadershipBtn ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        pageConfig.protectionShowLeadershipBtn ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {pageConfig.protectionShowLeadershipBtn && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        Label Teks Tombol
                      </label>
                      <input
                        type="text"
                        value={pageConfig.protectionLeadershipText}
                        onChange={(e) => setPageConfig({ ...pageConfig, protectionLeadershipText: e.target.value })}
                        placeholder="Contoh: Lihat Profil Pimpinan"
                        className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        Tautan Link Tombol
                      </label>
                      <input
                        type="text"
                        value={pageConfig.protectionLeadershipLink}
                        onChange={(e) => setPageConfig({ ...pageConfig, protectionLeadershipLink: e.target.value })}
                        placeholder="Contoh: /leadership"
                        className="w-full bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Simpan Kustomisasi Halaman ke Draft - Posisi persis seperti Form Header Portofolio/Galeri */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPageDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {isPageDirty ? 'Ada perubahan teks halaman yang belum disimpan.' : 'Pengaturan halaman publik tersimpan rapi.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isPageDirty && (
              <button
                type="button"
                onClick={() => setPageConfig({ ...savedPageBaseline })}
                className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="button"
              onClick={handleSavePageConfig}
              disabled={!isPageDirty || isPending}
              className={`font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                isPageDirty && !isPending
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kustomisasi Halaman ke Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAFTAR DOKUMEN SERTIFIKASI RESMI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <span>Daftar Dokumen Sertifikasi Resmi ({certsList.length})</span>
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Gunakan panah untuk mengatur urutan tampilan
          </span>
        </div>

        {certsList.length === 0 ? (
          <div className="bg-white dark:bg-[#10131C] p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 space-y-3">
            <Award className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Belum Ada Data Sertifikasi</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Klik tombol &quot;+ Tambah Dokumen Baru&quot; di atas untuk mengunggah dokumen legalitas pertama Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certsList.map((cert, index) => (
              <div
                key={cert.id}
                className={`bg-white dark:bg-[#10131C] p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm ${
                  cert.isVisible !== false
                    ? 'border-gray-200 dark:border-gray-800/80 hover:border-amber-500/40'
                    : 'border-red-200 dark:border-red-900/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Urutan */}
                  <div className="flex flex-col gap-1 items-center justify-center pt-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Geser ke atas"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-gray-500">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === certsList.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Geser ke bawah"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preview Thumbnail */}
                  <div className="w-20 h-24 rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800 relative shrink-0 shadow-inner">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Award className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Informasi Dokumen */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {cert.issuer}
                      </span>
                      {cert.certNumber && (
                        <span className="text-[11px] font-mono text-gray-600 dark:text-gray-400 font-semibold">
                          No: {cert.certNumber}
                        </span>
                      )}
                      {cert.isVisible === false && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                          Disembunyikan
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight truncate">
                      {cert.title}
                    </h3>

                    {(cert.issueDate || cert.expiryDate) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Masa Berlaku: {cert.issueDate || '-'} s.d {cert.expiryDate || 'Tetap'}
                      </p>
                    )}

                    {cert.watermarkText && (
                      <p className="text-[11px] text-gray-400 font-mono truncate flex items-center gap-1.5 pt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Watermark: {cert.watermarkText}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(cert.id)}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      cert.isVisible !== false
                        ? 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:border-amber-500/40'
                        : 'border-red-300 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/20'
                    }`}
                    title={cert.isVisible !== false ? 'Sembunyikan sertifikasi' : 'Tampilkan sertifikasi'}
                  >
                    {cert.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cert)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:border-amber-500/40 transition-colors cursor-pointer"
                    title="Edit sertifikasi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 transition-colors cursor-pointer"
                    title="Hapus sertifikasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT DOKUMEN SERTIFIKASI */}
      {isModalOpen && editingCert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#10131C] text-gray-900 dark:text-white w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {editingCert.title ? 'Edit Dokumen Sertifikasi' : 'Tambah Dokumen Sertifikasi Baru'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Isi data akreditasi, unggah gambar dokumen resmi, dan atur watermark anti-duplikasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Judul Sertifikasi / Dokumen Izin *
                </label>
                <input
                  type="text"
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  placeholder="Contoh: ISO 9001:2015 - Sistem Manajemen Mutu"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Badan Penerbit / Akreditasi *
                  </label>
                  <input
                    type="text"
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    placeholder="Contoh: Badan Sertifikasi Internasional / POLRI"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Nomor Sertifikat / Lisensi
                  </label>
                  <input
                    type="text"
                    value={editingCert.certNumber || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, certNumber: e.target.value })}
                    placeholder="Contoh: QMS/2024/4SU-88912"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Tanggal Terbit
                  </label>
                  <input
                    type="text"
                    value={editingCert.issueDate || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                    placeholder="Contoh: 15 Januari 2024"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Masa Berlaku / Kedaluwarsa
                  </label>
                  <input
                    type="text"
                    value={editingCert.expiryDate || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, expiryDate: e.target.value })}
                    placeholder="Contoh: 14 Januari 2027"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* UPLOAD FOTO / DOKUMEN SERTIFIKAT DENGAN SISTEM PINTAR SHARP WEBP (MAKS 10MB) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Upload Foto / Dokumen Sertifikat (Maks. 10MB) *
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Kompresi Cerdas Otomatis ke KB
                  </span>
                </div>

                {editingCert.imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800">
                    <div className="w-24 h-28 rounded-xl bg-gray-900 overflow-hidden relative shrink-0 shadow-md border border-gray-300 dark:border-gray-700">
                      <img
                        src={editingCert.imageUrl}
                        alt="Preview Sertifikat"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Dokumen Siap
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[200px]" title={editingCert.imageUrl}>
                          {editingCert.imageUrl.split('/').pop()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        File dikompresi ke WebP berukuran KB untuk performa maksimal dan efisiensi storage.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                              <span>Mengompresi...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                              <span>Ganti Berkas</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCert({ ...editingCert, imageUrl: '' })}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
                      isUploadingImage
                        ? 'border-amber-500/50 bg-amber-500/5 cursor-wait'
                        : 'border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 bg-gray-50/50 dark:bg-[#090A0F] hover:bg-gray-50 dark:hover:bg-[#121520]'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {isUploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {isUploadingImage ? 'Sedang Memproses & Mengompresi Gambar...' : 'Klik untuk Unggah Berkas Dokumen Sertifikat'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Ukuran maksimal 10MB • Format JPG, PNG, WEBP
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imageUploadError && (
                  <p className="text-xs text-red-500 font-medium">{imageUploadError}</p>
                )}

                {/* Input URL Gambar Manual Alternatif */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={editingCert.imageUrl}
                    onChange={(e) => setEditingCert({ ...editingCert, imageUrl: e.target.value })}
                    placeholder="Atau masukkan URL gambar langsung (https://...)"
                    className="w-full bg-white dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* TEKS WATERMARK PERLINDUNGAN GAMBAR */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <label className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Teks Watermark Perlindungan Gambar Dokumen</span>
                </label>
                <input
                  type="text"
                  value={editingCert.watermarkText || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, watermarkText: e.target.value })}
                  placeholder={`Contoh: ${siteName} • DOKUMEN RESMI`}
                  className="w-full bg-white dark:bg-[#090A0F] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Teks ini akan dirender secara diagonal berulang di atas gambar sertifikat pada website publik untuk mencegah pencurian atau duplikasi berkas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Deskripsi / Ruang Lingkup Sertifikasi
                </label>
                <textarea
                  rows={3}
                  value={editingCert.desc || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, desc: e.target.value })}
                  placeholder="Jelaskan ruang lingkup akreditasi atau jaminan kualitas yang dicakup oleh sertifikasi ini..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tampilkan di Halaman Sertifikasi (/certifications)</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    editingCert.isVisible ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'
                  }`}>
                    {editingCert.isVisible ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingCert.isVisible}
                    onClick={() => setEditingCert({ ...editingCert, isVisible: !editingCert.isVisible })}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      editingCert.isVisible ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                        editingCert.isVisible ? 'translate-x-7' : 'translate-x-0'
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
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isPending || isUploadingImage}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificationsAdminClient
