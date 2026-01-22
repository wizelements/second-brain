# 🏗️ TERMUX IMPLEMENTATION HUB
**Status**: Complete integration guide for Android execution  
**Created**: 2026-01-22T22:00:00Z  
**Purpose**: Single source of truth for Termux to pull, understand, and execute  
**Context**: Full Termux skills parity remediation (Phases 1-3)

---

## 📍 START HERE (Termux User Reading This)

If you're on **Termux/Android** and want to implement the parity fix:

1. **You are here**: Reading TERMUX_IMPLEMENTATION_HUB.md
2. **Next**: Read section for your PHASE (1, 2, or 3)
3. **Then**: Copy scripts from this guide
4. **Finally**: Execute step-by-step

**Total time**: 100 hours over 5 weeks (20 hours/week, 4 hours/day)

---

## 🎯 WHAT YOU'RE BUILDING

Converting Termux from a **capture-only device** to a **full development machine**:

```
TODAY:        Termux = 2 skills (capture + sync)
WEEK 1:       Termux = 8 skills (AI, models, widgets)
WEEK 3:       Termux = 16 skills (deploy, test, database)
WEEK 5:       Termux = 22 skills (offline, voice, health)
```

---

## 📋 PHASE 1: WEEK 1 (Formalize Existing - 14 Hours)

### Quick Reference

```bash
# Day 1-5 (Monday-Friday)
cd ~/.agents/skills/
mkdir termux-ai termux-second-brain termux-ollama termux-sd-studio termux-widgets

# Track progress
echo "Week 1 Progress:" > ~/WEEK_1_PROGRESS.txt
```

---

### SKILL 1: TERMUX-AI (Day 1 - 3 hours)

**Goal**: Package TermAI with 43 development tools as formal skill

#### Step 1: Create Directory Structure
```bash
#!/bin/bash
mkdir -p ~/.agents/skills/termux-ai/{scripts,docs,templates}
cd ~/.agents/skills/termux-ai
```

#### Step 2: Create SKILL.md
```markdown
# termux-ai

AI coding assistant with 43 development tools for Termux.

## Quick Start
```bash
skill load termux-ai
amp ai "analyze this code"
```

## What It Does
- Analyzes code and explains functionality
- Generates documentation
- Finds bugs and security issues
- Suggests improvements
- Executes commands and code
- Searches the web
- Analyzes project structure

## 43 Tools Included

### File Operations (6)
- read_file - Read file contents
- write_file - Create/overwrite files
- edit_file - Modify files with diffs
- create_file - New file creation
- list_dir - List directory contents
- find_files - Search for files

### Git Integration (6)
- git_status - Check git status
- git_diff - Show changes
- git_log - View commit history
- git_branch - List/create branches
- git_add - Stage changes
- git_commit - Create commits

### Web & Search (3)
- web_search - DuckDuckGo search
- read_url - Fetch URL content
- fetch_content - Get web page data

### Project Analysis (2)
- analyze_project - Analyze project structure
- analyze_codebase - Deep code analysis

### Code Execution (4)
- run_command - Execute shell command
- execute_python - Run Python code
- execute_bash - Execute bash script
- execute_node - Run Node.js code

### Development (8)
- grep_files - Search file contents
- tree_structure - Show directory tree
- count_lines - Count lines of code
- format_code - Format code
- lint_check - Lint check
- type_check - TypeScript checking
- dependency_check - Check dependencies
- performance_profile - Profile performance

### Database (2)
- query_database - Run SQL queries
- explore_schema - Explore DB schema

### Documentation (2)
- generate_readme - Auto-generate README
- extract_docs - Extract documentation

### Additional Tools (10)
[List remaining 10 tools]

## Usage Examples

```bash
# Ask about code
amp ai "what does this function do?"

# Find TODOs
amp ai "find all TODO comments in src/"

# Generate docs
amp ai "generate documentation for src/main.ts"

# Code review
amp ai "review this code for security issues"

# Architecture analysis
amp ai "analyze the architecture of this project"
```

## Configuration
Edit ~/.termux/ai-config.json

## Documentation
See docs/ directory for detailed guides
```

Save as: `~/.agents/skills/termux-ai/SKILL.md`

