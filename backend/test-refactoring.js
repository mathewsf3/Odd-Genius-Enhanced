#!/usr/bin/env node

/**
 * Test script to verify FootyStats-only refactoring is successful
 */

console.log('Testing FootyStats-only refactoring...\n');

// Test 1: Check if FootyStats service loads without errors
try {
  const footyStatsApiService = require('./src/services/footyStatsApiService');
  console.log('✅ FootyStats API service loads successfully');
  
  // Test if service has required methods
  const requiredMethods = [
    'getTodayMatches',
    'getLeagueMatches', 
    'getMatchById',
    'getLeagueStandings',
    'getTeamStats',
    'clearCache'
  ];
  
  const missingMethods = requiredMethods.filter(method => typeof footyStatsApiService[method] !== 'function');
  
  if (missingMethods.length === 0) {
    console.log('✅ FootyStats API service has all required methods');
  } else {
    console.log('❌ FootyStats API service missing methods:', missingMethods);
  }
} catch (error) {
  console.log('❌ FootyStats API service failed to load:', error.message);
}

// Test 2: Check if matches controller loads without errors
try {
  const matchesController = require('./src/controllers/matchesController');
  console.log('✅ Matches controller loads successfully');
  
  // Test if controller has required methods
  const requiredMethods = [
    'getLiveMatches',
    'getUpcomingMatches',
    'getMatchById',
    'getLeagueMatches',
    'getLiveLeagues',
    'clearCache'
  ];
  
  const missingMethods = requiredMethods.filter(method => typeof matchesController[method] !== 'function');
  
  if (missingMethods.length === 0) {
    console.log('✅ Matches controller has all required methods');
  } else {
    console.log('❌ Matches controller missing methods:', missingMethods);
  }
} catch (error) {
  console.log('❌ Matches controller failed to load:', error.message);
}

// Test 3: Check if deprecated API service throws errors properly
try {
  const apiFootballService = require('./src/services/apiFootballService');
  console.log('✅ Deprecated API Football service loads (as deprecation wrapper)');
    // Test if deprecation wrapper throws errors
  try {
    await apiFootballService.getMatches();
    console.log('❌ Deprecated API Football service should throw error');
  } catch (error) {
    if (error.message.includes('deprecated') || error.message.includes('FootyStats') || error.code === 'DEPRECATED_SERVICE') {
      console.log('✅ Deprecated API Football service properly throws deprecation error');
    } else {
      console.log('❌ Deprecated API Football service throws wrong error:', error.message);
    }
  }
} catch (error) {
  console.log('❌ Deprecated API Football service failed to load:', error.message);
}

// Test 4: Check if legacy services are properly removed
const legacyServices = [
  'cardStatsService',
  'enhanced-match-analysis',
  'MappingNew',
  'teamMappingService',
  'universalTeamDiscovery'
];

legacyServices.forEach(service => {
  try {
    require(`./src/services/${service}`);
    console.log(`❌ Legacy service ${service} should be removed`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log(`✅ Legacy service ${service} properly removed`);
    } else {
      console.log(`❌ Legacy service ${service} has unexpected error:`, error.message);
    }
  }
});

// Test 5: Check environment configuration
console.log('\n--- Environment Configuration ---');
console.log('FootyStats API Key:', process.env.FOOTYSTATS_API_KEY ? '✅ Present' : '❌ Missing');
console.log('Legacy API Keys:');
console.log('  - ALL_SPORTS_API_KEY:', process.env.ALL_SPORTS_API_KEY ? '❌ Still present (should be removed)' : '✅ Removed');
console.log('  - API_FOOTBALL_KEY:', process.env.API_FOOTBALL_KEY ? '❌ Still present (should be removed)' : '✅ Removed');

console.log('\n--- Refactoring Test Complete ---');
console.log('FootyStats-only refactoring verification completed.');
