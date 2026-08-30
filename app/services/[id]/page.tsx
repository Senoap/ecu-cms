// app/services/[id]/page.tsx
import { readDB } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DynamicIcon } from '@/components/DynamicIcon'

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const db = await readDB()
  const srv = db.services.find(s => s.id === params.id)

  if (!srv) {
    notFound()
  }

  const { setting } = db

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-gray-800 font-sans">
      <Navbar siteName={setting.siteName} tagline={setting.tagline} primaryColor={setting.primaryColor} logoUrl={setting.logoUrl} />

      <main className="max-w-4xl mx-auto py-20 px-6 space-y-12">
        <div className="space-y-4 text-center">
          <Link href="/#services" className="text-xs font-bold text-amber-700 hover:underline inline-block mb-4">
            &larr; Kembali ke Beranda & Layanan
          </Link>
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-md border border-amber-200">
            <DynamicIcon name={srv.icon} className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{srv.title}</h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto font-medium">{srv.desc}</p>
        </div>

        {/* Konten Lengkap */}
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Detail Layanan & Ruang Lingkup</h3>
          <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {srv.content || srv.desc}
          </p>
        </div>

        {/* Galeri Foto Jika Ada */}
        {srv.images && srv.images.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-gray-900 text-center">Dokumentasi & Galeri Proyek</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {srv.images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white h-72">
                  <img src={img} alt={`Dokumentasi ${srv.title} ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gray-900 text-white p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-bold">Tertarik Menggunakan Layanan Ini?</h3>
          <p className="text-gray-300 text-xs max-w-lg mx-auto">Diskusikan kebutuhan operasional dan penempatan tenaga kerja profesional bersama tim ahli kami.</p>
          <a 
            href="/#contact" 
            className="inline-block px-8 py-3 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90"
            style={{ backgroundColor: setting.primaryColor }}
          >
            HUBUNGI KAMI SEKARANG
          </a>
        </div>
      </main>
    </div>
  )
}