#!/usr/bin/env node

/**
 * 🔑 API Keys Setup Script
 * 
 * This script helps you set up your Anthropic API keys for the Claude Code integration.
 * It will update the backend/.env file with your API keys.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupApiKeys() {
  console.log('🔑 Claude Code API Keys Setup');
  console.log('==============================\n');
  
  console.log('This script will help you configure your Anthropic API keys for the Claude Code integration.');
  console.log('You can get your API keys from: https://console.anthropic.com/\n');
  
  const envPath = path.join(__dirname, 'backend', '.env');
  
  try {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('📝 Current .env file found. We\'ll update it with your API keys.\n');
    
    // Ask for API keys
    console.log('Please enter your Anthropic API keys:');
    console.log('(You can press Enter to skip any key you don\'t have)\n');
    
    const primaryKey = await question('Primary Anthropic API Key: ');
    const key2 = await question('Second API Key (optional): ');
    const key3 = await question('Third API Key (optional): ');
    const key4 = await question('Fourth API Key (optional): ');
    const key5 = await question('Fifth API Key (optional): ');
    
    // Update the .env file
    if (primaryKey.trim()) {
      envContent = envContent.replace(/ANTHROPIC_API_KEY=.*/, `ANTHROPIC_API_KEY=${primaryKey.trim()}`);
      envContent = envContent.replace(/CLAUDE_API_KEY_1=.*/, `CLAUDE_API_KEY_1=${primaryKey.trim()}`);
    }
    
    if (key2.trim()) {
      envContent = envContent.replace(/CLAUDE_API_KEY_2=.*/, `CLAUDE_API_KEY_2=${key2.trim()}`);
      envContent = envContent.replace(/ANTHROPIC_API_KEY_2=.*/, `ANTHROPIC_API_KEY_2=${key2.trim()}`);
    }
    
    if (key3.trim()) {
      envContent = envContent.replace(/CLAUDE_API_KEY_3=.*/, `CLAUDE_API_KEY_3=${key3.trim()}`);
      envContent = envContent.replace(/ANTHROPIC_API_KEY_3=.*/, `ANTHROPIC_API_KEY_3=${key3.trim()}`);
    }
    
    if (key4.trim()) {
      envContent = envContent.replace(/CLAUDE_API_KEY_4=.*/, `CLAUDE_API_KEY_4=${key4.trim()}`);
      envContent = envContent.replace(/ANTHROPIC_API_KEY_4=.*/, `ANTHROPIC_API_KEY_4=${key4.trim()}`);
    }
    
    if (key5.trim()) {
      envContent = envContent.replace(/CLAUDE_API_KEY_5=.*/, `CLAUDE_API_KEY_5=${key5.trim()}`);
      envContent = envContent.replace(/ANTHROPIC_API_KEY_5=.*/, `ANTHROPIC_API_KEY_5=${key5.trim()}`);
    }
    
    // Write the updated .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ API keys have been saved to backend/.env');
    
    if (primaryKey.trim()) {
      console.log('\n🚀 You can now start the AI team server with:');
      console.log('   node ai-agents/ai-team-server.js');
      console.log('\n🧪 Or test the integration with:');
      console.log('   node ai-agents/test-claude-code-integration.js');
    } else {
      console.log('\n⚠️  No primary API key was provided.');
      console.log('   The system will work in fallback mode without Claude Code integration.');
      console.log('   You can run this script again to add your API keys later.');
    }
    
  } catch (error) {
    console.error('❌ Error setting up API keys:', error.message);
    console.log('\nPlease make sure the backend/.env file exists and is writable.');
  }
  
  rl.close();
}

// Show current status
function showCurrentStatus() {
  console.log('📊 Current API Key Status');
  console.log('=========================\n');
  
  const envPath = path.join(__dirname, 'backend', '.env');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const keys = [
      'ANTHROPIC_API_KEY',
      'CLAUDE_API_KEY_1',
      'CLAUDE_API_KEY_2',
      'CLAUDE_API_KEY_3',
      'CLAUDE_API_KEY_4',
      'CLAUDE_API_KEY_5'
    ];
    
    keys.forEach(key => {
      const match = envContent.match(new RegExp(`${key}=(.+)`));
      if (match && match[1] && !match[1].includes('your-') && match[1].trim() !== '') {
        console.log(`✅ ${key}: Set (${match[1].substring(0, 10)}...)`);
      } else {
        console.log(`❌ ${key}: Not set`);
      }
    });
    
  } catch (error) {
    console.log('❌ Could not read .env file');
  }
  
  console.log('\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    showCurrentStatus();
    return;
  }
  
  if (args.includes('--help')) {
    console.log('🔑 API Keys Setup Script');
    console.log('========================\n');
    console.log('Usage:');
    console.log('  node setup-api-keys.js          # Interactive setup');
    console.log('  node setup-api-keys.js --status # Show current status');
    console.log('  node setup-api-keys.js --help   # Show this help');
    console.log('\n');
    return;
  }
  
  showCurrentStatus();
  await setupApiKeys();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupApiKeys, showCurrentStatus };
