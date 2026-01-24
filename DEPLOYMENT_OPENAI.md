# Deployment Guide: OpenAI Integration for Solospace

**Status**: Ready to deploy  
**Date**: Jan 23, 2026  
**Files Modified**: 3  
**Files Created**: 3  
**Time to Deploy**: 15 minutes

---

## WHAT'S BEING DEPLOYED

### New Files
1. ✅ `ai/enrichment.js` - OpenAI wrapper + fallback
2. ✅ `tests/test-enrichment.js` - Test script
3. ✅ `DEPLOYMENT_OPENAI.md` - This guide

### Modified Files
1. ✅ `server.js` - Added enrichment to `/webhook/capture`
2. ✅ `server.js` - Added 3 new endpoints (`/api/brain/*`)

### Endpoints Added
- `POST /webhook/capture` - Now calls OpenAI enrichment
- `GET /api/brain/status` - Overall brain stats
- `GET /api/brain/tasks` - List tasks sorted by priority/deadline
- `GET /api/brain/gigs` - List gigs with revenue

---

## DEPLOYMENT STEPS

### Step 1: Setup OpenAI API Key (2 min)

**Option A: If you have an OpenAI account**
```bash
# Get API key from: https://platform.openai.com/api-keys
# Create new secret key

# Add to environment
echo "OPENAI_API_KEY=sk-your-key-here" >> ~/.env

# Verify
cat ~/.env | grep OPENAI
```

**Option B: Use fallback (regex-based, free)**
- If OPENAI_API_KEY not set, enrichment uses regex fallback
- No API costs, but less intelligent
- Still classifies: category, priority, deadline, entities

### Step 2: Install Dependencies (1 min)

```bash
cd ~/.local/share/second-brain

# Install OpenAI SDK
npm install openai

# Verify
npm list openai
```

### Step 3: Test Enrichment (3 min)

```bash
# Test without API key (fallback mode)
node tests/test-enrichment.js

# Test with API key (full enrichment)
OPENAI_API_KEY=sk-... node tests/test-enrichment.js
```

**Expected Output**:
```
🧪 Testing Enrichment Module

OpenAI API Key: ✅ Set
---

📝 Input: "call john about the $500 gig deadline friday"
✅ Category: gig
   Priority: high
   Deadline: 2026-01-24T17:00:00Z
   Person: john
   Amount: 500
   Tags: gig, urgency, client-work
   Model: gpt-3.5-turbo
   Cost: $0.000483
```

### Step 4: Restart Server (2 min)

```bash
# Kill existing server
pkill -f "node server.js"

# Restart with OpenAI key
OPENAI_API_KEY=sk-... node server.js

# OR save to .env and run normally
# (server.js will load from .env via dotenv)
node server.js
```

### Step 5: Test Live Endpoints (5 min)

**Test Capture Enrichment**:
```bash
curl -X POST https://solospace.codewithsolo.com/webhook/capture \
  -H "Content-Type: application/json" \
  -d '{
    "text": "add gig: call john about 500 dollar website redesign friday",
    "source": "google-assistant"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "item": {
    "id": "inbox_...",
    "text": "add gig: call john about 500 dollar website redesign friday",
    "source": "google-assistant",
    "category": "gig",
    "priority": "high",
    "deadline": "2026-01-24T17:00:00Z",
    "entities": {
      "person": "john",
      "amount": 500,
      "action": "call"
    },
    "tags": ["gig", "client-work", "urgency"],
    "next_action": "Invoice client for $500",
    "status": "active"
  },
  "message": "Captured gig from google-assistant",
  "cost_usd": 0.000483
}
```

**Test Status Endpoint**:
```bash
curl https://solospace.codewithsolo.com/api/brain/status | jq '.'
```

**Expected Response**:
```json
{
  "timestamp": "2026-01-23T12:34:56.789Z",
  "total_items": 42,
  "active_items": 38,
  "archived_items": 3,
  "completed_items": 1,
  "by_category": {
    "tasks": 25,
    "gigs": 12,
    "reminders": 1
  },
  "by_priority": {
    "critical": 0,
    "high": 8,
    "medium": 18,
    "low": 16
  },
  "overdue": 2,
  "total_gig_value": 3500,
  "next_items": [
    {
      "id": "inbox_...",
      "text": "call john about website redesign",
      "category": "gig",
      "priority": "high",
      "deadline": "2026-01-24T17:00:00Z"
    }
  ],
  "status": "healthy"
}
```

**Test Tasks Endpoint**:
```bash
curl https://solospace.codewithsolo.com/api/brain/tasks | jq '.items[:3]'
```

**Test Gigs Endpoint**:
```bash
curl https://solospace.codewithsolo.com/api/brain/gigs | jq '.'
```

---

## INTEGRATION WITH GOOGLE ACTION BRIDGE

### Firebase Function → Solospace

The Google Assistant voice command flow is already set up in google-action-bridge. Just make sure it POSTs to the enriched endpoint:

