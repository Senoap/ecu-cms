// app/global-error.tsx
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Fatal Root Layout Error:', error)
  }, [error])

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F8F7F4] text-gray-900 font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-black text-gray-900">
            Terjadi Kendala Sistem Utama
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Terjadi kesalahan saat memuat tata letak aplikasi. Silakan muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </body>
    </html>
  )
}
