@echo off
echo ===================================================
echo   Croconi Admin Dashboard Git Push Utility
echo ===================================================
echo.
echo [1/5] Initializing Git Repository...
git init

echo [2/5] Staging Project Files...
git add .

echo [3/5] Committing Code changes...
git commit -m "feat: integrate real FAQ APIs and fix TypeScript compilation errors"

echo [4/5] Aligning branch name to main...
git branch -M main

echo [5/5] Re-registering remote origin URL...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/shailgd34/crconi-admin.git

echo.
echo ===================================================
echo   Pushing code to GitHub repository...
echo ===================================================
git push -u origin main

echo.
echo Project successfully synchronized with shailgd34/crconi-admin!
pause
