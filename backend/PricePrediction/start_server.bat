@echo off
echo 🌿 LeafLense Price Prediction Server Launcher
echo ================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo 📥 Installing/updating dependencies...
pip install -r requirements.txt

REM Check if model file exists
if not exist "crop_price_model.pkl" (
    echo ⚠️  Warning: Model file 'crop_price_model.pkl' not found!
    echo Please ensure your trained model is in this directory.
    echo The server will still start but predictions may not work.
    pause
)

REM Start the server
echo 🚀 Starting Price Prediction Server...
echo.
echo Server will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ================================================

python server.py

pause
