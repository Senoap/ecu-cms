// components/SmartViewportProvider.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ScreenWindowMode =
  | 'fullscreen'
  | 'split-2-horizontal' // 2 jendela berdampingan (kiri-kanan)
  | 'split-2-vertical'   // 2 jendela atas-bawah
  | 'split-4-quadrant'   // 4 jendela dalam 1 layar (kuadran 2x2)
  | 'floating-window'    // Jendela melayang / multi-window custom
  | 'mobile-compact'     // Layar perangkat mobile / tablet kecil

export interface SmartScreenMetrics {
  mode: ScreenWindowMode
  modeLabel: string
  viewportWidth: number
  viewportHeight: number
  screenWidth: number
  screenHeight: number
  widthRatio: number
  heightRatio: number
  areaRatio: number
  isSplitScreen: boolean
  isQuadSplit: boolean
  isHorizontalSplit: boolean
  isVerticalSplit: boolean
  isCompactViewport: boolean
  isShortViewport: boolean
  osPlatform: string
}

const DEFAULT_METRICS: SmartScreenMetrics = {
  mode: 'fullscreen',
  modeLabel: 'Layar Penuh',
  viewportWidth: 1920,
  viewportHeight: 1080,
  screenWidth: 1920,
  screenHeight: 1080,
  widthRatio: 1,
  heightRatio: 1,
  areaRatio: 1,
  isSplitScreen: false,
  isQuadSplit: false,
  isHorizontalSplit: false,
  isVerticalSplit: false,
  isCompactViewport: false,
  isShortViewport: false,
  osPlatform: 'Desktop',
}

const SmartViewportContext = createContext<SmartScreenMetrics>(DEFAULT_METRICS)

export function useSmartViewport(): SmartScreenMetrics {
  return useContext(SmartViewportContext)
}

function detectOSPlatform(): string {
  if (typeof window === 'undefined') return 'Desktop'
  const ua = window.navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)) {
    return 'iOS / iPadOS'
  }
  if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macOS'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('win')) return 'Windows'
  if (ua.includes('cros')) return 'ChromeOS'
  if (ua.includes('linux')) return 'Linux'
  return 'Universal OS'
}

