# Second Brain Master Implementation Plan
**Version**: 2.0.0  
**Date**: 2026-01-22  
**Goal**: Full GPT ↔ Windows ↔ Termux bidirectional control system

---

## EXECUTIVE SUMMARY

Build a complete remote control system where ChatGPT can:
1. **Control Windows laptop** (restart, lock, servers, files)
2. **Capture & sync** notes, reminders, alerts across devices
3. **Send emails** from either device
4. **Create projects** locally or on GitHub
5. **Ask clarifying questions** before executing destructive actions
6. **Full bidirectional sync** with offline queue support

---

## GAP ANALYSIS MATRIX

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| **System Control** (restart/lock/sleep) | Script exists, not deployed | Missing: scheduler, WAN exposure, auth | 🔴 HIGH |
| **Server Management** (start/stop) | Endpoints in script | Missing: Docker integration, project mapping | 🟡 MED |
| **Notes/Sticky Alternative** | inbox.json only | Missing: dedicated notes.jsonl, search, Windows toast | 🔴 HIGH |
| **Reminders & Alerts** | Items in inbox, no scheduler | Missing: Windows toast runner, phone push | 🔴 HIGH |
| **Email Integration** | Not implemented | Missing: Gmail API, Outlook Graph API | 🟡 MED |
| **Project Scaffolding** | project-architect skill exists | Missing: voice→scaffold wiring, GitHub create | 🟡 MED |
| **Clarification Loop** | Not implemented | Missing: two-phase confirm workflow | 🔴 HIGH |
| **Windows Listener** | Script ready, not running | Missing: scheduled task, tunnel active | 🔴 CRITICAL |
| **Command Queue** | Not implemented | Missing: commands.jsonl, results.jsonl | 🔴 CRITICAL |
| **Cloudflare Tunnel** | Tunnel exists, not running | solospace tunnel has 1 connection, windows-solo has 0 | 🔴 CRITICAL |
| **Bidirectional Sync** | Git pull works | Windows push not tested/automated | 🟡 MED |
| **Webhook Endpoints** | solospace.codewithsolo.com | Timeout on /nudge - server may be down | 🔴 CRITICAL |

---

## VERIFIED STATUS

### ✅ Working
- SSH service: Running, StartType=Automatic
- Git repo: Up to date with origin/master
- Cloudflared: Installed, tunnels defined
- second-brain-sync skill: Installed
- inbox.json: 43 items synced

### ❌ Not Working
- Cloudflare tunnel (windows-solo): No active connections
- Webhook endpoints: Timeout on https://solospace.codewithsolo.com/webhook/nudge
- Windows listener (windows-gpt-control.ps1): Not running
- commands.jsonl: Does not exist
- Scheduled tasks: None for agent/sync

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              GPT (ChatGPT)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Custom Actions:                                                  │   │
│  │  • POST /command/enqueue → queue command                        │   │
│  │  • GET  /command/status  → check result                         │   │
│  │  • POST /command/confirm → approve destructive action           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Cloudflare Tunnel (WAN)                         │
│  windows.codewithsolo.com → localhost:5002 (Windows Agent)              │
│  solospace.codewithsolo.com → Android/Termux webhook server             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
┌─────────────────────────────┐         ┌─────────────────────────────────┐
│      WINDOWS LAPTOP         │         │       ANDROID / TERMUX          │
│  ┌───────────────────────┐  │         │  ┌───────────────────────────┐  │
│  │   Windows Agent       │  │         │  │   Webhook Server          │  │
│  │   (PowerShell)        │  │         │  │   (Node.js/Python)        │  │
│  │   ────────────────    │  │         │  │   ─────────────────────   │  │
│  │   • Poll commands/    │  │◄───────►│  │   • /webhook/capture      │  │
│  │   • Execute allowed   │  │  GitHub │  │   • /webhook/nudge        │  │
│  │   • Write results     │  │   Sync  │  │   • /command/enqueue      │  │
│  │   • Toast notifs      │  │         │  │   • Tasker/AutoVoice      │  │
│  └───────────────────────┘  │         │  └───────────────────────────┘  │
│                             │         │                                 │
│  Local Files:               │         │  Local Files:                   │
│  ├─ inbox.json              │         │  ├─ inbox.json                  │
│  ├─ commands.jsonl          │         │  ├─ commands.jsonl              │
│  ├─ results.jsonl           │         │  ├─ results.jsonl               │
│  ├─ notes.jsonl             │         │  ├─ notes.jsonl                 │
│  └─ reminders.json          │         │  └─ reminders.json              │
└─────────────────────────────┘         └─────────────────────────────────┘
```

---

## PHASE 0: IMMEDIATE FIXES (30 min)

### 0.1 Start Windows Listener
```powershell
# Save and run as windows-agent.ps1
Start-Process powershell -ArgumentList "-NoExit -File C:\Users\jacla\windows-gpt-control.ps1" -Verb RunAs
```

### 0.2 Activate Cloudflare Tunnel
```powershell
# Start the windows-solo tunnel
cloudflared tunnel run windows-solo
```

### 0.3 Create Command Queue Files
```powershell
# Create missing files
@'
[]
'@ | Set-Content "C:\Users\jacla\.local\share\second-brain\commands.jsonl"

