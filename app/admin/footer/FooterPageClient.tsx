// app/admin/footer/FooterPageClient.tsx
'use client'
import { useState, useTransition } from 'react'
import { Save, PhoneCall, Share2, MessageSquare, Mail, Globe } from 'lucide-react'
import type { FooterContent } from '@/lib/db'

interface FooterPageClientProps {
  initialFooter: FooterContent
  updateFooterAction: (formData: FormData) => Promise<void>
}

export default function FooterPageClient({ initialFooter, updateFooterAction }: FooterPageClientProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  
  const [socialEnabled, setSocialEnabled] = useState(
    initialFooter.socialMedia?.enabled !== false
  )

  const handleChange = () => {
    if (!isDirty) setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('socialEnabled', socialEnabled ? 'true' : 'false')

    startTransition(async () => {
      await updateFooterAction(formData)
      setIsDirty(false)
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 4000)
    })
  }

  return (
    <div className="relative pb-32">
      
      {/* TOAST NOTIFIKASI SUKSES */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        showSuccessToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-amber-950/95 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <Save className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">Berhasil Disimpan ke Draft!</h4>
            <p className="text-[11px] text-amber-400/80 font-medium">Pengaturan footer, media sosial, dan template pertanyaan tersimpan.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 relative overflow-hidden transition-colors">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Section Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Setting Footer, Kontak & Sosmed</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">Ubah informasi kontak, alamat, tautan media sosial, serta template pesan konsultasi pengunjung.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} onChange={handleChange} className="space-y-8">
          
          {/* BAGIAN 1: INFORMASI UTAMA & KONTAK */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>1. Informasi Utama & Kontak</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi Footer</label>
              <textarea name="description" rows={3} defaultValue={initialFooter.description} className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors"></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Alamat Perusahaan</label>
              <input type="text" name="address" defaultValue={initialFooter.address} className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" placeholder="Contoh: Casa De Bosco No.3, Tangerang Selatan" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Telepon (Seluler)</label>
                <input type="text" name="phone" defaultValue={initialFooter.phone} className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" placeholder="021-5551234" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Nomor WhatsApp</label>
                <input type="text" name="whatsapp" defaultValue={initialFooter.whatsapp || initialFooter.phone} className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" placeholder="6281234567890" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Gunakan format kode negara (contoh: 628...)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email Tujuan</label>
                <input type="text" name="email" defaultValue={initialFooter.email} className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" placeholder="info@perusahaan.com" />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: MEDIA SOSIAL (POINT 6 - OPSIONAL DENGAN FITUR TOGGLE) */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>2. Media Sosial (Opsional)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Aktifkan fitur ini untuk menampilkan ikon tautan profil media sosial resmi di bagian footer website.
                </p>
              </div>

              {/* TOGGLE ON / OFF */}
              <button
                type="button"
                onClick={() => {
                  setSocialEnabled(!socialEnabled)
                  handleChange()
                }}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  socialEnabled ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    socialEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {socialEnabled ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    defaultValue={initialFooter.socialMedia?.instagram || ''}
                    placeholder="https://instagram.com/empatsinergiutama"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    defaultValue={initialFooter.socialMedia?.linkedin || ''}
                    placeholder="https://linkedin.com/company/empat-sinergi-utama"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    defaultValue={initialFooter.socialMedia?.facebook || ''}
                    placeholder="https://facebook.com/empatsinergiutama"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    name="tiktok"
                    defaultValue={initialFooter.socialMedia?.tiktok || ''}
                    placeholder="https://tiktok.com/@empatsinergiutama"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    name="youtube"
                    defaultValue={initialFooter.socialMedia?.youtube || ''}
                    placeholder="https://youtube.com/@empatsinergiutama"
                    className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-xs font-medium text-center">
                Ikon media sosial sedang dinonaktifkan dan tidak akan tampil di footer website.
              </div>
            )}
          </div>

          {/* BAGIAN 3: TEMPLATE PERTANYAAN PENGUNJUNG (POINT 10) */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>3. Template Pertanyaan Pengunjung (WA & Email)</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Template ini akan otomatis terisi ketika pengunjung mengklik tombol WhatsApp atau Email di footer website untuk berkonsultasi.
            </p>

            {/* TEMPLATE WHATSAPP */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Template Chat WhatsApp Pengunjung</span>
              </label>
              <textarea
                name="waMessage"
                rows={3}
                defaultValue={initialFooter.inquiryTemplates?.waMessage || ''}
                placeholder="Contoh: Halo PT. Empat Sinergi Utama, saya ingin berkonsultasi mengenai kebutuhan layanan alih daya..."
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Pesan ini akan langsung muncul di kotak chat WhatsApp pengunjung saat mengklik nomor/WhatsApp di footer.
              </p>
            </div>

            {/* TEMPLATE EMAIL */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Subjek Email Pengunjung</span>
                </label>
                <input
                  type="text"
                  name="emailSubject"
                  defaultValue={initialFooter.inquiryTemplates?.emailSubject || ''}
                  placeholder="Contoh: Konsultasi Layanan Alih Daya - PT. Empat Sinergi Utama"
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Draft Isi Pesan Email (Body)
                </label>
                <textarea
                  name="emailBody"
                  rows={6}
                  defaultValue={initialFooter.inquiryTemplates?.emailBody || ''}
                  placeholder="Contoh template isi email pengunjung..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-mono text-xs leading-relaxed shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
          <div className="fixed bottom-6 right-20 z-45">
            <button 
              type="submit" 
              disabled={!isDirty || isPending}
              className={`px-5 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                !isDirty || isPending
                  ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-500/40 shadow-xl shadow-amber-900/50 hover:scale-105 animate-pulse'
              }`}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan ke Draft</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}