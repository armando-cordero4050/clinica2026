@echo off
echo Starting DentalFlow Backup System...
cd tools\backup_system
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cls
echo ===================================================
echo   DENTALFLOW BACKUP SYSTEM - PORT 8000
echo   Open: http://localhost:8000
echo ===================================================
uvicorn main:app --reload --port 8000
pause
