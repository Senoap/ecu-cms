#!/usr/bin/env node
// scripts/purge-expired-cv.mjs
// Pemicu pembersihan CV kedaluwarsa (60 hari, UU PDP) via endpoint internal terproteksi.
// Dijalankan via cron harian di VPS (lihat deploy/setup-server.sh) atau pasca-restore database.
//
// Env: CRON_SECRET (wajib), PURGE_BASE_URL (default http://127.0.0.1:3000)

const base = (process.env.PURGE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('❌ CRON_SECRET belum diset. Purge CV dibatalkan.')
  process.exit(1)
}

try {
  console.log(`🧹 [${new Date().toISOString()}] Memicu purge CV kedaluwarsa (retensi 60 hari)...`)
  const res = await fetch(`${base}/api/cron/purge-cv`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  })
  const body = await res.text()
  if (!res.ok) {
    console.error(`❌ Purge gagal (HTTP ${res.status}): ${body}`)
    process.exit(1)
  }
  console.log(`✅ Selesai: ${body}`)
} catch (err) {
  console.error('❌ Gagal menghubungi aplikasi:', err)
  process.exit(1)
}
