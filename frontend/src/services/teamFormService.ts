import axios from 'axios';

const API_KEY = '9af98e929db6f98a1561c444b6179b5740a69b942cb3ffcc62b80a7eda5128b4';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

export interface FormResult {
  result: 'W' | 'L' | 'D';
  score: string;
  opponent: string;
  date: string;
  isHome: boolean;
}

export interface TeamForm {
  teamId: string;
  teamName: string;
  form: FormResult[];
  formString: string; // e.g., "WWLDW"
}

class TeamFormService {
  private cache = new Map<string, { data: TeamForm; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(teamId: string): string {
    return `team_form_${teamId}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Fetch team fixtures from AllSportsAPI
   */
  private async fetchTeamFixtures(teamId: string, limit: number = 10): Promise<any[]> {
    try {
      console.log(`[TeamFormService] Fetching fixtures for team ${teamId}`);

      // Try different API endpoints for team fixtures
      const endpoints = [
        `${BASE_URL}/?met=Fixtures&teamId=${teamId}&APIkey=${API_KEY}`,
        `${BASE_URL}/?met=Fixtures&teamId=${teamId}&from=2024-01-01&to=2024-12-31&APIkey=${API_KEY}`,
        `${BASE_URL}/?met=Teams&teamId=${teamId}&APIkey=${API_KEY}`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`[TeamFormService] Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint);

          console.log(`[TeamFormService] Response for team ${teamId}:`, {
            status: response.status,
            success: response.data?.success,
            resultLength: response.data?.result?.length,
            sampleData: response.data?.result?.slice(0, 2)
          });

          if (response.data && response.data.success === 1 && response.data.result) {
            const fixtures = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
            console.log(`[TeamFormService] Found ${fixtures.length} fixtures for team ${teamId}`);

            // Filter for finished matches and sort by date (most recent first)
            const finishedMatches = fixtures
              .filter((fixture: any) => {
                const isFinished = fixture.event_status === 'Finished' ||
                                 fixture.match_status === 'Finished' ||
                                 fixture.event_final_result ||
                                 fixture.match_hometeam_score !== undefined;

                console.log(`[TeamFormService] Fixture status check:`, {
                  event_status: fixture.event_status,
                  match_status: fixture.match_status,
                  event_final_result: fixture.event_final_result,
                  isFinished
                });

                return isFinished;
              })
              .sort((a: any, b: any) => {
                const dateA = new Date(a.event_date || a.match_date || a.event_time);
                const dateB = new Date(b.event_date || b.match_date || b.event_time);
                return dateB.getTime() - dateA.getTime();
              })
              .slice(0, limit);

            console.log(`[TeamFormService] Found ${finishedMatches.length} finished matches for team ${teamId}`);
            console.log(`[TeamFormService] Sorted matches by date (newest first):`,
              finishedMatches.map(m => `${m.event_date || m.match_date} - ${m.event_home_team || m.match_hometeam_name} vs ${m.event_away_team || m.match_awayteam_name}`)
            );

            if (finishedMatches.length > 0) {
              console.log(`[TeamFormService] Sample finished match:`, finishedMatches[0]);
              return finishedMatches;
            }
          }
        } catch (endpointError) {
          console.warn(`[TeamFormService] Endpoint failed:`, endpoint, endpointError);
          continue;
        }
      }

      console.warn(`[TeamFormService] No fixtures found for team ${teamId} from any endpoint`);
      return [];
    } catch (error) {
      console.error(`[TeamFormService] Error fetching fixtures for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Process fixtures to determine form results
   */
  private processFixtures(fixtures: any[], teamId: string, teamName: string): FormResult[] {
    const formResults: FormResult[] = [];

    // Log the fixtures for debugging
    console.log(`[TeamFormService] Processing ${fixtures.length} fixtures for ${teamName} (ID: ${teamId})`);

    fixtures.forEach((fixture: any, index: number) => {
      try {
        // Extract match details with multiple field name fallbacks
        const homeTeamId = fixture.event_home_team_id || fixture.home_team_key || fixture.match_hometeam_id;
        const awayTeamId = fixture.event_away_team_id || fixture.away_team_key || fixture.match_awayteam_id;
        const homeTeamName = fixture.event_home_team || fixture.match_hometeam_name;
        const awayTeamName = fixture.event_away_team || fixture.match_awayteam_name;
        const matchDate = fixture.event_date || fixture.match_date;
        const matchTime = fixture.event_time || '';

        // Extract scores with multiple field name fallbacks
        let homeScore: number;
        let awayScore: number;

        if (fixture.event_final_result) {
          // Format: "2 - 1"
          const scoreParts = fixture.event_final_result.split(' - ');
          homeScore = parseInt(scoreParts[0]) || 0;
          awayScore = parseInt(scoreParts[1]) || 0;
        } else {
          homeScore = parseInt(fixture.event_home_final_result || fixture.match_hometeam_score || '0');
          awayScore = parseInt(fixture.event_away_final_result || fixture.match_awayteam_score || '0');
        }

        // Determine if this team was home or away
        const isHome = String(homeTeamId) === String(teamId);
        const opponent = isHome ? awayTeamName : homeTeamName;
        const teamScore = isHome ? homeScore : awayScore;
        const opponentScore = isHome ? awayScore : homeScore;

        // Determine result
        let result: 'W' | 'L' | 'D';
        if (teamScore > opponentScore) {
          result = 'W';
        } else if (teamScore < opponentScore) {
          result = 'L';
        } else {
          result = 'D';
        }

        // Log each match for debugging
        console.log(`[TeamFormService] Match ${index + 1}: ${matchDate} ${matchTime} - ${isHome ? 'HOME' : 'AWAY'} vs ${opponent} - Score: ${teamScore}-${opponentScore} - Result: ${result}`);

        formResults.push({
          result,
          score: `${teamScore}-${opponentScore}`,
          opponent: opponent || 'Unknown',
          date: matchDate || '',
          isHome
        });

      } catch (error) {
        console.warn('[TeamFormService] Error processing fixture:', error, fixture);
      }
    });

    // Take the first 5 results (they're already sorted by date DESC in fetchTeamFixtures)
    const recentForm = formResults.slice(0, 5);

    // Log the final form sequence
    const formSequence = recentForm.map(r => r.result).join('');
    console.log(`[TeamFormService] Final form sequence for ${teamName}: ${formSequence} (most recent first)`);

    return recentForm;
  }

  /**
   * Fetch team form data
   */
  public async fetchTeamForm(teamId: string, teamName: string): Promise<TeamForm> {
    const cacheKey = this.getCacheKey(teamId);
    const cached = this.cache.get(cacheKey);

    // Return cached data if valid
    if (cached && this.isValidCache(cached.timestamp)) {
      console.log(`[TeamFormService] Returning cached form data for team ${teamId}`);
      return cached.data;
    }

    try {
      console.log(`[TeamFormService] Fetching fresh form data for team ${teamId} (${teamName})`);

      // Fetch recent fixtures
      const fixtures = await this.fetchTeamFixtures(teamId, 10);

      // Process fixtures to get form
      const formResults = this.processFixtures(fixtures, teamId, teamName);

      // Create form string (e.g., "WWLDW")
      const formString = formResults.map(result => result.result).join('');

      const teamForm: TeamForm = {
        teamId,
        teamName,
        form: formResults,
        formString
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: teamForm,
        timestamp: Date.now()
      });

      console.log(`[TeamFormService] Successfully fetched form for ${teamName}: ${formString}`);
      console.log(`[TeamFormService] Form details for ${teamName}:`, formResults);

      return teamForm;

    } catch (error) {
      console.error(`[TeamFormService] Error fetching form for team ${teamId}:`, error);

      // Return empty form data when API fails - no mock data
      return {
        teamId,
        teamName,
        form: [],
        formString: ''
      };
    }
  }

  /**
   * Fetch form data for both teams in a match
   */
  public async fetchMatchTeamsForm(homeTeamId: string, homeTeamName: string, awayTeamId: string, awayTeamName: string): Promise<{
    homeTeamForm: TeamForm;
    awayTeamForm: TeamForm;
  }> {
    console.log(`[TeamFormService] Fetching form data for match: ${homeTeamName} vs ${awayTeamName}`);

    try {
      // Fetch both teams' form data in parallel
      const [homeTeamForm, awayTeamForm] = await Promise.all([
        this.fetchTeamForm(homeTeamId, homeTeamName),
        this.fetchTeamForm(awayTeamId, awayTeamName)
      ]);

      return {
        homeTeamForm,
        awayTeamForm
      };
    } catch (error) {
      console.error('[TeamFormService] Error fetching match teams form:', error);

      // Return empty form data on error
      return {
        homeTeamForm: {
          teamId: homeTeamId,
          teamName: homeTeamName,
          form: [],
          formString: ''
        },
        awayTeamForm: {
          teamId: awayTeamId,
          teamName: awayTeamName,
          form: [],
          formString: ''
        }
      };
    }
  }

  /**
   * Clear cache for a specific team
   */
  public clearTeamCache(teamId: string): void {
    const cacheKey = this.getCacheKey(teamId);
    this.cache.delete(cacheKey);
    console.log(`[TeamFormService] Cleared cache for team ${teamId}`);
  }

  /**
   * Clear all cached data
   */
  public clearAllCache(): void {
    this.cache.clear();
    console.log('[TeamFormService] Cleared all form cache');
  }


}

export default new TeamFormService();