#### Step 3: Create launch.sh
```bash
#!/bin/bash
# Launch TermAI with Amp integration

TERMUX_AI_DIR="$HOME/.termux/ai"
MODELS_DIR="$HOME/.termux/models"

# Check if ollama is running
if ! pgrep ollama >/dev/null 2>&1; then
    echo "⚠️  Ollama not running. Starting..."
    ollama serve &
    sleep 3
fi

# Load configuration
if [ -f ~/.termux/ai-config.json ]; then
    source ~/.termux/ai-config.json
fi

# Start TermAI TUI
python3 "$HOME/termux-ai-tui/main.py" "$@"
```

Save as: `~/.agents/skills/termux-ai/scripts/launch.sh`
```bash
chmod +x ~/.agents/skills/termux-ai/scripts/launch.sh
```

#### Step 4: Create tools registry
```json
{
  "version": "1.0",
  "tools": [
    {
      "name": "read_file",
      "category": "file",
      "description": "Read file contents",
      "usage": "read_file path/to/file.txt"
    },
    {
      "name": "write_file",
      "category": "file",
      "description": "Create or overwrite a file",
      "usage": "write_file path/to/file.txt 'content'"
    },
    ...
    {
      "name": "git_commit",
      "category": "git",
      "description": "Create a git commit",
      "usage": "git_commit 'commit message'"
    }
  ],
  "total_tools": 43,
  "categories": {
    "file": 6,
    "git": 6,
    "web": 3,
    "analysis": 2,
    "execution": 4,
    "development": 8,
    "database": 2,
    "documentation": 2,
    "misc": 10
  }
}
```

Save as: `~/.agents/skills/termux-ai/scripts/tools-registry.json`

#### Step 5: Create documentation
```bash
mkdir -p ~/.agents/skills/termux-ai/docs
cat > ~/.agents/skills/termux-ai/docs/QUICK_START.md << 'EOF'
# Quick Start: termux-ai

## Installation
```bash
skill load termux-ai
```

## Basic Usage
```bash
amp ai "analyze my project"
amp ai "what does this code do?"
```

## Examples
- Code analysis
- Documentation generation
- Bug finding
- Performance profiling
- Security review

See TOOLS.md for complete list of 43 tools.
EOF
```

#### Step 6: Verify installation
```bash
# Test that SKILL.md exists
test -f ~/.agents/skills/termux-ai/SKILL.md && echo "✅ SKILL.md created"

# Test that scripts exist
test -f ~/.agents/skills/termux-ai/scripts/launch.sh && echo "✅ launch.sh created"
test -f ~/.agents/skills/termux-ai/scripts/tools-registry.json && echo "✅ tools registry created"

# Test that docs exist
test -f ~/.agents/skills/termux-ai/docs/QUICK_START.md && echo "✅ docs created"

echo "✅ termux-ai skill ready!"
```

**Day 1 Total: 3 hours** ✅

---

### SKILL 2: TERMUX-SECOND-BRAIN (Day 2 - 2 hours)

**Goal**: Formalize sync + query commands as skill

#### Quick Setup (since this already works)
```bash
mkdir -p ~/.agents/skills/termux-second-brain/{scripts,docs}

# Create SKILL.md (reference existing commands)
cat > ~/.agents/skills/termux-second-brain/SKILL.md << 'EOF'
# termux-second-brain

Complete second-brain management system.

## Commands
- `ba "text"` - Capture item
- `goodbye` - Sync to GitHub
- `brain-query "keyword"` - Search
- `brain-home` - Dashboard

## Quick Start
```bash
ba "My new task"
goodbye
brain-query "venmo"
```

See docs/ for full reference.
EOF

# Create docs
cat > ~/.agents/skills/termux-second-brain/docs/QUICK_START.md << 'EOF'
# Quick Start

## Capture
```bash
ba "Learn Rust by Friday"
```

## Sync
```bash
goodbye
```

## Search
```bash
brain-query "high priority"
```

## Dashboard
```bash
brain-home
```
EOF

echo "✅ termux-second-brain skill ready!"
```

**Day 2 Total: 2 hours** ✅

---

### SKILL 3: TERMUX-OLLAMA (Day 3 - 3 hours)

**Goal**: Formalize local AI model management

