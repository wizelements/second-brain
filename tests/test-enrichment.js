#!/usr/bin/env node

/**
 * Test Enrichment Module
 * 
 * Tests the OpenAI enrichment without running the full server
 * 
 * Usage:
 *   node tests/test-enrichment.js
 *   OPENAI_API_KEY=sk-... node tests/test-enrichment.js
 */

require('dotenv').config({ path: '../.env' });

const CaptureEnricher = require('../ai/enrichment');

// Test samples
const samples = [
  "call john about the $500 gig deadline friday",
  "finish gratog landing page by tomorrow",
  "remind me to buy groceries",
  "ACME Corp contract - $2500 website redesign",
  "review code for payment module",
  "deploy to production asap",
  "schedule meeting with client next monday"
];

async function runTests() {
  console.log('\n🧪 Testing Enrichment Module\n');
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set (using fallback)');
  console.log('---\n');

  const enricher = new CaptureEnricher(process.env.OPENAI_API_KEY);

  for (const sample of samples) {
    console.log(`📝 Input: "${sample}"`);
    
    try {
      const result = await enricher.enrich(sample);
      
      console.log(`✅ Category: ${result.category}`);
      console.log(`   Priority: ${result.priority}`);
      console.log(`   Deadline: ${result.deadline || '(none)'}`);
      if (result.entities && result.entities.person) {
        console.log(`   Person: ${result.entities.person}`);
      }
      if (result.entities && result.entities.amount) {
        console.log(`   Amount: $${result.entities.amount}`);
      }
      console.log(`   Tags: ${(result.tags || []).join(', ') || '(auto)'}`);
      console.log(`   Model: ${result.enrichment_model}`);
      if (result.cost_usd > 0) {
        console.log(`   Cost: $${result.cost_usd.toFixed(6)}`);
      }
      console.log();
    } catch (err) {
      console.error(`❌ Error: ${err.message}\n`);
    }
  }

  console.log('\n✨ Tests complete\n');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
