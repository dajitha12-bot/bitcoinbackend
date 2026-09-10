$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'

if (-not (Test-Path (Join-Path $backendPath 'manage.py'))) {
    throw "Backend entrypoint not found: $backendPath"
}

if (-not (Test-Path (Join-Path $frontendPath 'package.json'))) {
    throw "Frontend package manifest not found: $frontendPath"
}

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', "Set-Location '$backendPath'; python manage.py runserver 8000"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', "Set-Location '$frontendPath'; npm run dev"
)

Write-Host 'RingFinder services started.' -ForegroundColor Green
Write-Host 'Backend:  http://localhost:8000/'
Write-Host 'Frontend: use the Vite URL shown in the frontend terminal.'
