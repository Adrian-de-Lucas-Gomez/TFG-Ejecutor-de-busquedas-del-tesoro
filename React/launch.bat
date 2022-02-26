@echo off

echo Building react app...

rmdir .\backend\build /s

cd frontend
call npm install
call npm run build
cd .. 

echo Moving react app to backend directory...

move .\frontend\build .\backend\build

echo Launching express backend

cd backend
call npm install
call npm run start

PAUSE