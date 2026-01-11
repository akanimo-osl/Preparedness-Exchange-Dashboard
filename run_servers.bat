@echo off
REM Windows batch script to run both backend and frontend servers

REM Start backend (assumes Django)
start "Backend" cmd /k "cd backend-main\backend-main && python manage.py runserver"

REM Start frontend (assumes Vite/React)
start "Frontend" cmd /k "cd frontend-main\frontend-main && npm run dev"

echo Both servers are starting in separate windows.
pause
