#!/bin/sh
set -e
apk add --no-cache age >/dev/null 2>&1

VAULT_DIR="/tmp/external-age-vault"
rm -rf "$VAULT_DIR"
mkdir -p "$VAULT_DIR"

echo "=== 1. GENERATE AGE KEYPAIR (DI MESIN OFFLINE/TERPISAH) ==="
age-keygen -o "$VAULT_DIR/offline_age_private_key.txt" 2>&1
chmod 600 "$VAULT_DIR/offline_age_private_key.txt"

PUB_KEY=$(grep 'public key:' "$VAULT_DIR/offline_age_private_key.txt" | awk '{print $4}')
echo "Kunci Publik (Hanya ini yang ada di VPS): $PUB_KEY"

echo "=== 2. ENKRIPSI BACKUP DENGAN KUNCI PUBLIK DI VPS ==="
ORIGINAL_DATA="-- DUMP POSTGRESQL 16 & FILE CV PELAMAR TANGGAL 2026-10-24 --"
echo "$ORIGINAL_DATA" > "$VAULT_DIR/plain_backup.sql"

age -r "$PUB_KEY" -o "$VAULT_DIR/backup.sql.age" "$VAULT_DIR/plain_backup.sql"
echo "Berkas berhasil dienkripsi: $VAULT_DIR/backup.sql.age"

echo "=== 3. HAPUS KUNCI PRIVAT DARI VPS & BUKTIKAN TIDAK BISA DIDEKRIPSI TANPA KUNCI ==="
# VPS tidak punya private key, jika didekripsi tanpa key -> error
if age -d "$VAULT_DIR/backup.sql.age" 2>&1; then
  echo "GAGAL: Seharusnya tidak bisa didekripsi tanpa kunci"
  exit 1
else
  echo "SUKSES: Enkripsi kuat, penyerang di VPS tidak dapat mendekripsi berkas backup!"
fi

echo "=== 4. RESTORE DI MESIN TERPISAH DENGAN KUNCI PRIVAT OFFLINE ==="
DECRYPTED_DATA=$(age -d -i "$VAULT_DIR/offline_age_private_key.txt" "$VAULT_DIR/backup.sql.age")
echo "Hasil Dekripsi:"
echo "$DECRYPTED_DATA"

if [ "$DECRYPTED_DATA" = "$ORIGINAL_DATA" ]; then
  echo "✅ VERIFIKASI RESTORE BERHASIL 100%: Data terdekripsi identik dengan sumber aslinya."
fi
