# Quick Sync Reference - Windows ↔ Termux

## 🟢 What's Where (Right Now)

| Component | Location | Status | Size | Last Update |
|-----------|----------|--------|------|------------|
| **Termux Inbox** | `/data/data/com.termux/.../.local/share/second-brain/inbox.json` | ✅ Active | 64KB | Jan 23, 08:00Z |
| **Windows Inbox** | `C:\Users\jacla\.local\share\second-brain\inbox.json` | ✅ Synced | 64KB | Jan 22 (~24h ago) |
| **GitHub Backup** | `wizelements/second-brain/inbox.json` | ✅ Secure | 64KB | Jan 21, 19:56Z |
| **Agent Service** | `C:\Users\jacla\Scripts\windows-brain-agent-lite.ps1` | ✅ Running | 15KB | Running since 7h18m ago |
| **UI Dashboard** | `C:\Users\jacla\.local\share\second-brain\index.html` | ✅ Responsive | 180KB | Updated Jan 23 |
| **File Cache** | `C:\Users\jacla\.local\share\second-brain\filesystem.json` | ✅ Updated | 2.8MB | Recent |

---

## 📊 Data Inventory

### Items in System: 43

| Type | Count | Examples |
|------|-------|----------|
| **Active Tasks** | 4 | "Build auth module", "ACME gig - $2500" |
| **Classified** | 32 | Awaiting work |
| **Completed** | 3 | Done items |
| **In Progress** | 0 | Currently working |
| **Pending** | 4 | Not classified yet |

**Total Value**: $3,050 in pending gigs

---

## 🔄 Sync Directions

### Termux → GitHub ✅
```
Command:    goodbye
Frequency:  Manual (user runs when ready)
Last Sync:  2026-01-21T19:56:35Z
Status:     Ready (inbox.json clean, no conflicts)
Next Step:  Run 'goodbye' to push latest changes
```

### GitHub → Windows ⏳ (Planned)
```
Command:    Scheduled PowerShell script
Frequency:  Every 6 hours (not yet active)
Last Sync:  ~24 hours ago
Status:     Needs automation
Next Step:  Create sync-pull.ps1 script
```

### Windows → GitHub ❌ (Blocked)
```
Command:    Not implemented yet
Frequency:  N/A (no write path)
Last Sync:  Never
Status:     Phase 2 feature
Next Step:  Implement push logic + conflict detection
```

---

## 🚀 Current Workflow

### Capture (Termux - Works Now)
```
1. User speaks to phone
   ↓
2. "ba 'text here'" or voice command
   ↓
3. Saved to inbox.json locally
   ↓
4. When ready, user runs: goodbye
   ↓
5. ✅ Pushed to GitHub
```

### View (Windows - Works Now)
```
1. Open index.html in browser
   ↓
2. UI loads inbox.json (local file)
   ↓
3. Displays 43 items, statistics
   ↓
4. Agent status polls every 5s
   ↓
5. ✅ Shows agent online/offline
```

### Sync to Windows (Manual - Works)
```
1. Navigate to C:\Users\jacla\.local\share\second-brain\
   ↓
2. Run: git pull origin master
   ↓
3. Gets latest from GitHub
   ↓
4. Refreshes index.html
   ↓
5. ✅ Windows sees new items
```

---

## 🔧 Troubleshooting

### "Agent shows OFFLINE"
```
Solution 1: Check if process is running
  netstat -ano | findstr "8080"
  
Solution 2: Restart agent
  powershell -File C:\Users\jacla\Scripts\windows-brain-agent-lite.ps1
  
Solution 3: Check port conflicts
  Get-NetTCPConnection -LocalPort 8080
```

### "Windows data is stale"
```
Solution: Pull latest from GitHub
  cd C:\Users\jacla\.local\share\second-brain
  git pull origin master
  
Then refresh UI in browser (F5)
```

### "Can't run `goodbye` on Termux"
```
Solution: Check git is installed
  pkg install git
  
Then verify remote:
  git remote -v
  
Try pushing manually:
  git add inbox.json
  git commit -m "Manual sync"
  git push origin master
```

### "409 Conflict on GitHub"
```
This means Windows and Termux both edited.
Solution (temporary):
  - Take Termux version (authoritative)
  - Windows pulls latest
  - Don't edit Windows locally yet
```

---

## 📱 Commands Quick Reference

### Termux (Voice + CLI)
| Command | What It Does |
|---------|-------------|
| `ba "text"` | Capture to inbox |
| `goodbye` | Push inbox.json to GitHub |
| `nudge` | Get focus suggestion |
| `brain-move <id> active` | Move item to active |

### Windows (PowerShell)
| Command | What It Does |
|---------|-------------|
| `git pull origin master` | Download latest from GitHub |
| (Open index.html) | View dashboard |
| (Refresh page) | Reload data from disk |

### GitHub (Web)
| Action | What It Does |
|--------|-------------|
| View commits | See sync history |
| View files | Browse inbox.json |
| Restore old version | Revert if needed |

---

## 🔌 Endpoints Reference

### Termux (Always Available)
```
Health:     https://solospace.codewithsolo.com/health
Email:      POST /webhook/email/gmail (send email)
Capture:    POST /webhook/capture (save learning)
Inbox:      GET /webhook/inbox (list items)
Nudge:      GET /webhook/nudge (get focus)
```

### Windows (When Agent Running)
```
Health:     http://localhost:8080/health
Status:     http://localhost:8080/status → shows CPU, Memory, Uptime
UI:         file:///C:/Users/jacla/.local/share/second-brain/index.html
```

---

## 📈 What's Working

✅ Voice capture on Termux  
✅ Local storage on both devices  
✅ Git backup on GitHub  
✅ UI dashboard on Windows  
✅ Agent status monitoring  
✅ Email from Termux  

---

## ⚠️ What Needs Work (Phase 2)

❌ Windows → GitHub push (implement `git push` from Windows)  
❌ Scheduled sync (set up 6h pull schedule)  
❌ Conflict detection (if both edit same item)  
❌ Real-time notifications (live updates)  

---

## 📋 Next Steps (Recommended Order)

### This Week
1. Create `windows-sync-pull.ps1` (scheduled pull)
2. Test pushing from Windows manually
3. Document conflict resolution strategy

### Next Week
1. Implement conflict detection
2. Create `windows-sync-push.ps1` script
3. Schedule both pull and push

### Next Month
1. Build real-time sync option
2. Add merge conflict UI
3. Implement cloud backup redundancy

---

## 💡 Key Numbers

| Metric | Value |
|--------|-------|
| Items in System | 43 |
| Termux Items | 43 |
| Windows Items | 43 |
| GitHub Commits | 34+ |
| Days Since Last Sync | ~1 |
| Agent Uptime | 7:18 |
| Port Used (Agent) | 8080 |
| Port Used (Termux Server) | 5000 |
| File Size (inbox.json) | 64 KB |
| File Size (filesystem.json) | 2.8 MB |

---

## 🎯 Alignment Score

**Overall**: 84% (from ALIGNMENT_PROGRESS.md)

| Principle | Score | Status |
|-----------|-------|--------|
| **Architecture** | 60% | Too many tools, needs simplification |
| **Minimize Friction** | 92% | Search is great, but sync not automated |
| **Simple Capture** | 85% | Voice + CLI work perfectly |
| **Keep Moving** | 95% | Items flow through lifecycle well |

**To Hit 95%**: Simplify infrastructure (Phase 3)

---

**Last Updated**: Jan 23, 2026 08:15 UTC  
**Next Review**: Jan 24, 2026  
**Status**: ✅ Ready for Phase 2
