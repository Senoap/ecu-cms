// lib/showcaseConstants.ts
export interface ShowcaseStrengthItem {
  icon: string
  title: string
  desc: string
}

export interface ShowcaseMetricItem {
  num: string
  label: string
  sub?: string
}

export interface ShowcaseSectorItem {
  icon: string
  name: string
}

export interface ShowcaseRoleItem {
  icon: string
  title: string
  tag: string
  desc: string
}

export interface HeroShowcaseConfig {
  enabled?: boolean
  liveBadgeText?: string
  strengths?: ShowcaseStrengthItem[]
  metrics?: ShowcaseMetricItem[]
  sectors?: ShowcaseSectorItem[]
  roles?: ShowcaseRoleItem[]
  ctaText?: string
  ctaLink?: string
  profileText?: string
  profileLink?: string
}

export const defaultHeroShowcase: HeroShowcaseConfig = {
  enabled: true,
  liveBadgeText: 'SISTEM AKTIF',
  strengths: [
    {
      icon: 'Zap',
      title: 'Respons Tanggap Cepat 24/7',
      desc: 'Penanganan insiden & pergantian personel darurat < 2 jam.'
    },
    {
      icon: 'Award',
      title: 'Personel Tersertifikasi Legal',
      desc: 'Tersertifikasi resmi BNSP dan dibekali pelatihan berkala.'
    },
    {
      icon: 'Users',
      title: 'Bebas Sengketa & Akuntabel',
      desc: 'Jaminan kepatuhan UU Ketenagakerjaan, BPJS, & payroll transparan.'
    },
    {
      icon: 'ShieldCheck',
      title: 'Budaya K3 & Zero-Accident',
      desc: 'Disiplin keselamatan kerja tinggi untuk perlindungan aset optimal.'
    }
  ],
  metrics: [
    {
      num: '15+',
      label: 'Tahun Pengalaman',
      sub: 'Pimpinan Teruji'
    },
    {
      num: '500+',
      label: 'Tenaga Siap Kerja',
      sub: 'Penempatan Cepat'
    },
    {
      num: '99.8%',
      label: 'Kepuasan Klien',
      sub: 'Pemenuhan SLA'
    },
    {
      num: '100%',
      label: 'Kepatuhan Legalitas',
      sub: 'Izin Kemenaker Resmi'
    }
  ],
  sectors: [
    { icon: 'Building2', name: 'Perkantoran Komersial' },
    { icon: 'Factory', name: 'Pabrik & Kawasan Industri' },
    { icon: 'Store', name: 'Mall & Pusat Perbelanjaan' },
    { icon: 'Activity', name: 'Rumah Sakit & Fasilitas Medis' },
    { icon: 'Truck', name: 'Pergudangan & Logistik' },
    { icon: 'GraduationCap', name: 'Institusi Pendidikan' }
  ],
  roles: [
    {
      icon: 'ShieldCheck',
      title: 'Satuan Pengamanan (Gada Pratama / Madya)',
      tag: 'Personel Tersertifikasi',
      desc: 'Perlindungan aset fisik & korporat berstandar regulasi'
    },
    {
      icon: 'Sparkles',
      title: 'Jasa Kebersihan & Manajemen Fasilitas',
      tag: 'Standar Higienis',
      desc: 'Perawatan gedung, kantor, dan fasilitas komersial prima'
    },
    {
      icon: 'Car',
      title: 'Pengemudi Profesional & Eksekutif',
      tag: 'Safety Driving',
      desc: 'Disiplin waktu, berlisensi, dan penguasaan rute handal'
    },
    {
      icon: 'Wrench',
      title: 'Operator Pabrik & Teknisi Pemeliharaan',
      tag: 'Siap Kerja',
      desc: 'Tenaga terampil siap dukung target operasional industri'
    }
  ],
  ctaText: 'Konsultasi Kebutuhan Mitra →',
  ctaLink: '#contact',
  profileText: 'Profil Perusahaan',
  profileLink: '#about'
}
