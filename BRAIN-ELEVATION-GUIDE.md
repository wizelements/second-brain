# Second Brain Elevation Guide

**From scattered notes to unified knowledge system**

---

## What Changed

### Before: Scattered System
- ✗ Tasks in one place
- ✗ Ideas forgotten
- ✗ Thread discussions lost
- ✗ Projects untracked
- ✗ Bug reports scattered
- ✗ Incomplete context

### After: Elevated System
- ✓ Tasks + Gigs + Threads + Projects + Thoughts all unified
- ✓ Nothing forgotten (everything captured with timestamp)
- ✓ Full thread discussions linked to projects
- ✓ All projects tracked with metadata
- ✓ Bugs/ideas captured immediately
- ✓ Complete cross-referencing

---

## The Three New Commands

### 1. `brain-elevate` - Capture Everything

**Purpose**: Capture any thought, thread, project, or discovery

```bash
# Capture Amp threads (discussions/decisions)
brain-elevate thread T-abc123 "Auth Decision" https://amp...

# Capture GitHub issues
brain-elevate github repo/name 42 "Add validation"

# Capture projects (repos, directories)
brain-elevate project ~/projects/apps/gratog

# Capture raw thoughts - MOST IMPORTANT
brain-elevate thought "Consider implementing this pattern"
brain-elevate idea "New feature: offline mode"
brain-elevate bug "Fix race condition in sync"
brain-elevate insight "Response times drop 40% with caching"
brain-elevate discovery "User engagement peaks at 2-4pm"

# Manage relationships
brain-elevate link T-xyz gratog    # Link thread to project
brain-elevate discover             # Auto-discover all projects
brain-elevate sync                 # Sync all sources
brain-elevate dashboard            # Quick overview
```

**Storage**: JSON files in `~/.local/share/second-brain/`
- `threads.json` - Amp thread captures
- `projects.json` - Project metadata
- `captures.json` - GitHub and external items
- `thoughts.json` - Raw ideas, insights, bugs

### 2. `brain-all` - View Everything

**Purpose**: See all your thoughts, tasks, projects, threads in one place

```bash
# Complete overview
brain-all              # Show everything

# By category
brain-all tasks        # Just tasks
brain-all gigs         # Just gigs
brain-all threads      # Just threads
brain-all projects     # Just projects
brain-all thoughts     # Just ideas/bugs/insights
brain-all captures     # GitHub items

# Stats
brain-all stats        # Count by category
```

**Output**: Color-coded, organized by type with counts

### 3. Existing Commands Still Work

```bash
ba "Task text"                     # Add task (existing)
ba "Gig: Client - $5000 - work"   # Add gig (existing)
brain-add "Another task"           # Long form (existing)
```

---

## Real-World Workflows

### Workflow 1: Bug During Development
```bash
# You're coding and notice something wrong
$ brain-elevate bug "Form validation broken on mobile"

# Thought captured with timestamp, won't be forgotten
# Later, convert to ticket or fix it

$ brain-all thoughts
# See all your discovered bugs and ideas
```

### Workflow 2: Thread Discussion
```bash
# You finish discussing authentication approach in Amp thread
$ brain-elevate thread T-def456 "JWT vs Session Decision" https://...
$ brain-elevate link T-def456 gratog

# Now linked to your gratog project
# Decision preserved permanently

$ brain-all threads
# See all recorded discussions
```

### Workflow 3: New Project
```bash
# Starting work on new project
$ brain-elevate project ~/projects/apps/my-app

# Project auto-tracked: name, path, file count, git url, branch
# Shows in brain-all

$ brain-all projects
gratog - 93045 files - main
my-app - 156 files - main
```

### Workflow 4: Weekly Review
```bash
# Check everything at once
$ brain-all

# See: 27 active tasks, 3 gigs ($3050), 4 thoughts, 1 project
# Check what thoughts became tasks/bugs
# Review gig status
# Look for patterns in insights

# Export to Windows for deeper review
$ push-to-windows all all

# Sync to GitHub
$ goodbye
```

### Workflow 5: Searching Across Everything
```bash
# Find all mentions of "caching"
$ grep -r "caching" ~/.local/share/second-brain/*.json

# Find bugs only
$ jq '.[] | select(.category == "bug")' thoughts.json

# Find high-priority tasks
$ jq '.[] | select(.priority == "high")' inbox.json
```

---

## Daily Workflow with Elevation

### Morning
```bash
# Check what you need to do
brain-all tasks          # 27 active tasks
brain-all gigs           # 3 active gigs ($3050)
brain-all projects       # What you're working on
```

### During Work
```bash
# As you code and think
brain-elevate bug "Found issue with X"
brain-elevate idea "Could implement Y"
brain-elevate insight "API bottleneck in search"

# Normal task tracking
ba "Completed feature Z"
ba "Gig: Client - $X - work done"
```

### Weekly
```bash
# Full review
brain-all                    # See everything
brain-all thoughts           # Review ideas/insights
push-to-windows all all      # Export for deeper analysis
goodbye                      # Sync to GitHub
```

---

## What Gets Captured Where

```
Input                          → File              → brain-all command
─────────────────────────────────────────────────────────────────
ba "task text"                 → inbox.json        → brain-all tasks
ba "Gig: Client - $ - work"    → inbox.json        → brain-all gigs
brain-elevate thread T-id ...  → threads.json      → brain-all threads
brain-elevate github ...       → captures.json     → brain-all captures
brain-elevate project path     → projects.json     → brain-all projects
brain-elevate thought/bug/idea → thoughts.json     → brain-all thoughts
```

