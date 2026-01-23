# FIX: file.list command path validation
# Run on Windows: powershell -ExecutionPolicy Bypass -File fix-file-list.ps1
# 
# Issue: file.list denies access even for allowed paths (Desktop, .local, etc.)
# Root cause: Path validation doesn't expand relative paths to full paths

$agentScript = "$env:USERPROFILE\Scripts\windows-brain-agent-v4.ps1"

if (-not (Test-Path $agentScript)) {
    Write-Host "ERROR: Agent script not found at $agentScript" -ForegroundColor Red
    exit 1
}

Write-Host "Reading agent script..." -ForegroundColor Cyan
$content = Get-Content $agentScript -Raw

# Find the Test-AllowedPath function or file.list handler
# The issue is likely that file.list doesn't call the path expander

# Create a fixed version of path validation
$fixedValidation = @'
function Get-ExpandedPath {
    param([string]$Path)
    
    # Expand environment variables
    $expanded = [Environment]::ExpandEnvironmentVariables($Path)
    
    # Handle relative paths
    if (-not [System.IO.Path]::IsPathRooted($expanded)) {
        $expanded = Join-Path $env:USERPROFILE $expanded
    }
    
    # Normalize
    if (Test-Path $expanded) {
        $expanded = (Resolve-Path $expanded).Path
    }
    
    return $expanded
}

function Test-AllowedPath {
    param([string]$Path)
    
    $allowedRoots = @(
        (Join-Path $env:USERPROFILE "projects"),
        (Join-Path $env:USERPROFILE "Documents"),
        (Join-Path $env:USERPROFILE ".local"),
        (Join-Path $env:USERPROFILE "Desktop"),
        (Join-Path $env:USERPROFILE "OneDrive\Desktop"),
        (Join-Path $env:USERPROFILE "Downloads")
    )
    
    $expanded = Get-ExpandedPath $Path
    
    foreach ($root in $allowedRoots) {
        if ($expanded -like "$root*") {
            return $true
        }
    }
    
    return $false
}
'@

# Backup original
$backupPath = "$agentScript.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $agentScript $backupPath
Write-Host "Backup created: $backupPath" -ForegroundColor Green

# For now, just output what needs to be fixed
Write-Host "`n=== MANUAL FIX REQUIRED ===" -ForegroundColor Yellow
Write-Host "The file.list command needs to expand paths before validation."
Write-Host ""
Write-Host "In the 'file.list' handler, change:"
Write-Host '  if (-not (Test-AllowedPath $Path)) { ... }'
Write-Host ""
Write-Host "To:"
Write-Host '  $expandedPath = Get-ExpandedPath $Path'
Write-Host '  if (-not (Test-AllowedPath $expandedPath)) { ... }'
Write-Host '  # Then use $expandedPath for Get-ChildItem'
Write-Host ""

# Quick test
Write-Host "`n=== Testing Desktop Access ===" -ForegroundColor Cyan
$desktopPath = [Environment]::GetFolderPath("Desktop")
$oneDriveDesktop = Join-Path $env:USERPROFILE "OneDrive\Desktop"

if (Test-Path $oneDriveDesktop) {
    Write-Host "OneDrive Desktop found: $oneDriveDesktop" -ForegroundColor Green
    Get-ChildItem $oneDriveDesktop | Select-Object Name, Length, LastWriteTime | Format-Table
} elseif (Test-Path $desktopPath) {
    Write-Host "Desktop found: $desktopPath" -ForegroundColor Green
    Get-ChildItem $desktopPath | Select-Object Name, Length, LastWriteTime | Format-Table
} else {
    Write-Host "No desktop found!" -ForegroundColor Red
}
