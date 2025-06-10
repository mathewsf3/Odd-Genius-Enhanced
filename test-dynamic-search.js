/**
 * Test client for the enhanced chat functionality
 * This script will test the chatService's dynamic match search and analysis capabilities
 */

const axios = require('axios');

class ChatServiceTest {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';
  }

  async getRecentMatchData() {
    try {
      // Get live and upcoming matches
      const [liveMatches, upcomingMatches] = await Promise.all([
        axios.get(`${this.baseUrl}/matches/live`).catch(() => ({ data: { result: [] } })),
        axios.get(`${this.baseUrl}/matches/upcoming`).catch(() => ({ data: { result: [] } }))
      ]);

      const liveData = liveMatches.data?.result || [];
      const upcomingData = upcomingMatches.data?.result || [];

      // Get next 7 days of matches
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const recentMatches = Array.isArray(upcomingData) ? upcomingData.filter((match) => {
        const matchDate = new Date(`${match.date} ${match.time}`);
        return matchDate >= now && matchDate <= nextWeek;
      }).slice(0, 20) : [];

      return {
        liveMatches: Array.isArray(liveData) ? liveData.slice(0, 10) : [],
        upcomingMatches: recentMatches,
        totalLive: Array.isArray(liveData) ? liveData.length : 0,
        totalUpcoming: recentMatches.length
      };
    } catch (error) {
      console.error('Error fetching match data:', error);
      return {
        liveMatches: [],
        upcomingMatches: [],
        totalLive: 0,
        totalUpcoming: 0
      };
    }
  }

  async findMatchDynamically(searchTerms) {
    try {
      const matchData = await this.getRecentMatchData();

      // Search in both live and upcoming matches
      const allMatches = [
        ...(Array.isArray(matchData.liveMatches) ? matchData.liveMatches : []), 
        ...(Array.isArray(matchData.upcomingMatches) ? matchData.upcomingMatches : [])
      ];
      
      if (allMatches.length === 0) {
        console.log('No matches available for dynamic search');
        return null;
      }

      // Normalize search terms
      const normalizedTerms = searchTerms.map(term => term.toLowerCase().trim());
      
      // Try exact matches first
      const exactMatch = allMatches.find((match) => {
        const homeTeam = (match.homeTeam?.name || '').toLowerCase();
        const awayTeam = (match.awayTeam?.name || '').toLowerCase();
        return (normalizedTerms.includes(homeTeam) && normalizedTerms.includes(awayTeam));
      });

      if (exactMatch) {
        console.log('Found exact match:', exactMatch.homeTeam?.name, 'vs', exactMatch.awayTeam?.name);
        return exactMatch;
      }

      // Try partial matches
      const partialMatch = allMatches.find((match) => {
        const homeTeam = (match.homeTeam?.name || '').toLowerCase();
        const awayTeam = (match.awayTeam?.name || '').toLowerCase();
        return normalizedTerms.some(term => homeTeam.includes(term)) && 
               normalizedTerms.some(term => awayTeam.includes(term));
      });

      if (partialMatch) {
        console.log('Found partial match:', partialMatch.homeTeam?.name, 'vs', partialMatch.awayTeam?.name);
        return partialMatch;
      }

      console.log('No match found for terms:', normalizedTerms);
      return null;
    } catch (error) {
      console.error('Error in findMatchDynamically:', error);
      return null;
    }
  }

  async getDetailedMatchAnalysis(matchId) {
    try {
      const [matchDetails, h2h, corners, btts, cards, analysis] = await Promise.all([
        axios.get(`${this.baseUrl}/matches/${matchId}`),
        axios.get(`${this.baseUrl}/matches/${matchId}/h2h`),
        axios.get(`${this.baseUrl}/matches/${matchId}/corners`),
        axios.get(`${this.baseUrl}/matches/${matchId}/btts`),
        axios.get(`${this.baseUrl}/matches/${matchId}/cards`),
        axios.get(`${this.baseUrl}/matches/${matchId}/analysis`)
      ]);

      return {
        matchDetails: matchDetails.data?.result || matchDetails.data,
        h2h: h2h.data?.result || h2h.data,
        corners: corners.data?.result || corners.data,
        btts: btts.data?.result || btts.data,
        cards: cards.data?.result || cards.data,
        analysis: analysis.data?.result || analysis.data
      };
    } catch (error) {
      console.error('Error getting detailed match analysis:', error);
      return null;
    }
  }
}

// Test queries to simulate user input
const TEST_QUERIES = [
  ["spain", "france"],  // UEFA Nations League Semi-final
  ["botafogo rj", "ceara"],  // Serie A match
  ["deportes tolima", "ind. medellin"],  // Primera A match
  ["america de cali", "junior"],  // Primera A match
  ["botafogo sp", "coritiba"],  // Serie B match
  ["bermuda", "cayman islands"],  // Concacaf World Cup Qualifiers
  ["grenada", "bahamas"],  // Concacaf World Cup Qualifiers
  ["saint vincent", "anguilla"],  // Concacaf World Cup Qualifiers
  ["schott mainz", "idar-oberstein"],  // Oberliga match
  ["reichenau", "kuchl"]  // Regionalliga match
];

async function runTests() {
  console.log('Testing enhanced match search and analysis functionality...\n');
  
  const chatService = new ChatServiceTest();
  
  for (const searchTerms of TEST_QUERIES) {
    console.log(`\n===== TESTING SEARCH TERMS: ${searchTerms.join(' vs ')} =====\n`);
    
    try {
      // Try to find the match
      const match = await chatService.findMatchDynamically(searchTerms);
      
      if (match) {
        console.log('Match found:');
        console.log('- Teams:', match.homeTeam?.name, 'vs', match.awayTeam?.name);
        console.log('- Date:', match.date, match.time);
        console.log('- League:', match.league?.name);
        
        if (match.id) {
          console.log('\nFetching detailed analysis...');
          const analysis = await chatService.getDetailedMatchAnalysis(match.id);
          
          if (analysis) {
            console.log('\nAnalysis data available:');
            console.log('- Match details:', analysis.matchDetails ? '✅' : '❌');
            console.log('- H2H data:', analysis.h2h ? '✅' : '❌');
            console.log('- Corners analysis:', analysis.corners ? '✅' : '❌');
            console.log('- BTTS analysis:', analysis.btts ? '✅' : '❌');
            console.log('- Cards analysis:', analysis.cards ? '✅' : '❌');
            console.log('- General analysis:', analysis.analysis ? '✅' : '❌');
          } else {
            console.log('No detailed analysis available');
          }
        }
      } else {
        console.log('No match found for these teams');
      }
      
      // Add a delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error during test:', error.message);
    }
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests if this is the main module
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { ChatServiceTest };
