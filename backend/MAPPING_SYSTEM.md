# Universal Mapping System

This document describes the new Universal Mapping System that synchronizes and unifies data from both AllSportsAPI and API-Football.

## Overview

The Universal Mapping System provides:
- **Unified Data Access**: Single interface to access data from both APIs
- **Automatic Synchronization**: Matches teams and fixtures between APIs
- **Intelligent Fallbacks**: Uses best available data source
- **Caching**: Reduces API calls and improves performance
- **Real-time Updates**: Keeps data fresh and accurate

## Quick Start

### 1. Initialize the System

```javascript
const MappingNew = require('./src/services/MappingNew');

// Initialize the mapping system
await MappingNew.initialize();
```

### 2. Sync Match Data

```javascript
// Sync last 30 days and next 7 days of matches
const result = await MappingNew.syncMatches({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  forceUpdate: false
});

console.log('Sync results:', result);
```

### 3. Get Complete Match Data

```javascript
// Get unified match data from both APIs
const matchData = await MappingNew.getCompleteMatchData(matchId);

if (matchData) {
  console.log(`Match: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
  console.log(`Sources: ${Object.keys(matchData.sources).join(', ')}`);
  
  // Access data from specific APIs
  const allSportsData = matchData.allSports;
  const apiFootballData = matchData.apiFootball;
  
  // Use merged/best data
  const bestData = matchData.merged;
}
```

## Scripts

### Match Sync Script

Run the match synchronization script:

```bash
# Basic sync (last 30 days + next 7 days)
node sync-matches.js

# Custom date range
node sync-matches.js --days=7 --future=14

# Force update existing matches
node sync-matches.js --force

# Show help
node sync-matches.js --help
```

### Test Script

Test the mapping system:

```bash
node test-mapping.js
```

## API Reference

### Core Methods

#### `initialize()`
Initializes the mapping system and loads existing data.

#### `syncMatches(options)`
Synchronizes matches for a date range.

**Options:**
- `from`: Start date (Date object)
- `to`: End date (Date object)
- `forceUpdate`: Force update existing matches (boolean)

#### `getCompleteMatchData(matchId, source?)`
Gets unified match data from both APIs.

**Parameters:**
- `matchId`: Match/fixture ID
- `source`: Optional source preference ('allsports' or 'apifootball')

**Returns:**
```javascript
{
  id: 'universal-match-id',
  homeTeam: { id, name, logo },
  awayTeam: { id, name, logo },
  league: { id, name, logo },
  allSports: { /* raw AllSports data */ },
  apiFootball: { /* raw API Football data */ },
  merged: { /* best combined data */ },
  confidence: 0.95,
  verified: true,
  sources: ['allsports', 'apifootball']
}
```

#### `findTeam(identifier, source?)`
Finds a team by ID or name.

#### `getStatistics()`
Gets system statistics and status.

## Controller Integration

### Updated Corner Stats Controller

The `getMatchCornerStats` controller now uses the unified system:

```javascript
// Get complete match data from both APIs
const matchData = await MappingNew.getCompleteMatchData(matchId);

if (!matchData) {
  return res.status(404).json({
    success: false,
    error: 'Match not found in either API'
  });
}

// Extract corner statistics from best available source
let cornerStats = null;

// Try API Football first (usually better for live data)
if (matchData.apiFootball?.statistics) {
  cornerStats = extractCornersFromApiFootball(matchData.apiFootball);
}

// Fallback to AllSports
if (!cornerStats && matchData.allSports?.statistics) {
  cornerStats = extractCornersFromAllSports(matchData.allSports);
}

return res.json({
  success: true,
  result: {
    ...cornerStats,
    sources: Object.keys(matchData.sources),
    confidence: matchData.confidence,
    dataSource: cornerStats.dataSource
  }
});
```

## Data Flow

1. **Initialization**: Load existing mappings and sync state
2. **API Calls**: Fetch data from both AllSports and API-Football
3. **Matching**: Use fuzzy matching to link teams/matches between APIs
4. **Merging**: Combine data intelligently, preferring more complete sources
5. **Caching**: Store results to reduce future API calls
6. **Serving**: Provide unified data through single interface

## Benefits

### For Corner Statistics
- **Better Data Coverage**: Uses both APIs for maximum data availability
- **Live Match Support**: API Football often has better live match data
- **Fallback Protection**: If one API fails, the other provides data
- **Consistent Format**: Unified response format regardless of source

### For All Statistics
- **Universal Compatibility**: Works with any match ID from either API
- **Real Data Only**: No more mock/fallback data
- **Enhanced Accuracy**: Cross-validation between APIs
- **Performance**: Intelligent caching reduces API calls

## File Structure

```
backend/
├── src/services/MappingNew.js     # Main mapping service
├── src/data/mappings/             # Stored mapping data
│   ├── universal-teams.json       # Team mappings
│   ├── universal-leagues.json     # League mappings
│   ├── universal-matches.json     # Match mappings
│   └── id-mappings.json          # ID cross-references
├── sync-matches.js               # Match sync script
├── test-mapping.js              # Test script
└── MAPPING_SYSTEM.md           # This documentation
```

## Configuration

API keys and settings are configured in `MappingNew.js`:

```javascript
const API_CONFIG = {
  ALLSPORTS: {
    KEY: '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4',
    BASE_URL: 'https://apiv2.allsportsapi.com/football/',
    RATE_LIMIT: 100, // ms between requests
    MAX_RETRIES: 3
  },
  APIFOOTBALL: {
    KEY: '26703e5120975e64fc728bb2661f9acd',
    BASE_URL: 'https://v3.football.api-sports.io',
    RATE_LIMIT: 200, // ms between requests
    MAX_RETRIES: 3,
    DAILY_LIMIT: 100 // API Football has daily limits
  }
};
```

## Next Steps

1. **Run Initial Sync**: Use `node sync-matches.js` to populate the system
2. **Test Integration**: Use `node test-mapping.js` to verify functionality
3. **Update Other Controllers**: Apply the same pattern to card stats, BTTS, etc.
4. **Monitor Performance**: Check API usage and caching effectiveness
5. **Expand Coverage**: Add more leagues and historical data as needed
