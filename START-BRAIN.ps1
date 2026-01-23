#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ONE-CLICK startup for Windows Second Brain
    Starts server, agent, sync tasks, and opens dashboard
    
.NOTES
    Run as admin for Task Scheduler registration
#>

$ErrorActionPreference = 'Continue'
$BRAIN_DIR = "$env:USERPROFILE\.local\share\second-brain"
$SCRIPTS_DIR = "$env:USERPROFILE\Scripts"
$SERVER_DIR = "$env:USERPROFILE\.agents\skills\second-brain-sync\server"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  SECOND BRAIN STARTUP" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. Ensure directories exist
Write-Host "`n✓ Checking directories..." -ForegroundColor Yellow
@($BRAIN_DIR, "$BRAIN_DIR\backups", "$BRAIN_DIR\conflicts") | ForEach-Object {
    if (-not (Test-Path $_)) { 
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  Created: $_"
    }
}

# 2. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Install from: https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js: $(node -v)" -ForegroundColor Green

# 3. Start Node server (background)
Write-Host "`n✓ Starting API server..." -ForegroundColor Yellow
$serverProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*$SERVER_DIR*" }
if ($serverProcess) {
    Write-Host "  Already running (PID: $($serverProcess.Id))" -ForegroundColor Cyan
} else {
    Push-Location $SERVER_DIR
    Start-Process -NoNewWindow -FilePath node -ArgumentList "server.js" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  Started (check localhost:5000)" -ForegroundColor Cyan
    Pop-Location
}

# 4. Register sync tasks (if admin)
if ([Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains [Security.Principal.SecurityIdentifier]'S-1-5-32-544') {
    Write-Host "`n✓ Registering sync tasks..." -ForegroundColor Yellow
    $pushTask = Get-ScheduledTask -TaskName "Brain-Sync-Push" -ErrorAction SilentlyContinue
    $pullTask = Get-ScheduledTask -TaskName "Brain-Sync-Pull" -ErrorAction SilentlyContinue
    
    if (-not $pushTask) {
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$SCRIPTS_DIR\windows-sync-push.ps1`""
        $trigger = New-ScheduledTaskTrigger -Daily -At 08:00am
        Register-ScheduledTask -TaskName "Brain-Sync-Push" -Action $action -Trigger $trigger -Force | Out-Null
        Write-Host "  Registered: Brain-Sync-Push (daily 8am)" -ForegroundColor Cyan
    }
    
    if (-not $pullTask) {
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$SCRIPTS_DIR\windows-sync-pull.ps1`""
        $triggers = @(
            (New-ScheduledTaskTrigger -Daily -At 06:00am),
            (New-ScheduledTaskTrigger -Daily -At 12:00pm),
            (New-ScheduledTaskTrigger -Daily -At 06:00pm)
        )
        Register-ScheduledTask -TaskName "Brain-Sync-Pull" -Action $action -Trigger $triggers -Force | Out-Null
        Write-Host "  Registered: Brain-Sync-Pull (6am, 12pm, 6pm)" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n⚠  Run as admin to register sync tasks" -ForegroundColor Yellow
}

# 5. Open dashboard
Write-Host "`n✓ Opening dashboard..." -ForegroundColor Yellow
$dashboardPath = "$BRAIN_DIR\index.html"
if (Test-Path $dashboardPath) {
    Start-Process $dashboardPath
    Write-Host "  Opened: $dashboardPath" -ForegroundColor Cyan
} else {
    Write-Host "  Dashboard not found at: $dashboardPath" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  ✓ Brain is ready" -ForegroundColor Green
Write-Host "  Dashboard: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  API Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
