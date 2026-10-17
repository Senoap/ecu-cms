// scratch-test/e2e.mjs — uji HTTP end-to-end tanpa browser
import fs from 'node:fs'
import crypto from 'node:crypto'

const BASE = process.env.BASE || 'http://localhost:3001'
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
)
const SURL = env.NEXT_PUBLIC_SUPABASE_URL
const SKEY = env.SUPABASE_SERVICE_ROLE_KEY
const results = []
const check = (name, ok, info = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  -> ' + info : ''}`) }

function token() {
  const exp = Date.now() + 3600_000
  const payload = `${exp}.${crypto.randomUUID()}`
  const sig = crypto.createHmac('sha256', env.SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}
const cookie = `esu_admin_session=${token()}`

async function sb(path, init = {}) {
  return fetch(`${SURL}${path}`, { ...init, headers: { apikey: SKEY, Authorization: `Bearer ${SKEY}`, ...(init.headers || {}) } })
}

// 1. Proxy guard
let r = await fetch(`${BASE}/admin/applications`, { redirect: 'manual' })
check('Admin tanpa login -> redirect /login', r.status >= 300 && r.status < 400 && (r.headers.get('location') || '').includes('/login'), `${r.status} ${r.headers.get('location')}`)

r = await fetch(`${BASE}/admin/applications`, { method: 'POST', redirect: 'manual' })
check('POST ke /admin tanpa login -> 401', r.status === 401, String(r.status))

r = await fetch(`${BASE}/admin/applications`, { redirect: 'manual', headers: { cookie: 'esu_admin_session=authenticated' } })
check('Cookie lama "authenticated" ditolak', r.status >= 300 && r.status < 400, String(r.status))

r = await fetch(`${BASE}/admin/applications`, { redirect: 'manual', headers: { cookie: `esu_admin_session=${token().slice(0, -3)}abc` } })
check('Token dengan tanda tangan salah ditolak', r.status >= 300 && r.status < 400, String(r.status))

r = await fetch(`${BASE}/admin/applications`, { headers: { cookie } })
const adminHtml = await r.text()
check('Admin dengan sesi valid -> 200 + halaman Lamaran', r.status === 200 && adminHtml.includes('Lamaran Pekerjaan'), String(r.status))

// 2. Halaman karier punya form
r = await fetch(`${BASE}/career/1`)
const careerHtml = await r.text()
check('Halaman /career/1 menampilkan apply-form', r.status === 200 && careerHtml.includes('id="apply-form"'), String(r.status))

// Ambil hidden input action dari form (progressive enhancement)
const formHtml = careerHtml.slice(careerHtml.indexOf('id="apply-form"') - 200)
const formEnd = formHtml.indexOf('</form>')
const formBlock = formHtml.slice(0, formEnd)
const hidden = [...formBlock.matchAll(/<input[^>]*type="hidden"[^>]*>/g)].map((m) => {
  const n = m[0].match(/name="([^"]*)"/)?.[1]
  const v = m[0].match(/value="([^"]*)"/)?.[1] ?? ''
  return [n, v.replace(/&quot;/g, '"').replace(/&amp;/g, '&')]
}).filter(([n]) => n)

let ipSeq = Date.now() % 100000
async function submit(fields, fileBuf, fileName, fileType, customIp) {
  const fd = new FormData()
  for (const [n, v] of hidden) fd.set(n, v)
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  if (fileBuf) fd.set('cv', new Blob([fileBuf], { type: fileType }), fileName)
  else fd.set('cv', new Blob([]), '')
  const ip = customIp || `10.0.0.${ipSeq++}`
  const res = await fetch(`${BASE}/career/1`, {
    method: 'POST',
    body: fd,
    headers: { 'x-test-ip': ip, 'x-forwarded-for': ip }
  })
  return res.text()
}

const base = { name: 'Budi Tester', phone: '081234567890', email: 'budi@example.com', education: 'S1', coverNote: 'Tes <b>lamaran</b>', consent: 'on' }
const validPdf = fs.readFileSync('scratch-test/cv-test.pdf')

const extractErr = (html) => html.match(/id="apply-error"[^>]*>([^<]*)</)?.[1]

let html = await submit(base, Buffer.from('bukan pdf sama sekali'), 'fake.pdf', 'application/pdf')
check('CV palsu (isi bukan PDF) ditolak', /tidak valid/i.test(extractErr(html) || ''), extractErr(html))

html = await submit(base, null)
check('Tanpa CV ditolak (CV wajib)', /wajib/i.test(extractErr(html) || ''), extractErr(html))

html = await submit(base, Buffer.from('MZ-executable'), 'virus.exe', 'application/octet-stream')
check('Ekstensi .exe ditolak', /Format CV/i.test(extractErr(html) || ''), extractErr(html))

html = await submit({ ...base, consent: undefined }, validPdf, 'cv.pdf', 'application/pdf')
check('Tanpa persetujuan data ditolak', /menyetujui/i.test(extractErr(html) || ''), extractErr(html))

html = await submit({ ...base, email: 'bukan-email' }, validPdf, 'cv.pdf', 'application/pdf')
check('Email tidak valid ditolak', /Email tidak valid/i.test(extractErr(html) || ''), extractErr(html))

html = await submit({ ...base, careerId: '999' }, validPdf, 'cv.pdf', 'application/pdf')
check('Lowongan tidak ada ditolak', /ditutup|tidak ditemukan/i.test(extractErr(html) || ''), extractErr(html))

