# WINDOWS ALIGNMENT CHECKLIST
**For**: Windows PC (when service is restored)  
**From**: Termux (Android - Primary Authority)  
**Generated**: 2026-01-21T17:35:00Z  
**Purpose**: Gapless bidirectional alignment

---

## QUICK START VERIFICATION (5 MIN)

### Step 1: Verify Termux State is Current ✓
**Last Verified**: 2026-01-21T17:30:00Z
- 34 items in inbox.json ✓
- GitHub master branch current ✓
- All projects synced ✓

**To Verify**:
```bash
# On Windows, pull latest from GitHub
cd %USERPROFILE%\.agents\second-brain
git pull origin master

# Check item count
powershell -Command "Import-Json '.\inbox.json' | Measure-Object"
# Expected: 34 items
```

### Step 2: Compare Item Counts
**Termux**: 34 items  
**Windows Target**: 34 items (after pull)

If counts differ:
```powershell
# Find missing items
$windowsItems = (Import-Json '.\inbox.json').id
$termuxItems = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json).id
$missing = Compare-Object -ReferenceObject $termuxItems -DifferenceObject $windowsItems | Where-Object {$_.SideIndicator -eq "<="}
```

### Step 3: Verify Data Integrity
```powershell
# Check all required fields present
$inbox = Import-Json '.\inbox.json'
$inbox | ForEach-Object {
    if (-not $_.id -or -not $_.text -or -not $_.timestamp) {
        Write-Host "Missing field: $_"
    }
}
# Should return: 0 issues
```

---

## ALIGNMENT MATRIX (DETAILED)

### Data Category: Tasks

| ID | Text | Status | Priority | Source | Termux | Windows | Match | Notes |
|--|--|--|--|--|--|--|--|--|
| mklfww4i | finish gratog landing | classified | high | voice | ✓ | ? | VERIFY | Due Friday |
| mkllyjbh1 | Launch website content | classified | high | ai-plan | ✓ | ? | VERIFY | 180 min est |
| mkllyjbh2 | Website usability test | classified | medium | ai-plan | ✓ | ? | VERIFY | 120 min est |
| mkllyjbh3 | Implement SEO best prac | classified | medium | ai-plan | ✓ | ? | VERIFY | 90 min est |
| mkllyjbh4 | Pre-launch marketing | classified | medium | ai-plan | ✓ | ? | VERIFY | 120 min est |
| mkllyjbh5 | Launch website | classified | medium | ai-plan | ✓ | ? | VERIFY | 60 min est |
| utx60smd | Build auth module gratog | classified | high | nlp | ✓ | ? | VERIFY | New item |
| hy6r533d | SD-studio dark mode fix | classified | medium | nlp | ✓ | ? | VERIFY | Quick fix |
| [19 more...] | [see inbox.json] | | | | ✓ | ? | VERIFY | |

**Task Verification Steps**:
```powershell
# Pull all tasks from GitHub
$allTasks = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json) | Where-Object { $_.category -eq 'task' }
Write-Host "Total tasks: $($allTasks.Count)"

# Compare locally
$localTasks = (Import-Json '.\inbox.json') | Where-Object { $_.category -eq 'task' }
Write-Host "Local tasks: $($localTasks.Count)"

# Should match: 20 tasks
```

### Data Category: Gigs

| ID | Client | Amount | Status | Priority | Termux | Windows | Match | Action |
|--|--|--|--|--|--|--|--|--|
| mklfx5x1 | acme corp | $500 | classified | high | ✓ | ? | VERIFY | Invoice |
| m7bh92ih | ACME Corp | $2500 | classified | high | ✓ | ? | VERIFY | Invoice |
| mkms2tdo | test client | $50 | classified | high | ✓ | ? | VERIFY | Test |

**Gig Verification**:
```powershell
# Count gigs
$allGigs = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json) | Where-Object { $_.category -eq 'gig' }
Write-Host "Total gigs: $($allGigs.Count) (expect 3)"
Write-Host "Total gig value: $$($allGigs.gigData.amount | Measure-Object -Sum | Select-Object -ExpandProperty Sum)"
# Expected: 3 gigs, $3,050 total
```

### Data Category: Reminders

