import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F7F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-2xl">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Halaman atau URL yang Anda tuju tidak tersedia atau tidak dikenali di alamat ini.
          </p>
        </div>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
