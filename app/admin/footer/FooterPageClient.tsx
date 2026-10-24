// app/admin/footer/FooterPageClient.tsx
'use client'
import { useState, useTransition, useMemo } from 'react'
import { Save, PhoneCall, Share2, MessageSquare, Mail } from 'lucide-react'
import type { FooterContent } from '@/lib/db'

interface FooterPageClientProps {
  initialFooter: FooterContent
  updateFooterAction: (formData: FormData) => Promise<void>
}

export default function FooterPageClient({ initialFooter, updateFooterAction }: FooterPageClientProps) {
  const [isPending, startTransition] = useTransition()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  
  const [description, setDescription] = useState(initialFooter.description || '')
  const [address, setAddress] = useState(initialFooter.address || '')
  const [phone, setPhone] = useState(initialFooter.phone || '')
  const [whatsapp, setWhatsapp] = useState(initialFooter.whatsapp || initialFooter.phone || '')
  const [email, setEmail] = useState(initialFooter.email || '')
  const [socialEnabled, setSocialEnabled] = useState(
    initialFooter.socialMedia?.enabled !== false
  )
  const [instagram, setInstagram] = useState(initialFooter.socialMedia?.instagram || '')
  const [linkedin, setLinkedin] = useState(initialFooter.socialMedia?.linkedin || '')
  const [facebook, setFacebook] = useState(initialFooter.socialMedia?.facebook || '')
  const [tiktok, setTiktok] = useState(initialFooter.socialMedia?.tiktok || '')
  const [youtube, setYoutube] = useState(initialFooter.socialMedia?.youtube || '')
  const [waMessage, setWaMessage] = useState(initialFooter.inquiryTemplates?.waMessage || '')
  const [emailSubject, setEmailSubject] = useState(initialFooter.inquiryTemplates?.emailSubject || '')
  const [emailBody, setEmailBody] = useState(initialFooter.inquiryTemplates?.emailBody || '')

  const [savedBaseline, setSavedBaseline] = useState({
    description: initialFooter.description || '',
    address: initialFooter.address || '',
    phone: initialFooter.phone || '',
    whatsapp: initialFooter.whatsapp || initialFooter.phone || '',
    email: initialFooter.email || '',
    socialEnabled: initialFooter.socialMedia?.enabled !== false,
    instagram: initialFooter.socialMedia?.instagram || '',
    linkedin: initialFooter.socialMedia?.linkedin || '',
    facebook: initialFooter.socialMedia?.facebook || '',
    tiktok: initialFooter.socialMedia?.tiktok || '',
    youtube: initialFooter.socialMedia?.youtube || '',
    waMessage: initialFooter.inquiryTemplates?.waMessage || '',
    emailSubject: initialFooter.inquiryTemplates?.emailSubject || '',
    emailBody: initialFooter.inquiryTemplates?.emailBody || '',
  })

  const isDirty = useMemo(() => {
    return (
      description !== savedBaseline.description ||
      address !== savedBaseline.address ||
      phone !== savedBaseline.phone ||
      whatsapp !== savedBaseline.whatsapp ||
      email !== savedBaseline.email ||
      socialEnabled !== savedBaseline.socialEnabled ||
      instagram !== savedBaseline.instagram ||
      linkedin !== savedBaseline.linkedin ||
      facebook !== savedBaseline.facebook ||
      tiktok !== savedBaseline.tiktok ||
      youtube !== savedBaseline.youtube ||
      waMessage !== savedBaseline.waMessage ||
      emailSubject !== savedBaseline.emailSubject ||
      emailBody !== savedBaseline.emailBody
    )
  }, [
    description, address, phone, whatsapp, email, socialEnabled,
    instagram, linkedin, facebook, tiktok, youtube,
    waMessage, emailSubject, emailBody, savedBaseline
  ])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('socialEnabled', socialEnabled ? 'true' : 'false')

    startTransition(async () => {
      await updateFooterAction(formData)
      setSavedBaseline({
        description,
        address,
        phone,
        whatsapp,
        email,
        socialEnabled,
        instagram,
        linkedin,
        facebook,
        tiktok,
        youtube,
        waMessage,
        emailSubject,
        emailBody,
      })
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Setting Footer, Kontak &amp; Sosmed
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ubah informasi kontak, alamat, tautan media sosial, serta template pesan konsultasi pengunjung.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BAGIAN 1: INFORMASI UTAMA & KONTAK */}
          <div className="bg-white dark:bg-[#10131C] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800/80 space-y-6 transition-colors">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>1. Informasi Utama & Kontak</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Deskripsi Footer</label>
              <textarea 
                name="description" 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Alamat Perusahaan</label>
              <input 
                type="text" 
                name="address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" 
                placeholder="Contoh: Casa De Bosco No.3, Tangerang Selatan" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Telepon (Seluler)</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" 
                  placeholder="021-5551234" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Nomor WhatsApp</label>
                <input 
                  type="text" 
                  name="whatsapp" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" 
                  placeholder="6281234567890" 
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Gunakan format kode negara (contoh: 628...)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email Tujuan</label>
                <input 
                  type="text" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-medium shadow-inner transition-colors" 
                  placeholder="info@perusahaan.com" 
                />
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

              {/* Saklar Geser ala Apple (iOS Toggle Switch) Berwarna Maroon Sesuai Palet Perusahaan */}
              <div className="flex items-center gap-3.5 self-start sm:self-auto shrink-0">
                <span className={`text-xs font-black uppercase tracking-wider transition-colors select-none ${
                  socialEnabled
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {socialEnabled ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={socialEnabled}
                  aria-label="Toggle Media Sosial Footer"
                  onClick={() => setSocialEnabled(!socialEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    socialEnabled ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      socialEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
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
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
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
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
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
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
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
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
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
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
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
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
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
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
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
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Contoh template isi email pengunjung..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-mono text-xs leading-relaxed shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* TOMBOL SIMPAN KE DRAFT MELAYANG DI POJOK KANAN BAWAH */}
          <div 
            style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))' }}
            className="fixed right-4 sm:right-6 z-45"
          >
            <button 
              type="submit" 
              disabled={!isDirty || isPending}
              className={`px-5 h-12 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 border backdrop-blur-md cursor-pointer ${
                !isDirty || isPending
                  ? 'bg-gray-200 dark:bg-gray-900/40 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-800/40 cursor-not-allowed opacity-50 shadow-none'
                  : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md shadow-black/20 cursor-pointer'
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