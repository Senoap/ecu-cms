// components/SmoothLoader.tsx
'use client'

interface SmoothLoaderProps {
  active: boolean
  loadingBgColor?: string
  primaryColor?: string
  secondaryColor?: string
  logoUrl?: string
  text?: string
}

export default function SmoothLoader({
  active,
  loadingBgColor,
  primaryColor = '#7E1D0C',
  secondaryColor = '#D4AF37',
  logoUrl,
  text = 'MEMUAT KONTEN...'
}: SmoothLoaderProps) {
  const bg = loadingBgColor || primaryColor || '#7E1D0C'

  return (
    <div
      aria-hidden={!active}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        active
          ? 'opacity-100 pointer-events-auto backdrop-blur-2xl scale-100'
          : 'opacity-0 pointer-events-none backdrop-blur-none scale-105'
      }`}
      style={{
        background: `radial-gradient(circle at center, ${bg}E6 0%, #090A0F 100%)`,
      }}
    >
      {/* Dynamic Ambient Glow Behind Spinner */}
      <div
        className="w-56 h-56 rounded-full blur-3xl opacity-30 absolute pointer-events-none animate-pulse"
        style={{ backgroundColor: secondaryColor }}
      />

      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
        {/* Dual-Orbit Glowing Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: `${secondaryColor}30`,
              borderTopColor: secondaryColor,
              animationDuration: '1.2s'
            }}
          />
          {/* Inner Reverse Ring */}
          <div
            className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin"
            style={{
              borderColor: `${primaryColor}40`,
              borderBottomColor: '#FFFFFF',
              animationDuration: '0.8s',
              animationDirection: 'reverse'
            }}
          />
          {/* Center Brand Emblem / Logo Sesuai Inputan */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg shadow-black/50 border border-white/20 overflow-hidden"
            style={{ backgroundColor: logoUrl ? '#FFFFFF' : primaryColor }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              'ESU'
            )}
          </div>
        </div>

        {/* Loading Text & Pulsing Dot */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-white text-xs sm:text-sm font-black tracking-[0.25em] uppercase drop-shadow-md">
              {text}
            </span>
          </div>

          {/* Sleek Progress Shimmer Line */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full rounded-full animate-pulse"
              style={{
                width: '60%',
                backgroundColor: secondaryColor,
                boxShadow: `0 0 10px ${secondaryColor}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
