// app/admin/career-templates/CareerTemplatesClient.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Copy, 
  Code2
} from 'lucide-react'
import { createCareerTemplateAction, updateCareerTemplateAction, deleteCareerTemplateAction } from './actions'
import type { CareerReplyTemplate } from '@/lib/db'

interface CareerTemplatesClientProps {
  templates: CareerReplyTemplate[]
}

const PLACEHOLDERS = [
  { tag: '{name}', desc: 'Nama lengkap kandidat pelamar' },
  { tag: '{job_title}', desc: 'Posisi lowongan yang dilamar' },
  { tag: '{ref_code}', desc: 'Kode referensi lamaran (cth: 4SU-2610...)' },
  { tag: '{company}', desc: 'Nama resmi perusahaan' },
  { tag: '{phone}', desc: 'Nomor WhatsApp / HP kandidat' },
  { tag: '{email}', desc: 'Alamat email kandidat' },
]

export default function CareerTemplatesClient({ templates }: CareerTemplatesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CareerReplyTemplate | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copiedTag, setCopiedTag] = useState('')

  // Form states
  const [formName, setFormName] = useState('')
  const [formChannel, setFormChannel] = useState<'wa' | 'email' | 'both'>('both')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')

  const bodyInputRef = useRef<HTMLTextAreaElement>(null)

  const openAddModal = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormChannel('both')
    setFormSubject('Panggilan Wawancara Kerja - {job_title} ({company})')
    setFormBody('Halo {name},\n\nTerima kasih telah melamar posisi {job_title} di {company}. Kami tertarik dengan profil Anda dan mengundang Anda untuk mengikuti sesi wawancara kerja (Ref: {ref_code}).\n\nMohon konfirmasi kesediaan Anda membalas pesan ini.\n\nSalam hangat,\nTim HR {company}')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (tpl: CareerReplyTemplate) => {
    setEditingTemplate(tpl)
    setFormName(tpl.name)
    setFormChannel(tpl.channel)
    setFormSubject(tpl.subject || '')
    setFormBody(tpl.body)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const insertTag = (tag: string) => {
    if (!bodyInputRef.current) {
      setFormBody((prev) => prev + tag)
      return
    }
    const textarea = bodyInputRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formBody
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    setFormBody(before + tag + after)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(''), 2000)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const formData = new FormData()
    if (editingTemplate) {
      formData.set('id', editingTemplate.id)
    }
    formData.set('name', formName)
    formData.set('channel', formChannel)
    formData.set('subject', formSubject)
    formData.set('body', formBody)

    startTransition(async () => {
      try {
        if (editingTemplate) {
          await updateCareerTemplateAction(formData)
          setSuccessMsg(`Template "${formName}" berhasil diperbarui.`)
        } else {
          await createCareerTemplateAction(formData)
          setSuccessMsg(`Template "${formName}" berhasil dibuat.`)
        }
        setIsModalOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
        setErrorMsg(msg)
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus template "${name}"?`)) return
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteCareerTemplateAction(formData)
        setSuccessMsg(`Template "${name}" berhasil dihapus.`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghapus template.'
        setErrorMsg(msg)
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Template Balasan Karir
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kelola draf pesan otomatis untuk membalas pelamar lowongan kerja secara instan via WhatsApp maupun Email.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Template Baru</span>
        </button>
      </div>

      {/* FEEDBACK ALERTS */}
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

      {/* PANDUAN VARIABEL OTOMATIS */}
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Variabel Dinamis yang Didukung
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Variabel di bawah ini akan diganti secara otomatis dengan data pelamar saat Anda membalas dari menu <span className="font-bold text-gray-700 dark:text-gray-300">Lamaran Masuk</span>:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.tag}
              type="button"
              onClick={() => handleCopyTag(p.tag)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-left hover:border-amber-500 transition-colors cursor-pointer group"
              title="Klik untuk menyalin tag"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                  {p.tag}
                </code>
                {copiedTag === p.tag ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* DAFTAR TEMPLATE */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Daftar Template Aktif ({templates.length})
        </h2>

        <div className="grid gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3.5 hover:border-amber-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-base text-gray-900 dark:text-white">{tpl.name}</h3>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    {tpl.channel === 'wa' && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Saluran: WhatsApp
                      </span>
                    )}
                    {tpl.channel === 'email' && (
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        Saluran: Email
                      </span>
                    )}
                    {tpl.channel === 'both' && (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Saluran: WhatsApp & Email
                      </span>
                    )}
                  </div>
                  {tpl.subject && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Subjek:</span> {tpl.subject}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => openEditModal(tpl)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-amber-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                    title="Hapus Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BODY PREVIEW */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-950/80 border border-gray-100 dark:border-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {tpl.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT TEMPLATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {editingTemplate ? 'Edit Template Balasan' : 'Buat Template Balasan Baru'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Gunakan variabel placeholder agar pesan otomatis terisi sesuai kandidat.
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
              
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Undangan Wawancara Offline"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Saluran Balasan
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormChannel('both')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      formChannel === 'both'
                        ? 'bg-purple-500 text-white border-purple-600 shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    WA & Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChannel('wa')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      formChannel === 'wa'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Hanya WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChannel('email')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      formChannel === 'email'
                        ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Hanya Email
                  </button>
                </div>
              </div>

              {/* SUBJEK EMAIL (JIKA DIBUTUHKAN) */}
              {formChannel !== 'wa' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Subjek Email
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Subjek email balasan..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              {/* ISI TEMPLATE PESAN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Isi Pesan Template
                  </label>
                  <span className="text-[10px] text-gray-400">Klik tag untuk menyisipkan ke teks</span>
                </div>

                {/* PILLS SISIPKAN VARIABEL */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => insertTag(p.tag)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      + {p.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={bodyInputRef}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  rows={8}
                  placeholder="Ketik isi pesan balasan..."
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm font-mono outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              {/* TOMBOL AKSI */}
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
                  {isPending ? 'Menyimpan...' : (editingTemplate ? 'Simpan Perubahan' : 'Buat Template')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
