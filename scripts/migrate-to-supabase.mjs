// scripts/migrate-to-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Fungsi baca .env manual agar tidak butuh package pihak ketiga
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      env[key] = val
    }
  })
  return env
}

const args = process.argv.slice(2)
let envTarget = 'stg'
if (args.some(a => a.includes('local') || a.includes('dev'))) envTarget = 'local'
else if (args.some(a => a.includes('prod'))) envTarget = 'prod'
else if (args.some(a => a.includes('stg') || a.includes('uat'))) envTarget = 'stg'

const targetFile = (envTarget === 'local' || envTarget === 'dev') 
  ? (fs.existsSync(path.join(projectRoot, '.env.dev')) ? '.env.dev' : '.env.development') 
  : envTarget === 'prod' 
  ? '.env.prod' 
  : '.env.stg'

const loadedEnv = loadEnvFile(path.join(projectRoot, targetFile))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || loadedEnv.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || loadedEnv.SUPABASE_SERVICE_ROLE_KEY || loadedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

let keyRole = 'anon'
try {
  const parts = supabaseKey ? supabaseKey.split('.') : []
  if (parts.length >= 2) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    keyRole = payload.role || 'unknown'
  }
} catch {
  keyRole = 'custom'
}

console.log('====================================================')
console.log(`🚀 MIGRASI DATABASE & STORAGE KE SUPABASE [${envTarget.toUpperCase()}]`)
console.log('====================================================')
console.log(`Config File : ${targetFile}`)
console.log(`URL Target  : ${supabaseUrl || '(TIDAK DITEMUKAN)'}`)
console.log(`Key Role    : ${keyRole}`)
console.log('----------------------------------------------------')

if (!supabaseUrl || !supabaseKey) {
  console.error(`❌ Gagal: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum di-set di ${targetFile}!`)
  console.error(`👉 Silakan periksa file ${targetFile}.`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  switch (ext) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.svg': return 'image/svg+xml'
    case '.gif': return 'image/gif'
    case '.pdf': return 'application/pdf'
    default: return 'application/octet-stream'
  }
}

