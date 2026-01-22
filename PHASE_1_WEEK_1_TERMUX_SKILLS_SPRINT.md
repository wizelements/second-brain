# 🎯 PHASE 1: WEEK 1 TERMUX SKILLS SPRINT
**Status**: Ready to execute (start immediately)  
**Duration**: 5 days (20 hours total)  
**Goal**: Create 5 formal Termux skills, jump from 3→8 skills (167% improvement)  

---

## 📋 SPRINT OVERVIEW

**Target**: Package existing Termux capabilities as formal Amp-compatible skills

```
Day 1: termux-ai (formalize TermAI with 43 tools)
Day 2: termux-second-brain (formalize sync + query)
Day 3: termux-ollama (formalize local AI models)
Day 4: termux-sd-studio (formalize image generation)
Day 5: termux-widgets (formalize home screen automation)

Result: Termux jumps from 2→8 skills
Time: 3-4 hours/day × 5 days = 20 hours
```

---

## SKILL 1: TERMUX-AI

### What It Is
Formal skill wrapper around existing TermAI (43 development tools)

### File Structure
```
~/.agents/skills/termux-ai/
├── SKILL.md (interface definition)
├── README.md (user guide)
├── scripts/
│   ├── launch.sh (start TermAI)
│   ├── tools.sh (tool registry)
│   ├── install.sh (install dependencies)
│   └── test.sh (verify all tools)
├── docs/
│   ├── TOOLS.md (all 43 tools listed)
│   ├── QUICK_START.md (5-min start)
│   ├── EXAMPLES.md (usage examples)
│   └── ARCHITECTURE.md (how it works)
└── templates/
    ├── default-config.json
    └─ alias-setup.sh
```

### Tools Provided (43 total)

```
FILE OPERATIONS (6):
├─ read_file
├─ write_file
├─ edit_file
├─ create_file
├─ list_dir
└─ find_files

GIT INTEGRATION (6):
├─ git_status
├─ git_diff
├─ git_log
├─ git_branch
├─ git_add
└─ git_commit

WEB & SEARCH (3):
├─ web_search (DuckDuckGo)
├─ read_url
└─ fetch_content

PROJECT ANALYSIS (2):
├─ analyze_project
└─ analyze_codebase

CODE EXECUTION (4):
├─ run_command
├─ execute_python
├─ execute_bash
└─ execute_node

DEVELOPMENT (8):
├─ grep_files
├─ tree_structure
├─ count_lines
├─ format_code
├─ lint_check
├─ type_check
├─ dependency_check
└─ performance_profile

DATABASE (2):
├─ query_database
└─ explore_schema

DOCUMENTATION (2):
├─ generate_readme
└─ extract_docs

[... 8 more tools]
```

### SKILL.md Content
```markdown
# termux-ai

AI coding assistant with 43 development tools for Termux.

## Quick Start
```bash
skill load termux-ai
amp ai "analyze this code"
```

## Features
- File operations (read, write, edit)
- Git integration
- Web search
- Code analysis
- Command execution
- Dependency checking
- Type checking

## Tools (43 total)
[List all 43 tools with descriptions]

## Configuration
Edit ~/.termux/ai-config.json to customize.

## Examples
- `amp ai "what does this function do?"`
- `amp ai "find all TODO comments"`
- `amp ai "generate function documentation"`
```

### Time Estimate
- Create SKILL.md: 30 min
- Create tools registry: 30 min
- Create documentation: 45 min
- Create launch script: 30 min
- Testing: 30 min
**Total: 2.5-3 hours**

---

## SKILL 2: TERMUX-SECOND-BRAIN

### What It Is
Formal skill wrapper around existing second-brain sync + query

### File Structure
```
~/.agents/skills/termux-second-brain/
├── SKILL.md
├── README.md
├── scripts/
│   ├── capture.sh (ba wrapper)
│   ├── sync.sh (goodbye wrapper)
│   ├── query.sh (brain-query wrapper)
│   ├── dashboard.sh (brain-home wrapper)
│   ├── import.sh (import from other sources)
│   └── export.sh (export brain data)
├── docs/
│   ├── QUICK_START.md
│   ├── COMMAND_REFERENCE.md
│   ├── DATA_FORMAT.md
│   └─ AUTOMATION.md
└── templates/
    ├── capture-templates.json
    └─ automation-rules.json
```

