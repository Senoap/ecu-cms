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
      const prevBodyOverflow = document.body.style.overflow
      const prevHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
      }
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="compro-modal-title"
        className="bg-white dark:bg-[#10131C] text-gray-900 dark:text-white w-full max-w-lg max-h-[min(92dvh,720px)] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-5 sm:p-8 relative flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between relative z-10 border-b border-gray-100 dark:border-gray-800/80 pb-4 shrink-0">
          <div className="space-y-1 pr-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
              <FileDown className="w-3.5 h-3.5" />
              <span>Official Corporate Document</span>
            </div>
            <h3 id="compro-modal-title" className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Minta Company Profile (PDF)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Dokumen resmi {siteName} akan langsung dilampirkan sebagai berkas PDF ke email Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-5 overflow-y-auto">
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
          <form action={handleSubmit} className="space-y-4 relative z-10 overflow-y-auto overscroll-contain pr-1 -mr-1 flex-1 pt-3">
            {/* Honeypot Bot Trap: Disembunyikan secara visual dari manusia */}
            <div 
              aria-hidden="true" 
              tabIndex={-1}
              className="opacity-0 absolute -left-[9999px] h-0 w-0 overflow-hidden pointer-events-none"
            >
              <label htmlFor="compro-hp-website">Website</label>
              <input
                id="compro-hp-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

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
                autoComplete="name"
                required
                placeholder="Contoh: Bpk. Ahmad Wahyudi"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base sm:text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
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
                autoComplete="organization"
                required
                placeholder="Contoh: PT Manufaktur Perkasa Nusantara"
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base sm:text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
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
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="ahmad@perusahaan.com"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base sm:text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
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
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="08123456789"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base sm:text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium transition-colors"
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
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-3 text-base sm:text-sm text-gray-900 dark:text-white focus:border-amber-500 font-medium resize-none transition-colors"
              ></textarea>
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                required
                className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-[11px] sm:text-xs">
                Saya menyetujui data kontak saya digunakan untuk pengiriman Company Profile dan penawaran resmi sesuai{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-600 dark:text-amber-400">
                  Kebijakan Privasi
                </a>.
              </span>
            </label>

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
