// app/admin/certifications/CertificationsAdminClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { Award, Plus, Trash2, Edit3, Eye, EyeOff, Save, Check, X, ShieldCheck, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import type { CertificationItem } from '@/lib/db'

interface CertificationsAdminClientProps {
  certifications: CertificationItem[]
  showCertifications?: boolean
  saveCertificationsAction: (certifications: CertificationItem[]) => Promise<void>
  toggleCertificationsVisibilityAction?: (showCertifications: boolean) => Promise<void>
  siteName: string
}

export function CertificationsAdminClient({
  certifications: initialCerts,
  showCertifications = true,
  saveCertificationsAction,
  toggleCertificationsVisibilityAction,
  siteName,
}: CertificationsAdminClientProps) {
  const [certsList, setCertsList] = useState<CertificationItem[]>(initialCerts)
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Perubahan Berhasil Disimpan ke Draft!')
  const [isCertificationsEnabled, setIsCertificationsEnabled] = useState(showCertifications !== false)

  const handleToggleGlobalCertifications = () => {
    const nextVal = !isCertificationsEnabled
    setIsCertificationsEnabled(nextVal)
    startTransition(async () => {
      if (toggleCertificationsVisibilityAction) {
        await toggleCertificationsVisibilityAction(nextVal)
        triggerToast(nextVal ? 'Halaman Sertifikasi sekarang ditampilkan di website.' : 'Halaman Sertifikasi berhasil disembunyikan dari website.')
      }
    })
  }

  const triggerToast = (msg?: string) => {
    if (msg) setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  const handleOpenAdd = () => {
    setEditingCert({
      id: 'cert-' + Date.now(),
      title: '',
      issuer: '',
      certNumber: '',
      issueDate: '',
      expiryDate: '',
      desc: '',
      imageUrl: '',
      watermarkText: `${siteName} • DOKUMEN RESMI RESMI • TIDAK UNTUK DIKANDANGKAN`,
      order: certsList.length + 1,
      isVisible: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cert: CertificationItem) => {
    setEditingCert({ ...cert })
    setIsModalOpen(true)
  }

  const handleSaveModal = () => {
    if (!editingCert || !editingCert.title.trim() || !editingCert.issuer.trim() || !editingCert.imageUrl.trim()) {
      alert('Judul Sertifikasi, Badan Penerbit, dan URL Gambar Sertifikat wajib diisi.')
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

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data sertifikasi ini?')) return
    const updatedList = certsList.filter((c) => c.id !== id)
    setCertsList(updatedList)
    startTransition(async () => {
      await saveCertificationsAction(updatedList)
      triggerToast('Data sertifikasi berhasil dihapus.')
    })
  }

  const handleToggleVisibility = (id: string) => {
    const updatedList = certsList.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c))
    setCertsList(updatedList)
    startTransition(async () => {
      await saveCertificationsAction(updatedList)
      triggerToast('Status visibilitas sertifikasi diperbarui.')
    })
  }

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
            <p className="text-[11px] text-amber-400/80 font-medium">Klik tombol Deploy di navigasi bawah untuk menerbitkan ke website utama.</p>
          </div>
        </div>
      </div>

      {/* Header Halaman Admin */}
      <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm relative overflow-hidden transition-colors">
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Sertifikasi & Lisensi Perusahaan</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
            Atur daftar sertifikasi mutu (ISO 9001, 45001), lisensi SIO-BUJP POLRI, dan watermark perlindungan anti-duplikasi digital.
          </p>
        </div>
      </div>

      {/* CARD KONTROL VISIBILITAS PUBLIK SERTIFIKASI */}
      <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        isCertificationsEnabled
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30'
          : 'bg-red-50/60 dark:bg-red-950/20 border-red-500/30'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCertificationsEnabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
              Status Publikasi: {isCertificationsEnabled ? 'AKTIF DITAMPILKAN DI WEBSITE' : 'NONAKTIF / DISEMBUNYIKAN DARI WEBSITE'}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isCertificationsEnabled 
              ? 'Sertifikasi aktif muncul di navbar submenu Tentang Kami, beranda About Us, dan halaman publik /certifications.'
              : 'Sertifikasi disembunyikan sepenuhnya dari navigasi & beranda. URL /certifications akan otomatis dialihkan ke beranda.'}
          </p>
        </div>
        {/* Saklar Geser ala Apple (iOS Toggle Switch) */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
          <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${
            isCertificationsEnabled
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {isCertificationsEnabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isCertificationsEnabled}
            aria-label="Toggle Publikasi Sertifikasi Perusahaan"
            onClick={handleToggleGlobalCertifications}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              isCertificationsEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
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

      {/* Kontrol Utama */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total: {certsList.length} Sertifikat</span>
          <a
            href="/certifications"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Buka Halaman Publik (/certifications)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sertifikasi</span>
        </button>
      </div>

      {/* List Sertifikasi */}
      <div className="space-y-4">
        {certsList.length === 0 ? (
          <div className="bg-white dark:bg-[#10131C] p-12 text-center rounded-3xl border border-gray-200 dark:border-gray-800 text-gray-500">
            <Award className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-40" />
            <p className="text-sm font-bold">Belum ada sertifikasi yang ditambahkan.</p>
            <p className="text-xs text-gray-400 mt-1">Klik tombol &ldquo;Tambah Sertifikasi&rdquo; untuk mengunggah dokumen baru.</p>
          </div>
        ) : (
          certsList.map((cert, idx) => (
            <div
              key={cert.id}
              className={`bg-white dark:bg-[#10131C] p-6 rounded-3xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                cert.isVisible ? 'border-gray-200 dark:border-gray-800 shadow-md' : 'border-gray-200 dark:border-gray-800/40 opacity-60 bg-gray-50/50 dark:bg-gray-900/30'
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
                    disabled={idx === certsList.length - 1}
                    onClick={() => handleMoveOrder(idx, 'down')}
                    className="p-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Gambar dengan Watermark Badge */}
                <div className="w-20 h-20 rounded-2xl bg-gray-900 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700 relative">
                  <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                    <ShieldCheck className="w-5 h-5 text-amber-400/80" />
                  </div>
                </div>

                {/* Informasi Sertifikat */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {cert.issuer}
                    </span>
                    {!cert.isVisible && (
                      <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                        Disembunyikan
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{cert.title}</h3>
                  {cert.certNumber && (
                    <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">No: {cert.certNumber}</p>
                  )}
                  {cert.watermarkText && (
                    <p className="text-[10px] text-amber-500/80 font-medium truncate max-w-md">
                      🛡️ Watermark: &ldquo;{cert.watermarkText}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(cert.id)}
                  className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    cert.isVisible
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-amber-500'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200 dark:border-red-800/40'
                  }`}
                  title={cert.isVisible ? 'Sembunyikan dari web' : 'Tampilkan di web'}
                >
                  {cert.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cert)}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                  title="Edit Sertifikat"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cert.id)}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                  title="Hapus Sertifikat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH / EDIT SERTIFIKAT */}
      {isModalOpen && editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#10131C] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{editingCert.title ? `Edit Sertifikasi: ${editingCert.title}` : 'Tambah Sertifikasi Baru'}</span>
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
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Judul Sertifikasi / Lisensi *
                </label>
                <input
                  type="text"
                  value={editingCert.title}
                  onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                  placeholder="Contoh: ISO 9001:2015 - Sistem Manajemen Mutu"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Badan Penerbit / Akreditasi *
                  </label>
                  <input
                    type="text"
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    placeholder="Contoh: Kepolisian RI / Badan Akreditasi ISO"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Nomor Sertifikat / Izin
                  </label>
                  <input
                    type="text"
                    value={editingCert.certNumber || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, certNumber: e.target.value })}
                    placeholder="Contoh: QMS/2024/ESU-88912"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  URL Gambar Dokumen Sertifikat *
                </label>
                <input
                  type="text"
                  value={editingCert.imageUrl}
                  onChange={(e) => setEditingCert({ ...editingCert, imageUrl: e.target.value })}
                  placeholder="https://... atau path gambar"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
              </div>

              {/* TEKS WATERMARK (POINT 2) */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <label className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Teks Watermark Perlindungan Gambar</span>
                </label>
                <input
                  type="text"
                  value={editingCert.watermarkText || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, watermarkText: e.target.value })}
                  placeholder={`Contoh: ${siteName} • DOKUMEN RESMI RESMI`}
                  className="w-full bg-white dark:bg-[#090A0F] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
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
                    editingCert.isVisible ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'
                  }`}>
                    {editingCert.isVisible ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingCert.isVisible}
                    onClick={() => setEditingCert({ ...editingCert, isVisible: !editingCert.isVisible })}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                      editingCert.isVisible ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
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
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Sertifikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificationsAdminClient

