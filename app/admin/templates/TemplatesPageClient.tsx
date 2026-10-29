// app/admin/templates/TemplatesPageClient.tsx
'use client'

import { useState, useTransition, useMemo, useRef } from 'react'
import { 
  MessageSquare, 
  Mail, 
  Save, 
  RotateCcw, 
  FileDown, 
  Check, 
  UserCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Copy 
} from 'lucide-react'
import type { 
  FooterInquiryTemplates, 
  ComproEmailTemplate, 
  CareerReplyTemplate 
} from '@/lib/templatesConstants'
import { 
  defaultInquiryTemplates, 
  defaultComproEmailTemplate 
} from '@/lib/templatesConstants'
import { 
  updateTemplatesAction,
  createCareerTemplateAction,
  updateCareerTemplateAction,
  deleteCareerTemplateAction
} from './actions'

interface ServiceOption {
  id: string
  title: string
}

interface TemplatesPageClientProps {
  initialInquiry: FooterInquiryTemplates
  initialCompro: ComproEmailTemplate
  careerTemplates: CareerReplyTemplate[]
  servicesList: ServiceOption[]
  companyName: string
  initialTab?: 'inquiry' | 'compro' | 'career'
}

const CAREER_TAGS = [
  { tag: '{name}', label: 'Nama Pelamar' },
  { tag: '{job_title}', label: 'Posisi Lowongan' },
  { tag: '{ref_code}', label: 'No. Referensi' },
  { tag: '{company}', label: 'Nama Perusahaan' },
  { tag: '{phone}', label: 'No. HP/WA' },
  { tag: '{email}', label: 'Email Pelamar' },
]

