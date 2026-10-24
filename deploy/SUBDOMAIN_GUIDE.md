# Panduan Penggunaan & Deployment Subdomain Admin/CMS

Sistem ini menggunakan arsitektur **Single Codebase**:
- Hanya ada **1 proyek** Next.js.
- Cukup jalankan **1 server** (`npm run dev` atau PM2 di VPS).
- Database Prisma & Supabase dipakai bersama tanpa duplikasi.

---

## 1. Pengujian di Lingkungan Lokal (Development)

Browser modern (Google Chrome, Mozilla Firefox, Microsoft Edge) sudah secara otomatis mendukung subdomain pada `localhost` tanpa perlu mengubah file `hosts`.

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. **Website Publik (Company Profile):**
   - Buka browser: `http://localhost:3000`
3. **Subdomain Admin / CMS:**
   - Buka browser: `http://admin.localhost:3000`
   - Jika belum login, otomatis diarahkan ke halaman login.
   - Jika sudah login, root (`/`) langsung me-render Dashboard CMS.
   - Shortcut menu juga langsung bekerja (misal: `http://admin.localhost:3000/users`).

---

## 1B. Pengujian di Lingkungan Staging Vercel (`*.vercel.app`)

Secara standar, sertifikat SSL Wildcard gratis milik Vercel (`*.vercel.app`) hanya mendukung **1 tingkat subdomain** (contoh: `ecu-cms.vercel.app`). Oleh karena itu, sub-subdomain bertitik seperti `https://admin.ecu-cms.vercel.app` akan ditolak oleh browser karena tidak tercakup dalam sertifikat `*.vercel.app` (`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`).

Untuk melakukan pengujian CMS di Vercel tanpa membeli custom domain terlebih dahulu, tersedia **2 cara**:

1. **Akses Langsung melalui Path `/admin` atau `/login` (Tanpa Setting Tambahan):**
   - Buka: `https://ecu-cms.vercel.app/admin` atau `https://ecu-cms.vercel.app/login`
   - Sistem `proxy.ts` secara otomatis mengizinkan rute `/admin` dan `/login` khusus pada domain `*.vercel.app` (sementara pada domain produksi utama `4su.co.id`, rute tersebut tetap dikunci 404 dan wajib melalui `admin.4su.co.id`).
2. **Menggunakan Domain Khusus Admin dengan Tanda Strip (`-`) di Vercel:**
   - Buka **Vercel Dashboard** -> Pilih Project `ecu-cms` -> **Settings** -> **Domains**.
   - Klik **Add Domain** dan masukkan: `admin-ecu-cms.vercel.app` (gunakan tanda strip `-`, bukan titik `.`).
   - Buka `https://admin-ecu-cms.vercel.app` — sistem akan langsung memperlakukannya sebagai domain khusus CMS (root `/` otomatis menampilkan Dashboard CMS / Halaman Login).

---

## 2. Deployment ke VPS Cloud (Nginx & SSL)

### Langkah 1: Pengaturan DNS
Tambahkan DNS Record di domain provider / Cloudflare:
- **A Record** (Domain Utama): `@` mengarah ke IP VPS Anda.
- **A Record** (Subdomain Admin): `admin` mengarah ke IP VPS Anda.
- **CNAME Record**: `www` mengarah ke domain utama.

### Langkah 2: Konfigurasi Nginx
1. Salin template dari `deploy/nginx.conf` ke `/etc/nginx/sites-available/esu`:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/esu
   ```
2. Sesuaikan nama domain (`esu.co.id` & `admin.esu.co.id`) dengan domain Anda.
3. Aktifkan situs & uji konfigurasi:
   ```bash
   sudo ln -s /etc/nginx/sites-available/esu /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Langkah 3: Pasang SSL Gratis (Certbot)
Jalankan Certbot untuk mengaktifkan HTTPS otomatis pada domain dan subdomain:
```bash
sudo certbot --nginx -d esu.co.id -d www.esu.co.id -d admin.esu.co.id
```

### Langkah 4: Jalankan Aplikasi dengan PM2
Pastikan aplikasi Next.js berjalan di background pada port 3000:
```bash
npm run build
pm2 start npm --name "esu-app" -- start
pm2 save
```
