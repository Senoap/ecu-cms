// app/login/page.tsx
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  AlertCircle, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft 
} from 'lucide-react'
import { validatePasswordStrength } from '@/lib/password'
import { loginAdmin, changePasswordOnLoginAction, type LoginResult } from './actions'

interface ResetRequiredData {
  resetToken: string
  username: string
  name: string
  daysRemaining: number
  isExpired: boolean
  isWarning: boolean
  reason: 'must_reset' | 'expired' | 'warning_h7'
}

export default function AdminLoginPage() {
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const router = useRouter()

  // Handler navigasi ke website publik saat login diakses melalui subdomain admin
  const handleOpenMainSite = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined') {
      const { hostname, host, protocol } = window.location
      if (/^(admin|cms)\./i.test(hostname)) {
        e.preventDefault()
        const mainHost = host.replace(/^(admin|cms)\./i, '')
        window.location.href = `${protocol}//${mainHost}/`
      }
    }
  }

  // State mode reset password saat login (Point 4)
  const [resetData, setResetData] = useState<ResetRequiredData | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)

  // Sinkronisasi tema gelap/terang CMS
  useEffect(() => {
    const savedTheme = localStorage.getItem('esu_cms_theme')
    const dark = savedTheme !== null ? savedTheme === 'dark' : true
    setTimeout(() => {
      setIsDarkMode(dark)
    }, 0)
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Validasi kekuatan password baru secara real-time (Point 5)
  const newPasswordVal = validatePasswordStrength(newPassword)

  // Submit login biasa
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    const enteredPassword = String(formData.get('password') ?? '')

    startTransition(async () => {
      const result: LoginResult = await loginAdmin(formData)
      if (result.success) {
        // Jika sistem mendeteksi password sudah expired (3 bulan) atau masuk peringatan H-7
        if (result.requirePasswordReset && result.resetToken) {
          setResetData({
            resetToken: result.resetToken,
            username: result.username || '',
            name: result.name || '',
            daysRemaining: result.daysRemaining ?? 0,
            isExpired: Boolean(result.isExpired),
            isWarning: Boolean(result.isWarning),
            reason: result.reason || 'warning_h7',
          })
          setOldPassword(enteredPassword) // Otomatis isi old password dari yang baru dimasukkan
          setNewPassword('')
          setVerifyPassword('')
          return
        }

        localStorage.setItem('esu_admin_logged', 'true')
        router.push(result.redirectUrl || '/admin')
        router.refresh()
      } else {
        setErrorMsg(result.message || 'Terjadi kesalahan')
      }
    })
  }

  // Submit ganti password wajib saat login
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')

    if (!resetData) return

    if (!oldPassword) {
      setErrorMsg('Password lama wajib diisi.')
      return
    }

    if (!newPassword) {
      setErrorMsg('Password baru wajib diisi.')
      return
    }

    if (newPassword !== verifyPassword) {
      setErrorMsg('Konfirmasi password baru (verify password) tidak cocok.')
      return
    }

    if (oldPassword === newPassword) {
      setErrorMsg('Password baru tidak boleh sama dengan password lama.')
      return
    }

    if (!newPasswordVal.isValid) {
      setErrorMsg(newPasswordVal.errors.join(' '))
      return
    }

    const formData = new FormData()
    formData.set('resetToken', resetData.resetToken)
    formData.set('oldPassword', oldPassword)
    formData.set('newPassword', newPassword)
    formData.set('verifyPassword', verifyPassword)

    startTransition(async () => {
      const result = await changePasswordOnLoginAction(formData)
      if (result.success) {
        localStorage.setItem('esu_admin_logged', 'true')
        router.push(result.redirectUrl || '/admin')
        router.refresh()
      } else {
        setErrorMsg(result.message || 'Gagal memperbarui password.')
      }
    })
  }

  const cancelResetMode = () => {
    setResetData(null)
    setOldPassword('')
    setNewPassword('')
    setVerifyPassword('')
    setErrorMsg('')
  }

  return (
    <div 
      data-admin-scope="true" 
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0C0D12] text-zinc-100' : 'bg-[#F4F6F9] text-gray-900'
      }`}
    >
      <div className="relative z-10 w-full max-w-lg">
        <div className={`p-6 sm:p-8 rounded-xl shadow-xl border space-y-6 ${
          isDarkMode ? 'bg-[#13161F] border-[#222736]' : 'bg-white border-gray-200'
        }`}>
          
          {/* HEADER LOGO */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#6B0808] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {resetData ? <KeyRound className="w-7 h-7 text-white" /> : '4SU'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                {resetData ? 'Pembaruan Password Halaman CMS' : 'Autentikasi Halaman CMS'}
              </h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold tracking-widest uppercase mt-0.5">
                {resetData ? 'Keamanan Akun Enterprise' : 'Panel CMS Enterprise'}
              </p>
            </div>
          </div>

          {/* MODE FORM 1: RESET PASSWORD WAJIB (EXPIRED / H-7 / MUST RESET) */}
          {resetData ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* BANNER PENJELASAN ALASAN RESET */}
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                resetData.isExpired 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
              }`}>
                <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                  {resetData.isExpired ? (
                    <>
                      <Clock className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Password Telah Kedaluwarsa (3 Bulan)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Peringatan Keamanan Berkala (H-{resetData.daysRemaining})</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {resetData.reason === 'must_reset'
                    ? `Halo ${resetData.name}, password akun Anda baru saja di-reset oleh Administrator. Silakan buat password baru Anda untuk melanjutkan.`
                    : resetData.isExpired
                      ? `Masa berlaku password akun "${resetData.name}" telah melewati batas 3 bulan (90 hari). Demi kepatuhan keamanan data, Anda wajib membuat password baru.`
                      : `Masa aktif password akun "${resetData.name}" tersisa ${resetData.daysRemaining} hari lagi (kurang dari 7 hari). Silakan perbarui password Anda sekarang.`}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                
                {/* 1. OLD PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Old Password (Password Lama)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan password lama..."
                      autoComplete="current-password"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base sm:text-sm font-medium outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-950/80 border-gray-800 text-white focus:border-amber-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. NEW PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    New Password (Password Baru)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru..."
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base sm:text-sm font-medium outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-950/80 border-gray-800 text-white focus:border-amber-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. VERIFY PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Verify Password (Konfirmasi Password Baru)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showVerifyPassword ? 'text' : 'password'}
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      placeholder="Ulangi password baru..."
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base sm:text-sm font-medium outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-gray-950/80 border-gray-800 text-white focus:border-amber-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* REALTIME PASSWORD STRENGTH CHECKLIST (POINT 5) */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDarkMode ? 'bg-gray-950/60 border-gray-800' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kriteria Wajib Password (Panjang min 8, Uppercase, Lowercase, Number, Simbol):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 font-medium ${newPasswordVal.details.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {newPasswordVal.details.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Minimal 8 Karakter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${newPasswordVal.details.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {newPasswordVal.details.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Huruf Besar (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${newPasswordVal.details.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {newPasswordVal.details.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Huruf Kecil (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${newPasswordVal.details.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {newPasswordVal.details.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Angka (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium sm:col-span-2 ${newPasswordVal.details.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      {newPasswordVal.details.hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      <span>Simbol / Karakter Khusus (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isPending || !newPasswordVal.isValid || newPassword !== verifyPassword || oldPassword === newPassword}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Menyimpan & Masuk...' : 'Simpan Password Baru & Masuk ➔'}
                  </button>

                  <button
                    type="button"
                    onClick={cancelResetMode}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Login</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (

            /* MODE FORM 2: LOGIN BIASA */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Username <span className="text-[10px] text-gray-500 font-normal lowercase">(opsional jika login admin master)</span>
                </label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  placeholder="admin atau nama user..."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-[#181C28] border-[#262C3D] text-zinc-100 focus:border-[#8B1E1E]' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#6B0808]'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password..."
                  className={`w-full px-4 py-3.5 rounded-2xl border text-base sm:text-sm font-medium outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-950/80 border-gray-800 text-white focus:border-amber-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600'
                  }`}
                  required
                />
                {errorMsg && (
                  <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-lg text-sm font-bold text-white bg-[#6B0808] hover:bg-[#8B1E1E] shadow-sm transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Memverifikasi...' : 'Masuk ke Halaman CMS ➔'}
              </button>
            </form>
          )}

          {/* FOOTER CARD */}
          <div className="text-center pt-2 border-t border-gray-800/40">
            <Link 
              href="/" 
              onClick={handleOpenMainSite}
              className="text-xs font-bold text-gray-400 hover:text-amber-500 transition-colors uppercase tracking-widest inline-block"
            >
              &larr; Kembali ke Website Utama
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}