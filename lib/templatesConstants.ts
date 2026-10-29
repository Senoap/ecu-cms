// lib/templatesConstants.ts

export interface FooterInquiryTemplates {
  waMessage?: string
  emailSubject?: string
  emailBody?: string
}

export interface ComproEmailTemplate {
  subject: string
  body: string
  senderName: string
  heading?: string
  bodyIntro?: string
  pdfUrl?: string
  footerText?: string
}

export interface CareerReplyTemplate {
  id: string
  name: string
  channel: 'wa' | 'email' | 'both'
  subject?: string
  body: string
  createdAt: number
}

export const defaultCareerTemplates: CareerReplyTemplate[] = [
  {
    id: 'tpl-interview',
    name: 'Panggilan Wawancara Kerja (Interview)',
    channel: 'both',
    subject: 'Panggilan Wawancara Kerja - {job_title} ({company})',
    body: 'Halo {name},\n\nTerima kasih telah melamar posisi {job_title} di {company}. Kami tertarik dengan kualifikasi Anda dan mengundang Anda untuk mengikuti sesi wawancara kerja (Ref: {ref_code}).\n\nMohon konfirmasi kesediaan Anda dengan membalas pesan/email ini.\n\nSalam hangat,\nTim HR {company}',
    createdAt: 1700000000000
  },
  {
    id: 'tpl-rejection',
    name: 'Pemberitahuan Status Lamaran (Penolakan Halus)',
    channel: 'email',
    subject: 'Pembaruan Status Lamaran {job_title} - {company}',
    body: 'Halo {name},\n\nTerima kasih atas minat Anda melamar posisi {job_title} di {company} (Ref: {ref_code}).\n\nSetelah meninjau berkas Anda secara seksama, saat ini kami memilih untuk melanjutkan proses dengan kandidat yang profilnya lebih mendekati kebutuhan posisi. Data Anda akan kami simpan untuk peluang kerja di masa mendatang.\n\nSemoga sukses selalu dalam perjalanan karir Anda.\n\nSalam hormat,\nTim HR {company}',
    createdAt: 1700000000000
  },
  {
    id: 'tpl-confirm',
    name: 'Konfirmasi Berkas Diterima',
    channel: 'both',
    subject: 'Konfirmasi Berkas Lamaran {job_title} - {company}',
    body: 'Halo {name},\n\nBerkas lamaran Anda untuk posisi {job_title} (Ref: {ref_code}) telah kami terima dan terverifikasi dalam database kami. Tim rekrutmen kami akan segera menghubungi Anda jika profil Anda terpilih untuk tahap selanjutnya.\n\nTerima kasih,\nTim Rekrutmen {company}',
    createdAt: 1700000000000
  }
]

export const defaultInquiryTemplates: FooterInquiryTemplates = {
  waMessage: 'Halo PT. Empat Sinergi Utama, saya ingin berkonsultasi mengenai kebutuhan layanan alih daya / ketenagakerjaan untuk perusahaan kami.',
  emailSubject: 'Konsultasi Layanan Alih Daya & Ketenagakerjaan - PT. Empat Sinergi Utama',
  emailBody: `Halo Tim PT. Empat Sinergi Utama,

Saya ingin mendapatkan informasi dan penawaran terkait kebutuhan operasional perusahaan kami:

Nama: 
Perusahaan / Instansi: 
Kebutuhan Layanan (Keamanan / Kebersihan / Tenaga Pendukung / Taman): 
Kontak / No. Telepon: 

Mohon informasi lebih lanjut. Terima kasih.`
}

export const defaultComproEmailTemplate: ComproEmailTemplate = {
  subject: 'Company Profile Resmi - PT. Empat Sinergi Utama',
  senderName: 'PT. Empat Sinergi Utama',
  heading: 'Company Profile Resmi - PT. Empat Sinergi Utama',
  bodyIntro: 'Terima kasih atas minat dan kepercayaan Anda kepada PT. Empat Sinergi Utama. Menindaklanjuti permintaan yang Anda ajukan, dokumen resmi Company Profile telah kami lampirkan langsung pada email ini.',
  pdfUrl: '/compro.pdf',
  footerText: 'PT Empat Sinergi Utama • Mitra Strategis Ketenagakerjaan & Fasilitas Korporat Terpadu',
  body: `Yth. Bapak/Ibu {name},
Dari {company},

Terima kasih atas minat dan kepercayaan Anda kepada PT. Empat Sinergi Utama.

Menindaklanjuti permintaan Company Profile yang Anda ajukan melalui situs web resmi kami, bersama pesan ini kami lampirkan langsung berkas dokumen Company Profile resmi PT. Empat Sinergi Utama (terlampir berkas PDF).

Dokumen ini memuat informasi lengkap mengenai:
- Profil dan legalitas resmi perusahaan
- Portofolio layanan alih daya (Keamanan, Kebersihan, Tenaga Pendukung, Fasilitas)
- Rekam jejak mitra dan sertifikasi mutu (ISO 9001, ISO 45001, SIO-BUJP, PPJP Kemenaker)
- Skema kemitraan yang fleksibel, transparan, dan akuntabel

Berkas dokumen resmi dapat Anda buka dan unduh langsung melalui lampiran (attachment) pada email ini.

Tim konsultan kami siap berdiskusi lebih lanjut mengenai solusi operasional di perusahaan Anda. Silakan hubungi kami via balasan email ini atau WhatsApp di nomor hotline resmi kami.`
}