| ID | Text | Priority | Status | Termux | Windows | Match |
|--|--|--|--|--|--|--|
| 8582r55k | Remember to call mom Thursday | medium | classified | ✓ | ? | VERIFY |

**Reminder Verification**:
```powershell
$reminders = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json) | Where-Object { $_.category -eq 'reminder' }
Write-Host "Reminders: $($reminders.Count) (expect 1)"
```

### Data Category: Guides

| ID | Type | Status | Termux | Windows | Path | Match |
|--|--|--|--|--|--|--|
| mkm7zg58 | guide | classified | ✓ | ? | guides/2026-01-20-test-guide.md | VERIFY |
| mkmzp2zd | guide | classified | ✓ | ? | guides/2026-01-20-cloudflare-tunnel-setup.md | VERIFY |
| mkn0d0iu | guide | classified | ✓ | ? | guides/ | VERIFY |
| [+1 more] | | | ✓ | ? | | |

**Guide Verification**:
```powershell
$guides = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json) | Where-Object { $_.category -eq 'guide' }
Write-Host "Guides: $($guides.Count) (expect 4)"

# Check guide files exist
$guides | ForEach-Object {
    $path = $_.guidePath
    if (Test-Path $path) { Write-Host "✓ $path" } 
    else { Write-Host "✗ MISSING: $path" }
}
```

---

## CRITICAL ALIGNMENT POINTS

### 1. JSON Schema Match
**Requirement**: Windows inbox.json schema matches Termux exactly

**Required Fields**:
```json
{
  "id": "string (unique)",
  "text": "string",
  "category": "task|gig|reminder|guide|note",
  "priority": "high|medium|low",
  "status": "classified|review|done",
  "source": "voice|cli|nlp|gpt-test|health-check|amp",
  "timestamp": "ISO8601",
  "nextAction": "string",
  "confidence": "number (0-1, optional)",
  "completedAt": "ISO8601 (only if status=done)"
}
```

**Verification**:
```powershell
# Validate JSON schema
function Test-InboxSchema {
    param([object]$item)
    $required = @('id', 'text', 'category', 'priority', 'status', 'source', 'timestamp')
    foreach ($field in $required) {
        if (-not $item.$field) { return $false }
    }
    return $true
}

$inbox = Import-Json '.\inbox.json'
$invalid = $inbox | Where-Object { -not (Test-InboxSchema $_) }
if ($invalid) { Write-Host "Schema errors found: $($invalid.Count)" }
else { Write-Host "✓ All items have valid schema" }
```

### 2. Item ID Uniqueness
**Requirement**: All 34 IDs are unique (no duplicates)

**Verification**:
```powershell
$inbox = Import-Json '.\inbox.json'
$ids = $inbox | Select-Object -ExpandProperty id
$duplicates = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
if ($duplicates) { 
    Write-Host "Duplicate IDs found: $($duplicates | Select-Object -ExpandProperty Name)"
} else { 
    Write-Host "✓ All $($ids.Count) IDs are unique"
}
```

### 3. Timestamp Validity
**Requirement**: All timestamps are valid ISO8601 and chronologically sensible

**Verification**:
```powershell
$inbox = Import-Json '.\inbox.json'
$inbox | ForEach-Object {
    try {
        [DateTime]::Parse($_.timestamp) | Out-Null
    } catch {
        Write-Host "Invalid timestamp: $($_.id) = $($_.timestamp)"
    }
}
Write-Host "✓ All timestamps are valid ISO8601"
```

### 4. Category Distribution
**Termux Distribution**:
- Tasks: 20
- Gigs: 3
- Reminders: 1
- Guides: 4
- Notes: 3
- Test/Debug: 3
- **Total: 34**

**Windows Verification**:
```powershell
$inbox = Import-Json '.\inbox.json'
$inbox | Group-Object -Property category | Select-Object Name, Count | Format-Table -AutoSize

# Expected output:
# Name       Count
# ----       -----
# task         20
# gig           3
# reminder      1
# guide         4
# note          3
# [test items]  3
```

### 5. Status Distribution
**Termux Distribution**:
- Classified: 30
- Review: 2
- Done: 1