@'
[]
'@ | Set-Content "C:\Users\jacla\.local\share\second-brain\results.jsonl"

@'
[]
'@ | Set-Content "C:\Users\jacla\.local\share\second-brain\notes.jsonl"
```

---

## PHASE 1: WINDOWS AGENT V2 (2-3 hours)

### 1.1 Enhanced Agent Script

Create `C:\Users\jacla\Scripts\windows-agent-v2.ps1`:

```powershell
# WINDOWS AGENT V2
# Full GPT control with command queue support

param(
    [int]$Port = 5002,
    [int]$PollInterval = 15,  # seconds
    [string]$BrainPath = "$env:USERPROFILE\.local\share\second-brain",
    [string]$AuthToken = $env:SECOND_BRAIN_TOKEN
)

# ============ COMMAND WHITELIST ============
$AllowedCommands = @{
    "system.lock" = { rundll32.exe user32.dll,LockWorkStation }
    "system.sleep" = { Add-Type -Assembly System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState("Suspend", $false, $false) }
    "system.restart" = { shutdown /r /t 30 /c "Remote restart requested" }  # 30s delay
    "system.shutdown" = { shutdown /s /t 30 /c "Remote shutdown requested" }
    "system.cancelshutdown" = { shutdown /a }
    "notify.toast" = { param($msg) [Windows.UI.Notifications.ToastNotificationManager,Windows.UI.Notifications,ContentType=WindowsRuntime]; $xml = [Windows.UI.Notifications.ToastTemplateType]::ToastText01; $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($xml); $t.GetElementsByTagName("text")[0].AppendChild($t.CreateTextNode($msg)); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("SecondBrain").Show([Windows.UI.Notifications.ToastNotification]::new($t)) }
    "server.dev.start" = { Start-Process powershell -ArgumentList "-Command cd C:\Users\jacla\projects\beltlinegolf; pnpm dev" }
    "server.dev.stop" = { Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force }
    "docker.start" = { param($name) docker start $name }
    "docker.stop" = { param($name) docker stop $name }
    "docker.status" = { docker ps --format "table {{.Names}}\t{{.Status}}" }
    "file.read" = { param($path) Get-Content $path -Raw }
    "file.list" = { param($path) Get-ChildItem $path | Select-Object Name, Length, LastWriteTime }
    "project.scaffold" = { param($name,$type) & "$env:USERPROFILE\.agents\skills\project-architect\scripts\architect.ps1" -Name $name -Type $type -Generate }
    "github.create" = { param($name,$private) gh repo create $name $(if($private){"--private"}else{"--public"}) --clone }
    "note.add" = { param($text) $note = @{id=[guid]::NewGuid().ToString();text=$text;timestamp=(Get-Date -Format o)} | ConvertTo-Json -Compress; Add-Content "$BrainPath\notes.jsonl" $note }
    "reminder.add" = { param($text,$time) $rem = @{id=[guid]::NewGuid().ToString();text=$text;triggerAt=$time;status="pending"} | ConvertTo-Json -Compress; Add-Content "$BrainPath\reminders.jsonl" $rem }
}

# Commands requiring confirmation
$RequiresConfirm = @("system.restart", "system.shutdown", "file.delete", "project.delete")

