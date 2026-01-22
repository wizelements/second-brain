# Direct Connectivity: Windows ↔ Termux (No Servers Required)
**Status**: ✅ IMPLEMENTED  
**Date**: 2026-01-22  
**Purpose**: Sync with or without services running

---

## OVERVIEW

Your brain can now sync directly between Termux and Windows using SSH, with automatic fallback to GitHub if SSH is unavailable. **No servers required**.

### Sync Methods (In Priority Order)

1. **SSH Direct** (Fastest) - Termux ↔ Windows directly
2. **GitHub** (Reliable) - Via wizelements/second-brain repo
3. **Local** (Offline) - Works without network

---

## QUICK START

### Step 1: Configure Windows Access (One-Time)

```bash
setup-windows-ssh
```

**Prompts for**:
- Windows IP address or hostname
- Windows username
- Windows brain path (e.g., `C:\Users\yourname\.local\share\second-brain`)

**Saves to**: `~/.zshrc` and `~/.bashrc` as environment variables

### Step 2: Test Connection

```bash
windows-status
```

**Output shows**:
- ✅ SSH status (online/offline)
- ✅ GitHub status
- ✅ Recommended sync method

### Step 3: Sync

**Option A: Direct SSH (fastest)**
```bash
windows-connect
```

**Option B: Via GitHub (always works)**
```bash
brain-sync-bidirectional
```

---

## DETAILED USAGE

### windows-connect (Direct SSH)

**Purpose**: Sync directly to Windows via SSH (no servers needed)

**Command**:
```bash
windows-connect
```

**What it does**:
1. Checks SSH connectivity to Windows
2. Compares item counts (Termux vs Windows)
3. Determines sync direction (push/pull/none)
4. Syncs via rsync (fast)
5. Falls back to GitHub if SSH unavailable
6. Pushes to GitHub for backup

**Prerequisites**:
- SSH enabled on Windows
- `setup-windows-ssh` run first
- SSH key configured (optional but recommended)

**Time**: 10-30 seconds

### setup-windows-ssh (Configuration)

**Purpose**: Enable SSH access to Windows

**Command**:
```bash
setup-windows-ssh
```

**Steps**:
1. Prompts for Windows IP/hostname
2. Prompts for Windows username
3. Prompts for Windows brain path
4. Saves to shell config
5. Tests SSH connection
6. Shows setup instructions

**Run this once**: Then `windows-connect` works anytime

### windows-status (Diagnostics)

**Purpose**: Check all connection methods

**Command**:
```bash
windows-status
```

**Shows**:
- SSH connection status
- GitHub status
- Local brain status
- Recommended sync method
- Available options

**Run anytime**: To verify connectivity

---

## HOW IT WORKS

### Sync Decision Tree

```
Is SSH available?
  ├─ YES → windows-connect (direct, fastest)
  │         └─ rsync files over SSH
  │         └─ Falls back to GitHub if issues
  │
  └─ NO → GitHub fallback
           └─ git push origin master
           └─ git pull origin master
```

### File Transfer Methods

**SSH Direct** (if available):
```
Termux inbox.json ──rsync──> Windows inbox.json
Termux filesystem.json ──rsync──> Windows filesystem.json
(fast, <30 seconds)
```

**GitHub Fallback** (always available):
```
Termux inbox.json ──git push──> GitHub ──git pull──> Windows
(slower, 1-2 minutes, but always works)
```

**Local Only** (offline):
```
Termux inbox.json (fully functional)
Windows inbox.json (stale until online)
(works, but not synced)
```

---

## SETUP EXAMPLE

### Step-by-Step Setup

#### 1. Get Windows Info

```bash
# On Windows, open PowerShell:
ipconfig              # Find IPv4 address
whoami               # Find username

# Example output:
# IPv4: 192.168.1.100
# Username: john
```

#### 2. Enable SSH on Windows

```
Settings → Apps → Optional features
  Search: "OpenSSH Server"
  Click: Install

Services → OpenSSH SSH Server
  Click: Start
  Set: Automatic startup
```

