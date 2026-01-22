# WINDOWS G0T DEPLOYMENT GUIDE
**Quick Setup for Full Control**  
**Time**: 15 minutes  
**Status**: Windows API Online ✓ | Listener Pending

---

## STEP 1: GET THE LISTENER CODE (Windows)

Copy entire PowerShell script from `WINDOWS_G0T_CONTROL.md` (the large PowerShell block under "DEPLOY WINDOWS LISTENER").

Save as: **`C:\Users\[YOUR-USERNAME]\windows-g0t-control.ps1`**

Example paths:
- `C:\Users\jacla\windows-g0t-control.ps1` ✓
- `C:\Users\Admin\windows-g0t-control.ps1` ✓

---

## STEP 2: RUN ON WINDOWS (As Administrator)

```powershell
# 1. Open PowerShell as Administrator
# (Right-click PowerShell → "Run as Administrator")

# 2. Allow scripts to run (one-time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 3. Start the listener
powershell -NoExit -File C:\Users\[YOUR-USERNAME]\windows-g0t-control.ps1

# You should see:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✓ Windows G0T Control Listener v1.0.0
#   Port: 5002
#   Brain: C:\Users\[user]\.agents\second-brain
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Keep this window open** or set up auto-start (step 3).

---

## STEP 3: (OPTIONAL) AUTO-START ON BOOT

Run in PowerShell (As Administrator):

```powershell
# Create scheduled task to auto-start listener
$trigger = New-ScheduledTaskTrigger -AtStartup
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoExit -File C:\Users\[YOUR-USERNAME]\windows-g0t-control.ps1"

Register-ScheduledTask -TaskName "WindowsG0TControl" `
    -Trigger $trigger `
    -Action $action `
    -RunLevel Highest `
    -Force

Write-Host "✓ Task registered. Listener will start on boot."

# Verify it was created
Get-ScheduledTask -TaskName "WindowsG0TControl"

# To remove later:
# Unregister-ScheduledTask -TaskName "WindowsG0TControl" -Confirm:$false
```

---

## STEP 4: TEST FROM TERMUX

```bash
# In Termux on your Android phone

# Test 1: Can we reach Windows?
windows-g0t status

# Expected output:
# 🔌 Listener Status
# {
#   "status": "listening",
#   "port": 5002,
#   "timestamp": "2026-01-22T03:15:00Z"
# }

# Test 2: Check Windows brain status
windows-g0t brain-status

# Expected output:
# 🧠 Windows Brain Status
# {
#   "brain_path": "C:\\Users\\[user]\\.agents\\second-brain",
#   "inbox_file": "C:\\Users\\[user]\\.agents\\second-brain\\inbox.json",
#   "inbox_items": 0,
#   "last_modified": "2026-01-22T03:10:00Z",
#   "has_git": true
# }

# Test 3: Check for divergences (Gap of Truth)
windows-g0t g0t

# Expected output:
# ⚠️  Gap of Truth (Divergences)
# {
#   "gap_of_truth": [],
#   "has_divergence": false,
#   "timestamp": "2026-01-22T03:15:00Z"
# }
```

---

## STEP 5: SYNC WINDOWS BRAIN

First time setup - Windows needs to pull inbox.json from GitHub.

```bash
# From Termux
windows-g0t sync

# Expected output:
# 🔄 Syncing Windows brain from GitHub...
# {
#   "status": "synced",
#   "timestamp": "2026-01-22T03:16:00Z"
# }

# Verify
windows-g0t brain-status

# Should now show:
# "inbox_items": 34
```

---

## STEP 6: START GPT BRIDGE

```bash
# From Termux
windows-g0t server start

# Expected output:
# ▶️  Starting GPT Bridge...
# {
#   "status": "started",
#   "pid": 12345,
#   "port": 5000
# }

# Verify it's running
windows-g0t server status

# Should show:
# {
#   "status": "running",
#   "pid": 12345
# }
```

---

## STEP 7: VERIFY FULL SYSTEM

```bash
# Complete diagnostic
windows-g0t check-all

# Should show:
# ═══════════════════════════════════════
# FULL SYSTEM CHECK
# ═══════════════════════════════════════
#
# [1] Listener Status
# {"status": "listening", ...}
#
# [2] Brain Status
# {"inbox_items": 34, ...}
#
# [3] Gap of Truth
# ✓ No divergences
#
# [4] Server Status
# {"status": "running", "pid": 12345}
#
# [5] Termux Brain Status
# {"items": 34, ...}
#
# ═══════════════════════════════════════
# ✓ Check complete
```

---

## COMMANDS REFERENCE

### From Termux (after listener is running)

```bash
# STATUS
windows-g0t status              # Listener alive?
windows-g0t brain-status        # How many items?
windows-g0t g0t                 # Divergences?
windows-g0t check-all           # Full check

# BRAIN OPERATIONS  
windows-g0t sync                # Pull latest from GitHub
windows-g0t inbox               # View all items
windows-g0t inbox 5             # View first 5
windows-g0t inbox-ids           # List all item IDs

# SERVER CONTROL
windows-g0t server start        # Boot GPT Bridge
windows-g0t server stop         # Shut down
windows-g0t server status       # Running?