export default function TemplatesPageClient({
  initialInquiry,
  initialCompro,
  careerTemplates,
  companyName = 'PT. EMPAT SINERGI UTAMA',
  initialTab = 'inquiry',
}: TemplatesPageClientProps) {
  const [activeTab, setActiveTab] = useState<'inquiry' | 'compro' | 'career'>(initialTab)
  
  // =========================================================================
  // STATE: TAB 1 (KONSULTASI LAYANAN & UMUM)
  // =========================================================================
  const [waMessage, setWaMessage] = useState<string>(initialInquiry.waMessage || defaultInquiryTemplates.waMessage || '')
  const [emailSubject, setEmailSubject] = useState<string>(initialInquiry.emailSubject || defaultInquiryTemplates.emailSubject || '')
  const [emailBody, setEmailBody] = useState<string>(initialInquiry.emailBody || defaultInquiryTemplates.emailBody || '')

  // =========================================================================
  // STATE: TAB 2 (BALASAN COMPRO PDF)
  // =========================================================================
  const [comproSubject, setComproSubject] = useState<string>(initialCompro.subject || defaultComproEmailTemplate.subject || '')
  const [comproSenderName, setComproSenderName] = useState<string>(initialCompro.senderName || defaultComproEmailTemplate.senderName || '')
  const [comproHeading, setComproHeading] = useState<string>(initialCompro.heading || defaultComproEmailTemplate.heading || '')
  const [comproBody, setComproBody] = useState<string>(initialCompro.body || defaultComproEmailTemplate.body || '')
  const [comproFooterText, setComproFooterText] = useState<string>(initialCompro.footerText || defaultComproEmailTemplate.footerText || '')

  // Refs untuk Textarea
  const waTextareaRef = useRef<HTMLTextAreaElement>(null)
  const emailBodyRef = useRef<HTMLTextAreaElement>(null)
  const comproBodyRef = useRef<HTMLTextAreaElement>(null)
  const careerModalBodyRef = useRef<HTMLTextAreaElement>(null)

  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Template pesan berhasil disimpan.')

  // =========================================================================
  // STATE: TAB 3 (BALASAN PELAMAR KARIR)
  // =========================================================================
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false)
  const [editingCareerTpl, setEditingCareerTpl] = useState<CareerReplyTemplate | null>(null)
  const [careerName, setCareerName] = useState('')
  const [careerChannel, setCareerChannel] = useState<'wa' | 'email' | 'both'>('both')
  const [careerSubject, setCareerSubject] = useState('')
  const [careerBody, setCareerBody] = useState('')
  const [careerErrorMsg, setCareerErrorMsg] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Baseline dirty state Tab 1 & Tab 2
  const [savedBaseline, setSavedBaseline] = useState({
    waMessage: initialInquiry.waMessage || defaultInquiryTemplates.waMessage || '',
    emailSubject: initialInquiry.emailSubject || defaultInquiryTemplates.emailSubject || '',
    emailBody: initialInquiry.emailBody || defaultInquiryTemplates.emailBody || '',
    comproSubject: initialCompro.subject || defaultComproEmailTemplate.subject || '',
    comproSenderName: initialCompro.senderName || defaultComproEmailTemplate.senderName || '',
    comproHeading: initialCompro.heading || defaultComproEmailTemplate.heading || '',
    comproBody: initialCompro.body || defaultComproEmailTemplate.body || '',
    comproFooterText: initialCompro.footerText || defaultComproEmailTemplate.footerText || '',
  })

  const isDirty = useMemo(() => {
    return (
      waMessage !== savedBaseline.waMessage ||
      emailSubject !== savedBaseline.emailSubject ||
      emailBody !== savedBaseline.emailBody ||
      comproSubject !== savedBaseline.comproSubject ||
      comproSenderName !== savedBaseline.comproSenderName ||
      comproHeading !== savedBaseline.comproHeading ||
      comproBody !== savedBaseline.comproBody ||
      comproFooterText !== savedBaseline.comproFooterText
    )
  }, [
    waMessage, emailSubject, emailBody,
    comproSubject, comproSenderName, comproHeading, comproBody, comproFooterText,
    savedBaseline
  ])

  // Helper untuk menyisipkan variabel di kursor
  const insertVariable = (ref: React.RefObject<HTMLTextAreaElement | null>, tag: string, setter: (val: string) => void, currentVal: string) => {
    const el = ref.current
    if (!el) {
      setter(currentVal + tag)
      return
    }
    const start = el.selectionStart || currentVal.length
    const end = el.selectionEnd || currentVal.length
    const nextVal = currentVal.substring(0, start) + tag + currentVal.substring(end)
    setter(nextVal)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + tag.length, start + tag.length)
    }, 50)
  }

  // Reset Tab 1
  const handleResetInquiry = () => {
    if (confirm('Kembalikan template konsultasi WhatsApp & Email ke draf standar?')) {
      setWaMessage(defaultInquiryTemplates.waMessage || '')
      setEmailSubject(defaultInquiryTemplates.emailSubject || '')
      setEmailBody(defaultInquiryTemplates.emailBody || '')
    }
  }

  // Reset Tab 2
  const handleResetCompro = () => {
    if (confirm('Kembalikan template email Company Profile ke draf standar?')) {
      setComproSubject(defaultComproEmailTemplate.subject || '')
      setComproSenderName(defaultComproEmailTemplate.senderName || '')
      setComproHeading(defaultComproEmailTemplate.heading || '')
      setComproBody(defaultComproEmailTemplate.body || '')
      setComproFooterText(defaultComproEmailTemplate.footerText || '')
    }
  }

  // Simpan Tab 1 & Tab 2
  const handleSubmitMainTemplates = (formData: FormData) => {
    startTransition(async () => {
      await updateTemplatesAction(formData)
      setSavedBaseline({
        waMessage,
        emailSubject,
        emailBody,
        comproSubject,
        comproSenderName,
        comproHeading,
        comproBody,
        comproFooterText,
      })
      setToastMessage('Template pesan berhasil disimpan.')
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    })
  }

  // Buka Modal Tambah Karir
  const handleOpenNewCareerModal = () => {
    setEditingCareerTpl(null)
    setCareerName('')
    setCareerChannel('both')
    setCareerSubject('Panggilan Wawancara Kerja - {job_title} ({company})')
    setCareerBody('Halo {name},\n\nTerima kasih telah melamar posisi {job_title} di {company}. Kami mengundang Anda untuk mengikuti sesi wawancara kerja (Ref: {ref_code}).\n\nMohon konfirmasi kehadiran Anda dengan membalas pesan ini.\n\nSalam hangat,\nTim HR {company}')
    setCareerErrorMsg('')
    setIsCareerModalOpen(true)
  }

  // Buka Modal Edit Karir
  const handleOpenEditCareerModal = (tpl: CareerReplyTemplate) => {
    setEditingCareerTpl(tpl)
    setCareerName(tpl.name)
    setCareerChannel(tpl.channel)
    setCareerSubject(tpl.subject || '')
    setCareerBody(tpl.body)
    setCareerErrorMsg('')
    setIsCareerModalOpen(true)
  }

  // Simpan / Update Template Karir
  const handleSaveCareerTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCareerErrorMsg('')

    if (!careerName.trim()) {
      setCareerErrorMsg('Nama template balasan wajib diisi.')
      return
    }
    if (!careerBody.trim()) {
      setCareerErrorMsg('Isi draft pesan wajib diisi.')
      return
    }
    if (careerChannel !== 'wa' && !careerSubject.trim()) {
      setCareerErrorMsg('Subjek email wajib diisi untuk template email.')
      return
    }

    const formData = new FormData()
    if (editingCareerTpl) {
      formData.set('id', editingCareerTpl.id)
    }
    formData.set('name', careerName.trim())
    formData.set('channel', careerChannel)
    formData.set('subject', careerSubject.trim())
    formData.set('body', careerBody.trim())

    startTransition(async () => {
      try {
        if (editingCareerTpl) {
          await updateCareerTemplateAction(formData)
          setToastMessage(`Template "${careerName}" berhasil diperbarui.`)
        } else {
          await createCareerTemplateAction(formData)
          setToastMessage(`Template "${careerName}" berhasil ditambahkan.`)
        }
        setIsCareerModalOpen(false)
        setShowSuccessToast(true)
        setTimeout(() => setShowSuccessToast(false), 3000)
      } catch (err: unknown) {
        setCareerErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan template karir.')
      }
    })
  }

  // Hapus Template Karir
  const handleDeleteCareerTemplate = (tpl: CareerReplyTemplate) => {
    if (!confirm(`Hapus template balasan karir "${tpl.name}"?`)) return

    const formData = new FormData()
    formData.set('id', tpl.id)

    startTransition(async () => {
      await deleteCareerTemplateAction(formData)
      setToastMessage(`Template "${tpl.name}" telah dihapus.`)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    })
  }

  const handleCopyBody = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="relative pb-32 max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* TOAST SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-gray-900 text-white border border-gray-700 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <Check className="w-5 h-5 text-gray-300 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Tersimpan</h4>
            <p className="text-[11px] text-gray-300 font-medium">{toastMessage}</p>
          </div>
        </div>
      </div>

      {/* HEADER UTAMA (STICKY) */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9] dark:bg-[#0C0D12] !-mt-6 md:!-mt-8 pt-6 md:pt-8 pb-5 border-b border-gray-200 dark:border-gray-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Template Pesan
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola template pesan otomatis WhatsApp dan Email untuk konsultasi layanan, company profile, dan balasan pelamar kerja.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/60 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('inquiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inquiry'
                ? 'bg-white dark:bg-[#10131C] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Konsultasi Layanan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compro'
                ? 'bg-white dark:bg-[#10131C] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Balasan Compro PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'career'
                ? 'bg-white dark:bg-[#10131C] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Balasan Pelamar Karir</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1 & TAB 2: FORM PENGATURAN TEMPLATE */}
      {/* ========================================================================= */}
      {(activeTab === 'inquiry' || activeTab === 'compro') && (
        <form action={handleSubmitMainTemplates} className="space-y-6">
          
          {/* TAB 1: KONSULTASI LAYANAN */}
          {activeTab === 'inquiry' && (
            <div className="space-y-6">
              
              {/* KARTU TEMPLATE WHATSAPP */}
              <div className="bg-white dark:bg-[#10131C] p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">Template Chat WhatsApp Konsultasi</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Pesan otomatis yang masuk ke WhatsApp saat pengunjung mengklik tombol WhatsApp di halaman detail layanan.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Isi Pesan WhatsApp:</span>
                    <span className="text-gray-400 text-[11px] font-normal">Klik tag untuk menyisipkan variabel:</span>
                  </div>

                  {/* Tombol Sisipkan Tag */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertVariable(waTextareaRef, '{layanan}', setWaMessage, waMessage)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{layanan}'}</code>
                      <span className="text-[10px] text-gray-400 font-normal">(Nama Layanan)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(waTextareaRef, '{perusahaan}', setWaMessage, waMessage)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{perusahaan}'}</code>
                      <span className="text-[10px] text-gray-400 font-normal">(Nama PT)</span>
                    </button>
                  </div>

                  <textarea
                    ref={waTextareaRef}
                    name="waMessage"
                    rows={4}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Tulis draf pesan WhatsApp..."
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium transition-colors"
                  />
                  <p className="text-[11px] text-gray-500">
                    Gunakan tanda bintang <code className="font-bold">*teks*</code> untuk teks tebal di WhatsApp. Tag <code className="font-semibold">{'{layanan}'}</code> otomatis diganti dengan nama layanan yang sedang dibuka klien.
                  </p>
                </div>
              </div>

              {/* KARTU TEMPLATE EMAIL */}
              <div className="bg-white dark:bg-[#10131C] p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">Template Email Permohonan Konsultasi</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Draf email yang otomatis terbuka saat pengunjung mengklik tombol Kirim Email di halaman layanan.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Subjek Email:
                  </label>
                  <input
                    type="text"
                    name="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Contoh: Konsultasi Layanan: {layanan} - [Nama Perusahaan]"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium transition-colors"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Draft Isi Pesan Email:</span>
                    <span className="text-gray-400 text-[11px] font-normal">Klik tag untuk menyisipkan variabel:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertVariable(emailBodyRef, '{layanan}', setEmailBody, emailBody)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{layanan}'}</code>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(emailBodyRef, '{perusahaan}', setEmailBody, emailBody)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{perusahaan}'}</code>
                    </button>
                  </div>

                  <textarea
                    ref={emailBodyRef}
                    name="emailBody"
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Tulis draf isi email..."
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white text-xs leading-relaxed font-mono focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetInquiry}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kembalikan ke Default</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BALASAN COMPRO PDF */}
          {activeTab === 'compro' && (
            <div className="space-y-6">
              
              <div className="bg-white dark:bg-[#10131C] p-6 sm:p-7 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">Email Balasan Pengiriman Company Profile</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Email yang otomatis dikirim ke pemohon saat form unduh Company Profile diajukan di website.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Nama Pengirim Email:
                    </label>
                    <input
                      type="text"
                      name="comproSenderName"
                      value={comproSenderName}
                      onChange={(e) => setComproSenderName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Judul Heading Email:
                    </label>
                    <input
                      type="text"
                      name="comproHeading"
                      value={comproHeading}
                      onChange={(e) => setComproHeading(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Subjek Email Compro:
                  </label>
                  <input
                    type="text"
                    name="comproSubject"
                    value={comproSubject}
                    onChange={(e) => setComproSubject(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>Draft Isi Pesan Email:</span>
                    <span className="text-gray-400 text-[11px] font-normal">Klik tag untuk menyisipkan variabel:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertVariable(comproBodyRef, '{name}', setComproBody, comproBody)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{name}'}</code>
                      <span className="text-[10px] text-gray-400 font-normal">(Nama Pemohon)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(comproBodyRef, '{company}', setComproBody, comproBody)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>+</span>
                      <code>{'{company}'}</code>
                      <span className="text-[10px] text-gray-400 font-normal">(Perusahaan Pemohon)</span>
                    </button>
                  </div>

                  <textarea
                    ref={comproBodyRef}
                    name="comproBody"
                    rows={8}
                    value={comproBody}
                    onChange={(e) => setComproBody(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white text-xs leading-relaxed font-mono focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Catatan Kaki Email (Footer Note):
                  </label>
                  <input
                    type="text"
                    name="comproFooterText"
                    value={comproFooterText}
                    onChange={(e) => setComproFooterText(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetCompro}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kembalikan ke Default</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TOMBOL SIMPAN MELAYANG */}
          <div 
            style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }}
            className="fixed right-4 sm:right-6 z-45"
          >
            <button 
              type="submit" 
              disabled={!isDirty || isPending}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all duration-300 border ${
                !isDirty || isPending
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 border-transparent cursor-pointer'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Menyimpan...' : isDirty ? 'Simpan ke Draft' : 'Sudah Tersimpan'}</span>
            </button>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TEMPLATE BALASAN PELAMAR KARIR */}
      {/* ========================================================================= */}
      {activeTab === 'career' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#10131C] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">Daftar Template Balasan Pelamar Kerja</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Template standar untuk merespons pelamar via WhatsApp atau Email secara langsung.</p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewCareerModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Template</span>
            </button>
          </div>

          {/* DAFTAR CARD TEMPLATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerTemplates.map((tpl) => {
              const channelLabel = tpl.channel === 'both' 
                ? 'WhatsApp & Email' 
                : tpl.channel === 'wa' 
                ? 'WhatsApp Saja' 
                : 'Email Saja'

              return (
                <div 
                  key={tpl.id}
                  className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        {channelLabel}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyBody(tpl.id, tpl.body)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Salin isi template"
                      >
                        {copiedId === tpl.id ? (
                          <Check className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {tpl.name}
                      </h4>
                      {tpl.subject && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          Subjek: {tpl.subject}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#090A0F] border border-gray-100 dark:border-gray-800/80 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-line">
                      {tpl.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCareerModal(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCareerTemplate(tpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {careerTemplates.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#10131C] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
              <UserCheck className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Belum Ada Template Balasan Karir</h4>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">Klik tombol &quot;Tambah Template&quot; untuk membuat draf balasan pelamar pertama Anda.</p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DIALOG: TAMBAH / EDIT TEMPLATE KARIR (TANPA PREVIEW) */}
      {/* ========================================================================= */}
      {isCareerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#10131C] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  {editingCareerTpl ? 'Edit Template Balasan' : 'Tambah Template Balasan'}
                </h3>
                <p className="text-[11px] text-gray-500">Atur pesan balasan otomatis untuk pelamar kerja.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCareerModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCareerTemplate} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {careerErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {careerErrorMsg}
                </div>
              )}

              {/* Nama Template */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Nama Template:
                </label>
                <input
                  type="text"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  placeholder="Contoh: Panggilan Interview / Konfirmasi Berkas"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  required
                />
              </div>

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Target Saluran:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCareerChannel('both')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      careerChannel === 'both'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    WA & Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setCareerChannel('wa')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      careerChannel === 'wa'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    WhatsApp Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setCareerChannel('email')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      careerChannel === 'email'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Email Saja
                  </button>
                </div>
              </div>

              {/* Subjek Email */}
              {careerChannel !== 'wa' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Subjek Email:
                  </label>
                  <input
                    type="text"
                    value={careerSubject}
                    onChange={(e) => setCareerSubject(e.target.value)}
                    placeholder="Contoh: Panggilan Wawancara Kerja - {job_title} ({company})"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  />
                </div>
              )}

              {/* Isi Draft Pesan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Isi Draft Pesan:</span>
                  <span className="text-[10px] text-gray-400 font-normal">Klik tag untuk menyisipkan variabel:</span>
                </div>

                {/* Tag Insert Helpers */}
                <div className="flex flex-wrap gap-1.5">
                  {CAREER_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => insertVariable(careerModalBodyRef, t.tag, setCareerBody, careerBody)}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      + <code>{t.tag}</code>
                    </button>
                  ))}
                </div>

                <textarea
                  ref={careerModalBodyRef}
                  rows={8}
                  value={careerBody}
                  onChange={(e) => setCareerBody(e.target.value)}
                  placeholder="Tulis draft balasan untuk pelamar..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-mono leading-relaxed text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCareerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : editingCareerTpl ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
