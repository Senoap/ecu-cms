// app/admin/legal/LegalClient.tsx
'use client'

import { useState, useTransition, useMemo } from 'react'
import { ShieldCheck, FileText, Save, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react'
import type { LegalContent } from '@/lib/db'
import { updatePrivacyPolicyAction, updateTermsAction } from './actions'
import Link from 'next/link'

interface LegalClientProps {
  initialPrivacy: LegalContent
  initialTerms: LegalContent
}

export default function LegalClient({ initialPrivacy, initialTerms }: LegalClientProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')
  const [isPending, startTransition] = useTransition()
  const [toastMsg, setToastMsg] = useState('')

  const [privacyTitle, setPrivacyTitle] = useState(initialPrivacy.title)
  const [privacyDate, setPrivacyDate] = useState(initialPrivacy.lastUpdated)
  const [privacyContent, setPrivacyContent] = useState(initialPrivacy.content)

  const [privacyBaseline, setPrivacyBaseline] = useState({
    title: initialPrivacy.title,
    lastUpdated: initialPrivacy.lastUpdated,
    content: initialPrivacy.content,
  })

  const isPrivacyDirty = useMemo(() => {
    return (
      privacyTitle !== privacyBaseline.title ||
      privacyDate !== privacyBaseline.lastUpdated ||
      privacyContent !== privacyBaseline.content
    )
  }, [privacyTitle, privacyDate, privacyContent, privacyBaseline])

  const [termsTitle, setTermsTitle] = useState(initialTerms.title)
  const [termsDate, setTermsDate] = useState(initialTerms.lastUpdated)
  const [termsContent, setTermsContent] = useState(initialTerms.content)

  const [termsBaseline, setTermsBaseline] = useState({
    title: initialTerms.title,
    lastUpdated: initialTerms.lastUpdated,
    content: initialTerms.content,
  })

  const isTermsDirty = useMemo(() => {
    return (
      termsTitle !== termsBaseline.title ||
      termsDate !== termsBaseline.lastUpdated ||
      termsContent !== termsBaseline.content
    )
  }, [termsTitle, termsDate, termsContent, termsBaseline])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const handleSavePrivacy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await updatePrivacyPolicyAction(formData)
      setPrivacyBaseline({
        title: privacyTitle,
        lastUpdated: privacyDate,
        content: privacyContent,
      })
      showToast('Kebijakan Privasi berhasil disimpan!')
    })
  }

  const handleSaveTerms = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateTermsAction(formData)
      setTermsBaseline({
        title: termsTitle,
        lastUpdated: termsDate,
        content: termsContent,
      })
      showToast('Syarat & Ketentuan berhasil disimpan!')
    })
  }

  return (
    <div className="relative pb-32">
      {/* TOAST SUKSES */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-800 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Perubahan Disimpan!</h4>
              <p className="text-[11px] text-gray-300 font-medium">{toastMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Kebijakan Privasi &amp; Syarat Ketentuan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mt-1">
              Kelola isi teks legal korporat yang dapat diakses publik pada tautan footer website.
            </p>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <Link
              href={activeTab === 'privacy' ? '/privacy-policy' : '/terms'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-500 dark:text-gray-400 text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 shadow-sm"
            >
              <span>Lihat Halaman Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kebijakan Privasi (Privacy Policy)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Syarat & Ketentuan (Terms of Service)</span>
          </button>
        </div>

        {/* TAB 1: KEBIJAKAN PRIVASI */}
        {activeTab === 'privacy' && (
          <form onSubmit={handleSavePrivacy} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Judul Halaman
                </label>
                <input
                  type="text"
                  name="title"
                  value={privacyTitle}
                  onChange={(e) => setPrivacyTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Pembaruan Terakhir
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastUpdated"
                    value={privacyDate}
                    onChange={(e) => setPrivacyDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner pl-10"
                    placeholder="Contoh: 17 Oktober 2026"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Isi Kebijakan Privasi
              </label>
              <textarea
                name="content"
                rows={16}
                value={privacyContent}
                onChange={(e) => setPrivacyContent(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner font-mono leading-relaxed"
                placeholder="Tuliskan klausul kebijakan privasi perusahaan..."
                required
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Gunakan baris baru (Enter) untuk memisahkan paragraf atau poin klausul. Teks akan diformat secara rapi di halaman publik.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isPrivacyDirty || isPending}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  !isPrivacyDirty || isPending
                    ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-gray-900/40 hover:scale-105 active:scale-95 cursor-pointer'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isPending ? 'Menyimpan...' : 'Simpan Kebijakan Privasi'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SYARAT & KETENTUAN */}
        {activeTab === 'terms' && (
          <form onSubmit={handleSaveTerms} className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Judul Halaman
                </label>
                <input
                  type="text"
                  name="title"
                  value={termsTitle}
                  onChange={(e) => setTermsTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Pembaruan Terakhir
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastUpdated"
                    value={termsDate}
                    onChange={(e) => setTermsDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner pl-10"
                    placeholder="Contoh: 17 Oktober 2026"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Isi Syarat & Ketentuan
              </label>
              <textarea
                name="content"
                rows={16}
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-medium shadow-inner font-mono leading-relaxed"
                placeholder="Tuliskan syarat dan ketentuan penggunaan situs..."
                required
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Gunakan baris baru (Enter) untuk memisahkan paragraf atau poin klausul. Teks akan diformat secara rapi di halaman publik.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isTermsDirty || isPending}
                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  !isTermsDirty || isPending
                    ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-gray-900/40 hover:scale-105 active:scale-95 cursor-pointer'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isPending ? 'Menyimpan...' : 'Simpan Syarat & Ketentuan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
