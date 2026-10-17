// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { readDB } from '@/lib/db'
import { LanguageProvider } from '@/components/LanguageContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4A0E17',
}

// Fungsi untuk membuat title web dinamis dari CMS
export async function generateMetadata(): Promise<Metadata> {
  const db = await readDB()
  return {
    title: db.setting.siteName,
    description: 'Company Profile ESU yang dikelola dengan Custom CMS',
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