### Commands Provided

```bash
# Core commands
ba "task text"              # Capture item
goodbye                     # Sync to GitHub
brain-query "keyword"       # Search brain
brain-home                  # Dashboard
brain-status               # Sync status

# Advanced
brain-export               # Export as JSON
brain-import "file.json"   # Import items
brain-analyze              # Statistics
brain-backup               # Local backup
```

### SKILL.md Content
```markdown
# termux-second-brain

Complete second-brain management for Termux.

## Quick Start
```bash
ba "My new task"
goodbye
brain-query "venmo"
```

## Features
- Capture via `ba` command
- Full-text search via `brain-query`
- GitHub sync via `goodbye`
- Local dashboard
- Statistics + analytics
- Import/export data

## Configuration
Edit ~/.local/share/second-brain/config.json

## Examples
- `ba "Fixed race condition in booking"`
- `brain-query "similar bugs"`
- `brain-analyze --show-trends`
```

### Time Estimate
- Create SKILL.md: 20 min
- Organize scripts: 30 min
- Create documentation: 30 min
- Test all commands: 30 min
**Total: 1.5-2 hours**

---

## SKILL 3: TERMUX-OLLAMA

### What It Is
Formal skill for local AI model management (Ollama)

### File Structure
```
~/.agents/skills/termux-ollama/
├── SKILL.md
├── README.md
├── scripts/
│   ├── install.sh (install Ollama)
│   ├── start.sh (start daemon)
│   ├── stop.sh (stop daemon)
│   ├── pull-model.sh (download models)
│   ├── list-models.sh (show installed)
│   ├── delete-model.sh (remove model)
│   ├── run-model.sh (run inference)
│   └─ health-check.sh (verify setup)
├── docs/
│   ├── MODELS.md (available models)
│   ├── SETUP.md (installation guide)
│   ├── PERFORMANCE.md (benchmarks)
│   └─ TROUBLESHOOTING.md
└── models/
    ├─ recommended.txt
    └─ configs/
        ├─ llama3.json
        ├─ mistral.json
        └─ neural-chat.json
```

### Models Provided

```
RECOMMENDED:
├─ llama3.2 (small, fast)
│  └─ 3B version (fits on phone)
│
├─ mistral (balanced)
│  └─ 7B version (larger models)
│
├─ neural-chat (optimized for tasks)
│  └─ 7B version
│
└─ phi (super lightweight)
   └─ 2.7B version (minimal memory)

OPTIONAL:
├─ codellama (code-specific)
├─ orca (reasoning)
└─ openchat (chat-optimized)
```

### Commands Provided

```bash
# Management
ollama-pull llama3.2       # Download model
ollama-list                # Show installed
ollama-delete llama3       # Remove model

# Usage
ollama-run llama3 "prompt" # Run inference
ollama-start               # Start daemon
ollama-stop                # Stop daemon
ollama-status              # Check health

# Configuration
ollama-config get          # Show settings
ollama-config set key val  # Change setting
ollama-benchmark           # Performance test
```

### Time Estimate
- Create SKILL.md: 30 min
- Organize scripts: 45 min
- Create documentation: 45 min
- Test all models: 45 min
**Total: 2.5-3 hours**

---

## SKILL 4: TERMUX-SD-STUDIO

### What It Is
Formal skill for Stable Diffusion image generation from phone

### File Structure
```
~/.agents/skills/termux-sd-studio/
├── SKILL.md
├── README.md
├── scripts/
│   ├── configure.sh (setup backend)
│   ├── launch-ui.sh (open web UI)
│   ├── test-backend.sh (verify connection)
│   ├── deploy-backend.sh (GCP setup)
│   ├── models.sh (manage models)
│   └─ health-check.sh
├── docs/
│   ├── QUICK_START.md
│   ├── BACKEND_SETUP.md (GCP guide)
│   ├── LOCAL_SETUP.md (on-device)
│   └─ TROUBLESHOOTING.md
└── configs/
    ├─ gcp-config.json
    ├─ local-config.json
    └─ model-list.json
```

### Backend Options

