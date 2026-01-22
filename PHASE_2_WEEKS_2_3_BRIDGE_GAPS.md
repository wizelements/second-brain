# 🌉 PHASE 2: WEEKS 2-3 BRIDGE GAPS
**Status**: Ready to execute (start after Phase 1)  
**Duration**: 10 days (40 hours total)  
**Goal**: Create 8 bridge skills, reach 61% parity (8→16 skills)  
**Location**: Pull from GitHub after Phase 1 complete

---

## 📋 WHAT YOU'RE BUILDING

After Phase 1, Termux has: ai, second-brain, ollama, sd-studio, widgets

Now add: deployment, database, quality, testing, servers, and more

```
PHASE 1 SKILLS (5):     AI, Sync, Models, Images, Widgets
PHASE 2 SKILLS (8):     Deploy, Database, Quality, Testing, Server, Vercel, Next.js, Scaffold
RESULT:                 8→16 skills (30%→61% parity)
```

---

## PHASE 2 SKILL BREAKDOWN

| Day | Skill | Focus | Hours |
|-----|-------|-------|-------|
| 1-2 | termux-github-deployer | Git + deploy | 5 |
| 3-4 | termux-supabase-manager | Database ops | 5 |
| 5 | termux-code-quality | Lint + format | 4 |
| 6 | termux-test-runner | Run tests | 4 |
| 7 | termux-dev-server | Dev server | 4 |
| 8-9 | termux-vercel-deployer | Deploy to prod | 5 |
| 10 | termux-nextjs-helper + termux-project-scaffolder | Generate + scaffold | 8 |

**Total**: 40 hours (4 hours/day × 10 days)

---

## SKILL 1: TERMUX-GITHUB-DEPLOYER (Days 1-2, 5 hours)

**What**: Git operations + GitHub automation from Termux

### Directory Structure
```bash
mkdir -p ~/.agents/skills/termux-github-deployer/{scripts,docs,templates}
```

### SKILL.md
```markdown
# termux-github-deployer

Git operations and GitHub automation for Termux.

## Quick Start
```bash
gd "commit message"     # commit + push
pr "PR Title"           # create pull request
```

## Commands
- `gd "message"` - Commit and push
- `pr "Title"` - Create pull request
- `branch create feature` - New branch
- `branch list` - List branches
- `sync` - Pull + rebase
- `undo` - Undo last commit

## Examples
```bash
gd "Fix: race condition in booking"
pr "Add payment retry logic"
branch create feature/payments
```

## Configuration
Edit ~/.termux/git-config.json
```
EOF
```

Save to: `~/.agents/skills/termux-github-deployer/SKILL.md`

### Key Scripts

#### deploy.sh (commit + push in one)
```bash
#!/bin/bash
# Git deploy: commit + push

if [ $# -eq 0 ]; then
  echo "Usage: gd 'commit message'"
  exit 1
fi

MESSAGE="$1"

# Check if anything to commit
if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to commit"
  exit 0
fi

# Commit
git add -A
git commit -m "$MESSAGE"

# Push
echo "Pushing..."
git push origin $(git rev-parse --abbrev-ref HEAD)

echo "✅ Deployed: $MESSAGE"
```

#### pr.sh (create pull request)
```bash
#!/bin/bash
# Create pull request

TITLE="$1"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE="${2:-develop}"

# Requires GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "GitHub CLI required. Install: pkg install gh"
  exit 1
fi

# Create PR
gh pr create --title "$TITLE" --base "$BASE" --head "$BRANCH"

echo "✅ PR created: $TITLE"
```

#### branch.sh (branch management)
```bash
#!/bin/bash
# Branch management

case "$1" in
  create)
    git checkout -b "$2"
    echo "✅ Created branch: $2"
    ;;
  list)
    git branch -a
    ;;
  delete)
    git branch -D "$2"
    echo "✅ Deleted branch: $2"
    ;;
  switch)
    git checkout "$2"
    echo "✅ Switched to: $2"
    ;;
  *)
    echo "Usage: branch {create|list|delete|switch}"
    ;;
