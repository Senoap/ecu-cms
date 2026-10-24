// app/admin/audit-log/AuditLogClient.tsx
'use client'

import { useState, useMemo, useRef } from 'react'
import type { AuditLogItem, DailyVisitorCount } from '@/lib/db'
import { 
  FileText, 
  Download, 
  Globe, 
  Briefcase, 
  FileDown, 
  Shield, 
  Clock, 
  Search,
  Activity,
  BarChart3,
  TrendingUp,
  Layers,
  Calendar,
  Compass,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

type CategoryFilter = 'all' | 'system' | 'visitor' | 'career' | 'compro'
type TimeFilter = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type ChartType = 'bar' | 'area'

interface AuditLogClientProps {
  initialLogs: AuditLogItem[]
  dailyVisitors?: DailyVisitorCount[]
}

interface TimelineDay {
  date: string // YYYY-MM-DD
  dayLabel: string // '21 Okt'
  fullDateLabel: string // 'Rabu, 21 Oktober 2026'
  shortLabel: string // '21'
  count: number
  paths?: Record<string, number>
  isToday: boolean
  relativeLabel: string
}

function formatIndonesianDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getRelativeDateLabel(diffDays: number, isToday: boolean) {
  if (isToday) return 'Hari Ini'
  if (diffDays === 1) return 'Kemarin'
  return `${diffDays} hari lalu`
}

function buildSvgPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cx = (prev.x + curr.x) / 2
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
}

