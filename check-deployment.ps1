# Deployment Status Checker for Odd Genius
param(
    [string]$BackendUrl = "",
    [string]$FrontendUrl = ""
)

Write-Host "🔍 Odd Genius Deployment Status Checker" -ForegroundColor Green
Write-Host ""

if ($BackendUrl -eq "" -or $FrontendUrl -eq "") {
    Write-Host "Usage: .\check-deployment.ps1 -BackendUrl 'https://your-backend.com' -FrontendUrl 'https://your-frontend.com'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example URLs to test:" -ForegroundColor Cyan
    Write-Host "Backend: https://odd-genius-api.onrender.com" -ForegroundColor White
    Write-Host "Frontend: https://odd-genius.netlify.app" -ForegroundColor White
    exit 1
}

# Test Backend Health
Write-Host "🏥 Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/health" -Method GET -TimeoutSec 10
    if ($healthResponse.status -eq "UP") {
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend health check returned: $($healthResponse.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API Root
Write-Host "🔌 Testing API Root..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "$BackendUrl/api" -Method GET -TimeoutSec 10
    Write-Host "✅ API root accessible!" -ForegroundColor Green
} catch {
    Write-Host "❌ API root failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Frontend
Write-Host "🌐 Testing Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri $FrontendUrl -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Manual Tests to Perform:" -ForegroundColor Cyan
Write-Host "1. Visit: $FrontendUrl" -ForegroundColor White
Write-Host "2. Navigate to: $FrontendUrl/match/123456" -ForegroundColor White
Write-Host "3. Check browser console for errors" -ForegroundColor White
Write-Host "4. Test H2H, Corner Stats, and Card Stats tabs" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Direct API Tests:" -ForegroundColor Cyan
Write-Host "Health: $BackendUrl/health" -ForegroundColor White
Write-Host "API: $BackendUrl/api" -ForegroundColor White
Write-Host "H2H: $BackendUrl/api/h2h/93/4973" -ForegroundColor White
