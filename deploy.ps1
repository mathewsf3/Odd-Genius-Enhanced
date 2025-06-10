# Odd Genius Deployment Script for Windows PowerShell
# This script deploys both frontend and backend to cloud platforms

Write-Host "🚀 Starting Odd Genius Deployment Process..." -ForegroundColor Green
Write-Host ""

# Check if required tools are installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏗️  Building Frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
    npm install
}

# Build the frontend
Write-Host "🔨 Building React app..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build completed!" -ForegroundColor Green
Write-Host ""

# Go back to root
Set-Location ..

Write-Host "🏗️  Preparing Backend..." -ForegroundColor Yellow
Set-Location backend

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    npm install
}

Write-Host "✅ Backend prepared!" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "🌐 Deployment Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "FRONTEND (Vercel):" -ForegroundColor Yellow
Write-Host "1. Install Vercel CLI: npm install -g vercel" -ForegroundColor White
Write-Host "2. Login to Vercel: vercel login" -ForegroundColor White
Write-Host "3. Deploy frontend: cd frontend && vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "BACKEND (Railway):" -ForegroundColor Yellow
Write-Host "1. Install Railway CLI: npm install -g @railway/cli" -ForegroundColor White
Write-Host "2. Login to Railway: railway login" -ForegroundColor White
Write-Host "3. Deploy backend: cd backend && railway up" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host "Follow the instructions above to deploy to the cloud platforms." -ForegroundColor White