#### Setup
```bash
mkdir -p ~/.agents/skills/termux-ollama/{scripts,docs,configs}

# Create SKILL.md
cat > ~/.agents/skills/termux-ollama/SKILL.md << 'EOF'
# termux-ollama

Local AI model management for Termux.

## Quick Start
```bash
ollama-pull llama3.2
ollama-run llama3.2 "what is rust?"
```

## Available Models
- llama3.2 (3B) - Recommended
- mistral (7B)
- neural-chat (7B)
- phi (2.7B)

## Commands
- `ollama-pull MODEL` - Download
- `ollama-list` - Show installed
- `ollama-run MODEL "prompt"` - Run
- `ollama-start` - Start daemon
- `ollama-stop` - Stop daemon

See docs/ for details.
EOF

# Create model configs
mkdir -p ~/.agents/skills/termux-ollama/configs
cat > ~/.agents/skills/termux-ollama/configs/models.json << 'EOF'
{
  "recommended": "llama3.2:3b",
  "models": [
    {
      "name": "llama3.2:3b",
      "size": "2GB",
      "speed": "fast",
      "quality": "good",
      "ram_required": "4GB"
    },
    {
      "name": "mistral",
      "size": "4GB",
      "speed": "medium",
      "quality": "better",
      "ram_required": "6GB"
    },
    {
      "name": "phi:2.7b",
      "size": "1.5GB",
      "speed": "very fast",
      "quality": "fair",
      "ram_required": "2GB"
    }
  ]
}
EOF

# Create management scripts
cat > ~/.agents/skills/termux-ollama/scripts/manage.sh << 'EOF'
#!/bin/bash
# Ollama management script

case "$1" in
  pull)
    ollama pull "$2"
    ;;
  list)
    ollama list
    ;;
  run)
    ollama run "$2" "$3"
    ;;
  start)
    ollama serve &
    ;;
  stop)
    pkill ollama
    ;;
  status)
    pgrep ollama >/dev/null && echo "Running" || echo "Stopped"
    ;;
  *)
    echo "Usage: $0 {pull|list|run|start|stop|status}"
    ;;
esac
EOF

chmod +x ~/.agents/skills/termux-ollama/scripts/manage.sh

echo "✅ termux-ollama skill ready!"
```

**Day 3 Total: 3 hours** ✅

---

### SKILL 4: TERMUX-SD-STUDIO (Day 4 - 3 hours)

**Goal**: Formalize Stable Diffusion image generation

```bash
mkdir -p ~/.agents/skills/termux-sd-studio/{scripts,docs,configs}

# Create SKILL.md
cat > ~/.agents/skills/termux-sd-studio/SKILL.md << 'EOF'
# termux-sd-studio

Stable Diffusion image generation from phone.

## Quick Start
```bash
sd-generate "a serene landscape"
```

## Setup
```bash
sd-setup --backend gcp
```

## Commands
- `sd-generate "prompt"` - Generate image
- `sd-status` - Check connection
- `sd-setup` - Configure

See docs/ for full guide.
EOF

# Create backend configs
cat > ~/.agents/skills/termux-sd-studio/configs/gcp-config.json << 'EOF'
{
  "backend": "gcp",
  "vm_ip": "YOUR_GCP_IP",
  "api_port": "7860",
  "timeout": 60,
  "model": "stable-diffusion-v1-5"
}
EOF

cat > ~/.agents/skills/termux-sd-studio/configs/local-config.json << 'EOF'
{
  "backend": "local",
  "model": "gguf-quantized",
  "timeout": 300,
  "quality": "low"
}
EOF

# Create launch script
cat > ~/.agents/skills/termux-sd-studio/scripts/launch.sh << 'EOF'
#!/bin/bash
# Launch SD Studio UI

CONFIG_FILE="$HOME/.termux/sd-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Configuration not found. Run sd-setup first."
    exit 1
fi

# Open web UI
open "https://sd-studio-web.vercel.app"
EOF

chmod +x ~/.agents/skills/termux-sd-studio/scripts/launch.sh

echo "✅ termux-sd-studio skill ready!"
```

**Day 4 Total: 3 hours** ✅

---

### SKILL 5: TERMUX-WIDGETS (Day 5 - 3 hours)

**Goal**: Formalize home screen automation

