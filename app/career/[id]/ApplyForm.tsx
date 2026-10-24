// app/career/[id]/ApplyForm.tsx
'use client'
import { useActionState, useEffect } from 'react'
import { submitApplication, type ApplyState } from './actions'
import { CheckCircle2, UploadCloud, Send, AlertCircle, Loader2 } from 'lucide-react'

const initial: ApplyState = { ok: false, message: '' }

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-white dark:bg-gray-800/90 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium'

export default function ApplyForm({ careerId }: { careerId: string; locale?: string }) {
  const [state, action, pending] = useActionState(submitApplication, initial)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!turnstileSiteKey) return
    const scriptId = 'cf-turnstile-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [turnstileSiteKey])

  if (state.ok && state.ref) {
    return (
      <div
        id="apply-success"
        className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-center animate-fadeIn"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide text-sm">
          Lamaran Diterima
        </h4>
        <div className="inline-block px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
          <p className="text-xs text-gray-900 dark:text-gray-100 font-medium">
            Nomor referensi:{' '}
            <b data-testid="ref-code" className="font-mono text-emerald-800 dark:text-emerald-300">
              {state.ref}
            </b>
          </p>
        </div>
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
          {state.emailSent
            ? 'Email konfirmasi telah dikirim kepada Anda.'
            : 'Tim HR kami akan segera meninjau lamaran Anda.'}
        </p>
      </div>
    )
  }

  return (
    <form id="apply-form" action={action} className="space-y-3">
      <input type="hidden" name="careerId" value={careerId} />
      {/* Honeypot: disembunyikan dari pengguna */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <input
        id="apply-name"
        name="name"
        autoComplete="name"
        required
        placeholder="Nama lengkap"
        className={inputCls}
      />
      <input
        id="apply-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="No. HP / WhatsApp"
        className={inputCls}
      />
      <input
        id="apply-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="Email"
        className={inputCls}
      />
      <input
        id="apply-education"
        name="education"
        placeholder="Pendidikan terakhir (opsional)"
        className={inputCls}
      />
      <textarea
        id="apply-note"
        name="coverNote"
        rows={3}
        placeholder="Catatan singkat (opsional)"
        className={inputCls}
      />

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>CV (PDF/DOC/DOCX, max 5MB) *</span>
        </span>
        <input
          id="apply-cv"
          name="cv"
          type="file"
          required
          accept=".pdf,.doc,.docx"
          className="block w-full text-xs text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-amber-500/15 file:text-amber-800 dark:file:text-amber-300 file:font-bold file:cursor-pointer hover:file:bg-amber-500/25 file:transition-colors cursor-pointer"
        />
      </label>

      <label className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300 leading-snug cursor-pointer select-none">
        <input
          id="apply-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-[11px] sm:text-xs">
          Saya menyetujui data pribadi saya diproses untuk seleksi rekrutmen sesuai{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-600 dark:text-amber-400">
            Kebijakan Privasi
          </a>.
        </span>
      </label>

      {state.message && !state.ok && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span id="apply-error">{state.message}</span>
        </div>
      )}

      {/* Cloudflare Turnstile Widget (Jika site key dikonfigurasi) */}
      {turnstileSiteKey && (
        <div className="flex justify-center my-2">
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" />
        </div>
      )}

      <button
        id="apply-submit"
        type="submit"
        disabled={pending}
        className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black text-white text-center bg-amber-600 hover:bg-amber-500 disabled:opacity-60 shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim Lamaran…</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Kirim Lamaran</span>
          </>
        )}
      </button>
    </form>
  )
}

