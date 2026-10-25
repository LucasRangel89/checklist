#!/usr/bin/env bash
set -e

echo "========================================================="
echo "  REVALIDA TRACKER - MODO OFFLINE LOCAL (OSCE / INEP)"
echo "========================================================="

if [ ! -d "server/node_modules" ]; then
  echo "[1/3] Instalando dependências pela primeira vez..."
  npm run setup
fi

if [ ! -f "client/dist/index.html" ]; then
  echo "[2/3] Gerando pacote PWA offline..."
  npm run build
fi

echo "[3/3] Iniciando Revalida Tracker em http://localhost:3001 ..."
node server/index.js
