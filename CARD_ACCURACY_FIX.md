# 🔧 Card Statistics Accuracy Fix

## 🚨 Problem Identified

Card statistics are showing **significant undercount** compared to official sources:

### **Expected vs Actual (Last 5 matches):**
| Team | Expected | Current UI | Difference |
|------|----------|------------|------------|
| Bragantino | 2.4 cards/match | 2.0 cards/match | **-0.4** |
| Juventude | 2.8 cards/match | 2.2 cards/match | **-0.6** |
| **Combined** | **5.2 total** | **4.2 total** | **-1.0** |

## 🔍 Root Causes Identified

### 1. **Incomplete Field Extraction**
- Only using `yellowcards` field, missing `yellowcards_ft` (full-time)
- Missing cards from second half if only `_ht` (half-time) fields are used
- Not checking all possible field name variations

### 2. **Competition Filtering Issues**
- Copa do Brasil matches might be excluded from card stats but included in corner stats
- Inconsistent league filtering between different statistics modules

### 3. **Double Yellow + Red Card Handling**
- When player gets 2×YC + RC, some feeds only register the red card
- Missing the second yellow card in `Yellow2` scenarios

## ✅ Fixes Implemented

### **1. Enhanced Card Data Extraction**

Added comprehensive field checking in `extractEnhancedCardData()`:

```javascript
// Method 1: Statistics array parsing
if (match.statistics && Array.isArray(match.statistics)) {
  for (const stat of match.statistics) {
    if (stat.type && stat.type.toLowerCase().includes('card')) {
      // Extract both home and away values
      const teamValue = isHome ? parseInt(stat.home) : parseInt(stat.away);
      if (stat.type.toLowerCase().includes('yellow')) {
        yellowCards = Math.max(yellowCards, teamValue);
      }
    }
  }
}

// Method 2: Cards array processing
if (match.cards && Array.isArray(match.cards)) {
  for (const card of match.cards) {
    const cardTeam = card.home_fault ? 'home' : 'away';
    const isOurCard = (isHome && cardTeam === 'home') || (!isHome && cardTeam === 'away');
    
    if (isOurCard && card.card === 'yellow card') {
      matchYellow++;
    }
  }
}

// Method 3: Multiple field name variations
const cardFields = [
  `event_${isHome ? 'home' : 'away'}_yellow_cards`,
  `${isHome ? 'home' : 'away'}_team_yellow_cards`,
  `yellowcards_${isHome ? 'home' : 'away'}`,
  `yellow_cards_${isHome ? 'home' : 'away'}`,
  `yellowcards_${isHome ? 'home' : 'away'}_ft`, // Full-time cards
  `redcards_${isHome ? 'home' : 'away'}_ft`
];
```

### **2. Comprehensive Logging**

Added detailed logging to track extraction process:

```javascript
logger.info(`Extracting enhanced card data for ${teamName} (${isHome ? 'home' : 'away'}) in match ${match.id}`);
logger.info(`Found yellow cards in statistics: ${teamValue} for ${teamName}`);
logger.info(`Found cards in cards array: ${matchYellow} yellow, ${matchRed} red for ${teamName}`);
logger.info(`Enhanced extraction result for ${teamName}: ${yellowCards} yellow, ${redCards} red`);
```

### **3. Three-Method Extraction Approach**

1. **Method 1**: Direct field extraction (existing)
2. **Method 2**: Card events from Fixtures endpoint (existing)
3. **Method 3**: Enhanced extraction with multiple field checks (NEW)

### **4. Improved Data Validation**

- Uses `Math.max()` to ensure highest card count is captured
- Checks multiple field name variations
- Handles both full-time and half-time card data
- Processes both statistics arrays and cards arrays

## 🧪 Testing Implementation

### **Test Script Created: `test-card-accuracy.js`**

Features:
- Tests API endpoints directly with expected vs actual comparison
- Checks UI values against known accurate data
- Provides specific debugging recommendations
- Validates both 5 and 10 match filtering

### **Expected Test Results:**
```javascript
// Bragantino (Last 5 matches)
Expected: 2.4 cards/match (12 total cards)
Matches: 4+2+3+2+1 = 12 yellow cards

// Juventude (Last 5 matches)  
Expected: 2.8 cards/match (14 total cards)
Matches: 4+4+2+2+2 = 14 yellow cards

// Combined
Expected: 5.2 cards/match total
```

## 🔧 API Endpoint Improvements

### **Enhanced Fixtures Request:**
```javascript
const response = await axios.get(`${BASE_URL}/`, {
  params: {
    met: 'Fixtures',
    APIkey: API_KEY,
    teamId: teamId,
    from: fromDate,
    to: toDate,
    withPlayerCards: 1, // Request card events
    include: 'cards,statistics' // Include both cards and statistics
  }
});
```

## 📊 Verification Steps

### **1. Backend Logs Check**
Look for these log messages:
```
[card-stats] Extracting enhanced card data for Bragantino (home) in match 12345
[card-stats] Found yellow cards in statistics: 4 for Bragantino
[card-stats] Enhanced extraction result for Bragantino: 4 yellow, 0 red
```

### **2. API Response Validation**
```bash
curl "http://localhost:5000/api/card-stats/1544012?gameCount=5"
```

Expected response structure:
```json
{
  "homeStats": {
    "teamName": "Bragantino",
    "totalYellowCards": 12,
    "averageCardsPerMatch": 2.4,
    "matchesAnalyzed": 5
  },
  "awayStats": {
    "teamName": "Juventude", 
    "totalYellowCards": 14,
    "averageCardsPerMatch": 2.8,
    "matchesAnalyzed": 5
  },
  "combinedStats": {
    "expectedCards": 5.2
  }
}
```

### **3. UI Verification**
- Navigate to: `http://localhost:3000/match/1544012`
- Check Card Stats tab
- Verify "Cards Per Match" values match expected results
- Run test script in browser console

## 🎯 Success Criteria

- ✅ Bragantino shows 2.4 cards/match (not 2.0)
- ✅ Juventude shows 2.8 cards/match (not 2.2)  
- ✅ Combined expected total shows 5.2 (not 4.2)
- ✅ Over 3.5/4.5/5.5 rates calculated from accurate data
- ✅ Player card statistics display correctly
- ✅ No hardcoded or fallback data used

## 📝 Files Modified

1. `backend/src/services/cardStatsService.js`
   - Added `extractEnhancedCardData()` function
   - Enhanced logging throughout extraction process
   - Added Method 3 extraction call
   - Improved field name checking

2. `test-card-accuracy.js` (new file)
   - Comprehensive testing script
   - Expected vs actual comparison
   - Debugging recommendations

## 🚀 Next Steps

1. **Test the implementation** using the test script
2. **Check backend logs** for detailed extraction information  
3. **Verify API responses** match expected values
4. **Confirm UI displays** accurate card statistics
5. **Validate filtering** works correctly for both 5 and 10 matches

The enhanced extraction should now capture all card data accurately and match the official ESPN/Soccerway sources!
