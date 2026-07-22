Write-Host "=== Route Pro AI - Setup ===" -ForegroundColor Cyan

Write-Host "`n1. Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($?) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red; exit 1 }

Write-Host "`n2. Configurando base de datos..." -ForegroundColor Yellow
npx prisma generate
if ($?) { Write-Host "  Prisma generado" -ForegroundColor Green }
npx prisma db push
if ($?) { Write-Host "  Base de datos sincronizada" -ForegroundColor Green }

Write-Host "`n3. Cargando datos de prueba..." -ForegroundColor Yellow
npx tsx prisma/seed.ts
if ($?) { Write-Host "  Seed completado" -ForegroundColor Green }

Write-Host "`n4. Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($?) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAILED" -ForegroundColor Red; exit 1 }

Write-Host "`n5. Compilando..." -ForegroundColor Yellow
npx vite build
if ($?) { Write-Host "  Build OK" -ForegroundColor Green }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup completado!" -ForegroundColor Green
Write-Host "Para iniciar:" -ForegroundColor Yellow
Write-Host "  Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  Admin: admin@routeproai.com / admin123" -ForegroundColor White
Write-Host "  Driver: driver@routeproai.com / admin123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
