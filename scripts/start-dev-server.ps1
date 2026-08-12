$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $projectRoot "vite-dev.log"
$errorLogFile = Join-Path $projectRoot "vite-dev.err.log"
$portOpen = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet

if ($portOpen) {
  Write-Host "Work Life Hub is already running at http://localhost:5173/"
  exit 0
}

Start-Process `
  -WindowStyle Hidden `
  -FilePath "npm.cmd" `
  -ArgumentList @("run", "dev:watch", "--", "--port", "5173") `
  -WorkingDirectory $projectRoot `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError $errorLogFile

Start-Sleep -Seconds 2

if (Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet) {
  Write-Host "Work Life Hub started at http://localhost:5173/"
  exit 0
}

Write-Host "Failed to start Work Life Hub. Check vite-dev.err.log"
exit 1
