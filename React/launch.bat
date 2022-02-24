@echo off

echo Building react app...

cd frontend
call npm run build
cd .. 

echo Copying react app to backend directory...

xcopy /s /e /i .\frontend\build .\backend\build

echo Launching express backend

cd backend
call npm run start

PAUSE