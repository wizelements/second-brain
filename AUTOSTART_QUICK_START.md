# Auto-Start Windows Brain Agent - Quick Start

## TL;DR: 3 Steps

1. **Open File Explorer** → Navigate to `C:\Users\jacla\Scripts\`
2. **Right-click** `Register-Brain-Autostart.bat` → **"Run as administrator"**
3. **Restart computer**, agent starts automatically 🎉

---

## What You Need

- ✓ Windows 10/11
- ✓ Admin access (for one-time setup)
- ✓ `windows-brain-agent-v4.ps1` script exists (already installed)

---

## Detailed Steps

### Step 1: Open the Registration Script

1. Press **Windows + E** to open File Explorer
2. Navigate to: `C:\Users\jacla\Scripts\`
3. Find file: `Register-Brain-Autostart.bat`

### Step 2: Run as Administrator

1. **Right-click** on `Register-Brain-Autostart.bat`
2. Select **"Run as administrator"**
3. Click **"Yes"** if prompted by User Account Control (UAC)

### Step 3: Wait for Completion

A command window will appear showing:
```
Registering Windows Brain Agent for auto-start...

TaskName              State
--------              -----
Windows Brain Agent   Enabled

Task registered successfully!

Next Steps:
  1. Restart your computer
  2. Agent will start automatically after login
  3. Verify in Brain UI - status should show "Online"
```

Press any key to close the window.

### Step 4: Verify & Reboot

**Before rebooting** (optional verification):
- Open **Task Scheduler**: Press `Win + R` → type `taskschd.msc` → press Enter
- Look for **"Windows Brain Agent"** in the task list
- Double-click it to verify settings

**Reboot your computer**:
```powershell
Restart-Computer -Force
```

Or use the Start menu: **Power** → **Restart**

### Step 5: Verify Agent is Running (After Boot)

After login, open Brain UI: `file:///C:/Users/jacla/.local/share/second-brain/index.html`

Check the **status indicator** at the top-left:
- ✅ **Green "Online"** = Success! Agent is running
- 🟡 **Yellow "Local Mode"** = Agent running, no tunnel
- 🔴 **Red "Offline"** = Agent not running (see troubleshooting)

---

## If Something Goes Wrong

### Agent Shows "Offline" After Reboot

**Option A: Check Task Scheduler**
1. Press `Win + R` → type `taskschd.msc` → press Enter
2. Find **"Windows Brain Agent"**
3. Right-click → **"Run"** to manually start it
4. Check status in Brain UI

**Option B: Check Agent Logs**
```powershell
Get-Content "C:\Users\jacla\.local\share\second-brain\agent.log" -Tail 20
```

**Option C: Restart Agent Manually**
```powershell
# Kill existing agent
Stop-Process -Name powershell -ErrorAction SilentlyContinue

# Start it manually
& "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1"
```

### Port 8080 Already in Use

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill it (replace XXXX with the PID shown)
taskkill /PID XXXX /F
```

---

## Undo Auto-Start

If you want to **disable** auto-start:

```powershell
# Option 1: Disable (keep task, but don't run)
Disable-ScheduledTask -TaskName "Windows Brain Agent"

# Option 2: Delete completely
Unregister-ScheduledTask -TaskName "Windows Brain Agent" -Confirm:$false
```

---

## What Happens Now

| When | What |
|------|------|
| **Next boot** | Task Scheduler runs Windows Brain Agent automatically |
| **After login** | Agent starts in hidden PowerShell window |
| **After ~3 sec** | Agent listens on `localhost:8080` |
| **After ~5 sec** | Cloudflare tunnel connects (if available) |
| **Result** | Brain UI shows "Online" status ✅ |

---

## Complete Documentation

For detailed info, see:
- `AUTOSTART_SETUP_GUIDE.md` - Full technical guide with troubleshooting
- `WINDOWS_AGENT_STATUS.md` - Agent status & startup issues
- `QUICK_START_AGENT.md` - UI agent controls guide

---

**Created:** January 2026  
**Status:** Ready to use
