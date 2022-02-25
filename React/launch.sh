#!/bin/bash -x
echo Building react app...

cd frontend
npm install
npm run build
cd .. 

echo Moving react app to backend directory...

mv ./frontend/build ./backend/build

echo Launching express backend

cd backend
npm install
npm run start
