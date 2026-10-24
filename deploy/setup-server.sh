#!/usr/bin/env bash
# deploy/setup-server.sh
# Skrip Otomatisasi Persiapan & Hardening Server Ubuntu 24.04 LTS untuk ESU Company
# Jalankan sebagai root pada instalasi pertama kali VPS: sudo bash deploy/setup-server.sh

set -eo pipefail

echo "🛡️ [SETUP SERVER] Memulai instalasi dependensi & hardening Ubuntu 24.04 LTS..."

# 1. Update OS & Paket Dasar
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git ufw fail2ban certbot python3-certbot-nginx \
  unattended-upgrades logrotate age rclone htop jq build-essential

# 2. Setup 2 GB Swap File (Pencegah OOM saat kompilasi/burst memori)
if [ ! -f /swapfile ]; then
  echo "💾 Menyiapkan 2 GB Swap File..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "✅ Swap 2 GB aktif."
else
  echo "ℹ️ /swapfile sudah ada, melewati pembuatan swap."
fi

# 3. Setup Node.js 24 LTS & PM2
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1)" != "v24" ]; then
  echo "🟢 Menginstal Node.js 24 LTS dari NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2 pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true

# 4. Setup Docker Engine & Docker Compose Plugin
if ! command -v docker >/dev/null 2>&1; then
  echo "🐳 Menginstal Docker Engine..."
  curl -fsSL https://get.docker.com | bash -
fi

# 5. Buat Pengguna Non-Root 'deploy'
if ! id "deploy" >/dev/null 2>&1; then
  echo "👤 Membuat pengguna sistem 'deploy'..."
  useradd -m -s /bin/bash -G docker deploy
  mkdir -p /home/deploy/.ssh
  chmod 700 /home/deploy/.ssh
  touch /home/deploy/.ssh/authorized_keys
  chmod 600 /home/deploy/.ssh/authorized_keys
  chown -R deploy:deploy /home/deploy/.ssh
fi

# 6. Setup Struktur Direktori Aplikasi
mkdir -p /var/www/esu-company/shared/data/cv \
         /var/www/esu-company/shared/uploads \
         /var/www/esu-company/releases \
         /var/backup/esu-company
chown -R deploy:deploy /var/www/esu-company /var/backup/esu-company
chmod 700 /var/www/esu-company/shared/data/cv /var/backup/esu-company
chmod 755 /var/www/esu-company/shared/uploads

# 6b. Cron harian purge CV kedaluwarsa 60 hari (UU PDP) - 03.00 server time
# Membaca CRON_SECRET dari /var/www/esu-company/shared/.env.production
cat > /etc/cron.d/esu-purge-cv <<'CRON'
0 3 * * * deploy cd /var/www/esu-company/current && set -a && . /var/www/esu-company/shared/.env.production && set +a && /usr/bin/node scripts/purge-expired-cv.mjs >> /var/log/esu-purge-cv.log 2>&1
CRON
chmod 644 /etc/cron.d/esu-purge-cv
touch /var/log/esu-purge-cv.log && chown deploy:deploy /var/log/esu-purge-cv.log

# 6c. Cron harian purge konten kedaluwarsa H+7 - 03.15 server time
cat > /etc/cron.d/esu-purge-content <<'CRON'
15 3 * * * deploy cd /var/www/esu-company/current && set -a && . /var/www/esu-company/shared/.env.production && set +a && /usr/bin/node scripts/purge-expired-content.mjs >> /var/log/esu-purge-content.log 2>&1
CRON
chmod 644 /etc/cron.d/esu-purge-content
touch /var/log/esu-purge-content.log && chown deploy:deploy /var/log/esu-purge-content.log

# 7. Konfigurasi Firewall UFW (PENTING: Port 22 Dibuka Terlebih Dahulu!)
echo "🔒 Mengonfigurasi UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Port'
ufw limit 22/tcp comment 'SSH Rate Limit'
ufw allow 80/tcp comment 'HTTP Web'
ufw allow 443/tcp comment 'HTTPS Web'
# PENTING: Jangan buka port 3000, 3001, atau 5432 ke internet!
ufw --force enable
echo "✅ UFW aktif. Akses internet hanya terbuka untuk port 22, 80, dan 443."

# 8. Konfigurasi Unattended Upgrades (Security Patches Otomatis)
dpkg-reconfigure -f noninteractive unattended-upgrades

# 9. Pengingat SSH Hardening
echo "=========================================================================="
echo "🎉 Setup server dasar selesai!"
echo "PENTING SEBELUM LOGOUT:"
echo "1. Pastikan Anda telah menambahkan SSH Public Key Anda ke: /home/deploy/.ssh/authorized_keys"
echo "2. Uji login di terminal lain: ssh deploy@<IP_VPS>"
echo "3. Setelah berhasil login, nonaktifkan password auth di /etc/ssh/sshd_config:"
echo "   - PasswordAuthentication no"
echo "   - PermitRootLogin no"
echo "   Lalu jalankan: systemctl restart ssh"
echo "=========================================================================="
