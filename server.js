/**
 * SoloSpace - Second Brain Webhook Server
 * 
 * Runs on Termux, exposed via Cloudflare tunnel at:
 * https://solospace.codewithsolo.com
 * 
 * Install: npm install express nodemailer
 * Run: node server.js
 * Tunnel: cloudflared tunnel run solospace
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const CaptureEnricher = require('./ai/enrichment');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize enricher (OpenAI or fallback)
const enricher = new CaptureEnricher(process.env.OPENAI_API_KEY);

// Middleware
app.use(express.json());

// CORS for GPT
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Load config
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

// Second Brain storage paths
const BRAIN_DIR = process.env.BRAIN_DIR || path.join(process.env.HOME, '.local/share/second-brain');
const CAPTURES_DIR = path.join(BRAIN_DIR, 'captures');
const GUIDES_DIR = path.join(BRAIN_DIR, 'guides');
const INBOX_FILE = path.join(BRAIN_DIR, 'inbox.json');
const CONTEXT_FILE = path.join(BRAIN_DIR, 'context.json');

// Ensure directories exist
[BRAIN_DIR, CAPTURES_DIR, GUIDES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize files if missing
if (!fs.existsSync(INBOX_FILE)) {
  fs.writeFileSync(INBOX_FILE, JSON.stringify({ items: [] }, null, 2));
}
if (!fs.existsSync(CONTEXT_FILE)) {
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify({ focus: null, projects: {} }, null, 2));
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'solospace-second-brain',
    timestamp: new Date().toISOString(),
    endpoints: {
      email: ['draft', 'gmail', 'outlook'],
      brain: ['capture', 'nudge', 'inbox', 'sync-files', 'send-guide', 'file-context'],
      device: ['notify', 'speak', 'clipboard/get', 'clipboard/set', 'vibrate', 'torch', 'screenshot', 'device/status', 'app/launch', 'sync/trigger']
    }
  });
});

// Alias for root
app.get('/', (req, res) => {
  res.json({
    service: 'SoloSpace Second Brain',
    version: '2.0.0',
    docs: 'https://solospace.codewithsolo.com/health'
  });
});

// ============================================
// EMAIL ENDPOINTS
// ============================================

// Load email routes
const emailRoutes = require('./email-routes');
emailRoutes(app, config);

// ============================================
// CAPTURE ENDPOINT (With OpenAI Enrichment)
// ============================================

app.post('/webhook/capture', async (req, res) => {
  const { text, content, type, project, source, files, thread } = req.body;

  // Support both 'text' (from Google Assistant) and 'content' (legacy)
  const captureText = text || content;
  
  if (!captureText) {
    return res.status(400).json({ error: 'text or content required' });
  }

  try {
    // Get recent items for context
    let recentItems = [];
    try {
      if (fs.existsSync(INBOX_FILE)) {
        const inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
        recentItems = (inbox.items || []).slice(-5); // Last 5 items for context
      }
    } catch (e) {
      console.error('Error reading context items:', e.message);
    }

    // Enrich with OpenAI or fallback
    console.log(`📝 Enriching capture from ${source || 'unknown'}...`);
    const enriched = await enricher.enrich(captureText, recentItems);

    // Create item for inbox
    const item = {
      id: `inbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: captureText,
      source: source || 'api',
      timestamp: new Date().toISOString(),
      status: 'active',
      ...enriched // Merge enriched data (category, priority, deadline, entities, etc)
    };

    // Add to inbox.json
    let inbox = { items: [] };
    try {
      if (fs.existsSync(INBOX_FILE)) {
        inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading inbox:', e.message);
    }

    inbox.items = inbox.items || [];
    inbox.items.push(item);
    fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2));

    console.log(`✅ Captured: [${item.category}] ${captureText.substring(0, 50)}... (priority: ${item.priority})`);

    // Save raw capture too
    const filename = `${item.id}.json`;
    const filepath = path.join(CAPTURES_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(item, null, 2));

    res.json({
      success: true,
      item,
      message: `Captured ${item.category} from ${source || 'api'}`,
      cost_usd: enriched.cost_usd || 0
    });
  } catch (err) {
    console.error('❌ Capture error:', err.message);
    res.status(500).json({
      error: 'Capture failed',
      message: err.message
    });
  }
});

// ============================================
// NUDGE ENDPOINT
// ============================================

app.get('/webhook/nudge', (req, res) => {
  let context = { focus: null, projects: {} };
  
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      context = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading context:', e.message);
  }

  // Get recent captures to infer focus
  let recentCaptures = [];
  try {
    const files = fs.readdirSync(CAPTURES_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 5);
    
    recentCaptures = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(CAPTURES_DIR, f), 'utf-8'));
      return { type: data.type, project: data.project, timestamp: data.timestamp };
    });
  } catch (e) {
    console.error('Error reading captures:', e.message);
  }

  // Infer current focus from recent activity
  const projectCounts = {};
  recentCaptures.forEach(c => {
    projectCounts[c.project] = (projectCounts[c.project] || 0) + 1;
  });
  
  const topProject = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])[0];

  res.json({
    focus: context.focus || (topProject ? `Continue work on ${topProject[0]}` : 'Start your day with a capture'),
    priority: context.priority || 'normal',
    context: {
      recentProjects: Object.keys(projectCounts),
      lastCapture: recentCaptures[0]?.timestamp || null,
      captureCount: recentCaptures.length
    },
    suggestion: topProject 
      ? `You've been active on ${topProject[0]}. Pick up where you left off.`
      : 'No recent captures. Start by capturing a learning or insight.'
  });
});

// Set focus
app.post('/webhook/nudge', (req, res) => {
  const { focus, priority } = req.body;

  let context = {};
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      context = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
    }
  } catch (e) {}

  context.focus = focus || context.focus;
  context.priority = priority || context.priority;
  context.updatedAt = new Date().toISOString();

  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));

  res.json({
    success: true,
    focus: context.focus,
    priority: context.priority
  });
});

// ============================================
// INBOX ENDPOINT
// ============================================

app.get('/webhook/inbox', (req, res) => {
  let inbox = { items: [] };
  
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading inbox:', e.message);
  }

  res.json({
    items: inbox.items || [],
    count: (inbox.items || []).length
  });
});

// ============================================
// BRAIN STATUS ENDPOINT (NEW)
// ============================================

app.get('/api/brain/status', (req, res) => {
  let inbox = { items: [] };
  
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading inbox:', e.message);
  }

  const items = inbox.items || [];
  
  // Count by category
  const byCat = {
    tasks: items.filter(i => i.category === 'task' && i.status !== 'archived').length,
    gigs: items.filter(i => i.category === 'gig' && i.status !== 'archived').length,
    reminders: items.filter(i => i.category === 'reminder' && i.status !== 'archived').length,
  };

  // Count by priority
  const byPriority = {
    critical: items.filter(i => i.priority === 'critical' && i.status !== 'archived').length,
    high: items.filter(i => i.priority === 'high' && i.status !== 'archived').length,
    medium: items.filter(i => i.priority === 'medium' && i.status !== 'archived').length,
    low: items.filter(i => i.priority === 'low' && i.status !== 'archived').length,
  };

  // Find overdue items
  const now = new Date();
  const overdue = items.filter(i => 
    i.deadline && new Date(i.deadline) < now && i.status !== 'archived' && i.status !== 'completed'
  ).length;

  // Get next 3 items by deadline
  const nextItems = items
    .filter(i => i.status === 'active' || i.status === 'classified')
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 3)
    .map(i => ({
      id: i.id,
      text: i.text.substring(0, 60),
      category: i.category,
      priority: i.priority,
      deadline: i.deadline
    }));

  // Calculate gig revenue (if amounts exist)
  const totalGigValue = items
    .filter(i => i.category === 'gig' && i.status !== 'archived')
    .reduce((sum, i) => {
      const amount = i.entities?.amount || i.gigData?.amount || 0;
      return sum + (amount || 0);
    }, 0);

  res.json({
    timestamp: new Date().toISOString(),
    total_items: items.length,
    active_items: items.filter(i => i.status === 'active' || i.status === 'classified').length,
    archived_items: items.filter(i => i.status === 'archived').length,
    completed_items: items.filter(i => i.status === 'completed').length,
    by_category: byCat,
    by_priority: byPriority,
    overdue: overdue,
    total_gig_value: totalGigValue,
    next_items: nextItems,
    status: items.length > 0 ? 'healthy' : 'empty'
  });
});

// ============================================
// BRAIN TASKS ENDPOINT (NEW)
// ============================================

app.get('/api/brain/tasks', (req, res) => {
  let inbox = { items: [] };
  
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading inbox:', e.message);
  }

  const tasks = (inbox.items || [])
    .filter(i => i.category === 'task' && (i.status === 'active' || i.status === 'classified'))
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPrio = priorityOrder[a.priority] || 2;
      const bPrio = priorityOrder[b.priority] || 2;
      if (aPrio !== bPrio) return aPrio - bPrio;
      
      // Then by deadline
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      
      // Then by date created
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .map(t => ({
      id: t.id,
      text: t.text,
      priority: t.priority,
      deadline: t.deadline,
      next_action: t.next_action,
      tags: t.tags || []
    }));

  res.json({
    timestamp: new Date().toISOString(),
    total: tasks.length,
    items: tasks
  });
});

// ============================================
// BRAIN GIGS ENDPOINT (NEW)
// ============================================

app.get('/api/brain/gigs', (req, res) => {
  let inbox = { items: [] };
  
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading inbox:', e.message);
  }

  const gigs = (inbox.items || [])
    .filter(i => i.category === 'gig' && (i.status === 'active' || i.status === 'classified'))
    .sort((a, b) => {
      const aPrio = a.priority === 'high' ? 0 : 1;
      const bPrio = b.priority === 'high' ? 0 : 1;
      return aPrio - bPrio;
    })
    .map(g => ({
      id: g.id,
      text: g.text,
      priority: g.priority,
      amount: g.entities?.amount || g.gigData?.amount || null,
      client: g.entities?.person || g.gigData?.client || null,
      deadline: g.deadline,
      next_action: g.next_action || 'Follow up'
    }));

  const totalValue = gigs.reduce((sum, g) => sum + (g.amount || 0), 0);

  res.json({
    timestamp: new Date().toISOString(),
    total: gigs.length,
    total_value: totalValue,
    items: gigs
  });
});

// Add to inbox
app.post('/webhook/inbox', (req, res) => {
  const { type, content, project, due } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }

  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const item = {
    id: `inbox_${Date.now()}`,
    type: type || 'task',
    content,
    project: project || null,
    due: due || null,
    createdAt: new Date().toISOString()
  };

  inbox.items = inbox.items || [];
  inbox.items.push(item);
  fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2));

  res.json({
    success: true,
    id: item.id,
    message: 'Added to inbox'
  });
});

// Clear inbox item
app.delete('/webhook/inbox/:id', (req, res) => {
  const { id } = req.params;

  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const before = inbox.items.length;
  inbox.items = (inbox.items || []).filter(item => item.id !== id);
  
  if (inbox.items.length === before) {
    return res.status(404).json({ error: 'Item not found' });
  }

  fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2));
  res.json({ success: true, message: 'Item removed' });
});

// ============================================
// SYNC FILES ENDPOINT
// ============================================

app.post('/webhook/sync-files', (req, res) => {
  const { project, files } = req.body;

  if (!project || !files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'project and files array required' });
  }

  const projectDir = path.join(BRAIN_DIR, 'projects', project);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  let synced = 0;
  files.forEach(file => {
    if (file.path && file.content) {
      const filePath = path.join(projectDir, path.basename(file.path));
      fs.writeFileSync(filePath, file.content);
      synced++;
    }
  });

  // Update project index
  const indexPath = path.join(projectDir, '_index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    project,
    syncedAt: new Date().toISOString(),
    fileCount: synced,
    files: files.map(f => f.path)
  }, null, 2));

  res.json({
    success: true,
    synced,
    project,
    path: projectDir
  });
});

// ============================================
// SEND GUIDE ENDPOINT
// ============================================

app.post('/webhook/send-guide', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content required' });
  }

  // Create safe filename
  const filename = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.md';
  
  const filepath = path.join(GUIDES_DIR, filename);
  
  // Add frontmatter
  const doc = `---
title: ${title}
created: ${new Date().toISOString()}
---

${content}`;

  fs.writeFileSync(filepath, doc);

  res.json({
    success: true,
    title,
    path: filepath,
    message: `Guide saved: ${filename}`
  });
});

// List guides
app.get('/webhook/guides', (req, res) => {
  let guides = [];
  
  try {
    guides = fs.readdirSync(GUIDES_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: path.join(GUIDES_DIR, f)
      }));
  } catch (e) {
    console.error('Error reading guides:', e.message);
  }

  res.json({ guides, count: guides.length });
});

// ============================================
// FILE CONTEXT ENDPOINT
// ============================================

app.get('/webhook/file-context', (req, res) => {
  const { project, query } = req.query;

  if (!project) {
    return res.status(400).json({ error: 'project parameter required' });
  }

  const projectDir = path.join(BRAIN_DIR, 'projects', project);
  
  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ error: `Project ${project} not synced` });
  }

  // Read project index
  const indexPath = path.join(projectDir, '_index.json');
  let index = { files: [] };
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }

  // Filter by query if provided
  let matches = index.files || [];
  if (query) {
    const q = query.toLowerCase();
    matches = matches.filter(f => f.toLowerCase().includes(q));
  }

  res.json({
    project,
    query: query || null,
    matches: matches.map(f => ({
      file: f,
      relevance: query ? (f.toLowerCase().includes(query.toLowerCase()) ? 1 : 0.5) : 1
    })),
    syncedAt: index.syncedAt || null
  });
});

// ============================================
// CAPTURES LIST ENDPOINT (bonus)
// ============================================

app.get('/webhook/captures', (req, res) => {
  const { project, type, limit } = req.query;
  const maxLimit = parseInt(limit) || 20;

  let captures = [];
  try {
    const files = fs.readdirSync(CAPTURES_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    captures = files.slice(0, 100).map(f => {
      return JSON.parse(fs.readFileSync(path.join(CAPTURES_DIR, f), 'utf-8'));
    });

    // Filter
    if (project) {
      captures = captures.filter(c => c.project === project);
    }
    if (type) {
      captures = captures.filter(c => c.type === type);
    }

    captures = captures.slice(0, maxLimit);
  } catch (e) {
    console.error('Error reading captures:', e.message);
  }

  res.json({
    captures,
    count: captures.length
  });
});

// ============================================
// DEVICE CONTROL ENDPOINTS (Termux:API)
// ============================================

// Send Android notification
app.post('/webhook/notify', (req, res) => {
  const { title, content, id, priority, vibrate } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }
  
  let cmd = `termux-notification --content "${content.replace(/"/g, '\\"')}"`;
  if (title) cmd += ` --title "${title.replace(/"/g, '\\"')}"`;
  if (id) cmd += ` --id "${id}"`;
  if (priority) cmd += ` --priority ${priority}`;
  if (vibrate) cmd += ` --vibrate ${vibrate}`;
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Notification failed', details: stderr });
    }
    res.json({ success: true, message: 'Notification sent' });
  });
});

// Text-to-speech
app.post('/webhook/speak', (req, res) => {
  const { text, rate, pitch, language } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }
  
  let cmd = `termux-tts-speak`;
  if (rate) cmd += ` -r ${rate}`;
  if (pitch) cmd += ` -p ${pitch}`;
  if (language) cmd += ` -l ${language}`;
  cmd += ` "${text.replace(/"/g, '\\"')}"`;
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'TTS failed', details: stderr });
    }
    res.json({ success: true, message: 'Speaking' });
  });
});

// Get clipboard
app.get('/webhook/clipboard/get', (req, res) => {
  exec('termux-clipboard-get', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Clipboard read failed', details: stderr });
    }
    res.json({ success: true, content: stdout });
  });
});

// Set clipboard
app.post('/webhook/clipboard/set', (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'content required' });
  }
  
  exec(`echo "${content.replace(/"/g, '\\"')}" | termux-clipboard-set`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Clipboard write failed', details: stderr });
    }
    res.json({ success: true, message: 'Clipboard set' });
  });
});

// Vibrate device
app.post('/webhook/vibrate', (req, res) => {
  const { duration, force } = req.body;
  
  let cmd = 'termux-vibrate';
  if (duration) cmd += ` -d ${duration}`;
  if (force) cmd += ' -f';
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Vibrate failed', details: stderr });
    }
    res.json({ success: true, message: 'Vibrated' });
  });
});

// Toggle flashlight/torch
app.post('/webhook/torch', (req, res) => {
  const { enabled } = req.body;
  
  const state = enabled === false ? 'off' : 'on';
  
  exec(`termux-torch ${state}`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Torch failed', details: stderr });
    }
    res.json({ success: true, state });
  });
});

// Take screenshot
app.post('/webhook/screenshot', (req, res) => {
  const { filename } = req.body;
  
  const screenshotFile = filename || `/sdcard/screenshot_${Date.now()}.png`;
  
  exec(`termux-screenshot ${screenshotFile}`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'Screenshot failed', details: stderr });
    }
    res.json({ success: true, path: screenshotFile });
  });
});

// Get device status (battery, wifi)
app.get('/webhook/device/status', (req, res) => {
  exec('termux-battery-status', (err, stdout) => {
    let battery = null;
    try {
      battery = err ? null : JSON.parse(stdout);
    } catch (e) {}
    
    exec('termux-wifi-connectioninfo', (err2, stdout2) => {
      let wifi = null;
      try {
        wifi = err2 ? null : JSON.parse(stdout2);
      } catch (e) {}
      
      res.json({
        battery,
        wifi,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Launch Android app
app.post('/webhook/app/launch', (req, res) => {
  const { package: pkg, url, action } = req.body;
  
  let cmd;
  if (url) {
    cmd = `termux-open "${url.replace(/"/g, '\\"')}"`;
  } else if (pkg) {
    cmd = `am start -n ${pkg}`;
    if (action) cmd = `am start -a ${action}`;
  } else {
    return res.status(400).json({ error: 'package or url required' });
  }
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'App launch failed', details: stderr });
    }
    res.json({ success: true, message: 'App launched' });
  });
});

// Trigger git sync on brain directory
app.post('/webhook/sync/trigger', (req, res) => {
  const { direction } = req.body; // 'pull', 'push', or 'both'
  
  const gitDir = BRAIN_DIR;
  
  if (!fs.existsSync(path.join(gitDir, '.git'))) {
    return res.status(400).json({ error: 'Brain directory is not a git repository' });
  }
  
  const results = { pull: null, push: null };
  
  const runSync = () => {
    if (direction === 'push' || direction === 'both') {
      try {
        execSync('git add -A', { cwd: gitDir });
        execSync(`git commit -m "Auto-sync ${new Date().toISOString()}" --allow-empty`, { cwd: gitDir });
        results.push = execSync('git push', { cwd: gitDir }).toString();
      } catch (e) {
        results.push = e.message;
      }
    }
    
    if (direction === 'pull' || direction === 'both' || !direction) {
      try {
        results.pull = execSync('git pull', { cwd: gitDir }).toString();
      } catch (e) {
        results.pull = e.message;
      }
    }
    
    res.json({
      success: true,
      direction: direction || 'pull',
      results,
      timestamp: new Date().toISOString()
    });
  };
  
  runSync();
});

// ============================================
// SMART ROUTER (GPT Universal Command)
// ============================================

app.post('/webhook/smart', (req, res) => {
  const { text, voice } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }

  const lower = text.toLowerCase();
  
  // Route based on content
  if (lower.includes('email') || lower.includes('send')) {
    return res.json({ 
      message: 'Use /webhook/email/gmail with {to, subject, body}',
      route: 'email'
    });
  }
  if (lower.includes('capture') || lower.includes('save')) {
    return res.json({
      message: 'Use /webhook/capture with {type, content}',
      route: 'capture'
    });
  }
  if (lower.includes('done') || lower.includes('complete') || lower.includes('finish')) {
    return res.json({
      message: 'Use /webhook/done with {text} for fuzzy match',
      route: 'done'
    });
  }
  if (lower.includes('morning') || lower.includes('briefing')) {
    return res.json({
      message: 'Use GET /webhook/morning for daily briefing',
      route: 'morning'
    });
  }
  if (lower.includes('nudge') || lower.includes('focus') || lower.includes('what next')) {
    return res.json({
      message: 'Use GET /webhook/nudge for focus recommendation',
      route: 'nudge'
    });
  }
  if (lower.includes('evening') || lower.includes('recap') || lower.includes('wrap')) {
    return res.json({
      message: 'Use GET /webhook/evening for evening summary',
      route: 'evening'
    });
  }
  if (lower.includes('gig') || lower.includes('client') || lower.includes('invoice')) {
    return res.json({
      message: 'Use /webhook/log-gig with natural language gig description',
      route: 'gig'
    });
  }
  
  res.json({
    message: `Routed query: "${text}"`,
    suggestion: 'Use specific endpoint based on intent'
  });
});

// ============================================
// DONE ENDPOINT (Mark Task Complete)
// ============================================

app.post('/webhook/done', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }

  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  // Fuzzy match task
  const lowerText = text.toLowerCase();
  let matched = null;
  
  if (inbox.items && Array.isArray(inbox.items)) {
    matched = inbox.items.find(item => 
      item.content && item.content.toLowerCase().includes(lowerText)
    );
  }

  if (!matched) {
    return res.json({
      success: false,
      message: `No task found matching "${text}". Check inbox with GET /webhook/inbox`,
      suggestion: 'Try using more specific task description'
    });
  }

  matched.status = 'done';
  matched.completedAt = new Date().toISOString();
  
  fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2));

  res.json({
    success: true,
    message: `Marked done: "${matched.content}"`,
    id: matched.id
  });
});

// ============================================
// MORNING BRIEFING
// ============================================

app.get('/webhook/morning', (req, res) => {
  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const pending = (inbox.items || []).filter(i => i.status !== 'done');
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = pending.filter(i => i.createdAt && i.createdAt.startsWith(today));

  const message = `
Good morning! 🌅

Today's Focus: ${todayTasks.length} tasks
Total Pending: ${pending.length} items

Top 3 Priorities:
${pending.slice(0, 3).map((t, i) => `${i+1}. ${t.content}`).join('\n')}

Let's get moving! 💪
  `.trim();

  res.json({
    success: true,
    message,
    stats: {
      todayTasks: todayTasks.length,
      pending: pending.length,
      timestamp: new Date().toISOString()
    }
  });
});

// ============================================
// EVENING REVIEW
// ============================================

app.get('/webhook/evening', (req, res) => {
  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0];
  const todayItems = (inbox.items || []).filter(i => i.createdAt && i.createdAt.startsWith(today));
  const completed = todayItems.filter(i => i.status === 'done');
  const remaining = todayItems.filter(i => i.status !== 'done');

  const message = `
Evening Recap 🌙

Great work today! ✨
Completed: ${completed.length} tasks
${completed.map(t => `  ✓ ${t.content}`).join('\n')}

Still pending: ${remaining.length}
${remaining.slice(0, 3).map(t => `  ○ ${t.content}`).join('\n')}

Rest well and see you tomorrow! 🌟
  `.trim();

  res.json({
    success: true,
    message,
    stats: {
      completed: completed.length,
      pending: remaining.length,
      timestamp: new Date().toISOString()
    }
  });
});

// ============================================
// LOG GIG (Freelance Tracking)
// ============================================

app.post('/webhook/log-gig', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }

  // Parse gig format: "Client - $Amount - Description"
  const parts = text.split('-').map(p => p.trim());
  const client = parts[0] || 'Unknown Client';
  const amountMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  const description = parts.slice(2).join(' - ') || 'Freelance work';

  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const gig = {
    id: `gig_${Date.now()}`,
    type: 'gig',
    content: `${client} - $${amount}`,
    description,
    client,
    amount,
    status: 'logged',
    createdAt: new Date().toISOString()
  };

  inbox.items = inbox.items || [];
  inbox.items.push(gig);
  fs.writeFileSync(INBOX_FILE, JSON.stringify(inbox, null, 2));

  res.json({
    success: true,
    message: `Logged gig: ${client} - $${amount}`,
    id: gig.id,
    gig
  });
});

// ============================================
// EARNINGS SUMMARY
// ============================================

app.get('/webhook/earnings', (req, res) => {
  const { period } = req.query;
  const timeframe = period || 'month';

  let inbox = { items: [] };
  try {
    if (fs.existsSync(INBOX_FILE)) {
      inbox = JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8'));
    }
  } catch (e) {}

  const gigs = (inbox.items || []).filter(i => i.type === 'gig');
  
  let filtered = gigs;
  if (timeframe === 'month') {
    const thisMonth = new Date().toISOString().substring(0, 7);
    filtered = gigs.filter(g => g.createdAt && g.createdAt.startsWith(thisMonth));
  } else if (timeframe === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filtered = gigs.filter(g => new Date(g.createdAt) >= weekAgo);
  }

  const total = filtered.reduce((sum, g) => sum + (g.amount || 0), 0);
  const allTimeTotal = gigs.reduce((sum, g) => sum + (g.amount || 0), 0);

  const message = `
💰 Earnings Report (${timeframe})

${timeframe}: $${total.toFixed(2)}
All-time: $${allTimeTotal.toFixed(2)}

Active Gigs: ${gigs.length}
${filtered.slice(0, 5).map(g => `  • ${g.client} - $${g.amount}`).join('\n')}

Keep building! 🚀
  `.trim();

  res.json({
    success: true,
    message,
    stats: {
      period: timeframe,
      total: total,
      allTime: allTimeTotal,
      count: filtered.length,
      gigs: filtered.slice(0, 10)
    }
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         SoloSpace Second Brain Server                  ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Local:  http://localhost:${PORT}                         ║`);
  console.log('║  Public: https://solospace.codewithsolo.com            ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Brain Endpoints:                                      ║');
  console.log('║    POST /webhook/email/draft                           ║');
  console.log('║    POST /webhook/email/gmail                           ║');
  console.log('║    POST /webhook/email/outlook                         ║');
  console.log('║    POST /webhook/capture                               ║');
  console.log('║    GET  /webhook/nudge                                 ║');
  console.log('║    GET  /webhook/inbox                                 ║');
  console.log('║    POST /webhook/sync-files                            ║');
  console.log('║    POST /webhook/send-guide                            ║');
  console.log('║    GET  /webhook/file-context                          ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Device Control (Termux:API):                          ║');
  console.log('║    POST /webhook/notify          - Send notification   ║');
  console.log('║    POST /webhook/speak           - Text-to-speech      ║');
  console.log('║    GET  /webhook/clipboard/get   - Get clipboard       ║');
  console.log('║    POST /webhook/clipboard/set   - Set clipboard       ║');
  console.log('║    POST /webhook/vibrate         - Vibrate device      ║');
  console.log('║    POST /webhook/torch           - Toggle flashlight   ║');
  console.log('║    POST /webhook/screenshot      - Take screenshot     ║');
  console.log('║    GET  /webhook/device/status   - Battery & wifi      ║');
  console.log('║    POST /webhook/app/launch      - Launch Android app  ║');
  console.log('║    POST /webhook/sync/trigger    - Git pull/push       ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  High-Level Endpoints (GPT):                           ║');
  console.log('║    POST /webhook/smart           - Universal router    ║');
  console.log('║    POST /webhook/done            - Mark task done      ║');
  console.log('║    GET  /webhook/morning         - Daily briefing      ║');
  console.log('║    GET  /webhook/evening         - Evening recap       ║');
  console.log('║    POST /webhook/log-gig         - Log freelance work  ║');
  console.log('║    GET  /webhook/earnings        - Earnings summary    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Brain directory:', BRAIN_DIR);
  console.log('');
});
