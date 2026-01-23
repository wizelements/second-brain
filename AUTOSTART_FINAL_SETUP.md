# Windows Brain Agent Auto-Start - Final Setup

## ⚠️ IMPORTANT: You Must Run This Manually as Administrator

Due to Windows security restrictions, the auto-start task **cannot be registered remotely**. You must do this yourself on your Windows machine.

---

## Option A: Quickest (One Click) ⚡

1. **Open File Explorer**
2. Navigate to: `C:\Users\jacla\Scripts\`
3. **Right-click** `Setup-Autostart.ps1`
4. Select **"Run with PowerShell"**
5. In the UAC prompt, click **"Yes"** to allow

**Done!** Task is now registered.

---

## Option B: Manual PowerShell Command 🖥️

1. **Open PowerShell as Administrator**
   - Press `Windows + R`
   - Type: `powershell`
   - Press `Ctrl+Shift+Enter` to run as admin
   - Click **"Yes"** on UAC prompt

2. **Copy & paste this command** (all in one line):
   ```powershell
   $taskName = "Windows Brain Agent"; $scriptPath = "C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1"; $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -File `"$scriptPath`""; $trigger = New-ScheduledTaskTrigger -AtStartup; Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Force; Write-Host "✓ Auto-start enabled!" -ForegroundColor Green
   ```

3. **Press Enter** and wait for confirmation

---

## Option C: Batch File (Simplest) 📄

1. Open File Explorer → `C:\Users\jacla\Scripts\`
2. Double-click: `Register-Brain-Autostart.bat`
3. Click **"Yes"** on UAC prompt
4. Command window opens, shows the registration process
5. Press any key to close

---

## Verification: Task Was Created ✅

After running ONE of the above options, verify it worked:

**In PowerShell (any admin or non-admin):**
```powershell
Get-ScheduledTask -TaskName "Windows Brain Agent" | Select-Object TaskName, State
```

**Expected output:**
```
TaskName              State
--------              -----
Windows Brain Agent   Enabled
```

---

## Or Check in Task Scheduler (GUI)

1. Press `Windows + R` → type `taskschd.msc` → press Enter
2. Look for **"Windows Brain Agent"** in the list
3. Double-click it to view details
4. **Trigger** should say "At startup"
5. **Status** should say "Enabled"

---

## What Happens Next?

| When | What | Details |
|------|------|---------|
| **Next boot** | Windows loads Task Scheduler | System boots normally |
| **After login** | Task Scheduler runs task | Hidden PowerShell window starts |
| **~3-5 seconds** | Agent starts listening | Listens on `localhost:8080` |
| **~5-10 seconds** | Cloudflare tunnel connects | Available at `https://windows.codewithsolo.com` |
| **Result** | Brain UI shows "Online" ✅ | Agent fully operational |

---

## Troubleshooting

### "Access Denied" or "You don't have permission"

- Close all PowerShell/Command windows
- Try Option A again (right-click → "Run with PowerShell")
- Make sure you click **"Yes"** on the UAC prompt

### "The term 'Register-ScheduledTask' is not recognized"

- You may be using an older PowerShell version
- Try Option C (Batch file) instead
- Or update PowerShell: `winget upgrade PowerShell`

### Task exists but agent still shows "Offline" after reboot

1. **Check if task ran:**
   ```powershell
   Get-ScheduledTaskInfo -TaskName "Windows Brain Agent" | Select-Object LastRunTime, LastTaskResult
   ```
   - `LastTaskResult: 0` = Success ✓
   - `LastTaskResult: 267008` = Never run (won't happen until next boot)

2. **Force run the task manually:**
   ```powershell
   Start-ScheduledTask -TaskName "Windows Brain Agent"
   ```

3. **Wait 5 seconds, then check status in Brain UI** (should turn green)

4. **If still offline, check agent logs:**
   ```powershell
   Get-Content "C:\Users\jacla\.local\share\second-brain\agent.log" -Tail 20
   ```

---

## Undo Auto-Start (If Needed)

**To disable without deleting:**
```powershell
Disable-ScheduledTask -TaskName "Windows Brain Agent"
```

**To delete completely:**
```powershell
Unregister-ScheduledTask -TaskName "Windows Brain Agent" -Confirm:$false
```

(Both require admin PowerShell)

---

## Files Created for This Setup

| File | Purpose |
|------|---------|
| `Setup-Autostart.ps1` | PowerShell setup script (simplest) |
| `Register-Brain-Autostart.ps1` | Full registration script with verification |
| `Register-Brain-Autostart.bat` | Batch wrapper for automation |
| `Verify-Brain-Autostart.ps1` | Diagnostic script to verify setup |
| `AUTOSTART_QUICK_START.md` | Quick 3-step guide |
| `AUTOSTART_SETUP_GUIDE.md` | Complete technical guide |

---

## Summary

✅ **All files are ready**  
✅ **Documentation is complete**  
⏳ **Waiting on you to:** Pick Option A, B, or C above and run it

Once you run ONE of those options, the agent will start automatically on every boot.

---

**Need help?** Check:
- `AUTOSTART_SETUP_GUIDE.md` - Full technical details
- `AUTOSTART_QUICK_START.md` - Step-by-step with screenshots
- Run: `C:\Users\jacla\Scripts\Verify-Brain-Autostart.ps1 -Verify` to check status

**Last Updated:** January 23, 2026
