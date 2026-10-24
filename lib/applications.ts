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
  consent_at?: string
  consent_version?: string
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
        // 1. Hapus fisik berkas CV dari folder lokal di VPS
        try {
          await fs.unlink(path.join(CV_DIR, app.cv_path))
        } catch {}

        // 2. Hapus juga dari Supabase Storage jika terhubung dan bukan local-only
        if (process.env.STORAGE_DRIVER !== 'local') {
          const client = getAdminClient()
          if (client) {
            try {
              await client.storage.from('cv').remove([app.cv_path])
            } catch {}
          }
        }

        // 3. Anonimkan data teks pelamar (UU PDP Pasal 44)
        app.cv_purged = true
        app.name = 'Anonim (Kedaluwarsa)'
        app.phone = '-'
        app.email = '-'
        app.education = null
        app.cover_note = null
        hasChange = true
        purgedCount++
      }
    }

    if (hasChange) {
      await writeLocalApplications(apps)
    }

    // Supabase adalah sumber utama: sapu SEMUA baris kedaluwarsa langsung dari database
    // (bukan hanya yang tercatat di berkas lokal), hapus berkas di bucket, lalu anonimkan.
    const client = getAdminClient()
    if (client) {
      try {
        const cutoffIso = new Date(now - RETENTION_MS).toISOString()
        const { data: expiredRows, error } = await client
          .from('applications')
          .select('id, cv_path')
          .lt('created_at', cutoffIso)
          .eq('cv_purged', false)
          .limit(500)

        if (!error && expiredRows) {
          for (const row of expiredRows as { id: string; cv_path: string | null }[]) {
            if (row.cv_path) {
              try {
                await fs.unlink(path.join(CV_DIR, row.cv_path))
              } catch {}
              if (process.env.STORAGE_DRIVER !== 'local') {
                await client.storage.from('cv').remove([row.cv_path]).catch(() => {})
              }
            }
            const { error: updErr } = await client
              .from('applications')
              .update({
                cv_purged: true,
                name: 'Anonim (Kedaluwarsa)',
                phone: '-',
                email: '-',
                education: null,
                cover_note: null,
              })
              .eq('id', row.id)
            if (!updErr) purgedCount++
          }
        }
      } catch (err) {
        console.warn('[applications] Gagal purge baris kedaluwarsa di Supabase:', err)
      }
    }
  } catch (err) {
    console.warn('[applications] Gagal menjalankan auto-purge CV 60 hari:', err)
  }

  return purgedCount
}

export async function listApplications(): Promise<Application[]> {
  // Catatan: auto-purge dijalankan terpisah via cron (scripts/purge-expired-cv.mjs), bukan saat ada web request.
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

  const isLocalStorage = process.env.STORAGE_DRIVER === 'local'
  const localCvPath = path.join(CV_DIR, item.cv_path)

  // 1. Simpan berkas fisik CV terlebih dahulu (Atomic Step 1)
  try {
    await fs.writeFile(localCvPath, cvBuffer)
  } catch (fileErr) {
    console.error('[applications] Gagal menyimpan berkas CV ke disk lokal:', fileErr)
    throw new Error('Gagal menyimpan dokumen CV ke server.')
  }

  // Jika menggunakan Supabase Cloud Storage (bukan local driver)
  let cloudUploaded = false
  const client = getAdminClient()
  if (!isLocalStorage && client) {
    try {
      const { error: upErr } = await client.storage.from('cv').upload(item.cv_path, cvBuffer, {
        contentType: mime,
        upsert: false,
      })
      if (upErr) {
        // Hapus file lokal jika cloud upload gagal
        await fs.unlink(localCvPath).catch(() => {})
        console.error('[applications] Gagal upload CV ke Supabase Storage:', upErr)
        throw new Error('Gagal mengunggah dokumen CV ke penyimpanan cloud.')
      }
      cloudUploaded = true
    } catch (cloudErr) {
      await fs.unlink(localCvPath).catch(() => {})
      throw cloudErr instanceof Error ? cloudErr : new Error('Gagal mengunggah dokumen CV.')
    }
  }

  // 2. Insert record pelamar ke Database (Atomic Step 2)
  if (client) {
    try {
      const { error: insErr } = await client.from('applications').insert(appRecord)
      if (insErr) {
        // ROLLBACK: Hapus berkas fisik yang baru disimpan agar tidak meninggalkan file yatim
        await fs.unlink(localCvPath).catch(() => {})
        if (cloudUploaded) {
          await client.storage.from('cv').remove([item.cv_path]).catch(() => {})
        }
        console.error('[applications] Gagal insert record pelamar ke DB, berkas di-rollback:', insErr)
        throw new Error(`Gagal menyimpan data lamaran ke database: ${insErr.message}`)
      }
    } catch (dbErr) {
      // Pastikan rollback berkas yatim jika terjadi exception tak terduga
      await fs.unlink(localCvPath).catch(() => {})
      if (cloudUploaded && client) {
        await client.storage.from('cv').remove([item.cv_path]).catch(() => {})
      }
      throw dbErr instanceof Error ? dbErr : new Error('Gagal menyimpan data lamaran.')
    }
  }

  // Simpan juga record lamaran ke data/applications.json lokal untuk sinkronisasi cadangan
  try {
    const apps = await readLocalApplications()
    apps.unshift(appRecord)
    await writeLocalApplications(apps)
  } catch {
    // Abaikan jika penulisan json lokal gagal pada environment khusus
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

  // 2. Cek dari Supabase jika ada dan bukan local storage
  const isLocalStorage = process.env.STORAGE_DRIVER === 'local'
  const client = getAdminClient()
  if (!isLocalStorage && client) {
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
