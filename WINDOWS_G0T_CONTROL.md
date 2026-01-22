# WINDOWS G0T CONTROL - Deep Integration & Alignment
**Version**: 1.0.0  
**Status**: Windows API Online ✓  
**Purpose**: Bidirectional sync, G0T monitoring, remote control

---

## CURRENT STATE (2026-01-22 03:02Z)

✓ **Windows API**: ONLINE  
✓ **Device**: GratitudePC (windows-laptop)  
✓ **Endpoint**: https://windows.codewithsolo.com/v1  
⏳ **Listener**: Not deployed  
⏳ **Sync**: Not active  
⏳ **Control**: Not active  

---

## ARCHITECTURE: TERMUX ↔ WINDOWS ALIGNMENT

```
TERMUX (Primary Authority)          WINDOWS (Secondary)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

inbox.json (34 items)  ──────git────→  inbox.json (?)
filesystem.json        ──────git────→  filesystem.json (?)
github.json            ──────git────→  github.json (?)

brain-home (view)      ──┐
ba "task" (add)        ──┼──→ HTTP API ──→ windows-listener
brain done (complete)  ──┘

                        ←──── webhook ←──── divergence detection
                        ←──── status ←────  Windows state

SYNC LOOP:
[Termux] → git push → [GitHub] ← git pull ← [Windows]
                ↓
          [Bidirectional Tunnel]
                ↓
          Detect divergences
                ↓
          Merge or flag for review
```

---

## 1. DEPLOY WINDOWS LISTENER (15 MIN)

Save as: `C:\Users\[user]\windows-g0t-control.ps1`

