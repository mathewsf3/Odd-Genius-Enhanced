# Live vs Upcoming Matches - File Analysis

## 🔍 **Key Difference Found**

**CRITICAL ISSUE**: Live matches use different API endpoints and data processing than upcoming matches!

### **Live Match Processing**
- Uses `Livescore` API endpoint (`met: 'Livescore'`)
- Uses `live: true` parameter in Fixtures endpoint
- Status set to `'LIVE'` with elapsed time
- Different data transformation logic

### **Upcoming Match Processing**  
- Uses `Fixtures` API endpoint (`met: 'Fixtures'`)
- Uses date range filtering (`from`/`to` parameters)
- Status set to `'NS'` (Not Started)
- Standard data transformation logic

## 📁 **Backend Files**

### 1. **backend/src/services/allSportsApiService.js** (MAIN ISSUE)
**Lines 352-534**: `fetchLiveMatches()` function
**Lines 539-688**: `fetchUpcomingMatches()` function

**KEY DIFFERENCES:**
- **Live**: Uses `met: 'Livescore'` + `met: 'Fixtures'` with `live: true`
- **Upcoming**: Uses `met: 'Fixtures'` with date range
- **Live**: Different field extraction logic for scores/status
- **Upcoming**: Standard field extraction logic

### 2. **backend/src/controllers/matchesController.js**
**Lines 8-40**: `getLiveMatches()` - calls `allSportsApiService.getLiveMatches()`
**Lines 43-70**: `getUpcomingMatches()` - calls `allSportsApiService.getUpcomingMatches()`
**Lines 177-202**: Match lookup tries live first, then upcoming
**Lines 488-495**: BTTS stats tries live first, then upcoming

### 3. **backend/src/routes/api.js**
**Line 10**: `/matches/live` route
**Line 13**: `/matches/upcoming` route

## 📁 **Frontend Files**

### 4. **frontend/src/api/services/soccerApiService.ts**
**Lines 68-76**: `getLiveMatches()` - calls `/matches/live`
**Lines 78-86**: `getUpcomingMatches()` - calls `/matches/upcoming`

### 5. **frontend/src/pages/LiveMatches.tsx**
**Lines 47-65**: `fetchMatches()` - conditional logic for live vs upcoming
**Lines 72-75**: Different refresh intervals (30s live, 60s upcoming)

### 6. **frontend/src/pages/Dashboard.tsx**
**Lines 65-76**: `fetchLiveMatches()` function
**Lines 77-88**: `fetchUpcomingMatches()` function

## 🔍 **Root Cause Analysis**

### **The Problem:**
When a match transitions from upcoming to live:

1. **Data Source Changes**: 
   - Upcoming: `Fixtures` endpoint with full match data
   - Live: `Livescore` endpoint with limited live data

2. **Field Availability Changes**:
   - Upcoming: Full team IDs, statistics, comprehensive data
   - Live: Limited fields, possibly missing team IDs or statistics

3. **Team ID Extraction Differs**:
   - Upcoming: `event_home_team_id`, `event_away_team_id`
   - Live: Possibly different field names or missing IDs

### **Why Corner Stats & Player Stats Fail for Live Matches:**

1. **Team ID Mismatch**: Live matches might have different team ID field names
2. **Missing Statistics**: Live endpoint might not include historical statistics
3. **Data Format Changes**: Live data structure differs from upcoming data structure

## 🛠️ **Files to Debug**

### **Priority 1: Data Source Investigation**
1. `backend/src/services/allSportsApiService.js` (lines 352-534, 539-688)
2. `backend/src/controllers/matchesController.js` (lines 177-202, 488-495)

### **Priority 2: Team ID Extraction**
1. Check how team IDs are extracted in live vs upcoming matches
2. Verify field names used for team identification

### **Priority 3: Statistics Endpoint Calls**
1. Corner Stats: Check if team IDs from live matches work with statistics APIs
2. Player Stats: Check if team IDs from live matches work with player statistics APIs

## 🧪 **Debugging Steps**

1. **Compare Team ID Extraction**:
   - Log team IDs from upcoming match: `event_home_team_id`, `event_away_team_id`
   - Log team IDs from live match: Check what fields are available

2. **Test API Calls**:
   - Use team IDs from live match to call Corner Stats API
   - Use team IDs from live match to call Player Stats API
   - Compare with team IDs from upcoming match

3. **Check Data Availability**:
   - Verify if live matches have `home_team_key`/`away_team_key` fields
   - Check if live matches have different team ID field names
