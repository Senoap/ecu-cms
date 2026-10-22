// components/ComproRequestModal.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, FileDown, CheckCircle2, Send, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { submitComproRequest } from '@/app/actions/compro'

interface ComproRequestModalProps {
  isOpen: boolean
  onClose: () => void
  siteName?: string
}

export default function ComproRequestModal({ isOpen, onClose, siteName = 'PT Empat Sinergi Utama' }: ComproRequestModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (formData: FormData) => {
    setErrorMessage('')
    startTransition(async () => {
      const res = await submitComproRequest(formData)
      if (res.success) {
        setIsSuccess(true)
      } else {
        setErrorMessage(res.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#10131C] text-gray-900 dark:text-white w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between relative z-10 border-b border-gray-100 dark:border-gray-800/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
              <FileDown className="w-3.5 h-3.5" />
              <span>Official Corporate Document</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Minta Company Profile (PDF)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Dokumen resmi {siteName} akan langsung dilampirkan sebagai berkas PDF ke email Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-gray-900 dark:text-white">Permintaan Berhasil Dikirim!</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium max-w-sm mx-auto">
                Terima kasih atas minat Anda. Berkas Company Profile PT Empat Sinergi Utama dalam format PDF telah kami jadwalkan dan kirimkan ke alamat email Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false)
                onClose()
              }}
              className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-transform hover:scale-105 cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4 relative z-10">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Nama Lengkap *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Bpk. Ahmad Wahyudi"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Nama Perusahaan / Instansi *</span>
              </label>
              <input
                type="text"
                name="company"
                required
                placeholder="Contoh: PT Manufaktur Perkasa Nusantara"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Email Bisnis *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ahmad@perusahaan.com"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>No. WhatsApp / HP *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="08123456789"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Kebutuhan Layanan / Catatan Khusus (Opsional)</span>
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Contoh: Kebutuhan alih daya 50 personel security dan cleaning service..."
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium resize-none transition-colors"
              ></textarea>
            </div>

            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              * Data kontak Anda aman dan hanya digunakan untuk keperluan pengiriman dokumen resmi serta penawaran kerjasama ketenagakerjaan.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sedang Mengirim Permintaan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Permintaan & Terima PDF</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
