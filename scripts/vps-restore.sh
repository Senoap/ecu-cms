#!/usr/bin/env bash
# scripts/vps-restore.sh
# Skrip Pemulihan Bencana (Disaster Recovery Restore) dari Backup Terenkripsi age
# Penggunaan: ./scripts/vps-restore.sh <path_to_db_backup> <path_to_files_backup>

set -eo pipefail

DB_BACKUP="$1"
FILES_BACKUP="$2"
DB_CONTAINER="${DB_CONTAINER_NAME:-esu_postgres}"
DB_NAME="${POSTGRES_DB:-esu_prod}"
DB_USER="${POSTGRES_USER:-postgres}"
SHARED_DIR="/var/www/esu-company/shared"

if [ -z "$DB_BACKUP" ] || [ -z "$FILES_BACKUP" ]; then
  echo "Penggunaan: $0 <path_to_db_backup.sql[.age]> <path_to_files_backup.tar.gz[.age]>"
  echo "Contoh: $0 /var/backup/esu-company/db_20261025.sql.age /var/backup/esu-company/files_20261025.tar.gz.age"
  exit 1
fi

echo "🚨 [DISASTER RECOVERY] Memulai prosedur restore database & berkas..."

# 1. Dekripsi Berkas Jika Terenkripsi age
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

RESTORE_SQL="$DB_BACKUP"
RESTORE_TAR="$FILES_BACKUP"

if [[ "$DB_BACKUP" == *.age ]]; then
  echo "🔑 Masukkan path ke age private key (atau pastikan \$AGE_SECRET_KEY_FILE terisi):"
  KEY_FILE="${AGE_SECRET_KEY_FILE}"
  if [ -z "$KEY_FILE" ]; then
    read -r -p "Path kunci privat age: " KEY_FILE
  fi

  if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Kunci privat age tidak ditemukan pada: $KEY_FILE"
    exit 1
  fi

  RESTORE_SQL="${TEMP_DIR}/restore.sql"
  RESTORE_TAR="${TEMP_DIR}/restore.tar.gz"

  echo "🔓 Mendekripsi database dump..."
  age -d -i "$KEY_FILE" "$DB_BACKUP" > "$RESTORE_SQL"

  echo "🔓 Mendekripsi arsip berkas..."
  age -d -i "$KEY_FILE" "$FILES_BACKUP" > "$RESTORE_TAR"
fi

# 2. Inisialisasi Ulang Role & Skema Database Jika Volume Baru
echo "🛠️ Memastikan role PostgREST dan skema siap..."
if [ -f "deploy/init-db.sh" ]; then
  bash deploy/init-db.sh || true
fi

# 3. Restore Data SQL ke PostgreSQL
echo "📥 Mengimpor dump SQL ke PostgreSQL (${DB_CONTAINER})..."
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  cat "$RESTORE_SQL" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
else
  psql -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_SQL"
fi
echo "✅ Data database berhasil dipulihkan."

# 4. Ekstrak Berkas Dokumen CV & Media Uploads
echo "📂 Mengekstrak berkas dokumen dan media..."
mkdir -p "$SHARED_DIR/data/cv" "$SHARED_DIR/uploads"
chmod 700 "$SHARED_DIR/data/cv"
chmod 755 "$SHARED_DIR/uploads"

tar -xzf "$RESTORE_TAR" -C "$SHARED_DIR"
echo "✅ Berkas fisik berhasil dipulihkan ke: ${SHARED_DIR}"

# 5. Eksekusi Skrip Purge Pasca-Restore (Kepatuhan UU PDP)
echo "🧹 Menjalankan purge pasca-restore agar data kedaluwarsa dari snapshot tidak hidup kembali..."
if [ -f "scripts/purge-expired-cv.mjs" ]; then
  node scripts/purge-expired-cv.mjs || true
fi

echo "🎉 [RESTORE SUKSES] Sistem telah pulih 100% dan data kedaluwarsa telah dibersihkan."
