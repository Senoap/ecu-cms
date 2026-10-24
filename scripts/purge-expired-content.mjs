#!/usr/bin/env node
// scripts/purge-expired-content.mjs
// Pemicu pembersihan konten terjadwal yang telah kedaluwarsa lebih dari 7 hari (H+7).
// Dijalankan via cron harian di VPS atau dipanggil pasca-sinkronisasi database.
//
// Env: CRON_SECRET (wajib), PURGE_BASE_URL (default http://127.0.0.1:3000)

const base = (process.env.PURGE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('❌ CRON_SECRET belum diset. Purge konten kedaluwarsa dibatalkan.')
  process.exit(1)
}

try {
  console.log(`🧹 [${new Date().toISOString()}] Memicu auto-purge konten kedaluwarsa (H+7)...`)
  const res = await fetch(`${base}/api/cron/purge-content`, {
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
