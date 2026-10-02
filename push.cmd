@echo off
set PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%
cd /d "%~dp0"
echo ==================================================
echo   Charles' Bible - GitHub Push Uploader
echo ==================================================
echo.
echo Target: https://github.com/1518ship-it/Charles-bible.git
echo Working Dir: %CD%
echo.
git push -u origin main
echo.
pause
