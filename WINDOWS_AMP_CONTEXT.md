# 🤖 WINDOWS AMP CONTEXT - Second Brain Integration Guide

**Purpose**: Give Windows Amp full understanding of the Second Brain system  
**Created**: 2026-01-22  
**Source**: Termux Amp (T-019be81c-dc0c-713a-9933-36ee55047356)  
**Status**: ACTIVE - Read this first when working on Second Brain

---

## TL;DR FOR WINDOWS AMP

You are working with a **bidirectional Second Brain** shared between:
- **Termux Amp** (Android phone) - Primary capture device
- **Windows Amp** (Laptop) - Development and execution
- **GitHub** (wizelements/second-brain) - Source of truth

**Your data location**: `C:\Users\jacla\.local\share\second-brain\`

---

## CURRENT GAPS (What's Broken)

### Gap 1: Windows Amp Lacks Skill
**Problem**: Windows Amp doesn't have the `second-brain-dev` skill installed.

**Fix**: Create skill at `C:\Users\jacla\.config\agents\skills\second-brain-dev\SKILL.md`:

```yaml
---
name: second-brain-dev
description: Integrates with Second Brain for project context. Shows GitHub issues, TODOs, and file structure.
---
```

Then add the skill content (see SKILL CONTENT section below).

### Gap 2: Sync Is Manual
**Problem**: Data syncs every 4 hours or manually. Changes made by one Amp may not be visible to the other immediately.

**Fix**: 
1. Run `C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1` before starting work
2. After making changes, commit and push to GitHub
3. Termux will pull on next `goodbye` command

### Gap 3: No Amp-to-Amp Protocol
**Problem**: No formal way for Amps to hand off tasks or share context.

**Fix**: Use the `threads.json` file (see AMP-TO-AMP PROTOCOL below).

### Gap 4: Path Differences
**Problem**: Termux uses `~/.local/share/second-brain/`, Windows uses `C:\Users\jacla\.local\share\second-brain\`

**Fix**: Always use platform-appropriate paths. This doc uses both.

---

## DATA LOCATIONS

### Windows Paths
```
C:\Users\jacla\.local\share\second-brain\
├── inbox.json              # Tasks, gigs, reminders (43 items)
├── github.json             # GitHub repos, issues, PRs
├── filesystem.json         # Project file trees
├── threads.json            # Amp thread references (NEW)
├── sync-state.json         # Sync metadata
└── guides/                 # Knowledge base
```

### Termux Paths
```
~/.local/share/second-brain/
├── inbox.json              # Same structure
├── github.json             # Same structure
├── filesystem.json         # Same structure
├── threads.json            # Same structure
└── ...
```

---

## CURRENT DATA STATE

As of 2026-01-22:

| Category | Count | Description |
|----------|-------|-------------|
| Tasks | 32 | Action items, todos |
| Gigs | 3 | Freelance jobs ($3,050 pipeline) |
| Reminders | 3 | Time-based alerts |
| Guides | 3 | Knowledge base entries |
| Notes | 1 | General captures |

**Priority Distribution**:
- HIGH: 5 items (do first)
- MEDIUM: 12 items
- LOW: 8 items
- Unset: 18 items

---

## WINDOWS AMP SKILL CONTENT

Create this file: `C:\Users\jacla\.config\agents\skills\second-brain-dev\SKILL.md`

```markdown
---
name: second-brain-dev
description: Integrates with Second Brain for project context. Shows GitHub issues, TODOs, and file structure.
---

# Second Brain Dev (Windows)

Provides project context from your Second Brain system.

## Data Sources

**Local JSON files** (read directly):
- `C:\Users\jacla\.local\share\second-brain\github.json` - GitHub repos, issues, PRs
- `C:\Users\jacla\.local\share\second-brain\filesystem.json` - Project file trees
- `C:\Users\jacla\.local\share\second-brain\inbox.json` - Tasks and captures
- `C:\Users\jacla\.local\share\second-brain\threads.json` - Amp thread references

## Quick Commands (PowerShell)

**View all active tasks:**
```powershell
Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json | Where-Object { $_.status -ne 'done' } | Select-Object id, category, text, priority
```

**Count items by category:**
```powershell
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$inbox | Group-Object category | Select-Object Name, Count
```

**Search inbox:**
```powershell
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$inbox | Where-Object { $_.text -like "*keyword*" }
```

**Sync from GitHub:**
```powershell
C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1
```

## Workflows

### 1. Start Work Session
1. Sync from GitHub first
2. Read inbox.json for current tasks
3. Pick highest priority item
4. Check threads.json for related Amp context

### 2. Complete a Task
1. Do the work
2. Update inbox.json (set status: "done")
3. Commit and push to GitHub
4. Termux will see the update on next sync

