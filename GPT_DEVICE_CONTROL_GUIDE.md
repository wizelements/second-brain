# GPT Device Control Guide
**Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Purpose**: Control Termux/Android and Windows laptop via GPT using Second Brain

---

## Architecture Overview

```
                         ┌─────────────────┐
                         │      GPT        │
                         │  (ChatGPT/API)  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  TERMUX/ANDROID  │        │  WINDOWS LAPTOP  │
         │   Primary Hub    │◄──────►│  Secondary Node  │
         └──────────────────┘  sync  └──────────────────┘
                    │                           │
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  Second Brain    │        │  Second Brain    │
         │  (Source of      │───────►│  (Mirror)        │
         │   Truth)         │ GitHub │                  │
         └──────────────────┘        └──────────────────┘
```

---

## Current Capabilities Matrix

| Feature | Termux/Android | Windows | GPT Trigger |
|---------|----------------|---------|-------------|
| **Notes/Tasks** | ✅ `ba "text"` | ✅ via sync | ✅ Webhook |
| **Gigs** | ✅ `gig "..."` | ✅ via sync | ✅ Webhook |
| **Reminders** | ✅ `ba "Reminder:..."` | ⏳ Listener | ⏳ Pending |
| **Notifications** | ✅ `termux-notification` | ⏳ Toast | ⏳ Pending |
| **Alarms** | ✅ Termux:API | ⏳ Task Scheduler | ⏳ Pending |
| **Screenshots** | ✅ `termux-screenshot` | ⏳ PowerShell | ⏳ Pending |
| **Email** | ⏳ API needed | ⏳ Outlook/SMTP | ❌ Not impl |
| **File Ops** | ✅ Full | ✅ Full | ✅ Via brain |
| **Git Ops** | ✅ Full | ✅ Full | ✅ Via brain |
| **App Launch** | ✅ `am start` | ✅ `Start-Process` | ⏳ Pending |
| **Clipboard** | ✅ `termux-clipboard-*` | ✅ `Set-Clipboard` | ⏳ Pending |
| **TTS/Speech** | ✅ `termux-tts-speak` | ✅ SAPI | ⏳ Pending |

---

## PART 1: TERMUX/ANDROID CONTROL

### 1.1 Prerequisites

```bash
# Install Termux:API (from F-Droid)
pkg install termux-api

# Verify API works
termux-battery-status
termux-notification -t "Test" -c "GPT Control Ready"
```

### 1.2 GPT Webhook Endpoint (Termux)

Create webhook server that GPT can POST to:

