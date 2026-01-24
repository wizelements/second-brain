/**
 * OpenAI Enrichment Module
 * 
 * Enriches voice/text captures with:
 * - Category classification (task/gig/reminder)
 * - Priority extraction
 * - Deadline parsing
 * - Entity extraction (person, amount, action)
 * - Relationship detection
 * 
 * Cost: ~$0.0005 per capture (gpt-3.5-turbo)
 */

const OpenAI = require('openai');

class CaptureEnricher {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not set - enrichment disabled, using regex fallback');
      this.client = null;
    } else {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Enrich a captured item with metadata
   * @param {string} text - Raw captured text
   * @param {array} context - Recent items for relationship detection
   * @returns {object} Enriched item
   */
  async enrich(text, context = []) {
    if (!this.client) {
      return this.enrichFallback(text, context);
    }

    try {
      const prompt = this.buildPrompt(text, context);
      
      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a personal assistant AI that classifies and extracts metadata from voice commands. Return ONLY valid JSON, no markdown, no code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content.trim();
      const enriched = JSON.parse(content);
      
      return {
        success: true,
        ...enriched,
        enrichment_model: "gpt-3.5-turbo",
        enrichment_timestamp: new Date().toISOString(),
        tokens_used: response.usage.total_tokens,
        cost_usd: (response.usage.total_tokens / 1000) * 0.0005
      };
    } catch (err) {
      console.error('❌ OpenAI enrichment error:', err.message);
      console.log('📋 Falling back to regex enrichment...');
      return this.enrichFallback(text, context);
    }
  }

  buildPrompt(text, context) {
    const recentItems = context
      .slice(0, 5)
      .map(item => `- [${item.category}] ${item.text}`)
      .join('\n');

    return `Analyze and classify this voice command:

"${text}"

Recent items for context (find relationships):
${recentItems || '(none)'}

Return JSON with ONLY these fields:
{
  "text": "original text",
  "category": "task|gig|reminder|milestone",
  "priority": "critical|high|medium|low",
  "deadline": "ISO8601 or null",
  "entities": {
    "person": "name or null",
    "amount": number or null,
    "action": "verb or null",
    "location": "place or null"
  },
  "tags": ["tag1", "tag2"],
  "parent_id": "uuid or null (if relates to existing item)",
  "next_action": "specific next step",
  "reasoning": "brief explanation"
}

Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Fallback enrichment using regex (no API costs)
   * @param {string} text - Raw text
   * @param {array} context - Recent items
   * @returns {object} Basic enriched data
   */
  enrichFallback(text, context = []) {
    const lower = text.toLowerCase();
    
    // Category detection
    let category = 'task';
    if (/gig:|client:|payment:|invoice:|$\d+/i.test(text)) {
      category = 'gig';
    } else if (/call:|remind:|remember:|dont forget:|buy:|get:|email:/i.test(text)) {
      category = 'reminder';
    } else if (/deadline|project|build|implement|design|deploy/i.test(text)) {
      category = 'task';
    }

    // Priority detection
    let priority = 'medium';
    if (/urgent|asap|critical|today|now|immediately/i.test(text)) {
      priority = 'high';
    } else if (/later|whenever|eventually|sometime|backlog/i.test(text)) {
      priority = 'low';
    }

    // Deadline parsing (simple)
    let deadline = null;
    const dayMatches = text.match(/today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday/i);
    if (dayMatches) {
      const day = dayMatches[0].toLowerCase();
      const now = new Date();
      // Simple: if future day, add to next occurrence
      deadline = this.parseDay(day, now);
    }

    // Amount extraction
    let amount = null;
    const amountMatch = text.match(/\$(\d+)|(\d+)\s*(dollars?|usd|bucks)/i);
    if (amountMatch) {
      amount = parseInt(amountMatch[1] || amountMatch[2]);
    }

    // Person name extraction (simple - capitalized words)
    let person = null;
    const nameMatches = text.match(/\b([A-Z][a-z]+)\b/g);
    if (nameMatches && nameMatches.length > 0) {
      person = nameMatches[0]; // First capitalized word
    }

    // Action extraction
    let action = null;
    const verbs = ['call', 'email', 'send', 'finish', 'build', 'deploy', 'review', 'test', 'fix'];
    for (const verb of verbs) {
      if (text.toLowerCase().includes(verb)) {
        action = verb;
        break;
      }
    }

    // Check for relationships
    let parentId = null;
    if (context && context.length > 0) {
      // Simple: if same client/person in recent items, link to them
      if (person) {
        const related = context.find(item => item.text.includes(person));
        if (related) {
          parentId = related.id;
        }
      }
    }

    return {
      success: true,
      text,
      category,
      priority,
      deadline,
      entities: {
        person,
        amount,
        action,
        location: null
      },
      tags: this.extractTags(text, category),
      parent_id: parentId,
      next_action: this.generateNextAction(text, category, amount),
      reasoning: 'Regex-based enrichment (OpenAI unavailable)',
      enrichment_model: 'regex-fallback',
      enrichment_timestamp: new Date().toISOString(),
      cost_usd: 0
    };
  }

  parseDay(dayStr, baseDate = new Date()) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = baseDate.getDay();
    
    if (dayStr === 'today') {
      const date = new Date(baseDate);
      date.setHours(17, 0, 0, 0); // 5 PM
      return date.toISOString();
    }
    
    if (dayStr === 'tomorrow') {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + 1);
      date.setHours(17, 0, 0, 0);
      return date.toISOString();
    }

    // Find next occurrence of day
    const targetDay = days.indexOf(dayStr);
    if (targetDay === -1) return null;

    const date = new Date(baseDate);
    let diff = targetDay - today;
    if (diff <= 0) diff += 7;
    date.setDate(date.getDate() + diff);
    date.setHours(17, 0, 0, 0);
    return date.toISOString();
  }

  extractTags(text, category) {
    const tags = [category];
    
    // Auto-tag based on keywords
    const keywords = {
      'urgency': ['urgent', 'asap', 'critical', 'today'],
      'client-work': ['client', 'project', 'delivery'],
      'code': ['build', 'code', 'deploy', 'fix', 'implement'],
      'communication': ['call', 'email', 'message', 'reach out'],
      'learning': ['learn', 'study', 'understand', 'research'],
      'finance': ['invoice', 'payment', 'bill', 'charge']
    };

    for (const [tag, words] of Object.entries(keywords)) {
      if (words.some(w => text.toLowerCase().includes(w))) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)].slice(0, 5); // Max 5 tags, dedupe
  }

  generateNextAction(text, category, amount) {
    if (category === 'gig' && amount) {
      return `Invoice client for $${amount}`;
    }
    if (category === 'reminder') {
      return `Complete: ${text.substring(0, 50)}`;
    }
    if (category === 'task') {
      return `Work on: ${text.substring(0, 50)}`;
    }
    return `Follow up: ${text.substring(0, 50)}`;
  }

  /**
   * Batch enrich multiple items (more efficient)
   * @param {array} items - Array of raw texts
   * @param {array} context - Context items
   * @returns {array} Enriched items
   */
  async enrichBatch(items, context = []) {
    return Promise.all(
      items.map(item => this.enrich(item, context))
    );
  }
}

module.exports = CaptureEnricher;
