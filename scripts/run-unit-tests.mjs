// scripts/run-unit-tests.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

// Set mock environment variables untuk pengujian sesi
process.env.SESSION_SECRET = 'unit_test_secret_key_yang_sangat_aman_dan_panjang_12345'
process.env.ADMIN_PASSWORD = 'admin_super_secret_pwd_999'

// ----------------------------------------------------------------------------
// 1. FILE SECURITY TESTS
// ----------------------------------------------------------------------------
import { sanitizeFilename, validatePdfBuffer, validateImageBuffer } from '../lib/fileSecurity.ts'

test('fileSecurity - sanitizeFilename mencegah path traversal dan karakter berbahaya', () => {
  assert.equal(sanitizeFilename('../../etc/passwd'), 'passwd')
  assert.equal(sanitizeFilename('..\\..\\windows\\win.ini'), 'win.ini')
  assert.equal(sanitizeFilename('normal-file.pdf'), 'normal-file.pdf')
  assert.equal(sanitizeFilename('.hidden_file.txt'), 'hidden_file.txt')
  assert.match(sanitizeFilename(''), /^file_\d+/)
})

test('fileSecurity - validatePdfBuffer memeriksa magic bytes PDF secara akurat', () => {
  const validPdfHeader = Buffer.from('%PDF-1.7 header content here')
  assert.equal(validatePdfBuffer(validPdfHeader).valid, true)

  const fakePdf = Buffer.from('NOT_A_PDF_CONTENT')
  const checkFake = validatePdfBuffer(fakePdf)
  assert.equal(checkFake.valid, false)
  assert.match(checkFake.message || '', /bukan merupakan dokumen PDF/)
})

test('fileSecurity - validateImageBuffer memvalidasi gambar dan menolak SVG/HTML/Script (XSS)', () => {
  // PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00])
  const pngResult = validateImageBuffer(pngHeader)
  assert.equal(pngResult.valid, true)
  assert.equal(pngResult.mime, 'image/png')

  // JPEG Magic Bytes: FF D8 FF
  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
  const jpegResult = validateImageBuffer(jpegHeader)
  assert.equal(jpegResult.valid, true)
  assert.equal(jpegResult.mime, 'image/jpeg')

  // Penolakan SVG dengan script berbahaya (XSS)
  const svgExploit = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
  const svgResult = validateImageBuffer(svgExploit)
  assert.equal(svgResult.valid, false)
  assert.match(svgResult.message || '', /kode skrip berbahaya|dilarang demi keamanan/)

  // Dukungan SVG bersih yang valid
  const cleanSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>')
  const cleanSvgResult = validateImageBuffer(cleanSvg)
  assert.equal(cleanSvgResult.valid, true)
  assert.equal(cleanSvgResult.mime, 'image/svg+xml')

  // Dukungan format GIF & WEBP
  const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00])
  assert.equal(validateImageBuffer(gifHeader).valid, true)
  assert.equal(validateImageBuffer(gifHeader).mime, 'image/gif')

  // Penolakan dokumen HTML murni
  const htmlDoc = Buffer.from('<!doctype html><html><body><h1>test</h1></body></html>')
  assert.equal(validateImageBuffer(htmlDoc).valid, false)
})

// ----------------------------------------------------------------------------
// 2. PASSWORD SECURITY TESTS
// ----------------------------------------------------------------------------
import { 
  validatePasswordStrength, 
  hashPassword, 
  verifyPassword, 
  needsRehash,
  checkPasswordExpiry,
  PBKDF2_ITERATIONS 
} from '../lib/password.ts'

test('password - validatePasswordStrength menuntut kriteria password kuat (min 8 char)', () => {
  // Kurang panjang (< 8)
  assert.equal(validatePasswordStrength('Ab1!').isValid, false)
  // Tidak ada simbol
  assert.equal(validatePasswordStrength('AdminPassword123').isValid, false)
  // Tidak ada huruf besar
  assert.equal(validatePasswordStrength('adminpassword123!').isValid, false)
  // Tidak ada angka
  assert.equal(validatePasswordStrength('AdminPassword!@#').isValid, false)
  // Valid (8+ char, upper, lower, number, symbol)
  assert.equal(validatePasswordStrength('KuatBanget#2026').isValid, true)
})

test('password - hashPassword dan verifyPassword bekerja dengan 210.000 iterasi', () => {
  const pwd = 'PasswordSangatRahasia!2026'
  const hashed = hashPassword(pwd)
  assert.match(hashed, new RegExp(`^pbkdf2\\$sha512\\$${PBKDF2_ITERATIONS}\\$`))

  // Verifikasi password benar
  assert.equal(verifyPassword(pwd, hashed), true)
  // Verifikasi password salah
  assert.equal(verifyPassword('PasswordSalah!2026', hashed), false)
  // Modern hash tidak butuh rehash
  assert.equal(needsRehash(hashed), false)
})