async function runMigration() {
  // 1. Migrasi Data CMS (data/db.json) -> site_content
  const dbPath = path.join(projectRoot, 'data', 'db.json')
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ File ${dbPath} tidak ditemukan!`)
    process.exit(1)
  }

  console.log('📦 1. Membaca data/db.json...')
  const rawData = fs.readFileSync(dbPath, 'utf-8')
  let dbJson
  try {
    dbJson = JSON.parse(rawData)
  } catch (e) {
    console.error('❌ Gagal parse JSON data/db.json:', e.message)
    process.exit(1)
  }

  console.log('📦 1. Memeriksa data remote di Supabase...')
  const { data: remoteRow } = await supabase
    .from('site_content')
    .select('data')
    .eq('id', 1)
    .single()

  let finalData = { ...dbJson }

  // Bersihkan data runtime / transaksi lokal agar tidak terbawa ke Supabase
  finalData.activeSessions = {}
  finalData.loginAttempts = {}
  finalData.draftLock = null
  finalData.visitorLogs = []
  finalData.dailyVisitorCounts = []
  finalData.notifications = []
  finalData.hasDraft = false

  if (remoteRow && remoteRow.data) {
    console.log('ℹ️ Data di Supabase sudah ada. Melakukan penggabungan aditif (hanya menambahkan field/struktur baru tanpa menimpa data yang ada)...')
    const existing = remoteRow.data
    // Pertahankan data remote yang sudah ada, cukup tambahkan field/struktur baru yang belum ada
    finalData = {
      ...finalData,
      ...existing,
      setting: { ...finalData.setting, ...(existing.setting || {}) },
      hero: { ...finalData.hero, ...(existing.hero || {}) },
      about: { ...finalData.about, ...(existing.about || {}) },
      servicesHeader: { ...finalData.servicesHeader, ...(existing.servicesHeader || {}) },
      portfolioHeader: { ...finalData.portfolioHeader, ...(existing.portfolioHeader || {}) },
      careerHeader: { ...finalData.careerHeader, ...(existing.careerHeader || {}) },
      galleryHeader: { ...finalData.galleryHeader, ...(existing.galleryHeader || {}) },
      footer: { ...finalData.footer, ...(existing.footer || {}) },
      privacyPolicy: existing.privacyPolicy || finalData.privacyPolicy,
      termsOfService: existing.termsOfService || finalData.termsOfService,
      directors: (existing.directors && existing.directors.length > 0) ? existing.directors : finalData.directors,
      certifications: (existing.certifications && existing.certifications.length > 0) ? existing.certifications : finalData.certifications,
      comproEmailTemplate: existing.comproEmailTemplate || finalData.comproEmailTemplate,
      careerTemplates: (existing.careerTemplates && existing.careerTemplates.length > 0) ? existing.careerTemplates : finalData.careerTemplates,
      auditLogs: existing.auditLogs || [],
      comproRequests: existing.comproRequests || [],
      cmsUsers: (existing.cmsUsers && existing.cmsUsers.length > 0) ? existing.cmsUsers : (finalData.cmsUsers || []),
      activeSessions: existing.activeSessions || {},
      dailyVisitorCounts: existing.dailyVisitorCounts || [],
      draftLock: null,
      hasDraft: false,
    }
  } else {
    // Fresh setup: kosongkan data transaksional
    finalData.auditLogs = []
    finalData.comproRequests = []
  }

  console.log('⏳ Mengirim data CMS ke tabel `site_content` di Supabase...')
  const { error: upsertErr } = await supabase
    .from('site_content')
    .upsert({
      id: 1,
      data: finalData,
    })
    .select()

  if (upsertErr) {
    console.error('❌ Gagal upsert data ke tabel `site_content`:', upsertErr.message)
    console.error('👉 Pastikan Anda sudah menjalankan script SQL di: supabase/setup_complete.sql!')
    process.exit(1)
  }

  console.log('✅ Berhasil menyelaraskan struktur database CMS ke Supabase!')

  // 2. Migrasi File Media (public/uploads/) -> Supabase Storage (uploads)
  const uploadsDir = path.join(projectRoot, 'public', 'uploads')
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => !fs.statSync(path.join(uploadsDir, f)).isDirectory())
    console.log(`\n📁 2. Menemukan ${files.length} file di public/uploads/. Mengunggah ke bucket "uploads"...`)

    let uploadedCount = 0
    let failedCount = 0

    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      const buffer = fs.readFileSync(filePath)
      const mime = getMimeType(file)

      const { error } = await supabase.storage
        .from('uploads')
        .upload(file, buffer, {
          contentType: mime,
          upsert: true,
        })

      if (error) {
        console.warn(`  ⚠️  Gagal upload ${file}: ${error.message}`)
        failedCount++
      } else {
        uploadedCount++
        process.stdout.write(`  ⬆️  [${uploadedCount}/${files.length}] Berhasil: ${file}\r`)
      }
    }

    console.log(`\n✅ Selesai unggah file media: ${uploadedCount} berhasil, ${failedCount} gagal.`)
  } else {
    console.log('\nℹ️ Folder public/uploads/ tidak ditemukan, lewati sinkronisasi media.')
  }

  console.log('\n====================================================')
  console.log('🎉 MIGRASI KE SUPABASE SELESAI DENGAN SUKSES!')
  console.log('====================================================')
  console.log('Selanjutnya:')
  console.log('1. Pastikan .env.local dan env production diisi URL dan Key Supabase ini.')
  console.log('2. Buka web & admin panel untuk mengecek data yang sudah aktif di cloud.')
  console.log('====================================================\n')
}

runMigration().catch(err => {
  console.error('\n❌ Terjadi error saat migrasi:', err)
  process.exit(1)
})
