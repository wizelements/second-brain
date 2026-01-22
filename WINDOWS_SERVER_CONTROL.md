# WINDOWS SERVER CONTROL - Remote Start from Termux

**Purpose**: Allow Termux to remotely start GPT Bridge on Windows  
**Status**: Ready for implementation when Windows comes online  
**Setup Time**: 15 minutes

---

## QUICK START (When Windows Online)

### 1. On Windows: Deploy Listener
```powershell
# Create C:\Users\[user]\server-listener.ps1

$PORT = 5002
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$PORT/")
$listener.Start()

Write-Host "Server Control Listener running on port $PORT"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    if ($request.HttpMethod -eq "POST" -and $request.Url.LocalPath -eq "/start") {
        Write-Host "Starting GPT Bridge..."
        Start-Process powershell -ArgumentList `
            "-NoExit", `
            "-Command", `
            "cd C:\Users\[user]\projects\tools\gpt-bridge && npm start"
        
        $response.StatusCode = 200
        $output = [System.Text.Encoding]::UTF8.GetBytes('{"status":"started"}')
    } 
    elseif ($request.Url.LocalPath -eq "/status") {
        $response.StatusCode = 200
        $output = [System.Text.Encoding]::UTF8.GetBytes('{"status":"listening"}')
    }
    else {
        $response.StatusCode = 404
        $output = [System.Text.Encoding]::UTF8.GetBytes('{}')
    }
    
    $response.ContentLength64 = $output.Length
    $response.OutputStream.Write($output, 0, $output.Length)
    $response.Close()
}
```

### 2. On Windows: Add to Startup
```powershell
# Create shortcut or add to Task Scheduler
# So listener starts when Windows boots

# Via Task Scheduler:
$trigger = New-ScheduledTaskTrigger -AtStartup
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoExit -File C:\Users\[user]\server-listener.ps1"
Register-ScheduledTask -TaskName "ServerListener" -Trigger $trigger -Action $action -RunLevel Highest
```

### 3. On Termux: Test Connection
```bash
# Make script executable
chmod +x ~/bin/windows-start-server

# Test if Windows listener is reachable
curl -X POST http://windows.local:5002/start

# Or via SSH
ssh windows@windows.local "powershell -Command 'echo OK'"
```

### 4. On Termux: Start Server Remotely
```bash
# Start GPT Bridge on Windows from Termux
windows-start-server

# With custom port
windows-start-server 5000

# Check status
curl http://windows.local:5002/status
```

---

## SETUP OPTIONS (Choose One)

### Option A: SSH (Best if SSH available)

**Requirements**:
- SSH server running on Windows
- Public key auth configured
- Network connectivity

**Setup**:
```bash
# On Termux, add Windows SSH key
ssh-copy-id windows@windows.local

# Test
ssh windows@windows.local "echo Hello"

# Use in script (auto-completes)
windows-start-server
```

### Option B: Cloudflare Tunnel (Best for reliability)

**Setup on Windows**:
1. Install cloudflared
2. Create tunnel: `cloudflared tunnel create windows-control`
3. Route subdomain: `windows-control.codewithsolo.com`
4. Run: `cloudflared tunnel run windows-control`

**Listener on Windows** (expose on tunnel):
```powershell
# Listener on localhost:5002
# Tunnel routes to windows-control.codewithsolo.com/start
```

**From Termux**:
```bash
curl -X POST https://windows-control.codewithsolo.com/start \
    -H "X-API-Key: $WINDOWS_SECRET_KEY"
```

### Option C: Local HTTP Listener (Simplest)

**Setup on Windows**:
1. Copy listener script (above)
2. Run as Task or background service
3. Listens on `localhost:5002`

**From Termux**:
```bash
# If on same network
curl -X POST http://windows.local:5002/start

# Or via SSH
ssh windows@windows.local "curl -X POST http://localhost:5002/start"
```

---

## ENHANCED LISTENER (PowerShell)

```powershell
# Save as: C:\Users\[user]\gpt-bridge-listener.ps1

