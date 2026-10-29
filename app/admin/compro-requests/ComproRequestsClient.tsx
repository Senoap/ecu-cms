// app/admin/compro-requests/ComproRequestsClient.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { 
  FileDown, 
  Mail, 
  Send, 
  Trash2, 
  Save, 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Phone,
  Paperclip,
  UploadCloud,
  FileText,
  Eye,
  Server
} from 'lucide-react'
import type { ComproRequestItem, ComproEmailTemplate } from '@/lib/db'

interface ComproRequestsClientProps {
  requests: ComproRequestItem[]
  template: ComproEmailTemplate
  pdfInfo?: { exists: boolean; sizeKb: number; filename: string }
  smtpStatus?: {
    configured: boolean
    host?: string
    port?: number
    userMasked?: string
    from?: string
    secure?: boolean
  }
  resendEmailAction: (id: string) => Promise<{ success: boolean; message: string }>
  updateStatusAction: (id: string, status: 'sent' | 'pending' | 'followed_up') => Promise<{ success: boolean }>
  deleteRequestAction: (id: string) => Promise<{ success: boolean }>
  saveTemplateAction: (tpl: ComproEmailTemplate) => Promise<{ success: boolean; message?: string }>
  uploadPdfAction: (formData: FormData) => Promise<{ success: boolean; message: string; pdfUrl?: string; sizeKb?: number }>
  testSmtpAction?: (testEmail?: string) => Promise<{ success: boolean; message: string }>
  showCompro?: boolean
  toggleComproVisibilityAction?: (showCompro: boolean) => Promise<{ success: boolean }>
}

