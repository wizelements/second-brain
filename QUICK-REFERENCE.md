# Second Brain Elevation - Quick Reference

**Nothing Gets Forgotten. Everything Connects.**

---

## Three Commands

### `brain-elevate` - Capture
```bash
brain-elevate thread T-id "Title"          # Amp threads
brain-elevate github repo num "Title"      # GitHub issues
brain-elevate project ~/path              # Code projects
brain-elevate thought "Text"               # Ideas
brain-elevate bug "Issue"                  # Bugs
brain-elevate insight "Discovery"          # Insights
brain-elevate idea "Idea"                  # Ideas
brain-elevate discover                     # Auto-discover projects
brain-elevate sync                         # Sync all sources
brain-elevate link T-id project            # Cross-reference
brain-elevate dashboard                    # Quick stats
```

### `brain-all` - View
```bash
brain-all              # Everything
brain-all tasks        # Tasks only
brain-all gigs         # Gigs only
brain-all thoughts     # Thoughts/ideas/bugs
brain-all threads      # Threads
brain-all projects     # Projects
brain-all captures     # GitHub
brain-all stats        # Counts
```

### Existing Commands (Still Work)
```bash
ba "Task"              # Quick add task
ba "Gig: Client - $X"  # Quick add gig
brain-add "Task"       # Long form
```

---

## Daily Workflow

**Morning**
```bash
brain-all tasks     # What to do?
brain-all gigs      # Gig status
```

**During Work**
```bash
brain-elevate bug "Found issue"
brain-elevate idea "New feature"
ba "Task done"
```

**Weekly**
```bash
brain-all                 # Review everything
brain-all thoughts        # Review ideas/insights
push-to-windows all all   # Export
goodbye                   # Sync
```

---

## Files

```
~/.local/share/second-brain/
├── inbox.json       - Tasks/gigs (27 tasks, 3 gigs)
├── threads.json     - Amp threads
├── projects.json    - Project metadata (1 project)
├── captures.json    - GitHub issues
├── thoughts.json    - Ideas/bugs/insights (4 items)
└── *.md            - Documentation
```

---

## Aliases (Add to ~/.zshrc)

```bash
alias be='brain-elevate'       # brain-elevate
alias bah='brain-all'          # brain-all
alias bet='brain-elevate thought'
alias beb='brain-elevate bug'
```

---

## Current State

- Tasks: 27 active
- Gigs: 3 ($3050)
- Projects: 1
- Thoughts: 4
- Threads: 0 (ready)
- GitHub: 0 (ready)

---

## Philosophy

**Before**: Scattered notes, forgotten ideas, lost discussions  
**After**: Unified capture system, everything connected, nothing forgotten

---

## Get Started

```bash
# Try it
brain-elevate idea "Test idea"
brain-all
brain-all thoughts

# Use daily
be bug "Found issue"
bah                    # Check everything
be sync               # Sync sources
```

---

**Docs**: BRAIN-ELEVATED.md, BRAIN-ELEVATION-GUIDE.md  
**GitHub**: https://github.com/wizelements/second-brain