### 3. Hand Off to Termux Amp
1. Write context to threads.json
2. Commit and push
3. Termux Amp will read on next session

## Best Practices

1. **Sync before starting** - Always pull latest from GitHub
2. **Commit after changes** - Push back to keep in sync
3. **Use threads.json** - For Amp-to-Amp communication
4. **Don't overwrite inbox.json** - Merge, don't replace
```

---

## AMP-TO-AMP PROTOCOL

### How Amps Communicate

Use `threads.json` for cross-device Amp coordination:

```json
{
  "handoffs": [
    {
      "id": "handoff-001",
      "from": "termux-amp",
      "to": "windows-amp",
      "threadId": "T-019be81c-dc0c-713a-9933-36ee55047356",
      "task": "Fix Second Brain sync gaps",
      "context": "Created WINDOWS_AMP_CONTEXT.md, need Windows to install skill",
      "status": "pending",
      "createdAt": "2026-01-22T17:30:00Z"
    }
  ],
  "sharedContext": {
    "activeProject": "second-brain",
    "lastTermuxThread": "T-019be81c-dc0c-713a-9933-36ee55047356",
    "lastWindowsThread": null,
    "syncStatus": "termux-ahead"
  }
}
```

### Handoff Workflow

**Termux Amp → Windows Amp:**
1. Termux Amp adds entry to `handoffs` array
2. Sets `to: "windows-amp"`, `status: "pending"`
3. Commits and pushes to GitHub
4. Windows Amp reads on next session
5. Windows Amp sets `status: "in-progress"` or `"done"`

**Windows Amp → Termux Amp:**
1. Same process, reverse direction
2. Termux reads on next `goodbye` or manual sync

### Reading Handoffs

**Windows Amp (PowerShell):**
```powershell
$threads = Get-Content C:\Users\jacla\.local\share\second-brain\threads.json | ConvertFrom-Json
$threads.handoffs | Where-Object { $_.to -eq 'windows-amp' -and $_.status -eq 'pending' }
```

**Termux Amp (Bash):**
```bash
jq '.handoffs[] | select(.to == "termux-amp" and .status == "pending")' ~/.local/share/second-brain/threads.json
```

---

## SYNC BEST PRACTICES

### Before Starting Work

```powershell
# Windows: Pull latest
cd C:\Users\jacla\.local\share\second-brain
git pull origin master

# Or use sync script
C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1
```

### After Making Changes

```powershell
# Windows: Commit and push
cd C:\Users\jacla\.local\share\second-brain
git add -A
git commit -m "Windows Amp: [describe change]"
git push origin master
```

### Conflict Resolution

If both Amps edit `inbox.json`:
1. Git will show merge conflict
2. Keep BOTH changes (merge, don't pick one)
3. Use timestamps to determine latest
4. Items have unique IDs, so duplicates are rare

---

## FILE SCHEMAS

### inbox.json Item Schema

```json
{
  "id": "mklfww4i",
  "text": "finish the gratog landing page by friday",
  "category": "task",
  "priority": "high",
  "status": "active",
  "createdAt": "2026-01-21T10:30:00Z",
  "updatedAt": "2026-01-21T10:30:00Z",
  "source": "termux",
  "tags": ["gratog", "deadline"],
  "dueDate": "2026-01-24"
}
```

### threads.json Schema

```json
{
  "handoffs": [
    {
      "id": "string (unique)",
      "from": "termux-amp | windows-amp",
      "to": "termux-amp | windows-amp",
      "threadId": "T-xxx (Amp thread ID)",
      "task": "Short description",
      "context": "Detailed context for receiving Amp",
      "status": "pending | in-progress | done | cancelled",
      "createdAt": "ISO timestamp",
      "completedAt": "ISO timestamp (optional)"
    }
  ],
  "sharedContext": {
    "activeProject": "string",
    "lastTermuxThread": "T-xxx",
    "lastWindowsThread": "T-xxx",
    "syncStatus": "in-sync | termux-ahead | windows-ahead"
  }
}
```

---

## COMMON TASKS FOR WINDOWS AMP

### 1. Check What Needs Doing

```powershell
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$inbox | Where-Object { $_.status -ne 'done' -and $_.priority -eq 'high' } | Format-Table id, text, category
```

### 2. Mark Task Complete

```powershell
# Read, modify, write back
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$task = $inbox | Where-Object { $_.id -eq 'TARGET_ID' }
$task.status = 'done'
$task.completedAt = (Get-Date).ToString('o')
$inbox | ConvertTo-Json -Depth 10 | Set-Content C:\Users\jacla\.local\share\second-brain\inbox.json
```

### 3. Add New Task

```powershell
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$newTask = @{
    id = [guid]::NewGuid().ToString().Substring(0,8)
    text = "New task from Windows"
    category = "task"
    priority = "medium"
    status = "active"
    createdAt = (Get-Date).ToString('o')
    source = "windows-amp"
}
$inbox += $newTask
$inbox | ConvertTo-Json -Depth 10 | Set-Content C:\Users\jacla\.local\share\second-brain\inbox.json
```

### 4. Check for Handoffs from Termux

```powershell
if (Test-Path C:\Users\jacla\.local\share\second-brain\threads.json) {
    $threads = Get-Content C:\Users\jacla\.local\share\second-brain\threads.json | ConvertFrom-Json
    $pending = $threads.handoffs | Where-Object { $_.to -eq 'windows-amp' -and $_.status -eq 'pending' }
    if ($pending) {
        Write-Host "📥 Pending handoffs from Termux Amp:"
        $pending | Format-Table task, context, createdAt
    }
}
```

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECOND BRAIN ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐                    ┌──────────────────┐
  │   TERMUX AMP     │                    │   WINDOWS AMP    │
  │   (Android)      │                    │   (Laptop)       │
  │                  │                    │                  │
  │ • Primary capture│                    │ • Development    │
  │ • Mobile context │                    │ • Execution      │
  │ • Voice input    │                    │ • Complex tasks  │
  └────────┬─────────┘                    └────────┬─────────┘
           │                                       │
           │ git push                    git pull  │
           │                                       │
           ▼                                       ▼
  ┌────────────────────────────────────────────────────────────┐
  │                        GITHUB                               │
  │                wizelements/second-brain                     │
  │                                                             │
  │  inbox.json │ threads.json │ github.json │ filesystem.json  │
  │                                                             │
  │                   SOURCE OF TRUTH                           │
  └────────────────────────────────────────────────────────────┘
```