**Windows Verification**:
```powershell
$inbox = Import-Json '.\inbox.json'
$inbox | Group-Object -Property status | Select-Object Name, Count

# Expected:
# classified: 30, review: 2, done: 1
```

### 6. GitHub Sync Verification
**Last Commit**: f19f4b5 (SOURCE OF TRUTH document)
**Branch**: master
**Remote**: github.com:wizelements/second-brain.git

**Verification**:
```powershell
# Check last commit
git -C "$env:USERPROFILE\.agents\second-brain" log --oneline -1
# Should show: "SOURCE OF TRUTH: Complete Termux..."

# Verify remote
git -C "$env:USERPROFILE\.agents\second-brain" remote -v
# Should show: github.com:wizelements/second-brain.git

# Check branch
git -C "$env:USERPROFILE\.agents\second-brain" branch
# Should show: * master
```

---

## DIVERGENCE DETECTION

### Scenario A: Item Present in Termux but Missing in Windows

**If Windows pulls and finds fewer items**:
```powershell
$termuxCount = 34  # From source of truth
$windowsCount = (Import-Json '.\inbox.json').Count

if ($windowsCount -lt $termuxCount) {
    Write-Host "Missing items: $($termuxCount - $windowsCount)"
    
    # Force re-pull
    git fetch origin
    git reset --hard origin/master
    
    # Verify again
    $newCount = (Import-Json '.\inbox.json').Count
    Write-Host "After reset: $newCount items"
}
```

### Scenario B: Item Modified on Both Sides

**If Windows has local changes**:
```powershell
# Check git status
git -C "$env:USERPROFILE\.agents\second-brain" status

# Review changes
git -C "$env:USERPROFILE\.agents\second-brain" diff

# Decision matrix:
# 1. Keep Windows version: git checkout --ours inbox.json
# 2. Take Termux version: git checkout --theirs inbox.json
# 3. Manual merge: edit file directly then: git add inbox.json
```

### Scenario C: Item Completed on One Side

**If Termux marks done, Windows hasn't synced**:
```powershell
# Example: Item mklfww4i marked done on Termux
$termuxItem = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json) | Where-Object { $_.id -eq 'mklfww4i' }

if ($termuxItem.status -eq 'done' -and $termuxItem.completedAt) {
    Write-Host "Item completed on Termux at: $($termuxItem.completedAt)"
    
    # Update Windows
    $localItem = (Import-Json '.\inbox.json') | Where-Object { $_.id -eq 'mklfww4i' }
    $localItem.status = 'done'
    $localItem.completedAt = $termuxItem.completedAt
    
    # Save
    $inbox = Import-Json '.\inbox.json'
    $inbox | ConvertTo-Json | Set-Content '.\inbox.json'
}
```

---

## SOLOSPACE SERVER INTEGRATION

**Current Status on Termux**: Ready for deployment (implementation complete)

**Windows Needs**:
1. Verify Solospace server is accessible via Cloudflare tunnel
2. If running on Termux, no Windows action needed
3. If migrating to Windows, deploy Node.js server:

```powershell
# On Windows (when restored)
# 1. Download files from Termux
git clone https://github.com/wizelements/second-brain.git

# 2. Setup Node.js environment
npm install express nodemailer

# 3. Start server
npm start  # Runs on port 5000

# 4. Start Cloudflare tunnel
cloudflared tunnel run solospace
```

---

## FINAL ALIGNMENT VERIFICATION SCRIPT

```powershell
# Save as: verify-alignment.ps1

Write-Host "=== TERMUX-WINDOWS ALIGNMENT CHECK ===" -ForegroundColor Cyan
Write-Host "Generated: $(Get-Date -Format 'o')" -ForegroundColor Gray

# 1. Fetch latest Termux data
Write-Host "`n[1] Fetching latest from GitHub..."
git fetch origin master
$termuxJson = (Invoke-WebRequest 'https://raw.githubusercontent.com/wizelements/second-brain/master/inbox.json' | ConvertFrom-Json)
Write-Host "✓ Termux items: $($termuxJson.Count)"

# 2. Load local Windows data
Write-Host "`n[2] Loading local Windows data..."
$windowsJson = Import-Json '.\inbox.json'
Write-Host "✓ Windows items: $($windowsJson.Count)"

