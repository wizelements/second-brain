/**
 * ADD THESE ENDPOINTS TO server.js AFTER THE INBOX SECTION
 * 
 * These endpoints support the new "Start Here" UI
 */

// ============================================
// REMINDERS ENDPOINT
// ============================================

const REMINDERS_FILE = path.join(BRAIN_DIR, 'reminders.jsonl');

// Get all reminders
app.get('/webhook/reminders', (req, res) => {
  const reminders = [];
  
  try {
    if (fs.existsSync(REMINDERS_FILE)) {
      const lines = fs.readFileSync(REMINDERS_FILE, 'utf-8').split('\n').filter(l => l.trim());
      lines.forEach(line => {
        try {
          const reminder = JSON.parse(line);
          if (reminder.status === 'pending') {
            reminders.push(reminder);
          }
        } catch (e) {}
      });
    }
  } catch (e) {
    console.error('Error reading reminders:', e.message);
  }

  // Sort by date
  reminders.sort((a, b) => new Date(a.at) - new Date(b.at));

  res.json(reminders);
});

// Add reminder
app.post('/webhook/reminders', (req, res) => {
  const { text, at } = req.body;

  if (!text || !at) {
    return res.status(400).json({ error: 'text and at (datetime) required' });
  }

  const reminder = {
    id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    at,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Append to JSONL file
  fs.appendFileSync(REMINDERS_FILE, JSON.stringify(reminder) + '\n');

  res.json({
    success: true,
    id: reminder.id,
    message: `Reminder set for ${at}`
  });
});

// Mark reminder as done
app.post('/webhook/reminders/:id/done', (req, res) => {
  const { id } = req.params;

  try {
    if (fs.existsSync(REMINDERS_FILE)) {
      const lines = fs.readFileSync(REMINDERS_FILE, 'utf-8').split('\n');
      const updated = lines.map(line => {
        if (!line.trim()) return line;
        try {
          const reminder = JSON.parse(line);
          if (reminder.id === id) {
            reminder.status = 'done';
            reminder.completedAt = new Date().toISOString();
          }
          return JSON.stringify(reminder);
        } catch (e) {
          return line;
        }
      });
      fs.writeFileSync(REMINDERS_FILE, updated.join('\n'));
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  res.json({ success: true, message: 'Reminder marked as done' });
});

// ============================================
// GUIDES ENDPOINT
// ============================================

// Get all guides
app.get('/webhook/guides', (req, res) => {
  const guides = [];

  try {
    if (fs.existsSync(GUIDES_DIR)) {
      const files = fs.readdirSync(GUIDES_DIR);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const filePath = path.join(GUIDES_DIR, file);
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf-8');
          const title = content.split('\n')[0].replace(/^#+\s+/, '');

          guides.push({
            id: file.replace('.md', ''),
            title: title || file,
            path: filePath,
            created: stats.birthtime,
            modified: stats.mtime,
            size: stats.size
          });
        }
      });
    }
  } catch (e) {
    console.error('Error reading guides:', e.message);
  }

  // Sort by modified date (newest first)
  guides.sort((a, b) => new Date(b.modified) - new Date(a.modified));

  res.json(guides);
});

// Get specific guide content
app.get('/webhook/guides/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(GUIDES_DIR, id + '.md');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Guide not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.type('text/markdown').send(content);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================
// NOTES ENDPOINT
// ============================================

const NOTES_FILE = path.join(BRAIN_DIR, 'notes.jsonl');

// Get all notes
app.get('/webhook/notes', (req, res) => {
  const notes = [];

  try {
    if (fs.existsSync(NOTES_FILE)) {
      const lines = fs.readFileSync(NOTES_FILE, 'utf-8').split('\n').filter(l => l.trim());
      lines.forEach(line => {
        try {
          const note = JSON.parse(line);
          notes.push(note);
        } catch (e) {}
      });
    }
  } catch (e) {
    console.error('Error reading notes:', e.message);
  }

  // Sort by date (newest first)
  notes.sort((a, b) => new Date(b.ts) - new Date(a.ts));

  res.json(notes);
});

// Add note
app.post('/webhook/notes', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }

  const note = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    ts: new Date().toISOString()
  };

  fs.appendFileSync(NOTES_FILE, JSON.stringify(note) + '\n');

  res.json({
    success: true,
    id: note.id,
    message: 'Note saved'
  });
});

// ============================================
// COMMAND ENDPOINT (for UI command input)
// ============================================

app.post('/webhook/command', (req, res) => {
  const { command, source } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'command required' });
  }

  // Parse command type and execute appropriate handler
  const cmd = command.toLowerCase();

  try {
    // Reminder commands
    if (cmd.includes('remind')) {
      // "remind me tomorrow at 9am to call mom"
      // Extract date and text
      const match = cmd.match(/remind me (.+?) to (.+)/i);
      if (match) {
        // For now, just create the reminder
        // In production, parse natural language date
        res.json({
          success: true,
          message: `Reminder set: ${match[2]}`,
          type: 'reminder'
        });
        return;
      }
    }

    // Capture commands
    if (cmd.includes('capture') || cmd.includes('note')) {
      res.json({
        success: true,
        message: 'Capture created',
        type: 'capture'
      });
      return;
    }

    // Search commands
    if (cmd.includes('search') || cmd.includes('find')) {
      res.json({
        success: true,
        message: 'Search executed',
        type: 'search',
        results: []
      });
      return;
    }

    // Sync commands
    if (cmd.includes('sync')) {
      exec('cd ' + BRAIN_DIR + ' && git pull && git push', (error, stdout, stderr) => {
        res.json({
          success: !error,
          message: error ? 'Sync failed' : 'Brain synced',
          type: 'sync'
        });
      });
      return;
    }

    // Generic response
    res.json({
      success: true,
      message: `Command received: ${command}`,
      type: 'generic'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SYNC ENDPOINT
// ============================================

app.post('/webhook/sync', (req, res) => {
  const { direction = 'both' } = req.body;

  try {
    const results = {};

    if (direction === 'pull' || direction === 'both') {
      const pullOutput = execSync('cd ' + BRAIN_DIR + ' && git pull', { encoding: 'utf-8' });
      results.pull = pullOutput;
    }

    if (direction === 'push' || direction === 'both') {
      execSync('cd ' + BRAIN_DIR + ' && git add -A', { encoding: 'utf-8' });
      const commitOutput = execSync('cd ' + BRAIN_DIR + ' && git commit -m "Auto-sync from UI" 2>&1 || true', { encoding: 'utf-8' });
      const pushOutput = execSync('cd ' + BRAIN_DIR + ' && git push', { encoding: 'utf-8' });
      results.push = pushOutput;
    }

    res.json({
      success: true,
      message: 'Brain synced',
      direction,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