esac
```

#### sync.sh (pull + rebase)
```bash
#!/bin/bash
# Sync with remote

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Fetching from origin..."
git fetch origin

echo "Rebasing $BRANCH..."
git rebase origin/$BRANCH

echo "✅ Synced with origin"
```

### Documentation
```bash
mkdir -p ~/.agents/skills/termux-github-deployer/docs
cat > ~/.agents/skills/termux-github-deployer/docs/QUICK_REFERENCE.md << 'EOF'
# Git Deploy Commands

## Basic
- `gd "message"` - commit + push
- `sync` - pull latest + rebase
- `status` - show status

## Branches
- `branch list` - show all
- `branch create feature/name` - new branch
- `branch switch feature/name` - switch
- `branch delete feature/name` - delete

## PRs
- `pr "Title"` - create PR to develop
- `pr "Title" main` - create PR to main

## Advanced
- `undo` - undo last commit
- `amend "new message"` - amend last commit
- `rebase develop` - rebase onto develop

## Examples
```bash
# Feature workflow
branch create feature/payments
gd "WIP: add payment retry"
gd "Add retry logic"
gd "Add tests"
pr "Add payment retry mechanism"

# Hotfix workflow
branch create hotfix/critical-bug
gd "Fix: critical auth bug"
pr "Fix critical auth bug" main
```
EOF
```

**Save all scripts and docs to**: `~/.agents/skills/termux-github-deployer/`

---

## SKILL 2: TERMUX-SUPABASE-MANAGER (Days 3-4, 5 hours)

**What**: Database migrations, type generation, seeding

### Directory Structure
```bash
mkdir -p ~/.agents/skills/termux-supabase-manager/{scripts,docs,templates}
```

### SKILL.md
```markdown
# termux-supabase-manager

Supabase database management from Termux.

## Quick Start
```bash
db-migrate         # Run migrations
db-types           # Generate TypeScript types
db-seed dev        # Seed development data
```

## Commands
- `db-migrate` - Run pending migrations
- `db-types` - Generate types from schema
- `db-seed dev` - Seed dev data
- `db-seed prod` - Seed production data
- `db-query` - Run SQL query
- `db-backup` - Backup database

## Examples
```bash
db-migrate
db-types
db-seed dev
```

## Configuration
~/.env.local must have SUPABASE_URL and SUPABASE_KEY
```
EOF
```

### Key Scripts

#### migrate.sh
```bash
#!/bin/bash
# Run Supabase migrations

MIGRATION_DIR="supabase/migrations"

if [ ! -d "$MIGRATION_DIR" ]; then
  echo "No migrations directory found"
  exit 1
fi

# Run migrations
supabase migration up

echo "✅ Migrations complete"
```

#### types.sh
```bash
#!/bin/bash
# Generate TypeScript types from Supabase schema

if [ ! -f ".env.local" ]; then
  echo "Missing .env.local"
  exit 1
fi

# Generate types
supabase gen types typescript --db-url $SUPABASE_DB_URL > lib/types.ts

echo "✅ Types generated: lib/types.ts"
```

#### seed.sh
```bash
#!/bin/bash
# Seed database

ENV="${1:-dev}"

if [ "$ENV" = "dev" ]; then
  # Dev data
  supabase db push
  node scripts/seed-dev.js
  echo "✅ Dev data seeded"
elif [ "$ENV" = "prod" ]; then
  echo "⚠️  Production seeding requires confirmation"
  read -p "Continue? (yes/no) " confirm
  if [ "$confirm" = "yes" ]; then
    node scripts/seed-prod.js
    echo "✅ Production data seeded"
  fi
fi
```

---

## SKILL 3: TERMUX-CODE-QUALITY (Day 5, 4 hours)

**What**: Linting, formatting, type checking

### SKILL.md
```markdown
# termux-code-quality

Code quality tools for Termux.

## Quick Start
```bash
lint      # Lint check
format    # Auto-format
typecheck # TypeScript check
```

## Commands
- `lint` - Run ESLint
- `format` - Auto-format with Prettier
- `typecheck` - TypeScript check
- `fix` - Auto-fix issues

## Example
```bash
lint      # Find issues
fix       # Auto-fix
format    # Reformat code
typecheck # Check types
```
EOF
```

