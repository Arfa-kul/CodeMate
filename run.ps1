Write-Host "===================================================" -ForegroundColor Red
Write-Host "         Starting Web AI (Suit OS) Services        " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Red

$Root = $PSScriptRoot

# 1. Start Backend in background
Write-Host "[1/2] Launching Backend on http://127.0.0.1:8002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; ..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8002"

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Launching Frontend on http://localhost:5174..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "`nBoth services started! Keep the terminal windows open." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "Backend Docs: http://127.0.0.1:8001/docs" -ForegroundColor White
