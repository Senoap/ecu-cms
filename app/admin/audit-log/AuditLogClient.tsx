// app/admin/audit-log/AuditLogClient.tsx
'use client'
import { useState, useMemo } from 'react'

interface AuditLogItem {
  id: string
  message: string
  timestamp: number
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEPLOY'
}

export default function AuditLogClient({ initialLogs }: { initialLogs: AuditLogItem[] }) {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = useMemo(() => {
    const now = new Date()
    return initialLogs.filter((log) => {
      const logDate = new Date(log.timestamp)

      // Pencarian keyword teks
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.type.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false

      if (filter === 'daily') {
        return (
          logDate.getDate() === now.getDate() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        )
      } else if (filter === 'weekly') {
        const diffTime = now.getTime() - logDate.getTime()
        const diffDays = diffTime / (1000 * 3600 * 24)
        return diffDays <= 7
      } else if (filter === 'monthly') {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        )
      } else if (filter === 'yearly') {
        return logDate.getFullYear() === now.getFullYear()
      }

      return true
    })
  }, [initialLogs, filter, searchTerm])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      
      {/* Header Banner */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
            <span>📜 System Activity</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Audit Log Aktivitas CMS</h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium">Rekaman riwayat seluruh kegiatan perubahan dan manipulasi data korporat.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#10131C] p-6 rounded-3xl border border-gray-800/80 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'daily', label: 'Harian' },
            { id: 'weekly', label: 'Mingguan' },
            { id: 'monthly', label: 'Bulanan' },
            { id: 'yearly', label: 'Tahunan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filter === tab.id
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50'
                  : 'bg-[#090A0F] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari log aktivitas..."
          className="w-full md:w-72 bg-[#090A0F] border border-gray-800 rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 shadow-inner font-medium"
        />
      </div>

      {/* Daftar Log */}
      <div className="bg-[#10131C] p-8 rounded-3xl border border-gray-800/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-base font-black text-amber-500 tracking-wide uppercase flex items-center gap-2">
            <span>📋</span> Riwayat Perubahan ({filteredLogs.length})
          </h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit Trail</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-12 font-medium">Tidak ada catatan audit log yang ditemukan untuk filter ini.</p>
          ) : (
            filteredLogs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'medium',
              })
              
              const typeColor = 
                log.type === 'DEPLOY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                log.type === 'CREATE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                log.type === 'UPDATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'

              return (
                <div key={log.id} className="bg-[#090A0F] p-4 rounded-2xl border border-gray-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeColor}`}>
                        {log.type}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold">{dateStr}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-200 font-medium leading-relaxed">{log.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}