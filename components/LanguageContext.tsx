// components/LanguageContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, translations, enContentFallback } from '@/lib/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (loc: Locale) => void
  toggleLocale: () => void
  t: typeof translations['id']
  getFallbackContent: (type: 'services' | 'portfolios' | 'career' | 'galleries', id: string) => any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    const saved = localStorage.getItem('esu_locale') as Locale
    if (saved === 'id' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (loc: Locale) => {
    setLocaleState(loc)
    localStorage.setItem('esu_locale', loc)
    document.cookie = `esu_locale=${loc}; path=/; max-age=31536000; SameSite=Lax`
  }

  const toggleLocale = () => {
    const next = locale === 'id' ? 'en' : 'id'
    setLocale(next)
  }

  const getFallbackContent = (type: 'services' | 'portfolios' | 'career' | 'galleries', id: string) => {
    if (locale === 'en' && enContentFallback[type] && enContentFallback[type][id]) {
      return enContentFallback[type][id]
    }
    return null
  }

  const t = translations[locale]

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, getFallbackContent }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: 'id' as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: translations.id,
      getFallbackContent: () => null,
    }
  }
  return context
}
