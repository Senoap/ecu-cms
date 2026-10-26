// app/admin/audit-log/AuditLogClient.tsx
'use client'

import { useState, useMemo, useRef } from 'react'
import type { AuditLogItem, DailyVisitorCount } from '@/lib/db'
import {
  FileText,
  Download,
  Globe,
  Search,
  BarChart3,
  TrendingUp,
  Layers,
  Compass,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown
} from 'lucide-react'

type CategoryFilter = 'all' | 'system' | 'career' | 'compro' | 'visitor'
type TimeFilter = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type ChartType = 'bar' | 'area'

interface AuditLogClientProps {
  initialLogs: AuditLogItem[]
  dailyVisitors?: DailyVisitorCount[]
  isPrivilegedAdmin?: boolean
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

export default function AuditLogClient({ initialLogs, dailyVisitors = [], isPrivilegedAdmin = false }: AuditLogClientProps) {
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
    const map = new Map<string, { count: number; paths?: Record<string, number> }>()
    for (const v of dailyVisitors) {
      if (v.date) {
        // Filter jalur agar hanya halaman web compro yang diperhitungkan
        const cleanPaths: Record<string, number> = {}
        let sumHits = 0
        if (v.paths) {
          for (const [p, c] of Object.entries(v.paths)) {
            const norm = p.toLowerCase()
            if (!norm.startsWith('/login') && !norm.startsWith('/admin') && !norm.startsWith('/cms') && !norm.startsWith('/api') && !norm.includes('.')) {
              cleanPaths[p] = c
              sumHits += c
            }
          }
        }
        const hasCleanPaths = Object.keys(cleanPaths).length > 0
        map.set(v.date, {
          count: hasCleanPaths ? sumHits : (v.paths ? sumHits : v.count),
          paths: hasCleanPaths ? cleanPaths : undefined
        })
      }
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

  // Filter untuk log aktivitas (bukan visitor)
  const filteredLogs = useMemo(() => {
    const now = new Date()
    return initialLogs.filter((log) => {
      const cat = log.category || 'system'
      if (!isPrivilegedAdmin && cat === 'system') {
        return false
      }
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
  }, [initialLogs, categoryFilter, timeFilter, searchTerm, isPrivilegedAdmin])

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

      {/* HEADER & FILTER TOOLBAR - TIDAK TERSCROLL (STICKY TOP-0) */}
      <div className="sticky top-0 z-30 bg-[#F4F6F9] dark:bg-[#0C0D12] -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 pt-4 sm:pt-6 md:pt-8 pb-4 space-y-4 transition-colors">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Audit Log
            </h1>
          </div>

          {/* Tombol Ekspor TXT - Hanya tampil jika BUKAN tab Pengunjung Web */}
          {categoryFilter !== 'visitor' && (
            <div className="shrink-0">
              <a
                href="/api/admin/audit-log/download"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Log (.txt)</span>
              </a>
            </div>
          )}
        </div>

        {/* Filter Terpadu */}
        <div className="bg-white dark:bg-[#10131C] p-3 rounded-2xl border border-gray-200 dark:border-gray-800/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
          <div className="flex items-center gap-3 shrink-0">
            {/* Dropdown Kategori */}
            <div className="relative w-full sm:w-auto min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                aria-label="Filter Kategori"
                className="w-full appearance-none bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl pl-3.5 pr-9 py-2 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {isPrivilegedAdmin && (
                  <option value="system">Perubahan CMS</option>
                )}
                <option value="career">Lamaran &amp; Karir</option>
                <option value="compro">Permintaan Compro</option>
                <option value="visitor">Pengunjung Web</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {categoryFilter === 'visitor' ? (
            /* Nomor 2 & Total Pengunjung dalam 1 baris bersama Nomor 1 */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto justify-end">
              {/* Toggle Tipe Grafik: Bar / Area (Nomor 2) */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#090A0F] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-black dark:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800'
                  }`}
                >
                  <BarChart3 className={`w-3.5 h-3.5 ${chartType === 'bar' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span>Diagram Batang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-black dark:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800'
                  }`}
                >
                  <TrendingUp className={`w-3.5 h-3.5 ${chartType === 'area' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span>Garis Kurva</span>
                </button>
              </div>

              {/* Total Pengunjung 1 Bulan Terakhir */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800/80 shadow-xs">
                <div className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-black dark:text-white">
                    Total Pengunjung (1 Bulan Terakhir):
                  </span>
                  <span className="text-sm font-black text-black dark:text-white">
                    {analytics.totalHits}
                  </span>
                  <span className="text-xs font-bold text-black dark:text-white font-sans">
                    hits
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
              {/* Dropdown Rentang Waktu */}
              <div className="relative w-full sm:w-auto min-w-[160px]">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  aria-label="Filter Rentang Waktu"
                  className="w-full appearance-none bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl pl-3.5 pr-9 py-2 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-inner cursor-pointer"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="daily">Hari Ini</option>
                  <option value="weekly">7 Hari Terakhir</option>
                  <option value="monthly">Bulan Ini</option>
                  <option value="yearly">Tahun Ini</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Kolom Pencarian (Search Input) */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari aktivitas atau pengguna..."
                  className="w-full bg-gray-50 dark:bg-[#090A0F] border border-gray-300 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 shadow-inner font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN GRAFIK TAB PENGUNJUNG: 30 HARI BERGULIR (RINGKAS & TIDAK PANJANG) */}
      {/* ========================================================================= */}
      {categoryFilter === 'visitor' ? (
        <div className="space-y-6">

          {/* ========================================================================= */}
          {/* CARD GRAFIK TREN PENGUNJUNG INTERAKTIF (BAR / AREA)                       */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">

            {/* Panel Inspeksi Detail Tanggal Aktif / Diarahkan */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#090A0F] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${activeDay.isToday
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-black'
                    : activeDay.count > 0
                      ? 'bg-gray-800 text-white dark:bg-gray-700 dark:text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                  }`}>
                  {activeDay.shortLabel}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-black dark:text-white">
                      {activeDay.fullDateLabel}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="text-xs font-bold text-black dark:text-white">
                      {activeDay.relativeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-black dark:text-white mt-0.5">
                    Total Kunjungan: <b className="text-black dark:text-white font-black text-sm">{activeDay.count}</b> hits
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
                      {path === '/' ? 'Home (/)' : path}: <b className="text-black dark:text-white font-bold">{pCount}</b>
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
                          className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 ${isSelected
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
                    <path d={svgData.areaPath} fill="#2563eb" fillOpacity="0.12" />

                    {/* Garis Kurva Solid */}
                    <path
                      d={svgData.linePath}
                      fill="none"
                      stroke="#2563eb"
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
                            className={`transition-all duration-200 ${isSelected
                                ? 'fill-white stroke-blue-600 stroke-[3.5px]'
                                : pt.day.isToday
                                  ? 'fill-gray-900 stroke-gray-700 stroke-2 dark:fill-white dark:stroke-gray-300'
                                  : pt.day.count > 0
                                    ? 'fill-blue-500'
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
                <span className="font-extrabold text-black dark:text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
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
                  <Compass className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-sans font-bold">#{idx + 1}</span>
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
                  <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Sistem Buffer Retensi 30 Hari
                  </h3>
                </div>
                <span className="text-xs font-bold text-black dark:text-white">
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
                  <span className="font-extrabold text-black dark:text-white">30 Hari Bergulir</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-gray-600 dark:text-gray-400">Mekanisme Overwrite</span>
                  <span className="font-extrabold text-black dark:text-white">Otomatis FIFO (H-31 tertimpa)</span>
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

          {/* Daftar Log Peristiwa (CMS, Karir, Compro) */}
          <div ref={listRef} className="bg-white dark:bg-[#10131C] p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Riwayat Aktivitas ({filteredLogs.length})</span>
                </h2>
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
                      className={`px-3 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${pageSize === size
                          ? 'bg-white dark:bg-[#10131C] text-black dark:text-white font-black shadow-xs border border-gray-300 dark:border-gray-700'
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

            {/* TABEL AUDIT LOG TERPADU */}
            <div className="overflow-x-auto overflow-y-auto overscroll-contain max-h-[540px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#090A0F] shadow-xs custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] border-b border-gray-200 dark:border-gray-800 shadow-xs">
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#090A0F] text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
                    <th scope="col" className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] py-3 px-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-800">Waktu</th>
                    <th scope="col" className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] py-3 px-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-800">Tipe</th>
                    <th scope="col" className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] py-3 px-4 border-b border-gray-200 dark:border-gray-800">Aktivitas</th>
                    <th scope="col" className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] py-3 px-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-800">Pengguna</th>
                    <th scope="col" className="sticky top-0 z-10 bg-gray-50 dark:bg-[#090A0F] py-3 px-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-800">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/70">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="space-y-2">
                          <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto stroke-[1.5]" />
                          <p className="text-sm font-bold text-black dark:text-white">Tidak ada catatan audit yang cocok</p>
                          <p className="text-xs text-black dark:text-white">Coba ubah kata kunci pencarian, filter kategori, atau rentang waktu di atas.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })

                      const cleanMessage = log.message
                        ? log.message
                            .replace(/\s*dari IP:\s*([a-f\d:.]+|\[[a-f\d:.]+\])(\.|\s|$)/i, (match, ip, p) => (p === '.' || !p ? '.' : ' '))
                            .replace(/\s*dari IP:\s*[^.]+\.?/i, '.')
                            .replace(/\s+/g, ' ')
                            .replace(/\s+\./g, '.')
                            .replace(/\.\.+$/, '.')
                            .trim()
                        : ''

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40 transition-colors"
                        >
                          {/* Waktu */}
                          <td className="py-3 px-4 whitespace-nowrap text-black dark:text-white font-mono text-[11px] align-top">
                            {dateStr}
                          </td>

                          {/* Tipe */}
                          <td className="py-3 px-4 whitespace-nowrap align-top">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700">
                              {log.type || (log.category ? log.category.toUpperCase() : 'INFO')}
                            </span>
                          </td>

                          {/* Aktivitas */}
                          <td className="py-3 px-4 text-xs text-black dark:text-white leading-relaxed font-normal align-top">
                            {cleanMessage}
                          </td>

                          {/* Pengguna */}
                          <td className="py-3 px-4 whitespace-nowrap align-top">
                            <span className="font-bold text-black dark:text-white">
                              {log.userName || 'Sistem'}
                            </span>
                          </td>

                          {/* Alamat IP */}
                          <td className="py-3 px-4 whitespace-nowrap align-top">
                            <span className="font-mono text-[11px] text-black dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200/60 dark:border-gray-700/60">
                              {log.ip || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredLogs.length > 0 && (
              <div className="pt-5 border-t border-gray-200 dark:border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Info range item */}
                <div className="text-xs text-black dark:text-white font-medium">
                  Menampilkan <span className="font-extrabold text-black dark:text-white">{startIndex + 1}</span> - <span className="font-extrabold text-black dark:text-white">{endIndex}</span> dari <span className="font-extrabold text-black dark:text-white">{filteredLogs.length}</span> aktivitas
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-400">
                      (Halaman <b className="text-black dark:text-white">{activePage}</b> dari {totalPages})
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
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${activePage <= 1
                          ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                          : 'bg-white dark:bg-[#10131C] text-black dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
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
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activePage <= 1
                        ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                        : 'bg-white dark:bg-[#10131C] text-black dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
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
                        className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCurrent
                            ? 'bg-blue-600 text-white shadow-md font-black shadow-blue-500/20'
                            : 'bg-gray-100 dark:bg-gray-800/60 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
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
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${activePage >= totalPages
                        ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/20 cursor-pointer'
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
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${activePage >= totalPages
                          ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800/40 text-gray-400 border-gray-200 dark:border-gray-800'
                          : 'bg-white dark:bg-[#10131C] text-black dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs'
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