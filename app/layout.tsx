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
    <html lang="id">
      <body 
        style={{ 
          ['--primary' as any]: primaryColor,
          fontFamily: fontFamily === 'Poppins' ? 'Poppins, sans-serif' : fontFamily === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
        }}
        className="bg-gray-950 text-gray-100 antialiased selection:bg-amber-500/20 selection:text-amber-400"
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}