```bash
cat > ~/bin/gpt-webhook-server << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# GPT Webhook Server for Termux
# Listens on port 5001 for GPT commands

PORT=${1:-5001}
FIFO=/tmp/gpt-webhook-fifo
LOG=~/.local/share/second-brain/gpt-webhook.log

cleanup() {
    rm -f "$FIFO"
    exit 0
}
trap cleanup EXIT INT TERM

rm -f "$FIFO"
mkfifo "$FIFO"

echo "$(date): GPT Webhook Server started on port $PORT" >> "$LOG"
echo "🤖 GPT Webhook Server listening on port $PORT"
echo "Endpoints:"
echo "  POST /notify     - Send notification"
echo "  POST /alarm      - Set alarm"
echo "  POST /reminder   - Create reminder"
echo "  POST /task       - Add task to brain"
echo "  POST /screenshot - Take screenshot"
echo "  POST /speak      - Text-to-speech"
echo "  POST /clipboard  - Set clipboard"
echo "  POST /vibrate    - Vibrate phone"
echo "  POST /torch      - Toggle flashlight"
echo "  GET  /status     - Device status"
echo ""

while true; do
    # Simple HTTP server using netcat
    cat "$FIFO" | nc -l -p "$PORT" > >(
        read -r REQUEST_LINE
        METHOD=$(echo "$REQUEST_LINE" | cut -d' ' -f1)
        PATH=$(echo "$REQUEST_LINE" | cut -d' ' -f2)
        
        # Read headers
        CONTENT_LENGTH=0
        while read -r HEADER; do
            HEADER=$(echo "$HEADER" | tr -d '\r')
            [ -z "$HEADER" ] && break
            if [[ "$HEADER" == Content-Length:* ]]; then
                CONTENT_LENGTH=$(echo "$HEADER" | cut -d' ' -f2)
            fi
        done
        
        # Read body
        BODY=""
        if [ "$CONTENT_LENGTH" -gt 0 ]; then
            BODY=$(head -c "$CONTENT_LENGTH")
        fi
        
        # Process request
        RESPONSE=""
        STATUS="200 OK"
        
        case "$PATH" in
            /status)
                BATTERY=$(termux-battery-status 2>/dev/null | jq -r '.percentage // "unknown"')
                WIFI=$(termux-wifi-connectioninfo 2>/dev/null | jq -r '.ssid // "disconnected"')
                RESPONSE=$(cat << EOJSON
{
    "status": "online",
    "device": "android",
    "battery": "$BATTERY",
    "wifi": "$WIFI",
    "timestamp": "$(date -Iseconds)"
}
EOJSON
)
                ;;
                
            /notify)
                TITLE=$(echo "$BODY" | jq -r '.title // "GPT Notification"')
                MESSAGE=$(echo "$BODY" | jq -r '.message // "No message"')
                PRIORITY=$(echo "$BODY" | jq -r '.priority // "default"')
                
                termux-notification \
                    -t "$TITLE" \
                    -c "$MESSAGE" \
                    --priority "$PRIORITY" \
                    --id "gpt-notify"
                
                echo "$(date): NOTIFY - $TITLE: $MESSAGE" >> "$LOG"
                RESPONSE='{"status":"sent","type":"notification"}'
                ;;
                
            /alarm)
                TIME=$(echo "$BODY" | jq -r '.time // ""')
                MESSAGE=$(echo "$BODY" | jq -r '.message // "GPT Alarm"')
                
                if [ -n "$TIME" ]; then
                    # Use at command or termux-job-scheduler
                    echo "termux-notification -t 'ALARM' -c '$MESSAGE' --priority high --vibrate 1000,500,1000" | at "$TIME" 2>/dev/null
                    RESPONSE='{"status":"scheduled","time":"'"$TIME"'"}'
                else
                    STATUS="400 Bad Request"
                    RESPONSE='{"error":"time required"}'
                fi
                
                echo "$(date): ALARM - $TIME: $MESSAGE" >> "$LOG"
                ;;
                
            /reminder)
                TEXT=$(echo "$BODY" | jq -r '.text // ""')
                WHEN=$(echo "$BODY" | jq -r '.when // "now"')
                
                # Add to Second Brain
                ~/bin/brain-add "Reminder: $TEXT (at $WHEN)"
                
                # Also set notification
                termux-notification \
                    -t "Reminder Set" \
                    -c "$TEXT at $WHEN" \
                    --id "gpt-reminder"
                
                echo "$(date): REMINDER - $TEXT at $WHEN" >> "$LOG"
                RESPONSE='{"status":"created","type":"reminder"}'
                ;;
                
            /task)
                TEXT=$(echo "$BODY" | jq -r '.text // ""')
                PRIORITY=$(echo "$BODY" | jq -r '.priority // "normal"')
                
                ~/bin/brain-add "$TEXT" --priority "$PRIORITY"
                
                echo "$(date): TASK - $TEXT" >> "$LOG"
                RESPONSE='{"status":"added","type":"task"}'
                ;;
                
            /screenshot)
                FILENAME="screenshot-$(date +%Y%m%d-%H%M%S).png"
                FILEPATH="$HOME/storage/pictures/$FILENAME"
                
                termux-screenshot "$FILEPATH" 2>/dev/null
                
                if [ -f "$FILEPATH" ]; then
                    echo "$(date): SCREENSHOT - $FILEPATH" >> "$LOG"
                    RESPONSE='{"status":"captured","path":"'"$FILEPATH"'"}'
                else
                    STATUS="500 Internal Server Error"
                    RESPONSE='{"error":"screenshot failed"}'
                fi
                ;;
                
            /speak)
                TEXT=$(echo "$BODY" | jq -r '.text // ""')
                RATE=$(echo "$BODY" | jq -r '.rate // "1.0"')
                
                termux-tts-speak -r "$RATE" "$TEXT" &
                
                echo "$(date): SPEAK - $TEXT" >> "$LOG"
                RESPONSE='{"status":"speaking"}'
                ;;
                
            /clipboard)
                TEXT=$(echo "$BODY" | jq -r '.text // ""')
                echo -n "$TEXT" | termux-clipboard-set
                
                echo "$(date): CLIPBOARD - set" >> "$LOG"
                RESPONSE='{"status":"set"}'
                ;;
                
            /vibrate)
                DURATION=$(echo "$BODY" | jq -r '.duration // 500')
                termux-vibrate -d "$DURATION"
                
                RESPONSE='{"status":"vibrated"}'
                ;;
                
            /torch)
                STATE=$(echo "$BODY" | jq -r '.state // "toggle"')
                if [ "$STATE" = "on" ]; then
                    termux-torch on
                elif [ "$STATE" = "off" ]; then
                    termux-torch off
                else
                    # Toggle
                    termux-torch on && sleep 0.5 && termux-torch off
                fi
                
                RESPONSE='{"status":"toggled"}'
                ;;
                
            *)
                STATUS="404 Not Found"
                RESPONSE='{"error":"endpoint not found"}'
                ;;
        esac
        
        # Send response
        CONTENT_LENGTH=${#RESPONSE}
        cat << EOHTTP > "$FIFO"
HTTP/1.1 $STATUS
Content-Type: application/json
Content-Length: $CONTENT_LENGTH
Access-Control-Allow-Origin: *
Connection: close

$RESPONSE
EOHTTP
    )
done
EOF
chmod +x ~/bin/gpt-webhook-server
```

