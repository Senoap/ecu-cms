// scripts/cleanup-storage.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

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
if (args.some(a => a.includes('local') || a.includes('dev'))) envTarget = 'dev'
else if (args.some(a => a.includes('prod'))) envTarget = 'prod'
else if (args.some(a => a.includes('stg') || a.includes('uat'))) envTarget = 'stg'

const targetFile = envTarget === 'dev' 
  ? (fs.existsSync(path.join(root, '.env.dev')) ? '.env.dev' : '.env.local') 
  : envTarget === 'prod' 
  ? '.env.prod' 
  : '.env.stg'

const loadedEnv = loadEnvFile(path.join(root, targetFile))
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || loadedEnv.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || loadedEnv.SUPABASE_SERVICE_ROLE_KEY || loadedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('====================================================')
console.log(`🧹 PEMBERSIH STORAGE SUPABASE (ORPHAN FILES CLEANUP)`)
console.log('====================================================')
console.log(`Target Environment : [${envTarget.toUpperCase()}] (${targetFile})`)
console.log(`Supabase URL       : ${supabaseUrl || '(Tidak ditemukan)'}`)
console.log('----------------------------------------------------')

if (!supabaseUrl || !supabaseKey) {
  console.error(`❌ Gagal: Kredensial Supabase tidak ditemukan di ${targetFile}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

// 1. Dapatkan daftar seluruh file yang aktif digunakan di database
async function getUsedFiles() {
  const usedFiles = new Set()

  function extractFileName(url) {
    if (!url || typeof url !== 'string') return
    const parts = url.split('/')
    const file = parts[parts.length - 1]
    if (file && file.includes('.')) {
      usedFiles.add(file)
    }
  }

  // Ambil dari Supabase site_content dulu, atau fallback db.json
  let dbData = null
  try {
    const { data } = await supabase.from('site_content').select('data').eq('id', 1).single()
    if (data && data.data) dbData = data.data
  } catch {}

  if (!dbData) {
    const localDbPath = path.join(root, 'data', 'db.json')
    if (fs.existsSync(localDbPath)) {
      dbData = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'))
    }
  }

  if (!dbData) {
    throw new Error('Tidak dapat menemukan data konten website!')
  }

  // Scan Setting
  extractFileName(dbData.setting?.logoUrl)
  extractFileName(dbData.setting?.bgImageUrl)

  // Scan Sections
  if (Array.isArray(dbData.sections)) {
    for (const sec of dbData.sections) {
      if (sec.items) {
        for (const it of sec.items) extractFileName(it.imageUrl)
      }
    }
  }

  // Scan Services
  if (Array.isArray(dbData.services)) {
    for (const s of dbData.services) {
      if (Array.isArray(s.images)) s.images.forEach(extractFileName)
    }
  }

  // Scan Portfolios
  if (Array.isArray(dbData.portfolios)) {
    for (const p of dbData.portfolios) {
      extractFileName(p.imageUrl)
      if (Array.isArray(p.images)) p.images.forEach(extractFileName)
    }
  }

  // Scan Galleries
  if (Array.isArray(dbData.galleries)) {
    for (const g of dbData.galleries) extractFileName(g.imageUrl)
  }

  // Scan Scheduled Contents
  if (Array.isArray(dbData.scheduledContents)) {
    for (const sc of dbData.scheduledContents) extractFileName(sc.imageUrl)
  }

  // Scan Published (Versi tayang)
  if (dbData.published) {
    extractFileName(dbData.published.setting?.logoUrl)
    extractFileName(dbData.published.setting?.bgImageUrl)
    if (Array.isArray(dbData.published.services)) {
      dbData.published.services.forEach(s => s.images?.forEach(extractFileName))
    }
    if (Array.isArray(dbData.published.portfolios)) {
      dbData.published.portfolios.forEach(p => {
        extractFileName(p.imageUrl)
        p.images?.forEach(extractFileName)
      })
    }
    if (Array.isArray(dbData.published.galleries)) {
      dbData.published.galleries.forEach(g => extractFileName(g.imageUrl))
    }
    if (Array.isArray(dbData.published.scheduledContents)) {
      dbData.published.scheduledContents.forEach(sc => extractFileName(sc.imageUrl))
    }
  }

  return usedFiles
}

async function runCleanup() {
  const usedFiles = await getUsedFiles()
  console.log(`🔍 Ditemukan ${usedFiles.size} file yang AKTIF DIGUNAKAN di website:`)
  usedFiles.forEach(f => console.log(`   - ${f}`))
  console.log('----------------------------------------------------')

  // 2. Cek file yang ada di bucket Supabase "uploads"
  console.log('📦 Memeriksa isi bucket "uploads" di Supabase Storage...')
  const { data: storageFiles, error: listErr } = await supabase.storage.from('uploads').list('', {
    limit: 1000,
  })

  if (listErr) {
    console.error('❌ Gagal membaca list bucket Supabase:', listErr.message)
    process.exit(1)
  }

  const allStorageFiles = (storageFiles || []).filter(f => f.name && !f.name.startsWith('.'))
  console.log(`📊 Total file di Supabase Storage : ${allStorageFiles.length} file`)

  const filesToDelete = allStorageFiles
    .filter(f => !usedFiles.has(f.name))
    .map(f => f.name)

  if (filesToDelete.length === 0) {
    console.log('✨ Storage Supabase sudah bersih! Tidak ada file sampah.')
  } else {
    console.log(`\n🗑️  Menghapus ${filesToDelete.length} file sampah dari Supabase Storage:`)
    filesToDelete.forEach(f => console.log(`   ❌ ${f}`))

    const { error: delErr } = await supabase.storage.from('uploads').remove(filesToDelete)
    if (delErr) {
      console.error('⚠️ Gagal menghapus file dari Supabase:', delErr.message)
    } else {
      console.log(`\n✅ Berhasil menghapus ${filesToDelete.length} file dari Supabase Storage!`)
    }
  }

  // 3. Bersihkan juga folder lokal public/uploads/
  const localUploadsDir = path.join(root, 'public', 'uploads')
  if (fs.existsSync(localUploadsDir)) {
    const localFiles = fs.readdirSync(localUploadsDir)
    const localToDelete = localFiles.filter(f => !usedFiles.has(f) && !f.startsWith('.'))
    if (localToDelete.length > 0) {
      console.log(`\n📁 Membersihkan ${localToDelete.length} file sampah di folder lokal public/uploads/...`)
      for (const f of localToDelete) {
        try {
          fs.unlinkSync(path.join(localUploadsDir, f))
        } catch {}
      }
      console.log(`✅ Berhasil membersihkan ${localToDelete.length} file lokal.`)
    }
  }

  console.log('\n====================================================')
  console.log('🎉 PEMBERSIHAN STORAGE SELESAI!')
  console.log('====================================================')
}

runCleanup().catch(err => {
  console.error('\n❌ Terjadi kesalahan saat cleanup:', err)
  process.exit(1)
})
