import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return String(unsafe ?? '')
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Helpers for OpenXML run generation
function run(text, options = {}) {
  const { bold, italic, color, size, font } = options
  let rPr = '<w:rPr>'
  rPr += `<w:rFonts w:ascii="${font || 'Calibri'}" w:hAnsi="${font || 'Calibri'}"/>`
  if (bold) rPr += '<w:b/>'
  if (italic) rPr += '<w:i/>'
  if (color) rPr += `<w:color w:val="${color}"/>`
  if (size) rPr += `<w:sz w:val="${size}"/>`
  rPr += '</w:rPr>'

  if (typeof text !== 'string') text = String(text ?? '')
  const parts = text.split('\n')
  let content = ''
  parts.forEach((part, index) => {
    if (index > 0) content += '<w:br/>'
    if (part.length > 0) {
      content += `<w:t xml:space="preserve">${escapeXml(part)}</w:t>`
    }
  })
  return `<w:r>${rPr}${content}</w:r>`
}

// Paragraph generator strictly conforming to ECMA-376 schema order:
// pStyle -> pBdr -> shd -> tabs -> spacing -> ind -> jc -> rPr
function para(runs = [], options = {}) {
  const { align, spaceBefore = 80, spaceAfter = 120, line = 276, bullet = false, callout = false, style } = options
  let pPr = '<w:pPr>'
  if (style) {
    pPr += `<w:pStyle w:val="${style}"/>`
  }
  if (callout) {
    pPr += '<w:pBdr><w:left w:val="single" w:sz="36" w:space="15" w:color="6B0808"/></w:pBdr>'
    pPr += '<w:shd w:val="clear" w:color="auto" w:fill="F8F9FA"/>'
  }
  pPr += `<w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}" w:line="${line}" w:lineRule="auto"/>`
  if (bullet) {
    pPr += '<w:ind w:left="360" w:hanging="240"/>'
  } else if (callout) {
    pPr += '<w:ind w:left="240" w:right="240"/>'
  }
  if (align) {
    pPr += `<w:jc w:val="${align}"/>`
  }
  pPr += '</w:pPr>'

  let runXml = ''
  if (Array.isArray(runs)) {
    runXml = runs.map(r => {
      if (typeof r === 'string') return run(r)
      return run(r.text, r)
    }).join('')
  } else if (typeof runs === 'string') {
    runXml = run(runs)
  }

  return `<w:p>${pPr}${runXml}</w:p>`
}

function heading1(text) {
  return para([
    { text, bold: true, size: 28, color: '6B0808', font: 'Calibri' }
  ], { spaceBefore: 300, spaceAfter: 140, line: 320 })
}

function heading2(text) {
  return para([
    { text, bold: true, size: 24, color: '1E293B', font: 'Calibri' }
  ], { spaceBefore: 240, spaceAfter: 100, line: 300 })
}

function heading3(text) {
  return para([
    { text, bold: true, size: 21, color: '334155', font: 'Calibri' }
  ], { spaceBefore: 180, spaceAfter: 80, line: 280 })
}

function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
}

// Table generator strictly conforming to ECMA-376 schema order
function table(headers, rows, colWidths = []) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) || 9360
  
  let xml = '<w:tbl>'
  xml += '<w:tblPr>'
  xml += `<w:tblW w:w="${totalWidth}" w:type="dxa"/>`
  xml += '<w:tblBorders>'
  xml += '<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
  xml += '<w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
  xml += '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
  xml += '<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
  xml += '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
  xml += '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
  xml += '</w:tblBorders>'
  xml += '<w:tblCellMar>'
  xml += '<w:top w:w="120" w:type="dxa"/>'
  xml += '<w:bottom w:w="120" w:type="dxa"/>'
  xml += '<w:left w:w="150" w:type="dxa"/>'
  xml += '<w:right w:w="150" w:type="dxa"/>'
  xml += '</w:tblCellMar>'
  xml += '</w:tblPr>'

  // Grid
  xml += '<w:tblGrid>'
  colWidths.forEach(w => {
    xml += `<w:gridCol w:w="${w}"/>`
  })
  xml += '</w:tblGrid>'

  // Header Row
  if (headers && headers.length > 0) {
    xml += '<w:tr>'
    xml += '<w:trPr><w:tblHeader/></w:trPr>'
    headers.forEach((h, idx) => {
      const w = colWidths[idx] || 2000
      xml += '<w:tc>'
      xml += `<w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="6B0808"/></w:tcPr>`
      xml += para([{ text: h, bold: true, color: 'FFFFFF', size: 19 }], { align: 'left', spaceBefore: 60, spaceAfter: 60 })
      xml += '</w:tc>'
    })
    xml += '</w:tr>'
  }

  // Data Rows
  rows.forEach((r, rIdx) => {
    const isEven = rIdx % 2 === 1
    const bgFill = isEven ? 'F8F9FA' : 'FFFFFF'
    xml += '<w:tr>'
    r.forEach((cell, cIdx) => {
      const w = colWidths[cIdx] || 2000
      xml += '<w:tc>'
      xml += `<w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${bgFill}"/></w:tcPr>`
      
      if (typeof cell === 'string') {
        if (cell.startsWith('<w:p')) {
          xml += cell
        } else if (cell.trim().length === 0) {
          xml += para([], { spaceBefore: 40, spaceAfter: 40 })
        } else {
          xml += para([{ text: cell, size: 18, color: '1E293B' }], { spaceBefore: 40, spaceAfter: 40 })
        }
      } else if (Array.isArray(cell)) {
        if (cell.length === 0) {
          xml += para([], { spaceBefore: 40, spaceAfter: 40 })
        } else {
          cell.forEach(item => {
            if (typeof item === 'string' && item.startsWith('<w:p')) {
              xml += item
            } else if (typeof item === 'string') {
              xml += para([{ text: item, size: 18, color: '1E293B' }], { spaceBefore: 40, spaceAfter: 40 })
            } else if (item && typeof item === 'object') {
              xml += para([item], { spaceBefore: 40, spaceAfter: 40 })
            }
          })
        }
      } else if (cell && typeof cell === 'object') {
        xml += para([cell], { spaceBefore: 40, spaceAfter: 40 })
      } else {
        xml += para([], { spaceBefore: 40, spaceAfter: 40 })
      }

      xml += '</w:tc>'
    })
    xml += '</w:tr>'
  })

  xml += '</w:tbl>'
  return xml
}