# ============ FUNCTIONS ============

function Get-PendingCommands {
    $cmdFile = Join-Path $BrainPath "commands.jsonl"
    if (-not (Test-Path $cmdFile)) { return @() }
    
    $lines = Get-Content $cmdFile
    $pending = @()
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $cmd = $line | ConvertFrom-Json
        if ($cmd.status -eq "confirmed" -or ($cmd.status -eq "pending" -and $cmd.intent -notin $RequiresConfirm)) {
            $pending += $cmd
        }
    }
    return $pending
}

function Write-Result {
    param($commandId, $status, $output, $error)
    
    $result = @{
        id = [guid]::NewGuid().ToString()
        commandId = $commandId
        executedAt = (Get-Date -Format o)
        status = $status
        output = $output
        error = $error
        device = "windows-laptop"
    } | ConvertTo-Json -Compress
    
    Add-Content (Join-Path $BrainPath "results.jsonl") $result
}

function Update-CommandStatus {
    param($commandId, $newStatus)
    
    $cmdFile = Join-Path $BrainPath "commands.jsonl"
    $lines = Get-Content $cmdFile
    $updated = @()
    
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $cmd = $line | ConvertFrom-Json
        if ($cmd.id -eq $commandId) {
            $cmd.status = $newStatus
            $cmd.updatedAt = (Get-Date -Format o)
        }
        $updated += ($cmd | ConvertTo-Json -Compress)
    }
    
    $updated | Set-Content $cmdFile
}

function Invoke-Command {
    param($cmd)
    
    $intent = $cmd.intent
    $args = $cmd.args
    
    if (-not $AllowedCommands.ContainsKey($intent)) {
        Write-Result -commandId $cmd.id -status "rejected" -output $null -error "Unknown command: $intent"
        Update-CommandStatus -commandId $cmd.id -newStatus "rejected"
        return
    }
    
    try {
        $handler = $AllowedCommands[$intent]
        $output = if ($args) { & $handler @args } else { & $handler }
        Write-Result -commandId $cmd.id -status "success" -output ($output | Out-String) -error $null
        Update-CommandStatus -commandId $cmd.id -newStatus "done"
        Write-Host "✓ Executed: $intent"
    }
    catch {
        Write-Result -commandId $cmd.id -status "failed" -output $null -error $_.Exception.Message
        Update-CommandStatus -commandId $cmd.id -newStatus "failed"
        Write-Host "✗ Failed: $intent - $_"
    }
}

function Sync-FromGitHub {
    Push-Location $BrainPath
    git fetch origin master 2>$null
    git pull origin master 2>$null
    Pop-Location
}

function Sync-ToGitHub {
    Push-Location $BrainPath
    git add -A
    $hasChanges = git diff --cached --quiet; $LASTEXITCODE -ne 0
    if ($hasChanges) {
        git commit -m "Windows Agent: Auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        git push origin master
    }
    Pop-Location
}

# ============ HTTP LISTENER ============

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host @"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WINDOWS AGENT V2.0 - Second Brain Control
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Port: $Port
  Poll Interval: ${PollInterval}s
  Brain Path: $BrainPath
  
  Endpoints:
    GET  /status          - Agent health
    GET  /commands        - List pending commands
    POST /command         - Execute immediate command
    POST /sync            - Force git sync
    GET  /results         - Recent results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@

# Background job for polling
$pollJob = Start-Job -ScriptBlock {
    param($BrainPath, $PollInterval)
    while ($true) {
        Start-Sleep -Seconds $PollInterval
        # Signal to poll
        "poll" | Out-File "$BrainPath\.poll-trigger" -Force
    }
} -ArgumentList $BrainPath, $PollInterval

$lastPoll = Get-Date

# ============ MAIN LOOP ============