### Key Scripts

#### check.sh
```bash
#!/bin/bash
# Check code quality

echo "🔍 Linting..."
npm run lint

echo "🔍 Type checking..."
npm run typecheck

echo "✅ All checks passed"
```

#### format.sh
```bash
#!/bin/bash
# Auto-format code

echo "📝 Formatting..."
npx prettier --write .

echo "✅ Formatted"
```

---

## SKILL 4: TERMUX-TEST-RUNNER (Day 6, 4 hours)

**What**: Run tests, coverage, watch mode

### SKILL.md
```markdown
# termux-test-runner

Test execution for Termux.

## Quick Start
```bash
test           # Run tests
test --watch   # Watch mode
coverage       # Coverage report
```

## Commands
- `test` - Run all tests
- `test --watch` - Watch mode
- `test --filter name` - Filter tests
- `coverage` - Coverage report

## Examples
```bash
test
test --watch
coverage --open
```
EOF
```

### Key Scripts

#### test.sh
```bash
#!/bin/bash
# Run tests

if [ "$1" = "--watch" ]; then
  npm run test -- --watch
elif [ "$1" = "--coverage" ]; then
  npm run test -- --coverage
else
  npm run test
fi

echo "✅ Tests complete"
```

---

## SKILL 5: TERMUX-DEV-SERVER (Day 7, 4 hours)

**What**: Start/stop dev server, manage ports

### SKILL.md
```markdown
# termux-dev-server

Development server management.

## Quick Start
```bash
dev        # Start dev server
dev stop   # Stop server
```

## Commands
- `dev` - Start dev server on 3000
- `dev --port 8000` - Custom port
- `dev stop` - Stop server
- `dev logs` - Show logs

## Examples
```bash
dev
# Server running on http://localhost:3000
```
EOF
```

### Key Scripts

#### start.sh
```bash
#!/bin/bash
# Start dev server

PORT="${1:-3000}"

echo "Starting dev server on port $PORT..."
npm run dev -- --port $PORT

echo "✅ Dev server running on http://localhost:$PORT"
```

---

## SKILL 6: TERMUX-VERCEL-DEPLOYER (Days 8-9, 5 hours)

**What**: Deploy to Vercel from Termux

### SKILL.md
```markdown
# termux-vercel-deployer

Vercel deployment automation.

## Quick Start
```bash
vercel-deploy         # Deploy to production
vercel-preview        # Deploy preview
```

## Commands
- `vercel-deploy` - Deploy to production
- `vercel-preview` - Deploy preview
- `vercel-env` - Manage environment variables
- `vercel-logs` - Show deployment logs

## Examples
```bash
vercel-deploy
```
EOF
```

### Key Scripts

#### deploy.sh
```bash
#!/bin/bash
# Deploy to Vercel

if [ "$1" = "production" ]; then
  echo "Deploying to production..."
  vercel --prod
  echo "✅ Production deployment complete"
else
  echo "Deploying preview..."
  vercel
  echo "✅ Preview deployment complete"
fi
```

---

## SKILL 7-8: TERMUX-NEXTJS-HELPER + TERMUX-PROJECT-SCAFFOLDER (Day 10, 8 hours)

**What**: Generate Next.js pages/routes, scaffold projects

### SKILL.md (nextjs-helper)
```markdown
# termux-nextjs-helper

Next.js development helpers.

## Quick Start
```bash
nextjs-page app/dashboard
nextjs-api users GET,POST
```

## Commands
- `nextjs-page path` - Generate page
- `nextjs-api path METHODS` - Generate API
- `nextjs-component ComponentName` - Generate component

## Examples
```bash
nextjs-page app/products
nextjs-api api/products GET,POST,DELETE
```
EOF
```

### SKILL.md (project-scaffolder)
```markdown
# termux-project-scaffolder

Scaffold new projects.

## Quick Start
```bash
scaffold-project my-app
```

## Commands
- `scaffold next` - Next.js + Supabase
- `scaffold remix` - Remix + Supabase
- `scaffold sveltekit` - SvelteKit + Supabase

## Examples
```bash
scaffold next my-project
```
EOF
```

