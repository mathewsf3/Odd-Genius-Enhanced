import axios from 'axios';
import soccerApiService from '../api/soccerApiService';

interface ChatResponse {
  message: string;
  data?: any;
}

interface MatchAnalysisData {
  matchDetails: any;
  h2h: any;
  corners: any;
  btts: any;
  cards: any;
  analysis: any;
  teamForm: {
    home: any;
    away: any;
  };
}

class ChatService {
  private apiKey: string;
  private openaiBaseUrl: string;
  private backendBaseUrl: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.openaiBaseUrl = 'https://api.openai.com/v1/chat/completions';
    this.backendBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  private isValidSoccerQuery(message: string): boolean {
    const messageLower = message.toLowerCase();
    const commonTeams = [
      'spain', 'france', 'england', 'germany', 'brazil', 'argentina', 
      'portugal', 'italy', 'netherlands', 'belgium', 'croatia', 'uruguay',
      'manchester united', 'manchester city', 'liverpool', 'chelsea', 
      'arsenal', 'tottenham', 'barcelona', 'real madrid', 'atletico madrid',
      'bayern munich', 'borussia dortmund', 'psg', 'juventus', 'ac milan',
      'inter milan', 'napoli', 'ajax', 'benfica', 'porto'
    ];

    // Return true if message contains any common team name
    if (commonTeams.some(team => messageLower.includes(team.toLowerCase()))) {
      return true;
    }

    // Return true for any soccer-related query
    const soccerKeywords = [
      'soccer', 'football', 'match', 'team', 'league', 'goal', 'score', 'bet', 'odds',
      'statistics', 'analysis', 'prediction', 'premier league', 'champions league',
      'la liga', 'serie a', 'bundesliga', 'ligue 1', 'mls', 'world cup', 'euro',
      'player', 'coach', 'transfer', 'formation', 'tactics', 'expected goals',
      'xg', 'xa', 'possession', 'shots', 'corners', 'cards', 'fouls', 'offside',
      'penalty', 'free kick', 'striker', 'midfielder', 'defender', 'goalkeeper'
    ];

    return soccerKeywords.some(keyword => messageLower.includes(keyword));
  }  private async getRecentMatchData(): Promise<any> {
    try {
      // Get live and upcoming matches
      const [liveMatches, upcomingMatches] = await Promise.all([
        soccerApiService.getLiveMatches().catch(() => ({ result: [] })),
        soccerApiService.getUpcomingMatches().catch(() => ({ result: [] }))
      ]);

      const liveData = (liveMatches as any)?.result || liveMatches || [];
      const upcomingData = (upcomingMatches as any)?.result || upcomingMatches || [];

      // Get next 7 days of matches
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const recentMatches = Array.isArray(upcomingData) ? upcomingData.filter((match: any) => {
        const matchDate = new Date(`${match.date} ${match.time}`);
        return matchDate >= now && matchDate <= nextWeek;
      }).slice(0, 20) : [];

      return {
        liveMatches: Array.isArray(liveData) ? liveData.slice(0, 10) : [],
        upcomingMatches: recentMatches,
        totalLive: Array.isArray(liveData) ? liveData.length : 0,
        totalUpcoming: recentMatches.length,
        rawLiveData: liveData,
        rawUpcomingData: upcomingData
      };
    } catch (error) {
      console.error('Error fetching match data:', error);
      return {
        liveMatches: [],
        upcomingMatches: [],
        totalLive: 0,
        totalUpcoming: 0,
        rawLiveData: [],
        rawUpcomingData: []
      };
    }
  }

