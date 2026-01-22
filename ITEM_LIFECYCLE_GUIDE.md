# Item Lifecycle: Making Items Move Through Your Second Brain

**Status**: ✓ IMPLEMENTED  
**Date**: 2026-01-22  
**Version**: 1.0

---

## The Problem We're Solving

Your inbox had 39 items sitting in "classified" status with no forward motion. This is a data warehouse, not a knowledge engine. **Items must move.**

---

## The Lifecycle (NEW → ARCHIVED)

```
┌─────────┐    ┌──────────┐    ┌───────┐    ┌──────────────┐    ┌───────────┐    ┌──────────┐
│   NEW   │ -> │CLASSIFIED│ -> │ACTIVE │ -> │IN_PROGRESS  │ -> │COMPLETED  │ -> │ARCHIVED  │
└─────────┘    └──────────┘    └───────┘    └──────────────┘    └───────────┘    └──────────┘
                    ↑                                                   ↑              ↓
                    └─────────────────────────────────────────────────┘           (auto at 90d)
                                   (skip to archive anytime)
```

**Statuses**:
- **NEW**: Just captured, needs review
- **CLASSIFIED**: AI has categorized, human approved
- **ACTIVE**: Ready to work on, selected from backlog
- **IN_PROGRESS**: You started it, working on it now
- **COMPLETED**: Done, documented in completion
- **ARCHIVED**: Shelved (completed or deemed obsolete)

---

## How to Move Items

### Move to ACTIVE
When you're ready to work on something:

```bash
brain-move <id> active
```

Example:
```bash
$ brain-move mklfww4i active
✓ mklfww4i: "finish the gratog landing page..." → active
```

### Move to IN_PROGRESS
When you start actually working:

```bash
brain-move <id> in_progress
```

This timestamps your start time (`startedAt`). System uses this to detect stuck work (>14 days).

### Move to COMPLETED
When you finish:

```bash
brain-move <id> completed
```

Timestamps completion. Item stays visible for 90 days, then auto-archives.

### Move to ARCHIVED
To shelve something without completing:

```bash
brain-move <id> archived
```

Good for "nice-to-have" tasks that lost priority.

---

## Commands Reference

### VIEW YOUR WORK

**What should I work on?**
```bash
brain-next
```
Shows the single best recommended next action (smart scoring based on priority, category, staleness).

**Top 5 recommendations:**
```bash
brain-next --top 5
```

**See my active items:**
```bash
brain-move --active
```

**Ready to activate (classified → active):**
```bash
brain-move --candidates
```

### MANAGE FLOW

**Stagnant items (untouched >7 days):**
```bash
brain-move --stagnant
```

Shows items that aren't moving. Review, activate, or archive.

**Stuck items (in-progress >14 days):**
```bash
brain-move --stuck
```

Items you're working on that haven't progressed. Time to unblock or pause.

**Auto-archive completed items >90 days:**
```bash
brain-move --auto-archive
```

Run this weekly. Completed items older than 90 days get moved to archive automatically.

### VIEW NUDGES

**What nudges are due?**
```bash
brain-nudge
```

Fires pending nudges (gigs pending payment, stagnant items, etc).

**All nudges status:**
```bash
brain-nudge --all
```

**Manually fire a nudge:**
```bash
brain-nudge --fire nudge_gigs_pending
```

### DASHBOARD

**Quick overview:**
```bash
brain-dashboard
```

Shows active items, stats, quick commands.

---

## Example Workflow

**Morning - Start your day**:
```bash
$ brain-dashboard
# Shows 4 active items, $3050 in pending gigs

$ brain-next
# Recommends: ACME Corp gig ($2500) - Invoice payment

$ brain-move m7bh92ih in_progress
# You've started working on it
```

**Mid-week - Check for stagnation**:
```bash
$ brain-move --stagnant
# Shows 6 items untouched >7 days

$ brain-move mkllyjbh2 archived
# "Usability testing" isn't priority right now - archive it

$ brain-move mkms2omv active
# "Test capture" is ready to work on - activate
```

**Friday - Review the week**:
```bash
$ brain-move --stuck
# No stuck items - good!

$ brain-nudge --all
# Weekly review nudge fires

$ brain-move --auto-archive
# Auto-archive any completed items >90 days old
```

---

## Status Transitions (Valid Paths)

| FROM | TO | Use Case |
|------|----|----|
| NEW | CLASSIFIED | (automatic via AI) |
| CLASSIFIED | ACTIVE | Ready to work on it |
| CLASSIFIED | ARCHIVED | Not priority, shelve it |
| ACTIVE | IN_PROGRESS | Start working |
| ACTIVE | ARCHIVED | Changed mind, skip it |
| IN_PROGRESS | COMPLETED | Finished the work |
| IN_PROGRESS | ACTIVE | Stalled, back to queue |
| COMPLETED | ARCHIVED | Auto-archive after 90d |

