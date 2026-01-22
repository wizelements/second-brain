# Windows Integration Reference

**Last Updated**: 2026-01-22  
**Status**: ✓ Fully Operational  
**API Endpoint**: https://windows.codewithsolo.com/v1/health

---

## System Status

### Windows API Health
```bash
curl -s https://windows.codewithsolo.com/v1/health
# Response: {"status":"ok","device":"windows-laptop","hostname":"GratitudePC","version":"1.0.0"}
```

### Device Info
- **Device**: windows-laptop
- **Hostname**: GratitudePC
- **Platform**: Windows (via windows-client.sh bridge)
- **API Version**: 1.0.0

---

## Available Windows Tools

### 1. Open Applications
**Tool**: `windows-app`  
**Purpose**: Launch or bring focus to Windows applications  
**Status**: ✓ ENABLED

**Usage**:
```bash
# Via Termux
windows-client.sh open "notepad"
windows-client.sh open "chrome"
windows-client.sh open "vscode"
windows-client.sh open "explorer"
windows-client.sh open "powershell"
```

**Common Applications**:
- `notepad` - Text editor
- `calc` - Calculator
- `mspaint` - Paint
- `chrome` - Google Chrome
- `firefox` - Firefox
- `vscode` - Visual Studio Code
- `explorer` - Windows File Explorer
- `powershell` - PowerShell terminal
- `cmd` - Command Prompt
- `outlook` - Microsoft Outlook
- `teams` - Microsoft Teams
- `slack` - Slack

---

### 2. Send Desktop Notifications
**Tool**: `windows-notify`  
**Purpose**: Send toast notifications to Windows desktop  
**Status**: ✓ ENABLED

**Usage**:
```bash
windows-client.sh notify "Termux" "Task completed successfully"
windows-client.sh notify "Alert" "Build finished"
windows-client.sh notify "Reminder" "Check emails"
```

**Features**:
- Title + message
- Appears in notification center
- Non-intrusive background notification

---

### 3. Transfer Files to Windows
**Tool**: `windows-copy-file`  
**Purpose**: Copy individual files from Termux to Windows  
**Status**: ✓ ENABLED (via staging)

**Usage**:
```bash
windows-client.sh copy-file ~/projects/file.txt "C:\\Users\\{user}\\Documents\\"
windows-client.sh copy-file ~/script.py "C:\\Scripts\\"
```

**Process**:
1. File staged in Termux: `~/.windows-transfer/`
2. Transferred to Windows destination
3. Returns staging manifest for verification

**Staging Directory**: `~/.windows-transfer/{timestamp}-{filename}/`

---

### 4. Transfer Directories to Windows
**Tool**: `windows-copy-directory`  
**Purpose**: Copy entire directories from Termux to Windows  
**Status**: ✓ ENABLED (via staging)

**Usage**:
```bash
windows-client.sh copy-directory ~/projects/myapp "C:\\Projects\\myapp"
windows-client.sh copy-directory ~/scripts "C:\\Scripts"
```

**Process**:
1. Entire directory staged in Termux
2. Manifest created with file list
3. Manual copy workaround (due to broken exec endpoint)

**Staging Directory**: `~/.windows-transfer/{timestamp}-{dirName}/`  
**Manifest File**: `{stagingDir}.manifest.json`

---

### 5. List Windows Files
**Tool**: `windows-file-list`  
**Purpose**: Browse Windows files and directories  
**Status**: ✓ ENABLED

**Usage**:
```bash
windows-client.sh file-list "C:\\Users\\{user}\\Documents"
windows-client.sh file-list "C:\\Projects"
windows-client.sh file-list "C:\\"
```

**Output Format**:
```json
{
  "success": true,
  "type": "directory",
  "path": "C:\\Users\\user\\Documents",
  "files": [
    {"name": "report.docx", "size": 15360, "path": "C:\\Users\\user\\Documents\\report.docx"}
  ],
  "directories": [
    {"name": "Projects", "type": "directory", "path": "C:\\Users\\user\\Documents\\Projects"}
  ],
  "fileCount": 5,
  "dirCount": 3
}
```

---

## Disabled/Broken Tools

### ❌ Bash Windows (`bash-windows`)
**Status**: DISABLED  
**Reason**: windows.exec:execute endpoint has JSON escaping bug  
**Error**: Cannot execute shell commands on Windows