```powershell
# WINDOWS G0T CONTROL LISTENER
# Runs on Windows, allows Termux to monitor + control

param(
    [int]$Port = 5002,
    [string]$BrainPath = "$env:USERPROFILE\.agents\second-brain",
    [string]$GptBridgePath = "$env:USERPROFILE\projects\tools\gpt-bridge"
)

# ============ SETUP ============

if (-not (Test-Path $BrainPath)) {
    New-Item -ItemType Directory -Path $BrainPath -Force | Out-Null
}

$inboxFile = Join-Path $BrainPath "inbox.json"
$statusFile = Join-Path $BrainPath "windows-status.json"

# Initialize status tracker
$status = @{
    "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
    "listener_version" = "1.0.0"
    "brain_path" = $BrainPath
    "inbox_items" = 0
    "gpt_bridge_running" = $false
    "last_sync" = $null
    "divergences" = @()
}

# ============ LISTENER ============

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "✓ Windows G0T Control Listener v1.0.0"
Write-Host "  Port: $Port"
Write-Host "  Brain: $BrainPath"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "Endpoints:"
Write-Host "  GET    /status          - Listener status"
Write-Host "  GET    /brain/status    - Second Brain status"
Write-Host "  GET    /brain/inbox     - Inbox items"
Write-Host "  POST   /brain/sync      - Sync inbox.json"
Write-Host "  GET    /divergence      - G0T (divergences)"
Write-Host "  POST   /server/start    - Start GPT Bridge"
Write-Host "  POST   /server/stop     - Stop GPT Bridge"
Write-Host "  GET    /server/status   - Server status"
Write-Host ""

$serverProcess = $null

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        $method = $request.HttpMethod
        
        $statusCode = 404
        $body = ""
        
        # ========== LISTENER STATUS ==========
        if ($method -eq "GET" -and $path -eq "/status") {
            $statusCode = 200
            $body = @{
                "status" = "listening"
                "port" = $Port
                "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
            } | ConvertTo-Json
        }
        
        # ========== BRAIN STATUS ==========
        elseif ($method -eq "GET" -and $path -eq "/brain/status") {
            $itemCount = 0
            $lastModified = $null
            
            if (Test-Path $inboxFile) {
                $inbox = Get-Content $inboxFile | ConvertFrom-Json
                $itemCount = @($inbox).Count
                $lastModified = (Get-Item $inboxFile).LastWriteTime
            }
            
            $statusCode = 200
            $body = @{
                "brain_path" = $BrainPath
                "inbox_file" = $inboxFile
                "inbox_items" = $itemCount
                "last_modified" = $lastModified.ToUniversalTime().ToString("o")
                "has_git" = (Test-Path (Join-Path $BrainPath ".git"))
            } | ConvertTo-Json
        }
        
        # ========== GET INBOX ==========
        elseif ($method -eq "GET" -and $path -eq "/brain/inbox") {
            if (Test-Path $inboxFile) {
                $body = Get-Content $inboxFile -Raw
                $statusCode = 200
            } else {
                $statusCode = 404
                $body = '{"error":"inbox.json not found"}'
            }
        }
        
        # ========== SYNC INBOX ==========
        elseif ($method -eq "POST" -and $path -eq "/brain/sync") {
            Write-Host "→ Syncing inbox.json from GitHub..."
            
            try {
                Push-Location $BrainPath
                git fetch origin master | Out-Null
                git reset --hard origin/master | Out-Null
                Pop-Location
                
                $statusCode = 200
                $body = @{
                    "status" = "synced"
                    "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
                } | ConvertTo-Json
                
                Write-Host "✓ Sync complete"
            }
            catch {
                $statusCode = 500
                $body = @{ "error" = $_.Exception.Message } | ConvertTo-Json
                Write-Host "✗ Sync failed: $_"
            }
        }
        
        # ========== DIVERGENCE DETECTION (G0T) ==========
        elseif ($method -eq "GET" -and $path -eq "/divergence") {
            $divergences = @()
            
            if (Test-Path $inboxFile) {
                $local = Get-Content $inboxFile | ConvertFrom-Json | ConvertTo-Json -Compress
                
                # Fetch from GitHub
                $github = (Invoke-WebRequest `
                    -Uri "https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json" `
                    -ErrorAction SilentlyContinue).Content | ConvertFrom-Json | ConvertTo-Json -Compress
                
                if ($local -ne $github) {
                    $localCount = @(Get-Content $inboxFile | ConvertFrom-Json).Count
                    $githubCount = @($github | ConvertFrom-Json).Count
                    
                    $divergences += @{
                        "type" = "item_count_mismatch"
                        "local" = $localCount
                        "github" = $githubCount
                        "delta" = $githubCount - $localCount
                    }
                }
            }
            
            $statusCode = 200
            $body = @{
                "gap_of_truth" = $divergences
                "has_divergence" = ($divergences.Count -gt 0)
                "timestamp" = (Get-Date).ToUniversalTime().ToString("o")
            } | ConvertTo-Json
        }
        
        # ========== START SERVER ==========
        elseif ($method -eq "POST" -and $path -eq "/server/start") {
            if ($serverProcess -and -not $serverProcess.HasExited) {
                $statusCode = 400
                $body = @{ "error" = "Server already running" } | ConvertTo-Json
            } else {
                Write-Host "→ Starting GPT Bridge..."
                $serverProcess = Start-Process powershell `
                    -ArgumentList "-NoExit", "-Command", "cd '$GptBridgePath' && npm start" `
                    -PassThru
                
                Start-Sleep -Seconds 2
                
                $statusCode = 200
                $body = @{
                    "status" = "started"
                    "pid" = $serverProcess.Id
                    "port" = 5000
                } | ConvertTo-Json
                
                Write-Host "✓ GPT Bridge started (PID: $($serverProcess.Id))"
            }
        }
        
        # ========== STOP SERVER ==========
        elseif ($method -eq "POST" -and $path -eq "/server/stop") {
            if ($serverProcess -and -not $serverProcess.HasExited) {
                Write-Host "→ Stopping GPT Bridge (PID: $($serverProcess.Id))..."
                Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
                
                $statusCode = 200
                $body = @{ "status" = "stopped" } | ConvertTo-Json
                Write-Host "✓ Stopped"
            } else {
                $statusCode = 400
                $body = @{ "error" = "Server not running" } | ConvertTo-Json
            }
        }
        
        # ========== SERVER STATUS ==========
        elseif ($method -eq "GET" -and $path -eq "/server/status") {
            $isRunning = $serverProcess -and -not $serverProcess.HasExited
            
            $statusCode = 200
            $body = @{
                "status" = if ($isRunning) { "running" } else { "stopped" }
                "pid" = if ($isRunning) { $serverProcess.Id } else { $null }
            } | ConvertTo-Json
        }
        
        # ========== DEFAULT ==========
        else {
            $statusCode = 404
            $body = '{"error":"Not found"}'
        }
        
        # ========== RESPONSE ==========
        
        $response.StatusCode = $statusCode
        $response.ContentType = "application/json"
        
        $output = [System.Text.Encoding]::UTF8.GetBytes($body)
        $response.ContentLength64 = $output.Length
        $response.OutputStream.Write($output, 0, $output.Length)
        $response.Close()
    }
    catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
}

$listener.Stop()
```

