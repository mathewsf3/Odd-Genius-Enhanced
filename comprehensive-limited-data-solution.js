/**
 * Comprehensive solution for handling matches with limited statistical data
 * This addresses the systemic issue affecting multiple match types
 */

class LimitedDataHandler {
  constructor() {
    this.limitedDataPatterns = {
      // League patterns that typically have limited data
      reserveLeagues: ['reserve', 'u21', 'u19', 'u18', 'youth', 'junior'],
      womensLeagues: ['women', 'female', 'ladies', 'w '],
      lowerDivisions: ['division 2', 'division 3', 'league 2', 'league 3'],
      
      // Thresholds for detecting limited data
      thresholds: {
        minExpectedCards: 1.0,
        minExpectedCorners: 4.0,
        minPlayerCount: 5,
        minH2HMatches: 1,
        minBTTSPercentage: 5
      }
    };
  }

  /**
   * Detect if a match has limited data based on API responses
   */
  detectLimitedData(matchData, bttsData, cardsData, cornersData, playersData, h2hData) {
    const indicators = {
      isLimitedData: false,
      reasons: [],
      dataQuality: 'full', // full, partial, limited, minimal
      availableData: [],
      missingData: []
    };

    // Check league type
    const leagueName = matchData?.league?.name?.toLowerCase() || '';
    const isReserveLeague = this.limitedDataPatterns.reserveLeagues.some(pattern => 
      leagueName.includes(pattern)
    );
    const isWomensLeague = this.limitedDataPatterns.womensLeagues.some(pattern => 
      leagueName.includes(pattern)
    );
    const isLowerDivision = this.limitedDataPatterns.lowerDivisions.some(pattern => 
      leagueName.includes(pattern)
    );

    if (isReserveLeague) {
      indicators.reasons.push('Reserve/Youth League');
    }
    if (isWomensLeague) {
      indicators.reasons.push('Women\'s Football');
    }
    if (isLowerDivision) {
      indicators.reasons.push('Lower Division');
    }

    // Check data quality indicators
    const cardIssues = !cardsData || cardsData.expectedCards < this.limitedDataPatterns.thresholds.minExpectedCards;
    const cornerIssues = !cornersData || cornersData.expectedCorners < this.limitedDataPatterns.thresholds.minExpectedCorners;
    const playerIssues = !playersData || 
      (playersData.homeTeamPlayers?.players?.length || 0) + (playersData.awayTeamPlayers?.players?.length || 0) < this.limitedDataPatterns.thresholds.minPlayerCount;
    const h2hIssues = !h2hData || h2hData.totalMatches < this.limitedDataPatterns.thresholds.minH2HMatches;
    const bttsIssues = !bttsData || bttsData.bttsPercentage < this.limitedDataPatterns.thresholds.minBTTSPercentage;

    // Count issues
    let issueCount = 0;
    if (cardIssues) { indicators.missingData.push('Cards'); issueCount++; }
    if (cornerIssues) { indicators.missingData.push('Corners'); issueCount++; }
    if (playerIssues) { indicators.missingData.push('Players'); issueCount++; }
    if (h2hIssues) { indicators.missingData.push('Head-to-Head'); issueCount++; }
    if (bttsIssues) { indicators.missingData.push('BTTS'); issueCount++; }

    // Determine data quality
    if (issueCount >= 4) {
      indicators.dataQuality = 'minimal';
      indicators.isLimitedData = true;
    } else if (issueCount >= 3) {
      indicators.dataQuality = 'limited';
      indicators.isLimitedData = true;
    } else if (issueCount >= 2) {
      indicators.dataQuality = 'partial';
    }

    // Identify available data
    if (!cardIssues) indicators.availableData.push('Cards');
    if (!cornerIssues) indicators.availableData.push('Corners');
    if (!playerIssues) indicators.availableData.push('Players');
    if (!h2hIssues) indicators.availableData.push('Head-to-Head');
    if (!bttsIssues) indicators.availableData.push('BTTS');

    // Always check if basic match data is available
    if (matchData?.homeTeam && matchData?.awayTeam) {
      indicators.availableData.push('Match Details');
    }

    return indicators;
  }

