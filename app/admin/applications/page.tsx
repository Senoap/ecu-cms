// app/admin/applications/page.tsx
import { listApplications, getAppSetting, HR_EMAIL_KEY, APPLICATION_STATUSES, type Application } from '@/lib/applications'
import { readDB, defaultCareerTemplates } from '@/lib/db'
import { requirePermission } from '@/lib/auth'
import { saveHrEmail } from './actions'
import ApplicationsListClient from './ApplicationsListClient'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  new: 'Baru',
  reviewed: 'Ditinjau',
  interview: 'Wawancara',
  accepted: 'Diterima',
  rejected: 'Ditolak',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  reviewed: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  interview: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/30',
}

export default async function ApplicationsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string; job?: string }> 
}) {
  await requirePermission('applications')

  const { status, job } = await searchParams

  let apps: Application[] = []
  let loadError = ''
  try {
    apps = await listApplications()
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Gagal memuat lamaran'
  }

  const db = await readDB()
  const hrEmail = await getAppSetting(HR_EMAIL_KEY)
  const jobs = Array.from(new Map(apps.map((a) => [a.career_id, a.career_title])).entries())

  const filtered = apps.filter((a) => (!status || a.status === status) && (!job || a.career_id === job))
  const templates = (db.careerTemplates && db.careerTemplates.length > 0)
    ? db.careerTemplates
    : defaultCareerTemplates
  const siteName = db.setting?.siteName || 'PT. EMPAT SINERGI UTAMA'

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Lamaran Pekerjaan</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {apps.length} lamaran masuk · {apps.filter((a) => a.status === 'new').length} baru
        </p>
      </div>

      {/* Pengaturan email HR */}
      <form
        action={saveHrEmail}
        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3 shadow-sm"
      >
        <label htmlFor="hrEmail" className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-400">
          Email HR penerima lamaran
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="hrEmail"
            name="hrEmail"
            type="email"
            defaultValue={hrEmail}
            placeholder={db.footer?.email ? `Kosong = pakai email footer (${db.footer.email})` : 'hr@perusahaan.com'}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
          />
          <button id="save-hr-email" type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-black cursor-pointer shadow-sm transition-colors">
            Simpan
          </button>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Perubahan langsung berlaku, tanpa perlu Deploy.</p>
      </form>

      {/* Filter */}
      <form className="flex flex-wrap gap-3 items-end" method="get">
        <select name="status" defaultValue={status || ''} className="px-3 py-2 rounded-xl text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer outline-none">
          <option value="">Semua status</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select name="job" defaultValue={job || ''} className="px-3 py-2 rounded-xl text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer outline-none">
          <option value="">Semua lowongan</option>
          {jobs.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 cursor-pointer shadow-sm hover:opacity-90">Filter</button>
      </form>

      {loadError && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-600 dark:text-red-400 font-medium">
          {loadError}. Pastikan tabel <code>applications</code> sudah dibuat (supabase/applications.sql).
        </div>
      )}

      {filtered.length === 0 && !loadError ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          Belum ada lamaran.
        </div>
      ) : (
        <ApplicationsListClient
          applications={filtered}
          templates={templates}
          siteName={siteName}
          statuses={[...APPLICATION_STATUSES]}
          statusLabels={STATUS_LABEL}
          statusColors={STATUS_COLOR}
        />
      )}
    </div>
  )
}
