# Second Brain - Deployment Guide

**Status:** Phase 2 ✓ | Windows Sync Ready ✓ | Android Kivy (Building)

---

## Windows Setup (5 minutes)

### Quick Start
```powershell
# Run as admin
.\START-BRAIN.ps1
```

This does:
- ✓ Checks Node.js installation
- ✓ Starts API server (localhost:5000)
- ✓ Registers Task Scheduler for sync (6am, 12pm, 6pm pull + 8am push)
- ✓ Opens dashboard in browser

### Manual Setup
```powershell
# 1. Install Node deps
cd $env:USERPROFILE\.agents\skills\second-brain-sync\server
npm install

# 2. Start server
node server.js

# 3. Test
Invoke-RestMethod http://localhost:5000/health
```

---

## What Actually Works

### Endpoints (Tested ✓)
- `GET /health` → Server status
- `POST /webhook/capture` → Save learning/bug/insight
- `GET /webhook/inbox` → List all captures
- `GET /webhook/nudge` → Get current focus
- `POST /webhook/email/gmail` → Send email (requires config)

### Sync Scripts (Tested ✓)
- `windows-sync-push.ps1` → Push changes to GitHub (8 seconds)
- `windows-sync-pull.ps1` → Pull from GitHub (handles conflicts safely)
- Both create backups and log operations

### Storage
- `inbox.json` - 43 items synced
- `captures/` - Timestamped learning captures
- `backups/` - Automatic snapshots before push
- `conflicts/` - Merge conflict state (if needed)

---

## GitHub Sync Flow

```
Windows (local edits)
    ↓
windows-sync-push.ps1 (detects changes)
    ↓
GitHub (master branch)
    ↓
windows-sync-pull.ps1 (pulls every 6 hours)
    ↓
Termux/Android (via tunnel)
```

### Push Test
```powershell
.\Scripts\windows-sync-push.ps1 -Commit "Phase 2 validation"
```

### Pull Test
```powershell
.\Scripts\windows-sync-pull.ps1
```

---

## Android Setup (Kivy APK) - In Progress

### Build APK
```bash
# On Termux or Linux
buildozer android debug

# Output: bin/second-brain-*-debug.apk
```

### Install
```bash
adb install bin/second-brain-*-debug.apk
```

### What It Does
- Captures voice input via `ba` command
- Syncs with GitHub via SSH
- Local dashboard UI
- Push notifications for daily focuses

---

## Data Model

All JSON-based (no database):

```
~/.local/share/second-brain/
├── inbox.json              # Main task list
├── captures/               # Timestamped learnings
├── context.json           # Current focus
├── backups/               # Auto snapshots
├── conflicts/             # Merge state
├── index.html             # Dashboard
└── sync-*.log             # Audit trail
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Check if port 5000 in use: `Get-NetStatistics -State Listen` |
| Git conflicts | Conflict state saved in `conflicts/` - resolve manually |
| Tasks not syncing | Run as admin for Task Scheduler |
| GitHub auth fails | Check `.git/config` has correct remote URL |

---

## Next Steps

- [ ] Test end-to-end Windows → GitHub → Termux
- [ ] Build + test Kivy APK
- [ ] Implement real-time sync (not 6-hour batch)
- [ ] Add visual conflict resolution UI
- [ ] Remove Cloudflare tunnel (direct SSH instead)

---

## Commands Reference

| Task | Command |
|------|---------|
| Start | `.\START-BRAIN.ps1` |
| Sync push | `.\Scripts\windows-sync-push.ps1` |
| Sync pull | `.\Scripts\windows-sync-pull.ps1` |
| Check health | `Invoke-RestMethod http://localhost:5000/health` |
| View logs | `Get-Content ~/.local/share/second-brain/sync-*.log` |
| Test capture | `curl -X POST http://localhost:5000/webhook/capture -d '{"type":"note","content":"test"}'` |

---

**Last Updated:** Jan 23, 2026  
**Repository:** https://github.com/wizelements/second-brain