**functions/index.js** (already configured):
```javascript
// Handler: Add task/gig/reminder via voice
app.handle('add_brain_item', async conv => {
  const text = conv.intent.params.text?.resolved;
  
  try {
    const response = await fetch(`${TERMUX_API}/webhook/capture`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        text: text,
        source: 'google-assistant',
        // No longer need to classify here - Solospace will do it!
      })
    });
    
    const data = await response.json();
    const item = data.item;
    
    // Use enriched data
    conv.add(`Got it. Added to your ${item.category}s. ${item.priority === 'high' ? 'Marked high priority.' : ''}`);
  } catch (err) {
    conv.add(`Sorry, I couldn't save that. Try again in a moment.`);
  }
});
```

---

## COST ANALYSIS

### Monthly Costs (30-day average)

| Scenario | Captures/Day | Search/Week | Briefing/Day | Monthly Cost |
|----------|--------------|-------------|--------------|--------------|
| **Light** | 5 | 0 | 0 | $0.07 |
| **Medium** | 30 | 2 | 1 | $0.64 |
| **Heavy** | 100 | 10 | 5 | $1.92 |

### Current Setup (Medium)
- 30 captures/day = 900/month @ $0.0005 = **$0.45**
- (Future) 2 deep searches/week @ $0.02 = **$0.16**
- (Future) 1 briefing/day @ $0.001 = **$0.03**
- **Total: $0.64/month**

---

## TROUBLESHOOTING

### Server won't start
```bash
# Check for syntax errors
node -c server.js

# Check Node version (need 14+)
node --version

# Try restarting
pkill -f "node server.js"
sleep 2
node server.js
```

### Enrichment always using fallback
```bash
# Check if OpenAI key is set
echo $OPENAI_API_KEY

# If not set, add to .env
echo "OPENAI_API_KEY=sk-..." >> ~/.env

# Restart server
pkill -f "node server.js"
node server.js
```

### High costs (unexpected)
```bash
# Check usage on platform.openai.com
# May have rate limit issues

# Monitor in logs:
tail -f ~/.local/share/second-brain/*.log | grep cost

# Can add cost cap:
# Edit ai/enrichment.js to skip enrichment if cost > threshold
```

### Endpoints return 404
```bash
# Verify server is running
ps aux | grep "node server.js"

# Check it's listening on port 5000
netstat -tlnp | grep 5000

# Verify Cloudflare tunnel is active
cloudflared tunnel list
```

---

## ROLLBACK (If Issues)

### To disable OpenAI (use fallback only)
```bash
# Edit .env and remove/comment out:
# OPENAI_API_KEY=sk-...

# Restart
pkill -f "node server.js"
node server.js
```

### To revert to previous version
```bash
# Git history available
git log server.js
git show HEAD:server.js > server.js.prev
git checkout HEAD -- server.js
```

---

## NEXT STEPS (After Deployment)

### Immediate (This Week)
1. ✅ Deploy enrichment layer
2. ✅ Test with Google Action Bridge voice commands
3. ✅ Monitor costs on openai.com
4. ✅ Update Tasker to sort by deadline (uses /api/brain/status)

### Short Term (Next 2 Weeks)
5. Add `/api/brain/search/deep` endpoint (GPT-4 semantic search)
6. Add `/api/brain/briefing/daily` endpoint (email summaries)
7. Update Tasker widget to show next_items sorted by deadline

### Medium Term (Next Month)
8. Build web dashboard (Next.js) with:
   - Real-time status
   - Query interface
   - Calendar view (by deadline)
   - Earnings dashboard

---

## MONITORING

### Live Logs
```bash
# Watch enrichment in real-time
tail -f ~/.local/share/second-brain/agent.log | grep "📝 Enriching"

# Watch all API calls
tail -f ~/.local/share/second-brain/agent.log | grep "POST /webhook/capture"

# Monitor costs
tail -f ~/.local/share/second-brain/agent.log | grep "cost_usd"
```

### Cost Tracking
```bash
# Get total cost today
grep "cost_usd" ~/.local/share/second-brain/agent.log | \
  grep "$(date +%Y-%m-%d)" | \
  awk '{sum+=$NF} END {print "$" sum}'
```

---

## SUCCESS CRITERIA

After deployment, verify:

✅ Server starts without errors  
✅ `/webhook/capture` returns enriched items  
✅ `/api/brain/status` returns counts  
✅ `/api/brain/tasks` returns sorted tasks  
✅ `/api/brain/gigs` returns gigs with amounts  
✅ Costs on openai.com match predictions  
✅ Google Assistant → Firebase → Solospace flow works  
✅ Items have category, priority, deadline fields  

---

## DEPLOYMENT CHECKLIST

- [ ] OpenAI API key obtained
- [ ] `.env` file updated with OPENAI_API_KEY
- [ ] `npm install openai` completed
- [ ] `node tests/test-enrichment.js` passes
- [ ] Server restarted with new code
- [ ] `/webhook/capture` test passes
- [ ] `/api/brain/status` test passes
- [ ] `/api/brain/tasks` test passes
- [ ] `/api/brain/gigs` test passes
- [ ] Google Action Bridge test passes
- [ ] Costs monitored on openai.com
- [ ] Documentation updated
- [ ] Tasker ready for next phase

---

**Status**: ✅ Ready to deploy now  
**Risk Level**: Low (fallback available, no breaking changes)  
**Rollback Time**: 2 minutes  
**Time to Value**: Immediate (enriched captures on first call)
