#!/usr/bin/env powershell

Write-Host "🌿 LeafLense Price Prediction Server Launcher" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org or Microsoft Store" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get current directory
$currentDir = Get-Location

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $currentDir "venv\Scripts\Activate.ps1"

if (Test-Path $activateScript) {
    # Set execution policy for current session to allow script execution
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
    & $activateScript
} else {
    Write-Host "❌ Virtual environment activation script not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install requirements
Write-Host "📥 Installing/updating dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Some dependencies might have failed to install, but continuing..." -ForegroundColor Yellow
}

# Check if model file exists
if (!(Test-Path "crop_price_model.pkl")) {
    Write-Host "⚠️ Warning: Model file 'crop_price_model.pkl' not found!" -ForegroundColor Yellow
    Write-Host "Please ensure your trained model is in this directory." -ForegroundColor Yellow
    Write-Host "The server will still start but predictions may not work." -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway"
} else {
    Write-Host "✅ Model file found: crop_price_model.pkl" -ForegroundColor Green
}

# Start the server
Write-Host ""
Write-Host "🚀 Starting Price Prediction Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Start the server
python server.py

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Server exited with error code $LASTEXITCODE" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