---

## 2. INSTALL & RUN ON WINDOWS

```powershell
# Run as Administrator

# 1. Allow scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 2. Run listener
powershell -NoExit -File C:\Users\[user]\windows-g0t-control.ps1

# 3. Add to Task Scheduler for auto-start
$trigger = New-ScheduledTaskTrigger -AtStartup
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoExit -File C:\Users\[user]\windows-g0t-control.ps1"
Register-ScheduledTask -TaskName "WindowsG0TControl" -Trigger $trigger -Action $action -RunLevel Highest
```

---

## 3. TERMUX CONTROL COMMANDS

Create: `~/bin/windows-g0t`

```bash
#!/bin/bash
# Termux G0T Control - Monitor and control Windows

WINDOWS_IP="windows.local"  # Or actual IP: 192.168.x.x
WINDOWS_PORT="5002"
ENDPOINT="http://$WINDOWS_IP:$WINDOWS_PORT"

show_usage() {
    cat << EOF
usage: windows-g0t <command>

STATUS & MONITORING:
  status              Show listener status
  brain-status        Show Windows brain status
  g0t                 Show Gap of Truth (divergences)
  
BRAIN CONTROL:
  inbox               Get all items
  sync                Force sync from GitHub
  
SERVER CONTROL:
  server status       Check if GPT Bridge running
  server start        Start GPT Bridge
  server stop         Stop GPT Bridge
  
COMBINED:
  full-sync           Sync brain + start server
  check-all           Full system check
EOF
}

case "$1" in
    status)
        echo "🔌 Listener Status:"
        curl -s -X GET "$ENDPOINT/status" | jq .
        ;;
    brain-status)
        echo "🧠 Windows Brain Status:"
        curl -s -X GET "$ENDPOINT/brain/status" | jq .
        ;;
    inbox)
        echo "📋 Windows Inbox:"
        curl -s -X GET "$ENDPOINT/brain/inbox" | jq . | head -50
        ;;
    sync)
        echo "🔄 Syncing Windows brain from GitHub..."
        curl -s -X POST "$ENDPOINT/brain/sync" | jq .
        ;;
    g0t)
        echo "⚠️  Gap of Truth (Divergences):"
        curl -s -X GET "$ENDPOINT/divergence" | jq .
        ;;
    server)
        case "$2" in
            status)
                echo "📊 Server Status:"
                curl -s -X GET "$ENDPOINT/server/status" | jq .
                ;;
            start)
                echo "▶️  Starting GPT Bridge..."
                curl -s -X POST "$ENDPOINT/server/start" | jq .
                ;;
            stop)
                echo "⏹️  Stopping GPT Bridge..."
                curl -s -X POST "$ENDPOINT/server/stop" | jq .
                ;;
            *)
                show_usage
                ;;
        esac
        ;;
    full-sync)
        echo "═══════════════════════════════════════"
        echo "FULL SYNC: Brain + Server"
        echo "═══════════════════════════════════════"
        echo ""
        echo "Step 1: Sync brain from GitHub..."
        curl -s -X POST "$ENDPOINT/brain/sync" | jq .
        echo ""
        echo "Step 2: Start server..."
        curl -s -X POST "$ENDPOINT/server/start" | jq .
        echo ""
        echo "✓ Full sync complete"
        ;;
    check-all)
        echo "═══════════════════════════════════════"
        echo "FULL SYSTEM CHECK"
        echo "═══════════════════════════════════════"
        echo ""
        echo "[1] Listener Status"
        curl -s -X GET "$ENDPOINT/status" | jq .
        echo ""
        echo "[2] Brain Status"
        curl -s -X GET "$ENDPOINT/brain/status" | jq .
        echo ""
        echo "[3] Gap of Truth"
        curl -s -X GET "$ENDPOINT/divergence" | jq .
        echo ""
        echo "[4] Server Status"
        curl -s -X GET "$ENDPOINT/server/status" | jq .
        echo ""
        echo "═══════════════════════════════════════"
        ;;
    *)
        show_usage
        ;;
esac
```

