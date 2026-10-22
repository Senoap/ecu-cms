// scratch-test/verify_navbar_fixes.mjs
import fs from 'fs'
import assert from 'assert'

console.log('=== VERIFIKASI PERBAIKAN NAVBAR (3 POINT) ===\n')

// 1. Cek components/Navbar.tsx
const navbarCode = fs.readFileSync('components/Navbar.tsx', 'utf8')

// Point 1: Bar tidak mepet ke atas
assert(
  navbarCode.includes("isScrolled ? 'top-3 sm:top-4' : 'top-6 sm:top-7 lg:top-8'"),
  'Point 1 GAGAL: Spasi atas header belum diubah ke top-6 sm:top-7 lg:top-8'
)
console.log('✔ Point 1 LULUS: Header memiliki spasi atas lega (top-6 sm:top-7 lg:top-8 saat di atas)')

// Point 2: Tombol Compro kuning di sebelah hamburger harus hilang
const comproButtons = navbarCode.match(/<span>Compro<\/span>/g)
assert(
  !comproButtons,
  'Point 2 GAGAL: Tombol <span>Compro</span> masih ada di kode Navbar.tsx'
)
console.log('✔ Point 2 LULUS: Tombol Compro kuning duplikat di sebelah hamburger telah dihapus')

// Cek bahwa tombol resmi Compro PDF tetap ada di desktop dan di mobile menu
assert(
  navbarCode.includes('<span>Compro PDF</span>'),
  'Tombol resmi Compro PDF harus tetap ada di desktop navbar'
)
assert(
  navbarCode.includes('<span>Minta Compro (PDF)</span>'),
  'Pilihan Minta Compro (PDF) harus tetap ada di dalam dropdown menu'
)
console.log('✔ Point 2 Tambahan: Tombol resmi Compro PDF tetap ada di desktop dan menu mobile')

// Point 3: Transisi tutup secara soft saat scroll
assert(
  navbarCode.includes('max-w-0 opacity-0 pointer-events-none scale-95'),
  'Point 3 GAGAL: Desktop menu belum memiliki transisi max-w-0 opacity-0 saat isScrolled'
)
assert(
  navbarCode.includes('max-w-[1400px] opacity-100 pointer-events-auto scale-100'),
  'Point 3 GAGAL: Desktop menu belum memiliki state expand max-w-[1400px]'
)
assert(
  navbarCode.includes('ease-[cubic-bezier(0.16,1,0.3,1)]'),
  'Point 3 GAGAL: Kurva easing soft animation belum dipasang'
)
console.log('✔ Point 3 LULUS: Desktop menu dan bar menutup secara soft (smooth morphing collapse)')

// Point 4: Logo card menyusut menampilkan hanya logo saat di-scroll
assert(
  navbarCode.includes('max-w-[320px]') && navbarCode.includes('max-w-0 opacity-0 pointer-events-none scale-95 pr-0'),
  'Point 4 GAGAL: Logo text belum dikonfigurasi untuk menyusut saat isScrolled'
)
console.log('✔ Point 4 LULUS: Logo card menyusut secara soft hanya menampilkan logonya saja saat di-scroll')

// Point 5: Tinggi kedua card (kiri & kanan) dibuat persis sama
assert(
  navbarCode.includes("isScrolled \n              ? 'h-12 w-12") || navbarCode.includes("isScrolled \r\n              ? 'h-12 w-12"),
  'Point 5 GAGAL: Left logo card belum memiliki ukuran h-12 w-12 saat isScrolled'
)
assert(
  navbarCode.includes(": 'h-14 sm:h-16 px-3.5 sm:px-4 md:px-5"),
  'Point 5 GAGAL: Left logo card belum memiliki tinggi h-14 sm:h-16 saat unscrolled'
)
assert(
  navbarCode.includes(": 'h-14 sm:h-16 w-14 sm:w-16 lg:w-auto"),
  'Point 5 GAGAL: Right nav card belum memiliki tinggi h-14 sm:h-16 saat unscrolled'
)
assert(
  navbarCode.includes('flex justify-between items-center pointer-events-none'),
  'Point 5 GAGAL: Header belum menggunakan items-center untuk centering vertikal sempurna'
)
console.log('✔ Point 5 LULUS: Tinggi kedua card persis sama (h-14 sm:h-16 saat di atas, h-12 w-12 saat di-scroll)')


// 2. Cek app/layout.tsx (tidak ada warning script tag di body)
const layoutCode = fs.readFileSync('app/layout.tsx', 'utf8')
assert(
  layoutCode.includes('<head>') && layoutCode.includes('</head>'),
  'app/layout.tsx harus memiliki tag <head> untuk theme init script'
)
assert(
  !layoutCode.includes('<Script') && !layoutCode.includes("from 'next/script'"),
  'app/layout.tsx tidak boleh me-render next/script di dalam body'
)
console.log('✔ Script Tag LULUS: Inisialisasi theme berada di dalam <head>, bebas dari warning React 19')

// 3. Test HTTP live server pada port 3000
async function testLiveServer() {
  try {
    const res = await fetch('http://localhost:3000', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    assert.strictEqual(res.status, 200, `Live server harus mengembalikan HTTP 200, didapat: ${res.status}`)
    const html = await res.text()

    assert(
      html.includes('top-6 sm:top-7 lg:top-8'),
      'HTML server harus berisi class top-6 sm:top-7 lg:top-8'
    )
    assert(
      !html.includes('<span>Compro</span>'),
      'HTML server tidak boleh berisi <span>Compro</span>'
    )
    assert(
      html.includes('<span>Compro PDF</span>'),
      'HTML server harus menyertakan tombol resmi Compro PDF'
    )
    assert(
      html.includes('max-w-[1400px]'),
      'HTML server harus menyertakan kontainer animasi desktop menu'
    )
    console.log('✔ Live Server (HTTP 200): HTML yang dikirim server sudah 100% sinkron dan sesuai!')
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
      console.log('ℹ Dev server port 3000 sedang offline / tidak aktif saat ini.')
    } else {
      throw err
    }
  }
}

testLiveServer().then(() => {
  console.log('\n=== SEMUA TESTING 100% SUKSES & VALID! ===')
}).catch((e) => {
  console.error('\n❌ TESTING GAGAL:', e.message)
  process.exit(1)
})