### 1.3 Start Termux Webhook Server

```bash
# Start server (background with nohup)
nohup ~/bin/gpt-webhook-server 5001 &

# Or use termux-services
mkdir -p ~/.termux/boot
echo '#!/data/data/com.termux/files/usr/bin/bash
~/bin/gpt-webhook-server 5001 &' > ~/.termux/boot/gpt-webhook
chmod +x ~/.termux/boot/gpt-webhook
```

### 1.4 Expose to Internet (for GPT access)

```bash
# Option 1: Cloudflare Tunnel (recommended)
cloudflared tunnel --url http://localhost:5001

# Option 2: ngrok
ngrok http 5001

# Option 3: Tailscale (if both devices on same tailnet)
# Already accessible via tailscale IP
```

### 1.5 GPT Custom Action Spec (Termux)

```yaml
openapi: 3.0.0
info:
  title: Termux Device Control API
  version: 1.0.0
  description: Control Android device via Termux
servers:
  - url: https://your-tunnel-url.trycloudflare.com
paths:
  /status:
    get:
      operationId: getDeviceStatus
      summary: Get device status (battery, wifi, etc)
      responses:
        '200':
          description: Device status
          
  /notify:
    post:
      operationId: sendNotification
      summary: Send push notification to device
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                message:
                  type: string
                priority:
                  type: string
                  enum: [low, default, high, max]
                  
  /alarm:
    post:
      operationId: setAlarm
      summary: Set an alarm
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [time]
              properties:
                time:
                  type: string
                  description: Time in HH:MM format or "now + 5 minutes"
                message:
                  type: string
                  
  /reminder:
    post:
      operationId: createReminder
      summary: Create a reminder in Second Brain
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                when:
                  type: string
                  
  /task:
    post:
      operationId: addTask
      summary: Add task to Second Brain
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                priority:
                  type: string
                  enum: [low, normal, high, urgent]
                  
  /screenshot:
    post:
      operationId: takeScreenshot
      summary: Capture device screenshot
      responses:
        '200':
          description: Screenshot captured
          
  /speak:
    post:
      operationId: textToSpeech
      summary: Speak text aloud
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                rate:
                  type: number
                  
  /clipboard:
    post:
      operationId: setClipboard
      summary: Set device clipboard
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                  
  /vibrate:
    post:
      operationId: vibrateDevice
      summary: Vibrate the device
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                duration:
                  type: integer
                  default: 500
                  
  /torch:
    post:
      operationId: toggleTorch
      summary: Control flashlight
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                state:
                  type: string
                  enum: [on, off, toggle]
```

---

## PART 2: WINDOWS LAPTOP CONTROL

### 2.1 Prerequisites

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install required modules
Install-Module -Name BurntToast -Force  # For toast notifications

# Create directories
New-Item -ItemType Directory -Path "$env:USERPROFILE\.agents\second-brain" -Force
New-Item -ItemType Directory -Path "$env:USERPROFILE\Screenshots" -Force
```

### 2.2 Windows Control Listener

Save as `C:\Users\[user]\gpt-windows-control.ps1`:

```powershell
# GPT Windows Control Server
# Comprehensive device control via HTTP API

param(
    [int]$Port = 5002,
    [string]$BrainPath = "$env:USERPROFILE\.agents\second-brain"
)

# Load modules
Import-Module BurntToast -ErrorAction SilentlyContinue

# Initialize
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Run as Administrator or use netsh to allow port"
    Write-Host "netsh http add urlacl url=http://+:$Port/ user=$env:USERNAME"
    exit 1
}

