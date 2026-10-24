#!/usr/bin/env bash
# deploy/deploy.sh
# Skrip Rilis Atomik Zero-Downtime Next.js 16 (Symlink Pattern) untuk ESU Company
# Penggunaan: ./deploy/deploy.sh [git_branch]

set -eo pipefail

BRANCH="${1:-main}"
BASE_DIR="/var/www/esu-company"
RELEASES_DIR="${BASE_DIR}/releases"
SHARED_DIR="${BASE_DIR}/shared"
CURRENT_LINK="${BASE_DIR}/current"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_RELEASE="${RELEASES_DIR}/${TIMESTAMP}"

echo "🚀 [${TIMESTAMP}] Memulai proses deployment atomik (Branch: ${BRANCH})..."

# 1. Pastikan struktur direktori dasar siap
mkdir -p "$RELEASES_DIR" "$SHARED_DIR/data/cv" "$SHARED_DIR/uploads"
chmod 700 "$SHARED_DIR/data/cv"
chmod 755 "$SHARED_DIR/uploads"

if [ ! -f "$SHARED_DIR/.env.production" ]; then
  echo "❌ File $SHARED_DIR/.env.production belum ada! Harap siapkan environment variables produksi terlebih dahulu."
  exit 1
fi

# 2. Clone / Copy repositori ke folder rilis baru
echo "📦 Menyiapkan berkas rilis di: ${NEW_RELEASE}..."
mkdir -p "$NEW_RELEASE"
git archive "$BRANCH" | tar -x -C "$NEW_RELEASE" || {
  echo "⚠️ git archive gagal, menyalin dari folder kerja lokal..."
  rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='data' --exclude='public/uploads' ./ "$NEW_RELEASE/"
}

# 3. Buat symlink file persisten dari shared
ln -sfn "$SHARED_DIR/.env.production" "$NEW_RELEASE/.env.production"
mkdir -p "$NEW_RELEASE/data" "$NEW_RELEASE/public"
ln -sfn "$SHARED_DIR/data/cv" "$NEW_RELEASE/data/cv"
ln -sfn "$SHARED_DIR/uploads" "$NEW_RELEASE/public/uploads"

# 4. Install Dependencies di rilis baru
echo "📥 Menjalankan npm ci..."
cd "$NEW_RELEASE"
npm ci --prefer-offline --no-audit

# 5. Build Next.js dengan Resource Guard (Mencegah OOM & CPU Throttling)
echo "🏗️ Menjalankan npm run build dengan alokasi memori terbatas (nice 19)..."
nice -n 19 env NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 6. Alihkan Symlink /current Secara Atomik
echo "🔄 Mengalihkan symlink aktif ke rilis baru..."
ln -sfn "$NEW_RELEASE" "${BASE_DIR}/current_new"
mv -Tf "${BASE_DIR}/current_new" "$CURRENT_LINK"

# 7. Reload PM2 (Graceful handover)
echo "⚡ Melakukan reload proses PM2..."
cd "$CURRENT_LINK"
if pm2 list | grep -q "esu-company"; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

# 8. Bersihkan Rilis Lama (Hanya pertahankan 5 rilis terakhir)
echo "🧹 Membersihkan rilis usang (mempertahankan 5 rilis terakhir)..."
cd "$RELEASES_DIR"
ls -dt */ | tail -n +6 | xargs rm -rf || true

echo "🎉 [SUKSES] Deployment rilis ${TIMESTAMP} berhasil aktif tanpa gangguan akses pengunjung!"
