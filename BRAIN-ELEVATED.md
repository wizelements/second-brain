# Second Brain Elevated - Complete Capture System

**Version**: 1.0 - Comprehensive Thought Capture
**Status**: ✓ Fully Operational
**Last Updated**: 2026-01-22

---

## Philosophy

**Nothing Gets Forgotten. Everything Connects.**

Second Brain is now elevated into a comprehensive capture system that consolidates:
- **Tasks** - Work items and goals (via `brain-add`)
- **Gigs** - Freelance work and income (via `brain-add "Gig: ..."`)
- **Threads** - Amp discussions and decisions (via `brain-elevate thread`)
- **Projects** - Code repositories and directories (via `brain-elevate project`)
- **GitHub** - Issues and PRs (via `brain-elevate github`)
- **Thoughts** - Raw ideas, insights, bugs, discoveries (via `brain-elevate thought|idea|bug|insight`)
- **Reminders** - Time-based alerts (via `brain-add`)

Everything is interconnected, searchable, and always accessible from any device.

---

## Data Files

### Core Files (Existing)
- `inbox.json` - Tasks, gigs, reminders (existing Second Brain)
- `github.json` - GitHub repos, issues, PRs (synced)
- `filesystem.json` - Project file structures (synced)

### New Files (Elevation)
- `threads.json` - Captured Amp threads
- `projects.json` - Tracked projects with metadata
- `captures.json` - GitHub issues, external captures
- `thoughts.json` - Raw ideas, insights, bugs, discoveries

### Summary
```bash
~/.local/share/second-brain/
├── inbox.json           # Tasks, gigs, reminders (27 active)
├── github.json          # GitHub sync data
├── filesystem.json      # Project file trees
├── threads.json         # Amp threads (new)
├── projects.json        # Projects (new)
├── captures.json        # GitHub, etc (new)
├── thoughts.json        # Ideas, discoveries (new)
└── *.md                 # Documentation
```

---

## Core Commands

### Capture Everything

```bash
# Tasks & Gigs (existing)
ba "finish auth system"
ba "Gig: ClientCo - $5000 - dashboard redesign"

# Threads (new)
brain-elevate thread T-abc123 "Auth System Design" "https://amp..."

# Projects (new)
brain-elevate project ~/projects/apps/gratog

# GitHub Issues (new)
brain-elevate github wizelements/second-brain 42 "Add capture system"

# Raw Thoughts (new) - POWERFUL
brain-elevate thought "Consider implementing rate limiting"
brain-elevate idea "Dark mode toggle on landing page"
brain-elevate insight "API response time bottleneck in search"
brain-elevate discovery "Race condition in thread synchronization"
brain-elevate bug "Form validation not working on mobile"
```

### View Everything

```bash
# Complete overview
brain-all              # Show everything unified
brain-all all          # Same as above

# By category
brain-all tasks        # Just tasks
brain-all gigs         # Just gigs
brain-all threads      # Just threads
brain-all projects     # Just projects
brain-all thoughts     # Just raw ideas/insights
brain-all captures     # GitHub issues

# Stats
brain-all stats        # Count by category
```

### Management

```bash
# Auto-discover all projects
brain-elevate discover

# Sync all sources (projects, GitHub, files)
brain-elevate sync

# Show dashboard
brain-elevate dashboard

# Link thread to project
brain-elevate link T-abc123 gratog
```

---

## Usage Examples

### Workflow 1: Capture a Thought During Development
```bash
# You're working and notice something
brain-elevate bug "null pointer in user.profile when email not set"

# Captured automatically - won't be forgotten
# Shows up in: brain-all thoughts
# Can be reviewed later, turned into ticket, etc
```

### Workflow 2: Discussion Decision → Thread Capture
```bash
# After finishing an Amp thread about authentication
brain-elevate thread T-def456 "JWT vs Session Auth Decision" https://ampcode.com/threads/T-def456

# Link to relevant project
brain-elevate link T-def456 gratog

# Now it's part of your permanent record
# Shows up in: brain-all threads
# Linked to project gratog for context
```

### Workflow 3: GitHub Issue Discovered
```bash
# Found important issue on repo
brain-elevate github wizelements/second-brain 99 "Implement webhook validation"

# Shows up in: brain-all captures
# Can be synced with push-to-windows
```

### Workflow 4: New Project Starts
```bash
# Started new project
brain-elevate project ~/projects/apps/my-new-app

# Shows up in: brain-all projects
# Auto-syncs file count, git branch, URL
# Can be cross-referenced in threads
```

