# WINDOWS GPT DEPLOYMENT GUIDE
**Quick Setup for Full Control**  
**Time**: 15 minutes  
**Status**: Windows API Online ✓ | Listener Pending

---

## STEP 1: GET THE LISTENER CODE (Windows)

Copy entire PowerShell script from `WINDOWS_GPT_CONTROL.md` (the large PowerShell block under "DEPLOY WINDOWS LISTENER").

Save as: **`C:\Users\[YOUR-USERNAME]\windows-gpt-control.ps1`**

Example paths:
- `C:\Users\jacla\windows-gpt-control.ps1` ✓
- `C:\Users\Admin\windows-gpt-control.ps1` ✓

---

## STEP 2: RUN ON WINDOWS (As Administrator)

```powershell
# 1. Open PowerShell as Administrator
# (Right-click PowerShell → "Run as Administrator")

# 2. Allow scripts to run (one-time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# 3. Start the listener
powershell -NoExit -File C:\Users\[YOUR-USERNAME]\windows-gpt-control.ps1

# You should see:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✓ Windows GPT Control Listener v1.0.0
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
    -Argument "-NoExit -File C:\Users\[YOUR-USERNAME]\windows-gpt-control.ps1"

Register-ScheduledTask -TaskName "WindowsGPTControl" `
    -Trigger $trigger `
    -Action $action `
    -RunLevel Highest `
    -Force

Write-Host "✓ Task registered. Listener will start on boot."

# Verify it was created
Get-ScheduledTask -TaskName "WindowsGPTControl"

# To remove later:
# Unregister-ScheduledTask -TaskName "WindowsGPTControl" -Confirm:$false
```

---

## STEP 4: TEST FROM TERMUX

```bash
# In Termux on your Android phone

# Test 1: Can we reach Windows?
windows-gpt status

# Expected output:
# 🔌 Listener Status
# {
#   "status": "listening",
#   "port": 5002,
#   "timestamp": "2026-01-22T03:15:00Z"
# }

# Test 2: Check Windows brain status
windows-gpt brain-status

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
windows-gpt gpt

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
windows-gpt sync

# Expected output:
# 🔄 Syncing Windows brain from GitHub...
# {
#   "status": "synced",
#   "timestamp": "2026-01-22T03:16:00Z"
# }

# Verify
windows-gpt brain-status

# Should now show:
# "inbox_items": 34
```

---

## STEP 6: START GPT BRIDGE

```bash
# From Termux
windows-gpt server start

# Expected output:
# ▶️  Starting GPT Bridge...
# {
#   "status": "started",
#   "pid": 12345,
#   "port": 5000
# }

# Verify it's running
windows-gpt server status

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
windows-gpt check-all

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
windows-gpt status              # Listener alive?
windows-gpt brain-status        # How many items?
windows-gpt gpt                 # Divergences?
windows-gpt check-all           # Full check

# BRAIN OPERATIONS  
windows-gpt sync                # Pull latest from GitHub
windows-gpt inbox               # View all items
windows-gpt inbox 5             # View first 5
windows-gpt inbox-ids           # List all item IDs

# SERVER CONTROL
windows-gpt server start        # Boot GPT Bridge
windows-gpt server stop         # Shut down
windows-gpt server status       # Running?

# COMBINED
windows-gpt full-sync           # Sync brain + start server
monitor-gpt                     # One-time GPT check
monitor-gpt continuous          # Watch continuously
```

---

## MONITORING & MAINTENANCE

### Real-time GPT Monitor

```bash
# Watch divergences every 30 seconds
monitor-gpt continuous

# Custom interval
monitor-gpt continuous --interval 10

# One-time check
monitor-gpt
```

### If Items Diverge

```bash
# Get counts
windows-gpt brain-status        # Windows count
jq '[.[] | length]' ~/.local/share/second-brain/inbox.json  # Termux count

# If Windows is behind:
windows-gpt sync                # Pull from GitHub

# If Termux is behind:
cd ~/.local/share/second-brain && git pull origin master

# Verify aligned
monitor-gpt
```

