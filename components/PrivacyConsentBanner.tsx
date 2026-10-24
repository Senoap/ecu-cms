// components/PrivacyConsentBanner.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cookie, Settings, Check, X } from 'lucide-react'
import {
  getCookieConsent,
  saveCookieConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
} from '@/lib/cookieConsent'

export default function PrivacyConsentBanner() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [analyticsChecked, setAnalyticsChecked] = useState(false)

  // Jangan pernah tampilkan banner cookie pada halaman Login, CMS (/cms atau /admin), maupun subdomain CMS
  const isCmsOrAuthRoute =
    Boolean(pathname && (pathname.startsWith('/login') || pathname.startsWith('/cms') || pathname.startsWith('/admin'))) ||
    (typeof window !== 'undefined' && /^(cms-4su|cms|admin)[.-]/i.test(window.location.hostname))

  useEffect(() => {
    if (isCmsOrAuthRoute) {
      return
    }
    // 1. Cek apakah pengguna sudah memiliki preferensi tersimpan
    const existing = getCookieConsent()
    if (!existing) {
      // Tampilkan banner dengan jeda halus setelah render awal
      const timer = setTimeout(() => setIsVisible(true), 700)
      return () => clearTimeout(timer)
    }

    // 2. Dengarkan event dari link footer "Pengaturan Cookie"
    const handleOpenSettings = () => {
      const current = getCookieConsent()
      setAnalyticsChecked(Boolean(current?.analytics))
      setIsSettingsOpen(true)
      setIsVisible(true)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings)
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings)
    }
  }, [isCmsOrAuthRoute])

  // Aksi: Terima semua (dari banner atau panel)
  const handleAcceptAll = () => {
    saveCookieConsent(true)
    setAnalyticsChecked(true)
    setIsSettingsOpen(false)
    setIsVisible(false)
  }

  // Aksi: Tolak semua (hanya cookie esensial aktif, analitik dimatikan)
  const handleRejectAll = () => {
    saveCookieConsent(false)
    setAnalyticsChecked(false)
    setIsSettingsOpen(false)
    setIsVisible(false)
  }

  // Aksi: Buka panel pengaturan dari tombol "Atur"
  const handleOpenSettingsPanel = () => {
    const current = getCookieConsent()
    setAnalyticsChecked(Boolean(current?.analytics))
    setIsSettingsOpen(true)
  }

  // Aksi: Simpan pilihan dari panel pengaturan
  const handleSavePreferences = () => {
    saveCookieConsent(analyticsChecked)
    setIsSettingsOpen(false)
    setIsVisible(false)
  }

  // Aksi: Tutup modal pengaturan (jika dibuka dari footer tanpa mengubah)
  const handleClosePanel = () => {
    const existing = getCookieConsent()
    if (existing) {
      setIsSettingsOpen(false)
      setIsVisible(false)
    } else {
      // Kembali ke tampilan banner awal jika belum pernah memilih
      setIsSettingsOpen(false)
    }
  }

  if (!isVisible || isCmsOrAuthRoute) return null

  return (
    <aside
      aria-label="Pemberitahuan Privasi & Cookie"
      role="region"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 transition-all duration-300 ease-out"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-2 border-gray-200 dark:border-gray-800 p-5 sm:p-6 rounded-2xl shadow-2xl text-gray-900 dark:text-gray-100 flex flex-col gap-4">
        
        {/* TAMPILAN 1: BANNER UTAMA */}
        {!isSettingsOpen ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-gray-950 dark:text-white">
                  Pemberitahuan Privasi & Cookie
                </h4>
                <p className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                  Kami memakai cookie esensial agar situs berjalan, dan cookie analitik (dengan izin Anda) untuk meningkatkan pengalaman Anda. Atur pilihan Anda kapan saja. Selengkapnya di{' '}
                  <Link
                    href="/privacy-policy"
                    className="underline decoration-amber-500/60 underline-offset-2 text-amber-600 dark:text-amber-400 font-semibold hover:text-amber-500 transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>.
                </p>
              </div>
            </div>

            {/* TOMBOL TINDAKAN DENGAN PILIHAN: TOLAK, ATUR, TERIMA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              {/* Tombol "Tolak" */}
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Tolak
              </button>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                {/* Tombol "Atur" dibuat jelas dan berbobot sama */}
                <button
                  type="button"
                  onClick={handleOpenSettingsPanel}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  Atur
                </button>
                
                {/* Tombol "Terima" */}
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-500 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Terima
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAMPILAN 2: PANEL PENGATURAN COOKIE */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-gray-950 dark:text-white">
                  Pengaturan Cookie
                </h4>
              </div>
              <button
                type="button"
                onClick={handleClosePanel}
                aria-label="Tutup pengaturan"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* OPSI 1: COOKIE ESENSIAL (Terkunci & Selalu Aktif) */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                      Cookie Esensial
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Selalu Aktif
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                    Diperlukan agar situs berfungsi.
                  </p>
                </div>
                {/* Toggle Terkunci */}
                <div className="flex items-center pt-0.5 flex-shrink-0">
                  <div
                    aria-disabled="true"
                    aria-checked="true"
                    role="switch"
                    className="w-11 h-6 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-end px-1 opacity-70 cursor-not-allowed"
                    title="Cookie esensial tidak dapat dinonaktifkan"
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </div>
                </div>
              </div>

              {/* OPSI 2: COOKIE ANALITIK (Toggle interaktif) */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                      Cookie Analitik
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                    Membantu kami memahami penggunaan situs.
                  </p>
                </div>
                {/* Toggle Interaktif */}
                <div className="flex items-center pt-0.5 flex-shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsChecked}
                    onClick={() => setAnalyticsChecked(!analyticsChecked)}
                    className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-200 cursor-pointer ${
                      analyticsChecked ? 'bg-amber-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* TOMBOL DI DALAM PANEL: TOLAK SEMUA, SIMPAN PILIHAN & TERIMA SEMUA */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95"
              >
                Tolak semua
              </button>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95"
                >
                  Simpan pilihan
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-amber-600 hover:bg-amber-500 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95"
                >
                  Terima semua
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </aside>
  )
}
