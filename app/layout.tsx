// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Roboto } from 'next/font/google'
import './globals.css'
import { readPublishedDB } from '@/lib/db'
import { LanguageProvider } from '@/components/LanguageContext'
import SmartViewportProvider from '@/components/SmartViewportProvider'
import VisitorTracker from '@/components/VisitorTracker'
import PrivacyConsentBanner from '@/components/PrivacyConsentBanner'
import { getSiteUrl, toAbsoluteUrl, safeJsonLd } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

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
  const db = await readPublishedDB()
  const seo = db.seoSetting
  const siteName = db.setting.siteName || 'PT. EMPAT SINERGI UTAMA'
  const tagline = db.setting.tagline || 'MANPOWER SERVICES'

  const customTitle = seo?.metaTitle?.trim()
  const customDesc = seo?.metaDescription?.trim()
  const customKeywords = seo?.metaKeywords?.trim()
  const customCanonical = seo?.canonicalUrl?.trim()
  const customOgImage = seo?.ogImageUrl?.trim()
  const googleVerification = seo?.googleSiteVerification?.trim()
  const isNoIndex = seo?.indexingRobots === 'noindex'

  const rawLogoUrl = db.setting.logoUrl || '/icons/icon-192x192.png'
  const iconMimeType = rawLogoUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : rawLogoUrl.endsWith('.webp')
      ? 'image/webp'
      : 'image/png'

  const baseUrl = customCanonical ? customCanonical.replace(/\/+$/, '') : getSiteUrl()
  const defaultDesc = `${siteName} adalah penyedia solusi terintegrasi kebutuhan operasional bisnis, manajemen fasilitas gedung, dan pemenuhan ketenagakerjaan ahli di Indonesia.`

  return {
    title: {
      default: customTitle || `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: customDesc || defaultDesc,
    keywords: customKeywords
      ? customKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined,
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
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    robots: isNoIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    verification: googleVerification
      ? { google: googleVerification }
      : undefined,
    icons: {
      icon: [
        { url: rawLogoUrl, type: iconMimeType },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: [{ url: rawLogoUrl, type: iconMimeType }],
      apple: [{ url: rawLogoUrl }],
    },
    openGraph: {
      title: customTitle || siteName,
      description: customDesc || tagline,
      siteName: siteName,
      type: 'website',
      locale: 'id_ID',
      images: customOgImage ? [customOgImage] : (rawLogoUrl ? [rawLogoUrl] : undefined),
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const db = await readPublishedDB()
  const { primaryColor, fontFamily } = db.setting

  const activeFontFamily = fontFamily === 'Poppins'
    ? 'var(--font-poppins), sans-serif'
    : fontFamily === 'Roboto'
      ? 'var(--font-roboto), sans-serif'
      : 'var(--font-inter), sans-serif'

  const customCanonical = db.seoSetting?.canonicalUrl?.trim()
  const siteUrl = customCanonical ? customCanonical.replace(/\/+$/, '') : getSiteUrl()
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: db.setting.siteName || 'PT. EMPAT SINERGI UTAMA',
    description: db.setting.tagline || 'MANPOWER SERVICES',
    url: siteUrl,
    logo: toAbsoluteUrl(db.setting.logoUrl),
    contactPoint: db.footer.phone ? {
      '@type': 'ContactPoint',
      telephone: db.footer.phone,
      contactType: 'customer service',
      areaServed: 'ID',
      availableLanguage: ['Indonesian'],
    } : undefined,
    address: db.footer.address ? {
      '@type': 'PostalAddress',
      streetAddress: db.footer.address,
      addressCountry: 'ID',
    } : undefined,
  }

  const rawLogoUrl = db.setting?.logoUrl || '/icons/icon-192x192.png'
  const iconMimeType = rawLogoUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : rawLogoUrl.endsWith('.webp')
      ? 'image/webp'
      : 'image/png'

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${roboto.variable}`}
    >
      <head>
        <link rel="icon" href={rawLogoUrl} type={iconMimeType} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href={rawLogoUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                window.__deferredPwaPrompt = null;
                window.addEventListener('beforeinstallprompt', function(e) {
                  var p = window.location.pathname || '';
                  var h = window.location.hostname || '';
                  if (p.indexOf('/cms') === 0 || p.indexOf('/admin') === 0 || p.indexOf('/login') === 0 || /^(cms-4su|cms|admin)[.-]/i.test(h)) {
                    e.preventDefault();
                    window.__deferredPwaPrompt = e;
                    window.dispatchEvent(new Event('esu-pwa-prompt-ready'));
                  }
                });
                var t = localStorage.getItem('esu_site_theme');
                var isDark = t === 'dark' || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body
        style={{
          ['--primary' as string]: primaryColor,
          fontFamily: activeFontFamily
        } as React.CSSProperties}
        className="bg-[#F8F7F4] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased selection:bg-amber-500/20 selection:text-amber-400 min-h-screen min-h-[100dvh] transition-colors duration-200"
      >
        <SmartViewportProvider>
          <LanguageProvider>
            <VisitorTracker />
            <PrivacyConsentBanner />
            {children}
          </LanguageProvider>
        </SmartViewportProvider>
      </body>
    </html>
  )
}