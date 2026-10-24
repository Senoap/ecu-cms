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