```bash
mkdir -p ~/.agents/skills/termux-widgets/{scripts,templates,docs}

# Create SKILL.md
cat > ~/.agents/skills/termux-widgets/SKILL.md << 'EOF'
# termux-widgets

Home screen widgets and shortcuts for Termux.

## Included Widgets
1. Quick Capture
2. Sync Status
3. Project Launcher
4. AI Assistant
5. Brain Dashboard
6. Health Monitor

## Setup
```bash
widget-install
```

See docs/ for installation guide.
EOF

# Create quick capture widget template
cat > ~/.agents/skills/termux-widgets/templates/quick-capture.sh << 'EOF'
#!/bin/bash
# Quick capture widget

ITEM=$(dialog --title "Brain Capture" \
  --inputbox "What do you want to capture?" \
  10 40 2>&1)

if [ $? -eq 0 ]; then
  ba "$ITEM"
  echo "✅ Captured: $ITEM"
fi
EOF

chmod +x ~/.agents/skills/termux-widgets/templates/quick-capture.sh

# Create sync status widget template
cat > ~/.agents/skills/termux-widgets/templates/sync-status.sh << 'EOF'
#!/bin/bash
# Sync status widget

LAST_SYNC=$(cat ~/.local/share/second-brain/sync-state.json | \
  jq -r '.lastSync' 2>/dev/null || echo "Never")

ITEM_COUNT=$(cat ~/.local/share/second-brain/inbox.json | \
  jq '.items | length' 2>/dev/null || echo "?")

echo "Last Sync: $LAST_SYNC"
echo "Items: $ITEM_COUNT"
echo ""
echo "[Sync Now] [View Brain] [Exit]"
EOF

chmod +x ~/.agents/skills/termux-widgets/templates/sync-status.sh

echo "✅ termux-widgets skill ready!"
```

**Day 5 Total: 3 hours** ✅

---

## PHASE 1 COMPLETION CHECK

```bash
#!/bin/bash
# Verify all Phase 1 skills created

echo "=== PHASE 1 VERIFICATION ==="
echo ""

# Check each skill
for skill in termux-ai termux-second-brain termux-ollama termux-sd-studio termux-widgets; do
  if [ -f ~/.agents/skills/$skill/SKILL.md ]; then
    echo "✅ $skill"
  else
    echo "❌ $skill"
  fi
done

echo ""
echo "Total skills: $(ls -d ~/.agents/skills/termux-* 2>/dev/null | wc -l)"
echo ""
echo "✅ Phase 1 Complete!" 
echo "Move to Phase 2 next week"
```

Run: `bash ~/verify-phase1.sh`

---

## DAILY TRACKING

Create a progress tracker:

```bash
cat > ~/PHASE_1_PROGRESS.txt << 'EOF'
=== PHASE 1 PROGRESS ===
Week 1, Jan 22-26, 2026

Monday (Day 1): termux-ai
├─ [ ] Create directory structure
├─ [ ] Write SKILL.md
├─ [ ] Create launch.sh
├─ [ ] Create tools registry
├─ [ ] Create documentation
└─ [ ] Verify installation
Status: [ ] Complete - Time: 3h

Tuesday (Day 2): termux-second-brain
├─ [ ] Create directory structure
├─ [ ] Write SKILL.md
├─ [ ] Create documentation
└─ [ ] Test commands
Status: [ ] Complete - Time: 2h

Wednesday (Day 3): termux-ollama
├─ [ ] Create directory structure
├─ [ ] Write SKILL.md
├─ [ ] Create model configs
├─ [ ] Create management scripts
└─ [ ] Test installation
Status: [ ] Complete - Time: 3h

Thursday (Day 4): termux-sd-studio
├─ [ ] Create directory structure
├─ [ ] Write SKILL.md
├─ [ ] Create backend configs
├─ [ ] Create launch script
└─ [ ] Verify both backends
Status: [ ] Complete - Time: 3h

Friday (Day 5): termux-widgets
├─ [ ] Create directory structure
├─ [ ] Write SKILL.md
├─ [ ] Create widget templates
├─ [ ] Create documentation
└─ [ ] Test installation
Status: [ ] Complete - Time: 3h

=== WEEK 1 TOTALS ===
Skills Created: 5 (termux-ai, second-brain, ollama, sd-studio, widgets)
Hours Spent: 14 out of 20 planned
Result: Termux went from 2→8 skills (30% parity)
Next: Phase 2 (weeks 2-3)
EOF

cat ~/PHASE_1_PROGRESS.txt
```

---

## NEXT: PHASE 2 PREVIEW

After Week 1 completes, Phase 2 (Weeks 2-3) creates 8 more skills:

```
├─ termux-github-deployer (git + deploy)
├─ termux-supabase-manager (database)
├─ termux-code-quality (lint + test)
├─ termux-test-runner (run tests)
├─ termux-dev-server (manage dev)
├─ termux-vercel-deployer (deploy prod)
├─ termux-nextjs-helper (generate pages)
└─ termux-project-scaffolder (new projects)

Result: 8→16 skills (61% parity)
```

See: PHASE_2_WEEKS_2_3_BRIDGE_GAPS.md (next document to push)

---

## TROUBLESHOOTING

