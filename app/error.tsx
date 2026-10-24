'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Catat error ke console untuk kemudahan debugging developer
    console.error('Next.js Page Error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-6 bg-[#F8F7F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#0D1017] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
            Terjadi Kendala Sistem
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Halaman Tidak Dapat Dimuat
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Mohon maaf, sistem mendeteksi kendala saat memproses permintaan Anda. Silakan coba muat ulang halaman atau kembali ke beranda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