---

## 4. DIVERGENCE DETECTION (G0T)

```bash
#!/bin/bash
# ~/bin/monitor-g0t
# Monitor Gap of Truth between Termux and Windows

WINDOWS_IP="windows.local"
ENDPOINT="http://$WINDOWS_IP:5002"

echo "🔍 Monitoring G0T (Gap of Truth)..."
echo ""

# Get divergences
DIVERGENCES=$(curl -s -X GET "$ENDPOINT/divergence" | jq '.gap_of_truth')

if [ "$(echo $DIVERGENCES | jq 'length')" -eq 0 ]; then
    echo "✓ NO DIVERGENCES - Systems aligned"
    exit 0
fi

echo "⚠️  DIVERGENCES DETECTED:"
echo ""
echo $DIVERGENCES | jq .

# Show detailed comparison
echo ""
echo "═══════════════════════════════════════"
echo "DETAILED COMPARISON"
echo "═══════════════════════════════════════"

# Get counts
TERMUX_COUNT=$(jq '.[] | length' ~/.local/share/second-brain/inbox.json)
WINDOWS_COUNT=$(curl -s -X GET "$ENDPOINT/brain/status" | jq '.inbox_items')

echo "Termux items:  $TERMUX_COUNT"
echo "Windows items: $WINDOWS_COUNT"
echo "Delta:         $(($WINDOWS_COUNT - $TERMUX_COUNT))"

if [ "$TERMUX_COUNT" -gt "$WINDOWS_COUNT" ]; then
    echo ""
    echo "→ Windows is behind. Syncing..."
    curl -s -X POST "$ENDPOINT/brain/sync" | jq .
    echo "✓ Sync complete"
fi
```

---

## 5. REAL-TIME MONITORING

```bash
#!/bin/bash
# ~/bin/watch-windows-g0t
# Real-time monitoring loop

INTERVAL=${1:-30}  # Check every 30 seconds

echo "👁️  Watching Windows G0T (every ${INTERVAL}s)"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    clear
    echo "═══════════════════════════════════════"
    echo "WINDOWS G0T STATUS - $(date)"
    echo "═══════════════════════════════════════"
    echo ""
    
    # Check listener
    echo "[Listener]"
    curl -s -X GET "http://windows.local:5002/status" | jq . 2>/dev/null || echo "✗ Unreachable"
    echo ""
    
    # Check brain
    echo "[Brain]"
    curl -s -X GET "http://windows.local:5002/brain/status" | jq . 2>/dev/null || echo "✗ Unreachable"
    echo ""
    
    # Check divergences
    echo "[G0T - Divergences]"
    curl -s -X GET "http://windows.local:5002/divergence" | jq . 2>/dev/null || echo "✗ Unreachable"
    echo ""
    
    # Check server
    echo "[Server]"
    curl -s -X GET "http://windows.local:5002/server/status" | jq . 2>/dev/null || echo "✗ Unreachable"
    echo ""
    
    echo "Next check in ${INTERVAL}s... (Ctrl+C to stop)"
    sleep $INTERVAL
done
```

---

## 6. QUICK SETUP (WINDOWS)

```powershell
# 1. Copy script to Windows
# Download WINDOWS_SERVER_CONTROL.md -> Save to C:\Users\[user]\windows-g0t-control.ps1

# 2. Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
powershell -NoExit -File C:\Users\[user]\windows-g0t-control.ps1

# 3. Verify
# Should show: ✓ Windows G0T Control Listener v1.0.0

# 4. Add to startup (optional)
$trigger = New-ScheduledTaskTrigger -AtStartup
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoExit -File C:\Users\[user]\windows-g0t-control.ps1"
Register-ScheduledTask -TaskName "WindowsG0TControl" -Trigger $trigger -Action $action -RunLevel Highest
```

