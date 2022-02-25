#!/bin/bash -x
echo Building react app...

cd frontend
npm run build
cd .. 

echo Copying react app to backend directory...

cp -r ./frontend/build ./backend/build

echo Launching express backend

cd backend
npm run start
