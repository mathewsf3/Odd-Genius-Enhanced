# Memory Optimizer Script for Odd Genius
# This script helps to free up memory when running the development server

Write-Host "Starting memory optimization process..." -ForegroundColor Cyan

# Set Node.js garbage collection options
$env:NODE_OPTIONS = "--expose-gc"

# Clear NPM cache 
Write-Host "Clearing NPM cache..." -ForegroundColor Yellow
npm cache clean --force

# Check memory usage before cleaning
Write-Host "Current memory status:" -ForegroundColor Green
Get-Process -Name node | Select-Object Name, WorkingSet, VirtualMemorySize | Format-Table

# Clean development project
Write-Host "Cleaning webpack cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Remove source maps to save disk space and memory
Write-Host "Removing source maps..." -ForegroundColor Yellow
Get-ChildItem -Path "build" -Recurse -Include "*.map" -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "Memory optimization completed!" -ForegroundColor Green
Write-Host "To start the app with minimal memory, run: npm run start:minmem" -ForegroundColor Cyan

# Run the optimized version if requested
if ($args[0] -eq "run") {
    Write-Host "Starting app with minimal memory configuration..." -ForegroundColor Magenta
    npm run start:minmem
}