---

## 7. QUICK SETUP (TERMUX)

```bash
# 1. Copy command file
chmod +x ~/bin/windows-g0t

# 2. Test connection
windows-g0t status

# 3. Check brain
windows-g0t brain-status

# 4. Monitor G0T
windows-g0t g0t

# 5. Auto-sync
windows-g0t full-sync
```

---

## 8. COMMAND REFERENCE

### From Termux

```bash
# Basic status
windows-g0t status           # Listener alive?
windows-g0t brain-status     # How many items?
windows-g0t g0t              # Any divergences?

# Inbox operations
windows-g0t inbox            # View all items
windows-g0t sync             # Pull latest from GitHub

# Server control
windows-g0t server status    # Running?
windows-g0t server start     # Boot it
windows-g0t server stop      # Kill it

# Combined
windows-g0t full-sync        # Sync + start server
windows-g0t check-all        # Full diagnostic

# Monitoring
monitor-g0t                  # Check divergences
watch-windows-g0t 30         # Real-time watch (30s intervals)
```

---

## 9. ALIGNMENT WORKFLOW

```
TERMUX                          WINDOWS
══════════════════════════════════════════════════════════

Step 1: Termux makes change
  ba "New gig"      →
  └─ inbox.json (35 items)
       ↓
    goodbye (git push)
       ↓
    GitHub (35 items)

Step 2: Windows monitors G0T
  windows-g0t g0t   ←────────── Detects divergence (34 vs 35)
  
Step 3: Windows syncs
  windows-g0t sync  ←────────── Pulls latest
       ↓
    inbox.json (35 items)
    
Step 4: Start server
  windows-g0t server start
       ↓
    GPT Bridge running on port 5000
    
Step 5: Verify alignment
  windows-g0t check-all
       ↓
    ✓ All systems aligned
    ✓ Server running
    ✓ No divergences
```

---

## 10. TROUBLESHOOTING

### "Connection refused"
```bash
# Check if Windows listener is running
# Windows: Get-Process | ? Name -like "*powershell*"
# If not, start it:
powershell -NoExit -File C:\Users\[user]\windows-g0t-control.ps1
```

### "G0T shows divergences"
```bash
# Sync Windows from Termux
windows-g0t sync

# Verify
windows-g0t brain-status
```

### "Server won't start"
```bash
# Check process
windows-g0t server status

# Kill any existing
Stop-Process -Name node -Force

# Try again
windows-g0t server start
```

### "Items differ"
```bash
# Get counts
windows-g0t brain-status
jq '.[].id' ~/.local/share/second-brain/inbox.json | wc -l  # Termux count

# Compare
windows-g0t inbox | jq '.[] | .id' | wc -l  # Windows count

# If Windows behind, sync
windows-g0t sync
```

---

## DEPLOYMENT CHECKLIST

- [ ] **Windows**: Copy `windows-g0t-control.ps1`
- [ ] **Windows**: Run as Administrator
- [ ] **Windows**: Listener shows "✓ listening"
- [ ] **Termux**: Test `windows-g0t status` (should respond)
- [ ] **Termux**: Test `windows-g0t brain-status`
- [ ] **Termux**: Test `windows-g0t g0t` (check divergences)
- [ ] **Termux**: Test `windows-g0t server start`
- [ ] **Windows**: Verify GPT Bridge started
- [ ] **Termux**: Test `windows-g0t check-all`
- [ ] **Windows**: Add to Task Scheduler for auto-start
- [ ] **Both**: Monitor real-time with `watch-windows-g0t`

---

## STATUS

**Windows API**: ✓ Online (2026-01-22 03:02Z)  
**Listener**: ⏳ Ready to deploy  
**G0T Control**: ⏳ Ready to activate  
**Sync**: ⏳ Ready to enable  

**Time to Full Control**: ~20 minutes (Windows setup + Termux config)

---

**Last Updated**: 2026-01-22T03:15:00Z