$logFile = Join-Path $BrainPath "gpt-control.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp : $Message" | Add-Content $logFile
}

Write-Host "============================================="
Write-Host "  GPT Windows Control Server v1.0.0"
Write-Host "  Port: $Port"
Write-Host "  Brain: $BrainPath"
Write-Host "============================================="
Write-Host ""
Write-Host "Endpoints:"
Write-Host "  GET  /status        - System status"
Write-Host "  POST /notify        - Toast notification"
Write-Host "  POST /alarm         - Schedule alarm"
Write-Host "  POST /reminder      - Create reminder"
Write-Host "  POST /task          - Add to brain"
Write-Host "  POST /screenshot    - Capture screen"
Write-Host "  POST /speak         - Text-to-speech"
Write-Host "  POST /clipboard     - Set clipboard"
Write-Host "  POST /email         - Send email (Outlook)"
Write-Host "  POST /app/launch    - Launch application"
Write-Host "  POST /app/close     - Close application"
Write-Host "  POST /file/open     - Open file"
Write-Host "  POST /url/open      - Open URL in browser"
Write-Host "  POST /volume        - Set volume"
Write-Host "  POST /lock          - Lock workstation"
Write-Host "  POST /sleep         - Sleep computer"
Write-Host "  GET  /brain/inbox   - Get inbox items"
Write-Host "  POST /brain/sync    - Sync from GitHub"
Write-Host ""

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    $method = $request.HttpMethod
    
    # Read body
    $body = ""
    if ($request.HasEntityBody) {
        $reader = New-Object System.IO.StreamReader($request.InputStream)
        $body = $reader.ReadToEnd()
        $reader.Close()
    }
    
    $json = @{}
    if ($body) {
        try { $json = $body | ConvertFrom-Json } catch {}
    }
    
    $statusCode = 200
    $result = @{ status = "ok" }
    
    try {
        switch -Regex ($path) {
            
            # ========== STATUS ==========
            "^/status$" {
                $battery = Get-WmiObject Win32_Battery
                $cpu = (Get-WmiObject Win32_Processor).LoadPercentage
                $mem = Get-WmiObject Win32_OperatingSystem
                $memUsed = [math]::Round(($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory) / 1MB, 2)
                
                $result = @{
                    status = "online"
                    device = "windows"
                    hostname = $env:COMPUTERNAME
                    user = $env:USERNAME
                    battery = if ($battery) { $battery.EstimatedChargeRemaining } else { "N/A" }
                    cpu_percent = $cpu
                    memory_used_gb = $memUsed
                    timestamp = (Get-Date).ToUniversalTime().ToString("o")
                }
            }
            
            # ========== NOTIFY ==========
            "^/notify$" {
                $title = $json.title ?? "GPT Notification"
                $message = $json.message ?? "No message"
                
                # BurntToast notification
                New-BurntToastNotification -Text $title, $message -ErrorAction SilentlyContinue
                
                # Fallback to balloon
                if (-not $?) {
                    Add-Type -AssemblyName System.Windows.Forms
                    $notify = New-Object System.Windows.Forms.NotifyIcon
                    $notify.Icon = [System.Drawing.SystemIcons]::Information
                    $notify.Visible = $true
                    $notify.ShowBalloonTip(5000, $title, $message, [System.Windows.Forms.ToolTipIcon]::Info)
                }
                
                Write-Log "NOTIFY: $title - $message"
                $result = @{ status = "sent"; type = "notification" }
            }
            
            # ========== ALARM ==========
            "^/alarm$" {
                $time = $json.time
                $message = $json.message ?? "GPT Alarm"
                
                if ($time) {
                    # Schedule task
                    $taskName = "GPTAlarm_$(Get-Random)"
                    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument @"
-Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('$message', 'ALARM', 'OK', 'Warning'); [console]::beep(1000,1000)"
"@
                    $trigger = New-ScheduledTaskTrigger -Once -At $time
                    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Force | Out-Null
                    
                    Write-Log "ALARM: $time - $message"
                    $result = @{ status = "scheduled"; time = $time; task = $taskName }
                } else {
                    $statusCode = 400
                    $result = @{ error = "time required" }
                }
            }
            
            # ========== REMINDER ==========
            "^/reminder$" {
                $text = $json.text
                $when = $json.when ?? "soon"
                
                # Add to brain inbox
                $inboxFile = Join-Path $BrainPath "inbox.json"
                $inbox = @()
                if (Test-Path $inboxFile) {
                    $inbox = Get-Content $inboxFile | ConvertFrom-Json
                }
                
                $item = @{
                    id = [guid]::NewGuid().ToString().Substring(0,8)
                    text = "Reminder: $text (at $when)"
                    category = "reminder"
                    status = "inbox"
                    created = (Get-Date).ToUniversalTime().ToString("o")
                    source = "gpt-windows"
                }
                
                $inbox += $item
                $inbox | ConvertTo-Json -Depth 10 | Set-Content $inboxFile
                
                # Also show notification
                New-BurntToastNotification -Text "Reminder Set", "$text at $when" -ErrorAction SilentlyContinue
                
                Write-Log "REMINDER: $text at $when"
                $result = @{ status = "created"; id = $item.id }
            }
            
            # ========== TASK ==========
            "^/task$" {
                $text = $json.text
                $priority = $json.priority ?? "normal"
                
                $inboxFile = Join-Path $BrainPath "inbox.json"
                $inbox = @()
                if (Test-Path $inboxFile) {
                    $inbox = Get-Content $inboxFile | ConvertFrom-Json
                }
                
                $item = @{
                    id = [guid]::NewGuid().ToString().Substring(0,8)
                    text = $text
                    category = "task"
                    priority = $priority
                    status = "inbox"
                    created = (Get-Date).ToUniversalTime().ToString("o")
                    source = "gpt-windows"
                }
                
                $inbox += $item
                $inbox | ConvertTo-Json -Depth 10 | Set-Content $inboxFile
                
                Write-Log "TASK: $text (priority: $priority)"
                $result = @{ status = "added"; id = $item.id }
            }
            
            # ========== SCREENSHOT ==========
            "^/screenshot$" {
                Add-Type -AssemblyName System.Windows.Forms
                
                $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
                $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
                $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
                
                $filename = "screenshot-$(Get-Date -Format 'yyyyMMdd-HHmmss').png"
                $filepath = Join-Path "$env:USERPROFILE\Screenshots" $filename
                $bitmap.Save($filepath)
                
                $graphics.Dispose()
                $bitmap.Dispose()
                
                Write-Log "SCREENSHOT: $filepath"
                $result = @{ status = "captured"; path = $filepath }
            }
            
            # ========== SPEAK ==========
            "^/speak$" {
                $text = $json.text
                $rate = $json.rate ?? 0
                
                Add-Type -AssemblyName System.Speech
                $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
                $synth.Rate = $rate
                $synth.SpeakAsync($text)
                
                Write-Log "SPEAK: $text"
                $result = @{ status = "speaking" }
            }
            
            # ========== CLIPBOARD ==========
            "^/clipboard$" {
                $text = $json.text
                Set-Clipboard -Value $text
                
                Write-Log "CLIPBOARD: set"
                $result = @{ status = "set" }
            }
            
            # ========== EMAIL (Outlook) ==========
            "^/email$" {
                $to = $json.to
                $subject = $json.subject ?? "Message from GPT"
                $body = $json.body ?? ""
                $send = $json.send ?? $false
                
                try {
                    $outlook = New-Object -ComObject Outlook.Application
                    $mail = $outlook.CreateItem(0)
                    $mail.To = $to
                    $mail.Subject = $subject
                    $mail.Body = $body
                    
                    if ($send) {
                        $mail.Send()
                        $result = @{ status = "sent" }
                    } else {
                        $mail.Display()
                        $result = @{ status = "drafted" }
                    }
                    
                    Write-Log "EMAIL: to=$to subject=$subject"
                } catch {
                    $statusCode = 500
                    $result = @{ error = "Outlook not available" }
                }
            }
            
            # ========== APP LAUNCH ==========
            "^/app/launch$" {
                $app = $json.app
                $args = $json.arguments ?? ""
                
                if ($app) {
                    Start-Process $app -ArgumentList $args -ErrorAction Stop
                    Write-Log "LAUNCH: $app $args"
                    $result = @{ status = "launched"; app = $app }
                } else {
                    $statusCode = 400
                    $result = @{ error = "app required" }
                }
            }
            
            # ========== APP CLOSE ==========
            "^/app/close$" {
                $app = $json.app
                
                if ($app) {
                    Stop-Process -Name $app -Force -ErrorAction SilentlyContinue
                    Write-Log "CLOSE: $app"
                    $result = @{ status = "closed"; app = $app }
                } else {
                    $statusCode = 400
                    $result = @{ error = "app required" }
                }
            }
            
            # ========== FILE OPEN ==========
            "^/file/open$" {
                $path = $json.path
                
                if ($path -and (Test-Path $path)) {
                    Start-Process $path
                    Write-Log "FILE OPEN: $path"
                    $result = @{ status = "opened"; path = $path }
                } else {
                    $statusCode = 404
                    $result = @{ error = "file not found" }
                }
            }
            
            # ========== URL OPEN ==========
            "^/url/open$" {
                $url = $json.url
                
                if ($url) {
                    Start-Process $url
                    Write-Log "URL OPEN: $url"
                    $result = @{ status = "opened"; url = $url }
                } else {
                    $statusCode = 400
                    $result = @{ error = "url required" }
                }
            }
            
            # ========== VOLUME ==========
            "^/volume$" {
                $level = $json.level
                $mute = $json.mute
                
                Add-Type -TypeDefinition @"
using System.Runtime.InteropServices;
public class Audio {
    [DllImport("user32.dll")] public static extern IntPtr SendMessageW(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);
}
"@
                
                # This is simplified - full implementation needs NAudio or similar
                if ($null -ne $mute) {
                    # Toggle mute
                    $result = @{ status = "mute toggled" }
                } elseif ($null -ne $level) {
                    $result = @{ status = "volume set"; level = $level }
                }
                
                Write-Log "VOLUME: level=$level mute=$mute"
            }
            
            # ========== LOCK ==========
            "^/lock$" {
                rundll32.exe user32.dll,LockWorkStation
                Write-Log "LOCK: workstation locked"
                $result = @{ status = "locked" }
            }
            
            # ========== SLEEP ==========
            "^/sleep$" {
                Add-Type -AssemblyName System.Windows.Forms
                [System.Windows.Forms.Application]::SetSuspendState("Suspend", $false, $false)
                Write-Log "SLEEP: computer sleeping"
                $result = @{ status = "sleeping" }
            }
            
            # ========== BRAIN INBOX ==========
            "^/brain/inbox$" {
                $inboxFile = Join-Path $BrainPath "inbox.json"
                if (Test-Path $inboxFile) {
                    $result = Get-Content $inboxFile | ConvertFrom-Json
                } else {
                    $result = @()
                }
            }
            
            # ========== BRAIN SYNC ==========
            "^/brain/sync$" {
                try {
                    Push-Location $BrainPath
                    git fetch origin master 2>&1 | Out-Null
                    git reset --hard origin/master 2>&1 | Out-Null
                    Pop-Location
                    
                    Write-Log "SYNC: pulled from GitHub"
                    $result = @{ status = "synced" }
                } catch {
                    $statusCode = 500
                    $result = @{ error = $_.Exception.Message }
                }
            }
            
            default {
                $statusCode = 404
                $result = @{ error = "endpoint not found" }
            }
        }
    } catch {
        $statusCode = 500
        $result = @{ error = $_.Exception.Message }
        Write-Log "ERROR: $_"
    }
    
    # Send response
    $responseBody = $result | ConvertTo-Json -Depth 10
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseBody)
    
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json"
    $response.ContentLength64 = $buffer.Length
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
}
```

### 2.3 Start Windows Server

```powershell
# Run as Administrator
powershell -NoExit -File C:\Users\[user]\gpt-windows-control.ps1

