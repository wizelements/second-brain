# GPT Instructions & Windows Deployment Guide

## Current Status
- **Termux/Android**: ✅ FULLY OPERATIONAL (4/4 tools)
- **Windows Desktop**: ⚠️ PARTIAL (4/8 tools, fs.write endpoint pending deployment)
- **GitHub Bridge**: ✅ WORKING (git sync)
- **Second Brain**: ✅ WORKING (dashboard, tasks, gigs)

## GPT Custom Instructions

### System Context
You are Amp (Rush Mode), optimized for speed and efficiency in a Termux/Android mobile development environment with cross-platform control.

**Key Capabilities:**
- Termux: bash, read, create, edit (4/4 working)
- Windows: windows_app, windows_notify, windows_file_list (3/4 broken due to exec endpoint)
- GitHub: Full push/pull/commit support
- Second Brain: Dashboard, task tracking, gig management

### Available Tools

**TERMUX (Local):**
1. bash - Execute shell commands
2. read - Read files/directories  
3. create - Create new files
4. edit - Edit files (find/replace)

**WINDOWS (Limited):**
- windows_app - Launch applications ✅
- windows_notify - Send notifications ✅
- windows_file_list - List files in Termux ✅
- windows_copy_file - File transfer (staged to ~/.windows-transfer/) 
- windows_copy_directory - Directory transfer (staged)
- bash_windows - Shell execution ❌ (exec endpoint broken)
- windows_powershell - PowerShell ❌ (exec endpoint broken)
- windows_open - File opening ❌ (exec endpoint broken)

**GITHUB:**
- Full git operations (push, pull, commit)
- Branch management
- Repository sync

### Quick Command Reference

```bash
# Termux (always available)
bash "command"           # Execute shell
read "path"             # Read file
create "path" "content" # Create file
edit "path" "old" "new" # Edit file

# Windows (limited)
windows_app "notepad"           # Open application
windows_notify "title" "message" # Send notification
windows_file_list "path"        # List Termux files

# GitHub
git add -A && git commit -m "message" && git push

# Second Brain
brain-add "task text"    # Add task/gig
brain done <id>          # Mark complete
brain-home               # Dashboard
```

### Workflow: File Transfer (Current Workaround)

**Problem:** windows.exec:execute broken (JSON escaping issue)

**Solution:** File staging
1. Call windows_copy_file() or windows_copy_directory()
2. Files staged to ~/.windows-transfer/{timestamp}-name
3. Manifest created with instructions
4. User manually copies from phone to Windows

**Manifest Structure:**
```json
{
  "sourceFile": "/path/in/termux",
  "stagingFile": "~/.windows-transfer/timestamp-name",
  "windowsDestination": "C:\\Users\\jacla\\Desktop\\name",
  "fileSize": 12345,
  "checksum": "md5hash",
  "instructions": ["Copy from staging to Windows"]
}
```

---

## Windows Agent Deployment

### Problem
- windows.fs.write endpoint exists in source but not deployed to windows.codewithsolo.com
- Current deployed version missing file write capability

### Solution: Deploy Updated Agent

**Option 1: Copy & Restart (Fastest)**
```bash
# On Termux (Android):
windows_copy_file ~/docs/windows-agent/webhook-server-v1.js

# On Windows Laptop:
1. Stop running agent process
2. Copy file to agent directory
3. Restart: pm2 restart webhook-server
4. Test: ~/windows-client.sh write "C:\\Users\\jacla\\Desktop\\test.txt" "hello"
```

**Option 2: GitHub Auto-Deploy (If Hooked)**
```bash
cd ~/docs/windows-agent
git add webhook-server-v1.js
git commit -m "Deploy: Add windows.fs.write endpoint support"
git push
# Triggers CI/CD if configured → Auto-deploys to windows.codewithsolo.com
```

**Option 3: Manual cURL to Windows API**
```bash
# Direct POST to deployed agent (requires SSH access)
curl -X POST https://windows.codewithsolo.com/v1/actions/windows.fs.write:execute \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "path": "C:\\Users\\jacla\\Desktop\\GPT-Instructions.txt",
      "content": "base64-encoded-content",
      "encoding": "base64",
      "overwrite": true
    }
  }'
```

### After Deployment: Test
```bash
# Test write endpoint
~/windows-client.sh write "C:\\Users\\jacla\\Desktop\\test.txt" "hello world"

# If successful:
# On Windows: Check C:\Users\jacla\Desktop\test.txt

# Then copy GPT instructions:
~/windows-client.sh write "C:\\Users\\jacla\\Desktop\\GPT-Instructions.txt" "$(cat GPT-FILE-TRANSFER-SUCCESS.md)"
```

---

## Troubleshooting

### File Transfer Not Working
- **Cause:** windows.fs.write endpoint not deployed
- **Workaround:** Manual copy from ~/.windows-transfer/
- **Fix:** Deploy webhook-server-v1.js to Windows agent

### windows.exec:execute Still Broken
- **Cause:** JSON escaping issue with PowerShell commands
- **Impact:** bash_windows, windows_powershell, windows_open unavailable
- **Status:** Requires Windows agent code fix (escape JSON properly)

### Second Brain Sync Issues
- **Check:** `brain-sync`
- **Verify:** `cat ~/.local/share/second-brain/inbox.json`
- **Push:** `goodbye` (sync to GitHub)

---

## Next Steps

1. **Deploy Windows Agent:**
   - Copy webhook-server-v1.js to Windows
   - Restart agent process
   - Test write endpoint

2. **Enable File Transfers:**
   - Once fs.write deployed, use windows_copy_file() directly
   - Files transfer automatically to Desktop
   - No manual staging needed

3. **Fix windows.exec:**
   - Update PowerShell command escaping
   - Re-enable bash_windows, windows_powershell, windows_open

---

## File Locations

- **GPT Instructions:** ~/GPT-FILE-TRANSFER-SUCCESS.md
- **Staged for Transfer:** ~/.windows-transfer/GPT-Instructions-Latest.txt
- **Windows Agent:** ~/docs/windows-agent/webhook-server-v1.js
- **Windows Client CLI:** ~/windows-client.sh
- **Windows API:** https://windows.codewithsolo.com

---

Generated: Jan 21 2026
