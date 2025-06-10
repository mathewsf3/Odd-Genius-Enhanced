#!/usr/bin/env powershell

# Clear Node.js cache
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clean up any running processes
$processName = "node"
$nodeProcesses = Get-Process -Name $processName -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*craco*" }
if ($nodeProcesses) {
    Write-Host "Stopping existing Node.js processes..."
    $nodeProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force }
}

# Environment variables for memory optimization
$env:GENERATE_SOURCEMAP = "false"
$env:DISABLE_ESLINT_PLUGIN = "true"
$env:TSC_COMPILE_ON_ERROR = "true"
$env:FAST_REFRESH = "false"
$env:INLINE_RUNTIME_CHUNK = "false"
$env:IMAGE_INLINE_SIZE_LIMIT = "0"
$env:BROWSER = "none"

# Run the app with memory optimization
Write-Host "Starting app with memory optimization..."
npm run start:minmem