  /**
   * Generate realistic estimates for missing data based on league type and available data
   */
  generateEstimates(matchData, availableData, dataQuality) {
    const estimates = {
      cards: null,
      corners: null,
      btts: null,
      players: null,
      confidence: 'low' // low, medium, high
    };

    const leagueName = matchData?.league?.name?.toLowerCase() || '';
    
    // League-specific estimation parameters
    let leagueParams = {
      avgCards: 3.5,
      avgCorners: 8.5,
      bttsRate: 45,
      cardVariance: 1.5,
      cornerVariance: 2.5
    };

    // Adjust for league type
    if (this.limitedDataPatterns.reserveLeagues.some(p => leagueName.includes(p))) {
      leagueParams = {
        avgCards: 2.8, // Youth leagues typically have fewer cards
        avgCorners: 7.2,
        bttsRate: 38,
        cardVariance: 1.2,
        cornerVariance: 2.0
      };
      estimates.confidence = 'medium';
    } else if (this.limitedDataPatterns.womensLeagues.some(p => leagueName.includes(p))) {
      leagueParams = {
        avgCards: 2.5, // Women's football typically has fewer cards
        avgCorners: 7.8,
        bttsRate: 42,
        cardVariance: 1.0,
        cornerVariance: 2.2
      };
      estimates.confidence = 'medium';
    }

    // Generate card estimates
    estimates.cards = {
      expectedCards: leagueParams.avgCards,
      over25Rate: this.calculatePoissonProbability(leagueParams.avgCards, 2.5, 'over'),
      over35Rate: this.calculatePoissonProbability(leagueParams.avgCards, 3.5, 'over'),
      over45Rate: this.calculatePoissonProbability(leagueParams.avgCards, 4.5, 'over'),
      estimated: true,
      confidence: estimates.confidence
    };

    // Generate corner estimates
    estimates.corners = {
      expectedCorners: leagueParams.avgCorners,
      over85Rate: this.calculatePoissonProbability(leagueParams.avgCorners, 8.5, 'over'),
      over95Rate: this.calculatePoissonProbability(leagueParams.avgCorners, 9.5, 'over'),
      over105Rate: this.calculatePoissonProbability(leagueParams.avgCorners, 10.5, 'over'),
      estimated: true,
      confidence: estimates.confidence
    };

    // Generate BTTS estimates
    estimates.btts = {
      bttsPercentage: leagueParams.bttsRate,
      homeStats: {
        totalGoals: Math.round(leagueParams.avgCards * 0.6), // Rough estimate
        totalMatches: 10
      },
      awayStats: {
        totalGoals: Math.round(leagueParams.avgCards * 0.6),
        totalMatches: 10
      },
      estimated: true,
      confidence: estimates.confidence
    };

    // Generate basic player estimates
    estimates.players = {
      homeTeamPlayers: {
        players: this.generateEstimatedPlayers('Home Team', 11),
        estimated: true
      },
      awayTeamPlayers: {
        players: this.generateEstimatedPlayers('Away Team', 11),
        estimated: true
      },
      confidence: estimates.confidence
    };

    return estimates;
  }

