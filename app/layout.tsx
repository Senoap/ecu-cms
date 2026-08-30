// app/layout.tsx
import type { Metadata } from 'next' // atau biarkan bawaan
import './globals.css'
import { readDB } from '@/lib/db'

// Fungsi untuk membuat title web dinamis dari CMS
export async function generateMetadata(): Promise<Metadata> {
  const db = readDB()
  return {
    title: db.setting.siteName,
    description: 'Company Profile ESU yang dikelola dengan Custom CMS',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const db = readDB()
  const { primaryColor, fontFamily } = db.setting

  return (
    <html lang="id">
      <body 
        style={{ 
          ['--primary' as any]: primaryColor,
          fontFamily: fontFamily === 'Poppins' ? 'Poppins, sans-serif' : fontFamily === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
        }}
        className="bg-gray-950 text-gray-100 antialiased"
      >
        {children}
      </body>
    </html>
  )
}