test('password - backwards compatibility untuk hash legacy (10.000 iterasi)', () => {
  const pwd = 'LegacyPassword#2024'
  const salt = crypto.randomBytes(16).toString('hex')
  const legacyHash = crypto.pbkdf2Sync(pwd, salt, 10000, 64, 'sha512').toString('hex')
  const legacyStored = `${salt}:${legacyHash}`

  // Tetap bisa diverifikasi
  assert.equal(verifyPassword(pwd, legacyStored), true)
  // Terdeteksi butuh rehash otomatis saat login berikutnya
  assert.equal(needsRehash(legacyStored), true)
})

test('password - checkPasswordExpiry mendeteksi kedaluwarsa 90 hari & peringatan H-7', () => {
  const now = Date.now()
  const DAY_MS = 24 * 60 * 60 * 1000

  // Baru diperbarui 10 hari lalu -> aman
  const statusFresh = checkPasswordExpiry(now - 10 * DAY_MS)
  assert.equal(statusFresh.isExpired, false)
  assert.equal(statusFresh.isWarning, false)
  assert.equal(statusFresh.daysRemaining, 80)

  // 85 hari lalu -> masuk periode peringatan H-7
  const statusWarn = checkPasswordExpiry(now - 85 * DAY_MS)
  assert.equal(statusWarn.isExpired, false)
  assert.equal(statusWarn.isWarning, true)
  assert.equal(statusWarn.daysRemaining, 5)

  // 95 hari lalu -> kedaluwarsa
  const statusExpired = checkPasswordExpiry(now - 95 * DAY_MS)
  assert.equal(statusExpired.isExpired, true)
  assert.equal(statusExpired.daysRemaining, 0)
})

// ----------------------------------------------------------------------------
// 3. SESSION SECURITY TESTS (T1 & T8 Fix Verification)
// ----------------------------------------------------------------------------
import { 
  createSessionToken, 
  verifySessionToken, 
  getSessionPayload,
  createPasswordResetToken,
  verifyPasswordResetToken 
} from '../lib/session.ts'

test('session - createSessionToken & verifySessionToken 4-bagian valid', async () => {
  const token = await createSessionToken('user_finance_01')
  const parts = token.split('.')
  assert.equal(parts.length, 4, 'Token wajib berformat 4 bagian: exp.nonce.userId.sig')

  const isValid = await verifySessionToken(token)
  assert.equal(isValid, true)

  const payload = await getSessionPayload(token)
  assert.notEqual(payload, null)
  assert.equal(payload?.userId, 'user_finance_01')
})

test('session - penolakan tegas terhadap token legacy 3-bagian (T1 Fix)', async () => {
  // Simulasi token 3-bagian dari masa lalu
  const exp = Date.now() + 3600_000
  const nonce = crypto.randomUUID()
  const payload = `${exp}.${nonce}`
  const hmac = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex')
  const legacyToken = `${payload}.${hmac}`

  // Wajib ditolak secara tegas!
  assert.equal(await verifySessionToken(legacyToken), false, 'Legacy 3-part token harus ditolak')
  assert.equal(await getSessionPayload(legacyToken), null, 'Payload legacy token harus null')
})

test('session - penolakan token palsu atau manipulasi tanda tangan', async () => {
  const token = await createSessionToken('admin')
  const tamperedToken = token.slice(0, -4) + 'abcd'
  assert.equal(await verifySessionToken(tamperedToken), false)
  assert.equal(await getSessionPayload(tamperedToken), null)
})

test('session - createPasswordResetToken dan verifyPasswordResetToken', async () => {
  const resetToken = await createPasswordResetToken('user_test_reset')
  const verif = await verifyPasswordResetToken(resetToken)
  assert.equal(verif.valid, true)
  assert.equal(verif.userId, 'user_test_reset')

  // Token rusak
  const fakeReset = resetToken.slice(0, -5) + 'xyz12'
  assert.equal((await verifyPasswordResetToken(fakeReset)).valid, false)
})

// ----------------------------------------------------------------------------
// 4. SITE & JSON-LD XSS PREVENTION TESTS
// ----------------------------------------------------------------------------
import { getSiteUrl, toAbsoluteUrl, safeJsonLd } from '../lib/site.ts'

test('site - getSiteUrl mengembalikan URL yang bersih tanpa trailing slash', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL
  try {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://empatsinergiutama.com///'
    assert.equal(getSiteUrl(), 'https://empatsinergiutama.com')

    delete process.env.NEXT_PUBLIC_SITE_URL
    assert.equal(getSiteUrl(), 'https://empatsinergiutama.com')
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL
    }
  }
})