function buildAreaPath(points: Array<{ x: number; y: number }>, baseHeight: number) {
  if (points.length === 0) return ''
  const lineD = buildSvgPath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${lineD} L ${last.x} ${baseHeight} L ${first.x} ${baseHeight} Z`
}

export default function AuditLogClient({ initialLogs, dailyVisitors = [] }: AuditLogClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')

  // Tanggal hari ini di Indonesia (Asia/Jakarta)
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  }, [])

  // Buat 30 hari linier berkelanjutan (dari H-29 sampai Hari Ini)
  const timeline30Days = useMemo(() => {
    const map = new Map<string, DailyVisitorCount>()
    for (const v of dailyVisitors) {
      map.set(v.date, v)
    }

    const [y, m, d] = todayStr.split('-').map(Number)
    const todayDate = new Date(y, m - 1, d)

    const result: TimelineDay[] = []
    for (let i = 29; i >= 0; i--) {
      const curr = new Date(todayDate)
      curr.setDate(todayDate.getDate() - i)
      const yr = curr.getFullYear()
      const mo = String(curr.getMonth() + 1).padStart(2, '0')
      const dy = String(curr.getDate()).padStart(2, '0')
      const dateStr = `${yr}-${mo}-${dy}`
      const entry = map.get(dateStr)

      const isToday = i === 0
      const monthShort = curr.toLocaleDateString('id-ID', { month: 'short' })

      result.push({
        date: dateStr,
        dayLabel: `${dy} ${monthShort}`,
        fullDateLabel: formatIndonesianDate(dateStr),
        shortLabel: dy,
        count: entry ? entry.count : 0,
        paths: entry ? entry.paths : undefined,
        isToday,
        relativeLabel: getRelativeDateLabel(i, isToday),
      })
    }
    return result
  }, [dailyVisitors, todayStr])

  // State hari terpilih untuk inspeksi grafik (default: Hari Ini)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  const activeDay = useMemo(() => {
    return timeline30Days.find((d) => d.date === selectedDate) || timeline30Days[timeline30Days.length - 1]
  }, [timeline30Days, selectedDate])

  // Metrik dan agregasi analitik 30 hari
  const analytics = useMemo(() => {
    const totalHits = timeline30Days.reduce((acc, v) => acc + (v.count || 0), 0)
    const todayHits = timeline30Days[timeline30Days.length - 1]?.count || 0
    const rawMax = timeline30Days.reduce((m, v) => Math.max(m, v.count || 0), 0)
    const maxScale = Math.max(rawMax, 5) // Minimal scale 5 agar bar proporsional dan tidak divide by 0
    const avgHits = Math.round(totalHits / 30)

    // Cari hari puncak (peak day)
    let peakDay = timeline30Days[0]
    for (const d of timeline30Days) {
      if (d.count > (peakDay?.count || 0)) {
        peakDay = d
      }
    }

    // Agregasi top paths
    const pathMap: Record<string, number> = {}
    for (const d of timeline30Days) {
      if (d.paths) {
        for (const [p, c] of Object.entries(d.paths)) {
          pathMap[p] = (pathMap[p] || 0) + c
        }
      }
    }
    const topPaths = Object.entries(pathMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const activeDaysCount = timeline30Days.filter((d) => d.count > 0).length

    return { totalHits, todayHits, rawMax, maxScale, avgHits, peakDay, topPaths, activeDaysCount }
  }, [timeline30Days])

  // Koordinat SVG untuk diagram kurva area
  const svgData = useMemo(() => {
    const width = 1000
    const height = 240
    const paddingX = 20
    const paddingY = 30
    const chartW = width - paddingX * 2
    const chartH = height - paddingY * 2

    const points = timeline30Days.map((d, idx) => {
      const x = paddingX + (idx / 29) * chartW
      const normY = (d.count / analytics.maxScale) * chartH
      const y = height - paddingY - normY
      return { x, y, day: d }
    })

    const linePath = buildSvgPath(points)
    const areaPath = buildAreaPath(points, height - paddingY)
    const avgY = height - paddingY - (analytics.avgHits / analytics.maxScale) * chartH

    return { width, height, points, linePath, areaPath, avgY }
  }, [timeline30Days, analytics.maxScale, analytics.avgHits])

  // Hitung jumlah per kategori
  const counts = useMemo(() => {
    const res = { all: initialLogs.length, system: 0, visitor: analytics.totalHits, career: 0, compro: 0 }
    for (const l of initialLogs) {
      const cat = (l.category || 'system') as 'system' | 'visitor' | 'career' | 'compro'
      if (cat !== 'visitor') {
        if (res[cat] !== undefined) {
          res[cat]++
        } else {
          res.system++
        }
      }
    }
    return res
  }, [initialLogs, analytics.totalHits])

  // Filter untuk log aktivitas (bukan visitor)
  const filteredLogs = useMemo(() => {
    const now = new Date()
    return initialLogs.filter((log) => {
      const cat = log.category || 'system'
      if (categoryFilter !== 'all' && cat !== categoryFilter) {
        return false
      }

      const logDate = new Date(log.timestamp)
      if (timeFilter === 'daily') {
        if (
          logDate.getDate() !== now.getDate() ||
          logDate.getMonth() !== now.getMonth() ||
          logDate.getFullYear() !== now.getFullYear()
        ) {
          return false
        }
      } else if (timeFilter === 'weekly') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24)
        if (diffDays > 7) return false
      } else if (timeFilter === 'monthly') {
        if (
          logDate.getMonth() !== now.getMonth() ||
          logDate.getFullYear() !== now.getFullYear()
        ) {
          return false
        }
      } else if (timeFilter === 'yearly') {
        if (logDate.getFullYear() !== now.getFullYear()) return false
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matches = 
          log.message.toLowerCase().includes(term) ||
          log.type.toLowerCase().includes(term) ||
          (log.userName && log.userName.toLowerCase().includes(term)) ||
          (log.userRole && log.userRole.toLowerCase().includes(term)) ||
          (log.ip && log.ip.toLowerCase().includes(term))
        if (!matches) return false
      }

      return true
    })
  }, [initialLogs, categoryFilter, timeFilter, searchTerm])

  // Pagination State (5, 25, 50 item per halaman)
  const [pageSize, setPageSize] = useState<number>(25)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset ke halaman 1 saat filter, pencarian, atau pageSize berubah (React pattern tanpa effect)
  const [prevFilterKey, setPrevFilterKey] = useState('')
  const currentFilterKey = `${categoryFilter}-${timeFilter}-${searchTerm}-${pageSize}`
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)

  const startIndex = (activePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredLogs.length)

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, startIndex + pageSize)
  }, [filteredLogs, startIndex, pageSize])

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    setCurrentPage(validPage)
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (activePage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (activePage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Audit Log Terpadu
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Rekaman terpisah untuk riwayat perubahan CMS, grafik tren pengunjung 30 hari, lamaran karir, dan permintaan company profile.
          </p>
        </div>

        {/* Tombol Ekspor TXT */}
        <div className="shrink-0">
          <a
            href="/api/admin/audit-log/download"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Log (.txt)</span>
          </a>
        </div>
      </div>

      {/* Info Banner Retensi 90 Hari (Event Log) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div className="space-y-0.5">
          <p className="font-bold">Otomasi Retensi 90 Hari & Skema Pencadangan Teks Aktif</p>
          <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
            Catatan log perubahan yang melewati 90 hari otomatis dicadangkan ke berkas teks terstruktur di folder <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">data/backups/audit_backup_*.txt</code> dan dipangkas dari basis data aktif untuk menjaga kecepatan sistem.
          </p>
        </div>
      </div>

      {/* Tab Kategori (Perubahan, Pengunjung, Lamaran, Permintaan Compro) */}
      <div className="bg-white dark:bg-[#10131C] p-4 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {([
            { id: 'all', label: 'Semua Kategori', icon: Shield, count: counts.all, badgeSuffix: '' },
            { id: 'system', label: 'Perubahan CMS', icon: FileText, count: counts.system, badgeSuffix: '' },
            { id: 'visitor', label: 'Pengunjung Web', icon: Globe, count: counts.visitor, badgeSuffix: ' hits' },
            { id: 'career', label: 'Log Karir & Lamaran', icon: Briefcase, count: counts.career, badgeSuffix: '' },
            { id: 'compro', label: 'Permintaan Compro', icon: FileDown, count: counts.compro, badgeSuffix: '' },
          ] as const).map((tab) => {
            const Icon = tab.icon
            const active = categoryFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border text-center ${
                  active
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40'
                    : 'bg-gray-50 dark:bg-[#090A0F] text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{tab.label}</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  active ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  ({tab.count}{tab.badgeSuffix})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN GRAFIK TAB PENGUNJUNG: 30 HARI BERGULIR (RINGKAS & TIDAK PANJANG) */}
      {/* ========================================================================= */}
      {categoryFilter === 'visitor' ? (
        <div className="space-y-6">
          {/* Kartu Statistik Cepat */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Hits 30 Hari */}
            <div className="bg-white dark:bg-[#10131C] p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Kunjungan</span>
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {analytics.totalHits}
                <span className="text-xs font-bold text-gray-500 ml-1.5 font-sans">hits</span>
              </div>
              <p className="text-[11px] text-gray-500">Rentang 30 hari terakhir</p>
            </div>

            {/* Hits Hari Ini */}
            <div className="bg-white dark:bg-[#10131C] p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Hari Ini</span>
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics.todayHits}
                <span className="text-xs font-bold text-gray-500 ml-1.5 font-sans">hits</span>
              </div>
              <p className="text-[11px] text-gray-500">{todayStr}</p>
            </div>

            {/* Rata-Rata Kunjungan */}
            <div className="bg-white dark:bg-[#10131C] p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Rata-Rata</span>
                <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {analytics.avgHits}
                <span className="text-xs font-bold text-gray-500 ml-1.5 font-sans">hits/hari</span>
              </div>
              <p className="text-[11px] text-gray-500">Standar performa 30 hari</p>
            </div>

            {/* Hari Puncak */}
            <div className="bg-white dark:bg-[#10131C] p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Puncak Kunjungan</span>
                <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                {analytics.rawMax}
                <span className="text-xs font-bold text-gray-500 ml-1.5 font-sans">hits</span>
              </div>
              <p className="text-[11px] text-gray-500">{analytics.peakDay ? analytics.peakDay.dayLabel : '-'}</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD GRAFIK TREN PENGUNJUNG INTERAKTIF (BAR / AREA)                       */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">
            
            {/* Header Grafik & Switch Tampilan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                    Grafik Kunjungan 30 Hari Terakhir
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1 pl-8">
                  Periode: <span className="font-bold text-gray-700 dark:text-gray-300">{timeline30Days[0]?.dayLabel}</span> s/d <span className="font-bold text-cyan-600 dark:text-cyan-400">{timeline30Days[29]?.dayLabel} (Hari Ini)</span>
                </p>
              </div>

              {/* Toggle Tipe Grafik: Bar / Area */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#090A0F] p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Diagram Batang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Garis Kurva</span>
                </button>
              </div>
            </div>

            {/* Panel Inspeksi Detail Tanggal Aktif / Diarahkan */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${
                  activeDay.isToday 
                    ? 'bg-emerald-500 text-white' 
                    : activeDay.count > 0 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                }`}>
                  {activeDay.shortLabel}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {activeDay.fullDateLabel}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className={`text-xs font-bold ${
                      activeDay.isToday
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {activeDay.relativeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Total Kunjungan: <b className="text-cyan-600 dark:text-cyan-400 font-black text-sm">{activeDay.count}</b> hits
                  </p>
                </div>
              </div>

              {/* Rincian Jalur / Halaman Populer di Hari Terpilih */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {activeDay.paths && Object.keys(activeDay.paths).length > 0 ? (
                  Object.entries(activeDay.paths).slice(0, 3).map(([path, pCount], idx) => (
                    <span 
                      key={path}
                      className="font-mono font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {idx > 0 && <span className="text-gray-300 dark:text-gray-700 mr-2">|</span>}
                      {path === '/' ? 'Home (/)' : path}: <b className="text-cyan-600 dark:text-cyan-400">{pCount}</b>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-gray-400 italic">
                    {activeDay.count === 0 ? 'Belum ada kunjungan pada tanggal ini' : 'Semua kunjungan tercatat'}
                  </span>
                )}
              </div>
            </div>

            {/* Kanvas Grafik Utama */}
            <div className="relative pt-4 pb-2">
              
              {/* Garis Panduan Grid Sumbu Y */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-gray-400 pl-1 pb-6">
                <div className="border-b border-dashed border-gray-200 dark:border-gray-800/80 w-full flex justify-between pr-2">
                  <span>Maks: {analytics.rawMax}</span>
                </div>
                <div className="border-b border-dashed border-gray-200 dark:border-gray-800/80 w-full flex justify-between pr-2">
                  <span>{Math.round(analytics.maxScale / 2)}</span>
                </div>
                <div className="border-b border-gray-200 dark:border-gray-800 w-full flex justify-between pr-2">
                  <span>0</span>
                </div>
              </div>

              {/* ==================== TAMPILAN 1: DIAGRAM BATANG (BARS) ==================== */}
              {chartType === 'bar' && (
                <div className="h-60 sm:h-72 flex items-end justify-between gap-1 sm:gap-1.5 px-6 pt-4 relative z-10">
                  {timeline30Days.map((d) => {
                    const heightPercent = Math.max(
                      d.count > 0 ? (d.count / analytics.maxScale) * 100 : 3,
                      3
                    )
                    const isSelected = d.date === activeDay.date

                    return (
                      <div
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        onMouseEnter={() => setSelectedDate(d.date)}
                        className="group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer"
                      >
                        {/* Tooltip Hover Mengambang Mini */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">
                          {d.dayLabel}: {d.count} hits
                        </div>

                        {/* Batang Kolom */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 ${
                            isSelected
                              ? 'bg-blue-600 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-[#10131C] shadow-md'
                              : d.isToday
                                ? 'bg-emerald-600'
                                : d.count > 0
                                  ? 'bg-blue-500/80 hover:bg-blue-600'
                                  : 'bg-gray-200 dark:bg-gray-800/80 hover:bg-gray-300 dark:hover:bg-gray-700'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ==================== TAMPILAN 2: GARIS KURVA AREA (SVG) ==================== */}
              {chartType === 'area' && (
                <div className="h-60 sm:h-72 px-2 pt-4 relative z-10">
                  <svg
                    viewBox={`0 0 ${svgData.width} ${svgData.height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Area Mengambang Solid Transparan */}
                    <path d={svgData.areaPath} fill="#0284c7" fillOpacity="0.12" />

                    {/* Garis Kurva Solid */}
                    <path
                      d={svgData.linePath}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Node Titik Tanggal */}
                    {svgData.points.map((pt) => {
                      const isSelected = pt.day.date === activeDay.date
                      return (
                        <g 
                          key={pt.day.date}
                          onClick={() => setSelectedDate(pt.day.date)}
                          onMouseEnter={() => setSelectedDate(pt.day.date)}
                          className="cursor-pointer"
                        >
                          {/* Area Hit Sentuh Lebih Luas */}
                          <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                          {/* Titik Visual */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? 6 : pt.day.count > 0 ? 3.5 : 2}
                            className={`transition-all duration-200 ${
                              isSelected
                                ? 'fill-white stroke-cyan-500 stroke-[3.5px]'
                                : pt.day.isToday
                                  ? 'fill-emerald-400 stroke-emerald-600 stroke-2'
                                  : pt.day.count > 0
                                    ? 'fill-cyan-400'
                                    : 'fill-gray-400/60 dark:fill-gray-600'
                            }`}
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>
              )}

              {/* Label Sumbu X (Tanggal Setiap 5 Hari + Hari Ini) */}
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 dark:text-gray-400 px-6 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>{timeline30Days[0]?.dayLabel}</span>
                <span className="hidden sm:inline">{timeline30Days[7]?.dayLabel}</span>
                <span className="hidden sm:inline">{timeline30Days[14]?.dayLabel}</span>
                <span className="hidden sm:inline">{timeline30Days[21]?.dayLabel}</span>
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {timeline30Days[29]?.dayLabel} (Hari Ini)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center italic">
              Arahkan kursor atau sentuh kolom batang / titik tanggal untuk melihat rincian kunjungan per halaman.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* RANGKUMAN HALAMAN POPULER & KEPATUHAN BUFFER (KOMPAK & ELEGAN)            */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Halaman Paling Sering Dikunjungi */}
            <div className="bg-white dark:bg-[#10131C] p-6 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Top Halaman Dikunjungi (30 Hari)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-gray-500">Akumulatif</span>
              </div>

              {analytics.topPaths.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  Belum ada data halaman yang tercatat.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topPaths.map(([path, count], idx) => {
                    const pct = Math.round((count / Math.max(analytics.totalHits, 1)) * 100)
                    return (
                      <div key={path} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-mono">
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-sans">#{idx + 1}</span>
                            {path === '/' ? 'Beranda Utama (/)' : path}
                          </span>
                          <span className="text-gray-900 dark:text-white font-black">
                            {count} hits <span className="text-gray-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Status Retensi & Kesehatan Penyimpanan */}
            <div className="bg-white dark:bg-[#10131C] p-6 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Sistem Buffer Retensi 30 Hari
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Status Optimal
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-gray-600 dark:text-gray-400">Metode Penyimpanan</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">1 Counter Angka / Hari</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-gray-600 dark:text-gray-400">Maksimum Rentang Slot</span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400">30 Hari Bergulir</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-gray-600 dark:text-gray-400">Mekanisme Overwrite</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">Otomatis FIFO (H-31 tertimpa)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-600 dark:text-gray-400">Hari dengan Kunjungan Aktif</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">{analytics.activeDaysCount} dari 30 hari</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* Filter Waktu & Pencarian (Untuk Kategori Selain Visitor) */}
          <div className="bg-white dark:bg-[#10131C] p-6 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {([
                { id: 'all', label: 'Semua Waktu' },
                { id: 'daily', label: 'Hari Ini' },
                { id: 'weekly', label: '7 Hari Terakhir' },
                { id: 'monthly', label: 'Bulan Ini' },
                { id: 'yearly', label: 'Tahun Ini' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    timeFilter === tab.id
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-sm'
                      : 'bg-gray-100 dark:bg-[#090A0F] text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:text-gray-950 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari teks, IP, atau pengguna..."
                className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-2xl pl-9 pr-4 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Daftar Log Peristiwa (CMS, Karir, Compro) */}
          <div ref={listRef} className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-amber-600 dark:text-amber-500 tracking-wide uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <span>Riwayat Log Aktivitas ({filteredLogs.length})</span>
                </h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  • {categoryFilter === 'all' ? 'Seluruh Kategori' : categoryFilter.toUpperCase()}
                </span>
              </div>

              {/* Selector Jumlah Item per Halaman: 5, 25, 50 */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Baris:</span>
                <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-inner">
                  {([5, 25, 50] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPageSize(size)}
                      className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        pageSize === size
                          ? 'bg-white dark:bg-[#10131C] text-amber-600 dark:text-amber-400 shadow-sm border border-gray-200 dark:border-gray-700'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">/ hal</span>
              </div>
            </div>

            <div className="space-y-3">
              {paginatedLogs.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Tidak ada log yang sesuai.</p>
                  <p className="text-xs text-gray-500">Coba ubah filter kategori atau kata kunci pencarian Anda.</p>
                </div>
              ) : (
                paginatedLogs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })
                  
                  const cat = log.category || 'system'
                  const catColor = 
                    cat === 'career' ? 'text-purple-600 dark:text-purple-400' :
                    cat === 'compro' ? 'text-emerald-600 dark:text-emerald-400' :
                    'text-amber-600 dark:text-amber-400'

                  const catLabel = 
                    cat === 'career' ? 'Karir' :
                    cat === 'compro' ? 'Compro PDF' :
                    'Perubahan CMS'

                  return (
                    <div 
                      key={log.id} 
                      className="bg-gray-50 dark:bg-[#090A0F] p-4 rounded-2xl border border-gray-200 dark:border-gray-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-amber-500/30 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className={`font-bold ${catColor}`}>
                            {catLabel}
                          </span>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                            {log.type}
                          </span>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <span className="text-gray-500 dark:text-gray-400 font-medium">{dateStr}</span>
                          
                          {log.userName && (
                            <>
                              <span className="text-gray-300 dark:text-gray-700">|</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                Oleh: <strong className="text-amber-600 dark:text-amber-400">{log.userName}</strong>
                                {log.userRole ? ` (${log.userRole})` : ''}
                              </span>
                            </>
                          )}

                          {log.ip && (
                            <>
                              <span className="text-gray-300 dark:text-gray-700">|</span>
                              <span className="font-mono text-gray-500 dark:text-gray-400">
                                IP: {log.ip}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-900 dark:text-gray-200 font-medium leading-relaxed">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination Controls */}
            {filteredLogs.length > 0 && (
              <div className="pt-5 border-t border-gray-200 dark:border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Info range item */}
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Menampilkan <span className="font-extrabold text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-extrabold text-gray-900 dark:text-white">{endIndex}</span> dari <span className="font-extrabold text-gray-900 dark:text-white">{filteredLogs.length}</span> aktivitas
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-400">
                      (Halaman <b className="text-amber-600 dark:text-amber-400">{activePage}</b> dari {totalPages})
                    </span>
                  )}
                </div>

                {/* Navigasi Pagination */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Tombol Halaman Pertama (jika total halaman banyak) */}
                  {totalPages > 4 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(1)}
                      disabled={activePage <= 1}
                      title="Halaman Pertama"
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        activePage <= 1
                          ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                          : 'bg-white dark:bg-[#10131C] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
                      }`}
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Tombol Sebelumnya */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage <= 1}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      activePage <= 1
                        ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                        : 'bg-white dark:bg-[#10131C] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  {/* Nomor Halaman */}
                  {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400 font-bold select-none">
                          ...
                        </span>
                      )
                    }
                    const isCurrent = p === activePage
                    return (
                      <button
                        key={`page-${p}`}
                        type="button"
                        onClick={() => handlePageChange(p as number)}
                        className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 text-white shadow-md font-black shadow-amber-500/20'
                            : 'bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}

                  {/* Tombol Halaman Selanjutnya */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage >= totalPages}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      activePage >= totalPages
                        ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                        : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20 cursor-pointer'
                    }`}
                  >
                    <span>Halaman Selanjutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Tombol Halaman Terakhir (jika total halaman banyak) */}
                  {totalPages > 4 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={activePage >= totalPages}
                      title="Halaman Terakhir"
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        activePage >= totalPages
                          ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                          : 'bg-white dark:bg-[#10131C] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
                      }`}
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}