function computeScreenMetrics(): SmartScreenMetrics {
  if (typeof window === 'undefined') return DEFAULT_METRICS

  const vw = Math.max(1, Math.round(window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 1280))
  const vh = Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 720))

  // Gunakan availWidth / availHeight agar akurat terhadap taskbar/dock di Windows, macOS, Linux, Android, iOS
  const rawAvailW = window.screen?.availWidth || window.screen?.width || vw
  const rawAvailH = window.screen?.availHeight || window.screen?.height || vh

  const sw = Math.max(vw, rawAvailW)
  const sh = Math.max(vh, rawAvailH)

  // Window outer dimensions membantu mendeteksi apakah jendela browser benar-benar di-snap (dibagi) oleh OS
  const outerW = window.outerWidth ? Math.min(sw, window.outerWidth) : vw
  const outerH = window.outerHeight ? Math.min(sh, window.outerHeight) : vh

  const widthRatio = Number(( Math.min(vw, outerW) / sw ).toFixed(2))
  const heightRatio = Number(( Math.min(vh, outerH) / sh ).toFixed(2))
  const areaRatio = Number(( widthRatio * heightRatio ).toFixed(2))

  const osPlatform = detectOSPlatform()
  const isMobileDevice = osPlatform === 'iOS / iPadOS' || osPlatform === 'Android'

  let mode: ScreenWindowMode = 'fullscreen'
  let modeLabel = 'Layar Penuh'

  // Deteksi pintar pembagian layar (Snap Assist Windows, macOS Split View, Tiling Linux, Tablet Multi-Window)
  if (isMobileDevice && sw < 768 && widthRatio > 0.85 && heightRatio > 0.75) {
    mode = 'mobile-compact'
    modeLabel = 'Layar Mobile Penuh'
  } else if (widthRatio <= 0.62 && heightRatio <= 0.65) {
    // Layar dibagi 4 jendela (Kuadran 2x2)
    mode = 'split-4-quadrant'
    modeLabel = '4 Jendela (Kuadran 1/4 Layar)'
  } else if (widthRatio <= 0.64 && heightRatio > 0.65) {
    // Layar dibagi 2 jendela kiri-kanan (50:50, 60:40, atau 1/3 layar)
    mode = 'split-2-horizontal'
    modeLabel = '2 Jendela (Split Kiri-Kanan)'
  } else if (widthRatio > 0.64 && heightRatio <= 0.62) {
    // Layar dibagi 2 jendela atas-bawah
    mode = 'split-2-vertical'
    modeLabel = '2 Jendela (Split Atas-Bawah)'
  } else if (widthRatio < 0.86 || heightRatio < 0.78) {
    // Jendela dikecilkan / floating window
    mode = 'floating-window'
    modeLabel = 'Jendela Mengambang'
  }

  const isQuadSplit = mode === 'split-4-quadrant'
  const isHorizontalSplit = mode === 'split-2-horizontal'
  const isVerticalSplit = mode === 'split-2-vertical'
  const isSplitScreen = isQuadSplit || isHorizontalSplit || isVerticalSplit || mode === 'floating-window'

  // Compact viewport aktif saat layar dibagi kiri-kanan, dibagi 4 kuadran, atau lebar efektif di bawah 1024px
  const isCompactViewport = isQuadSplit || isHorizontalSplit || vw < 1024
  // Short viewport aktif saat layar dibagi atas-bawah, dibagi 4 kuadran, atau tinggi efektif di bawah 620px
  const isShortViewport = isQuadSplit || isVerticalSplit || vh < 620

  return {
    mode,
    modeLabel,
    viewportWidth: vw,
    viewportHeight: vh,
    screenWidth: sw,
    screenHeight: sh,
    widthRatio,
    heightRatio,
    areaRatio,
    isSplitScreen,
    isQuadSplit,
    isHorizontalSplit,
    isVerticalSplit,
    isCompactViewport,
    isShortViewport,
    osPlatform,
  }
}

export default function SmartViewportProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SmartScreenMetrics>(DEFAULT_METRICS)

  const syncDomAttributes = useCallback((m: SmartScreenMetrics) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.setAttribute('data-window-mode', m.mode)
    root.setAttribute('data-split-screen', m.isSplitScreen ? 'true' : 'false')
    root.setAttribute('data-compact-viewport', m.isCompactViewport ? 'true' : 'false')
    root.setAttribute('data-short-viewport', m.isShortViewport ? 'true' : 'false')
    root.setAttribute('data-os-platform', m.osPlatform)
    root.style.setProperty('--smart-vw', `${m.viewportWidth}px`)
    root.style.setProperty('--smart-vh', `${m.viewportHeight}px`)
    root.style.setProperty('--smart-w-ratio', String(m.widthRatio))
    root.style.setProperty('--smart-h-ratio', String(m.heightRatio))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafId: number | null = null

    const updateMetrics = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const next = computeScreenMetrics()
        syncDomAttributes(next)
        setMetrics((prev) => {
          if (
            prev.mode === next.mode &&
            Math.abs(prev.viewportWidth - next.viewportWidth) < 4 &&
            Math.abs(prev.viewportHeight - next.viewportHeight) < 4 &&
            prev.isCompactViewport === next.isCompactViewport &&
            prev.isShortViewport === next.isShortViewport
          ) {
            return prev
          }
          return next
        })
      })
    }

    updateMetrics()

    window.addEventListener('resize', updateMetrics, { passive: true })
    window.addEventListener('orientationchange', updateMetrics, { passive: true })
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateMetrics, { passive: true })
    }

    // Polling ringan setiap 1.5 detik untuk menangkap pemindahan jendela antar monitor / OS Snap tanpa memicu resize standar
    const pollInterval = window.setInterval(updateMetrics, 1500)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateMetrics)
      window.removeEventListener('orientationchange', updateMetrics)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateMetrics)
      }
      window.clearInterval(pollInterval)
    }
  }, [syncDomAttributes])

  return (
    <SmartViewportContext.Provider value={metrics}>
      {children}
    </SmartViewportContext.Provider>
  )
}
