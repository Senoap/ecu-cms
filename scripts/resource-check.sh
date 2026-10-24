#!/usr/bin/env bash
# scripts/resource-check.sh
# Skrip Pengecekan Resource VPS (Disk, RAM, Swap, Docker) & Ping Healthchecks.io
# Dijalankan via Cron setiap 15 menit.

set -euo pipefail

HEALTHCHECK_URL="${HEALTHCHECKS_RESOURCE_URL:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

DISK_THRESHOLD=85
RAM_THRESHOLD=90
SWAP_THRESHOLD=75

# 1. Cek Kapasitas Disk (Root Partition)
DISK_USAGE=$(df -P / | tail -n 1 | awk '{print $5}' | tr -d '%')

# 2. Cek RAM & Swap
RAM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100)}')
SWAP_TOTAL=$(free | grep Swap | awk '{print $2}')
if [ "$SWAP_TOTAL" -gt 0 ]; then
  SWAP_USAGE=$(free | grep Swap | awk '{printf("%.0f", $3/$2 * 100)}')
else
  SWAP_USAGE=0
fi

# 3. Cek Status Docker Containers
CONTAINER_POSTGRES=$(docker inspect -f '{{.State.Health.Status}}' esu_postgres 2>/dev/null || echo "dead")
CONTAINER_POSTGREST=$(docker inspect -f '{{.State.Status}}' esu_postgrest 2>/dev/null || echo "dead")

ALERT_MSG=""

if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
  ALERT_MSG="${ALERT_MSG}⚠️ DISK HAMPIR PENUH: ${DISK_USAGE}%\n"
fi

if [ "$RAM_USAGE" -ge "$RAM_THRESHOLD" ]; then
  ALERT_MSG="${ALERT_MSG}⚠️ RAM TINGGI: ${RAM_USAGE}%\n"
fi

if [ "$SWAP_USAGE" -ge "$SWAP_THRESHOLD" ]; then
  ALERT_MSG="${ALERT_MSG}⚠️ SWAP TINGGI: ${SWAP_USAGE}%\n"
fi

if [ "$CONTAINER_POSTGRES" != "healthy" ]; then
  ALERT_MSG="${ALERT_MSG}🚨 CONTAINER POSTGRES BERMASALAH (Status: ${CONTAINER_POSTGRES})\n"
fi

if [ "$CONTAINER_POSTGREST" != "running" ]; then
  ALERT_MSG="${ALERT_MSG}🚨 CONTAINER POSTGREST BERMASALAH (Status: ${CONTAINER_POSTGREST})\n"
fi

# Jika ada anomali, kirim alert darurat ke Telegram
if [ -n "$ALERT_MSG" ]; then
  echo -e "ALERT DETECTED:\n$ALERT_MSG"
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "text=🚨 [ESU VPS ALERT]%0A${ALERT_MSG}" >/dev/null 2>&1 || true
  fi
  # Laporkan kegagalan ke Healthchecks
  if [ -n "$HEALTHCHECK_URL" ]; then
    curl -fsS --retry 3 "${HEALTHCHECK_URL}/fail" >/dev/null 2>&1 || true
  fi
  exit 1
fi

# Jika semua sehat, kirim ping sukses ke Healthchecks.io
if [ -n "$HEALTHCHECK_URL" ]; then
  curl -fsS --retry 3 "$HEALTHCHECK_URL" >/dev/null 2>&1 || true
fi

echo "✅ Resource VPS Sehat (Disk: ${DISK_USAGE}%, RAM: ${RAM_USAGE}%, Swap: ${SWAP_USAGE}%, Postgres: ${CONTAINER_POSTGRES}, PostgREST: ${CONTAINER_POSTGREST})"