### If Server Issues

```bash
# Check if running
windows-gpt server status

# Restart
windows-gpt server stop
sleep 2
windows-gpt server start

# Or force
# On Windows: Stop-Process -Name node -Force
# Then retry: windows-gpt server start
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
powershell -NoExit -File C:\Users\[user]\windows-gpt-control.ps1
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
netsh advfirewall firewall add rule name="GPTControl" `
    dir=in action=allow protocol=tcp localport=5002
```

### Issue: "GPT shows divergences"

```bash
# View specific divergences
windows-gpt gpt

# Sync Windows to fix
windows-gpt sync

# Verify
windows-gpt gpt
```

### Issue: "Server won't start"

```bash
# Check what's using port 5000
# On Windows:
netstat -ano | find ":5000"

# Kill if needed:
taskkill /PID [pid-number] /F

# Try again:
windows-gpt server start
```

### Issue: "Brain path missing"

```powershell
# On Windows, create directory
mkdir "$env:USERPROFILE\.agents\second-brain"

# Run listener again - should detect it
```

---

## WHAT YOU CAN DO NOW

✓ **Monitor**: `windows-gpt gpt` - Real-time divergence detection  
✓ **Sync**: `windows-gpt sync` - Pull latest items from GitHub  
✓ **Control**: `windows-gpt server start/stop` - Remote server control  
✓ **Inbox**: `windows-gpt inbox` - View all 34 items on Windows  
✓ **Diagnose**: `windows-gpt check-all` - Full system health check  

---

## FULL SETUP TIMELINE

| Step | Time | Task |
|------|------|------|
| 1 | 2 min | Copy PowerShell script to Windows |
| 2 | 2 min | Run listener on Windows |
| 3 | 2 min | Test from Termux with `windows-gpt status` |
| 4 | 3 min | Sync brain with `windows-gpt sync` |
| 5 | 2 min | Start server with `windows-gpt server start` |
| 6 | 2 min | Verify with `windows-gpt check-all` |
| **TOTAL** | **~15 min** | **Full bidirectional control active** |

---

## NEXT STEPS AFTER SETUP

1. **Monitor continuously**: `monitor-gpt continuous`
2. **Add to startup**: Register scheduled task (Step 3)
3. **Test workflow**: Add item on Termux → Watch it appear on Windows
4. **Test server control**: Stop server → Verify → Start server
5. **Verify alignment**: `monitor-gpt` shows 0 divergences

---

## DOCUMENTATION REFERENCE

| Doc | Purpose |
|-----|---------|
| **WINDOWS_GPT_CONTROL.md** | Full implementation details |
| **TERMUX_SECOND_BRAIN_SOURCE_OF_TRUTH.md** | Data structure & inventory |
| **WINDOWS_ALIGNMENT_CHECKLIST.md** | Sync verification steps |
| **WINDOWS_SERVER_CONTROL.md** | Server start/stop options |

---

## SUPPORT

**Quick Links**:
- Windows alive? → `windows-gpt status`
- Items synced? → `windows-gpt brain-status`
- Any divergences? → `windows-gpt gpt`
- Server running? → `windows-gpt server status`
- Full check → `windows-gpt check-all`

**If issues**:
1. Check connectivity: `windows-gpt status`
2. View error: Check Windows PowerShell window output
3. Reset: Stop listener + sync + restart
4. Ask: See WINDOWS_GPT_CONTROL.md troubleshooting

---

## STATUS

✓ **Windows API**: Online (2026-01-22 03:02Z)  
⏳ **Listener**: Ready to deploy (follow steps above)  
⏳ **Termux commands**: Ready to use (scripts in ~/bin/)  
⏳ **GPT monitoring**: Ready to activate  

**Time to activate**: 15 minutes (Windows setup only)

---

**Generated**: 2026-01-22T03:25:00Z  
**Authority**: Termux (Android)  
**Status**: Ready for deployment
