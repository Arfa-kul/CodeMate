@echo off
title CodeMate Launcher
echo ===================================================
echo           Starting CodeMate AI Services
echo ===================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8002...
start "CodeMate Backend" cmd /k "cd /d ""%~dp0"" && call .venv\Scripts\activate.bat && cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8002"

timeout /t 2 >nul

echo [2/2] Launching Vite Frontend...
start "CodeMate Frontend" cmd /k "cd /d ""%~dp0\frontend"" && npm run dev"

echo.
echo ===================================================
echo  CodeMate is starting!
echo  Backend Docs: http://127.0.0.1:8001/docs
echo  Frontend UI:  http://localhost:5173 (or 5174 if 5173 is occupied)
echo ===================================================
echo Keep the two opened terminal windows running while using CodeMate.
pause