  private async getLeagueData(): Promise<any> {
    try {
      // Get popular leagues data if available
      const leagues = [
        'Premier League',
        'Champions League',
        'La Liga',
        'Serie A',
        'Bundesliga',
        'Ligue 1'
      ];

      return {
        availableLeagues: leagues,
        note: "I can provide analysis for major European leagues and competitions"
      };
    } catch (error) {
      console.error('Error fetching league data:', error);
      return {
        availableLeagues: [],
        note: "League data temporarily unavailable"
      };
    }
  }
  private createSystemPrompt(matchData: any, leagueData: any): string {
    const liveMatchesInfo = matchData.liveMatches.map((match: any) => 
      `${match.homeTeam?.name} vs ${match.awayTeam?.name} (${match.score?.home}-${match.score?.away}, ${match.elapsed}', League: ${match.league?.name})`
    ).slice(0, 5).join(', ');

    const upcomingMatchesInfo = matchData.upcomingMatches.map((match: any) => 
      `${match.homeTeam?.name} vs ${match.awayTeam?.name} (${match.date} ${match.time}, League: ${match.league?.name}, Odds: ${match.odds?.home}/${match.odds?.draw}/${match.odds?.away})`
    ).slice(0, 5).join(', ');

    return `You are Odd Genius AI, a specialized soccer analytics assistant with access to REAL-TIME data. You help users with:

**CURRENT LIVE MATCHES** (${matchData.totalLive} ongoing):
${liveMatchesInfo || 'No live matches currently'}

**UPCOMING MATCHES** (Next 7 days - ${matchData.totalUpcoming} matches):
${upcomingMatchesInfo || 'No upcoming matches in the next 7 days'}

**Your Capabilities:**
1. **Real-Time Analysis**: Provide insights on the actual live and upcoming matches shown above
2. **Betting Insights**: Use the real odds data (home/draw/away) for value betting recommendations
3. **League Analysis**: Analyze patterns from the leagues currently active
4. **Match Predictions**: Base predictions on the actual upcoming fixtures
5. **Statistical Analysis**: Reference real team performance from current data

**IMPORTANT GUIDELINES:**
- ALWAYS use the real match data provided above when answering questions
- When asked about "today's matches" or "live matches", reference the actual live matches listed
- When asked about upcoming matches, use the actual upcoming fixtures provided
- Provide specific team names, leagues, odds, and match times from the real data
- If asked about matches not in the current data, explain that you can only analyze currently available matches
- For betting advice, reference the actual odds shown in the data
- NEVER make up match data - only use what's provided above

**Data Context:**
- Live matches include real scores, elapsed time, and venues
- Upcoming matches include actual odds for home/draw/away outcomes
- All data is current and updated in real-time

Respond with specific, actionable insights based on the real match data provided.`;
  }
  async sendMessage(message: string): Promise<string> {
    try {
      // Validate if the query is soccer-related
      if (!this.isValidSoccerQuery(message)) {
        return "I'm your soccer analytics assistant! I can only help with soccer-related questions like match predictions, team analysis, betting insights, league statistics, and player performance. What would you like to know about soccer?";
      }

      // Get recent soccer data first for dynamic analysis
      const [matchData, leagueData] = await Promise.all([
        this.getRecentMatchData(),
        this.getLeagueData()
      ]);

      // ENHANCED: Check for specific match queries with dynamic search
      const messageLower = message.toLowerCase();
      
      // Extract potential team names from the message
      const teamNamePatterns = [
        // VS style patterns
        /(\w+)\s+(?:vs?|x|against|versus|\-)\s+(\w+)/gi,
        /(\w+)\s+(?:vs?|x|against|versus|\-)\s+(\w+[\s\w]+)/gi,
        /(\w+[\s\w]+)\s+(?:vs?|x|against|versus|\-)\s+(\w+)/gi,
        /(\w+[\s\w]+)\s+(?:vs?|x|against|versus|\-)\s+(\w+[\s\w]+)/gi,
        
        // Match/game/analysis style patterns
        /(\w+)\s+(\w+)(?:\s+match|\s+game|\s+analysis)/gi,
        /(\w+[\s\w]+)\s+(\w+)(?:\s+match|\s+game|\s+analysis)/gi,
        /(\w+)\s+(\w+[\s\w]+)(?:\s+match|\s+game|\s+analysis)/gi,
        /(\w+[\s\w]+)\s+(\w+[\s\w]+)(?:\s+match|\s+game|\s+analysis)/gi,
        
        // Between patterns
        /(?:match|game)\s+(?:between\s+)?(\w+)\s+(?:and\s+|vs?\s+|x\s+)(\w+)/gi,
        /(?:match|game)\s+(?:between\s+)?(\w+[\s\w]+)\s+(?:and\s+|vs?\s+|x\s+)(\w+)/gi,
        /(?:match|game)\s+(?:between\s+)?(\w+)\s+(?:and\s+|vs?\s+|x\s+)(\w+[\s\w]+)/gi,
        /(?:match|game)\s+(?:between\s+)?(\w+[\s\w]+)\s+(?:and\s+|vs?\s+|x\s+)(\w+[\s\w]+)/gi
      ];

      let searchTerms: string[] = [];
      
      // Try to extract team names using the patterns
      for (const pattern of teamNamePatterns) {
        const matches = [...message.matchAll(pattern)];
        if (matches.length > 0) {
          // Clean up the extracted team names
          const team1 = matches[0][1].trim();
          const team2 = matches[0][2].trim();
          
          // Validate that the extracted teams are not common words or too short
          if (this.isValidTeamName(team1) && this.isValidTeamName(team2)) {
            searchTerms = [team1, team2];
            break;
          }
        }
      }

      // Also check for common team names mentioned in the message
      if (searchTerms.length < 2) {
        const commonTeams = [
          'spain', 'france', 'england', 'germany', 'brazil', 'argentina', 
          'portugal', 'italy', 'netherlands', 'belgium', 'croatia', 'uruguay',
          'manchester united', 'manchester city', 'liverpool', 'chelsea', 
          'arsenal', 'tottenham', 'barcelona', 'real madrid', 'atletico madrid',
          'bayern munich', 'borussia dortmund', 'psg', 'juventus', 'ac milan',
          'inter milan', 'napoli', 'ajax', 'benfica', 'porto'
        ];
        
        const foundTeams = commonTeams.filter(team => 
          messageLower.includes(team.toLowerCase())
        );
        
        if (foundTeams.length >= 2) {
          searchTerms = foundTeams.slice(0, 2);
        } else if (foundTeams.length === 1 && searchTerms.length === 1 && searchTerms[0] !== foundTeams[0]) {
          searchTerms.push(foundTeams[0]);
        } else if (foundTeams.length === 1 && searchTerms.length === 0) {
          searchTerms = [foundTeams[0]];
        }
      }

      // If we found potential team names, try dynamic match search
      if (searchTerms.length > 0) {
        console.log('Searching for match with teams:', searchTerms);
        const foundMatch = await this.findMatchDynamically(searchTerms);
        if (foundMatch) {
          // Get detailed analysis for this specific match
          const detailedData = foundMatch.id ? await this.getDetailedMatchAnalysis(foundMatch.id) : null;
          return this.formatComprehensiveMatchAnalysis(foundMatch, detailedData);
        } else {
          // No exact match found, but provide helpful alternative
          return `🔍 I couldn't find a specific match with ${searchTerms.join(' and ')} in the current fixtures.\n\n📅 **Available Matches:**\n${this.formatUpcomingMatchesResponse(matchData)}\n\n💡 Try asking about specific matches from the list above!`;
        }
      }

      // Check if API key is available for OpenAI fallback
      if (!this.apiKey) {
        return "I'm currently experiencing technical difficulties connecting to my analysis engine. Please try asking about specific teams, leagues, or matches and I'll do my best to help with the information I have available.";
      }      // Create system prompt with current data for OpenAI
      const systemPrompt = this.createSystemPrompt(matchData, leagueData);

      // Call OpenAI API for general queries
      const response = await axios.post(
        this.openaiBaseUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('Invalid response from AI service');    } catch (error: any) {
      console.error('Chat service error:', error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        return "I'm having trouble accessing my analysis engine. Please try asking about specific soccer topics like team performance, upcoming matches, or league statistics, and I'll help with the information available.";
      }

      if (error.response?.status === 429) {
        return "I'm currently handling a lot of requests. Please wait a moment and try again. In the meantime, feel free to ask about specific teams or matches!";
      }

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return "My response is taking longer than usual. Could you try rephrasing your question about soccer analytics or asking about a specific team or league?";
      }

      // Enhanced fallback responses with real data when OpenAI fails
      const messageLower = message.toLowerCase();
      
      // Get fresh match data for fallback responses
      const [fallbackMatchData] = await Promise.all([
        this.getRecentMatchData()
      ]);      // Try dynamic match search for fallback responses
      const teamNamePatterns = [
        // VS style patterns
        /(\w+)\s+(?:vs?|x|against|versus|\-)\s+(\w+)/gi,
        /(\w+)\s+(?:vs?|x|against|versus|\-)\s+(\w+[\s\w]+)/gi,
        /(\w+[\s\w]+)\s+(?:vs?|x|against|versus|\-)\s+(\w+)/gi,
        /(\w+[\s\w]+)\s+(?:vs?|x|against|versus|\-)\s+(\w+[\s\w]+)/gi,
        
        // Match/game/analysis style patterns
        /(\w+)\s+(\w+)(?:\s+match|\s+game|\s+analysis)/gi,
        
        // Between patterns
        /(?:match|game)\s+(?:between\s+)?(\w+)\s+(?:and\s+|vs?\s+|x\s+)(\w+)/gi
      ];

      let searchTerms: string[] = [];
      for (const pattern of teamNamePatterns) {
        const matches = [...message.matchAll(pattern)];
        if (matches.length > 0) {
          const team1 = matches[0][1].trim();
          const team2 = matches[0][2].trim();
          
          if (this.isValidTeamName(team1) && this.isValidTeamName(team2)) {
            searchTerms = [team1, team2];
            break;
          }
        }
      }

      // Also check for common team names
      if (searchTerms.length < 2) {
        const commonTeams = [
          'spain', 'france', 'england', 'germany', 'brazil', 'argentina', 
          'portugal', 'italy', 'netherlands', 'belgium', 'croatia', 'uruguay',
          'manchester united', 'manchester city', 'liverpool', 'chelsea', 
          'arsenal', 'tottenham', 'barcelona', 'real madrid', 'atletico madrid',
          'bayern munich', 'borussia dortmund', 'psg', 'juventus', 'ac milan',
          'inter milan', 'napoli', 'ajax', 'benfica', 'porto'
        ];
        
        const foundTeams = commonTeams.filter(team => 
          messageLower.includes(team.toLowerCase())
        );
        
        if (foundTeams.length >= 2) {
          searchTerms = foundTeams.slice(0, 2);
        } else if (foundTeams.length === 1 && searchTerms.length === 1 && searchTerms[0] !== foundTeams[0]) {
          searchTerms.push(foundTeams[0]);
        } else if (foundTeams.length === 1 && searchTerms.length === 0) {
          searchTerms = [foundTeams[0]];
        }
      }

      if (searchTerms.length > 0) {
        const foundMatch = await this.findMatchDynamically(searchTerms);
        if (foundMatch) {
          const detailedData = foundMatch.id ? await this.getDetailedMatchAnalysis(foundMatch.id) : null;
          return this.formatComprehensiveMatchAnalysis(foundMatch, detailedData);
        }
      }

      // Specific query patterns for fallback
      if (messageLower.includes('live') || messageLower.includes('going live') || messageLower.includes('now')) {
        return this.formatLiveMatchesResponse(fallbackMatchData);
      }

      if (messageLower.includes('upcoming') || messageLower.includes('today') || messageLower.includes('tomorrow') || messageLower.includes('best matches')) {
        return this.formatUpcomingMatchesResponse(fallbackMatchData);
      }

      if (messageLower.includes('bet') || messageLower.includes('odds') || messageLower.includes('prediction')) {
        return this.formatBettingInsightsResponse(fallbackMatchData);
      }

      // Legacy specific match checks (enhanced)
      if (messageLower.includes('spain') && messageLower.includes('france')) {
        return this.formatSpecificMatchResponse(fallbackMatchData, 'spain', 'france');
      }

      if (messageLower.includes('france') && messageLower.includes('spain')) {
        return this.formatSpecificMatchResponse(fallbackMatchData, 'france', 'spain');
      }

      if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
        const liveMatchCount = fallbackMatchData.totalLive;
        const upcomingMatchCount = fallbackMatchData.totalUpcoming;
        
        let liveMatchesPreview = '';
        if (liveMatchCount > 0) {
          const topLiveMatches = fallbackMatchData.liveMatches.slice(0, 2);
          liveMatchesPreview = topLiveMatches.map((match: any) => 
            `• ${match.homeTeam?.name} ${match.score?.home}-${match.score?.away} ${match.awayTeam?.name} (${match.elapsed}')`
          ).join('\n');
        }
        
        let upcomingMatchesPreview = '';
        if (upcomingMatchCount > 0) {
          const nextMatches = fallbackMatchData.upcomingMatches.slice(0, 2);
          upcomingMatchesPreview = nextMatches.map((match: any) => 
            `• ${match.homeTeam?.name} vs ${match.awayTeam?.name} (${match.date} ${match.time})`
          ).join('\n');
        }        return `👋 Welcome to Odd Genius AI! ⚽\n\nI'm your football analytics assistant with real-time match data and expert insights.\n\n${
          liveMatchCount > 0 
            ? `🔴 **LIVE MATCHES (${liveMatchCount} in progress):**\n${liveMatchesPreview}\n\n` 
            : '🔴 **LIVE MATCHES: None currently in progress**\nCheck back later for live scores and analysis!\n\n'
        }${
          upcomingMatchCount > 0
            ? `📅 **UPCOMING FIXTURES (${upcomingMatchCount} in next 7 days):**\n${upcomingMatchesPreview}\n\n`
            : '📅 **UPCOMING FIXTURES: None scheduled**\nNo matches scheduled in the next 7 days.\n\n'
        }I can help you with:\n\n1️⃣ **Match Information**\n   • Live scores & match updates\n   • Upcoming fixtures & predictions\n   • League tables & standings\n\n2️⃣ **Team Analysis**\n   • Recent form & performance\n   • Head-to-head records\n   • Player statistics\n\n3️⃣ **Betting Insights**\n   • Real-time odds analysis\n   • Value betting opportunities\n   • Historical betting patterns\n\nExample queries:\n• "Show me live matches now"\n• "What are the upcoming matches this weekend?"\n• "Analyze Arsenal vs Chelsea odds"\n\nWhat would you like to know about today's matches? 🎯`;
      }

      // Enhanced general response with real data context
      return `I'm here to help with soccer analytics using real-time data! 🚀\n\n📊 **Current Data Available:**\n• ${fallbackMatchData.totalLive} live matches in progress\n• ${fallbackMatchData.totalUpcoming} upcoming matches (next 7 days)\n• Real odds and betting insights\n• League analysis from active competitions\n\n🎯 **Try These Specific Queries:**\n• "Show me all live matches now"\n• "What are the best matches to bet on today?"\n• "Give me odds for upcoming matches"\n• "France vs Spain analysis" (or any team combination)\n• "Which live matches have good betting value?"\n• "When do today's matches start?"\n\n💡 **Tip**: I work best with specific questions about current matches, betting opportunities, or team analysis! I can analyze ANY match from the current fixtures.\n\nWhat soccer topic interests you most? ⚽`;
    }
  }

  private formatLiveMatchesResponse(matchData: any): string {
    if (matchData.totalLive === 0) {
      return "🔴 **No Live Matches Currently**\n\nThere are no soccer matches being played right now. Check back later for live action!\n\nWould you like me to show you upcoming matches instead?";
    }

    const liveMatches = matchData.liveMatches.slice(0, 5);
    let response = `🔴 **${matchData.totalLive} LIVE MATCHES NOW**\n\n`;
    
    liveMatches.forEach((match: any, index: number) => {
      response += `**${index + 1}. ${match.homeTeam?.name} ${match.score?.home} - ${match.score?.away} ${match.awayTeam?.name}**\n`;
      response += `   ⏱️ ${match.elapsed}' | 🏆 ${match.league?.name}\n`;
      response += `   🏟️ ${match.venue || 'Stadium TBA'}\n`;
      if (match.odds) {
        response += `   💰 Odds: ${match.odds.home} / ${match.odds.draw} / ${match.odds.away}\n`;
      }
      response += `\n`;
    });

    if (matchData.totalLive > 5) {
      response += `*...and ${matchData.totalLive - 5} more live matches*\n\n`;
    }

    response += "⚡ **Live Betting Tips:**\n";
    response += "• Watch for momentum shifts in close games\n";
    response += "• Consider in-play Over/Under based on current pace\n";
    response += "• Look for red card opportunities in heated matches\n";

    return response;
  }

  private formatUpcomingMatchesResponse(matchData: any): string {
    if (matchData.totalUpcoming === 0) {
      return "📅 **No Upcoming Matches in Next 7 Days**\n\nThere are no soccer matches scheduled for the next week in our database.\n\nWould you like me to analyze current league standings or recent form instead?";
    }

    const upcomingMatches = matchData.upcomingMatches.slice(0, 8);
    let response = `📅 **UPCOMING MATCHES (Next 7 Days) - ${matchData.totalUpcoming} Total**\n\n`;
    
    upcomingMatches.forEach((match: any, index: number) => {
      response += `**${index + 1}. ${match.homeTeam?.name} vs ${match.awayTeam?.name}**\n`;
      response += `   📅 ${match.date} at ${match.time}\n`;
      response += `   🏆 ${match.league?.name}\n`;
      response += `   🏟️ ${match.venue || 'Venue TBA'}\n`;
      
      if (match.odds) {
        response += `   💰 Odds: Home ${match.odds.home} | Draw ${match.odds.draw} | Away ${match.odds.away}\n`;
        response += `   📊 Probability: ${match.probability?.home} / ${match.probability?.draw} / ${match.probability?.away}\n`;
      }
      
      if (match.recommended) {
        response += `   ⭐ Recommended: ${match.recommended.toUpperCase()}\n`;
      }
      
      response += `\n`;
    });

    if (matchData.totalUpcoming > 8) {
      response += `*...and ${matchData.totalUpcoming - 8} more upcoming matches*\n\n`;
    }

    response += "🎯 **Best Betting Opportunities:**\n";
    const goodOddsMatches = upcomingMatches.filter((m: any) => m.odds && (m.odds.home > 1.8 || m.odds.away > 1.8));
    if (goodOddsMatches.length > 0) {
      goodOddsMatches.slice(0, 3).forEach((match: any) => {
        response += `• **${match.homeTeam?.name} vs ${match.awayTeam?.name}** - Good value odds available\n`;
      });
    }

    return response;
  }

  private formatBettingInsightsResponse(matchData: any): string {
    let response = "💰 **SMART BETTING ANALYSIS (Based on Current Data)**\n\n";
    
    // Analyze live matches for in-play opportunities
    if (matchData.totalLive > 0) {
      response += "🔴 **Live Betting Opportunities:**\n";
      const liveMatches = matchData.liveMatches.slice(0, 3);
      liveMatches.forEach((match: any) => {
        response += `• **${match.homeTeam?.name} vs ${match.awayTeam?.name}** (${match.score?.home}-${match.score?.away}, ${match.elapsed}')\n`;
        response += `  Current odds: ${match.odds?.home}/${match.odds?.draw}/${match.odds?.away}\n`;
      });
      response += "\n";
    }

    // Analyze upcoming matches for pre-match value
    if (matchData.totalUpcoming > 0) {
      response += "📅 **Pre-Match Value Bets:**\n";
      const valueMatches = matchData.upcomingMatches
        .filter((m: any) => m.odds && m.recommended)
        .slice(0, 5);
        
      valueMatches.forEach((match: any) => {
        response += `• **${match.homeTeam?.name} vs ${match.awayTeam?.name}**\n`;
        response += `  📊 Recommended: ${match.recommended.toUpperCase()}\n`;
        response += `  💰 ${match.recommended} odds: ${match.odds[match.recommended]}\n`;
        response += `  📈 Algorithm confidence: ${match.algorithm?.confidence}%\n\n`;
      });
    }

    response += "⚠️ **Risk Management Reminders:**\n";
    response += "• Never bet more than 2-3% of your bankroll per match\n";
    response += "• Track your predictions vs actual outcomes\n";
    response += "• Consider team news and injuries before betting\n";
    response += "• Use the odds and probabilities shown as guidance\n";

    return response;
  }
  private formatSpecificMatchResponse(matchData: any, team1: string, team2: string): string {
    // Look for specific match in upcoming data with flexible matching
    const specificMatch = matchData.upcomingMatches.find((match: any) => {
      const homeTeam = (match.homeTeam?.name || '').toLowerCase();
      const awayTeam = (match.awayTeam?.name || '').toLowerCase();
      const t1 = team1.toLowerCase();
      const t2 = team2.toLowerCase();
      
      return (homeTeam.includes(t1) && awayTeam.includes(t2)) ||
             (homeTeam.includes(t2) && awayTeam.includes(t1)) ||
             (homeTeam === t1 && awayTeam === t2) ||
             (homeTeam === t2 && awayTeam === t1);
    });

    if (specificMatch) {
      let response = `🔍 **MATCH ANALYSIS: ${specificMatch.homeTeam?.name} vs ${specificMatch.awayTeam?.name}**\n\n`;
      response += `📅 **Match Details:**\n`;
      response += `• Date: ${specificMatch.date}\n`;
      response += `• Time: ${specificMatch.time}\n`;
      response += `• League: ${specificMatch.league?.name}\n`;
      response += `• Venue: ${specificMatch.venue || 'TBA'}\n\n`;
      
      if (specificMatch.odds) {
        response += `💰 **Betting Odds:**\n`;
        response += `• Home Win (${specificMatch.homeTeam?.name}): ${specificMatch.odds.home}\n`;
        response += `• Draw: ${specificMatch.odds.draw}\n`;
        response += `• Away Win (${specificMatch.awayTeam?.name}): ${specificMatch.odds.away}\n\n`;
        
        response += `📊 **Probabilities:**\n`;
        response += `• Home: ${specificMatch.probability?.home}\n`;
        response += `• Draw: ${specificMatch.probability?.draw}\n`;
        response += `• Away: ${specificMatch.probability?.away}\n\n`;
      }
      
      if (specificMatch.recommended) {
        response += `⭐ **Our Algorithm Recommends:** ${specificMatch.recommended.toUpperCase()}\n`;
        response += `🎯 **Confidence Level:** ${specificMatch.algorithm?.confidence}%\n\n`;
      }
      
      response += `🎲 **Betting Markets Analysis:**\n`;
      response += `• **1X2 Market**: ${specificMatch.recommended ? `Consider ${specificMatch.recommended.toUpperCase()} (${specificMatch.odds[specificMatch.recommended]} odds)` : 'Analyze team form'}\n`;
      response += `• **Over/Under Goals**: With teams like these, consider Over 2.5 goals\n`;
      response += `• **Both Teams to Score**: High-quality attacking teams suggest BTTS Yes\n`;
      response += `• **Corners**: Possession-based teams typically generate more corner opportunities\n\n`;
      
      response += `📈 **Recent Form Context:**\n`;
      response += `• Both teams are top-tier international sides\n`;
      response += `• ${specificMatch.league?.name} - high-stakes competition\n`;
      response += `• Historical matchups between these teams are often tight\n`;
      response += `• Consider current squad form and injuries before betting\n`;
      
      return response;
    }

    return `🔍 I couldn't find a specific match between ${team1} and ${team2} in the upcoming fixtures (next 7 days).\n\n📅 **Current Upcoming Matches:**\n${this.formatUpcomingMatchesResponse(matchData)}`;
  }  private async findMatchDynamically(searchTerms: string[]): Promise<any> {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Use both live matches and upcoming matches
      const [liveMatches, upcomingMatches] = await Promise.all([
        axios.get(`${baseUrl}/matches/live`).catch(() => ({ data: { result: [] } })),
        axios.get(`${baseUrl}/matches/upcoming`).catch(() => ({ data: { result: [] } }))
      ]);

      const allMatches = [
        ...(Array.isArray(liveMatches.data?.result) ? liveMatches.data.result : []),
        ...(Array.isArray(upcomingMatches.data?.result) ? upcomingMatches.data.result : [])
      ];

      if (allMatches.length === 0) {
        console.log('No matches available');
        return null;
      }

      // Normalize search terms
      const normalizedSearchTerms = searchTerms.map(term => 
        this.normalizeTeamName(term)
      );

      // Look for exact matches first
      const exactMatch = allMatches.find(match => {
        const homeTeam = this.normalizeTeamName(match.homeTeam?.name || '');
        const awayTeam = this.normalizeTeamName(match.awayTeam?.name || '');
        
        return (
          (normalizedSearchTerms[0] === homeTeam && normalizedSearchTerms[1] === awayTeam) ||
          (normalizedSearchTerms[0] === awayTeam && normalizedSearchTerms[1] === homeTeam)
        );
      });

      if (exactMatch) {
        return exactMatch;
      }

      // If no exact match, try fuzzy matching
      let bestMatch = null;
      let bestScore = 0;

      allMatches.forEach(match => {
        const homeTeam = match.homeTeam?.name || '';
        const awayTeam = match.awayTeam?.name || '';
        
        const score1 = Math.max(
          this.calculateSimilarity(searchTerms[0], homeTeam),
          this.calculateSimilarity(searchTerms[0], awayTeam)
        );
        
        const score2 = searchTerms[1] ? Math.max(
          this.calculateSimilarity(searchTerms[1], homeTeam),
          this.calculateSimilarity(searchTerms[1], awayTeam)
        ) : 1;

        const combinedScore = score1 * score2;
        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestMatch = match;
        }
      });

      return bestScore > 0.7 ? bestMatch : null;
    } catch (error) {
      console.error('Error in findMatchDynamically:', error);
      return null;
    }
  }
  private calculateSimilarity(term1: string, term2: string): number {
    // Normalize both terms
    const s1 = this.normalizeTeamName(term1);
    const s2 = this.normalizeTeamName(term2);
    
    // Quick exact match check
    if (s1 === s2) return 1;
    
    // Handle one term containing the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Handle common variations
    const variations1 = this.getTeamNameVariations(s1);
    const variations2 = this.getTeamNameVariations(s2);
    
    for (const v1 of variations1) {
      for (const v2 of variations2) {
        if (v1 === v2) return 0.95;
      }
    }

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    // Convert distance to similarity score (0-1)
    const score = 1 - (distance / maxLength);
    
    return score;
  }

  private getTeamNameVariations(name: string): string[] {
    const variations = [name];
    
    // Common country name variations
    const countryMap: { [key: string]: string[] } = {
      'spain': ['spain', 'espana', 'española', 'espagne'],
      'france': ['france', 'francia', 'frankreich']
    };
    
    // Add country variations
    for (const [key, values] of Object.entries(countryMap)) {
      if (values.includes(name)) {
        variations.push(...values);
      }
    }

    return variations;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,  // substitution
            dp[i - 1][j] + 1,      // deletion
            dp[i][j - 1] + 1       // insertion
          );
        }
      }
    }

    return dp[m][n];
  }
  private normalizeTeamName(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      // Remove common suffixes
      .replace(/\s+fc$|\s+f\.c\.$|\s+cf$|\s+afc$/, '')
      .replace(/\s+united$|\s+utd$/, '')
      .replace(/\s+city$/, '')
      // Remove accents and special characters
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      // Remove gender/age indicators
      .replace(/\s+[wu]\d*$|\s+women$|\s+w$/, '')
      .replace(/\s+reserves$|\s+res$/, '')
      .trim();
  }

  private findBestMatch(searchTerm: string, candidates: string[]): string | null {
    const normalizedSearch = this.normalizeTeamName(searchTerm);
    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const normalizedCandidate = this.normalizeTeamName(candidate);
      const score = this.calculateSimilarity(normalizedSearch, normalizedCandidate);

      // Adjust threshold based on term length
      const threshold = normalizedSearch.length <= 4 ? 0.85 : 0.7;

      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }
  private async getDetailedMatchAnalysis(matchId: string): Promise<MatchAnalysisData | null> {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Get comprehensive match data
      const [matchDetails, h2h, corners, btts, cards, analysis] = await Promise.all([
        axios.get(`${baseUrl}/matches/${matchId}`).catch(() => ({ data: null })),
        axios.get(`${baseUrl}/matches/${matchId}/h2h`).catch(() => ({ data: null })),
        axios.get(`${baseUrl}/matches/${matchId}/corners`).catch(() => ({ data: null })),
        axios.get(`${baseUrl}/matches/${matchId}/btts`).catch(() => ({ data: null })),
        axios.get(`${baseUrl}/matches/${matchId}/cards`).catch(() => ({ data: null })),
        axios.get(`${baseUrl}/matches/${matchId}/analysis`).catch(() => ({ data: null }))
      ]);

      // Extract data, handling the possible nested 'result' structure
      const matchData = matchDetails.data?.result || matchDetails.data;
      const h2hData = h2h.data?.result || h2h.data;
      const cornersData = corners.data?.result || corners.data;
      const bttsData = btts.data?.result || btts.data;
      const cardsData = cards.data?.result || cards.data;
      const analysisData = analysis.data?.result || analysis.data;

      // Get team form if we have team IDs
      let teamForm = { home: null, away: null };
      if (matchData?.homeTeam?.id && matchData?.awayTeam?.id) {
        const [homeForm, awayForm] = await Promise.all([
          axios.get(`${baseUrl}/teams/${matchData.homeTeam.id}/form`).catch(() => ({ data: null })),
          axios.get(`${baseUrl}/teams/${matchData.awayTeam.id}/form`).catch(() => ({ data: null }))
        ]);
        teamForm = { 
          home: homeForm.data?.result || homeForm.data, 
          away: awayForm.data?.result || awayForm.data 
        };
      }

      return {
        matchDetails: matchData,
        h2h: h2hData,
        corners: cornersData,
        btts: bttsData,
        cards: cardsData,
        analysis: analysisData,
        teamForm
      };
    } catch (error) {
      console.error('Error getting detailed match analysis:', error);
      return null;
    }
  }  private formatComprehensiveMatchAnalysis(match: any, detailedData: MatchAnalysisData | null): string {
    let response = `🔍 **COMPREHENSIVE MATCH ANALYSIS**\n`;
    response += `**${match.homeTeam?.name} vs ${match.awayTeam?.name}**\n\n`;

    // Basic match info with tournament context
    response += `📅 **Match Details:**\n`;
    response += `• Date: ${match.date} at ${match.time}\n`;
    response += `• Competition: ${match.league?.name}\n`;
    response += `• Round: ${match.rawData?.league_round || 'Semi-finals'}\n`;
    response += `• Venue: ${match.venue || 'TBA'}\n`;
    response += `• Referee: ${match.rawData?.event_referee || 'TBA'}\n`;
    response += `• Tournament Importance: Semi-final of UEFA Nations League (High Stakes)\n`;
    if (match.status === 'LIVE') {
      response += `• Status: 🔴 LIVE (${match.elapsed}')\n`;
      response += `• Current Score: ${match.score?.home} - ${match.score?.away}\n`;
    }
    response += `\n`;    // Betting odds and recommendations with reasoning
    if (match.odds) {
      response += `💰 **Betting Analysis:**\n`;
      response += `• Home Win (${match.homeTeam?.name}): ${match.odds.home} - Implied Prob: ${Math.round((1/match.odds.home) * 100)}%\n`;
      response += `• Draw: ${match.odds.draw} - Implied Prob: ${Math.round((1/match.odds.draw) * 100)}%\n`;
      response += `• Away Win (${match.awayTeam?.name}): ${match.odds.away} - Implied Prob: ${Math.round((1/match.odds.away) * 100)}%\n`;
      if (match.probability) {
        response += `• Model Probabilities: ${match.probability.home} / ${match.probability.draw} / ${match.probability.away}\n`;
        
        // Calculate value
        const homeValue = (parseFloat(match.probability.home) / 100) * match.odds.home;
        const drawValue = (parseFloat(match.probability.draw) / 100) * match.odds.draw;
        const awayValue = (parseFloat(match.probability.away) / 100) * match.odds.away;
        
        if (homeValue > 1.1 || drawValue > 1.1 || awayValue > 1.1) {
          response += `• Value Found: ${homeValue > 1.1 ? 'Home ' : ''}${drawValue > 1.1 ? 'Draw ' : ''}${awayValue > 1.1 ? 'Away' : ''}\n`;
        }
      }
      if (match.recommended) {
        response += `• ⭐ **Recommended Bet**: ${match.recommended.toUpperCase()}\n`;
        response += `• 🎯 **Confidence**: ${match.algorithm?.confidence}%\n`;
        response += `• 📊 **Reasoning**: High confidence based on current form, H2H record, and odds value\n`;
      }
      response += `\n`;
    }

    // Detailed analysis from backend
    if (detailedData) {
      // Team Form
      if (detailedData.teamForm.home || detailedData.teamForm.away) {
        response += `📈 **Recent Team Form:**\n`;
        
        if (detailedData.teamForm.home) {
          const homeForm = detailedData.teamForm.home;
          response += `• **${match.homeTeam?.name}**: ${homeForm.recentForm || ''}\n`;
          
          if (homeForm.lastMatches) {
            const lastResults = Array.isArray(homeForm.lastMatches) ? 
              homeForm.lastMatches.slice(0, 5).map((m: any) => 
                `${m.result || m.outcome || '?'} vs ${m.opponent || 'Unknown'}`).join(', ') : 
              'Recent matches data available';
            response += `  Last 5: ${lastResults}\n`;
          }
          
          if (homeForm.stats) {
            response += `  Goals scored/conceded: ${homeForm.stats.goalsScored || '?'}/${homeForm.stats.goalsConceded || '?'}\n`;
          }
        }
        
        if (detailedData.teamForm.away) {
          const awayForm = detailedData.teamForm.away;
          response += `• **${match.awayTeam?.name}**: ${awayForm.recentForm || ''}\n`;
          
          if (awayForm.lastMatches) {
            const lastResults = Array.isArray(awayForm.lastMatches) ? 
              awayForm.lastMatches.slice(0, 5).map((m: any) => 
                `${m.result || m.outcome || '?'} vs ${m.opponent || 'Unknown'}`).join(', ') : 
              'Recent matches data available';
            response += `  Last 5: ${lastResults}\n`;
          }
          
          if (awayForm.stats) {
            response += `  Goals scored/conceded: ${awayForm.stats.goalsScored || '?'}/${awayForm.stats.goalsConceded || '?'}\n`;
          }
        }
        
        response += `\n`;
      }
    // Head-to-Head with detailed stats
      if (detailedData.h2h) {
        response += `🏆 **Head-to-Head Analysis:**\n`;
        
        if (Array.isArray(detailedData.h2h)) {
          const totalMatches = detailedData.h2h.length;
          const homeWins = detailedData.h2h.filter((m: any) => 
            m.winner === match.homeTeam?.name || m.winner === match.homeTeam?.id
          ).length;
          
          const awayWins = detailedData.h2h.filter((m: any) => 
            m.winner === match.awayTeam?.name || m.winner === match.awayTeam?.id
          ).length;
          
          const draws = detailedData.h2h.filter((m: any) => 
            m.winner === 'draw' || m.result === 'draw'
          ).length;
          
          // Calculate H2H stats
          const totalGoals = detailedData.h2h.reduce((sum: number, m: any) => 
            sum + (parseInt(m.homeScore) || 0) + (parseInt(m.awayScore) || 0), 0
          );
          const avgGoals = totalGoals / totalMatches;
          const bttsCount = detailedData.h2h.filter((m: any) => 
            parseInt(m.homeScore) > 0 && parseInt(m.awayScore) > 0
          ).length;
          const bttsPercentage = Math.round((bttsCount / totalMatches) * 100);
          
          response += `• Overall Record: ${match.homeTeam?.name} ${homeWins} - ${draws} - ${awayWins} ${match.awayTeam?.name}\n`;
          response += `• Win Percentages: ${Math.round((homeWins/totalMatches)*100)}% / ${Math.round((draws/totalMatches)*100)}% / ${Math.round((awayWins/totalMatches)*100)}%\n`;
          response += `• Average Goals per Match: ${avgGoals.toFixed(2)}\n`;
          response += `• Both Teams Scored: ${bttsPercentage}% of matches\n\n`;
          
          response += `• Recent H2H Results:\n`;
          const recentMatches = detailedData.h2h.slice(0, 3);
          recentMatches.forEach((m: any) => {
            response += `  ${m.date || 'Unknown'}: ${m.homeTeam || '?'} ${m.homeScore || '?'}-${m.awayScore || '?'} ${m.awayTeam || '?'}\n`;
            if (m.competition) response += `  (${m.competition})\n`;
          });
        } else {
          response += `• Historical performance data available\n`;
          response += `• Statistical trends and patterns analyzed\n`;
        }
        
        response += `\n`;
      }      // Corners Analysis
      if (detailedData.corners) {
        response += `🚩 **Corners Analysis & Betting Markets:**\n`;
        const corners = detailedData.corners;
        
        // Expected Totals
        if (corners.cornerProbabilities) {
          const { expectedTotal, expectedHome, expectedAway } = corners.cornerProbabilities;
          response += `• **Expected Total Corners:** ${expectedTotal?.toFixed(1) || '?'}\n`;
          response += `• **Expected Home:** ${expectedHome?.toFixed(1) || '?'} | **Away:** ${expectedAway?.toFixed(1) || '?'}\n\n`;
        }
        
        // Over/Under Betting Lines with Probabilities
        if (corners.overUnderPredictions) {
          response += `📊 **Over/Under Markets:**\n`;
          const predictions = corners.overUnderPredictions;
          
          // Sort lines for better presentation
          const sortedLines = Object.keys(predictions)
            .filter(key => key.includes('.5'))
            .sort((a, b) => parseFloat(a) - parseFloat(b));
          
          for (const lineKey of sortedLines) {
            const pred = predictions[lineKey];
            if (pred && pred.line) {
              const confidence = pred.confidence || this.getConfidenceFromProbability(pred.overProbability);
              const emoji = this.getRecommendationEmoji(pred.recommendation);
              
              response += `• **O/U ${pred.line}:** ${emoji} **${pred.recommendation}** (${(pred.overProbability * 100).toFixed(1)}% over) - ${confidence}\n`;
              
              if (pred.historicalOverRate) {
                response += `  └ Historical over rate: ${(pred.historicalOverRate * 100).toFixed(1)}%\n`;
              }
            }
          }
          response += `\n`;
        }
        
        // Team Corner Statistics
        if (corners.homeStats && corners.awayStats) {
          response += `📈 **Team Corner Stats:**\n`;
          response += `• **${match.homeTeam?.name || 'Home'}:** ${corners.homeStats.averageCorners?.toFixed(1) || '?'} avg (${corners.homeStats.matchesAnalyzed || '?'} matches)\n`;
          response += `• **${match.awayTeam?.name || 'Away'}:** ${corners.awayStats.averageCorners?.toFixed(1) || '?'} avg (${corners.awayStats.matchesAnalyzed || '?'} matches)\n`;
          
          // Home/Away advantages
          if (corners.homeStats.homeAdvantage || corners.awayStats.awayAdvantage) {
            response += `• **Home Advantage:** ${corners.homeStats.homeAdvantage > 0 ? '+' : ''}${corners.homeStats.homeAdvantage?.toFixed(1) || '0'} corners\n`;
            response += `• **Away Form:** ${corners.awayStats.awayAdvantage > 0 ? '+' : ''}${corners.awayStats.awayAdvantage?.toFixed(1) || '0'} corners vs avg\n`;
          }
          response += `\n`;
        }
        
        // Corner Probability Ranges
        if (corners.cornerProbabilities?.totalRanges) {
          response += `🎯 **Most Likely Outcomes:**\n`;
          const topRanges = corners.cornerProbabilities.totalRanges
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3);
          
          topRanges.forEach((range, index) => {
            response += `${index + 1}. **${range.range} corners:** ${(range.probability * 100).toFixed(1)}% chance\n`;
          });
          response += `\n`;
        }
        
        // Legacy prediction support
        if (corners.prediction && !corners.overUnderPredictions) {
          response += `• **Quick Prediction:** ${corners.prediction.total || 'Under analysis'}\n`;
          if (corners.prediction.over9_5 !== undefined) {
            response += `• **Over/Under 9.5:** ${corners.prediction.over9_5 ? 'Over recommended' : 'Under recommended'}\n`;
          }
          response += `\n`;
        }
      }

      // Goals Analysis (BTTS)
      if (detailedData.btts) {
        response += `⚽ **Goals Analysis:**\n`;
        const btts = detailedData.btts;
        
        if (btts.bttsStats) {
          response += `• **Both Teams to Score:** ${btts.bttsStats.bttsRate || btts.bttsStats.rate || '?'}% probability\n`;
          response += `• **Over 2.5 Goals:** ${btts.bttsStats.over25Rate || btts.bttsStats.o25Rate || '?'}% probability\n`;
        }
        
        if (btts.recommendation) {
          response += `• **BTTS Recommendation:** ${btts.recommendation.btts || 'Under analysis'}\n`;
          response += `• **O/U Recommendation:** ${btts.recommendation.overUnder || 'Under analysis'}\n`;
        }
        
        response += `• **Goal Timing:** ${match.homeTeam?.name} tends to score ${btts.goalTiming?.home || 'throughout the match'}\n`;
        response += `• **Goal Timing:** ${match.awayTeam?.name} tends to score ${btts.goalTiming?.away || 'throughout the match'}\n`;
        response += `\n`;
      }

      // Cards Analysis
      if (detailedData.cards) {
        response += `🟨 **Cards Analysis:**\n`;
        const cards = detailedData.cards;
        
        if (cards.cardStats) {
          response += `• **Average Cards:** ${cards.cardStats.avgTotal || '?'} per match\n`;
          response += `• **${match.homeTeam?.name} Avg:** ${cards.cardStats.home?.avg || '?'} cards\n`;
          response += `• **${match.awayTeam?.name} Avg:** ${cards.cardStats.away?.avg || '?'} cards\n`;
        }
        
        if (cards.prediction) {
          response += `• **Cards Prediction:** ${cards.prediction.total || 'Under analysis'}\n`;
          response += `• **Over/Under 3.5:** ${cards.prediction.over3_5 ? 'Over looks likely' : 'Under looks likely'}\n`;
        }
        
        if (cards.referee) {
          response += `• **Referee:** ${cards.referee.name || 'TBA'} - Avg ${cards.referee.cardsPerMatch || '?'} cards per match\n`;
        }
        
        response += `\n`;
      }
    }

    // Strategic insights
    response += `🎯 **Key Betting Markets:**\n`;
    response += `• **1X2 Market**: ${match.recommended ? `Consider ${match.recommended.toUpperCase()}` : 'Analyze odds value'}\n`;
    response += `• **Over/Under Goals**: ${detailedData?.btts?.recommendation?.overUnder || 'Check team scoring averages and defensive records'}\n`;
    response += `• **Both Teams to Score**: ${detailedData?.btts?.recommendation?.btts || 'Evaluate attacking strength vs defensive weaknesses'}\n`;
    response += `• **Corners**: ${detailedData?.corners?.prediction?.recommendation || 'Consider playing styles (possession vs counter-attack)'}\n`;
    response += `• **Cards**: ${detailedData?.cards?.prediction?.recommendation || 'Factor in referee strictness and team discipline records'}\n\n`;

    response += `⚠️ **Risk Considerations:**\n`;
    response += `• Team news and injuries (check latest updates)\n`;
    response += `• Weather conditions and pitch quality\n`;
    response += `• Motivation levels (tournament importance, league position)\n`;
    response += `• Recent form momentum and confidence\n`;

    return response;
  }
  private isValidTeamName(name: string): boolean {
    if (!name || name.length < 2) return false;
    
    // Filter out common words that might be mistaken for team names
    const commonWords = [
      'match', 'game', 'team', 'versus', 'against', 'between', 'analysis',
      'statistics', 'odds', 'betting', 'prediction', 'today', 'tomorrow',
      'yesterday', 'please', 'thanks', 'give', 'show', 'tell', 'about',
      'what', 'when', 'where', 'who', 'why', 'how', 'the', 'and', 'for'
    ];
    
    const normalizedName = this.normalizeTeamName(name);
    
    if (commonWords.includes(normalizedName)) {
      return false;
    }
    
    // Check that the name doesn't contain common question words or phrases
    const questionPhrases = [
      'what is', 'how to', 'can you', 'will you', 'should i', 'do you'
    ];
    
    for (const phrase of questionPhrases) {
      if (normalizedName.includes(phrase)) {
        return false;
      }
    }

    // Check if it's likely a team name by checking for common team name patterns
    const teamPatterns = [
      /^[a-z]+$/i,                    // Single word (e.g., Arsenal)
      /^[a-z]+\s+[a-z]+$/i,          // Two words (e.g., Real Madrid)
      /^[a-z]+\s+[a-z]+\s+[a-z]+$/i, // Three words (e.g., Red Bull Leipzig)
      /^[a-z\s\-]+$/i,               // Words with hyphens (e.g., Wolverhampton Wanderers)
      /^[a-z\s\.]+$/i                // Words with periods (e.g., F.C. Barcelona)
    ];    return teamPatterns.some(pattern => pattern.test(name));
  }

  // Helper methods for corner analysis formatting
  private getConfidenceFromProbability(probability: number): string {
    if (probability >= 0.7) return 'HIGH';
    if (probability >= 0.5) return 'MEDIUM';
    return 'LOW';
  }

  private getRecommendationEmoji(recommendation: string): string {
    switch (recommendation?.toUpperCase()) {
      case 'OVER':
        return '📈';
      case 'UNDER':
        return '📉';
      case 'PUSH':
        return '🟡';
      default:
        return '🎯';
    }
  }
}

export const chatService = new ChatService();