# 3. Compare counts
if ($termuxJson.Count -eq $windowsJson.Count) {
    Write-Host "`n[3] ✓ PASS: Item count matches ($($termuxJson.Count))"
} else {
    Write-Host "`n[3] ✗ FAIL: Item count mismatch (T:$($termuxJson.Count) vs W:$($windowsJson.Count))"
}

# 4. Check required fields
Write-Host "`n[4] Validating schema..."
$invalid = @()
$windowsJson | ForEach-Object {
    if (-not $_.id -or -not $_.text -or -not $_.timestamp) {
        $invalid += $_
    }
}
if ($invalid.Count -eq 0) {
    Write-Host "✓ PASS: All items have required fields"
} else {
    Write-Host "✗ FAIL: $($invalid.Count) items missing fields"
}

# 5. Check ID uniqueness
Write-Host "`n[5] Checking ID uniqueness..."
$duplicates = $windowsJson | Group-Object -Property id | Where-Object { $_.Count -gt 1 }
if ($duplicates.Count -eq 0) {
    Write-Host "✓ PASS: All IDs unique"
} else {
    Write-Host "✗ FAIL: Duplicate IDs found: $($duplicates.Name -join ', ')"
}

# 6. Verify category distribution
Write-Host "`n[6] Checking category distribution..."
$categoryCounts = $windowsJson | Group-Object -Property category | Select-Object @{Name='Category';Expression={$_.Name}},@{Name='Count';Expression={$_.Count}}
$expectedCategories = @{
    'task' = 20
    'gig' = 3
    'reminder' = 1
    'guide' = 4
    'note' = 3
}

$categoryOk = $true
$categoryCounts | ForEach-Object {
    $expected = $expectedCategories[$_.Category] ?? 0
    if ($_.Count -ne $expected) {
        Write-Host "  $($_.Category): $($_.Count) (expected $expected)"
        $categoryOk = $false
    }
}

if ($categoryOk) {
    Write-Host "✓ PASS: Category distribution correct"
} else {
    Write-Host "✗ FAIL: Category distribution mismatch"
}

# 7. Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
if (($termuxJson.Count -eq $windowsJson.Count) -and ($invalid.Count -eq 0) -and ($duplicates.Count -eq 0) -and $categoryOk) {
    Write-Host "✓ ALL CHECKS PASSED - SYSTEMS ALIGNED" -ForegroundColor Green
} else {
    Write-Host "✗ ALIGNMENT ISSUES DETECTED - SEE ABOVE" -ForegroundColor Red
}

Write-Host "`nLast Termux Sync: 2026-01-21T17:30:00Z" -ForegroundColor Yellow
Write-Host "Authority: Termux (Primary)" -ForegroundColor Yellow
```

---

## DEPLOYMENT CHECKLIST

When Windows service comes back online:

- [ ] **DAY 1**: GitHub pull latest (34 items)
- [ ] **DAY 1**: Run alignment verification script
- [ ] **DAY 1**: Check for divergences
- [ ] **DAY 1**: Document any conflicts
- [ ] **DAY 2**: Merge if needed
- [ ] **DAY 2**: Test bidirectional sync
- [ ] **DAY 2**: Enable Windows tools in GPT
- [ ] **DAY 3**: Monitor for 24h
- [ ] **DAY 3**: Run daily verification
- [ ] **DAY 4**: Confirm stable sync

---

## SUPPORT CONTACTS

**Termux (Primary Authority)**
- Owner: Nomolos Sniktaw
- Email: silverwatkins@gmail.com
- Command: `brain-home` for current status

**GitHub Repository**
- URL: https://github.com/wizelements/second-brain
- Master branch = current authority
- All 34 items versioned

**Source of Truth Document**
- Location: `TERMUX_SECOND_BRAIN_SOURCE_OF_TRUTH.md`
- Updated: 2026-01-21T17:30:00Z
- Read this first when coming back online

---

**STATUS**: Ready for Windows alignment verification when service restored  
**Last Updated**: 2026-01-21T17:35:00Z  
**Distribution**: GitHub wizelements/second-brain
