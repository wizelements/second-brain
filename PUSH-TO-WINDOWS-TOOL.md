# Push to Windows Tool

Push plans, notes, gigs, tasks, and projects from Second Brain to Windows.

## Installation

```bash
# Already installed in ~/bin/push-to-windows
chmod +x ~/bin/push-to-windows
```

## Usage

### Push All Items of a Type
```bash
push-to-windows task all              # Push all tasks
push-to-windows gig all               # Push all gigs
push-to-windows reminder all          # Push all reminders
push-to-windows all all               # Push everything
```

### Push Specific Item
```bash
push-to-windows task mklfww4i         # Push specific task
push-to-windows gig mklfx5x1          # Push specific gig
```

### Custom Windows Destination
```bash
push-to-windows task all "C:\\Projects\\Brain"
push-to-windows all all "C:\\Dev\\SecondBrain"
```

## What It Does

1. **Reads from Second Brain** - Queries ~/.local/share/second-brain/inbox.json
2. **Formats Items** - Creates readable text + JSON versions
3. **Stages Files** - Stores in ~/.windows-transfer/{timestamp}-{id}/
4. **Copies to Windows** - Uses windows-client.sh to transfer files
5. **Notifies** - Sends Windows desktop notification when complete
6. **Reports** - Shows success/failure count

## Output Format

Each item creates two files:

**{id}.txt** - Human readable:
```
ID: mklfx5x1
Type: gig
Priority: high
Status: classified
Date: 2026-01-19T17:29:48.085Z

Title:
Gig: acme corp - $500 - website redesign

---
Exported from Second Brain: 2026-01-22 12:34:56
```

**{id}.json** - Machine readable:
```json
{
  "id": "mklfx5x1",
  "text": "Gig: acme corp - $500 - website redesign",
  "category": "gig",
  "priority": "high",
  "status": "classified"
}
```

## Windows Directory Structure

Files are organized by category:

```
C:\Users\{user}\Documents\SecondBrain\
├── task\
│   ├── mklfww4i.txt
│   └── mklfww4i.json
├── gig\
│   ├── mklfx5x1.txt
│   └── mklfx5x1.json
├── reminder\
└── project\
```

## Staging Directory

Temporary files stored in:
```bash
~/.windows-transfer/{timestamp}-{id}/
  ├── {id}.txt
  └── {id}.json
```

Can be safely deleted after transfer.

## Examples

### Daily Gig Sync
```bash
# Push all active gigs to Windows
push-to-windows gig all

# Windows notification appears: "Items pushed to Windows: C:\Users\...\Documents\SecondBrain"
```

### Project Export
```bash
# Push specific project
push-to-windows project abc123

# Creates Windows file with project details and metadata
```

### Full Brain Backup
```bash
# Push everything to external drive location
push-to-windows all all "E:\\SecondBrainBackup"

# All tasks, gigs, reminders, projects synced to external drive
```

## Troubleshooting

### Command Not Found
```bash
# Make sure its