# Add to startup
$trigger = New-ScheduledTaskTrigger -AtStartup
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -File C:\Users\$env:USERNAME\gpt-windows-control.ps1"
Register-ScheduledTask -TaskName "GPTWindowsControl" -Trigger $trigger -Action $action -RunLevel Highest
```

### 2.4 Expose to Internet

```powershell
# Option 1: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5002

# Option 2: ngrok
ngrok http 5002
```

### 2.5 GPT Custom Action Spec (Windows)

```yaml
openapi: 3.0.0
info:
  title: Windows Device Control API
  version: 1.0.0
servers:
  - url: https://your-windows-tunnel.trycloudflare.com
paths:
  /status:
    get:
      operationId: getWindowsStatus
      summary: Get Windows system status
      
  /notify:
    post:
      operationId: sendWindowsNotification
      summary: Show Windows toast notification
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title: { type: string }
                message: { type: string }
                
  /alarm:
    post:
      operationId: setWindowsAlarm
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [time]
              properties:
                time: { type: string, description: "DateTime like '2026-01-22 15:30'" }
                message: { type: string }
                
  /reminder:
    post:
      operationId: createWindowsReminder
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
                when: { type: string }
                
  /task:
    post:
      operationId: addWindowsTask
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
                priority: { type: string, enum: [low, normal, high, urgent] }
                
  /screenshot:
    post:
      operationId: captureWindowsScreen
      
  /speak:
    post:
      operationId: windowsTextToSpeech
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
                rate: { type: integer, minimum: -10, maximum: 10 }
                
  /clipboard:
    post:
      operationId: setWindowsClipboard
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
                
  /email:
    post:
      operationId: sendOutlookEmail
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [to]
              properties:
                to: { type: string }
                subject: { type: string }
                body: { type: string }
                send: { type: boolean, default: false }
                
  /app/launch:
    post:
      operationId: launchWindowsApp
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [app]
              properties:
                app: { type: string, description: "App name or full path" }
                arguments: { type: string }
                
  /app/close:
    post:
      operationId: closeWindowsApp
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [app]
              properties:
                app: { type: string }
                
  /file/open:
    post:
      operationId: openWindowsFile
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [path]
              properties:
                path: { type: string }
                
  /url/open:
    post:
      operationId: openWindowsUrl
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [url]
              properties:
                url: { type: string }
                
  /lock:
    post:
      operationId: lockWindows
      
  /sleep:
    post:
      operationId: sleepWindows
      
  /brain/inbox:
    get:
      operationId: getWindowsBrainInbox
      
  /brain/sync:
    post:
      operationId: syncWindowsBrain
