// components/LanguageContext.tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Locale, translations } from '@/lib/i18n'

interface LanguageContextType {
  locale: Locale
  setLocale: (loc: Locale) => void
  toggleLocale: () => void
  t: typeof translations['id']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale: Locale = 'id'
  const setLocale = () => {}
  const toggleLocale = () => {}
  const t = translations.id

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      locale: 'id' as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: translations.id,
    }
  }
  return context
}