#### 3. Configure on Termux

```bash
setup-windows-ssh

# Prompts:
# Windows IP address or hostname: 192.168.1.100
# Windows username: john
# Windows brain path: C:\Users\john\.local\share\second-brain

# Output:
# ✅ Configuration saved
# ⚠️ SSH test showed connection failure (if not connected yet)
# Instructions for enabling SSH on Windows
```

#### 4. Test

```bash
windows-status

# Output:
# 1️⃣ SSH DIRECT CONNECTION
#    Status: ✅ ONLINE
#    Method: SSH direct connection available
```

#### 5. Sync

```bash
windows-connect

# Output:
# 🪟 WINDOWS DIRECT CONNECTION
# ✅ SSH connection successful
# Termux items: 39
# Windows items: 39
# ✅ Both in sync
# ✅ Synced to GitHub
```

---

## DAILY WORKFLOW (With Direct Connectivity)

### Morning

```bash
# Check all connection methods
windows-status

# Shows current status
```

### Work

```bash
# Capture as usual (unchanged)
ba "new task"
brain-ask "search"
brain-move id status
```

### Evening (Option A: Direct SSH)

```bash
# If Windows is online
windows-connect

# Fast, direct sync
# Falls back to GitHub if needed
```

### Evening (Option B: GitHub)

```bash
# If you prefer GitHub
brain-sync-bidirectional

# Reliable, always works
```

---

## CONFIGURATION

### Environment Variables

Set these for persistent configuration:

```bash
# ~/.zshrc or ~/.bashrc
export WINDOWS_HOST="192.168.1.100"        # IP or hostname
export WINDOWS_USER="john"                 # Windows username
export WINDOWS_BRAIN_PATH="C:\Users\john\.local\share\second-brain"
```

**Auto-set by**: `setup-windows-ssh`

### Changing Configuration

```bash
# Edit manually
nano ~/.zshrc

# Or reconfigure
setup-windows-ssh
```

---

## SSH SETUP (For Security)

### Option 1: Password Auth (Easy)

```bash
# Just run:
windows-connect

# Will prompt for Windows password
```

### Option 2: SSH Keys (Recommended)

```bash
# 1. Generate key (if not exists)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

# 2. Copy to Windows
ssh-copy-id -i ~/.ssh/id_ed25519.pub john@192.168.1.100

# 3. Now works without password
windows-connect
```

---

## FALLBACK CHAIN

### If SSH Fails

```
windows-connect called
  ↓
SSH connection check
  ✗ SSH unavailable
  ↓
Automatic fallback to GitHub
  ↓
git push origin master
git pull origin master
  ↓
✅ Synced via GitHub
```

**Result**: No data loss, automatic fallback

### If Both SSH and GitHub Fail

```
windows-connect called
  ↓
SSH unavailable → fallback to GitHub
GitHub unavailable → local only
  ↓
⚠️ Warning: Brain is local-only
💡 Will sync when connection restored
```

**Result**: Works offline, syncs when online

---

## TROUBLESHOOTING

### SSH Connection Fails

**Problem**: `SSH connection failed`

**Solutions**:
1. Check Windows IP: `ipconfig` on Windows
2. Verify SSH is running: Services → OpenSSH SSH Server → Start
3. Check firewall: Windows Defender → Firewall → Allow SSH (port 22)
4. Test manually: `ssh john@192.168.1.100`

### Items Not Syncing

**Problem**: `windows-connect` succeeds but items not on other system

**Check**:
```bash
# On Termux
jq 'length' ~/.local/share/second-brain/inbox.json

# On Windows
jq 'length' C:\Users\john\.local\share\second-brain\inbox.json
```

**Solutions**:
- Verify paths are correct (check `windows-status`)
- Check rsync installed: `which rsync`
- Check file permissions: `ls -la ~/.local/share/second-brain/`

### SSH Prompt for Password

**Problem**: `windows-connect` asks for password every time

**Solution**: Set up SSH keys