---

## Data Backup & Sync

### Local Storage
```
~/.local/share/second-brain/
├── inbox.json          # Tasks, gigs, reminders
├── threads.json        # Amp threads
├── projects.json       # Project metadata
├── captures.json       # GitHub issues, etc
├── thoughts.json       # Ideas, bugs, insights
├── github.json         # GitHub sync data
├── filesystem.json     # Project file structures
└── *.md               # Documentation
```

### GitHub Backup
```bash
# All files automatically synced to GitHub
https://github.com/wizelements/second-brain

# Push when needed
goodbye  # Auto-commits and pushes
```

### Windows Export
```bash
# Stage all data for Windows review
push-to-windows all all

# Files staged in ~/.windows-transfer/
# Organized by type: task/, gig/, thought/, etc
```

---

## Why This Matters

### Immediate Benefits
- **Nothing Lost**: Every thought captured with timestamp
- **Always Accessible**: View on Termux, Windows, or GitHub
- **Better Decisions**: Reference past discussions/insights
- **Pattern Recognition**: See what works across projects

### Long-term Benefits
- **Personal Knowledge Base**: Growing record of all thinking
- **Decision Archive**: Remember why you chose something
- **Idea Tracking**: See which ideas became features
- **Performance History**: Track what you've learned

### Example: How It Prevents Loss
```
Before:
- You have an insight about caching
- You forget to write it down
- 2 weeks later, you implement something wrong
- You discover the issue and waste 2 hours

After:
- You have an insight about caching
- You run: brain-elevate insight "API response time improves 40% with caching"
- 2 weeks later, you review thoughts: brain-all thoughts
- You see your insight and implement correctly first time
```

---

## Tips & Tricks

### Quick Capture While Coding
```bash
# Keep a terminal open just for this
# Whenever you notice something:
brain-elevate bug "X broken when Y"

# Takes 2 seconds, won't forget
```

### Batch Discovery
```bash
# Find all projects at once
brain-elevate discover

# Auto-captures: gratog, sd-studio-web, tradealert, etc
```

### Monthly Review
```bash
# See what you thought about each month
jq '.[] | select(.timestamp | startswith("2026-01"))' thoughts.json

# See what became tasks
brain-all tasks | grep "2026-01"
```

### Cross-Reference System
```bash
# Thread mentions a bug?
brain-elevate thread T-abc "Auth broken in v2"

# Create corresponding bug entry
brain-elevate bug "Auth broken in v2"

# Now linked in your system
```

### Export for Discussion
```bash
# Share all thoughts with team
cat ~/.local/share/second-brain/thoughts.json | jq '.[]' | less

# Or push to Windows and open in editor
push-to-windows all all
```

---

## Aliases (Add to ~/.zshrc)

```bash
# Quick access
alias be='brain-elevate'          # brain-elevate → be
alias bah='brain-all'              # brain-all → bah
alias bet='brain-elevate thought'  # Thought capture → bet
alias beb='brain-elevate bug'      # Bug capture → beb
alias bei='brain-elevate idea'     # Idea capture → bei
```

Usage:
```bash
be thread T-abc "Title"  # Shorter
bah                      # Quick overview
bet "My thought"         # Capture thought
beb "Found an issue"     # Capture bug
bei "New feature idea"   # Capture idea
```

---

## Troubleshooting

### Command Not Found
```bash
# Check if installed
which brain-elevate
which brain-all

# If missing:
ls -la ~/bin/brain-elevate
ls -la ~/bin/brain-all

# Make executable
chmod +x ~/bin/brain-elevate
chmod +x ~/bin/brain-all
```

### JSON Errors
```bash
# Validate files
jq . ~/.local/share/second-brain/thoughts.json

# If corrupted, reinitialize
brain-elevate init
```

### Nothing Showing
```bash
# Check files exist
ls -la ~/.local/share/second-brain/

# Verify with dashboard
brain-elevate dashboard

# Manually check
jq 'length' ~/.local/share/second-brain/thoughts.json
```

### Sync Issues
```bash
# Manual sync all sources
brain-elevate sync

# Push to GitHub
cd ~/.local/share/second-brain
git status
git push origin master
```

---

## Architecture Summary

```
Inputs (5 types)
    ↓
Capture Commands (brain-elevate, ba)
    ↓
JSON Storage (5 files)
    ↓
Unified Views (brain-all)
    ↓
Sync & Export (GitHub, Windows)
    ↓
Permanent Record
```

**Result**: Complete thought capture system where nothing is forgotten.

---

## Start Today

```bash
# 1. Understand the system
brain-all                         # See current state

# 2. Try capturing different types
brain-elevate idea "New feature"
brain-elevate bug "Found issue"
brain-elevate thought "General thought"

# 3. View what you captured
brain-all thoughts

# 4. See everything together
brain-all

# 5. Add to workflow
# During work: brain-elevate bug "..."
# Daily: brain-all
# Weekly: brain-all + push-to-windows + goodbye

# 6. Set up aliases
# Add to ~/.zshrc:
# alias be='brain-elevate'
# alias bah='brain-all'
```

---

## Philosophy

**Nothing gets forgotten. Everything connects.**

Every thought you have, every bug you find, every decision you make - it's all preserved, searchable, and connected to your projects and discussions.

This is your personal knowledge system. It grows as you do.

---

**Status**: ✓ Ready to use  
**Commands**: `brain-elevate`, `brain-all`, `ba`  
**Location**: `~/.local/share/second-brain/`  
**Backup**: GitHub, Windows, Local  
**Philosophy**: Capture everything, forget nothing
