#!/usr/bin/env node
// scripts/generate-jwt.mjs
// Utilitas generator token JWT HS256 untuk autentikasi PostgREST service_role
// Menggunakan modul kriptografi bawaan Node.js tanpa dependensi pihak ketiga.

import crypto from 'node:crypto'

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function generatePostgrestJwt(secret, role = 'service_role', expiresInYears = 10) {
  if (!secret || secret.length < 32) {
    throw new Error('PGRST_JWT_SECRET wajib memiliki panjang minimal 32 karakter demi keamanan!')
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresInYears * 365 * 24 * 3600

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const payload = {
    role,
    iss: 'postgrest',
    iat: now,
    exp,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${dataToSign}.${signature}`
}

// Jika dijalankan langsung lewat CLI
if (process.argv[1]?.endsWith('generate-jwt.mjs')) {
  let secret = process.argv[2] || process.env.PGRST_JWT_SECRET

  if (!secret) {
    // Generate secret acak 64 karakter jika belum disediakan
    secret = crypto.randomBytes(32).toString('hex')
    console.log(`🔑 Dihasilkan Secret JWT Acak Baru (simpan ke PGRST_JWT_SECRET):`)
    console.log(`   ${secret}\n`)
  }

  const token = generatePostgrestJwt(secret, 'service_role')
  console.log(`🛡️ Token JWT PostgREST (simpan ke SUPABASE_SERVICE_ROLE_KEY):`)
  console.log(`   ${token}\n`)
}
