# 🧠 Second Brain "Start Here" - Complete Setup

Your unified entry point for Second Brain access on both Windows and Termux.

## What You Just Got

Two fluid, responsive interfaces that pull from GitHub brain state and execute commands via your agents:

### Windows Desktop App
- **File**: `C:\Users\jacla\.local\share\second-brain\index.html`
- **Shortcuts**: On Desktop and OneDrive
- **Access**: Click shortcut or open in any browser
- **Features**:
  - Inbox with stats (active tasks, gigs, high priority)
  - Upcoming reminders
  - Available guides
  - Quick actions (Capture, Email, Sync, Focus)
  - Command input field
  - Full modal details for items

### Termux Widget (Mobile)
- **File**: `termux-widget.html`
- **Widget**: Add to home screen via Termux widget provider
- **Access**: Appears as home screen widget on Android
- **Features**:
  - Mini inbox (top 20 items)
  - Stats bar (active, gigs, total)
  - Quick action buttons
  - Tap to open full interface
  - Auto-refresh every 30 seconds

## Setup Instructions

### Windows (Desktop Entry Point)

#### Option 1: Direct File Access (Easiest)
1. Go to Desktop
2. Double-click **"Second Brain.url"** shortcut
3. Opens in default browser

#### Option 2: Pin to Start Menu
1. Right-click `index.html`
2. Create shortcut on Desktop
3. Right-click shortcut → Pin to Start

#### Option 3: Browser Bookmark
1. Open `file:///C:\Users\jacla\.local\share\second-brain\index.html` in Edge/Chrome
2. Bookmark (Ctrl+D)
3. Name it "Brain" for quick access

### Termux Widget (Mobile)

#### Prerequisites
- Termux installed
- Termux Widget app installed (from F-Droid)
- Cloudflare tunnel running (`cloudflared tunnel run solospace`)

#### Installation Steps

1. **Copy widget HTML to Termux:**
   ```bash
   # On Windows, copy the file:
   scp ~/'.local/share/second-brain/termux-widget.html' android:~/termux-widget.html
   ```

2. **Set up HTTP server (already in server.js):**
   ```bash
   # In Termux
   cd ~/termux-webhooks
   npm start
   cloudflared tunnel run solospace  # in another terminal
   ```

3. **Add to Home Screen:**
   - Open Termux Widget app
   - Create new shortcut
   - Name: "Brain"
   - Command:
   ```bash
   am start -a android.intent.action.VIEW -d "https://solospace.codewithsolo.com/termux-widget.html"
   ```

4. **Alternative: Simple Bookmark**
   - Open Chrome on phone
   - Visit: `https://solospace.codewithsolo.com/termux-widget.html`
   - Bookmark as "Brain Widget"
   - Add to home screen

## Data Sources & Sync

### Inbox Data Flow
```
GitHub Brain (git repo)
    ↓
    Local files:
    - inbox.json
    - reminders.jsonl
    - notes.jsonl
    ↓
API Endpoints:
    - https://windows.codewithsolo.com (Windows)
    - https://solospace.codewithsolo.com (Termux)
    ↓
UI renders data
```

### Real-time Updates
- **Auto-refresh**: 30 seconds
- **Manual refresh**: Click header/footer buttons
- **Sync**: Click "Sync Brain" button

## Commands Available

### Quick Actions
- **Capture**: Record learning/insight to brain
- **Email**: Draft and send emails (Gmail/Outlook)
- **Sync Brain**: Push/pull changes from GitHub
- **Set Focus**: Define daily focus area

### Command Input
- Type any command in the input field
- Examples:
  - "remind me tomorrow at 9am to call mom"
  - "search my notes for stripe"
  - "create gig: client name - $amount - description"
  - "capture learning about Next.js"

## API Integration

Both UIs call these endpoints:

### Termux API
```
https://solospace.codewithsolo.com
  GET  /webhook/inbox           → inbox items
  GET  /webhook/reminders       → upcoming reminders
  GET  /webhook/guides          → available guides
  POST /webhook/command         → execute command
  POST /webhook/capture         → save to brain
  POST /webhook/sync            → sync with GitHub
```

### Windows API
```
https://windows.codewithsolo.com
  POST /command                 → execute command
  GET  /status                  → agent status
  GET  /commands                → pending commands
```

## Features by Category

### Inbox
- View all pending items
- Filter by: task, gig, reminder, guide
- Sort by: priority, status, date
- Click to see full details
- Priority indicator (color-coded)
- Timestamps (relative: "2h ago", "just now")

### Reminders
- Upcoming reminders with dates/times
- Quick mark-complete action
- Syncs with reminders.jsonl

### Guides
- Recently created guides
- Click to read full markdown
- Synced from guides/ directory

### Stats
- Active tasks count
- Gig count
- High priority items
- Total inbox items

### Commands
- Natural language command input
- Executes via brain agents
- Supports both Windows and Termux native commands
- Voice-to-text integration ready

## File Locations

### Windows
```
C:\Users\jacla\.local\share\second-brain\
  ├── index.html                    (main app)
  ├── termux-widget.html           (mobile widget)
  ├── inbox.json                   (local cache)
  ├── reminders.jsonl              (reminders)
  ├── notes.jsonl                  (notes)
  └── [git tracking]
```

### Desktop Shortcuts
```
C:\Users\jacla\Desktop\Second Brain.url
C:\Users\jacla\OneDrive\Desktop\Second Brain.url
```

### Termux
```
~/.local/share/second-brain/        (synced via git)
~/termux-widget.html                (local copy)
~/.cloudflared/                      (tunnel config)
```

## Troubleshooting

### UI Shows "Offline"
1. Check Windows Brain Agent: `C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1`
2. Check Termux server: `npm start` in termux-webhooks
3. Check Cloudflare tunnel: `cloudflared tunnel run solospace`

### Inbox Empty
1. Pull latest from GitHub:
   ```bash
   # Windows
   cd C:\Users\jacla\.local\share\second-brain
   git pull
   
   # Termux
   cd ~/.local/share/second-brain
   git pull
   ```

### Widget Not Showing on Termux
1. Install Termux Widget from F-Droid
2. Grant file permissions
3. Restart home screen launcher

### Commands Not Executing
1. Check command format
2. Verify brain agents are running
3. Check logs:
   - Windows: `C:\Users\jacla\Scripts\logs\`
   - Termux: `logcat | grep solospace`

## Advanced Usage

### Custom Commands
Edit API endpoints to add custom commands:
- Windows: `windows-brain-agent-v4.ps1`
- Termux: `server.js`

### Automation
Set up GPT to trigger commands:
1. Use OpenAPI specs from: `https://solospace.codewithsolo.com/openapi.yaml`
2. Enable GPT integrations in both agents
3. Voice commands will auto-route correctly

### Data Privacy
- All data stored in git-tracked brain directory
- Syncs bidirectionally with GitHub
- No cloud storage (only local + GitHub)
- Cloudflare tunnel is encrypted

## Next Steps

1. **Open now**: Double-click "Second Brain" shortcut on Desktop
2. **Add widget**: Open Termux Widget app and add Brain
3. **Try a command**: Type something in the command input
4. **Capture learning**: Use quick action buttons
5. **Sync**: Ensure changes push to GitHub

## Version Info
- **UI Version**: 2.0
- **Last Updated**: 2026-01-22
- **API**: Windows v4.0, Termux v2.0+

---

**Made by DevSolo AI** - Unified command center for your digital life