**Workaround**:
- Use `windows-app` to open PowerShell/CMD and execute commands manually
- Stage scripts and execute from Windows explorer
- Use file-based command queueing

---

### ❌ PowerShell Execution (`windows-powershell`)
**Status**: DISABLED  
**Reason**: Same windows.exec:execute endpoint broken  
**Error**: JSON escaping issue in endpoint

**Workaround**:
- Open PowerShell via `windows-app("powershell")`
- Copy script to Windows via `windows-copy-file`
- Execute manually from PowerShell ISE

---

### ❌ Open File (`windows-open`)
**Status**: DISABLED  
**Reason**: Requires PowerShell execution (broken endpoint)

**Workaround**:
- Use `windows-file-list` to browse files
- Use `windows-app("explorer")` to open file explorer
- Navigate manually to file location

---

## Integration with Termux

### Bridge Script
**Location**: `~/windows-client.sh`  
**Purpose**: Routes commands from Termux to Windows API  
**Transport**: HTTP to windows.codewithsolo.com

### Tool Executor
**Location**: `~/projects/tools/gpt-bridge/src/core/tool-executor.js`  
**Config**: Line 22 - `WINDOWS_ONLINE = true`  
**Version**: Updated 2026-01-22

---

## Common Workflows

### Workflow 1: Update Project Files on Windows
```bash
# From Termux
cd ~/projects/myapp
pnpm build

# Copy build output to Windows
windows-client.sh copy-directory ./dist "C:\\Projects\\myapp\\dist"

# Notify completion
windows-client.sh notify "Build" "Distribution files copied to Windows"

# Open in explorer
windows-client.sh open "explorer"
```

### Workflow 2: Edit Script on Windows, Run on Termux
```bash
# Copy script to Windows
windows-client.sh copy-file ~/script.py "C:\\Temp\\script.py"

# Notify for editing
windows-client.sh notify "Script Ready" "File ready for editing at C:\\Temp\\script.py"

# User edits on Windows, copies back to Termux manually
# Or vice versa with windows-copy-file
```

### Workflow 3: Daily Development Sync
```bash
# Morning: Sync project to Windows
windows-client.sh copy-directory ~/projects/gratog "C:\\Dev\\gratog"
windows-client.sh notify "Sync Complete" "gratog synced from Termux"

# Work on Windows, commit changes
# Push to GitHub from Windows or Termux

# Evening: Second Brain sync
brain-sync all
goodbye  # Git push
```

### Workflow 4: Alert on Task Completion
```bash
# In Termux script
pnpm build && windows-client.sh notify "Build Complete" "Build succeeded - ready for testing"

# Or on gig completion
brain done mklfx5x1  # Mark gig done
windows-client.sh notify "Gig Completed" "ACME Corp project finished - invoice sent"
```

---

## File Transfer Best Practices

### Staging Directory
- **Location**: `~/.windows-transfer/`
- **Purpose**: Temporary storage for files before Windows transfer
- **Cleanup**: Manual (can delete old `{timestamp}-*` directories)
- **Size**: Watch for disk space with large directories

### Manifest Files
- **Format**: JSON with transfer metadata
- **Location**: `{stagingDir}.manifest.json`
- **Contents**: Source, destination, file count, size, instructions
- **Use**: Reference for manual copy process

### Example Manifest
```json
{
  "timestamp": 1674408000000,
  "sourceDirectory": "/home/user/projects/app",
  "stagingDirectory": "/home/user/.windows-transfer/1674408000000-app",
  "windowsDestination": "C:\\Projects\\app",
  "directoryName": "app",
  "filesTotal": 247,
  "filesCopied": 247,
  "totalSize": 15728640,
  "status": "STAGED_FOR_TRANSFER"
}
```

---

## Troubleshooting

### Windows API Unreachable
```bash
# Check connectivity
curl -s https://windows.codewithsolo.com/v1/health

# If fails: Windows service is down
# Status: Wait for service restoration
# Check status file: ~/SYSTEM-OPERATIONAL-STATUS.md
```

### windows-client.sh Not Found
```bash
# Verify location
ls -la ~/windows-client.sh

# If missing: Create symlink or wrapper
# The script should exist in home directory
```

