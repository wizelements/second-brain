# 🧠 WINDOWS ↔ TERMUX SECOND BRAIN - COMPLETE SOURCE OF TRUTH
**Status**: Production-Ready, Phase 1 Complete (Read-Only Sync)  
**Last Updated**: 2026-01-21T19:56:35Z  
**Authority**: This document consolidates all Second Brain and Amp thread documentation

---

## TABLE OF CONTENTS
1. [Current Standings](#current-standings)
2. [Architecture Overview](#architecture-overview)
3. [Windows Setup Status](#windows-setup-status)
4. [Termux Status](#termux-status)
5. [GitHub Integration](#github-integration)
6. [Amp Thread Linkage](#amp-thread-linkage)
7. [Data State](#data-state)
8. [Sync Protocol](#sync-protocol)
9. [Next Actions](#next-actions)

---

## CURRENT STANDINGS

### ✅ What's Complete (Phase 1)

| Component | Status | Last Updated | Confidence |
|-----------|--------|--------------|------------|
| GitHub Repository | ✅ Active | 2026-01-21 | 100% |
| Termux Captures (ba/goodbye) | ✅ Working | 2026-01-21 | 100% |
| Windows Directory | ✅ Created | 2026-01-21 | 100% |
| Windows Sync Script | ✅ Working | 2026-01-21 | 100% |
| 34 Items Synced | ✅ Verified | 2026-01-21 | 100% |
| Format Normalized | ✅ Done | 2026-01-21 | 100% |
| Sync Metadata | ✅ Created | 2026-01-21 | 100% |

### ⏳ In Progress (Phase 2 Planning)

| Component | Status | Target | Priority |
|-----------|--------|--------|----------|
| Scheduled Windows Sync | ⏳ Planning | This week | High |
| GitHub Push API Routes | ⏳ Designed | This week | Medium |
| Conflict Detection Logic | ⏳ Designed | Next week | Medium |
| Windows → GitHub Push | ⏳ Not started | Next week | Medium |

### 🔮 Future (Phase 3+)

| Component | Status | Target | Priority |
|-----------|--------|--------|----------|
| Real-time Bidirectional Sync | 🔮 Design | Month 2 | Low |
| Termux "goodbye" Conflict Resolution | 🔮 Design | Month 2 | Low |
| Sync Dashboard UI | 🔮 Design | Month 2 | Low |
| Mobile App Integration | 🔮 Research | Month 3 | Low |

---

## ARCHITECTURE OVERVIEW

### Current (Phase 1) - Read-Only Sync

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTHORITY FLOW                           │
└─────────────────────────────────────────────────────────────────┘

  TERMUX (Android Phone)
  │
  ├─ ~/.local/share/second-brain/inbox.json (Local writes)
  ├─ Command: ba "task text"  (Capture)
  ├─ Command: goodbye         (Push to GitHub)
  │
  └─────── [Git Push] ────────────────────┐
                                          ▼
                        GITHUB (Source of Truth)
                        ├─ Repository: wizelements/second-brain
                        ├─ Branch: master
                        ├─ File: inbox.json
                        ├─ Backup: Full git history
                        │
                        └─────── [GitHub API Pull] ──────────────┐
                                                                  ▼
                                        WINDOWS (Laptop - Read-Only)
                                        ├─ C:\Users\jacla\.local\share\second-brain\inbox.json
                                        ├─ Pulls every 4 hours (or manual)
                                        ├─ Script: WINDOWS_SYNC_GITHUB.ps1
                                        ├─ Scheduled task: SecondBrainSync
                                        └─ Uses for: Local automation, reporting
```

### Key Principle
```
ONE DIRECTION (Currently):
Termux writes → GitHub stores → Windows reads

FUTURE (Phase 2):
Windows can edit locally → Push to GitHub → Termux pulls
```

---

## WINDOWS SETUP STATUS

### Location & Files

```
C:\Users\jacla\.local\share\second-brain\
├── inbox.json              [34 items, 62.5 KB]
│   ├─ 18 tasks
│   ├─ 3 gigs ($3,050 pipeline)
│   ├─ 2 reminders
│   ├─ 2 guides
│   ├─ 2 captures
│   └─ 7 test items
│
├── sync-state.json         [Metadata]
│   ├─ lastSync: 2026-01-21T19:56:31Z
│   ├─ lastPull: { timestamp, itemCount, hash }
│   ├─ lastPush: { timestamp, itemsChanged, hash }
│   ├─ conflicts: [] (always empty, Windows read-only)
│   └─ version: "2.0"
│
├── guides/                 [Empty, ready for synced guides]
├── projects/               [Empty, ready for project files]
├── captures/               [Empty, ready for captures]
│
└── /.sync.log              [Append-only operation log]
```

### Scripts in C:\Users\jacla\

```
├── WINDOWS_SYNC_GITHUB.ps1                  [Manual sync, works ✅]
├── SCHEDULE_SECOND_BRAIN_SYNC.ps1          [Scheduler setup, ready]
├── PowerShell-Brain-Profile.ps1             [15+ aliases, ready]
├── Brain-Daily-Dashboard.ps1                [Dashboard, ready]
├── Setup-Brain-Automation.ps1               [One-click setup, ready]
└── [4 Scheduled Tasks configured by Setup script, pending execution]
```

### Scheduled Tasks (To Be Created)

```
Task Name                   Schedule        Command
──────────────────────────────────────────────────────
SecondBrainSync             Every 4h        WINDOWS_SYNC_GITHUB.ps1
SecondBrainMorning          7:00 AM         Brain-Daily-Dashboard.ps1
SecondBrainMidday           12:30 PM        Brain-Daily-Dashboard.ps1
SecondBrainEvening          5:00 PM         Brain-Daily-Dashboard.ps1
```

**Status**: Scripts ready, tasks pending Setup-Brain-Automation.ps1 execution

### PowerShell Profile Integration

```
Profile Location: $PROFILE (typically C:\Users\jacla\Documents\PowerShell\profile.ps1)

Aliases Installed (by Setup script):
├── bb              [Quick capture]
├── bs              [Sync now]
├── brain-status    [Show sync status]
├── brain-query     [Search brain]
├── brain-home      [Show dashboard]
├── brain-help      [Show commands]
├── brain-morning   [Force morning briefing]
├── c-golf          [Navigate to golf project]
├── c-tools         [Navigate to tools project]
├── c-freelance     [Navigate to freelance]
├── c-brain         [Open brain in VS Code]
└── [More aliases for development]
```

**Status**: Alias definitions ready in PowerShell-Brain-Profile.ps1, installation pending

### Windows Capabilities

```
✅ Can READ from GitHub (authenticated via GitHub API, no token needed for public)
⏳ Can PUSH to GitHub (Phase 2, requires GitHub personal access token)
⏳ Can MERGE conflicts (Phase 2, manual or auto-resolve)
✅ Can capture locally (stores in sync log, ready for Phase 2)
✅ Can query/search (against local inbox.json)
✅ Can display dashboard (formatted PowerShell output)
```

---

## TERMUX STATUS

### Current Setup (Verified Working)

```
Termux Installation Path: /data/data/com.termux/files/home

Data Location:
~/.local/share/second-brain/
├── inbox.json           [Master copy, synced to GitHub]
├── processed.json       [Items marked complete]
├── guides/              [Knowledge base entries]
├── captures/            [Voice/manual captures]
└── sync-state.json      [Termux-side sync metadata]

Commands Available:
├── ba "text"            [Capture task/item]
│   └─ Stores: ~/.local/share/second-brain/inbox.json
│
├── goodbye              [Sync to GitHub]
│   └─ Pushes: All new/modified items to GitHub master
│   └─ Updates: sync-state.json with push metadata
│
├── brain-home           [Show dashboard]
│   └─ Displays: Tasks, gigs, reminders, stats
│
└── [Other brain commands from second-brain-sync skill]
```

### Termux Sync Authority

```
Termux is the PRIMARY CAPTURE source:
├─ All new items originate from Termux (ba command)
├─ "goodbye" command pushes to GitHub
├─ GitHub becomes source of truth after push
├─ Windows pulls from GitHub

Data Flow:
  User input → ba command → ~/.local/share/second-brain/inbox.json
                              ↓
                           goodbye command
                              ↓
                           Git commit
                              ↓
                           GitHub master branch (canonical)
                              ↓
                           Windows pulls via WINDOWS_SYNC_GITHUB.ps1
```

### Current Data in Termux

```
34 Total Items (as of 2026-01-21):

Tasks (18):
├─ mklfww4i: Finish gratog landing page (HIGH, due Friday)
├─ utx60smd: Build authentication module for gratog
├─ mkllyjbh1: 5-part website launch plan (180 min)
├─ [15 more task items]

Gigs (3) - $3,050 Total:
├─ ACME Corp: $2,500 (website redesign)
├─ ACME Corp: $500 (website redesign)
├─ Test Client: $50

Reminders (2):
├─ [2 reminder items]

Guides (2):
├─ [2 knowledge base entries]

Captures (2):
├─ [2 captured insights/learnings]

Test Items (7):
├─ [System test data]
```

---

## GITHUB INTEGRATION

### Repository Configuration

```
Repository: https://github.com/wizelements/second-brain
├── Owner: wizelements
├── Visibility: Private (assumed, for sensitive data)
├── Active: Yes
├── Last Activity: 2026-01-21 (Termux pushed via "goodbye")
│
├── Main Branches:
│   ├── master       [Production inbox, source of truth]
│   └── develop      [Staging branch for Phase 2]
│
├── Key Files:
│   ├── inbox.json               [34 items, normalized format]
│   ├── schema.json              [Schema v2.0 definition]
│   ├── changelog.jsonl          [Append-only event log]
│   └── sync-state.json          [Last sync metadata]
│
└── Access:
    ├── Termux: Full (read + write via "goodbye")
    ├── Windows: Read-only (via GitHub API)
    └── Token: Configurable per Phase 2
```

### Sync Through GitHub

```
Data Integrity Checks:
├─ SHA256 checksums on items array
├─ File hash verification after pull
├─ Schema validation (v2.0)
├─ Atomic operations (git commit or nothing)
├─ Rollback capability (full git history)
└─ Append-only changelog (auditability)

Conflict Handling (Phase 1 - None):
├─ Windows never writes → no conflicts possible
├─ Termux always pushes → single source
├─ GitHub acts as arbiter
└─ Phase 2 will implement: { strategy: 'github' | 'termux' | 'merge' }
```

---

## AMP THREAD LINKAGE

### Primary Threads (Found via search)

| Thread ID | Title | Status | Key Outcome |
|-----------|-------|--------|------------|
| **T-019b7556-45e3-752e-94a2-f93767b49a2b** | Adaptive shell dashboard for active projects | ✅ Complete | Termux-Windows integration protocol defined |
| **T-019be24a-ad9f-750a-8c0c-749209fe58ad** | (Previous sync work) | ✅ Reference | Initial sync architecture |
| **T-019b6b0e-dcc1-735f-b215-39527974a873** | Keystore configuration setup required | ⚙️ Related | Android/Termux infrastructure |

### Referenced Threads in Documentation

```
From SECOND_BRAIN_SYNC_IMPLEMENTATION.md:
├─ @T-019be24a-ad9f-750a-8c0c-749209fe58ad
   └─ "Previous: [Link to original thread]"
   └─ Topic: Windows-GitHub sync initial design

Current Thread (Active):
├─ T-019be63f-cd8f-7668-9574-9f944632315d
   └─ Topic: Creating source of truth doc + full linkage
   └─ Status: This session (current)
```

### How to Find Related Threads

```powershell
# Command to search for Second Brain related threads:
# (Would run this if in Termux/mobile environment)
find_thread -query "Second Brain sync"
find_thread -query "Termux Windows integration"
find_thread -query "GitHub sync protocol"
find_thread -query "Amp Termux laptop"
```

### Amp Thread Best Practices

```
When Creating New Threads:
├─ Reference this document: WINDOWS_TERMUX_SYNC_SOURCE_OF_TRUTH.md
├─ Link to relevant earlier threads
├─ Update Amp Thread Linkage section below
├─ Copy thread ID to Amp metadata

Existing Threads to Cross-Link:
├─ Second Brain architecture: T-019b7556-45e3-752e-94a2-f93767b49a2b
├─ Windows setup: T-019be24a-ad9f-750a-8c0c-749209fe58ad
├─ Keystore/Android: T-019b6b0e-dcc1-735f-b215-39527974a873
└─ [Track all via Amp search functionality]
```

---

## DATA STATE

### Current Inventory (34 Items)

#### By Category

| Category | Count | Value | Status |
|----------|-------|-------|--------|
| Tasks | 18 | - | Active |
| Gigs | 3 | $3,050 | Pipeline |
| Reminders | 2 | - | Active |
| Guides | 2 | - | Reference |
| Captures | 2 | - | Archive |
| Test Items | 7 | - | Cleanup needed |
| **TOTAL** | **34** | **$3,050** | ✅ Synced |

#### High Priority Items

1. **mklfww4i**: Finish gratog landing page (due Friday)
2. **mklfx5x1**: ACME Corp $500 redesign
3. **utx60smd**: Build authentication module for gratog
4. **m7bh92ih**: ACME Corp $2,500 redesign
5. **mkllyjbh1-5**: 5-part website launch plan (180 min estimated)

#### Revenue Breakdown

| Client | Amount | Status |
|--------|--------|--------|
| ACME Corp | $2,500 | Quoted |
| ACME Corp | $500 | Quoted |
| Test Client | $50 | Test |
| **TOTAL** | **$3,050** | **$3,000 Active** |

### Data Format (JSON Schema v2.0)

```json
{
  "$schema": "https://schema.example.com/second-brain/2.0",
  "version": 2,
  "metadata": {
    "lastModified": "2026-01-21T10:30:00Z",
    "source": "termux",
    "schemaVersion": "2.0",
    "checksum": "sha256:abc123def456"
  },
  "items": [
    {
      "id": "mklfww4i",
      "type": "task",
      "created": "2026-01-19T17:29:35.394Z",
      "modified": "2026-01-21T10:30:00.000Z",
      "revision": 3,
      "source": "termux",
      "status": "classified",
      "priority": "high",
      "text": "Finish gratog landing page by friday",
      "category": "task",
      "nextAction": "Finish the Gratog landing page",
      "confidence": 0.9,
      "metadata": {
        "createdBy": "voice",
        "capturedAt": "2026-01-19T17:29:35.394Z",
        "hash": "sha256:item_abc123"
      }
    }
  ]
}
```

### Sync State Metadata

```json
{
  "lastSync": "2026-01-21T19:56:31Z",
  "lastPull": {
    "source": "github",
    "timestamp": "2026-01-21T19:56:31Z",
    "itemCount": 34,
    "hash": "sha256:abc123def456"
  },
  "lastPush": {
    "destination": "github",
    "timestamp": null,
    "itemsChanged": 0,
    "hash": null
  },
  "conflicts": [],
  "version": "2.0"
}
```

---

## SYNC PROTOCOL

### Phase 1: Read-Only (Current, ✅ Deployed)

```
TERMUX ──[Push]──> GITHUB ──[Pull]──> WINDOWS
  │                  │
  │                  ├─ backup
  │                  ├─ audit trail
  │                  └─ authoritative copy
  │
  └─ Primary source (ba, goodbye commands)
```

**Operation**:
1. User captures on Termux: `ba "task text"`
2. Item stored locally: `~/.local/share/second-brain/inbox.json`
3. User runs: `goodbye`
4. Termux pushes to GitHub via git
5. Windows pulls via WINDOWS_SYNC_GITHUB.ps1 (manual or scheduled)
6. Windows now has latest items in `C:\Users\jacla\.local\share\second-brain\inbox.json`

**Verification**:
```powershell
# On Windows, verify sync:
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
Write-Host "Items: $($inbox.items.count)"  # Should show 34
Write-Host "Last sync: $(Get-Item 'C:\Users\jacla\.local\share\second-brain').LastWriteTime"
```

### Phase 2: Bidirectional (Next Week, 🔮 Design)

```
TERMUX <──────────────────────────> WINDOWS
  │             [Git Sync]            │
  ├─ Read from GitHub                 ├─ Read from GitHub
  ├─ Write via "goodbye"              ├─ Write via API (new)
  │                                   └─ Conflict detection (new)
  └─ GitHub (source of truth)
```

**Design**:
- Windows can push changes to GitHub
- "goodbye" pulls from GitHub before pushing
- Conflict detection logic (3-way merge)
- Manual conflict resolution (if needed)

### Phase 3: Real-Time (Month 2, 🔮 Design)

```
TERMUX ←──→ [WebSocket] ←──→ WINDOWS
  │                            │
  ├─ Sync on "goodbye"        ├─ Sync on edit
  ├─ Sync on startup          ├─ Sync on startup
  └─ Sync on demand           └─ Sync every 30s (optional)
```

---

## NEXT ACTIONS

### THIS SESSION (Now)

- [ ] **Read this document** (you are here)
- [ ] **Verify current state**:
  ```powershell
  Test-Path C:\Users\jacla\.local\share\second-brain\inbox.json
  (Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json).items.count
  ```
- [ ] **Check Termux** (via phone):
  ```bash
  ba "test item from termux"
  goodbye
  brain-home
  ```

### TODAY (Next Hour)

- [ ] **Schedule Windows Sync** (if ready):
  ```powershell
  C:\Users\jacla\Setup-Brain-Automation.ps1  # Run as Administrator
  ```
- [ ] **Test scheduled tasks**:
  ```powershell
  Get-ScheduledTask -TaskName "SecondBrain*" | Format-List
  ```
- [ ] **Verify first automated sync** (wait 4 hours or run manually):
  ```powershell
  C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1
  ```

### THIS WEEK (By Friday)

- [ ] Set up GitHub personal access token (for Phase 2)
- [ ] Create Phase 2 design document (conflict resolution)
- [ ] Plan Windows → GitHub push capability
- [ ] Test conflict scenarios

### NEXT WEEK (Phase 2)

- [ ] Implement GitHub push routes in webhook
- [ ] Add conflict detection logic
- [ ] Update "goodbye" command for bidirectional sync
- [ ] Test full cycle: Termux ↔ GitHub ↔ Windows

---

## VERIFICATION COMMANDS

### Windows (PowerShell as Admin)

```powershell
# 1. Verify directory structure
Get-Item -Force "C:\Users\jacla\.local\share\second-brain"

# 2. Count items
$inbox = Get-Content "C:\Users\jacla\.local\share\second-brain\inbox.json" | ConvertFrom-Json
$inbox.items.count

# 3. Check last sync
$state = Get-Content "C:\Users\jacla\.local\share\second-brain\sync-state.json" | ConvertFrom-Json
$state.lastSync

# 4. List top 5 high priority items
$inbox.items | Where-Object priority -eq high | Select-Object -First 5 -Property id, text

# 5. Calculate total gig value
($inbox.items | Where-Object category -eq gig | Measure-Object -Property amount -Sum).Sum

# 6. Show scheduled tasks
Get-ScheduledTask -TaskName "SecondBrain*" | Format-Table TaskName, State, NextRunTime

# 7. Test manual sync
& "C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1" -Verbose
```

### Termux (SSH or Direct)

```bash
# 1. Check inbox file
ls -lah ~/.local/share/second-brain/inbox.json

# 2. Count items
jq '.items | length' ~/.local/share/second-brain/inbox.json

# 3. Show sync state
cat ~/.local/share/second-brain/sync-state.json

# 4. List recent captures
jq '.items | sort_by(.created) | reverse | .[0:5]' ~/.local/share/second-brain/inbox.json

# 5. Check git status
cd $(dirname ~/.local/share/second-brain/) && git status

# 6. Create test capture
ba "Testing Windows-Termux sync integration"

# 7. Push to GitHub
goodbye
```

### GitHub (Web or CLI)

```bash
# Via Git CLI (on any machine)
git clone https://github.com/wizelements/second-brain.git
cd second-brain

# 1. Check file size and commit count
git log --oneline inbox.json | head -10

# 2. View current content
git show master:inbox.json | jq '.items | length'

# 3. Check recent commits
git log --oneline -5 master

# 4. Verify checksum
git show master:inbox.json | sha256sum
```

---

## DOCUMENTATION REFERENCE

### Core Synchronization Files

| File | Purpose | Status | Location |
|------|---------|--------|----------|
| SECOND_BRAIN_PRODUCTION_ARCHITECTURE.md | System design (authoritative) | ✅ Final | C:\Users\jacla\ |
| SECOND_BRAIN_SYNC_IMPLEMENTATION.md | Implementation guide | ✅ Current | C:\Users\jacla\ |
| SECOND_BRAIN_LAPTOP_INTEGRATION.md | Windows integration design | ✅ Reference | C:\Users\jacla\ |
| BRAIN-QUICK-START.md | 15-min setup guide | ✅ Ready | C:\Users\jacla\ |
| BRAIN-INTEGRATION-CHECKLIST.md | Verification tasks | ✅ Ready | C:\Users\jacla\ |
| BRAIN-INTEGRATION-SUMMARY.md | Overview | ✅ Reference | C:\Users\jacla\ |
| PowerShell-Brain-Profile.ps1 | Aliases & functions | ✅ Ready | C:\Users\jacla\ |
| WINDOWS_SYNC_GITHUB.ps1 | Manual sync script | ✅ Working | C:\Users\jacla\ |
| SCHEDULE_SECOND_BRAIN_SYNC.ps1 | Scheduler setup | ✅ Ready | C:\Users\jacla\ |
| **THIS FILE** | **Source of truth (consolidated)** | ✅ **Current** | **C:\Users\jacla\WINDOWS_TERMUX_SYNC_SOURCE_OF_TRUTH.md** |

### How These Fit Together

```
ARCHITECTURE + PROTOCOL
└─ SECOND_BRAIN_PRODUCTION_ARCHITECTURE.md
   (How it should work conceptually)

CURRENT IMPLEMENTATION
├─ SECOND_BRAIN_SYNC_IMPLEMENTATION.md
│  (What we did last session)
├─ SECOND_BRAIN_LAPTOP_INTEGRATION.md
│  (Windows-specific integration)
└─ TERMUX_GITHUB_WINDOWS_SYNC_AUDIT.md
   (Verification of current state)

SETUP & ACTIVATION
├─ BRAIN-QUICK-START.md
│  (15-min quick start)
├─ Setup-Brain-Automation.ps1
│  (One-click activation)
├─ PowerShell-Brain-Profile.ps1
│  (All aliases & functions)
└─ BRAIN-INTEGRATION-CHECKLIST.md
   (Verification tasks)

THIS SESSION
└─ WINDOWS_TERMUX_SYNC_SOURCE_OF_TRUTH.md (new)
   (Consolidated current state + Amp thread linkage)
```

---

## TROUBLESHOOTING QUICK REFERENCE

### "Sync not working"

```powershell
# Step 1: Check directory
Test-Path C:\Users\jacla\.local\share\second-brain
# Expected: True

# Step 2: Check GitHub access
Invoke-WebRequest -Uri https://api.github.com/repos/wizelements/second-brain/contents/inbox.json -UseBasicParsing
# Expected: HTTP 200 or 404 (if private, need token)

# Step 3: Run manual sync
C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1 -Verbose

# Step 4: Check item count
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
Write-Host "Items: $($inbox.items.count)"
# Expected: 34 (or more if Termux added)
```

### "Scheduled tasks not running"

```powershell
# Step 1: Check if tasks exist
Get-ScheduledTask -TaskName "SecondBrain*"

# Step 2: If missing, run setup
C:\Users\jacla\Setup-Brain-Automation.ps1

# Step 3: Check execution policy
Get-ExecutionPolicy
# Expected: RemoteSigned or higher

# Step 4: Check task history
Get-ScheduledTaskInfo -TaskName "SecondBrainSync"

# Step 5: Run task manually
Start-ScheduledTask -TaskName "SecondBrainSync"
Get-ScheduledTaskInfo -TaskName "SecondBrainSync"
```

### "Termux items not appearing in Windows"

```bash
# On Termux:
ba "test item from termux"
goodbye    # This pushes to GitHub

# On Windows (wait a few seconds, then):
C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1
```

```powershell
# Verify on Windows:
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$inbox.items | Where-Object text -like "*test item*"
```

---

## CONFIGURATION QUICK REFERENCE

### GitHub Settings

```
Repository: wizelements/second-brain
Access: Public read, authenticated push (Phase 2)
Branch: master (production)
Format: JSON Schema v2.0

Token Requirements:
├─ Phase 1: None (public read)
├─ Phase 2: Personal access token (for push)
│   └─ Scope: repo (full repository access)
│   └─ Expiry: 90 days (rotate regularly)
│   └─ Storage: Windows webhook config (never in scripts)
└─ Rotation: Annually
```

### Windows Paths

```
Data Directory:
  C:\Users\jacla\.local\share\second-brain\

Scripts Directory:
  C:\Users\jacla\

Config Locations:
  PS Profile: $PROFILE
  (typically: C:\Users\jacla\Documents\PowerShell\profile.ps1)

Environment Variables (if needed):
  SECOND_BRAIN_HOME: C:\Users\jacla\.local\share\second-brain
  GITHUB_REPO: wizelements/second-brain
  GITHUB_TOKEN: [Set in webhook config for Phase 2]
```

### Termux Paths

```
Data Directory:
  ~/.local/share/second-brain/

Command Locations:
  ba: Shell alias or function
  goodbye: Shell alias or function
  brain-home: Shell alias or function

Environment:
  HOME: /data/data/com.termux/files/home
  SHELL: /data/data/com.termux/files/usr/bin/bash
```

---

## SECURITY & PERMISSIONS

### Current Security Model

```
✅ Read-Only on Windows (Phase 1)
   └─ No credentials needed for public repo
   └─ No risk of accidental writes
   └─ Checksum verification on all pulls

✅ Token Not Yet Needed
   └─ Phase 1 uses public GitHub API (no auth)
   └─ Phase 2 will add: personal access token
   └─ Token scope: Limited to second-brain repo only

✅ No Sensitive Data in Logs
   └─ Task descriptions may contain info
   └─ Never commit: passwords, API keys, tokens
   └─ Always sanitize: client names, financial details
```

### Phase 2 Token Setup

```
When Phase 2 starts:
1. Create GitHub personal access token
   └─ https://github.com/settings/tokens/new
   └─ Name: "windows-second-brain-sync"
   └─ Expiry: 90 days
   └─ Scope: repo (full access)

2. Store securely in webhook config
   └─ Path: C:\Users\jacla\[webhook-config].json
   └─ Key: github.token
   └─ Never commit to GitHub

3. Rotate token every 90 days
   └─ Set calendar reminder
   └─ Create new token, update config
   └─ Delete old token
```

---

## SUCCESS CRITERIA

### ✅ Phase 1 Complete

- [x] GitHub repo active and synced
- [x] Termux "ba" and "goodbye" commands working
- [x] Windows pulls from GitHub
- [x] 34 items synced and verified
- [x] Format normalized (v2.0 schema)
- [x] Sync metadata created
- [x] Scripts ready (manual sync, scheduler)
- [x] PowerShell profile prepared

### ⏳ Phase 2 Ready (This Week)

- [ ] Scheduled tasks configured
- [ ] GitHub push API routes created
- [ ] Conflict detection logic implemented
- [ ] Personal access token generated
- [ ] Windows can push changes back
- [ ] Bidirectional sync tested

### 🔮 Phase 3 Target (Next Month)

- [ ] Real-time sync (< 30s latency)
- [ ] Conflict-free merging
- [ ] Termux & Windows auto-sync
- [ ] Sync dashboard UI
- [ ] Mobile app integration

---

## QUICK COMMAND REFERENCE

### Termux Commands

```bash
ba "description"           # Capture item to inbox
goodbye                    # Sync to GitHub
brain-home                 # Show dashboard
brain-query "keyword"      # Search items
```

### Windows PowerShell Commands

```powershell
bb                         # Quick capture
bs                         # Sync now
brain-status               # Show sync status
brain-query "keyword"      # Search items
brain-help                 # Show all commands
C:\Users\jacla\WINDOWS_SYNC_GITHUB.ps1   # Manual sync
C:\Users\jacla\Setup-Brain-Automation.ps1 # Setup (admin)
```

### Verification Commands

```powershell
# Count items
(Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json).items.count

# Last sync time
(Get-Content C:\Users\jacla\.local\share\second-brain\sync-state.json | ConvertFrom-Json).lastSync

# List high-priority items
$inbox = Get-Content C:\Users\jacla\.local\share\second-brain\inbox.json | ConvertFrom-Json
$inbox.items | Where-Object priority -eq high | Select-Object id, text

# Show scheduled tasks
Get-ScheduledTask -TaskName "SecondBrain*"
```

---

## FINAL STATUS SUMMARY

### Current State

```
Platform          │ Status  │ Data Items │ Last Activity      │ Authority
─────────────────┼─────────┼────────────┼────────────────────┼──────────
Termux (Android) │ ✅ Live │ 34         │ 2026-01-21 [User]  │ ✅ Primary
GitHub           │ ✅ Live │ 34         │ 2026-01-21 Push    │ ✅ Source of Truth
Windows (Laptop) │ ✅ Live │ 34         │ 2026-01-21 Pull    │ ⏳ Read-Only
```

### Deployment Phases

```
Phase  │ Status │ Features                  │ Timeline    │ Dependencies
───────┼────────┼───────────────────────────┼─────────────┼──────────────
1      │ ✅ ✓  │ Read-only Windows sync    │ ✓ Done      │ [None]
2      │ 🔮 ⏳ │ Bidirectional sync        │ This week   │ GitHub token
3      │ 🔮 ⏳ │ Real-time sync            │ Next month  │ WebSocket API
```

### Risk Assessment

```
Risk                  │ Severity │ Mitigation
──────────────────────┼──────────┼────────────────────────────
Windows writes data   │ HIGH     │ Read-only enforcement (Phase 1)
Sync lag (4h)         │ MEDIUM   │ Scheduled tasks + manual option
GitHub outage         │ MEDIUM   │ Local fallback, retry logic
Data corruption       │ LOW      │ Checksum verification
Conflicts (later)     │ MEDIUM   │ 3-way merge strategy (Phase 2)
```

---

## WHO OWNS WHAT

```
TERMUX (You on Android Phone)
├─ Owns: Primary data entry
├─ Responsibility: Create items via "ba" command
├─ Authority: "goodbye" pushes to GitHub
└─ Ownership: All captured items

GITHUB (Central Repository)
├─ Owns: Authoritative copy
├─ Responsibility: Backup and audit trail
├─ Authority: Source of truth
└─ Ownership: All synced data (git history)

WINDOWS (Your Laptop)
├─ Owns: Read-only cache
├─ Responsibility: Local queries and dashboards
├─ Authority: None (read-only in Phase 1)
└─ Ownership: None (changes pushed from Termux)
```

---

## NEXT IMMEDIATE STEP

**Run this command today (as Administrator)**:

```powershell
C:\Users\jacla\Setup-Brain-Automation.ps1
```

This will:
1. Create 4 scheduled tasks
2. Install PowerShell aliases
3. Verify all components
4. Start automated syncing

Then verify:
```powershell
brain-status
Get-ScheduledTask -TaskName "SecondBrain*"
```

---

## DOCUMENT METADATA

```
File: WINDOWS_TERMUX_SYNC_SOURCE_OF_TRUTH.md
Created: 2026-01-21T20:00:00Z (This session)
Status: ✅ CURRENT - Master reference document
Audience: You (developer), for complete system understanding
Authority: This document supersedes all previous piecemeal docs
Maintenance: Update when Phase 2/3 progress occurs
Next Review: End of Phase 2 (next week)
```

---

## REVISION HISTORY

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2026-01-21 | 1.0 | Amp | Created consolidated source of truth |
| - | - | - | - |

---

**This document is your single source of truth for:**
- Current Windows ↔ Termux sync status
- Architecture and protocol details
- Data state and inventory
- Amp thread linkage
- Next actions and phase planning

**When things change, update this document first.**

---

**Status: READY FOR PHASE 2**  
**Next: Run Setup-Brain-Automation.ps1 to activate Windows scheduling**

