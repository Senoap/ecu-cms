// lib/applications.ts
import { getAdminClient } from './supabaseAdmin'
import fs from 'fs/promises'
import path from 'path'

export type ApplicationStatus = 'new' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
export const APPLICATION_STATUSES: ApplicationStatus[] = ['new', 'reviewed', 'interview', 'accepted', 'rejected']

export interface Application {
  id: string
  ref_code: string
  career_id: string
  career_title: string
  name: string
  phone: string
  email: string
  education: string | null
  cover_note: string | null
  cv_path: string
  status: ApplicationStatus
  created_at: string
  cv_purged?: boolean
}

const DATA_DIR = path.join(process.cwd(), 'data')
const APPS_FILE = path.join(DATA_DIR, 'applications.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'app_settings.json')
const CV_DIR = path.join(DATA_DIR, 'cv')

async function ensureDataDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.mkdir(CV_DIR, { recursive: true })
  } catch {}
}

async function readLocalApplications(): Promise<Application[]> {
  await ensureDataDirs()
  try {
    const raw = await fs.readFile(APPS_FILE, 'utf-8')
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

async function writeLocalApplications(apps: Application[]): Promise<void> {
  try {
    await ensureDataDirs()
    await fs.writeFile(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8')
  } catch {
    // Pada serverless (Vercel), filesystem read-only; abaikan jika gagal
  }
}

async function readLocalSettings(): Promise<Record<string, string>> {
  await ensureDataDirs()
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return JSON.parse(raw) || {}
  } catch {
    return {}
  }
}

async function writeLocalSetting(key: string, value: string): Promise<void> {
  try {
    const settings = await readLocalSettings()
    settings[key] = value
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
  } catch {
    // Pada serverless (Vercel), filesystem read-only; abaikan jika gagal
  }
}

// ==============================================================================
// PUBLIC EXPORTED FUNCTIONS (HYBRID: SUPABASE DENGAN FALLBACK LOKAL 100%)
// ==============================================================================

// ==================== POINT 11: 60-DAY CV AUTO-PURGE ====================
export async function autoPurgeExpiredCvs(days: number = 60): Promise<number> {
  let purgedCount = 0
  const RETENTION_MS = days * 24 * 60 * 60 * 1000
  const now = Date.now()

  try {
    const apps = await readLocalApplications()
    let hasChange = false

    for (const app of apps) {
      const appTime = new Date(app.created_at).getTime()
      if (now - appTime > RETENTION_MS && !app.cv_purged && app.cv_path) {
        // Hapus fisik berkas CV dari folder lokal di VPS
        try {
          await fs.unlink(path.join(CV_DIR, app.cv_path))
        } catch {}

        // Hapus juga dari Supabase Storage jika terhubung
        const client = getAdminClient()
        if (client) {
          try {
            await client.storage.from('cv').remove([app.cv_path])
          } catch {}
        }

        app.cv_purged = true
        hasChange = true
        purgedCount++
      }
    }

    if (hasChange) {
      await writeLocalApplications(apps)
    }

    // Update status di Supabase jika ada
    const client = getAdminClient()
    if (client && hasChange) {
      try {
        for (const app of apps) {
          if (app.cv_purged) {
            await client.from('applications').update({ cv_purged: true }).eq('id', app.id)
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[applications] Gagal menjalankan auto-purge CV 60 hari:', err)
  }

  return purgedCount
}

export async function listApplications(): Promise<Application[]> {
  // Jalankan retensi 60 hari otomatis (Point 11)
  await autoPurgeExpiredCvs(60)

  const client = getAdminClient()
  if (client) {
    try {
      const { data, error } = await client
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (!error && data) {
        return data as Application[]
      }
    } catch (err) {
      console.warn('[applications] Supabase offline, beralih ke penyimpanan lokal:', err)
    }
  }

  // Fallback: baca dari data/applications.json lokal di VPS
  const localApps = await readLocalApplications()
  return localApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function countNewApplications(): Promise<number> {
  const client = getAdminClient()
  if (client) {
    try {
      const { count, error } = await client
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new')
      if (!error && count !== null) return count
    } catch {}
  }

  const local = await readLocalApplications()
  return local.filter((a) => a.status === 'new').length
}

export async function getAppSetting(key: string): Promise<string> {
  const client = getAdminClient()
  if (client) {
    try {
      const { data, error } = await client.from('app_settings').select('value').eq('key', key).maybeSingle()
      if (!error && data?.value) return String(data.value)
    } catch {}
  }

  const settings = await readLocalSettings()
  return settings[key] || ''
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  let supabaseSuccess = false
  const client = getAdminClient()
  if (client) {
    try {
      const { error } = await client.from('app_settings').upsert({ key, value })
      if (!error) supabaseSuccess = true
    } catch (err) {
      console.warn('[applications] Gagal simpan app_setting ke Supabase:', err)
    }
  }

  // Selalu simpan juga ke file lokal di VPS
  await writeLocalSetting(key, value)
  if (!supabaseSuccess && !client) {
    // Berjalan sukses secara lokal
  }
}

export async function saveNewApplication(
  item: Omit<Application, 'id' | 'created_at'>,
  cvBuffer: Buffer,
  mime: string
): Promise<Application> {
  await ensureDataDirs()

  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()
  const appRecord: Application = {
    id,
    created_at,
    ...item,
  }

  const client = getAdminClient()
  if (client) {
    try {
      const { error: upErr } = await client.storage.from('cv').upload(item.cv_path, cvBuffer, {
        contentType: mime,
        upsert: false,
      })
      if (!upErr) {
        const { error: insErr } = await client.from('applications').insert(appRecord)
        if (insErr) {
          await client.storage.from('cv').remove([item.cv_path])
        }
      }
    } catch (err) {
      console.warn('[applications] Supabase simpan lamaran gagal, beralih ke penyimpanan lokal:', err)
    }
  }

  // Simpan CV ke penyimpanan lokal di VPS (data/cv/) jika filesystem writable
  try {
    const localCvPath = path.join(CV_DIR, item.cv_path)
    await fs.writeFile(localCvPath, cvBuffer)
  } catch {
    // Pada serverless (Vercel), filesystem read-only; abaikan jika Supabase sudah menangani
  }

  // Simpan record lamaran ke data/applications.json lokal
  try {
    const apps = await readLocalApplications()
    apps.unshift(appRecord)
    await writeLocalApplications(apps)
  } catch {
    // Abaikan kegagalan tulis lokal di serverless
  }

  return appRecord
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  const client = getAdminClient()
  if (client) {
    try {
      await client.from('applications').update({ status }).eq('id', id)
    } catch {}
  }

  // Update juga secara lokal
  const apps = await readLocalApplications()
  const target = apps.find((a) => a.id === id)
  if (target) {
    target.status = status
    await writeLocalApplications(apps)
  }
}

export async function deleteApplication(id: string): Promise<void> {
  let cvPathToDelete: string | null = null

  // Cek path file CV
  const apps = await readLocalApplications()
  const target = apps.find((a) => a.id === id)
  if (target) {
    cvPathToDelete = target.cv_path
  }

  const client = getAdminClient()
  if (client) {
    try {
      if (!cvPathToDelete) {
        const { data } = await client.from('applications').select('cv_path').eq('id', id).maybeSingle()
        if (data?.cv_path) cvPathToDelete = data.cv_path as string
      }
      if (cvPathToDelete) {
        await client.storage.from('cv').remove([cvPathToDelete])
      }
      await client.from('applications').delete().eq('id', id)
    } catch {}
  }

  // Hapus dari data/applications.json lokal
  const filtered = apps.filter((a) => a.id !== id)
  await writeLocalApplications(filtered)

  // Hapus berkas CV fisik dari folder data/cv/ lokal jika ada
  if (cvPathToDelete) {
    try {
      await fs.unlink(path.join(CV_DIR, cvPathToDelete))
    } catch {}
  }
}

export async function getCvDownload(id: string): Promise<
  | { signedUrl: string }
  | { buffer: Buffer; fileName: string; mimeType: string }
  | null
> {
  let cvPath: string | null = null
  let candidateName = 'Candidate'

  // 1. Cek dari database lokal
  const apps = await readLocalApplications()
  const foundLocal = apps.find((a) => a.id === id)
  if (foundLocal) {
    cvPath = foundLocal.cv_path
    candidateName = foundLocal.name.replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  // 2. Cek dari Supabase jika ada
  const client = getAdminClient()
  if (client) {
    try {
      if (!cvPath) {
        const { data } = await client.from('applications').select('name, cv_path').eq('id', id).maybeSingle()
        if (data?.cv_path) {
          cvPath = data.cv_path as string
          if (data.name) candidateName = String(data.name).replace(/[^a-zA-Z0-9_-]/g, '_')
        }
      }

      if (cvPath) {
        const { data: signed, error } = await client.storage.from('cv').createSignedUrl(cvPath, 60)
        if (!error && signed?.signedUrl) {
          return { signedUrl: signed.signedUrl }
        }
      }
    } catch {}
  }

  // 3. Fallback: Baca berkas lokal langsung dari data/cv/ di VPS
  if (cvPath) {
    try {
      const filePath = path.join(CV_DIR, cvPath)
      const buffer = await fs.readFile(filePath)
      const ext = path.extname(cvPath).toLowerCase()
      let mimeType = 'application/octet-stream'
      if (ext === '.pdf') mimeType = 'application/pdf'
      else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else if (ext === '.doc') mimeType = 'application/msword'

      return {
        buffer,
        fileName: `CV_${candidateName}${ext}`,
        mimeType,
      }
    } catch (err) {
      console.warn('[applications] Berkas CV lokal tidak ditemukan:', err)
    }
  }

  return null
}

export const HR_EMAIL_KEY = 'hr_email'
