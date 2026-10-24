// app/loading.tsx
export default function RootLoading() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[#F8F7F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated Brand Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
          <div className="w-4 h-4 rounded-full bg-amber-500/80 animate-ping"></div>
        </div>

        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-gray-800 dark:text-gray-200">
            PT. Empat Sinergi Utama
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Memuat konten...
          </p>
        </div>
      </div>
    </div>
  )
}
