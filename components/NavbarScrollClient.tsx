// components/NavbarScrollClient.tsx
'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

interface NavbarScrollClientProps {
  siteName: string
  tagline: string
  primaryColor: string
  logoUrl?: string
}

export default function NavbarScrollClient({ siteName, tagline, primaryColor, logoUrl }: NavbarScrollClientProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/70 backdrop-blur-md shadow-lg border-b border-gray-200/50 py-2' 
        : 'bg-white shadow-sm py-4'
    }`}>
      <Navbar
        siteName={siteName}
        tagline={tagline}
        primaryColor={primaryColor}
        logoUrl={logoUrl}
      />
    </div>
  )
}