```bash
# 1. Generate key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# 2. Copy to Windows
ssh-copy-id -i ~/.ssh/id_ed25519.pub john@192.168.1.100

# 3. Now works without password
windows-connect
```

### Windows Offline But Need to Sync

**Problem**: Windows not available, need to work

**Solution**: Use GitHub fallback
```bash
brain-sync-bidirectional    # Works without Windows
```

**Result**: Termux ↔ GitHub synced. Windows will sync on next startup.

---

## COMMANDS REFERENCE

### Connection Management

```bash
setup-windows-ssh          # Configure Windows access
windows-status             # Check all connection methods
windows-connect            # Sync via SSH (direct)
```

### Fallback Sync

```bash
brain-sync-bidirectional   # Sync via GitHub
sync-checker               # Verify clean state
sync-monitor               # Health check
```

### Diagnostics

```bash
# Check SSH to Windows
ssh -v $WINDOWS_USER@$WINDOWS_HOST echo test

# Check GitHub
git fetch origin master

# Check local brain
jq 'length' ~/.local/share/second-brain/inbox.json
```

---

## SYNC SPEED COMPARISON

| Method | Speed | Latency | Reliability |
|--------|-------|---------|-------------|
| SSH Direct | 10-30s | 50-100ms | 95% (needs network) |
| GitHub | 1-2min | 500ms-2s | 99% (needs internet) |
| Local | Instant | 0ms | 100% (offline-only) |

---

## COMMON SCENARIOS

### Scenario 1: Both Online, Direct SSH

```bash
# Windows and Termux both on same network
windows-connect

# ✅ Direct sync in 10-30 seconds
# Falls back to GitHub for backup
```

### Scenario 2: Windows Offline, Only Termux

```bash
# Windows is offline or asleep
brain-sync-bidirectional

# ✅ Syncs to GitHub
# Windows will sync on next startup
```

### Scenario 3: Remote Access (Not on Same Network)

```bash
# Termux on mobile, Windows on home WiFi
# Can't use direct SSH over internet

brain-sync-bidirectional

# ✅ Uses GitHub as bridge
# Safe, reliable, encrypted
```

### Scenario 4: No Internet at All

```bash
# Both Termux and Windows offline
# On same local network

windows-connect

# ✅ Direct SSH works (no internet needed)
# Syncs locally on WiFi
```

---

## SECURITY NOTES

### SSH Security

- SSH is encrypted, safe for WiFi networks
- SSH keys preferred over passwords
- Firewall should limit SSH to trusted networks

### GitHub Sync

- HTTPS is encrypted
- SSH keys or tokens used
- GitHub is public server (data visible there)

### Local Sync

- No network traffic
- Fastest option
- Requires both systems on same network

---

## ARCHITECTURE

```
Termux (Termux Phone)
  ├─ Local brain (39 items)
  ├─ SSH client
  └─ Git client

Windows (Home PC)
  ├─ Local brain (39 items)
  ├─ SSH server (OpenSSH)
  └─ Git client

GitHub (Remote Backup)
  ├─ Repo: wizelements/second-brain
  └─ Fallback & backup
```

---

## NEXT STEPS

1. **Setup SSH** (one-time): `setup-windows-ssh`
2. **Test connection**: `windows-status`
3. **Sync manually**: `windows-connect` or `brain-sync-bidirectional`
4. **Automatic**: `setup-cron-sync` (every 6 hours)

---

## SUMMARY

✅ **You now have**:
- Direct SSH connectivity (Termux ↔ Windows)
- GitHub fallback (always available)
- Local offline mode (works without network)
- Automatic connection detection
- Health monitoring

✅ **No servers needed**:
- Windows: Just SSH + git
- Termux: Just SSH + git
- GitHub: Optional backup

✅ **Multiple sync methods**:
1. SSH (fastest, local network)
2. GitHub (reliable, always)
3. Local (offline, one system only)

---

**Status**: READY TO USE  
**Configuration**: One-time setup with `setup-windows-ssh`  
**Testing**: Run `windows-status` anytime  
**Syncing**: `windows-connect` (SSH) or `brain-sync-bidirectional` (GitHub)
