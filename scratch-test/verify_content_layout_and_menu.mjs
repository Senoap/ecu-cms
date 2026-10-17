// scratch-test/verify_content_layout_and_menu.mjs
import fs from 'fs'
import assert from 'assert'

console.log('=== VERIFYING CONTENT LAYOUT AND MENU INTEGRATION ===\n')

// 1. Verify AdminLayoutClient.tsx
const adminLayout = fs.readFileSync('app/admin/AdminLayoutClient.tsx', 'utf8')

// Check that scheduled-content is inside websiteItems
assert(
  adminLayout.includes("href: '/admin/scheduled-content'"),
  'AdminLayoutClient must include /admin/scheduled-content'
)
assert(
  adminLayout.includes("websiteItems = [") &&
  adminLayout.includes("id: 'scheduled-content'"),
  'AdminLayoutClient must have scheduled-content in websiteItems'
)
console.log('✔ AdminLayoutClient: scheduled-content is inside websiteItems (Halaman Website)')

// Check that separate contentItems and "Konten & Jadwal" submenu are removed
assert(
  !adminLayout.includes('const contentItems ='),
  'AdminLayoutClient must NOT have separate contentItems'
)
assert(
  !adminLayout.includes('<span>Konten & Jadwal</span>'),
  'AdminLayoutClient must NOT have separate "Konten & Jadwal" submenu header'
)
console.log('✔ AdminLayoutClient: standalone "Konten & Jadwal" submenu removed')

// 2. Verify HomeClient.tsx
const homeClient = fs.readFileSync('components/HomeClient.tsx', 'utf8')
assert(
  homeClient.includes("sec.id === 'scheduled-content' || sec.type === 'scheduled-content'"),
  'HomeClient must render scheduled-content dynamically in activeSections map'
)
console.log('✔ HomeClient: scheduled-content renders dynamically according to section layout order')

// 3. Verify lib/db.ts
const dbCode = fs.readFileSync('lib/db.ts', 'utf8')
assert(
  dbCode.includes("id: 'scheduled-content'") && dbCode.includes("type: 'scheduled-content'"),
  'lib/db.ts must have scheduled-content in default sections'
)
assert(
  dbCode.includes("s.id === 'scheduled-content'"),
  'lib/db.ts enrichContent and processParsedData must handle scheduled-content'
)
console.log('✔ lib/db.ts: scheduled-content defined and enriched in database sections')

// 4. Verify data/db.json
const dbJson = JSON.parse(fs.readFileSync('data/db.json', 'utf8'))
const draftSection = dbJson.sections.find((s) => s.id === 'scheduled-content')
const publishedSection = dbJson.published.sections.find((s) => s.id === 'scheduled-content')

assert(draftSection, 'data/db.json draft sections must include scheduled-content')
assert(publishedSection, 'data/db.json published sections must include scheduled-content')
console.log('✔ data/db.json: scheduled-content present in both draft and published sections')

// 5. Test fetching from live dev server
async function testServer() {
  const res = await fetch('http://localhost:3001/admin/scheduled-content', {
    redirect: 'manual'
  })
  // Should redirect to login or return 200 if authed
  assert(res.status === 200 || res.status === 307, `Expected 200 or 307, got ${res.status}`)
  console.log('✔ Server route /admin/scheduled-content responded with HTTP', res.status)

  const homeRes = await fetch('http://localhost:3001')
  const homeHtml = await homeRes.text()
  assert(homeRes.status === 200, 'Home page must return 200')
  console.log('✔ Home page loads successfully (HTTP 200)')
}

testServer().then(() => {
  console.log('\n=== ALL CONTENT LAYOUT AND MENU TESTS PASSED! ===')
}).catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