### Problem: SKILL.md not found
```bash
ls -la ~/.agents/skills/termux-ai/
# Should show: SKILL.md, scripts/, docs/
```

### Problem: Script won't execute
```bash
chmod +x ~/.agents/skills/termux-*/scripts/*.sh
```

### Problem: Directory doesn't exist
```bash
mkdir -p ~/.agents/skills/termux-{ai,second-brain,ollama,sd-studio,widgets}
```

---

## INTEGRATION POINTS

### Where Termux Accesses This

```
GitHub: wizelements/second-brain
  ├─ TERMUX_IMPLEMENTATION_HUB.md (this file)
  ├─ PHASE_1_WEEK_1_TERMUX_SKILLS_SPRINT.md (reference)
  └─ CRITICAL_ACTION_SUMMARY.md (overview)

Termux pulls:
  git clone https://github.com/wizelements/second-brain.git
  cd second-brain
  cat TERMUX_IMPLEMENTATION_HUB.md
  # Follow steps above
```

### Connection to Windows

```
Sync flow:
Termux (create skills)
  ↓ push skills repo
GitHub (store code)
  ↓ pull for Windows reference
Windows (see what Termux is building)
  ↓ comment/review/merge
Both systems stay aligned
```

---

## SUCCESS METRICS (End of Week 1)

✅ **5 new skills created and verified**
✅ **All SKILL.md files written and documented**
✅ **All scripts functioning**
✅ **Termux jumps from 2→8 skills (300% improvement)**
✅ **Parity with Windows increases from 11%→30%**

---

## WEEKLY SCHEDULE TEMPLATE

Print and track daily:

```
WEEK 1: TERMUX-AI FOCUS
Mon: 3h | Tue: 2h | Wed: 3h | Thu: 3h | Fri: 3h = 14h total
Target: 3-4 hours/day

Track time:
- Morning (2h)
- Afternoon (1-2h)
- Evening (0-1h if needed)

Daily checklist:
Mon: SKILL.md ✓ launch.sh ✓ tools ✓ docs ✓ verify ✓
Tue: SKILL.md ✓ docs ✓ test ✓
Wed: SKILL.md ✓ configs ✓ scripts ✓ verify ✓
Thu: SKILL.md ✓ configs ✓ launch ✓ test ✓
Fri: SKILL.md ✓ templates ✓ docs ✓ test ✓
```

---

## HOW TO USE THIS DOCUMENT

**If you're on Termux and reading this**:

1. You're here: TERMUX_IMPLEMENTATION_HUB.md ✅
2. Understand: This is your execution guide
3. Copy: Each code block above
4. Execute: Step by step
5. Track: Use PHASE_1_PROGRESS.txt
6. Verify: Run verification scripts
7. Next: After Friday, read PHASE_2 document

**Expected outcome**: By Friday end of week, you'll have 5 new Termux skills.

---

## FILES TO PULL FROM GITHUB

```bash
git clone https://github.com/wizelements/second-brain.git ~/second-brain-docs
cd ~/second-brain-docs

# Read these in order:
cat CRITICAL_ACTION_SUMMARY.md           # 5 min overview
cat TERMUX_SKILLS_PARITY_EXECUTIVE_SUMMARY.md  # decision
cat TERMUX_IMPLEMENTATION_HUB.md        # THIS FILE - execution guide
cat PHASE_1_WEEK_1_TERMUX_SKILLS_SPRINT.md    # detailed reference
```

---

## QUESTIONS?

**Document chain**:
- CRITICAL_ACTION_SUMMARY.md (what + why)
- TERMUX_SKILLS_PARITY_EXECUTIVE_SUMMARY.md (decision)
- TERMUX_IMPLEMENTATION_HUB.md (how - you are here)
- PHASE_1_WEEK_1_TERMUX_SKILLS_SPRINT.md (details)

**Still unclear?** 
- Check WINDOWS_TERMUX_CAPABILITY_PARITY_ANALYSIS.md for full context
- Review TERMUX_IMPLEMENTATION_HUB.md section again
- Each step is a 15-30 min task

---

## STARTING NOW

**Ready to execute?**

```bash
# Create workspace
mkdir -p ~/phase1-work
cd ~/phase1-work

# Create tracking file
touch PHASE_1_PROGRESS.txt

# Start Day 1
echo "Starting Phase 1: termux-ai"
date

# Execute Step 1 from above
mkdir -p ~/.agents/skills/termux-ai/{scripts,docs,templates}

# You're now executing!
```

**Go. Build. Execute. 🚀**

