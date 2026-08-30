// app/admin/login/page.tsx
'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from './actions'

export default function AdminLoginPage() {
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const router = useRouter()

  // Sinkronisasi tema gelap/terang CMS
  useEffect(() => {
    const savedTheme = localStorage.getItem('esu_cms_theme')
    const dark = savedTheme === 'dark' || savedTheme === null
    setIsDarkMode(dark)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginAdmin(formData)
      if (result.success) {
        localStorage.setItem('esu_admin_logged', 'true')
        router.push('/admin')
        router.refresh()
      } else {
        setErrorMsg(result.message || 'Terjadi kesalahan')
      }
    })
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-6 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#090A0F] text-gray-100' : 'bg-[#F4F6F9] text-gray-900'
    }`}>
      {/* Background Glow Aksen */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl bg-amber-500"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className={`p-8 md:p-10 rounded-3xl shadow-2xl border backdrop-blur-xl space-y-8 ${
          isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/95 border-gray-200'
        }`}>
          
          {/* Header Logo */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-amber-900/30">
              ESU
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">CMS Authentication</h1>
              <p className="text-xs text-amber-500 font-bold tracking-widest uppercase mt-1">Enterprise Control Panel</p>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                Admin Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Masukkan password admin..."
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-950/80 border-gray-800 text-white focus:border-amber-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600'
                }`}
                required
              />
              {errorMsg && (
                <p className="text-xs font-bold text-rose-500 mt-1.5 animate-bounce">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-900/40 transition-all duration-300 transform hover:-translate-y-0.5 uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isPending ? 'Memverifikasi...' : 'Masuk ke CMS ➔'}
            </button>
          </form>

          {/* Footer Card */}
          <div className="text-center pt-2 border-t border-gray-800/40">
            <a 
              href="/" 
              className="text-xs font-bold text-gray-400 hover:text-amber-500 transition-colors uppercase tracking-widest"
            >
              &larr; Kembali ke Website Utama
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}