while ($listener.IsListening) {
    # Check for poll trigger
    $triggerFile = Join-Path $BrainPath ".poll-trigger"
    if (Test-Path $triggerFile) {
        Remove-Item $triggerFile -Force
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Polling GitHub..."
        Sync-FromGitHub
        
        $pending = Get-PendingCommands
        foreach ($cmd in $pending) {
            Invoke-Command -cmd $cmd
        }
        
        if ($pending.Count -gt 0) {
            Sync-ToGitHub
        }
    }
    
    # Handle HTTP requests with timeout
    $asyncResult = $listener.BeginGetContext($null, $null)
    $waitResult = $asyncResult.AsyncWaitHandle.WaitOne(1000)
    
    if (-not $waitResult) { continue }
    
    $context = $listener.EndGetContext($asyncResult)
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    $method = $request.HttpMethod
    
    $statusCode = 200
    $body = ""
    
    # Auth check (if token set)
    if ($AuthToken -and $request.Headers["Authorization"] -ne "Bearer $AuthToken") {
        $statusCode = 401
        $body = '{"error":"Unauthorized"}'
    }
    elseif ($path -eq "/status" -and $method -eq "GET") {
        $body = @{
            status = "online"
            agent = "windows-agent-v2"
            timestamp = (Get-Date -Format o)
            pendingCommands = (Get-PendingCommands).Count
            lastPoll = $lastPoll.ToString("o")
        } | ConvertTo-Json
    }
    elseif ($path -eq "/commands" -and $method -eq "GET") {
        $body = (Get-PendingCommands) | ConvertTo-Json -AsArray
    }
    elseif ($path -eq "/command" -and $method -eq "POST") {
        $reader = New-Object System.IO.StreamReader($request.InputStream)
        $reqBody = $reader.ReadToEnd() | ConvertFrom-Json
        
        $cmd = @{
            id = [guid]::NewGuid().ToString()
            intent = $reqBody.intent
            args = $reqBody.args
            status = "pending"
            createdAt = (Get-Date -Format o)
            source = "direct"
        }
        
        Invoke-Command -cmd $cmd
        $body = @{ status = "executed"; commandId = $cmd.id } | ConvertTo-Json
    }
    elseif ($path -eq "/sync" -and $method -eq "POST") {
        Sync-FromGitHub
        Sync-ToGitHub
        $body = @{ status = "synced"; timestamp = (Get-Date -Format o) } | ConvertTo-Json
    }
    elseif ($path -eq "/results" -and $method -eq "GET") {
        $resultsFile = Join-Path $BrainPath "results.jsonl"
        if (Test-Path $resultsFile) {
            $lines = Get-Content $resultsFile -Tail 20
            $body = "[" + ($lines -join ",") + "]"
        } else {
            $body = "[]"
        }
    }
    else {
        $statusCode = 404
        $body = '{"error":"Not found"}'
    }
    
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json"
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
}

Stop-Job $pollJob
Remove-Job $pollJob
$listener.Stop()
```

### 1.2 Register as Scheduled Task

```powershell
# Create scheduled task to run agent at startup
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -File C:\Users\jacla\Scripts\windows-agent-v2.ps1"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "SecondBrainAgent" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
```

### 1.3 Configure Cloudflare Tunnel

```yaml
# ~/.cloudflared/config.yml
tunnel: windows-solo
credentials-file: C:\Users\jacla\.cloudflared\ada59b64-6d36-4029-80ac-eb3977d9ff24.json

ingress:
  - hostname: windows.codewithsolo.com
    service: http://localhost:5002
    originRequest:
      noTLSVerify: true
  - service: http_status:404
