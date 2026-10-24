#!/usr/bin/env bash
# deploy/rollback.sh
# Skrip Rollback Cepat (< 3 Detik) ke Rilis Sebelumnya jika Terjadi Isu Kritis
# Penggunaan: ./deploy/rollback.sh

set -eo pipefail

BASE_DIR="/var/www/esu-company"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"

echo "⏪ [ROLLBACK] Memulai proses rollback instan..."

# Dapatkan path rilis saat ini
ACTIVE_RELEASE=$(readlink -f "$CURRENT_LINK" || true)

# Cari rilis sebelumnya (urutan kedua terbaru)
PREV_RELEASE=$(ls -dt "${RELEASES_DIR}"/*/ | sed -e 's/\/$//' | grep -v "^${ACTIVE_RELEASE}$" | head -n 1 || true)

if [ -z "$PREV_RELEASE" ] || [ ! -d "$PREV_RELEASE" ]; then
  echo "❌ Tidak ditemukan rilis sebelumnya untuk melakukan rollback di: ${RELEASES_DIR}"
  exit 1
fi

echo "🔄 Mengembalikan pointer /current ke: ${PREV_RELEASE}..."
ln -sfn "$PREV_RELEASE" "${BASE_DIR}/current_new"
mv -Tf "${BASE_DIR}/current_new" "$CURRENT_LINK"

echo "⚡ Reload PM2 ke versi sebelumnya..."
cd "$CURRENT_LINK"
pm2 reload ecosystem.config.cjs --update-env
pm2 save

echo "🎉 [ROLLBACK SUKSES] Aplikasi telah kembali normal ke rilis sebelumnya dalam hitungan detik!"