### Workflow 5: Weekly Brain Review
```bash
# Check everything at once
brain-all

# Export to Windows for review
push-to-windows all all

# Sync to GitHub
goodbye
```

---

## Data Structure

### threads.json
```json
[
  {
    "id": "T-abc123",
    "title": "Auth System Design",
    "url": "https://ampcode.com/threads/T-abc123",
    "source": "amp-thread",
    "captured": "2026-01-22T10:30:00Z",
    "status": "active",
    "projects": ["gratog"],
    "tags": ["auth", "architecture"]
  }
]
```

### projects.json
```json
[
  {
    "name": "gratog",
    "path": "/home/user/projects/apps/gratog",
    "fileCount": 93045,
    "gitUrl": "https://github.com/user/gratog",
    "branch": "main",
    "captured": "2026-01-22T10:00:00Z",
    "status": "active"
  }
]
```

### captures.json
```json
[
  {
    "repo": "wizelements/second-brain",
    "number": 42,
    "title": "Add comprehensive capture system",
    "url": "https://github.com/wizelements/second-brain/issues/42",
    "source": "github",
    "captured": "2026-01-22T10:15:00Z",
    "status": "active"
  }
]
```

### thoughts.json
```json
[
  {
    "id": "thought-1674408000",
    "text": "Consider implementing caching for API responses to improve performance",
    "category": "idea",
    "timestamp": "2026-01-22T10:20:00Z",
    "status": "raw"
  },
  {
    "id": "thought-1674408100",
    "text": "Race condition in thread synchronization when multiple clients update same document",
    "category": "bug",
    "timestamp": "2026-01-22T10:25:00Z",
    "status": "raw"
  }
]
```

---

## Integration Points

### With Existing Systems

**Second Brain (Original)**
- Tasks → inbox.json
- Gigs → inbox.json
- `brain-add` command still works
- `ba` alias still works

**GitHub Integration**
- `github-sync` keeps github.json current
- `brain-elevate github` adds issues to captures
- Cross-reference with projects

**Windows Bridge**
- `push-to-windows` exports all categories
- Stages threads, projects, thoughts for Windows
- Notification on completion

**Git/GitHub**
- `goodbye` syncs everything to GitHub
- All changes auto-committed
- Full audit trail preserved

### New Workflows

1. **Capture During Development**
   ```bash
   # Notice a bug while coding
   brain-elevate bug "Form not validating on blur"
   
   # Continue working, review thoughts later
   ```

2. **Consolidate Thread Decisions**
   ```bash
   # Thread discussion concluded
   brain-elevate thread T-xyz789 "Caching Strategy Decided"
   
   # Cross-reference to project
   brain-elevate link T-xyz789 gratog
   
   # Now searchable with project context
   ```

3. **Project-Thought Linking** (Future)
   ```bash
   # Create thought in context of project
   brain-elevate thought "Add rate limiting" --project gratog
   
   # Automatically linked and searchable
   ```

---

## Quick Reference

### Common Commands
```bash
# Daily capture
ba "Completed user auth flow"              # Task
ba "Gig: ABC Co - $3000 - API work"        # Gig
brain-elevate thought "Rate limiting idea" # Idea
brain-elevate bug "null ref on line 42"    # Bug

# Weekly review
brain-all                                  # View everything
brain-all stats                            # See counts
push-to-windows all all                    # Export to Windows

# Project management
brain-elevate discover                     # Auto-find projects
brain-elevate sync                         # Sync all sources
brain-elevate dashboard                    # Quick stats

# View specific categories
brain-all tasks
brain-all gigs
brain-all threads
brain-all projects
brain-all thoughts
brain-all captures
```

### Shortcuts (Aliases)
```bash
# Add to ~/.zshrc
alias be='brain-elevate'        # brain-elevate → be
alias bea='brain-elevate all'   # brain-elevate all
alias ba='brain-add'            # (already exists)
alias bah='brain-all'           # brain-all → bah
```

---

## Advanced Usage

### Batch Capture
```bash
# Capture multiple items at once
brain-elevate project ~/projects/apps/gratog
brain-elevate project ~/projects/apps/sd-studio-web
brain-elevate project ~/projects/apps/tradealert

# Or use discover
brain-elevate discover
```

### Cross-Reference
```bash
# Link related items
brain-elevate link T-abc123 gratog         # Thread to project
brain-elevate link T-def456 gratog         # Another thread to same project

# Now when reviewing project, see associated threads
```