param(
    [int]$Port = 5002,
    [string]$GptBridgePath = "C:\Users\[user]\projects\tools\gpt-bridge"
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "✓ GPT Bridge Control Listener on port $Port"
Write-Host "  - POST /start     → Start server"
Write-Host "  - POST /stop      → Stop server"
Write-Host "  - GET  /status    → Check status"

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
        
        # POST /start
        if ($method -eq "POST" -and $path -eq "/start") {
            if ($serverProcess -and -not $serverProcess.HasExited) {
                $statusCode = 400
                $body = '{"error":"Server already running"}'
            } else {
                Write-Host "→ Starting GPT Bridge..."
                $serverProcess = Start-Process powershell `
                    -ArgumentList "-NoExit", "-Command", "cd '$GptBridgePath' && npm start" `
                    -PassThru
                
                $statusCode = 200
                $body = "{`"status`":`"started`",`"pid`":$($serverProcess.Id)}"
                Write-Host "✓ GPT Bridge started (PID: $($serverProcess.Id))"
            }
        }
        
        # POST /stop
        elseif ($method -eq "POST" -and $path -eq "/stop") {
            if ($serverProcess -and -not $serverProcess.HasExited) {
                Write-Host "→ Stopping GPT Bridge (PID: $($serverProcess.Id))..."
                Stop-Process -Id $serverProcess.Id -Force
                $statusCode = 200
                $body = '{"status":"stopped"}'
                Write-Host "✓ Stopped"
            } else {
                $statusCode = 400
                $body = '{"error":"Server not running"}'
            }
        }
        
        # GET /status
        elseif ($method -eq "GET" -and $path -eq "/status") {
            if ($serverProcess -and -not $serverProcess.HasExited) {
                $statusCode = 200
                $body = "{`"status`":`"running`",`"pid`":$($serverProcess.Id)}"
            } else {
                $statusCode = 200
                $body = '{"status":"stopped"}'
            }
        }
        
        # Default
        else {
            $statusCode = 404
            $body = '{"error":"Not found"}'
        }
        
        $response.StatusCode = $statusCode
        $response.ContentType = "application/json"
        $output = [System.Text.Encoding]::UTF8.GetBytes($body)
        $response.ContentLength64 = $output.Length
        $response.OutputStream.Write($output, 0, $output.Length)
        $response.Close()
    }
    catch {
        Write-Host "Error: $_"
    }
}

$listener.Stop()
```

---

## TERMUX COMMAND

```bash
#!/bin/bash
# ~/bin/windows-start-server (enhanced)

show_usage() {
    echo "Usage: windows-start-server [start|stop|status]"
    echo ""
    echo "Commands:"
    echo "  start          Start GPT Bridge on Windows"
    echo "  stop           Stop GPT Bridge on Windows"
    echo "  status         Check server status"
    echo ""
    echo "Requires: Windows listener running on localhost:5002"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
WINDOWS_HOST="windows.local"
WINDOWS_PORT="5002"
ENDPOINT="http://$WINDOWS_HOST:$WINDOWS_PORT"

case $COMMAND in
    start)
        echo "🔌 Starting GPT Bridge on Windows..."
        curl -X POST "$ENDPOINT/start" -H "Content-Type: application/json" -s | jq .
        ;;
    stop)
        echo "🛑 Stopping GPT Bridge on Windows..."
        curl -X POST "$ENDPOINT/stop" -H "Content-Type: application/json" -s | jq .
        ;;
    status)
        echo "📊 Checking Windows server status..."
        curl -X GET "$ENDPOINT/status" -H "Content-Type: application/json" -s | jq .
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
```

---

## TESTING CHECKLIST

When Windows comes online:

- [ ] **Windows**: PowerShell listener running
- [ ] **Windows**: Listening on localhost:5002
- [ ] **Termux**: Can ping Windows (`ping windows.local`)
- [ ] **Termux**: Can reach listener (`curl http://windows.local:5002/status`)
- [ ] **Termux**: Run `windows-start-server status`
- [ ] **Termux**: Run `windows-start-server start`
- [ ] **Windows**: Verify server started
- [ ] **Termux**: Run `windows-start-server stop`
- [ ] **Windows**: Verify server stopped

---

## ENVIRONMENT SETUP

### Required on Windows
```powershell
# Set environment variables
[Environment]::SetEnvironmentVariable("WINDOWS_API_KEY", "your-secret-key", "User")
[Environment]::SetEnvironmentVariable("GPT_BRIDGE_PATH", "C:\Users\[user]\projects\tools\gpt-bridge", "User")
```

### Required on Termux
```bash
# Add to ~/.zshrc or ~/.bashrc
export WINDOWS_HOST="windows.local"
export WINDOWS_PORT="5002"
export WINDOWS_API_KEY="your-secret-key"
```

---

## TROUBLESHOOTING

### "Connection refused"
```bash
# Check if listener is running on Windows
# Windows: Get-Process | ? Name -like "*powershell*"
# If not running, start listener manually
```

### "Host unreachable"
```bash
# Check network connectivity
ping windows.local

# Check firewall allows port 5002
# Windows: netsh advfirewall firewall add rule name="ServerListener" dir=in action=allow protocol=tcp localport=5002
```

### "Server already running"
```bash
# Force kill existing process
windows-start-server stop

# Or on Windows:
Stop-Process -Name node -Force
```

### Script not executable
```bash
chmod +x ~/bin/windows-start-server
```

---

## FULL INTEGRATION (When Both Online)

```
TERMUX COMMAND
     │
     ├─→ windows-start-server start
     │
     ▼
LOCAL NETWORK (windows.local:5002)
     │
     ├─→ PowerShell Listener
     │   └─→ Start-Process GPT Bridge
     │
     ▼
WINDOWS GPT BRIDGE (port 5000)
     │
     ├─→ Cloudflare Tunnel
     │   └─→ solospace.codewithsolo.com
     │
     ▼
AVAILABLE TO INTERNET
```

---

## STATUS

**Current**: ⏳ Ready for implementation  
**When Windows Online**:
1. Deploy listener (5 min)
2. Add to Task Scheduler (2 min)
3. Test from Termux (3 min)
4. ✓ Complete

**End Result**: `windows-start-server start` from Termux starts GPT Bridge on Windows instantly.

---

**Last Updated**: 2026-01-21T17:45:00Z