```

---

## PART 3: GPT CONFIGURATION

### 3.1 Create GPT Custom Actions

1. Go to ChatGPT → Explore GPTs → Create
2. Add two Actions (one for each device)
3. Paste the OpenAPI specs from above
4. Set Authentication to "None" (or API Key if you add auth)

### 3.2 GPT System Instructions

Add to your GPT's instructions:

```markdown
## Device Control Capabilities

You can control the user's devices via API:

### Termux/Android (Primary)
- Endpoint: https://[termux-tunnel-url]
- Send notifications, alarms, reminders
- Take screenshots, speak text
- Set clipboard, vibrate, toggle torch
- Add tasks to Second Brain

### Windows Laptop (Secondary)
- Endpoint: https://[windows-tunnel-url]
- Toast notifications, scheduled alarms
- Take screenshots, text-to-speech
- Send emails via Outlook
- Launch/close applications
- Open files and URLs
- Lock or sleep computer
- Manage Second Brain tasks

### Best Practices
1. Always confirm destructive actions (lock, sleep, close apps)
2. Use notifications for quick alerts
3. Use reminders for time-sensitive items
4. Add tasks to brain for follow-up items
5. Sync brain after adding items on Windows

### Example Commands
- "Remind me in 10 minutes to call mom" → POST /reminder
- "Take a screenshot on my laptop" → POST /screenshot (Windows)
- "Read this to me" → POST /speak
- "Send an email to john@example.com about the meeting" → POST /email
- "Open VS Code" → POST /app/launch {app: "code"}
- "Lock my laptop" → POST /lock
```

### 3.3 Unified Control Command

For GPT to control both devices with one request:

```markdown
## Multi-Device Commands

