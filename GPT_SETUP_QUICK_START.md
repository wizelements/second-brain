# DevSolo AI — GPT Setup Quick Start

**Status:** ✅ **Ready to Configure**

---

## What You Have

✅ **Windows Brain Agent v4.0**
- 65 commands (System, Network, Process, Audio, Display, Services, Files, Dev, Remote)
- Running on `http://localhost:8080`
- Exposed via Cloudflare: `https://windows.codewithsolo.com`

✅ **Android/Termux SoloSpace**
- 40+ endpoints (Email, Capture, Brain, Device, Daily)
- Exposed via Cloudflare: `https://solospace.codewithsolo.com`

✅ **GitHub Brain**
- Durable state, notes, captures, run logs
- Repo: `https://github.com/wizelements/second-brain`

✅ **OpenAPI Spec v4.0**
- Full unified API: `https://solospace.codewithsolo.com/openapi.yaml`

✅ **GPT Custom Instructions v4.0**
- File: `GPT_CUSTOM_INSTRUCTIONS.md` (in second-brain repo)
- Covers routing, safety, confirmations, response format

---

## To Configure in ChatGPT

### 1. Copy Custom Instructions
Open: `https://github.com/wizelements/second-brain/blob/master/GPT_CUSTOM_INSTRUCTIONS.md`

Copy entire content (or sections you prefer).

### 2. Go to ChatGPT Settings
1. Open ChatGPT
2. Click **Settings** (bottom-left gear icon)
3. Click **Custom instructions**
4. Paste into **"How would you like ChatGPT to behave?"** section

### 3. Add Your API Token
In **"Additional context about you"** section, add:
```
GPT_API_TOKEN: [YOUR_BEARER_TOKEN]
Platforms: Windows (https://windows.codewithsolo.com), Android (https://solospace.codewithsolo.com)
OpenAPI Spec: https://solospace.codewithsolo.com/openapi.yaml
GitHub Brain: https://github.com/wizelements/second-brain
```

### 4. Save & Test
- Click **Save**
- Test with a simple command: "What's my Windows system status?"
- Expected: Calls `https://windows.codewithsolo.com/command` with intent `system.status`

---

## Test Commands (Non-Destructive)

After setup, try these in ChatGPT to verify:

1. **Windows Status**
   - "What's my Windows system status?"
   - Expected: CPU, memory, disk, uptime

2. **List Windows Commands**
   - "What Windows commands can you execute?"
   - Expected: 65 command list

3. **Process List**
   - "List running processes on Windows"
   - Expected: Process table with memory/CPU

4. **Network Status**
   - "Show me my Windows IP addresses"
   - Expected: IPv4 addresses by interface

5. **Project List**
   - "What projects are in my Windows C:\projects?"
   - Expected: Project names + modification dates

6. **Git Status**
   - "What's the git status of my beltlinegolf project?"
   - Expected: Branch, commits ahead/behind, uncommitted changes

---

## Critical: Safety Setup

### Destructive Command Protection
Custom instructions include **two-phase confirmation** for:
- `system.restart` ⚠️
- `system.shutdown` ⚠️
- `file.delete` ⚠️
- `process.kill` ⚠️
- `service.stop` ⚠️

**Always require explicit "APPROVE" confirmation before executing.**

### Tokens Must NOT Be Exposed
- Never log or echo GPT_API_TOKEN
- Always use Bearer auth in headers
- If token is compromised, rotate immediately

---

## Verify Setup

### Check All Platforms Are Live
```bash
# Windows agent
curl https://windows.codewithsolo.com/health

# Android endpoint
curl https://solospace.codewithsolo.com/health

# GitHub Brain (check if repo accessible)
curl https://api.github.com/repos/wizelements/second-brain
```

### Check OpenAPI Spec Loads
```bash
curl https://solospace.codewithsolo.com/openapi.yaml | head -20
```

All should return 200 OK.

---

## Common First Tasks

### Task 1: Status Check Across All Devices
```
"Give me a status report: Windows system, Android device, and GitHub brain sync status"
```

Expected: 3 separate reports showing system health, battery, and git status.

### Task 2: Build & Deploy
```
"Build the beltlinegolf project on Windows, then push to GitHub"
```

Expected:
1. Calls `dev.build project=beltlinegolf cmd="pnpm build"`
2. Checks for errors
3. Calls `dev.git.push`
4. Logs to GitHub Brain

### Task 3: Capture to Brain
```
"Capture this insight to my GitHub brain: 'Windows automation is now unified across all devices'"
```

Expected:
1. Creates capture on Android via `/webhook/capture`
2. Stores in GitHub Brain
3. Syncs to repo

### Task 4: Emergency Stop (if restart hangs)
```
"Cancel the Windows restart"
```

Expected: Calls `system.cancel` to abort pending restart.

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| "Endpoint unreachable" | Is Cloudflare tunnel running? `cloudflared tunnel status` |
| "Auth failed (401)" | Is GPT_API_TOKEN set? Is bearer token valid? |
| "Command not found" | Is Windows agent v4.0 running? Check `/commands` list |
| "File not found" | Is path in sandbox? (projects, Documents, .local, Desktop, Downloads) |
| "Confirmation expired" | Confirmations expire in 5 min; re-request approval |
| "Destructive command executed without confirm" | Repeat 2-phase confirm rule in custom instructions |

---

## Performance Expectations

| Action | Time |
|--------|------|
| Simple status check | 1–2s |
| Process list | 2–3s |
| Build project | 30–60s |
| Git push | 3–5s |
| Sync to GitHub Brain | 5–10s |
| Restart Windows | 30s (then disconnect/reconnect) |

---

## File Locations

| File | Path |
|------|------|
| **Custom Instructions** | `~/.local/share/second-brain/GPT_CUSTOM_INSTRUCTIONS.md` |
| **Windows Agent v4.0** | `C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1` |
| **OpenAPI Spec** | `~/.local/share/second-brain/openapi.yaml` |
| **GitHub Brain** | `https://github.com/wizelements/second-brain` |
| **Run Logs** | `~/.local/share/second-brain/runs/YYYY-MM-DD/` |

---

## Next Steps

1. ✅ Copy custom instructions to ChatGPT
2. ✅ Add GPT_API_TOKEN to settings
3. ✅ Save & test with simple command
4. ✅ Build first workflow (status → build → push → log)
5. ✅ Monitor run logs in GitHub Brain
6. ✅ Iterate on routing/confirmations as needed

---

## Support

- **Custom Instructions file:** `GPT_CUSTOM_INSTRUCTIONS.md` (this repo)
- **Windows Agent docs:** See agent v4.0 OpenAPI spec (`openapi-windows-v4.yaml`)
- **Termux API docs:** See `openapi.yaml` (sections: Email, Capture, Device)
- **Emergency:** Restart Windows agent: `powershell -Command "& 'C:\Users\jacla\Scripts\windows-brain-agent-v4.ps1' -Port 8080"`

---

**Configured at:** 2026-01-23  
**Version:** v4.0  
**Status:** ✅ Ready  
**Contact:** See AGENTS.md for skill scripts