# COMBINED
windows-g0t full-sync           # Sync brain + start server
monitor-g0t                     # One-time G0T check
monitor-g0t continuous          # Watch continuously
```

---

## MONITORING & MAINTENANCE

### Real-time G0T Monitor

```bash
# Watch divergences every 30 seconds
monitor-g0t continuous

# Custom interval
monitor-g0t continuous --interval 10

# One-time check
monitor-g0t
```

### If Items Diverge

```bash
# Get counts
windows-g0t brain-status        # Windows count
jq '[.[] | length]' ~/.local/share/second-brain/inbox.json  # Termux count

# If Windows is behind:
windows-g0t sync                # Pull from GitHub

# If Termux is behind:
cd ~/.local/share/second-brain && git pull origin master

# Verify aligned
monitor-g0t
```

### If Server Issues

```bash
# Check if running
windows-g0t server status

# Restart
windows-g0t server stop
sleep 2
windows-g0t server start

# Or force
# On Windows: Stop-Process -Name node -Force
# Then retry: windows-g0t server start
```

---

## TROUBLESHOOTING

### Issue: "Connection refused" from Termux

**Check 1**: Is Windows listener running?
```powershell
# On Windows
Get-Process | ? Name -like "*powershell*"
# Should see listener process

# If not, start it:
powershell -NoExit -File C:\Users\[user]\windows-g0t-control.ps1
```

**Check 2**: Network connectivity
```bash
# On Termux
ping windows.local        # May not work (different networks)
curl -s http://windows.local:5002/status  # Try direct
```

**Check 3**: Firewall
```powershell
# On Windows
# Check if port 5002 is blocked
netsh advfirewall firewall show rule all | find "5002"

# If needed, add firewall rule:
netsh advfirewall firewall add rule name="G0TControl" `
    dir=in action=allow protocol=tcp localport=5002
```

### Issue: "G0T shows divergences"

```bash
# View specific divergences
windows-g0t g0t

# Sync Windows to fix
windows-g0t sync

# Verify
windows-g0t g0t
```

### Issue: "Server won't start"

```bash
# Check what's using port 5000
# On Windows:
netstat -ano | find ":5000"

# Kill if needed:
taskkill /PID [pid-number] /F

# Try again:
windows-g0t server start
```

### Issue: "Brain path missing"

```powershell
# On Windows, create directory
mkdir "$env:USERPROFILE\.agents\second-brain"

# Run listener again - should detect it
```

---

## WHAT YOU CAN DO NOW

✓ **Monitor**: `windows-g0t g0t` - Real-time divergence detection  
✓ **Sync**: `windows-g0t sync` - Pull latest items from GitHub  
✓ **Control**: `windows-g0t server start/stop` - Remote server control  
✓ **Inbox**: `windows-g0t inbox` - View all 34 items on Windows  
✓ **Diagnose**: `windows-g0t check-all` - Full system health check  

---

## FULL SETUP TIMELINE

| Step | Time | Task |
|------|------|------|
| 1 | 2 min | Copy PowerShell script to Windows |
| 2 | 2 min | Run listener on Windows |
| 3 | 2 min | Test from Termux with `windows-g0t status` |
| 4 | 3 min | Sync brain with `windows-g0t sync` |
| 5 | 2 min | Start server with `windows-g0t server start` |
| 6 | 2 min | Verify with `windows-g0t check-all` |
| **TOTAL** | **~15 min** | **Full bidirectional control active** |

---

## NEXT STEPS AFTER SETUP

1. **Monitor continuously**: `monitor-g0t continuous`
2. **Add to startup**: Register scheduled task (Step 3)
3. **Test workflow**: Add item on Termux → Watch it appear on Windows
4. **Test server control**: Stop server → Verify → Start server
5. **Verify alignment**: `monitor-g0t` shows 0 divergences

---

## DOCUMENTATION REFERENCE

| Doc | Purpose |
|-----|---------|
| **WINDOWS_G0T_CONTROL.md** | Full implementation details |
| **TERMUX_SECOND_BRAIN_SOURCE_OF_TRUTH.md** | Data structure & inventory |
| **WINDOWS_ALIGNMENT_CHECKLIST.md** | Sync verification steps |
| **WINDOWS_SERVER_CONTROL.md** | Server start/stop options |

---

## SUPPORT

**Quick Links**:
- Windows alive? → `windows-g0t status`
- Items synced? → `windows-g0t brain-status`
- Any divergences? → `windows-g0t g0t`
- Server running? → `windows-g0t server status`
- Full check → `windows-g0t check-all`

**If issues**:
1. Check connectivity: `windows-g0t status`
2. View error: Check Windows PowerShell window output
3. Reset: Stop listener + sync + restart
4. Ask: See WINDOWS_G0T_CONTROL.md troubleshooting

---

## STATUS

✓ **Windows API**: Online (2026-01-22 03:02Z)  
⏳ **Listener**: Ready to deploy (follow steps above)  
⏳ **Termux commands**: Ready to use (scripts in ~/bin/)  
⏳ **G0T monitoring**: Ready to activate  

**Time to activate**: 15 minutes (Windows setup only)

---

**Generated**: 2026-01-22T03:25:00Z  
**Authority**: Termux (Android)  
**Status**: Ready for deployment
