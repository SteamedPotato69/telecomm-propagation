@echo off
setlocal
cd /d "%~dp0.."

if not exist "dist\index.html" (
  echo No se encontro un build web todavia. Generandolo con "npm run build:web"...
  echo.
  call npm run build:web
  if errorlevel 1 (
    echo.
    echo Fallo la generacion del build. Revisa los mensajes de arriba.
    pause
    exit /b 1
  )
)

node "desktop\serve.js"

echo.
echo El servidor se detuvo.
pause