  /**
   * Calculate Poisson probability for over/under betting
   */
  calculatePoissonProbability(lambda, threshold, type = 'over') {
    let probability = 0;
    
    if (type === 'over') {
      // P(X > threshold) = 1 - P(X <= threshold)
      let cumulative = 0;
      for (let k = 0; k <= Math.floor(threshold); k++) {
        cumulative += (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
      }
      probability = 1 - cumulative;
    } else {
      // P(X < threshold)
      for (let k = 0; k < Math.floor(threshold); k++) {
        probability += (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
      }
    }
    
    return Math.round(probability * 100);
  }

  /**
   * Calculate factorial for Poisson distribution
   */
  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * Generate estimated player list for display
   */
  generateEstimatedPlayers(teamName, count) {
    const positions = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW'];
    const players = [];
    
    for (let i = 0; i < count; i++) {
      players.push({
        name: `Player ${i + 1}`,
        position: positions[i] || 'MF',
        number: i + 1,
        minutes: 90,
        goals: 0,
        assists: 0,
        cards: { yellow: 0, red: 0 },
        estimated: true
      });
    }
    
    return players;
  }

  /**
   * Create enhanced response with limited data handling
   */
  createEnhancedResponse(originalData, estimates, dataIndicators) {
    return {
      ...originalData,
      dataQuality: dataIndicators.dataQuality,
      isLimitedData: dataIndicators.isLimitedData,
      limitedDataReasons: dataIndicators.reasons,
      availableData: dataIndicators.availableData,
      missingData: dataIndicators.missingData,
      estimates: estimates,
      displayMode: dataIndicators.isLimitedData ? 'limited' : 'full',
      userMessage: this.generateUserMessage(dataIndicators, estimates)
    };
  }

  /**
   * Generate user-friendly message about data limitations
   */
  generateUserMessage(dataIndicators, estimates) {
    if (!dataIndicators.isLimitedData) {
      return null;
    }

    const reasons = dataIndicators.reasons.join(', ');
    const confidence = estimates.confidence;
    
    let message = `Limited data available for this ${reasons} match. `;
    
    if (dataIndicators.availableData.length > 0) {
      message += `Available: ${dataIndicators.availableData.join(', ')}. `;
    }
    
    if (dataIndicators.missingData.length > 0) {
      message += `Estimated: ${dataIndicators.missingData.join(', ')} (${confidence} confidence). `;
    }
    
    message += 'Estimates based on league averages and historical patterns.';
    
    return message;
  }
}

// Example usage
const limitedDataHandler = new LimitedDataHandler();

// Test with our problematic matches
console.log('🔍 TESTING LIMITED DATA HANDLER');
console.log('===============================');

// Simulate match 1499505 data
const match1499505 = {
  league: { name: 'Reserve League' },
  homeTeam: { name: 'Oran U21' },
  awayTeam: { name: 'USM Alger U21' }
};

const bttsData1499505 = { bttsPercentage: 0, homeStats: { totalGoals: 12 }, awayStats: { totalGoals: 12 } };
const cardsData1499505 = { expectedCards: 0, over35Rate: 0 };
const cornersData1499505 = { expectedCorners: 0, over95Rate: 0 };
const playersData1499505 = { homeTeamPlayers: { players: [] }, awayTeamPlayers: { players: [] } };
const h2hData1499505 = { totalMatches: 0 };

const indicators1499505 = limitedDataHandler.detectLimitedData(
  match1499505, bttsData1499505, cardsData1499505, cornersData1499505, playersData1499505, h2hData1499505
);

console.log('\n📊 Match 1499505 Analysis:');
console.log(`Data Quality: ${indicators1499505.dataQuality}`);
console.log(`Limited Data: ${indicators1499505.isLimitedData}`);
console.log(`Reasons: ${indicators1499505.reasons.join(', ')}`);
console.log(`Available: ${indicators1499505.availableData.join(', ')}`);
console.log(`Missing: ${indicators1499505.missingData.join(', ')}`);

if (indicators1499505.isLimitedData) {
  const estimates1499505 = limitedDataHandler.generateEstimates(match1499505, indicators1499505.availableData, indicators1499505.dataQuality);
  console.log('\n📈 Generated Estimates:');
  console.log(`Cards: ${estimates1499505.cards.expectedCards} expected`);
  console.log(`Corners: ${estimates1499505.corners.expectedCorners} expected`);
  console.log(`BTTS: ${estimates1499505.btts.bttsPercentage}%`);
  console.log(`Confidence: ${estimates1499505.confidence}`);
  
  const enhancedResponse = limitedDataHandler.createEnhancedResponse(
    { original: 'data' }, estimates1499505, indicators1499505
  );
  console.log('\n💬 User Message:');
  console.log(enhancedResponse.userMessage);
}

module.exports = LimitedDataHandler;
