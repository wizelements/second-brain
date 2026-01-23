# Windows Brain Agent Auto-Start Setup Guide

## Overview

By default, the Windows Brain Agent requires **manual startup** each time your computer boots. This guide enables **automatic startup** using Windows Task Scheduler, so the agent starts hidden in the background whenever you log in.

**Benefits:**
- Agent available immediately on boot
- Termux commands work automatically without manual startup
- No visible PowerShell window (runs hidden)
- Brain data stays synced via GitHub

**Requirements:**
- Windows 10/11
- Admin privileges (one-time setup only)
- PowerShell execution policy allows running scripts

---

## Quick Setup (Copy-Paste)

**Option 1: Run as Administrator in PowerShell**

1. Right-click **PowerShell** → Select **Run as administrator**
2. Paste this command and press Enter:

```powershell
$taskName = "Windows Brain Agent"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-NoProfile -WindowStyle Hidden -File "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1"'
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Force
```

3. You'll see success output like:
```
TaskPath                                       TaskName
--------                                       --------
\                                              Windows Brain Agent
```

**Option 2: Use the Setup Script**

Run this from PowerShell (Admin):
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/setup-autostart.ps1" -OutFile "$env:TEMP\setup.ps1"; & "$env:TEMP\setup.ps1"
```

---

## What This Does

| Component | Details |
|-----------|---------|
| **Task Name** | `Windows Brain Agent` |
| **Trigger** | Runs at Windows startup (after user login) |
| **Action** | Executes `windows-brain-agent-v4.ps1` |
| **Window Style** | Hidden (no PowerShell window visible) |
| **Startup Time** | ~3-5 seconds after login completes |
| **Port** | Listens on `localhost:8080` |
| **Tunnel** | Exposed via Cloudflare at `https://windows.codewithsolo.com` |

---

## Verification: Task Was Created Successfully

### Method 1: Check Task Scheduler (GUI)

1. Press **Win + R** → type `taskschd.msc` → press Enter
2. Task Scheduler opens
3. Look for **"Windows Brain Agent"** in the task list
4. Double-click it to view properties:
   - **Trigger**: Should say "At startup"
   - **Action**: Should show path to `windows-brain-agent-v4.ps1`
   - **Status**: Should be "Enabled"

### Method 2: Check with PowerShell

Run this command (no admin needed):
```powershell
Get-ScheduledTask -TaskName "Windows Brain Agent" -ErrorAction SilentlyContinue | Select-Object TaskName, State, @{Name="Trigger";Expression={$_.Triggers[0].ToString()}}
```

**Expected output:**
```
TaskName              State Trigger
--------              ----- -------
Windows Brain Agent Enabled At startup
```

### Method 3: Reboot and Verify Agent is Running

1. Restart your computer: `Restart-Computer -Force`
2. After login, open browser to: `file:///C:/Users/jacla/.local/share/second-brain/index.html`
3. Check **status indicator** at top:
   - ✅ **Green "Online"** = Agent running + tunnel available
   - 🟡 **Yellow "Local Mode"** = Agent running, no tunnel
   - 🔴 **Red "Offline"** = Agent not running (task may have failed)

---

## Troubleshooting

### Agent Still Shows "Offline" After Reboot

**Step 1: Check if task exists and is enabled**
```powershell
Get-ScheduledTask -TaskName "Windows Brain Agent" | Select-Object TaskName, State
```

If State = "Disabled", enable it:
```powershell
Enable-ScheduledTask -TaskName "Windows Brain Agent"
```

**Step 2: Check task history for errors**
```powershell
Get-ScheduledTaskInfo -TaskName "Windows Brain Agent" | Select-Object LastRunTime, LastTaskResult, NextRunTime
```

- `LastTaskResult: 0` = Success
- `LastTaskResult: 1` = General error
- `LastTaskResult: 0x80070002` = File not found (path wrong)

