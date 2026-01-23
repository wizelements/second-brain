# Quick Start

## Windows (30 seconds)

```powershell
.\START-BRAIN.ps1
```

**Done.** Opens:
- API server (localhost:5000)
- Dashboard browser tab
- Schedules auto-sync

## Android (2 minutes)

```bash
cd android-kivy
buildozer android debug
adb install bin/second-brain-*-debug.apk
```

**Done.** App captures learnings + syncs to GitHub.

---

## What Works NOW

| Platform | Capture | Inbox | Sync | API |
|----------|---------|-------|------|-----|
| Windows | ✓ (via API) | ✓ | ✓ (auto 6h) | ✓ |
| Android | ✓ (Kivy) | ✓ | ✓ (manual) | - |
| Termux | ✓ (ba cmd) | ✓ | ✓ | ✓ |

---

## Files

- `START-BRAIN.ps1` - One-click Windows startup
- `DEPLOYMENT.md` - Full setup guide
- `android-kivy/` - Kivy source (APK)

See `DEPLOYMENT.md` for detailed instructions.