### Filter by Priority
```bash
# View only high-priority tasks
jq '.[] | select(.category == "task" and .priority == "high")' ~/.local/share/second-brain/inbox.json

# View only ideas/bugs (not regular thoughts)
jq '.[] | select(.category == "idea" or .category == "bug")' ~/.local/share/second-brain/thoughts.json
```

### Search Everything
```bash
# Search across all files
grep -r "caching" ~/.local/share/second-brain/*.json

# Search just thoughts
jq '.[] | select(.text | contains("cache"))' ~/.local/share/second-brain/thoughts.json
```

---

## File Locations

### Local Second Brain
```
~/.local/share/second-brain/
├── inbox.json
├── threads.json
├── projects.json
├── captures.json
├── thoughts.json
└── [other sync files]
```

### Commands
```
~/bin/
├── brain-elevate    # Capture system
├── brain-all        # Unified view
├── brain-add        # Quick capture (existing)
├── push-to-windows  # Export to Windows
└── [other tools]
```

### GitHub Repository
```
https://github.com/wizelements/second-brain
- All files synced
- Full commit history
- Remote backup
```

---

## Philosophy & Design

### Core Principles

1. **Capture Everything** - No friction for capturing thoughts
2. **Nothing Lost** - Multiple storage formats (local JSON, GitHub, staging)
3. **Always Connected** - Cross-references between items
4. **Searchable** - All text indexed and queryable
5. **Synced** - Local, GitHub, Windows all in sync
6. **Unified View** - See everything at once or by category

### Why This Matters

- **During Development**: Capture bugs/ideas without context switching
- **In Discussions**: Record decisions from Amp threads for later reference
- **Between Projects**: See connections and patterns across all work
- **During Review**: Full history of what you thought and when
- **For Accountability**: Everything tracked and dated

---

## Troubleshooting

### Command Not Found
```bash
# Make sure commands are executable
ls -lah ~/bin/brain-elevate
ls -lah ~/bin/brain-all

# If missing, reinstall
chmod +x ~/bin/brain-elevate
chmod +x ~/bin/brain-all
```

### JSON Parse Errors
```bash
# Validate JSON files
jq . ~/.local/share/second-brain/threads.json
jq . ~/.local/share/second-brain/thoughts.json

# If corrupted, reinitialize
brain-elevate init
```

### Files Not Showing
```bash
# Check if files exist
ls -la ~/.local/share/second-brain/

# If missing, initialize
brain-elevate init

# Verify with dashboard
brain-elevate dashboard
```

### Sync Issues
```bash
# Manual sync
brain-elevate sync

# Check git status
cd ~/.local/share/second-brain && git status

# Push if needed
goodbye
```

---

## Future Enhancements

### Planned Features
- [ ] Automatic thread capture from Amp API
- [ ] GitHub issue auto-sync (watch repos)
- [ ] Thought categorization with AI
- [ ] Full-text search across all files
- [ ] Tag system for cross-cutting concerns
- [ ] Related items suggestions
- [ ] Periodic summarization of thoughts
- [ ] Export to obsidian/notion format

### Possible Integrations
- Slack message capture
- Calendar event tracking
- Email references
- Video transcription capture
- Meeting notes synchronization

---

## Quick Start

```bash
# 1. Initialize
brain-elevate init

# 2. Capture something
brain-elevate thought "My first captured thought"

# 3. View everything
brain-all

# 4. Setup aliases (add to ~/.zshrc)
alias be='brain-elevate'
alias bah='brain-all'

# 5. Start capturing
brain-elevate bug "Found an issue"
brain-elevate idea "New feature possibility"

# 6. Daily workflow
ba "Task 1"
ba "Gig: Client - $X - work"
be thought "Something I noticed"
brain-all                      # Review weekly

# 7. Export when needed
push-to-windows all all
goodbye
```

---

## Philosophy in Practice

### Before (Scattered)
- Tasks in inbox
- Ideas forgotten
- Thread discussions lost
- Bug reports scattered
- Project context missing

### After (Elevated)
```bash
brain-all                    # Everything visible
brain-elevate thought "..."  # Nothing forgotten
brain-elevate thread ...     # Decisions captured
brain-elevate project ...    # Context preserved
brain-all tasks             # Just what you need
push-to-windows all all     # Sync everywhere
```

**Result**: Complete personal knowledge system that grows with you.

---

**Status**: ✓ Operational and Ready  
**Commands**: `brain-elevate`, `brain-all`, `ba`, `push-to-windows`, `goodbye`  
**Sync**: GitHub at https://github.com/wizelements/second-brain  
**Backup**: Windows staging via `push-to-windows all all`