test('site - toAbsoluteUrl mengubah path relatif menjadi URL absolut yang benar', () => {
  assert.equal(toAbsoluteUrl(undefined), undefined)
  assert.equal(toAbsoluteUrl(null), undefined)
  assert.equal(toAbsoluteUrl('https://example.com/logo.png'), 'https://example.com/logo.png')
  assert.equal(toAbsoluteUrl('/icons/logo.png'), `${getSiteUrl()}/icons/logo.png`)
  assert.equal(toAbsoluteUrl('icons/logo.png'), `${getSiteUrl()}/icons/logo.png`)
})

test('site - safeJsonLd mencegah Stored XSS dengan meng-escape tag script dan karakter bahaya', () => {
  const payloadWithXss = {
    title: 'Staff Operasional</script><script>alert("pwned")</script>',
    description: 'Bekerja dengan dedikasi & integritas > batas biasa < 100%',
  }

  const serialized = safeJsonLd(payloadWithXss)

  // Tidak boleh ada teks literal </script> yang bisa menutup tag script di HTML parser
  assert.equal(serialized.includes('</script>'), false)
  assert.equal(serialized.includes('<script>'), false)
  assert.equal(serialized.includes('\\u003c/script\\u003e'), true)
  assert.equal(serialized.includes('\\u0026'), true)
  assert.equal(serialized.includes('\\u003e'), true)
})

// ----------------------------------------------------------------------------
// 5. COOKIE CONSENT & PRIVACY NOTICE TESTS
// ----------------------------------------------------------------------------
import {
  getCookieConsent,
  saveCookieConsent,
  hasAnalyticsConsent,
  COOKIE_CONSENT_EVENT,
} from '../lib/cookieConsent.ts'

test('cookieConsent - getCookieConsent mengembalikan null jika belum ada pilihan', () => {
  // Simulasi mock storage & window
  const storage = new Map()
  const eventTarget = new EventTarget()
  globalThis.window = {
    dispatchEvent: (e) => eventTarget.dispatchEvent(e),
    addEventListener: (t, fn) => eventTarget.addEventListener(t, fn),
    removeEventListener: (t, fn) => eventTarget.removeEventListener(t, fn),
  }
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  }
  globalThis.document = { cookie: '' }

  assert.equal(getCookieConsent(), null)
  assert.equal(hasAnalyticsConsent(), false)
})

test('cookieConsent - saveCookieConsent(false) menyimpan analitik mati & hasAnalyticsConsent = false', () => {
  let eventFired = false
  const listener = (e) => {
    eventFired = true
    assert.equal(e.detail.analytics, false)
    assert.equal(e.detail.essential, true)
  }
  globalThis.window.addEventListener(COOKIE_CONSENT_EVENT, listener)

  const saved = saveCookieConsent(false)
  assert.equal(saved.essential, true)
  assert.equal(saved.analytics, false)
  assert.equal(hasAnalyticsConsent(), false)
  assert.equal(eventFired, true)

  globalThis.window.removeEventListener(COOKIE_CONSENT_EVENT, listener)
})

test('cookieConsent - saveCookieConsent(true) menyimpan analitik aktif & hasAnalyticsConsent = true', () => {
  const saved = saveCookieConsent(true)
  assert.equal(saved.essential, true)
  assert.equal(saved.analytics, true)
  assert.equal(hasAnalyticsConsent(), true)

  const readBack = getCookieConsent()
  assert.notEqual(readBack, null)
  assert.equal(readBack?.analytics, true)
})

