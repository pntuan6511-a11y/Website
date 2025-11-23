@echo off
REM VPS Build Script for Windows - Optimized for 1vCPU + 2GB RAM

echo Starting VPS-optimized build...
echo.

REM Set memory limit for Node.js (1.5GB max)
set NODE_OPTIONS=--max-old-space-size=1536

REM Clean previous build
echo Cleaning previous build...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

REM Install dependencies
echo Installing dependencies...
call npm ci --production=false --prefer-offline

REM Run build
echo Building application...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    
    REM Prune dev dependencies
    echo Removing dev dependencies...
    call npm prune --production
    
    echo.
    echo Ready for deployment!
) else (
    echo Build failed!
    exit /b 1
)