```
OPTION 1: Remote (GCP) - Recommended
├─ Cost: ~$0.45/hour
├─ Speed: 10-30 seconds/image
├─ Models: Unlimited (Stable Diffusion + custom)
└─ Setup: 10 minutes

OPTION 2: Local - Offline
├─ Cost: Phone battery + storage
├─ Speed: 5-10 min/image (depends on phone)
├─ Models: Small ones only (GGUF quantized)
└─ Setup: 20 minutes

OPTION 3: Hybrid
├─ Use local for fast preview
├─ Use GCP for high-quality final
└─ Best of both
```

### Commands Provided

```bash
# Setup
sd-setup --backend gcp     # Configure GCP backend
sd-setup --backend local   # Configure local

# Usage
sd-generate "prompt"       # Generate image
sd-generate-advanced       # Interactive UI
sd-upscale "image.png"     # Upscale existing

# Management
sd-models list             # Show models
sd-models pull <name>      # Download model
sd-status                  # Check connection
sd-benchmark               # Speed test
```

### Time Estimate
- Create SKILL.md: 30 min
- Organize scripts: 45 min
- Create documentation: 60 min
- Test setup: 30 min
**Total: 2.5-3 hours**

---

## SKILL 5: TERMUX-WIDGETS

### What It Is
Formal skill for home screen automation & widgets

### File Structure
```
~/.agents/skills/termux-widgets/
├── SKILL.md
├── README.md
├── scripts/
│   ├── install-app.sh (install Termux:Widget)
│   ├── create-widget.sh (add to home screen)
│   ├── manager.sh (manage widgets)
│   └─ test-widget.sh
├── templates/
│   ├── quick-capture.sh
│   ├── sync-status.sh
│   ├── project-launcher.sh
│   ├── ai-assistant.sh
│   ├─ second-brain-dash.sh
│   └─ health-monitor.sh
├── docs/
│   ├── SETUP.md
│   ├── TEMPLATE_GUIDE.md
│   ├── EXAMPLES.md
│   └─ TROUBLESHOOTING.md
└── configs/
    └─ default-widgets.json
```

### Widgets Provided

```
WIDGET 1: Quick Capture
├─ Shows capture field
├─ Voice or text input
└─ Auto-syncs after capture

WIDGET 2: Sync Status
├─ Shows last sync time
├─ Item count
├─ Sync health score
└─ Quick sync button

WIDGET 3: Project Launcher
├─ List of projects
├─ One-tap to open
└─ Shows current branch

WIDGET 4: AI Assistant
├─ Quick AI query
├─ Answer in widget
└─ No app launch needed

WIDGET 5: Second Brain Dashboard
├─ High-priority items
├─ Due dates
├─ Recent captures
└─ Search box

WIDGET 6: Health Monitor
├─ Battery %
├─ Storage %
├─ CPU usage
└─ Sync health alerts
```

### Setup Steps

```bash
1. Install Termux:Widget app from F-Droid
2. Run: widget-install
3. Choose widgets to add
4. Long-press home screen → Add widget
5. Select "Termux:Widget"
6. Choose script (quick-capture, sync-status, etc.)
7. Done!
```

### Time Estimate
- Create SKILL.md: 30 min
- Create widget templates: 60 min
- Create documentation: 45 min
- Test installation: 30 min
**Total: 2.5-3 hours**

---

## DAILY SCHEDULE

### Day 1: termux-ai
```
Morning (90 min):
├─ Create SKILL.md structure
├─ List all 43 tools
└─ Write descriptions

Afternoon (90 min):
├─ Create launch script
├─ Create tools registry
└─ Write quick-start guide

Time: 3 hours
Deliverable: termux-ai skill ready
```

### Day 2: termux-second-brain
```
Morning (90 min):
├─ Create SKILL.md
├─ Organize existing scripts
└─ Write command reference

Afternoon (30 min):
├─ Create documentation
└─ Test all commands

Time: 2 hours
Deliverable: termux-second-brain skill ready
```

### Day 3: termux-ollama
```
Morning (90 min):
├─ Create SKILL.md
├─ Document all models
└─ Write installation guide

Afternoon (90 min):
├─ Create management scripts
├─ Create model configs
└─ Test installation

Time: 3 hours
Deliverable: termux-ollama skill ready
```

### Day 4: termux-sd-studio
```
Morning (120 min):
├─ Create SKILL.md
├─ Document backends (GCP, local)
└─ Write setup guides

Afternoon (60 min):
├─ Create configuration templates
├─ Create launch scripts
└─ Test both backends

Time: 3 hours
Deliverable: termux-sd-studio skill ready
```

