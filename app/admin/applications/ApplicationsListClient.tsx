// app/admin/applications/ApplicationsListClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { 
  Phone, 
  Mail, 
  GraduationCap, 
  Download, 
  MessageSquare, 
  X, 
  Send, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileX
} from 'lucide-react'
import Link from 'next/link'
import type { Application } from '@/lib/applications'
import type { CareerReplyTemplate } from '@/lib/db'
import { updateApplicationStatus, deleteApplication, sendCandidateReplyAction } from './actions'

interface ApplicationsListClientProps {
  applications: Application[]
  templates: CareerReplyTemplate[]
  siteName: string
  statuses: string[]
  statusLabels: Record<string, string>
  statusColors: Record<string, string>
}

function cleanPhoneForWa(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  return cleaned
}

function interpolateText(text: string, app: Application, siteName: string): string {
  return text
    .replace(/\{name\}/g, app.name)
    .replace(/\{job_title\}/g, app.career_title)
    .replace(/\{ref_code\}/g, app.ref_code)
    .replace(/\{company\}/g, siteName)
    .replace(/\{phone\}/g, app.phone)
    .replace(/\{email\}/g, app.email)
}

export default function ApplicationsListClient({
  applications,
  templates,
  siteName,
  statuses,
  statusLabels,
  statusColors
}: ApplicationsListClientProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isPendingEmail, startEmailTransition] = useTransition()
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Point 12: Pagination Maksimal 10 List per Halaman
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10
  const totalPages = Math.ceil(applications.length / PAGE_SIZE) || 1
  const displayedApps = applications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const openReplyModal = (app: Application) => {
    setSelectedApp(app)
    setModalFeedback(null)

    // Pilih template default jika tersedia
    const defaultTpl = templates[0]
    if (defaultTpl) {
      setSelectedTemplateId(defaultTpl.id)
      setSubject(interpolateText(defaultTpl.subject || `Panggilan Seleksi - ${app.career_title}`, app, siteName))
      setBody(interpolateText(defaultTpl.body, app, siteName))
    } else {
      setSelectedTemplateId('')
      setSubject(`Pembaruan Status Lamaran: ${app.career_title} (${siteName})`)
      setBody(`Halo ${app.name},\n\nTerima kasih telah melamar posisi ${app.career_title} di ${siteName} (Ref: ${app.ref_code})...\n\nSalam hangat,\nTim HR ${siteName}`)
    }
  }

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId)
    if (!selectedApp) return

    const tpl = templates.find((t) => t.id === tplId)
    if (tpl) {
      setSubject(interpolateText(tpl.subject || `Panggilan Seleksi - ${selectedApp.career_title}`, selectedApp, siteName))
      setBody(interpolateText(tpl.body, selectedApp, siteName))
    }
  }

  const handleSendWhatsApp = () => {
    if (!selectedApp) return
    const waNumber = cleanPhoneForWa(selectedApp.phone)
    const encoded = encodeURIComponent(body)
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank')
  }

  const handleSendEmailDirect = () => {
    if (!selectedApp) return
    setModalFeedback(null)

    const formData = new FormData()
    formData.set('to', selectedApp.email)
    formData.set('candidateName', selectedApp.name)
    formData.set('subject', subject)
    formData.set('body', body)

    startEmailTransition(async () => {
      try {
        await sendCandidateReplyAction(formData)
        setModalFeedback({
          type: 'success',
          msg: `Email balasan berhasil dikirimkan ke ${selectedApp.email}.`
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mengirim email balasan.'
        setModalFeedback({ type: 'error', msg })
      }
    })
  }

  const mailtoUrl = selectedApp
    ? `mailto:${selectedApp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '#'

  return (
    <div className="space-y-4">
      {displayedApps.map((a) => (
        <div 
          key={a.id} 
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3 shadow-sm hover:border-gray-200 dark:border-gray-800 transition-all" 
          data-testid="application-row"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-black text-base text-gray-900 dark:text-white">{a.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {a.career_title} · <span className="font-mono text-black dark:text-white dark:text-gray-500 dark:text-gray-400 font-bold">{a.ref_code}</span> · {new Date(a.created_at).toLocaleString('id-ID')}
              </div>
            </div>
            <span className={`text-xs font-bold ${statusColors[a.status] || ''}`}>
              Status: {statusLabels[a.status] || a.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm pt-1">
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <a className="underline hover:text-gray-500 dark:text-gray-400 font-mono" href={`tel:${a.phone}`}>{a.phone}</a>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <a className="underline hover:text-gray-500 dark:text-gray-400 font-mono" href={`mailto:${a.email}`}>{a.email}</a>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              <span>{a.education || '-'}</span>
            </div>
          </div>
          {a.cover_note && <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-950/60 p-3 rounded-xl border border-gray-100 dark:border-gray-800">{a.cover_note}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            {/* UNDUH CV ATAU STATUS RETENSI 60 HARI (POINT 11) */}
            {a.cv_purged ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400" title="File CV fisik telah dihapus otomatis setelah 60 hari untuk efisiensi penyimpanan, data profil pelamar tetap aman.">
                <FileX className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>CV Dihapus Otomatis (Retensi 60 Hari)</span>
              </span>
            ) : (
              <a 
                href={`/cms/applications/cv/${a.id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-black dark:text-white dark:text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CV</span>
              </a>
            )}

            {/* BALAS KANDIDAT */}
            <button
              type="button"
              onClick={() => openReplyModal(a)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
              title="Balas kandidat via WhatsApp atau Email dengan template otomatis"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Balas Kandidat</span>
            </button>

            {/* UBAH STATUS */}
            <form action={updateApplicationStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={a.id} />
              <select 
                name="status" 
                defaultValue={a.status} 
                className="px-2.5 py-1.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusLabels[s] || s}</option>
                ))}
              </select>
              <button 
                type="submit" 
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 cursor-pointer shadow-sm hover:opacity-90"
              >
                Ubah
              </button>
            </form>

            {/* HAPUS LAMARAN */}
            <form action={deleteApplication} className="ml-auto">
              <input type="hidden" name="id" value={a.id} />
              <button 
                type="submit" 
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                Hapus
              </button>
            </form>
          </div>
        </div>
      ))}

      {/* POINT 12: PAGINATION JIKA LEBIH DARI 10 DATA */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mt-6">
          <div className="text-xs text-gray-500 font-medium">
            Menampilkan <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * PAGE_SIZE + 1}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * PAGE_SIZE, applications.length)}</span> dari <span className="font-bold text-gray-900 dark:text-white">{applications.length}</span> lamaran masuk
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white shadow-md shadow-gray-900/40'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* MODAL BALAS KANDIDAT (POINT 2) */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span>Balas Lamaran: {selectedApp.name}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Posisi: <span className="font-bold text-gray-700 dark:text-gray-300">{selectedApp.career_title}</span> · Ref: <span className="font-mono font-bold text-gray-500 dark:text-gray-400">{selectedApp.ref_code}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FEEDBACK STATUS */}
            {modalFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                modalFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}>
                {modalFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{modalFeedback.msg}</span>
              </div>
            )}

            {/* PILIH TEMPLATE BALASAN */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Gunakan Template Balasan
                </label>
                <Link
                  href="/cms/career-templates"
                  target="_blank"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Kelola Template</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 cursor-pointer"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.channel === 'wa' ? 'WhatsApp' : t.channel === 'email' ? 'Email' : 'WA & Email'})
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJEK EMAIL */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Subjek Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* ISI PESAN BALASAN (DAPAT DIEDIT SECARA FLEKSIBEL) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Isi Pesan Balasan (Preview & Kustomisasi)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm font-mono outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* ACTION BUTTONS: WHATSAPP ATAU EMAIL */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              
              {/* TOMBOL WHATSAPP */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                title={`Kirim via WhatsApp ke ${selectedApp.phone}`}
              >
                <Phone className="w-4 h-4" />
                <span>Balas via WhatsApp ➔</span>
              </button>

              <div className="flex items-center gap-2 justify-end">
                {/* FALLBACK MAILTO */}
                <a
                  href={mailtoUrl}
                  className="px-3.5 py-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-colors inline-flex items-center gap-1.5"
                  title="Buka di aplikasi email bawaan (Outlook, Gmail, Thunderbird)"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mail Client</span>
                </a>

                {/* KIRIM EMAIL LANGSUNG */}
                <button
                  type="button"
                  onClick={handleSendEmailDirect}
                  disabled={isPendingEmail}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-600 shadow-md shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
                  title={`Kirim email langsung dari server ke ${selectedApp.email}`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isPendingEmail ? 'Mengirim...' : 'Kirim Email'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
