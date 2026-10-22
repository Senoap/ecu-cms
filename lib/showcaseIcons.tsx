// lib/showcaseIcons.tsx
import React from 'react'
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Lock,
  Key,
  Eye,
  Award,
  CheckCircle2,
  BadgeCheck,
  FileCheck,
  Star,
  Medal,
  Users,
  UserCheck,
  Briefcase,
  Handshake,
  HardHat,
  Zap,
  Clock,
  Timer,
  Activity,
  Flame,
  Building2,
  Factory,
  Store,
  Truck,
  GraduationCap,
  Wrench,
  Car,
  Sparkles,
  Scale,
  Target,
  Compass,
  BarChart3,
  TrendingUp,
  Globe,
  Phone,
  Headphones,
  HeartPulse,
  Layers,
  type LucideIcon
} from 'lucide-react'

export interface ShowcaseIconItem {
  id: string
  label: string
  category: 'security' | 'workforce' | 'facilities' | 'business' | 'service'
  icon: LucideIcon
}

export const SHOWCASE_ICON_OPTIONS: ShowcaseIconItem[] = [
  // Keamanan & Kepatuhan
  { id: 'ShieldCheck', label: 'Shield Check (Keamanan Resmi)', category: 'security', icon: ShieldCheck },
  { id: 'Shield', label: 'Shield (Perlindungan)', category: 'security', icon: Shield },
  { id: 'ShieldAlert', label: 'Shield Alert (Respons Bahaya)', category: 'security', icon: ShieldAlert },
  { id: 'Lock', label: 'Lock (Keamanan Ketat)', category: 'security', icon: Lock },
  { id: 'Key', label: 'Key (Akses Kontrol)', category: 'security', icon: Key },
  { id: 'Eye', label: 'Eye (Pengawasan 24/7)', category: 'security', icon: Eye },
  { id: 'Scale', label: 'Scale (Kepatuhan Hukum & Legalitas)', category: 'security', icon: Scale },
  { id: 'BadgeCheck', label: 'Badge Check (Legalitas BNSP)', category: 'security', icon: BadgeCheck },

  // Tenaga Kerja & Personel
  { id: 'Users', label: 'Users (Tim Karyawan / Manpower)', category: 'workforce', icon: Users },
  { id: 'UserCheck', label: 'User Check (Personel Terverifikasi)', category: 'workforce', icon: UserCheck },
  { id: 'Briefcase', label: 'Briefcase (Profesionalitas Kerja)', category: 'workforce', icon: Briefcase },
  { id: 'HardHat', label: 'Hard Hat (Keselamatan K3 Konstruksi)', category: 'workforce', icon: HardHat },
  { id: 'Handshake', label: 'Handshake (Kemitraan Terpercaya)', category: 'workforce', icon: Handshake },

  // Fasilitas & Industri
  { id: 'Building2', label: 'Building 2 (Gedung Perkantoran)', category: 'facilities', icon: Building2 },
  { id: 'Factory', label: 'Factory (Pabrik & Industri)', category: 'facilities', icon: Factory },
  { id: 'Store', label: 'Store (Mall & Komersial)', category: 'facilities', icon: Store },
  { id: 'Truck', label: 'Truck (Logistik & Distribusi)', category: 'facilities', icon: Truck },
  { id: 'GraduationCap', label: 'Graduation Cap (Institusi Pendidikan)', category: 'facilities', icon: GraduationCap },
  { id: 'Car', label: 'Car (Driver & Armada Transport)', category: 'facilities', icon: Car },
  { id: 'Wrench', label: 'Wrench (Teknisi & Maintenance)', category: 'facilities', icon: Wrench },
  { id: 'Sparkles', label: 'Sparkles (Kebersihan / Cleaning)', category: 'facilities', icon: Sparkles },

  // Kualitas & Prestasi
  { id: 'Award', label: 'Award (Sertifikasi & Penghargaan)', category: 'business', icon: Award },
  { id: 'CheckCircle2', label: 'Check Circle (Standar Terpenuhi)', category: 'business', icon: CheckCircle2 },
  { id: 'FileCheck', label: 'File Check (Dokumen Resmi Teruji)', category: 'business', icon: FileCheck },
  { id: 'Star', label: 'Star (Kualitas Unggul)', category: 'business', icon: Star },
  { id: 'Medal', label: 'Medal (Prestasi Kinerja)', category: 'business', icon: Medal },
  { id: 'Target', label: 'Target (Pencapaian SLA)', category: 'business', icon: Target },

  // Kecepatan & Operasional
  { id: 'Zap', label: 'Zap (Respons Cepat & Tanggap)', category: 'service', icon: Zap },
  { id: 'Clock', label: 'Clock (Disiplin Waktu 24 Jam)', category: 'service', icon: Clock },
  { id: 'Timer', label: 'Timer (Kecepatan Penanganan)', category: 'service', icon: Timer },
  { id: 'Activity', label: 'Activity (Kesehatan & Medis)', category: 'service', icon: Activity },
  { id: 'HeartPulse', label: 'Heart Pulse (Klinik & Fasilitas Medis)', category: 'service', icon: HeartPulse },
  { id: 'Flame', label: 'Flame (Energi & Semangat Kerja)', category: 'service', icon: Flame },
  { id: 'Phone', label: 'Phone (Layanan Hotline)', category: 'service', icon: Phone },
  { id: 'Headphones', label: 'Headphones (Customer Support)', category: 'service', icon: Headphones },
  { id: 'Globe', label: 'Globe (Jaringan Nasional)', category: 'service', icon: Globe },
  { id: 'BarChart3', label: 'Bar Chart (Analitik Performa)', category: 'service', icon: BarChart3 },
  { id: 'TrendingUp', label: 'Trending Up (Pertumbuhan Bisnis)', category: 'service', icon: TrendingUp },
  { id: 'Compass', label: 'Compass (Arah Strategis)', category: 'service', icon: Compass },
  { id: 'Layers', label: 'Layers (Layanan Terpadu)', category: 'service', icon: Layers }
]

// Map pencarian cepat (case-insensitive, strip symbols)
const registryMap: Record<string, LucideIcon> = {}
SHOWCASE_ICON_OPTIONS.forEach((item) => {
  registryMap[item.id.toLowerCase()] = item.icon
})

// Alias tambahan untuk fleksibilitas
registryMap['building'] = Building2
registryMap['checkcircle'] = CheckCircle2
registryMap['settings'] = Wrench
registryMap['hospital'] = Activity
registryMap['medical'] = HeartPulse
registryMap['security'] = ShieldCheck

export function getShowcaseIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return ShieldCheck
  const key = iconName.trim().toLowerCase().replace(/[-_\s]/g, '')
  return registryMap[key] || ShieldCheck
}

export function renderShowcaseIcon(iconStr?: string, className = 'w-4 h-4'): React.ReactNode {
  if (!iconStr) return <ShieldCheck className={className} />

  // Jika input berupa Emoji
  if (typeof iconStr === 'string' && /[\p{Extended_Pictographic}]/u.test(iconStr)) {
    return <span className={`inline-flex items-center justify-center leading-none ${className.includes('w-') ? 'text-sm' : ''}`}>{iconStr}</span>
  }

  const Component = getShowcaseIconComponent(iconStr)
  return <Component className={className} />
}