**Step 3: Check Event Viewer for detailed error**
1. Press **Win + R** → type `eventvwr.msc` → Enter
2. Navigate: **Windows Logs** → **System**
3. Look for errors from "Task Scheduler" with event ID 103 (task failed)

### Port 8080 Already in Use

The agent may fail to start if port 8080 is occupied:

```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# If it's another agent instance, kill it
Stop-Process -Id <PID> -Force
```

### PowerShell Execution Policy Issue

If you get "cannot be loaded because running scripts is disabled", run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### Task Runs but Agent Stops Immediately

Check the agent logs:
```powershell
Get-Content "C:\Users\jacla\.local\share\second-brain\agent.log" -Tail 50
```

Common causes:
- **GitHub credentials missing**: Ensure `~\.local\share\second-brain\.git\config` has valid auth
- **Cloudflare tunnel down**: Check tunnel status: `cloudflared tunnel list`
- **Script error**: Review the last 50 lines of logs

---

## Undo/Disable Auto-Start

### Option 1: Disable (Keep task in Schedule, but don't run)

```powershell
Disable-ScheduledTask -TaskName "Windows Brain Agent"
```

To re-enable later:
```powershell
Enable-ScheduledTask -TaskName "Windows Brain Agent"
```

### Option 2: Delete Completely

```powershell
Unregister-ScheduledTask -TaskName "Windows Brain Agent" -Confirm:$false
```

---

## Monitoring: Keep Agent Running

Once auto-start is enabled, the agent should start automatically. However, **if it crashes**, it won't restart automatically.

**To add auto-restart on crash**, update the task action:

1. Open Task Scheduler
2. Right-click **"Windows Brain Agent"** → **Properties**
3. Go to **"Actions"** tab
4. Click **"Edit..."** on the action
5. In the **Program/script** field, change to:
```
powershell.exe
```
6. In **Arguments** field, change to:
```
-NoProfile -WindowStyle Hidden -Command "& { while($true) { try { & 'C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1' } catch { Start-Sleep -Seconds 5 } } }"
```

This creates a "restart loop" that restarts the agent if it crashes (waits 5 seconds between attempts).

---

## What Happens at Boot

| Time | Event |
|------|-------|
| **Windows boot** | OS starts |
| **User login** | Task Scheduler checks triggers |
| **~1-2 sec after login** | Task Scheduler finds "At startup" trigger matches |
| **~2-3 sec** | PowerShell launches hidden |
| **~3-5 sec** | Agent script starts, begins listening on port 8080 |
| **~5-10 sec** | Cloudflare tunnel connects (if available) |
| **Ready** | Agent fully operational, can receive commands |

---

## Integration with UI Controls

The **index.html** Brain UI includes agent controls (click status indicator):
- **Start Agent**: Runs `Start-Agent-Now.vbs` (local machine only)
- **Stop Agent**: Stops running process
- **Restart Agent**: Restarts the process
- **Refresh Status**: Queries agent health

With auto-start enabled:
- Agent is always running (no need to click "Start")
- "Stop" controls can pause it manually
- "Restart" resets the process if needed

---

## Security Notes

1. **No admin required to run agent** (only for Task Scheduler registration)
2. **Script runs in user context** (not SYSTEM)
3. **Hidden window** means no visible PowerShell window
4. **No processes left behind** if you disable the task
5. **Git authentication** required for GitHub syncing (stored in `.git/config`)

---

## Next Steps

✅ Auto-start is now enabled. The agent will:
- Start automatically on next boot
- Listen on `localhost:8080` (hidden)
- Sync with GitHub every 15 seconds
- Handle commands from Termux via tunnel
- Keep your Second Brain data in sync

📝 To verify it's working, **reboot and check the Brain UI status indicator**.

---

**Last Updated:** January 2026  
**Questions?** Check `WINDOWS_AGENT_STATUS.md` or `QUICK_START_AGENT.md`