When user says "everywhere" or "both devices":
1. Send to Termux endpoint first
2. Send to Windows endpoint second
3. Report combined results

Example: "Notify me everywhere that the build is done"
→ POST /notify to Termux
→ POST /notify to Windows
→ "Sent notification to both your phone and laptop"
```

---

## PART 4: SECURITY BEST PRACTICES

### 4.1 Add API Authentication

**Termux - Add to webhook server:**

```bash
# Check for API key in header
API_KEY="your-secret-key-here"
AUTH_HEADER=$(echo "$HEADERS" | grep -i "X-API-Key:" | cut -d' ' -f2)

if [ "$AUTH_HEADER" != "$API_KEY" ]; then
    echo "HTTP/1.1 401 Unauthorized\r\n\r\n{\"error\":\"unauthorized\"}" > "$FIFO"
    continue
fi
```

**Windows - Add to PowerShell:**

```powershell
$ApiKey = "your-secret-key-here"

# Check auth header
$authHeader = $request.Headers["X-API-Key"]
if ($authHeader -ne $ApiKey) {
    $response.StatusCode = 401
    $buffer = [System.Text.Encoding]::UTF8.GetBytes('{"error":"unauthorized"}')
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
    continue
}
```

**GPT Action Auth:**
- Set Authentication Type: "API Key"
- Auth Type: Custom Header
- Header Name: X-API-Key
- Value: your-secret-key-here

### 4.2 Rate Limiting

```powershell
# Windows - Simple rate limiter
$rateLimiter = @{}
$rateLimit = 60  # requests per minute

