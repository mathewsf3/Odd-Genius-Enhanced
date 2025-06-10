# Head-to-Head Data Troubleshooting Guide

## Overview

This document provides troubleshooting steps for issues related to the Head-to-Head (H2H) data integration in our application. It focuses specifically on the implementation used for the match page at `http://localhost:3000/match/1568037`.

## Common Issues

### 1. "Failed to fetch head-to-head data" Error

#### Possible Causes:

- Invalid or expired API key
- Network connectivity issues
- Incorrect team IDs
- API rate limits exceeded
- Server-side issues with AllSportsAPI

#### Troubleshooting Steps:

1. **Verify API Key**

   ```javascript
   // Check in frontend/src/config/api-config.ts
   const API_CONFIG = {
     API_KEY:
       "9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4",
     // Rest of configuration...
   };
   ```

2. **Test API Connection Directly**

   - Open `http://localhost:3000/h2h-diagnostic.html` in your browser
   - Click "Test API Connection" to verify the API is responding
   - Check browser console for detailed error messages

3. **Verify Team IDs**

   ```javascript
   // In SpecialMatch.tsx, check that team IDs are correct
   const homeTeamId = matchData.homeTeam.id.replace("team-", ""); // Should be 93
   const awayTeamId = matchData.awayTeam.id.replace("team-", ""); // Should be 4973
   ```

4. **Check Network Tab in DevTools**

   - Open browser DevTools and go to the Network tab
   - Look for the API request to `apiv2.allsportsapi.com`
   - Check status code and response

5. **Disable Mock Data Fallback**
   ```javascript
   // In frontend/src/config/api-config.ts
   const API_CONFIG = {
     // Other configs...
     USE_MOCK_DATA_FALLBACK: false,
     // Other configs...
   };
   ```

### 2. "axios is not defined" Error

#### Possible Causes:

- Missing import statement for axios
- Axios package not installed

#### Troubleshooting Steps:

1. **Verify Import Statement**

   ```javascript
   // Make sure this is at the top of SpecialMatch.tsx
   import axios from "axios";
   ```

2. **Check Package Installation**

   ```powershell
   # Run in terminal to check if axios is installed
   cd "c:\Users\mathe\OneDrive\Desktop\odd-genius - WORKING - Copy\frontend"
   npm list axios
   ```

3. **Reinstall Axios If Needed**
   ```powershell
   npm install axios
   ```

### 3. Data Not Updated or Still Using Mock Data

#### Possible Causes:

- Mock data fallback is enabled
- Cache issues
- Service worker caching old responses

#### Troubleshooting Steps:

1. **Force Direct API Call**

   ```javascript
   // In SpecialMatch.tsx, bypass the service layer
   const url = `https://apiv2.allsportsapi.com/football/?met=H2H&APIkey=${apiKey}&firstTeamId=${homeTeamId}&secondTeamId=${awayTeamId}`;
   const apiResponse = await axios.get(url);
   ```

2. **Clear Browser Cache**

   - In browser DevTools, right-click on the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Restart Development Server**
   ```powershell
   # Kill existing server and restart
   cd "c:\Users\mathe\OneDrive\Desktop\odd-genius - WORKING - Copy\frontend"
   npm run start:lowmem
   ```

### 4. TypeScript Errors in CustomHeadToHeadTab Component

#### Possible Causes:

- Type mismatches between API data and component expectations
- Missing interface properties

#### Troubleshooting Steps:

1. **Check Interface Definitions**

   ```typescript
   // In frontend/src/types/interfaces.ts
   // Make sure H2HData interface is properly defined
   export interface H2HData {
     firstTeam: Team;
     secondTeam: Team;
     summary: {
       totalMatches: number;
       wins: {
         firstTeam: number;
         secondTeam: number;
         draws: number;
       };
       goals: {
         firstTeam: number;
         secondTeam: number;
       };
     };
     matches: BaseMatch[];
   }
   ```

2. **Use Type Assertions When Needed**

   ```typescript
   // In CustomHeadToHeadTab.tsx
   const matchWithResult = match as unknown as MatchWithResult;
   ```

3. **Fix Property Access**
   ```typescript
   // Update the way team names are accessed
   <Text>{match.awayTeam?.name || "Away Team"}</Text>
   ```

### 5. Memory Issues When Processing Large Datasets

#### Possible Causes:

- Too many matches being processed
- Inefficient data transformation
- Memory leaks in useEffect

#### Troubleshooting Steps:

1. **Limit the Number of Matches**

   ```javascript
   // In SpecialMatch.tsx
   const recentMatches = apiH2H.H2H.slice(0, 10); // Only process 10 most recent matches
   ```

2. **Optimize Memory Usage**

   ```javascript
   // Use memory-optimized request options
   const apiResponse = await axios.get(url, {
     signal: abortController.signal,
     decompress: true,
   });
   ```

3. **Run with Memory Optimization**
   ```powershell
   # Start with lower memory usage
   npm run start:lowmem
   ```

## Testing Tools

### 1. API Test Script

Use the included test script to verify API connectivity:

```javascript
// In browser console
// Visit http://localhost:3000
fetch("public/test-h2h-api.js")
  .then((response) => response.text())
  .then((script) => {
    eval(script);
    testH2HApi();
  });
```

### 2. Diagnostic HTML Page

Open `http://localhost:3000/h2h-diagnostic.html` in your browser to:

- Test API connectivity
- Compare real vs. mock data
- View sample API responses

## API Documentation

### AllSportsAPI H2H Endpoint

URL: `https://apiv2.allsportsapi.com/football/?met=H2H&APIkey={API_KEY}&firstTeamId={FIRST_TEAM_ID}&secondTeamId={SECOND_TEAM_ID}`

**Parameters:**

- `API_KEY`: Your AllSportsAPI key
- `firstTeamId`: ID of the first team (e.g., 93 for Lazio)
- `secondTeamId`: ID of the second team (e.g., 4973 for Torino)

**Sample Response:**

```json
{
  "success": 1,
  "result": {
    "H2H": [
      {
        "event_key": "1201242",
        "event_date": "2023-05-22",
        "event_time": "18:30",
        "event_home_team": "Lazio",
        "home_team_key": "93",
        "event_away_team": "Torino",
        "away_team_key": "4973",
        "event_final_result": "2 - 0",
        "league_name": "Serie A",
        "league_key": "207",
        "country_name": "Italy",
        "event_status": "Finished"
      }
      // More matches...
    ]
  }
}
```

## Conclusion

This troubleshooting guide covers the most common issues with the H2H data integration. If problems persist after going through these steps, consider:

1. Checking AllSportsAPI documentation for API changes
2. Verifying team IDs in their database
3. Implementing a more robust fallback mechanism
4. Adding more detailed logging for API responses

Document created: May 20, 2025
Last updated: May 20, 2025
