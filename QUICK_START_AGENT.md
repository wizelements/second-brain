# 🚀 Quick Start - Agent Control

## Problem
You clicked "Start Agent" but nothing happened.

## Root Cause
Browsers can't execute programs directly (security). The button shows instructions, but you need to actually run them.

## Solution: One-Click Launcher

### Option 1: Desktop Shortcut (EASIEST)

**Location**: `C:\Users\jacla\Desktop\Start Brain Agent.lnk`

**To use:**
1. Go to Desktop
2. Double-click "**Start Brain Agent**" shortcut
3. Wait 5-10 seconds
4. Refresh the UI
5. Status will show ✅ Agent Running

This launcher automatically:
- Runs PowerShell in background
- Starts the agent
- Shows confirmation popup
- Checks if it worked
- Closes automatically

### Option 2: Manual from UI (EASIEST ALTERNATIVE)

1. Open UI: `file:///C:\Users\jacla\.local\share\second-brain\index.html`
2. Click status indicator at top
3. Click "▶️ Start Agent"
4. See two options:
   - **🎯 Easiest Way**: Double-click `Start-Agent-Now.vbs` in Windows Explorer
   - **📋 Manual Method**: Copy PowerShell command

### Option 3: Direct File Double-Click

**Location**: `C:\Users\jacla\Scripts\Start-Agent-Now.vbs`

**Steps:**
1. Open Windows Explorer
2. Navigate to: `C:\Users\jacla\Scripts\`
3. Find: `Start-Agent-Now.vbs`
4. Double-click it
5. You'll see confirmation popup
6. Agent starts in background

### Option 4: PowerShell (MANUAL)

**Steps:**
1. Open PowerShell
2. Paste this command:
   ```powershell
   Start-Job -FilePath "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1" -Name "brain-agent"
   ```
3. Press Enter
4. Close PowerShell

**Then verify it worked:**
```powershell
curl https://windows.codewithsolo.com/status
```

Should return status 200 (not error).

## How to Know It's Working

### Check 1: In the UI
1. Open: `file:///C:\Users\jacla\.local\share\second-brain\index.html`
2. Click status indicator
3. Click "🔍 Refresh Status"
4. Should show: ✅ **Agent Running** (green)

### Check 2: In PowerShell
```powershell
# Check if job is running
Get-Job -Name "brain-agent"

# Output should show:
# Id   Name   State
# --   ----   -----
# 1    brain-agent  Running
```

### Check 3: Test Termux Command
From Termux:
```bash
curl https://windows.codewithsolo.com/status
```

Should return success (not "Access denied").

## Troubleshooting

### Double-click did nothing
- Make sure you're clicking the right file: `Start-Agent-Now.vbs`
- It may be hiding - right-click → Properties to verify
- Try right-click → Open instead

### Got error "Access denied"
- VBS file might need permission
- Try PowerShell method instead (Option 4)
- Or run as Administrator:
  - Right-click Start-Agent-Now.vbs
  - Run as Administrator

### Agent starts but stops immediately
- Check if Windows Defender is blocking it
- Add script to Windows Defender exclusions
- Or disable Real-time Protection temporarily

### Refresh shows still offline after 10 seconds
- Agent might need more time
- Click "Refresh Status" manually
- Wait another 10 seconds and try again
- Or check PowerShell:
  ```powershell
  Get-Job -Name "brain-agent" | Receive-Job
  ```
  Look for error messages

## Making It Super Easy

### Create Desktop Shortcut (One-time setup)

Run this in PowerShell:
```powershell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ScriptPath = "C:\Users\jacla\Scripts\Start-Agent-Now.vbs"
$ShortcutPath = "$DesktopPath\Start Brain Agent.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$ScriptPath`""
$Shortcut.Save()

Write-Host "✓ Shortcut created on Desktop!"
```

Then: Just double-click the Desktop shortcut!

## Full Workflow

```
1. Open Brain UI
   file:///C:\Users\jacla\.local\share\second-brain\index.html

2. Click status indicator

3. Choose easiest option:
   ✓ Desktop shortcut (if created)
   ✓ Double-click Start-Agent-Now.vbs
   ✓ Copy PowerShell command

4. Agent starts (5-10 seconds)

5. Refresh status in UI

6. See ✅ Agent Running

7. Termux commands now work!
```

## Files Reference

| File | Purpose |
|------|---------|
| `Start-Agent-Now.vbs` | One-click launcher (double-click) |
| `windows-brain-agent-v4.ps1` | Actual agent script |
| `Open-Brain.bat` | Opens the UI |
| `Check-Brain-Status.ps1` | Shows full status |

## Summary

**Simple Path:**
1. Desktop shortcut (easiest)
2. Or: Double-click `C:\Users\jacla\Scripts\Start-Agent-Now.vbs`
3. Or: Copy PowerShell command from UI

**Then:**
1. Wait 5-10 seconds
2. Refresh UI
3. See ✅ running
4. Done!

---

**Try the Desktop shortcut now** if you have it, otherwise **double-click Start-Agent-Now.vbs** in `C:\Users\jacla\Scripts\` 🚀
