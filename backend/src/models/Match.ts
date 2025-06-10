export interface Match {
    id: number;
    homeTeamId: number;
    homeTeamName: string;
    awayTeamId: number;
    awayTeamName: string;
    startTime: string;
    status: 'upcoming' | 'live' | 'finished';
    leagueId: number;
    leagueName: string;
    refereeId?: number;
    refereeName?: string;
    venue?: string;
    // Match stats if available
    stats?: {
      homeScore?: number;
      awayScore?: number;
      homeYellowCards?: number;
      awayYellowCards?: number;
      homeRedCards?: number;
      awayRedCards?: number;
      homeCorners?: number;
      awayCorners?: number;
      // Additional stats as needed
    };
  }