**Invalid transitions** (will be rejected):
```
NEW → ACTIVE (must go through CLASSIFIED first)
ARCHIVED → anything (final state)
COMPLETED → IN_PROGRESS (can't uncomplete)
```

---

## Schema Extensions

When you move items, these fields are automatically updated:

```json
{
  "id": "mklfww4i",
  "text": "finish the gratog landing page by friday",
  "status": "in_progress",          // Current status
  "timestamp": "2026-01-19T17:29:35.394Z",  // Created
  "updatedAt": "2026-01-22T14:30:00Z",     // Last moved
  "startedAt": "2026-01-22T14:30:00Z",     // When IN_PROGRESS set
  "completedAt": null,              // When COMPLETED set
  "archivedAt": null,               // When ARCHIVED set
  "priority": "high",
  "category": "task",
  "nextAction": "Finish the Gratog landing page"
}
```

---

## Nudges: Passive Movement

You can also set up automated nudges that prompt movement:

**Daily nudges:**
- Income check: "You have X gigs ready for payment ($Y)"
- Focus summary: "You have X active items. Working on: Y"

**Weekly nudges:**
- Stuck detection: "You've been on X for 14 days. Unblock?"
- Stagnant review: "X items haven't moved in 7+ days"
- Weekly reflection: "What worked this week?"

See `nudges.json` for all nudge definitions.

---

## Metrics to Track

**Movement Health**:
- Items in inbox per week (should trend down)
- Avg days from ACTIVE → COMPLETED (should be <14d)
- Stagnant items (should be <10% of total)
- Archive rate (completed items moving to archive)

**Work Quality**:
- % of gigs successfully completed/invoiced
- % of high-priority items that get done
- Cycle time (ACTIVE → COMPLETED)

---

## Anti-Patterns to Avoid

❌ **Don't**: Leave items in CLASSIFIED forever
✓ **Do**: Review every Monday, move to ACTIVE or ARCHIVED

❌ **Don't**: Let items sit IN_PROGRESS >14 days
✓ **Do**: Move stalled work back to ACTIVE or archive it

❌ **Don't**: Keep COMPLETED items forever
✓ **Do**: Run `brain-move --auto-archive` weekly

❌ **Don't**: Ignore STAGNANT items
✓ **Do**: Review weekly with `brain-move --stagnant`

❌ **Don't**: Create more statuses
✓ **Do**: Keep it simple - 6 statuses is enough

---

## Implementation Notes

### Why 6 Statuses?

- **NEW** → AI hasn't categorized yet
- **CLASSIFIED** → Human reviewed, approved AI classification
- **ACTIVE** → In your working queue (pick from this)
- **IN_PROGRESS** → You're literally working on it (one or few at a time)
- **COMPLETED** → Work is done
- **ARCHIVED** → Deleted from active view, but kept for history

Fewer would lose visibility. More would be analysis paralysis.

### Auto-Archive Logic

Completed items auto-archive after 90 days. Why 90?
- Long enough to see the results
- Short enough that UI stays clean
- Prevents completed items from cluttering future views
- Keeps historical record in archive

### Scoring for `brain-next`

Items are scored by:
1. **Status** (IN_PROGRESS +50, ACTIVE +10)
2. **Priority** (HIGH +30, MEDIUM +20, LOW +10)
3. **Category** (GIG +40, TASK +30, REMINDER +20)
4. **Staleness** (Not touched >7d gets +2 per day, capped at +20)
5. **Type** (Income-generating gigs get bumped)

This ensures the *right* item surfaces, not just the newest.

---

## Next: Retrieval

Once items are moving, the next step is making them findable:

**Planned**:
- Natural language retrieval: `brain "What was I thinking about X?"`
- Semantic search across ideas
- Automatic connection discovery
- Smart archival (keep useful, discard noise)

For now: `brain-move --active` and `brain-next` get the job done.

---

## Success Metrics (30 days)

Track these to verify the system is working:

- [ ] 0 items in CLASSIFIED (all moved to ACTIVE or ARCHIVED)
- [ ] <3 items stuck IN_PROGRESS (move to ACTIVE or ARCHIVED)
- [ ] <10 stagnant items (reviewed weekly)
- [ ] $3050 gigs either completed or archived
- [ ] At least 1 item completed and auto-archived

If you hit all 5, the system is alive. Items are moving.
