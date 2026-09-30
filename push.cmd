@echo off
set PATH=C:\Users\1518i\AppData\Local\Programs\Git\cmd;C:\Users\1518i\AppData\Local\Programs\Git\ucrt64\bin;%PATH%
if exist "C:\Users\1518i\OneDrive\Desktop\Charles bible\.git" (
    cd /d "C:\Users\1518i\OneDrive\Desktop\Charles bible"
) else (
    cd /d "c:\Users\1518i\Desktop\Charles bible"
)
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
