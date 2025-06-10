#!/usr/bin/env node

/**
 * Odd Genius Server Startup Script
 * Manages startup configuration and error handling
 */

console.log('\x1b[36m%s\x1b[0m', '###################################################');
console.log('\x1b[36m%s\x1b[0m', '#              ODD GENIUS API SERVER              #');
console.log('\x1b[36m%s\x1b[0m', '#     Real-time soccer betting analytics API      #');
console.log('\x1b[36m%s\x1b[0m', '###################################################');
console.log('');

// Check NodeJS version
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 14) {
  console.log('\x1b[31m%s\x1b[0m', 'Error: Node.js version 14 or higher is required.');
  console.log(`Current version: ${process.versions.node}`);
  process.exit(1);
}

// Check for AllSportsAPI key in environment
if (!process.env.ALL_SPORTS_API_KEY) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: Using default AllSportsAPI key from configuration.');
  process.env.ALL_SPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
} else {
  console.log('\x1b[32m%s\x1b[0m', 'Using AllSportsAPI key from environment variables.');
}

// Set logging level
if (!process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'info';
}

console.log(`Setting log level to: ${process.env.LOG_LEVEL}`);

// Set default cache settings
if (!process.env.CACHE_TTL) {
  process.env.CACHE_TTL = '30000'; // 30 seconds
}

// Configure memory for large datasets
try {
  // Increase memory limit for Node.js
  // Useful for handling large datasets
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`;
} catch (err) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: Unable to set memory options.');
}

// Check RAM availability
const os = require('os');
const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10;
const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024) * 10) / 10;

console.log(`System memory: ${freeMemory}GB free of ${totalMemory}GB total`);
if (freeMemory < 1) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: Low memory available. Performance may be affected.');
}

console.log('\x1b[32m%s\x1b[0m', 'Starting server...\n');

// Start the server
try {
  require('./src/server');
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to start server:');
  console.error(error);
  process.exit(1);
}