// components/AboutSectionClient.tsx
'use client'

interface AboutContent {
  tag: string
  heading: string
  subtitle: string
  title: string
  p1: string
  p2: string
  leadershipTitle: string
  leadershipDesc: string
  quote: string
}

export default function AboutSectionClient({ about, primaryColor }: { about: AboutContent; primaryColor: string }) {
  return (
    <section id="about" className="min-h-screen w-full py-28 px-8 md:px-20 max-w-7xl mx-auto flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Kolom Kiri: Narasi Utama & Paragraf Perusahaan */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <span className="inline-block text-xs font-extrabold tracking-widest text-amber-700 uppercase bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-sm">
              {about.subtitle || 'ABOUT US'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
              {about.title || 'Mitra Strategis Ketenagakerjaan Anda'}
            </h2>
            <div className="w-16 h-1 bg-amber-500 rounded-full mt-2"></div>
          </div>

          <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed font-medium text-justify">
            <p>{about.p1}</p>
            <p>{about.p2}</p>
          </div>

          {/* Quote / Nilai Perusahaan */}
          {about.quote && (
            <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-lg relative overflow-hidden border-l-4" style={{ borderLeftColor: primaryColor }}>
              <div className="absolute top-2 right-4 text-6xl text-amber-500/10 font-serif select-none pointer-events-none">&ldquo;</div>
              <p className="text-sm md:text-base font-extrabold text-gray-900 tracking-wide uppercase">
                {about.quote}
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Kotak Rekam Jejak & Pengalaman Pimpinan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-700/80 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
              ⭐
            </div>

            <div className="space-y-3 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                Leadership Excellence
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {about.leadershipTitle || 'Rekam Jejak Teruji'}
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium pt-2 text-justify">
                {about.leadershipDesc || 'Dengan pengalaman CEO selama lebih dari 15 tahun bekerja di industri Penyedia Jasa Tenaga Kerja Non Grade.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Profesional & Akuntabel</span>
              <span className="text-amber-400">Est. Korporat</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}