```

---

## PHASE 2: COMMAND QUEUE PROTOCOL (1-2 hours)

### 2.1 Command Schema

```json
// commands.jsonl - one JSON object per line
{
  "id": "cmd-uuid-here",
  "intent": "system.lock",
  "args": {},
  "status": "pending|confirmed|done|failed|rejected|cancelled",
  "requiresConfirm": false,
  "source": "gpt|termux|voice",
  "sourceDevice": "android|gpt",
  "targetDevice": "windows-laptop",
  "createdAt": "2026-01-22T12:00:00Z",
  "confirmedAt": null,
  "executedAt": null
}
```

### 2.2 Result Schema

```json
// results.jsonl - one JSON object per line
{
  "id": "result-uuid",
  "commandId": "cmd-uuid-here",
  "status": "success|failed",
  "output": "Command output here",
  "error": null,
  "executedAt": "2026-01-22T12:00:05Z",
  "device": "windows-laptop"
}
```

### 2.3 Clarification Loop

For destructive commands, the flow is:
1. GPT/Termux creates command with `status: "proposed"`
2. Windows Agent sees proposed, sends back question in results
3. User confirms via GPT/Termux, updates to `status: "confirmed"`
4. Windows Agent executes

---

## PHASE 3: FULL FEATURE SET (Ongoing)

### 3.1 Notes System (replaces Sticky Notes)

```powershell
# Note commands
note.add { text: "Quick thought here" }
note.search { query: "keyword" }
note.list { limit: 20 }
note.delete { id: "note-id" }
```

**Storage**: `notes.jsonl` - append-only, searchable

### 3.2 Reminders with Toast Notifications

```powershell
# Reminder commands
reminder.add { text: "Call mom", time: "2026-01-22T15:00:00" }
reminder.list {}
reminder.cancel { id: "reminder-id" }
```

**Execution**: Background scheduler checks reminders.jsonl every minute, triggers Windows toast.

### 3.3 Email Integration

**Outlook (Windows):**
```powershell
# Use Outlook COM object
$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "recipient@example.com"
$mail.Subject = "Subject"
$mail.Body = "Body"
$mail.Send()
```

**Gmail (Termux):** Use `termux-email` or Gmail API

### 3.4 Project Scaffolding

```powershell
# Scaffold locally
project.scaffold { name: "my-app", type: "nextjs-saas" }

# Create on GitHub
project.create { name: "my-app", private: true, scaffold: "nextjs-saas" }
```

---

## SECURITY CHECKLIST

- [ ] Bind agent to localhost only
- [ ] Expose via Cloudflare Tunnel with Access
- [ ] Use bearer token authentication
- [ ] Whitelist allowed commands only
- [ ] Require confirmation for destructive actions
- [ ] Log all commands and results
- [ ] Never expose secrets in results

---

## COMMAND REFERENCE

### System Commands
| Intent | Description | Requires Confirm |
|--------|-------------|------------------|
| `system.lock` | Lock workstation | No |
| `system.sleep` | Put to sleep | No |
| `system.restart` | Restart in 30s | Yes |
| `system.shutdown` | Shutdown in 30s | Yes |
| `system.cancelshutdown` | Cancel pending shutdown | No |

### Server Commands
| Intent | Description | Args |
|--------|-------------|------|
| `server.dev.start` | Start dev server | `{project: "name"}` |
| `server.dev.stop` | Stop all Node processes | - |
| `docker.start` | Start container | `{name: "container"}` |
| `docker.stop` | Stop container | `{name: "container"}` |
| `docker.status` | List running containers | - |

### Productivity Commands
| Intent | Description | Args |
|--------|-------------|------|
| `note.add` | Add quick note | `{text: "..."}` |
| `reminder.add` | Set reminder | `{text: "...", time: "ISO8601"}` |
| `notify.toast` | Show Windows notification | `{message: "..."}` |

### File Commands
| Intent | Description | Args |
|--------|-------------|------|
| `file.read` | Read file contents | `{path: "..."}` |
| `file.list` | List directory | `{path: "..."}` |

### Project Commands
| Intent | Description | Args |
|--------|-------------|------|
| `project.scaffold` | Create local project | `{name: "...", type: "..."}` |
| `github.create` | Create GitHub repo | `{name: "...", private: bool}` |

---

## VOICE COMMAND EXAMPLES (Tasker/AutoVoice)

| Voice | Intent |
|-------|--------|
| "Lock my computer" | `system.lock` |
| "Restart laptop" | `system.restart` (will ask to confirm) |
| "Start beltline server" | `server.dev.start {project: "beltlinegolf"}` |
| "Note: remember to..." | `note.add {text: "..."}` |
| "Remind me at 3pm to call John" | `reminder.add {text: "call John", time: "15:00"}` |
| "Create new project called X" | `project.scaffold {name: "X"}` |

---

## NEXT IMMEDIATE ACTIONS

1. **Run**: Create commands.jsonl, results.jsonl, notes.jsonl
2. **Run**: Start windows-gpt-control.ps1 listener
3. **Run**: `cloudflared tunnel run windows-solo`
4. **Test**: curl http://localhost:5002/status
5. **Test**: External access via windows.codewithsolo.com
6. **Commit**: Push all changes to GitHub
7. **Termux**: Pull and verify sync

---

**Created**: 2026-01-22  
**Status**: Ready for Phase 0 execution
