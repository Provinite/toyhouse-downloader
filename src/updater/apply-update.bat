@echo off
setlocal

REM Check if the zip file path is provided as an argument
if "%~x1" neq ".zip" (
  echo Error: Please provide the path to the zip file as an argument.
  exit /b 1
)

REM Check if the pid to wait for is provided as an argument
if "%~2"=="" (
  echo Error: Please provide the pid to wait for as an argument.
  exit /b 1
)

echo [ThDU] Starting update
echo [ThDU]   Path: %~1
echo [ThDU]   WaitPID: %~2

REM wait for the pid specified in the first argument to exit
:loop
  tasklist | findstr /i " %~2 " > nul
  if %errorlevel%==0 (
    timeout /t 1 > nul
    echo [ThDU] Waiting for the process to exit...
    goto loop
  )
echo [ThDU] Process exited, applying update

REM Unzip the file to the current directory
echo [ThDU] Unpacking update archive
powershell -command "Expand-Archive -Path '%~1' -DestinationPath '.' -Force"
echo [ThDU] Update archive unpacked

echo [ThDU] Deleting update archive "%~1"
del "%~1"

echo Update complete, please relaunch the downloader. Press any key to exit...
pause