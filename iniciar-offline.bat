@echo off
chcp 65001 >nul
echo =========================================================
echo   REVALIDA TRACKER - MODO OFFLINE LOCAL (OSCE / INEP)
echo =========================================================
echo.

if not exist "server\node_modules" (
  echo [1/3] Instalando dependencias pela primeira vez...
  call npm run setup
)

if not exist "client\dist\index.html" (
  echo [2/3] Gerando pacote PWA offline...
  call npm run build
)

echo [3/3] Iniciando Revalida Tracker em http://localhost:3001 ...
start http://localhost:3001
node server/index.js
pause
