#!/bin/sh
set -e

echo "──────────────────────────────────────"
echo " App:     ${APP_VERSION:-unknown}"
echo " Env:     ${ENV:-production}"
echo " Node:    $(node --version)"
echo "──────────────────────────────────────"

: "${RABBITMQ_URL:?❌  RABBITMQ_URL is not set. Aborting.}"

echo "▶ Starting notification worker..."
exec "$@"
