#!/usr/bin/env bash
# scripts/vps-backup.sh
# Skrip Backup Otomatis Terenkripsi Asimetris (age) & Sync WORM ke Cloudflare R2
# Dijalankan via Cron Job harian (02.00 WIB)

set -eo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backup/esu-company"
PROJECT_DIR="/var/www/esu-company/current"
SHARED_DIR="/var/www/esu-company/shared"
DB_CONTAINER="${DB_CONTAINER_NAME:-esu_postgres}"
DB_NAME="${POSTGRES_DB:-esu_prod}"
DB_USER="${POSTGRES_USER:-postgres}"

# Pastikan direktori backup berizin ketat
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

notify_failure() {
  local exit_code=$?
  local err_msg="[ALERT] Backup ESU Company GAGAL pada $(date) dengan exit code ${exit_code}!"
  echo "❌ $err_msg"
  if [ -n "$ALERT_WEBHOOK_URL" ]; then
    curl -s -X POST -H "Content-Type: application/json" -d "{\"text\":\"$err_msg\"}" "$ALERT_WEBHOOK_URL" || true
  fi
}
trap notify_failure ERR

echo "📦 [${TIMESTAMP}] Memulai backup PostgreSQL & Berkas..."

SQL_DUMP="${BACKUP_DIR}/db_${TIMESTAMP}.sql"
TAR_FILES="${BACKUP_DIR}/files_${TIMESTAMP}.tar.gz"

# 1. Dump Database PostgreSQL dari Docker
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  docker exec -t "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$SQL_DUMP"
  echo "✅ Database berhasil di-dump: ${SQL_DUMP}"
else
  echo "⚠️ Container database ${DB_CONTAINER} tidak ditemukan, mencoba dump lokal jika psql ada..."
  pg_dump -U "$DB_USER" "$DB_NAME" > "$SQL_DUMP"
fi

# 2. Tar Berkas Dokumen CV & Media Uploads
if [ -d "$SHARED_DIR" ]; then
  tar -czf "$TAR_FILES" -C "$SHARED_DIR" data/cv uploads
  echo "✅ Berkas berhasil diarsip: ${TAR_FILES}"
elif [ -d "${PROJECT_DIR}/data/cv" ]; then
  tar -czf "$TAR_FILES" -C "$PROJECT_DIR" data/cv public/uploads
  echo "✅ Berkas lokal berhasil diarsip: ${TAR_FILES}"
fi

# 3. Enkripsi Asimetris Menggunakan age (Hanya Butuh Public Key di VPS)
if [ -n "$AGE_PUBLIC_KEY" ] && command -v age >/dev/null 2>&1; then
  echo "🔒 Mengenkripsi berkas backup dengan age public key..."
  age -r "$AGE_PUBLIC_KEY" -o "${SQL_DUMP}.age" "$SQL_DUMP"
  age -r "$AGE_PUBLIC_KEY" -o "${TAR_FILES}.age" "$TAR_FILES"
  # Hapus berkas plaintext seketika
  rm -f "$SQL_DUMP" "$TAR_FILES"
  chmod 600 "${SQL_DUMP}.age" "${TAR_FILES}.age"
  echo "🛡️ Enkripsi selesai. File plaintext telah dimusnahkan dari server."
else
  echo "ℹ️ AGE_PUBLIC_KEY belum diatur atau age belum terpasang. File backup disimpan unencrypted (hanya untuk development)."
  chmod 600 "$SQL_DUMP" "$TAR_FILES"
fi

# 4. Sync Off-Site ke Cloudflare R2 via rclone (WORM: Tanpa Izin Hapus)
if command -v rclone >/dev/null 2>&1 && [ -n "$RCLONE_REMOTE" ]; then
  echo "☁️ Mengirim backup ke Cloudflare R2 (${RCLONE_REMOTE})..."
  rclone copy "$BACKUP_DIR" "${RCLONE_REMOTE}" --include "*.age" --include "*.sql" --include "*.tar.gz"
  echo "✅ Berhasil sync ke storage off-site R2."
fi

# 5. Rotasi Lokal: Hapus backup lokal di VPS yang berusia lebih dari 30 hari
find "$BACKUP_DIR" -type f \( -name "*.age" -o -name "*.sql" -o -name "*.tar.gz" \) -mtime +30 -delete
echo "🧹 Rotasi lokal selesai (file > 30 hari dibersihkan)."

# 6. Dead-Man's Switch / Heartbeat Ping
if [ -n "$HEARTBEAT_URL" ]; then
  curl -s -m 10 --retry 3 "$HEARTBEAT_URL" > /dev/null || true
  echo "📡 Heartbeat ping terkirim ke sistem monitoring."
fi

echo "🎉 [$(date +%Y%m%d_%H%M%S)] Seluruh proses backup harian selesai dengan sukses."