$clientIP = $request.RemoteEndPoint.Address.ToString()
$now = Get-Date

if ($rateLimiter[$clientIP]) {
    $requests = @($rateLimiter[$clientIP] | Where-Object { $_ -gt $now.AddMinutes(-1) })
    if ($requests.Count -ge $rateLimit) {
        $response.StatusCode = 429
        # Return rate limit error
    }
    $rateLimiter[$clientIP] = $requests + @($now)
} else {
    $rateLimiter[$clientIP] = @($now)
}
```

### 4.3 Allowed Actions Whitelist

```powershell
# Only allow specific actions
$allowedPaths = @(
    "/status",
    "/notify",
    "/reminder",
    "/task",
    "/speak",
    "/clipboard"
)

# Dangerous actions require confirmation
$dangerousPaths = @(
    "/lock",
    "/sleep",
    "/app/close",
    "/email"
)

if ($path -in $dangerousPaths) {
    # Require additional confirmation header
    if ($request.Headers["X-Confirm"] -ne "yes") {
        $statusCode = 403
        $result = @{ error = "confirmation required"; header = "X-Confirm: yes" }
    }
}
```

---

## PART 5: QUICK REFERENCE

### Termux Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Device status |
| `/notify` | POST | Push notification |
| `/alarm` | POST | Set alarm |
| `/reminder` | POST | Create reminder |
| `/task` | POST | Add brain task |
| `/screenshot` | POST | Capture screen |
| `/speak` | POST | Text-to-speech |
| `/clipboard` | POST | Set clipboard |
| `/vibrate` | POST | Vibrate device |
| `/torch` | POST | Toggle flashlight |

### Windows Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | System status |
| `/notify` | POST | Toast notification |
| `/alarm` | POST | Schedule alarm |
| `/reminder` | POST | Create reminder |
| `/task` | POST | Add brain task |
| `/screenshot` | POST | Capture screen |
| `/speak` | POST | Text-to-speech |
| `/clipboard` | POST | Set clipboard |
| `/email` | POST | Send via Outlook |
| `/app/launch` | POST | Launch app |
| `/app/close` | POST | Close app |
| `/file/open` | POST | Open file |
| `/url/open` | POST | Open URL |
| `/lock` | POST | Lock workstation |
| `/sleep` | POST | Sleep computer |
| `/brain/inbox` | GET | Get brain items |
| `/brain/sync` | POST | Sync from GitHub |

---

## PART 6: TROUBLESHOOTING

### Connection Issues

```bash
# Test Termux endpoint
curl -X GET http://localhost:5001/status

# Test Windows endpoint (from Termux)
curl -X GET http://windows.local:5002/status
```

### Tunnel Not Working

```bash
# Restart cloudflared
pkill cloudflared
cloudflared tunnel --url http://localhost:5001

# Check if port is in use
lsof -i :5001
netstat -tlnp | grep 5001
```

### Permissions (Android)

```bash
# Grant Termux:API permissions
termux-setup-storage
# Then allow all permissions in Android Settings → Apps → Termux:API
```

### Permissions (Windows)

```powershell
# Allow port binding
netsh http add urlacl url=http://+:5002/ user=$env:USERNAME

# Firewall rule
New-NetFirewallRule -Name "GPT Control" -DisplayName "GPT Control API" -Direction Inbound -Port 5002 -Protocol TCP -Action Allow
```

---

## DEPLOYMENT CHECKLIST

### Termux
- [ ] Install termux-api package
- [ ] Grant Termux:API all permissions
- [ ] Create ~/bin/gpt-webhook-server
- [ ] Start server: `nohup ~/bin/gpt-webhook-server 5001 &`
- [ ] Test: `curl localhost:5001/status`
- [ ] Setup tunnel: `cloudflared tunnel --url http://localhost:5001`
- [ ] Note tunnel URL for GPT

### Windows
- [ ] Install BurntToast module
- [ ] Create gpt-windows-control.ps1
- [ ] Run as Administrator
- [ ] Test: `curl localhost:5002/status`
- [ ] Setup tunnel: `cloudflared tunnel --url http://localhost:5002`
- [ ] Note tunnel URL for GPT
- [ ] Optional: Add to Task Scheduler

### GPT
- [ ] Create new GPT or edit existing
- [ ] Add Termux Action with OpenAPI spec
- [ ] Add Windows Action with OpenAPI spec
- [ ] Add system instructions
- [ ] Test each endpoint type
- [ ] Enable API key auth (optional)

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Author**: Generated by Amp AI