---

## IMMEDIATE ACTIONS FOR WINDOWS AMP

### Action 1: Install Skill (Priority: HIGH)

```powershell
# Create skill directory
New-Item -ItemType Directory -Force -Path "C:\Users\jacla\.config\agents\skills\second-brain-dev"

# Create SKILL.md (copy content from WINDOWS AMP SKILL CONTENT section above)
```

### Action 2: Initialize threads.json (Priority: HIGH)

```powershell
$threads = @{
    handoffs = @()
    sharedContext = @{
        activeProject = "second-brain"
        lastTermuxThread = "T-019be81c-dc0c-713a-9933-36ee55047356"
        lastWindowsThread = $null
        syncStatus = "termux-ahead"
    }
}
$threads | ConvertTo-Json -Depth 10 | Set-Content C:\Users\jacla\.local\share\second-brain\threads.json
```

### Action 3: Sync and Verify (Priority: MEDIUM)

```powershell
# Pull latest
cd C:\Users\jacla\.local\share\second-brain
git pull origin master

# Verify data
$inbox = Get-Content inbox.json | ConvertFrom-Json
Write-Host "Items: $($inbox.Count)"
$inbox | Group-Object category | Format-Table Name, Count
```

### Action 4: Report Back (Priority: MEDIUM)

After completing setup, add a handoff for Termux Amp:

```powershell
$threads = Get-Content threads.json | ConvertFrom-Json
$threads.handoffs += @{
    id = "handoff-windows-001"
    from = "windows-amp"
    to = "termux-amp"
    threadId = "T-[your-thread-id]"
    task = "Skill installed, sync verified"
    context = "Windows Amp is now configured. Ready for bidirectional sync."
    status = "pending"
    createdAt = (Get-Date).ToString('o')
}
$threads.sharedContext.syncStatus = "in-sync"
$threads | ConvertTo-Json -Depth 10 | Set-Content threads.json

git add -A
git commit -m "Windows Amp: Initial setup complete"
git push origin master
```

---

## TROUBLESHOOTING

### "File not found" errors

Check paths - Windows uses `C:\Users\jacla\.local\share\second-brain\`

### Sync conflicts

```powershell
git status
git diff
# Resolve conflicts manually, keep both sets of changes
git add -A
git commit -m "Merge conflict resolved"
git push
```

### Stale data

```powershell
cd C:\Users\jacla\.local\share\second-brain
git fetch origin
git reset --hard origin/master
```

### Missing threads.json

Create it (see Action 2 above).

---

## SUMMARY

**Windows Amp should:**
1. ✅ Install the `second-brain-dev` skill
2. ✅ Sync from GitHub before starting work
3. ✅ Use `threads.json` for Amp-to-Amp handoffs
4. ✅ Commit and push after making changes
5. ✅ Check for pending handoffs from Termux

**Termux Amp will:**
1. ✅ Continue as primary capture device
2. ✅ Push updates via `goodbye` command
3. ✅ Check for Windows handoffs on sync
4. ✅ Maintain this documentation

---

**Document maintained by**: Termux Amp  
**Last updated**: 2026-01-22  
**Next review**: After Windows Amp confirms setup