// Rate limit test: 3 attempts from same IP should succeed/fail with validation, 4th must trigger rate limit
const testIp = `192.168.${Math.floor(Math.random() * 200)}.${Date.now() % 250}`
await submit(base, null, '', '', testIp)
await submit(base, null, '', '', testIp)
await submit(base, null, '', '', testIp)
const rateLimitedHtml = await submit(base, null, '', '', testIp)
check('Rate limiter memblokir submission ke-4 dari IP yang sama', /Terlalu banyak pengiriman/i.test(extractErr(rateLimitedHtml) || ''), extractErr(rateLimitedHtml))

// 3. Pengiriman valid (small PDF)
html = await submit(base, validPdf, 'cv.pdf', 'application/pdf')
const ref = html.match(/ESU-[A-Z0-9]{6}/)?.[0]
check('Lamaran valid berhasil + nomor referensi', !!ref && html.includes('apply-success'), ref || extractErr(html))

// 3b. Pengiriman file besar (> 1MB, e.g. 2MB CV) untuk memastikan batas serverActions bodySizeLimit 10MB bekerja
const bigPdf = fs.readFileSync('scratch-test/cv-2mb.pdf')
const bigHtml = await submit({ ...base, name: 'Calon Berkas Besar' }, bigPdf, 'cv-2mb.pdf', 'application/pdf')
const bigRef = bigHtml.match(/ESU-[A-Z0-9]{6}/)?.[0]
check('Upload CV berukuran >1MB (2MB) berhasil tanpa error "Failed to fetch"', !!bigRef && bigHtml.includes('apply-success'), bigRef || extractErr(bigHtml))

// 4. Verifikasi DB & Storage
if (ref) {
  const rows = await (await sb(`/rest/v1/applications?ref_code=eq.${ref}&select=*`)).json()
  check('Baris tersimpan di tabel applications', rows.length === 1 && rows[0].status === 'new' && rows[0].email === 'budi@example.com', JSON.stringify(rows[0] && { name: rows[0].name, status: rows[0].status, cv: rows[0].cv_path }))
  check('Catatan berisi HTML tersimpan apa adanya (bukan dieksekusi)', rows[0]?.cover_note === 'Tes <b>lamaran</b>')

  const dl = await sb(`/storage/v1/object/cv/${rows[0].cv_path}`)
  const body = Buffer.from(await dl.arrayBuffer())
  check('CV tersimpan di bucket cv (service role)', dl.status === 200 && body.subarray(0, 4).toString() === '%PDF', String(dl.status))

  const pub = await fetch(`${SURL}/storage/v1/object/public/cv/${rows[0].cv_path}`)
  check('CV TIDAK bisa diakses publik (bucket privat)', pub.status >= 400, String(pub.status))

  // Admin: inbox menampilkan, unduh CV via signed URL
  r = await fetch(`${BASE}/admin/applications`, { headers: { cookie } })
  const inbox = await r.text()
  check('Inbox admin menampilkan lamaran', inbox.includes(ref) && inbox.includes('Budi Tester'))

  const id = rows[0].id
  r = await fetch(`${BASE}/admin/applications/cv/${id}`, { redirect: 'manual' })
  check('Unduh CV tanpa login ditolak', r.status !== 200 && !(r.headers.get('location') || '').includes('token'), String(r.status))
  r = await fetch(`${BASE}/admin/applications/cv/${id}`, { redirect: 'manual', headers: { cookie } })
  const loc = r.headers.get('location') || ''
  check('Unduh CV admin -> redirect signed URL', r.status >= 300 && r.status < 400 && loc.includes('token='), String(r.status))
  if (loc) {
    const f = await fetch(loc.startsWith('http') ? loc : SURL + loc)
    check('Signed URL mengembalikan file PDF', f.status === 200 && (await f.text()).startsWith('%PDF'), String(f.status))
  }

  // 5. Test HR email setting: ubah ke recruitment@esu.co.id
  await sb('/rest/v1/app_settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key: 'hr_email', value: 'recruitment@esu.co.id' })
  })
  r = await fetch(`${BASE}/career/1`)
  const updatedCareerHtml = await r.text()
  check('Setting HR email mengubah mailto di /career/1', updatedCareerHtml.includes('mailto:recruitment@esu.co.id'), 'mailto:recruitment@esu.co.id')

  // 6. Test update status lamaran (ubah ke 'interview')
  await sb(`/rest/v1/applications?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'interview' })
  })
  const updatedRows = await (await sb(`/rest/v1/applications?id=eq.${id}&select=status`)).json()
  check('Status lamaran berhasil diupdate ke "interview"', updatedRows[0]?.status === 'interview', updatedRows[0]?.status)

  // 7. Test delete lamaran & file CV di storage
  await sb(`/storage/v1/object/cv`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [rows[0].cv_path] })
  })
  await sb(`/rest/v1/applications?id=eq.${id}`, { method: 'DELETE' })
  const deletedRows = await (await sb(`/rest/v1/applications?id=eq.${id}&select=id`)).json()
  check('Lamaran berhasil dihapus dari tabel applications', deletedRows.length === 0)
  const deletedFile = await sb(`/storage/v1/object/cv/${rows[0].cv_path}`)
  const delBody = await deletedFile.text()
  check('File CV di bucket cv berhasil dibersihkan', deletedFile.status >= 400 && delBody.includes('not_found'), `${deletedFile.status} ${delBody}`)

  if (bigRef) {
    const bigRows = await (await sb(`/rest/v1/applications?ref_code=eq.${bigRef}&select=id,cv_path`)).json()
    if (bigRows[0]) {
      await sb(`/storage/v1/object/cv`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: [bigRows[0].cv_path] })
      })
      await sb(`/rest/v1/applications?id=eq.${bigRows[0].id}`, { method: 'DELETE' })
    }
  }
}

console.log(`\n${results.filter(Boolean).length}/${results.length} lulus`)
process.exit(results.every(Boolean) ? 0 : 1)