### Day 5: termux-widgets
```
Morning (120 min):
├─ Create SKILL.md
├─ Create widget templates (6 total)
└─ Write setup guide

Afternoon (60 min):
├─ Create documentation
├─ Test widget installation
└─ Create example configurations

Time: 3 hours
Deliverable: termux-widgets skill ready
```

---

## DELIVERABLES (End of Week 1)

### GitHub Structure
```
~/.agents/skills/
├── termux-ai/              ✅ NEW
│   ├── SKILL.md
│   ├── scripts/
│   ├── docs/
│   └── templates/
│
├── termux-second-brain/    ✅ NEW
│   ├── SKILL.md
│   ├── scripts/
│   ├── docs/
│   └── templates/
│
├── termux-ollama/          ✅ NEW
│   ├── SKILL.md
│   ├── scripts/
│   ├── docs/
│   ├── models/
│   └── configs/
│
├── termux-sd-studio/       ✅ NEW
│   ├── SKILL.md
│   ├── scripts/
│   ├── docs/
│   └── configs/
│
├── termux-widgets/         ✅ NEW
│   ├── SKILL.md
│   ├── scripts/
│   ├── templates/
│   ├── docs/
│   └── configs/
│
└── [existing skills...]
```

### Verification Checklist

```
termux-ai:
├─ [ ] SKILL.md written
├─ [ ] All 43 tools documented
├─ [ ] launch.sh works
├─ [ ] Installation guide complete
└─ [ ] Tested on actual Termux

termux-second-brain:
├─ [ ] SKILL.md written
├─ [ ] All commands tested
├─ [ ] Documentation complete
├─ [ ] Examples provided
└─ [ ] Sync still works

termux-ollama:
├─ [ ] SKILL.md written
├─ [ ] All models documented
├─ [ ] Installation script works
├─ [ ] Models can be pulled
└─ [ ] Inference tested

termux-sd-studio:
├─ [ ] SKILL.md written
├─ [ ] Both backends configured
├─ [ ] Launch script works
├─ [ ] Models list provided
└─ [ ] UI launches

termux-widgets:
├─ [ ] SKILL.md written
├─ [ ] 6 widgets created
├─ [ ] Installation tested
├─ [ ] All templates work
└─ [ ] Documentation complete
```

---

## SUCCESS METRICS (End of Week)

```
Current:
└─ Termux: 2-3 skills

After Phase 1:
└─ Termux: 8 skills ✅

Improvement:
└─ +5 skills (167% increase)
└─ 30% parity with Windows (vs 11% today)
└─ All tools documented
└─ All tools discoverable via "amp skill"
```

---

## TIME TRACKING

```
Day 1: 3 hours (termux-ai)
Day 2: 2 hours (termux-second-brain)
Day 3: 3 hours (termux-ollama)
Day 4: 3 hours (termux-sd-studio)
Day 5: 3 hours (termux-widgets)
──────────────
Total: 14-15 hours (aim for 20 total with testing/Polish)

Buffer: 5-6 hours for:
├─ Integration testing
├─ Documentation polish
├─ Bug fixes
└─ GitHub publishing
```

---

## DEPENDENCIES & BLOCKERS

### What's Already Available
```
✅ TermAI code (43 tools ready to package)
✅ Second brain sync scripts (ready to organize)
✅ Ollama installation (already working)
✅ SD Studio configuration (already tested)
✅ Termux:Widget app (user can install from F-Droid)
```

### No Blockers
```
All tools and scripts already exist.
This is 100% PACKAGING and DOCUMENTATION work.
No new code to write, just organize existing code.
```

---

## NEXT PHASE TRIGGER

**After Week 1 complete**: Schedule Phase 2 (Weeks 2-3)

**Phase 2 tasks**:
- Bridge gaps: Deploy, test, database skills
- Create: termux-github-deployer, termux-test-runner, etc.
- Goal: Reach 16 skills (61% parity)

---

## 🎯 START NOW

**Ready?**

1. Create sprint board with these 5 skills
2. Allocate 3-4 hours/day for 5 days
3. Publish skills to GitHub by Friday
4. Update capability scorecard (3→8 skills)

**You'll jump from 11% to 30% parity with Windows in one week.**

