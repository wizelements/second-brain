# Second Brain

A comprehensive knowledge management and task tracking system integrated with GitHub, project files, and personal capture/inbox systems.

## Overview

This repository contains the complete data structure for an AI-augmented personal knowledge base that:
- Syncs GitHub issues, PRs, and repos
- Tracks project files and structure
- Maintains task inbox and capture queue
- Stores guides, patterns, and processed knowledge
- Provides structured data for AI agents

## Structure

### Core Files

| File | Purpose | Size |
|------|---------|------|
| `filesystem.json` | Project file trees and structure snapshots | ~369 KB |
| `inbox.json` | Tasks, TODOs, and capture queue | ~58 KB |
| `github.json` | GitHub repos, issues, and PRs sync | ~2 B |
| `processed.json` | Processed entries and metadata | ~495 B |
| `nudges.json` | Reminders and nudge queue | ~2 B |

### Directories

| Directory | Purpose |
|-----------|---------|
| `captures/` | Raw captured items awaiting processing |
| `guides/` | Knowledge base - guides, patterns, reference |
| `events/` | Timeline of actions and completions |

## Data Format

### inbox.json
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "task|capture|idea",
      "title": "string",
      "description": "string",
      "priority": "high|normal|low",
      "status": "active|completed|archived",
      "project": "string",
      "tags": ["string"],
      "created": "ISO8601",
      "updated": "ISO8601"
    }
  ]
}
```

### filesystem.json
```json
{
  "projects": [
    {
      "name": "project-name",
      "path": "/home/user/project",
      "type": "nextjs|react|nodejs|python|etc",
      "files": [
        {
          "path": "relative/path",
          "type": "file|directory",
          "size": 1024,
          "modified": "ISO8601"
        }
      ]
    }
  ]
}
```

## Usage

### Sync Commands

```bash
# Sync all GitHub activity
github-sync

# Sync specific projects
brain-sync ~/gratog
brain-sync ~/projects/tools/gpt-bridge

# Sync all projects daily (cron)
brain-sync-all
```

### Query Data

```bash
# Get all active tasks
jq '.items[] | select(.status == "active")' inbox.json

# Find tasks by project
jq '.items[] | select(.project == "gratog")' inbox.json

# Get recent changes
jq '.items[] | sort_by(.updated) | reverse | .[0:10]' inbox.json

# Search by tag
jq '.items[] | select(.tags[] | contains("deployment"))' inbox.json
```

## Integration Points

### AI Agents
Second Brain data is consumed by:
- **Amp Context Agent** - Full project understanding before execution
- **GPT Bridge** - Project intelligence and clarification
- **SOLOSPACE** - Local LLM web + search integration

### Automatic Syncing
- **Daily**: `brain-sync-all` runs via crond (see bin/brain-sync-all)
- **On Demand**: `github-sync`, `brain-sync` commands
- **Webhook**: Local webhook server syncs GitHub events

### GitHub Integration
- Syncs repos, issues, PRs from GitHub account
- Stores in `github.json` for quick reference
- Used by agents for issue context and PR analysis

## Getting Started

### View Tasks
```bash
cd ~/.local/share/second-brain
jq '.items | length' inbox.json  # Count tasks
jq '.items[] | .title' inbox.json  # List all titles
```

### Add a Task
```bash
jq '.items += [{"id": "new", "title": "Task", "type": "task", "status": "active"}]' inbox.json > tmp.json && mv tmp.json inbox.json
```

### Sync and Update
```bash
github-sync         # Sync GitHub
brain-sync ~/gratog # Sync projects
git add -A
git commit -m "Update second brain data"
git push
```

## Files Included

### Guides
- `guides/2026-01-20-cloudflare-tunnel-setup.md` - Cloudflare tunnel configuration
- `guides/2026-01-20-test-guide.md` - Testing patterns

### Data Exports
- Full project file structure snapshots
- All task/capture items
- GitHub repo information
- Processing metadata

## Privacy & Security

- **Local Storage**: All data stored locally at `~/.local/share/second-brain/`
- **Git Access**: SSH keys required (configured via GitHub CLI)
- **Sensitive Data**: Filter before committing (use `.gitignore` for secrets)
- **GitHub Account**: Connected as `wizelements`

## Development

### Add New Sync Source
1. Create sync script in `~/bin/`
2. Add to `brain-sync-all` for daily runs
3. Update corresponding JSON file
4. Test manually before cron scheduling

### Extend Schema
1. Modify JSON structure in sync scripts
2. Update documentation in guides/
3. Validate with `jq` before committing
4. Create migration guide if breaking

## Sync Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Daily Sync | Daily 2 AM | `brain-sync-all` |
| GitHub Sync | On Demand | `github-sync` |
| Project Sync | On Demand | `brain-sync ~/project` |
| Manual Push | As Needed | `git push` |

## Recent Activity

**Last Sync**: 2026-01-20 23:35:00 UTC  
**Total Tasks**: 100+ items in inbox  
**Projects Tracked**: 4+ active projects  
**GitHub Repos**: wizelements account

## Repository

- **URL**: https://github.com/wizelements/second-brain
- **Branch**: master
- **Access**: Public (read-only recommended for external users)

---

**Maintained by**: Nomolos Sniktaw  
**Contact**: silverwatkins@gmail.com  
**Last Updated**: 2026-01-21
