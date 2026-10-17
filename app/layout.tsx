// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { readDB } from '@/lib/db'
import { LanguageProvider } from '@/components/LanguageContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F4' },
    { media: '(prefers-color-scheme: dark)', color: '#090A0F' },
  ],
  viewportFit: 'cover',
}

// Fungsi untuk membuat metadata web dinamis dari CMS untuk desktop, laptop, mobile, & SEO
export async function generateMetadata(): Promise<Metadata> {
  const db = await readDB()
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  const tagline = db.setting.tagline || 'MANPOWER SERVICES'

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: `${siteName} adalah penyedia solusi terintegrasi kebutuhan operasional bisnis, manajemen fasilitas gedung, dan pemenuhan ketenagakerjaan ahli di Indonesia.`,
    applicationName: siteName,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      telephone: true,
      date: true,
      address: true,
      email: true,
    },
    icons: db.setting.logoUrl ? [{ rel: 'icon', url: db.setting.logoUrl }] : undefined,
    openGraph: {
      title: siteName,
      description: tagline,
      siteName: siteName,
      type: 'website',
      locale: 'id_ID',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const db = await readDB()
  const { primaryColor, fontFamily } = db.setting

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('esu_site_theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body 
        style={{ 
          ['--primary' as string]: primaryColor,
          fontFamily: fontFamily === 'Poppins' ? 'Poppins, sans-serif' : fontFamily === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
        } as React.CSSProperties}
        className="bg-[#F8F7F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased selection:bg-amber-500/20 selection:text-amber-400 min-h-screen transition-colors duration-200"
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}