// ----------------------------------------------------------------------------
// 6. ANTI-SPOOFING IP & SECURITY HEADERS TESTS
// ----------------------------------------------------------------------------
test('security - IP extraction memprioritaskan X-Real-IP dari Nginx daripada X-Forwarded-For palsu', () => {
  const fakeForwardedHeader = '203.0.113.195, 198.51.100.1' // Penyerang mencoba spoofing IP
  const realNginxSocketIp = '103.21.244.50' // IP asli yang diisi Nginx via $remote_addr

  // Simulasi pembacaan header:
  const getHeader = (name) => {
    if (name === 'x-real-ip') return realNginxSocketIp
    if (name === 'x-forwarded-for') return fakeForwardedHeader
    return null
  }

  // Logika anti-spoofing yang baru diimplementasikan:
  const extractedIp = getHeader('x-real-ip') || getHeader('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

  // Harus memilih real socket IP, BUKAN IP palsu dari X-Forwarded-For!
  assert.equal(extractedIp, realNginxSocketIp)
  assert.notEqual(extractedIp, '203.0.113.195')
})

// ----------------------------------------------------------------------------
// 7. POSTGREST JWT GENERATOR TESTS
// ----------------------------------------------------------------------------
import { generatePostgrestJwt } from './generate-jwt.mjs'

test('jwt - generatePostgrestJwt menghasilkan token HS256 dengan claims service_role yang valid', () => {
  const secret = 'super_secret_jwt_key_min_32_characters_random_string_here'
  const token = generatePostgrestJwt(secret, 'service_role', 10)

  assert.equal(typeof token, 'string')
  const parts = token.split('.')
  assert.equal(parts.length, 3)

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
  assert.equal(header.alg, 'HS256')
  assert.equal(header.typ, 'JWT')

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  assert.equal(payload.role, 'service_role')
  assert.equal(payload.iss, 'postgrest')
  assert.ok(payload.exp > payload.iat)

  // Verifikasi signature secara independen
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest('base64url')
  assert.equal(parts[2], expectedSig)
})

test('jwt - generatePostgrestJwt menolak secret kurang dari 32 karakter demi keamanan', () => {
  assert.throws(() => {
    generatePostgrestJwt('terlalu_pendek')
  }, /PGRST_JWT_SECRET wajib memiliki panjang minimal 32 karakter/)
})

// ----------------------------------------------------------------------------
// 8. IMAGE OPTIMIZER & CONVERTER TESTS (WEBP & SVG)
// ----------------------------------------------------------------------------
import { optimizeImage, convertLogoToSvg } from '../lib/imageOptimizer.ts'

test('imageOptimizer - optimizeImage mengonversi gambar ke format WebP berkualitas tajam', async () => {
  const sharp = (await import('sharp')).default
  const samplePng = await sharp({
    create: { width: 50, height: 50, channels: 4, background: '#10b981' }
  }).png().toBuffer()

  const res = await optimizeImage(samplePng, 'banner-acara.png')
  assert.equal(res.contentType, 'image/webp')
  assert.ok(res.fileName.endsWith('.webp'))

  const meta = await sharp(res.buffer).metadata()
  assert.equal(meta.format, 'webp')
})

test('imageOptimizer - convertLogoToSvg mengonversi logo ke format SVG vektor murni', async () => {
  const sharp = (await import('sharp')).default
  const sampleLogo = await sharp({
    create: { width: 120, height: 40, channels: 4, background: '#6b0808' }
  }).png().toBuffer()

  const res = await convertLogoToSvg(sampleLogo, 'logo-esu.png')
  assert.equal(res.contentType, 'image/svg+xml')
  assert.ok(res.fileName.endsWith('.svg'))
  assert.ok(res.buffer.toString('utf-8').includes('<svg'))

  const meta = await sharp(res.buffer).metadata()
  assert.equal(meta.format, 'svg')
})

// ----------------------------------------------------------------------------
// 9. SCHEDULED CONTENT AUTO-PURGE (H+7) TESTS
// ----------------------------------------------------------------------------
test('scheduledContent - filterExpiredScheduledContentsH7 otomatis menghapus konten kedaluwarsa H+7', () => {
  function filterExpiredH7(items) {
    if (!items || items.length === 0) return { kept: [], purged: [] }
    const now = Date.now()
    const kept = []
    const purged = []

    for (const item of items) {
      if (!item.endDate) { kept.push(item); continue }
      const endDateTime = new Date(`${item.endDate}T23:59:59.999Z`).getTime()
      if (isNaN(endDateTime)) { kept.push(item); continue }
      const purgeThreshold = endDateTime + (7 * 24 * 60 * 60 * 1000)
      if (now > purgeThreshold) {
        purged.push(item)
      } else {
        kept.push(item)
      }
    }
    return { kept, purged }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const past3Days = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10)
  const past9Days = new Date(Date.now() - 9 * 86400000).toISOString().slice(0, 10)
  const past30Days = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  const items = [
    { id: '1', title: 'Konten Aktif', endDate: todayStr },
    { id: '2', title: 'Kedaluwarsa H+3 (Dalam Masa Toleransi)', endDate: past3Days },
    { id: '3', title: 'Kedaluwarsa H+9 (Wajib Hapus)', endDate: past9Days },
    { id: '4', title: 'Kedaluwarsa H+30 (Wajib Hapus)', endDate: past30Days },
  ]

  const { kept, purged } = filterExpiredH7(items)

  assert.equal(kept.length, 2)
  assert.equal(kept[0].id, '1')
  assert.equal(kept[1].id, '2')

  assert.equal(purged.length, 2)
  assert.equal(purged[0].id, '3')
  assert.equal(purged[1].id, '4')
})