export default function ComproRequestsClient({
  requests: initialRequests,
  template: initialTemplate,
  pdfInfo: initialPdfInfo = { exists: true, sizeKb: 399, filename: 'compro.pdf' },
  smtpStatus,
  showCompro = true,
  toggleComproVisibilityAction,
  resendEmailAction,
  updateStatusAction,
  deleteRequestAction,
  saveTemplateAction,
  uploadPdfAction,
  testSmtpAction,
}: ComproRequestsClientProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'template'>('list')
  const [requestsList, setRequestsList] = useState<ComproRequestItem[]>(initialRequests)
  const [templateData, setTemplateData] = useState<ComproEmailTemplate>(initialTemplate)
  const [currentPdfInfo, setCurrentPdfInfo] = useState(initialPdfInfo)
  const [isComproEnabled, setIsComproEnabled] = useState(showCompro !== false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'pending' | 'followed_up'>('all')
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isTestingSmtp, setIsTestingSmtp] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testSmtpAction) return
    setIsTestingSmtp(true)
    try {
      const res = await testSmtpAction(testEmail.trim() || undefined)
      triggerToast(res.message)
    } catch (err: unknown) {
      triggerToast((err as Error).message || 'Terjadi kesalahan saat menguji SMTP.')
    } finally {
      setIsTestingSmtp(false)
    }
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  // Toggle Fitur Permintaan Compro PDF Publik
  const handleToggleCompro = () => {
    const nextVal = !isComproEnabled
    setIsComproEnabled(nextVal)
    startTransition(async () => {
      if (toggleComproVisibilityAction) {
        await toggleComproVisibilityAction(nextVal)
        triggerToast(
          nextVal
            ? 'Fitur Permintaan Compro PDF sekarang ditampilkan di website.'
            : 'Fitur Permintaan Compro PDF berhasil disembunyikan dari website.'
        )
      }
    })
  }

  // Filter permintaan
  const filteredRequests = requestsList.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)

    if (filterStatus === 'all') return matchSearch
    return matchSearch && r.status === filterStatus
  })

  // Hitung statistik
  const totalReq = requestsList.length
  const totalSent = requestsList.filter((r) => r.status === 'sent').length
  const totalPending = requestsList.filter((r) => r.status === 'pending').length
  const totalFollowedUp = requestsList.filter((r) => r.status === 'followed_up').length

  const handleResend = (id: string) => {
    startTransition(async () => {
      const res = await resendEmailAction(id)
      if (res.success) {
        setRequestsList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'sent', sentAt: Date.now() } : item))
        )
        triggerToast(res.message)
      } else {
        triggerToast(res.message)
      }
    })
  }

  const handleStatusChange = (id: string, newStatus: 'sent' | 'pending' | 'followed_up') => {
    startTransition(async () => {
      await updateStatusAction(id, newStatus)
      setRequestsList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      )
      triggerToast('Status permintaan berhasil diubah.')
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus riwayat permintaan Company Profile ini?')) return
    startTransition(async () => {
      await deleteRequestAction(id)
      setRequestsList((prev) => prev.filter((item) => item.id !== id))
      triggerToast('Permintaan berhasil dihapus.')
    })
  }

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await saveTemplateAction(templateData)
      triggerToast(res.message || 'Template email berhasil disimpan.')
    })
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Mohon pilih berkas dengan format PDF (.pdf).')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      const res = await uploadPdfAction(formData)
      if (res.success) {
        setTemplateData((prev) => ({ ...prev, pdfUrl: res.pdfUrl || '/compro.pdf' }))
        setCurrentPdfInfo({
          exists: true,
          sizeKb: res.sizeKb || Math.round(file.size / 1024),
          filename: file.name,
        })
        triggerToast(res.message)
      } else {
        alert(res.message)
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Gagal mengunggah file PDF.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Toast Alert */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">{toastMessage}</h4>
          </div>
        </div>
      </div>

      {/* Header Halaman Admin & Tab Navigasi (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Permintaan Company Profile (PDF)
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pantau prospek klien yang meminta profil perusahaan dan atur pengiriman email dengan berkas PDF terlampir langsung.
            </p>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:border-gray-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daftar Permintaan ({totalReq})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'template'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-[#222736] text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:border-gray-800'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Lampiran &amp; Template Email Otomatis</span>
          </button>
        </div>
      </div>

      {/* CARD KONTROL VISIBILITAS PUBLIK FITUR PERMINTAAN COMPRO */}
      <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
        isComproEnabled
          ? 'bg-gray-50 dark:bg-[#090A0F] dark:bg-gray-900/40 border-gray-200 dark:border-gray-800'
          : 'bg-red-50/60 dark:bg-red-950/20 border-red-500/30'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isComproEnabled ? 'bg-blue-600' : 'bg-red-500'}`} />
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Status Fitur: {isComproEnabled ? 'AKTIF DITAMPILKAN DI WEBSITE' : 'NONAKTIF / DISEMBUNYIKAN DARI WEBSITE'}
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
            {isComproEnabled
              ? 'Tombol & formulir permintaan Compro PDF aktif muncul di navigasi website (desktop & mobile menu) untuk pengunjung publik.'
              : 'Fitur dan tombol permintaan Compro PDF dinonaktifkan / disembunyikan sepenuhnya dari pengunjung website.'}
          </p>
        </div>

        {/* Saklar Geser ala Apple (iOS Toggle Switch) Berwarna Maroon Sesuai Palet Perusahaan */}
        <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
          <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${
            isComproEnabled
              ? 'text-black dark:text-white dark:text-gray-500 dark:text-gray-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {isComproEnabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isComproEnabled}
            aria-label="Toggle Fitur Permintaan Compro PDF"
            onClick={handleToggleCompro}
            disabled={isPending}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              isComproEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                isComproEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR PERMINTAAN */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS (Minimalis seperti /cms/users) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-200 dark:border-[#222736] rounded-xl bg-white dark:bg-[#13161F] divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-[#222736]">
            <div className="p-4">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Masuk</p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tabular-nums">{totalReq}</p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">PDF Terkirim</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{totalSent}</p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Menunggu</p>
              <p className="text-xl font-black text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">{totalPending}</p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Ditindaklanjuti</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">{totalFollowedUp}</p>
            </div>
          </div>

          {/* FILTER & PENCARIAN */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama, email, perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {(['all', 'sent', 'pending', 'followed_up'] as const).map((st) => {
                const labels: Record<string, string> = {
                  all: 'Semua Status',
                  sent: 'PDF Terkirim',
                  pending: 'Pending',
                  followed_up: 'Follow Up',
                }
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                      filterStatus === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {labels[st]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* DAFTAR PERMINTAAN */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white dark:bg-[#10131C] p-12 rounded-3xl border border-gray-200 dark:border-gray-800 text-center space-y-3">
                <FileDown className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Tidak ada permintaan ditemukan</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Setiap kali calon klien mengisi form permintaan Company Profile PDF di website utama, datanya akan langsung tercatat di sini.
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const cleanPhone = req.phone.replace(/[^0-9]/g, '')
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu ${req.name} (${req.company}), terima kasih telah meminta Company Profile PT. Empat Sinergi Utama. Apakah ada kebutuhan operasional atau tenaga kerja yang dapat kami bantu diskusikan?`
                )}`

                return (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-[#10131C] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm hover:border-gray-200 dark:border-gray-800 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">{req.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">({req.company})</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          Masuk: {new Date(req.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      {/* Dropdown Status */}
                      <div className="flex items-center gap-2">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as 'sent' | 'pending' | 'followed_up')}
                          className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                            req.status === 'sent'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : req.status === 'followed_up'
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-500/30'
                              : 'bg-gray-50 dark:bg-[#090A0F] dark:bg-gray-900/40 text-black dark:text-white dark:text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="sent">PDF Terkirim</option>
                          <option value="followed_up">Sudah Follow Up</option>
                        </select>
                      </div>
                    </div>

                    {/* Informasi Kontak & Catatan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                        <a href={`mailto:${req.email}`} className="hover:text-gray-500 dark:text-gray-400 underline truncate">{req.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                        <span>{req.phone}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                        <strong className="text-gray-900 dark:text-white font-bold block mb-0.5">Catatan Klien:</strong>
                        {req.notes}
                      </div>
                    )}

                    {/* Tombol Aksi */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/60">
                      <div className="flex items-center gap-2">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Hubungi via WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleResend(req.id)}
                          disabled={isPending}
                          className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Ulang Compro + PDF</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Permintaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATE EMAIL OTOMATIS & KELOLA LAMPIRAN PDF */}
      {activeTab === 'template' && (
        <div className="space-y-6">
          {/* CARD 1: KELOLA BERKAS LAMPIRAN PDF LANGSUNG */}
          <div className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                  Berkas PDF Terlampir Langsung (Direct Attachment)
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email ke calon klien <strong>secara otomatis menyertakan berkas PDF ini sebagai lampiran langsung (attachment)</strong>. Calon klien tidak perlu mengklik tautan eksternal untuk mengunduh.
              </p>
            </div>

            {/* Status Berkas PDF Saat Ini */}
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#090A0F] dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      Company-Profile-PT-Empat-Sinergi-Utama.pdf
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Terpasang
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ukuran: <strong className="text-gray-800 dark:text-gray-200">{currentPdfInfo.sizeKb} KB</strong> · Lokasi internal: <code className="font-mono text-black dark:text-white dark:text-gray-500 dark:text-gray-400">/compro.pdf</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/compro.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>Lihat PDF</span>
                </a>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePdfUpload}
                  accept=".pdf,application/pdf"
                  className="hidden"
                  id="pdf-upload-input"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Mengunggah...' : 'Ganti Berkas PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD: STATUS & PENGUJIAN SERVER EMAIL (SMTP / MAILSPACE) */}
          <div className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Server Email SMTP (Mailspace / Domain Korporat)
                  </h2>
                </div>
                {smtpStatus?.configured ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Status: SMTP Aktif & Terhubung
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Status: Mode Simulasi Dev (Belum Diatur di .env)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistem menggunakan protokol SMTP standar (Nodemailer). Kompatibel 100% dengan <strong>Mailspace</strong>, cPanel Webmail, Google Workspace, Brevo, dan domain perusahaan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detail Konfigurasi Aktif */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Parameter Koneksi SMTP Aktif</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-500">SMTP Host:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{smtpStatus?.host || '(belum diisi di .env)'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-500">Port & Enkripsi:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {smtpStatus?.port || 587} ({smtpStatus?.secure ? 'SSL / 465' : 'TLS / STARTTLS'})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800/60">
                    <span className="text-gray-500">Akun Pengirim (User):</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{smtpStatus?.userMasked || '(belum diisi)'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500">Label Pengirim (From):</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{smtpStatus?.from || 'Default Sistem'}</span>
                  </div>
                </div>
              </div>

              {/* Form Uji Coba Pengiriman */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#090A0F] dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white dark:text-gray-500 dark:text-gray-400">Uji Coba Pengiriman Email</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Kirim email uji coba ke alamat email Anda untuk memastikan server Mailspace dapat mengirim pesan dan lampiran tanpa kendala.
                  </p>
                </div>

                <form onSubmit={handleTestSmtp} className="space-y-2.5">
                  <input
                    type="email"
                    placeholder="Masukkan email Anda (mis. nama@perusahaan.com)..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-blue-500 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isTestingSmtp}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingSmtp ? 'Menguji Koneksi...' : 'Uji Coba Kirim Email'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* CARD 2: PENGATURAN TEKS TEMPLATE EMAIL */}
          <form onSubmit={handleSaveTemplate} className="bg-white dark:bg-[#10131C] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-gray-200 dark:border-gray-800 pb-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>Pengaturan Teks & Narasi Email</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sesuaikan teks surat yang dikirimkan. Gunakan tag dinamis <code className="text-gray-500 dark:text-gray-400 font-mono">&#123;name&#125;</code> untuk nama klien dan <code className="text-gray-500 dark:text-gray-400 font-mono">&#123;company&#125;</code> untuk nama perusahaannya.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Subjek Email *
                </label>
                <input
                  type="text"
                  value={templateData.subject}
                  onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                  required
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Judul Heading di Dalam Surat *
                </label>
                <input
                  type="text"
                  value={templateData.heading || ''}
                  onChange={(e) => setTemplateData({ ...templateData, heading: e.target.value })}
                  required
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Teks Narasi / Pengantar Surat Email *
                </label>
                <textarea
                  rows={6}
                  value={templateData.bodyIntro || templateData.body || ''}
                  onChange={(e) => setTemplateData({ ...templateData, bodyIntro: e.target.value, body: e.target.value })}
                  required
                  placeholder="Tuliskan isi surat pengantar..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 font-medium resize-none leading-relaxed"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Teks Footer Email
                </label>
                <input
                  type="text"
                  value={templateData.footerText || ''}
                  onChange={(e) => setTemplateData({ ...templateData, footerText: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Template Email</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