---

## PHASE 2 VERIFICATION

```bash
#!/bin/bash
# Verify all Phase 2 skills

echo "=== PHASE 2 VERIFICATION ==="
echo ""

for skill in termux-github-deployer termux-supabase-manager \
            termux-code-quality termux-test-runner \
            termux-dev-server termux-vercel-deployer \
            termux-nextjs-helper termux-project-scaffolder; do
  if [ -f ~/.agents/skills/$skill/SKILL.md ]; then
    echo "✅ $skill"
  else
    echo "❌ $skill"
  fi
done

echo ""
echo "Total skills now: $(ls -d ~/.agents/skills/termux-* 2>/dev/null | wc -l)"
echo "Expected: 13 (5 from Phase 1 + 8 from Phase 2)"
```

---

## DAILY SCHEDULE

```
Day 1-2 (Mon-Tue): termux-github-deployer
├─ SKILL.md
├─ deploy.sh (commit + push)
├─ pr.sh (create PR)
├─ branch.sh (branch ops)
├─ sync.sh (pull + rebase)
└─ Documentation

Day 3-4 (Wed-Thu): termux-supabase-manager
├─ SKILL.md
├─ migrate.sh
├─ types.sh
├─ seed.sh
└─ Documentation

Day 5 (Fri): termux-code-quality
├─ SKILL.md
├─ check.sh
├─ format.sh
└─ Documentation

Day 6 (Mon): termux-test-runner
├─ SKILL.md
├─ test.sh
└─ Documentation

Day 7 (Tue): termux-dev-server
├─ SKILL.md
├─ start.sh
└─ Documentation

Day 8-9 (Wed-Thu): termux-vercel-deployer
├─ SKILL.md
├─ deploy.sh
└─ Documentation

Day 10 (Fri): termux-nextjs-helper + termux-project-scaffolder
├─ Both SKILL.md files
├─ Scripts
└─ Documentation
```

---

## INTEGRATION WITH PHASE 1

**Before Phase 2 starts**:
```bash
# Pull latest from GitHub
cd ~/second-brain-docs
git pull

# Read this document
cat PHASE_2_WEEKS_2_3_BRIDGE_GAPS.md

# Verify Phase 1 skills still working
~/.agents/skills/termux-ai/scripts/launch.sh --test
```

**Phase 1 skills remain active**:
- termux-ai (43 tools)
- termux-second-brain (sync)
- termux-ollama (local models)
- termux-sd-studio (images)
- termux-widgets (home screen)

**Phase 2 adds to these**:
- termux-github-deployer
- termux-supabase-manager
- termux-code-quality
- termux-test-runner
- termux-dev-server
- termux-vercel-deployer
- termux-nextjs-helper
- termux-project-scaffolder

---

## SUCCESS METRICS (End of Week 3)

✅ **8 new skills created and verified**
✅ **All critical deployment workflows covered**
✅ **Termux can now: deploy, test, manage DB, code quality**
✅ **Parity increases from 30%→61% (16 skills total)**
✅ **Ready for Phase 3 (weeks 4-5)**

---

## WHAT'S NEXT

After Phase 2 complete, move to Phase 3 (Weeks 4-5):

**Phase 3 Skills** (6 new):
- termux-android-integration (notifications, haptic, share)
- termux-backup-sync (backup to cloud)
- termux-voice-capture (voice-to-text)
- termux-offline-mode (work without internet)
- termux-mobile-dashboard (phone-optimized UI)
- termux-health-monitor (battery alerts)

**Result**: 16→22 skills (85% parity) + unique advantages

See: PHASE_3_WEEKS_4_5_UNIQUE_ADVANTAGES.md (after Phase 2)

---

## GETTING THIS DOCUMENT

Pull from GitHub after Phase 1:

```bash
git clone https://github.com/wizelements/second-brain.git
cd second-brain
cat PHASE_2_WEEKS_2_3_BRIDGE_GAPS.md
```

---

**Ready? Start Phase 2 after Friday of Week 1. Execute with confidence. 🚀**