// Generate full Document Content (Body)
function generateDocumentBodyXml() {
  let doc = ''

  // === HALAMAN COVER / JUDUL ===
  doc += para([
    { text: 'PROPOSAL PENAWARAN RESMI & ALUR IMPLEMENTASI SISTEM', bold: true, size: 19, color: '6B0808', font: 'Calibri' }
  ], { align: 'center', spaceBefore: 240, spaceAfter: 120 })

  doc += para([
    { text: 'PENGEMBANGAN WEBSITE COMPANY PROFILE, CMS ENTERPRISE,\nINFRASTRUKTUR CLOUD & REDESAIN COMPRO PDF', bold: true, size: 36, color: '1E293B', font: 'Calibri' }
  ], { align: 'center', spaceBefore: 120, spaceAfter: 200, line: 380 })

  doc += para([
    { text: 'Solusi Digital Terpadu Berbasis Next.js 16 SSR, Progressive Web App (PWA) Mandiri, Smart Viewport Multi-Window Engine, Penyimpanan Berkas Lamaran Privat & Cloud Terisolasi', italic: true, size: 21, color: '475569' }
  ], { align: 'center', spaceBefore: 0, spaceAfter: 360 })

  // Meta Table
  doc += table(
    [],
    [
      [{ text: 'Nomor Dokumen', bold: true, size: 18, color: '334155' }, { text: 'PROP-WEB/4SU/2026/001-REV', bold: true, size: 18, color: '6B0808' }],
      [{ text: 'Tanggal Terbit', bold: true, size: 18, color: '334155' }, { text: '20 Oktober 2026 (Revisi Pembaruan Spek & Paket Vendor)', size: 18 }],
      [{ text: 'Kepada Yth.', bold: true, size: 18, color: '334155' }, { text: 'Direksi PT. Empat Sinergi Utama', bold: true, size: 18 }],
      [{ text: 'Penyusun Penawaran', bold: true, size: 18, color: '334155' }, { text: 'Fullstack Lead Developer & Cloud Infrastructure Architect', size: 18 }],
      [{ text: 'Target Go-Live Publik', bold: true, size: 18, color: '334155' }, { text: 'Minggu, 8 November 2026 (Pukul 23:59 WIB)', bold: true, size: 18, color: '047857' }],
      [{ text: 'Nilai Kontrak Fixed', bold: true, size: 18, color: '334155' }, { text: 'Rp 9.000.000 (Sembilan Juta Rupiah) — Fixed All-in', bold: true, size: 18, color: '6B0808' }]
    ],
    [2800, 6560]
  )

  doc += pageBreak()

  // === BAB 1: RINGKASAN EKSEKUTIF ===
  doc += heading1('1. RINGKASAN EKSEKUTIF & LATAR BELAKANG PROYEK')
  doc += para([
    { text: 'Dokumen ini merupakan pembaruan resmi atas rencana pengadaan dan pengembangan ekosistem digital untuk ' },
    { text: 'PT. Empat Sinergi Utama', bold: true },
    { text: ' (4SU). Melalui inisiatif ini, perusahaan bertransformasi dari sekadar memiliki profil statis menjadi memiliki platform digital yang berstandar enterprise, cepat, aman, dan mudah dikelola secara mandiri oleh tim internal.' }
  ])

  doc += para([
    { text: 'Tiga pilar utama dalam proyek ini mencakup:\n' },
    { text: '1. Website Company Profile Modern (Publik): ', bold: true },
    { text: 'Menampilkan legalitas, sertifikasi Mabes Polri & ISO, portofolio mitra kementerian/pemerintah, serta rekrutmen kerja dengan performa tinggi berkat Next.js 16 App Router dan fitur responsif cerdas (Smart Viewport Engine).\n' },
    { text: '2. Dashboard Halaman CMS Mandiri (Internal): ', bold: true },
    { text: 'Pusat kendali operasional terisolasi di subdomain mandiri dengan Progressive Web App (PWA) siap instal di desktop/mobile staf, kontrol Superadmin untuk memonitor sesi live dan kick user, serta pengelolaan pelamar kerja dengan penyimpanan dokumen CV di Object Storage privat bertanda tangan waktu kadaluwarsa.\n' },
    { text: '3. Infrastruktur Cloud Khusus & Email Bisnis: ', bold: true },
    { text: 'Pengadaan Domain resmi .CO.ID 3-4 karakter (PANDI), Cloud VPS NEO Lite MS 4.4 Biznet Gio (4 Core vCPU, 4 GB RAM, 60 GB SSD NVMe), dan Mailspace Lite Domainesia 10 Akun Bisnis anti-spam.' }
  ])

  doc += para([
    { text: 'KESEPAKATAN TENGGAT WAKTU & DATA KLIEN: ', bold: true, color: '6B0808' },
    { text: 'Sebelum finalisasi dan pengujian sistem, pihak klien (PT. Empat Sinergi Utama) mengirimkan berkas materi lengkap (teks profil, legalitas resmi, foto layanan Satpam berlisensi, Cleaning Service, Driver, portofolio mitra Kemenpora & Pemkot Tangsel, serta sertifikasi ISO/Mabes Polri) untuk diinput ke basis data.' }
  ], { callout: true })

  // === BAB 2: PENJELASAN KOMPONEN INFRASTRUKTUR ===
  doc += heading1('2. PENJELASAN TEKNIS KOMPONEN INFRASTRUKTUR PIHAK KETIGA')
  doc += para([
    { text: 'Untuk memastikan keandalan, keamanan, dan kedaulatan data perusahaan secara jangka panjang, infrastruktur sistem dibagi ke dalam 3 komponen spesifik yang beroperasi di penyedia berlisensi resmi Indonesia:' }
  ])

  // Callout Komitmen Anggaran
  doc += para([
    { text: 'KOMITMEN ANGGARAN & STRATEGI EKSEKUSI TEPAT WAKTU (FIXED RP 9.000.000)\n', bold: true, size: 19, color: '6B0808' },
    { text: 'Meskipun terdapat peningkatan spesifikasi paket cloud dari rencana semula (dari Nebula 2 vCPU/2GB menjadi NEO Lite 4 vCPU/4GB RAM), total nilai investasi pengembangan tetap ' },
    { text: 'DIKUNCI PADA NILAI TETAP Rp 9.000.000 (All-in)', bold: true },
    { text: '. Seluruh penyesuaian biaya pihak ketiga (Domain .co.id, Cloud VPS NEO Lite, dan Mailspace Lite) telah diserap ke dalam alokasi paket pengerjaan profesional tanpa ada penambahan biaya kepada PT. Empat Sinergi Utama.' }
  ], { callout: true })

  doc += heading2('2.1. Domain Resmi Tingkat Tinggi: .CO.ID (3 – 4 Karakter)')
  doc += para([
    { text: 'Domain dengan ekstensi ' },
    { text: '.CO.ID', bold: true },
    { text: ' merupakan identitas digital tertinggi untuk badan usaha resmi di Indonesia yang diatur langsung oleh Perkumpulan Pengelola Nama Domain Internet Indonesia (PANDI). Registrasi domain ini mensyaratkan verifikasi legalitas dokumen negara (NIB, NPWP, Akta Notaris PT. Empat Sinergi Utama).' }
  ])
  doc += para([
    { text: '• Reputasi & Kepercayaan Publik: ', bold: true },
    { text: 'Memberikan jaminan hukum bahwa pemilik website adalah perseroan berbadan hukum resmi, bukan entitas fiktif. Sangat krusial saat mengikuti lelang (tender) pengadaan di instansi pemerintah dan BUMN.' }
  ], { bullet: true })
  doc += para([
    { text: '• Karakter Eksklusif (3-4 Karakter): ', bold: true },
    { text: 'Nama domain pendek (seperti 4su.co.id) memiliki nilai prestise tinggi, mudah diingat oleh mitra dan klien, serta meminimalkan kesalahan ketik (*typo*) pada alamat email surat-menyurat resmi.' }
  ], { bullet: true })
  doc += para([
    { text: '• Keamanan DNS & Privasi: ', bold: true },
    { text: 'Termasuk proteksi DNSSEC (Domain Name System Security Extensions) untuk menangkal pembajakan rute DNS (*DNS spoofing*) dan sertifikat Whois Protection resmi.' }
  ], { bullet: true })

  doc += heading2('2.2. Cloud VPS NEO Lite MS 4.4 (Biznet Gio Cloud)')
  doc += para([
    { text: 'Sistem aplikasi web dan CMS PT. Empat Sinergi Utama tidak menggunakan shared-hosting murahan, melainkan peladen awan virtual khusus berstandar enterprise: ' },
    { text: 'NEO Lite MS 4.4 dari Biznet Gio', bold: true },
    { text: ', salah satu penyedia cloud Tier-3 data center terkemuka di Indonesia.' }
  ])
  doc += para([
    { text: '• Spesifikasi Kinerja Tinggi: ', bold: true },
    { text: 'Ditenagai 4 Core vCPU Virtual Processor, 4 GB RAM DDR4, dan 60 GB SSD NVMe Storage ultra-cepat. Spesifikasi ini 2x lipat lebih bertenaga dibandingkan paket standar entry-level, menjamin beban kerja rendering Next.js 16 SSR dan query basis data berjalan tanpa jeda (*zero latency*).' }
  ], { bullet: true })
  doc += para([
    { text: '• Lokasi Data Center Indonesia (Low Latency): ', bold: true },
    { text: 'Berada di Tier-3 Green Data Center Biznet di Indonesia dengan latensi koneksi domestik di bawah 10 milidetik, memenuhi regulasi penempatan data perbankan dan kedaulatan data nasional (UU PDP No. 27/2022).' }
  ], { bullet: true })
  doc += para([
    { text: '• Dedicated IP Publik & Bandwidth Unmetered: ', bold: true },
    { text: 'Alamat IP publik khusus milik PT. Empat Sinergi Utama dengan koneksi jaringan unmetered tanpa batasan kuota transfer data bulanan.' }
  ], { bullet: true })
  doc += para([
    { text: '• Isolasi Sistem Aman: ', bold: true },
    { text: 'Lingkungan komputasi terisolasi mandiri dengan sistem operasi Linux Ubuntu Server 24.04 LTS, container Docker Compose, dan firewall proteksi UFW untuk menangkal serangan DDoS serta eksploitasi port.' }
  ], { bullet: true })

  doc += heading2('2.3. Mailspace Lite Bisnis 10 Akun (Domainesia)')
  doc += para([
    { text: 'Layanan ' },
    { text: 'Mailspace Lite', bold: true },
    { text: ' adalah solusi hosting email bisnis independen yang memisahkan lalu lintas email resmi perusahaan dari server website.' }
  ])
  doc += para([
    { text: '• 10 Akun Email Resmi (@domain.co.id): ', bold: true },
    { text: 'Dapat dialokasikan untuk kebutuhan divisi vital, misalnya: direksi@, hrd@, procurement@, sales@, operasional@, dan info@.' }
  ], { bullet: true })
  doc += para([
    { text: '• Kapasitas Penyimpanan: ', bold: true },
    { text: 'Setiap akun memiliki kuota mandiri 2 GB (Total 20 GB penyimpanan surat), cukup untuk menyimpan puluhan ribu arsip email dan lampiran proposal kontrak kerja sama.' }
  ], { bullet: true })
  doc += para([
    { text: '• Anti-Spam MailShield & Reputasi Terjamin: ', bold: true },
    { text: 'Dilengkapi filter cerdas MailShield, serta konfigurasi SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), dan DMARC. Menjamin setiap surat penawaran dan dokumen Compro PDF yang dikirimkan tidak pernah masuk ke folder Spam/Junk penerima.' }
  ], { bullet: true })
  doc += para([
    { text: '• Aksesibilitas Modern: ', bold: true },
    { text: 'Dapat dibuka melalui Webmail modern berbasis browser, serta disinkronkan ke aplikasi Microsoft Outlook di laptop/PC, Apple Mail (iOS/Mac), maupun aplikasi smartphone Android via protokol IMAP/SMTP terenkripsi SSL.' }
  ], { bullet: true })

  doc += pageBreak()

  // === BAB 3: FITUR WEBSITE COMPRO & CMS ===
  doc += heading1('3. RINCIAN FITUR WEBSITE COMPRO & HALAMAN CMS')
  doc += para([
    { text: 'Seluruh arsitektur kode dan antarmuka telah disesuaikan dengan kebutuhan operasional terkini PT. Empat Sinergi Utama tanpa template instan AI, menggunakan teknologi mutakhir Next.js 16 dan React 19:' }
  ])

  doc += heading2('3.1. Fitur Website Company Profile (Publik)')
  doc += para([
    { text: 'Website profil publik difokuskan pada kredibilitas, kecepatan akses, dan kemudahan calon mitra bisnis maupun pelamar kerja dalam mengeksplorasi layanan perusahaan:' }
  ])

  doc += table(
    ['No', 'Nama Fitur Web Compro', 'Penjelasan Teknis & Manfaat Nyata'],
    [
      [
        '1',
        'Smart Viewport Engine\n(Adaptif Multi-Window)',
        'Fitur responsif cerdas yang mampu mendeteksi ukuran layar secara real-time. Jika pengguna membagi layar menjadi 2 jendela (split-screen) atau 4 jendela (kuadran) di Windows Snap, macOS Split View, atau tablet, seluruh teks, kartu layanan, dan navigasi otomatis menyesuaikan proporsinya tanpa terpotong (*no clipping*).'
      ],
      [
        '2',
        'Hero Showcase Card Interaktif',
        'Bagian pembuka megah dengan tagline korporat, tombol ajakan aksi (Call-to-Action), serta Hero Showcase Card interaktif yang menampilkan 4 pilar: Kekuatan Utama (Satpam Berlisensi & ISO), Metrik Kinerja (Uptime 99.8%), Sektor Layanan, dan Peran Tenaga Kerja Ahli.'
      ],
      [
        '3',
        'Seksi Konten Berkala\n(Scheduled Content)',
        'Area dinamis untuk menampilkan Konten Harian dan Konten Bulanan (seperti jadwal apel gabungan, pengumuman penempatan personel, dan berita terkini perusahaan) yang dapat dijadwalkan oleh admin CMS.'
      ],
      [
        '4',
        'Profil Perusahaan &\nJajaran Pimpinan',
        'Penyajian visi, misi, nilai budaya kerja 4SU, bagan struktur organisasi, serta foto profil Dewan Direksi dan Manajemen Berwenang yang elegan dan membangun impresi profesional.'
      ],
      [
        '5',
        'Pilar Layanan Komprehensif',
        'Katalog detail untuk 4 sektor spesialisasi: Jasa Pengamanan Berlisensi (Security Guards bersertifikasi Gada Pratama/Madya), Jasa Kebersihan (Cleaning Service komersial & industri), Pengemudi Profesional (Driver korporat), dan Penyediaan Tenaga Kerja Ahli (Outsourcing terpadu).'
      ],
      [
        '6',
        'Portofolio Kemitraan Strategis',
        'Daftar klien terpercaya yang telah bermitra (Kemenpora RI, Pemerintah Kota Tangerang Selatan, kawasan industri, dsb.) dengan deskripsi cakupan pengamanan dan bukti kinerja.'
      ],
      [
        '7',
        'Legalitas & Sertifikasi Mabes Polri / ISO',
        'Showcase legalitas hukum resmi perseroan: Surat Izin Operasional (SIO) Mabes Polri, Sertifikasi Sistem Manajemen Mutu ISO 9001, ISO 14001, dan ISO 45001 (K3 Pengamanan) guna memenuhi prasyarat tender BUMN/Swasta.'
      ],
      [
        '8',
        'Galeri Apel Carousel Triple-Buffer',
        'Koleksi foto dokumentasi apel kesiapsiagaan, simulasi tanggap darurat, dan serah terima tugas dengan slider carousel triple-buffer yang halus tanpa jeda loading.'
      ],
      [
        '9',
        'Unduh Compro PDF Otomatis via SMTP',
        'Formulir interaktif bagi calon mitra bisnis yang ingin mendapatkan dokumen Company Profile PDF resmi. Sistem secara otomatis mencatat data prospek (Lead Generation) dan mengirimkan berkas PDF resolusi tinggi ke email calon klien seketika.'
      ],
      [
        '10',
        'Portal Karir & Rekrutmen Terpadu',
        'Halaman lowongan pekerjaan online yang memungkinkan calon personel satpam/karyawan melamar secara langsung dengan mengisi data diri, kualifikasi fisik, sertifikat Gada, serta mengunggah berkas CV.'
      ],
      [
        '11',
        'Banner Persetujuan Privasi (UU PDP)',
        'Consent Banner kepatuhan Undang-Undang Perlindungan Data Pribadi No. 27 Tahun 2022. Memastikan seluruh data pelamar dan calon klien terlindungi secara hukum.'
      ],
      [
        '12',
        'Mode Tampilan Gelap & Terang Korporat',
        'Dukungan Dark Mode dan Light Mode yang nyaman di mata dengan palet warna resmi perseroan (Deep Crimson Maroon & Slate Grey) tanpa elemen grafis berlebih.'
      ],
      [
        '13',
        'Bebas PWA di Sisi Publik',
        'Website publik sengaja dibebaskan dari tombol instalasi PWA agar calon klien korporat dapat menikmati pengalaman penjelajahan situs yang bersih dan elegan tanpa banner pop-up aplikasi.'
      ]
    ],
    [500, 2860, 6000]
  )

  doc += heading2('3.2. Fitur Halaman CMS Mandiri (Pusat Kendali Pengelola)')
  doc += para([
    { text: 'Halaman CMS (Content Management System) merupakan pusat kendali mandiri berstandar enterprise yang dirancang agar manajemen dan staf PT. Empat Sinergi Utama dapat memperbarui seluruh isi website secara mandiri tanpa memerlukan bantuan programmer:' }
  ])

  doc += table(
    ['No', 'Nama Fitur Halaman CMS', 'Penjelasan Teknis & Nilai Manfaat Operasional'],
    [
      [
        '1',
        'Isolasi Subdomain Khusus\n(admin.domain.co.id)',
        'Panel CMS dioperasikan pada rute/subdomain terpisah dengan jalur login terenkripsi, memisahkan sesi browsing publik dari lingkungan administratif perbankan.'
      ],
      [
        '2',
        'Progressive Web App (PWA)\nKhusus Halaman CMS',
        'Khusus untuk Halaman CMS, tersedia fitur Progressive Web App (PWA). Pimpinan dan staf dapat menginstal panel CMS langsung ke desktop Windows, Mac, iPad, atau Android sebagai aplikasi mandiri berlogo 4SU tanpa bilah alamat browser.'
      ],
      [
        '3',
        'Hirarki Superadmin &\nLive Session Monitoring',
        'Tingkatan akses tertinggi untuk pimpinan dengan password aman. Superadmin memiliki dasbor eksklusif untuk melihat siapa saja staf/admin yang sedang login dan online secara real-time, serta memiliki wewenang untuk melakukan Kick Sesi paksa bagi user yang mencurigakan.'
      ],
      [
        '4',
        'Manajemen Keamanan Akun Terenkripsi',
        'Penyimpanan kata sandi dengan algoritma hashing mutakhir (Argon2id/Bcrypt), proteksi brute-force lockout otomatis saat 5x salah password, dan notifikasi keamanan.'
      ],
      [
        '5',
        'Two-Phase Publishing\n(Draft & 1-Klik Live Deploy)',
        'Staf dapat mengedit teks profil, portofolio, dan lowongan kerja dalam mode draf aman. Perubahan dapat ditinjau terlebih dahulu sebelum diunggah ke website publik hanya dengan 1 klik tombol *Publish*.'
      ],
      [
        '6',
        'ATS Pelamar & Penyimpanan CV di Object Storage',
        'Pusat seleksi berkas rekrutmen satpam. Dokumen CV pelamar tidak disimpan mentah di basis data, melainkan di Object Storage privat terenkripsi dengan signed URL berkadaluwarsa dan script auto-purge berkala (60 hari) guna menjaga kapasitas server dan kepatuhan privasi data.'
      ],
      [
        '7',
        'Manajemen Data Prospek Unduh Compro PDF',
        'Tabel pemantauan calon klien korporat yang telah meminta dokumen Company Profile PDF (nama narahubung, instansi, nomor telepon/WhatsApp, dan email bisnis) siap diunduh tim pemasaran ke format CSV/Excel.'
      ],
      [
        '8',
        'Audit Trail Log Aktivitas',
        'Pencatatan riwayat kronologis lengkap atas setiap penambahan, pengubahan, atau penghapusan data (siapa yang mengubah, kapan dilakukan, dan alamat IP terkait).'
      ],
      [
        '9',
        'Header Navigasi Profesional Bersih',
        'Desain bilah atas (*topbar*) CMS yang elegan tanpa badge dekoratif murahan, fokus pada efisiensi kerja tim sekretariat dan operasional.'
      ]
    ],
    [500, 2860, 6000]
  )

  doc += pageBreak()

  // === BAB 4: ANGGARAN & RENCANA BIAYA ===
  doc += heading1('4. STRUKTUR ANGGARAN & BIAYA PENGADAAN (FIXED ALL-IN)')
  doc += para([
    { text: 'Seluruh biaya pengadaan pihak ketiga dan biaya pengembangan aplikasi dirangkum dalam tabel di bawah ini dengan komitmen harga pasti tanpa biaya tersembunyi:' }
  ])

  doc += table(
    ['No', 'Rincian Pengadaan / Layanan Pengembangan', 'Subtotal Biaya (Rp)'],
    [
      [
        '1',
        [
          para([{ text: 'Registrasi Domain Resmi .CO.ID 3–4 Karakter (PANDI):', bold: true }]),
          para([{ text: 'Pendaftaran domain resmi perseroan berdurasi 1 tahun, verifikasi legalitas perseroan di PANDI, proteksi DNSSEC, dan sertifikat kepemilikan domain. (Pokok Rp 270.000 + PPN 11% Rp 29.700).' }])
        ],
        para([{ text: 'Rp 299.700', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '2',
        [
          para([{ text: 'Cloud Server KVM NEO Lite MS 4.4 (Biznet Gio Cloud):', bold: true }]),
          para([{ text: 'Pengadaan server cloud KVM 4 Core vCPU, 4 GB RAM, 60 GB SSD Storage berkecepatan tinggi di Tier-3 Data Center Indonesia. Alokasi bulan pertama. (Pokok Rp 179.000 + PPN 11% Rp 19.690).' }])
        ],
        para([{ text: 'Rp 198.690', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '3',
        [
          para([{ text: 'Mailspace Lite Bisnis 10 Akun (Domainesia):', bold: true }]),
          para([{ text: 'Pengadaan email hosting domain resmi 10 akun user @ Rp 3.500 (kuota 2 GB/user = total 20 GB) lengkap dengan Anti-Spam Filter & protokol IMAP/SMTP Outlook. Alokasi bulan pertama. (Pokok Rp 35.000 + PPN 11% Rp 3.850).' }])
        ],
        para([{ text: 'Rp 38.850', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '4',
        [
          para([{ text: 'Biaya Infrastruktur Setting & Hardening Cloud VPS:', bold: true }]),
          para([{ text: 'Jasa instalasi Linux OS Ubuntu 24.04 LTS, konfigurasi Nginx Reverse Proxy, Node.js 24 runtime, Docker Compose engine, sertifikat SSL/HTTPS 256-bit, firewall UFW, script cron auto-backup, dan integrasi DNS record.' }])
        ],
        para([{ text: 'Rp 500.000', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '5',
        [
          para([{ text: 'Jasa Redesain Compro PDF Korporat (Pasca Go-Live Web):', bold: true }]),
          para([{ text: 'Penyusunan ulang materi teks dan peremajaan tata letak grafis dokumen Company Profile PDF korporat resolusi cetak & digital share, dikerjakan setelah website resmi live pada 8 November 2026.' }])
        ],
        para([{ text: 'Rp 0\n(FREE / Bonus)', bold: true, color: '047857' }], { align: 'right' })
      ],
      [
        '6',
        [
          para([{ text: 'Pembuatan & Finalisasi Frontend Web Responsif (Next.js 16):', bold: true }]),
          para([{ text: 'Pengembangan antarmuka website modern Next.js 16 App Router & React 19 (Beranda, Profil, Pimpinan, Layanan Satpam/Cleaning/Driver/Ahli, Portofolio Mitra, Sertifikasi Mutu, Galeri Apel, Formulir Compro PDF Otomatis, Portal Karir, Dark/Light Mode, dan Smart Viewport Engine). Nilai termasuk alokasi penyesuaian materi compro.' }])
        ],
        para([{ text: 'Rp 4.462.760', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '7',
        [
          para([{ text: 'Pembuatan Dashboard Halaman CMS Enterprise Mandiri & DB Engine:', bold: true }]),
          para([{ text: 'Panel kontrol administratif mandiri untuk kelola konten website, isolasi rute subdomain, aplikasi PWA CMS, tingkatan Superadmin dengan Live Session Monitoring & Kick User, manajemen ATS lowongan & lamaran kerja dengan penyimpanan CV aman di Object Storage privat, auto-purge 60 hari, audit log, serta pengelolaan formulir prospek compro.' }])
        ],
        para([{ text: 'Rp 3.500.000', bold: true, color: '1E293B' }], { align: 'right' })
      ],
      [
        '',
        para([{ text: 'TOTAL INVESTASI KESEPAKATAN (FIXED ALL-IN):', bold: true, size: 20, color: '6B0808' }]),
        para([{ text: 'Rp 9.000.000', bold: true, size: 21, color: '047857' }], { align: 'right' })
      ]
    ],
    [500, 6860, 2000]
  )

  // Skema Pembayaran
  doc += heading2('SKEMA PEMBAYARAN KESEPAKATAN (TERM OF PAYMENT)')
  doc += para([
    { text: '• Termin I (Uang Muka / DP - 50% = Rp 4.500.000): ', bold: true },
    { text: 'Dibayarkan saat penandatanganan kesepakatan untuk pembelian langsung domain resmi .co.id, Cloud Paket NEO Lite MS 4.4 Biznet Gio, Mailspace Lite Domainesia, serta biaya teknis setup server.' }
  ])
  doc += para([
    { text: '• Termin II (Pelunasan Akhir - 50% = Rp 4.500.000): ', bold: true },
    { text: 'Dibayarkan setelah seluruh sistem website dan CMS selesai diuji coba, seluruh data legalitas & profil terinput sempurna, serah terima akun Superadmin, dan sistem resmi mengudara (Go-Live) pada 8 November 2026.' }
  ])

  // Catatan Biaya Rutin
  doc += para([
    { text: 'CATATAN ESTIMASI BIAYA OPERASIONAL RUTIN (MULAI BULAN KE-2):\n', bold: true, color: '6B0808' },
    { text: 'Mulai bulan kedua dan seterusnya, biaya sewa server Cloud VPS NEO Lite (Rp 198.690/bulan termasuk PPN) dan biaya Mailspace Lite 10 User (Rp 38.850/bulan termasuk PPN) dengan total ' },
    { text: 'Rp 237.540 per bulan', bold: true },
    { text: ' dibayarkan langsung secara mandiri oleh PT. Empat Sinergi Utama ke masing-masing provider.' }
  ], { callout: true })

  // === BAB 5: JADWAL KERJA & TENGGAT WAKTU ===
  doc += heading1('5. TIMELINE PENGERJAAN & TENGGAT GO-LIVE')
  doc += para([
    { text: 'Rencana kerja terstruktur disusun secara ketat untuk memastikan peluncuran tepat waktu pada 8 November 2026:' }
  ])

  doc += table(
    ['Fase', 'Aktivitas Utama & Penyerahan Hasil', 'Jadwal / Waktu Pelaksanaan'],
    [
      [
        'Fase 1',
        'Registrasi Domain .co.id, Verifikasi Dokumen Legalitas PANDI, Aktivasi Cloud VPS NEO Lite & Mailspace Lite, Setup Nginx, SSL, dan Docker.',
        '20 – 22 Oktober 2026'
      ],
      [
        'Fase 2',
        'Milestone Wajib Klien: PT. Empat Sinergi Utama mengirimkan materi final (teks profil, data legalitas, foto layanan Satpam/Cleaning/Driver/Ahli, dan portofolio mitra). Tim teknis melakukan kurasi dan input data ke basis data.',
        '23 – 26 Oktober 2026\n(Batas Akhir Penyerahan Data)'
      ],
      [
        'Fase 3',
        'Penyusunan kode frontend Web Compro Next.js 16, integrasi Smart Viewport Engine multi-window, formulir unduh compro otomatis via SMTP, dan portal rekrutmen karir online.',
        '27 Oktober – 2 November 2026'
      ],
      [
        'Fase 4',
        'Pembangunan Halaman CMS, integrasi PWA CMS mandiri, otentikasi Superadmin & live session monitor/kick, ATS seleksi CV di Object Storage privat, dan uji coba keamanan sistem.',
        '3 – 6 November 2026'
      ],
      [
        'Fase 5',
        'Pengujian menyeluruh (User Acceptance Test), simulasi multi-jendela di semua OS, optimasi kecepatan, serah terima kredensial akun Superadmin, dan resmi Go-Live publik.',
        '7 – 8 November 2026\n(Target Go-Live: 8 Nov 23:59 WIB)'
      ],
      [
        'Fase 6\n(Bonus)',
        'Pengerjaan peremajaan dan redesain grafis dokumen Company Profile PDF korporat resolusi cetak berdasarkan data final website yang sudah tayang.',
        '9 – 14 November 2026\n(Pasca Go-Live)'
      ]
    ],
    [1000, 5860, 2500]
  )

  // Garansi & Pemeliharaan
  doc += heading2('GARANSI SISTEM & DUKUNGAN TEKNIS (SLA)')
  doc += para([
    { text: '• Garansi Penuh 30 Hari: ', bold: true },
    { text: 'Perbaikan gratis tanpa biaya atas setiap kendala teknis (bug, layout error, atau kegagalan pengiriman email formulir) pasca peluncuran resmi.' }
  ])
  doc += para([
    { text: '• Sesi Pelatihan Staf (Training): ', bold: true },
    { text: 'Pendampingan langsung kepada staf admin yang ditunjuk oleh PT. Empat Sinergi Utama hingga mahir mengoperasikan Halaman CMS, menambah lowongan, dan mengelola pelamar.' }
  ])
  doc += para([
    { text: '• Dokumentasi Panduan Pengguna: ', bold: true },
    { text: 'Buku panduan digital (PDF) pengoperasian CMS dan tata cara penanganan darurat akun Superadmin.' }
  ])

  // === BAB 6: LEMBAR PERSETUJUAN / TANDA TANGAN ===
  doc += pageBreak()
  doc += heading1('6. LEMBAR PENGESAHAN & PENANDATANGANAN KESEPAKATAN')
  doc += para([
    { text: 'Dokumen penawaran dan rincian kerja ini mengikat secara profesional antara pihak pengembang dan PT. Empat Sinergi Utama untuk mewujudkan ekosistem digital korporat yang mandiri, andal, dan tepat waktu sesuai tenggat Go-Live tanggal 8 November 2026.' }
  ])

  doc += table(
    ['Pihak Pengembang Sistem', 'Pihak Klien (PT. Empat Sinergi Utama)'],
    [
      [
        para([{ text: 'Dibuat dan Diajukan Oleh:' }]),
        para([{ text: 'Disetujui dan Diterima Oleh:' }])
      ],
      [
        para([
          { text: 'Lead Fullstack Developer & Cloud Architect' },
          { text: '\n\n\n\n' },
          { text: '( _____________________________________ )', bold: true }
        ]),
        para([
          { text: 'PT. Empat Sinergi Utama' },
          { text: '\n\n\n\n' },
          { text: '( _____________________________________ )', bold: true }
        ])
      ],
      [
        para([{ text: 'Jabatan: Lead Fullstack Developer & Cloud Architect' }]),
        para([{ text: 'Jabatan: Direktur / Manajemen Berwenang' }])
      ],
      [
        para([{ text: 'Tanggal: 20 Oktober 2026' }]),
        para([{ text: 'Tanggal: ________________________________' }])
      ]
    ],
    [4680, 4680]
  )

  return doc
}

// Assemble full OpenXML package into .docx
async function createProposalDocx() {
  const zip = new JSZip()

  // 1. [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`)

  // 2. _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)

  // 3. word/_rels/document.xml.rels
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" Target="webSettings.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`)

  // 4. word/settings.xml
  zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`)

  // 5. word/webSettings.xml
  zip.file('word/webSettings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:webSettings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:optimizeForBrowser/>
  <w:allowPNG/>
</w:webSettings>`)

  // 6. word/header1.xml
  zip.file('word/header1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
      </w:pBdr>
      <w:jc w:val="right"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="17"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t>PT. EMPAT SINERGI UTAMA | PROPOSAL PENGEMBANGAN WEBSITE, CMS &amp; CLOUD INFRASTRUCTURE</w:t>
    </w:r>
  </w:p>
</w:hdr>`)

  // 7. word/footer1.xml
  zip.file('word/footer1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr>
        <w:top w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
      </w:pBdr>
      <w:tabs>
        <w:tab w:val="right" w:pos="9360"/>
      </w:tabs>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="17"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t>Dokumen Konfidensial — PROP-WEB/4SU/2026/001-REV</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="17"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:tab/>
      <w:t>Halaman </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE">
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="17"/>
          <w:color w:val="64748B"/>
        </w:rPr>
        <w:t>1</w:t>
      </w:r>
    </w:fldSimple>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="17"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t> dari </w:t>
    </w:r>
    <w:fldSimple w:instr="NUMPAGES">
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="17"/>
          <w:color w:val="64748B"/>
        </w:rPr>
        <w:t>1</w:t>
      </w:r>
    </w:fldSimple>
  </w:p>
</w:ftr>`)

  // 8. word/styles.xml
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="id-ID"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`)

  // 9. word/document.xml
  const bodyContent = generateDocumentBodyXml()
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" 
            xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" 
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
            xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" 
            xmlns:v="urn:schemas-microsoft-com:vml" 
            xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" 
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" 
            xmlns:w10="urn:schemas-microsoft-com:office:word" 
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" 
            xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" 
            xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" 
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" 
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" 
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" 
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" 
            mc:Ignorable="w14 w15 w16se wp14">
  <w:body>
    ${bodyContent}
    <w:p/>
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId4"/>
      <w:footerReference w:type="default" r:id="rId5"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1270" w:bottom="1440" w:left="1270" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`

  zip.file('word/document.xml', documentXml)

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })

  const newFileName = 'Proposal_Pengembangan_Website_dan_CMS_PT_Empat_Sinergi_Utama_Revisi.docx'
  const newOutputPath = path.join(process.cwd(), newFileName)
  fs.writeFileSync(newOutputPath, buffer)
  console.log(`SUCCESS: Word document created at ${newOutputPath} (${buffer.length} bytes)`)

  const originalFileName = 'Proposal_Pengembangan_Website_dan_CMS_PT_Empat_Sinergi_Utama.docx'
  const originalOutputPath = path.join(process.cwd(), originalFileName)
  try {
    fs.writeFileSync(originalOutputPath, buffer)
    console.log(`SUCCESS: Overwritten locked file at ${originalOutputPath}`)
  } catch (err) {
    console.log(`NOTE: Original file was locked by Word (${err.code}). User can open ${newFileName}`)
  }
}

createProposalDocx().catch(err => {
  console.error('ERROR creating proposal docx:', err)
  process.exit(1)
})