### File Transfer Fails
```bash
# Check staging directory
ls -la ~/.windows-transfer/

# Verify Windows path exists
windows-client.sh file-list "C:\\destination\\path"

# Check disk space
df -h ~
```

### Notification Not Appearing
- Check Windows notification settings
- Ensure "notifications" are enabled in Settings > System > Notifications
- Check notification center (bottom right of taskbar)

### App Won't Open
```bash
# Verify app name/path
windows-client.sh open "notepad"  # Built-in app

# For installed apps, use full path if simple name fails
windows-client.sh open "C:\\Program Files\\Google\\Chrome\\chrome.exe"
```

---

## API Reference

### Base URL
```
https://windows.codewithsolo.com/v1
```

### Endpoints

#### Health Check
```
GET /health

Response:
{
  "status": "ok",
  "device": "windows-laptop",
  "hostname": "GratitudePC",
  "version": "1.0.0",
  "timestamp": "2026-01-22T04:50:28.471Z"
}
```

#### Open Application
```
POST /app/open
Body: {"appName": "notepad"}
```

#### Send Notification
```
POST /notify
Body: {"title": "Alert", "message": "Message text"}
```

#### List Files
```
POST /files/list
Body: {"path": "C:\\Users\\{user}\\Documents"}
```

#### Copy File
```
POST /files/copy
Body: {"source": "/path/to/file", "destination": "C:\\dest"}
```

---

## System Configuration

### Configuration File
**Location**: `~/projects/tools/gpt-bridge/src/core/tool-executor.js`

**Key Settings**:
```javascript
const WINDOWS_ONLINE = true;  // Enable Windows tools
const WINDOWS_CLIENT = `${process.env.HOME}/windows-client.sh`;  // Bridge script
const WINDOWS_SSH_HOST = process.env.WINDOWS_SSH_HOST;  // SSH config (if used)
const WINDOWS_SSH_USER = process.env.WINDOWS_SSH_USER;  // SSH user (if used)
```

### Environment Variables
```bash
# Optional SSH configuration (legacy)
export WINDOWS_SSH_HOST="windows.local"
export WINDOWS_SSH_USER="user"

# API endpoint (hardcoded, but can be overridden)
# https://windows.codewithsolo.com
```

---

## Security Notes

### File Transfers
- Files staged in `~/.windows-transfer/` are temporary
- No encryption in transit (HTTPS only)
- Windows path must be accessible from API bridge
- Recommend staging to `C:\Temp` or project folders

### Notifications
- No sensitive data in notification text (visible in notification center)
- Keep messages brief

### API Access
- Bridge requires windows-client.sh script to be executable
- API endpoint is public but requires knowledge of URL
- No authentication token (internal trust model)

---

## Future Improvements

### Planned Fixes
1. Fix windows.exec:execute endpoint JSON escaping bug
   - Will enable bash_windows and windows-powershell
   - ETA: TBD (depends on Windows service maintainer)

2. Add direct file sync endpoint
   - Eliminate staging directory workaround
   - Faster large file transfers

3. Add clipboard integration
   - Copy text from Termux to Windows clipboard
   - Paste from Windows to Termux

### Requested Features
- [ ] Batch file operations
- [ ] Screen capture API
- [ ] Window control (minimize, maximize)
- [ ] Clipboard sync
- [ ] Registry access (PowerShell workaround)

---

## Related Files

- **System Status**: `~/SYSTEM-OPERATIONAL-STATUS.md`
- **Tool Executor**: `~/projects/tools/gpt-bridge/src/core/tool-executor.js`
- **Bridge Script**: `~/windows-client.sh`
- **Second Brain**: `~/.local/share/second-brain/inbox.json`

---

## Quick Command Reference

```bash
# Check Windows is online
curl -s https://windows.codewithsolo.com/v1/health | jq .

# Open an application
~/windows-client.sh open "notepad"

# Send a notification
~/windows-client.sh notify "Title" "Message"

# List files on Windows
~/windows-client.sh file-list "C:\\Users"

# Copy file to Windows
~/windows-client.sh copy-file ~/file.txt "C:\\Temp"

# Copy directory to Windows
~/windows-client.sh copy-directory ~/projects "C:\\Projects"
```

---

**Document Version**: 1.0  
**Repository**: wizelements/second-brain  
**Branch**: main  
**Last Verified**: 2026-01-22 04:50 UTC
