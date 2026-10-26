// components/ChangePasswordModal.tsx
'use client'

import { useState, useTransition } from 'react'
import { KeyRound, Lock, Eye, EyeOff, X, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { validatePasswordStrength } from '@/lib/password'
import { changeSelfPasswordAction } from '@/app/admin/profile-actions'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserName?: string
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  currentUserName,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showVerifyPassword, setShowVerifyPassword] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const strength = validatePasswordStrength(newPassword)
  const isMatch = newPassword.length > 0 && newPassword === verifyPassword
  const isDifferentFromOld = oldPassword.length > 0 && newPassword.length > 0 && oldPassword !== newPassword
  const canSubmit = oldPassword.length > 0 && strength.isValid && isMatch && isDifferentFromOld

  if (!isOpen) return null

  const handleClose = () => {
    setOldPassword('')
    setNewPassword('')
    setVerifyPassword('')
    setErrorMsg('')
    setSuccessMsg('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!oldPassword) {
      setErrorMsg('Password lama wajib diisi.')
      return
    }

    if (!strength.isValid) {
      setErrorMsg(strength.errors.join(' '))
      return
    }

    if (newPassword !== verifyPassword) {
      setErrorMsg('Verifikasi password baru tidak cocok dengan password baru.')
      return
    }

    if (oldPassword === newPassword) {
      setErrorMsg('Password baru tidak boleh sama dengan password lama.')
      return
    }

    const formData = new FormData()
    formData.set('oldPassword', oldPassword)
    formData.set('newPassword', newPassword)
    formData.set('verifyPassword', verifyPassword)

    startTransition(async () => {
      try {
        const res = await changeSelfPasswordAction(formData)
        if (!res.success) {
          setErrorMsg(res.message || 'Gagal mengubah password.')
          return
        }
        setSuccessMsg(res.message || 'Password akun Anda berhasil diperbarui.')
        setTimeout(() => {
          handleClose()
        }, 1500)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengganti password.'
        setErrorMsg(msg)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-2xl space-y-5">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Ganti Password Akun
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pengguna: <strong className="text-gray-900 dark:text-white">{currentUserName || 'Akun Anda'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ALERT STATUS */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM GANTI PASSWORD */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. PASSWORD LAMA */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Password Lama
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password Anda saat ini"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. PASSWORD BARU */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 karakter kombinasi huruf, angka, simbol"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. VERIFIKASI PASSWORD BARU */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Verifikasi Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showVerifyPassword ? 'text' : 'password'}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Ulangi password baru Anda"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {verifyPassword && !isMatch && (
              <p className="text-[11px] text-rose-500 font-medium">Verifikasi password belum cocok.</p>
            )}
          </div>

          {/* INDIKATOR PERSYARATAN KEAMANAN PASSWORD */}
          <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/70 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Persyaratan Keamanan Password:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div className={`flex items-center gap-1.5 font-medium ${strength.details.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {strength.details.minLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Minimal 8 Karakter</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${strength.details.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {strength.details.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Huruf Besar (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${strength.details.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {strength.details.hasLower ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Huruf Kecil (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${strength.details.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {strength.details.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Angka (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${strength.details.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                {strength.details.hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Simbol (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || !canSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default ChangePasswordModal
