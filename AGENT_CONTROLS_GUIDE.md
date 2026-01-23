# 🎮 Agent Controls - Now in the UI!

You can now manage the Windows Brain Agent directly from the Second Brain UI.

## How to Use

### Step 1: Open the UI
```
file:///C:\Users\jacla\.local\share\second-brain\index.html
```

### Step 2: Click Status Indicator
Look for the status indicator at the top (says "Online" or "Local Mode")

- **Click on it** → Opens Agent Control panel

### What You'll See

```
⚙️ Windows Brain Agent Control

Agent Status
├─ ✅ Agent Running (if started)
├─ ⚠️ Agent Not Running (if stopped)
└─ Version & Uptime info

Quick Actions
├─ ▶️ Start Agent
├─ ⏹️ Stop Agent
├─ 🔍 Refresh Status
└─ 🔄 Restart Agent

Information
├─ What's the agent?
├─ Why start it?
└─ How long to start?

Auto-Start Setup
└─ PowerShell command to make it auto-start
```

## Using Each Control

### ▶️ Start Agent

1. Click "Start Agent"
2. Copy the command shown:
   ```powershell
   Start-Job -FilePath "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1" -Name "brain-agent"
   ```
3. Paste into PowerShell and press Enter
4. Click "Refresh Status" 
5. After 5-10 seconds, it will show ✅ Agent Running

### 🔍 Refresh Status

- Checks if agent is currently running
- Updates every time you click
- Auto-checks every 2 seconds after starting

### ⏹️ Stop Agent

- Shows when agent is running
- Displays command to stop it:
  ```powershell
  Stop-Job -Name "brain-agent"
  ```
- Copy and run in PowerShell

### 🔄 Restart Agent

- Stops and restarts the agent
- Shows full sequence of commands
- Click "Refresh Status" after to verify

## Status Colors

| Status | Meaning |
|--------|---------|
| 🟢 Online (green) | Agent is running - Termux commands work |
| 🟡 Local Mode (green) | Using local file:// - shows local data |
| 🔴 Offline (red) | Agent not running - need to start it |

## One-Click Auto-Start (Optional)

To have the agent start automatically on Windows boot:

1. Click "Start Agent" → See the info panel
2. Scroll down to "Make It Auto-Start"
3. Copy the PowerShell command
4. Run as Administrator in PowerShell
5. Done! Agent will start on next boot

Command:
```powershell
$taskName = "Windows Brain Agent"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-NoProfile -WindowStyle Hidden -File "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1"'
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Force
```

## What Happens When Agent Runs

✅ Cloudflare tunnel (https://windows.codewithsolo.com) receives commands  
✅ Termux can send file operations to Windows  
✅ Remote automation enabled  
✅ Cross-device control works  

## What Happens When Agent Stops

❌ Termux can't execute commands  
❌ Remote file operations blocked  
❌ Local UI still works (shows inbox data)  
⚠️ Status shows "Offline" in red  

## Typical Workflow

1. **Morning**: Click status → Start Agent (one-time or auto-start setup)
2. **During Day**: Use Termux and Windows interchangeably
3. **Evening**: Can leave running or click Stop

## Troubleshooting

**Status shows "Checking..." for a long time?**
- Network might be slow
- Click "Refresh Status" again
- Check if Cloudflare tunnel is running

**Commands in modal won't copy?**
- Highlight text manually
- Use Ctrl+C to copy
- Paste into PowerShell

**Agent says Running but Termux still blocked?**
- Cloudflare tunnel might be down
- Check: `curl https://windows.codewithsolo.com/status`
- Restart tunnel if needed

**Want to see logs?**
- In PowerShell:
  ```powershell
  Get-Job -Name "brain-agent" | Receive-Job
  ```

## Quick Reference

| Action | Command |
|--------|---------|
| Start agent | Run command from UI → Start Agent |
| Stop agent | Run command from UI → Stop Agent |
| Check status | Click "Refresh Status" in panel |
| Auto-start | Copy auto-start PowerShell command |
| View logs | `Get-Job -Name "brain-agent" \| Receive-Job` |
| List jobs | `Get-Job` |
| Kill agent | `Stop-Job -Name "brain-agent" -Force` |

## No More Terminal Commands!

Before: ❌
```powershell
# Had to remember complex scripts
# Had to open separate windows
# Easy to make mistakes
```

After: ✅
```
1. Click status indicator
2. Click "Start Agent"
3. Copy displayed command
4. Paste into PowerShell
5. Done!
```

Much easier and more intuitive!

---

**Try it now**: Open the UI and click the status indicator! 🚀
