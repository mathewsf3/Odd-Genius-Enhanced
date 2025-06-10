export interface GoalsAnalysis {
  thresholds: {
    [key: string]: {  // '0.5', '1.5', etc.
      homeTeam: {
        last5Home: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
        last10Home: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
      };
      awayTeam: {
        last5Away: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
        last10Away: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
      };
      h2h: {
        last5: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
        last10: {
          over: number;
          under: number;
          percentage: { over: number; under: number };
        };
      };
    };
  };
}

export interface CardsAnalysis {
  thresholds: {
    [key: string]: {  // '0.5', '1.5', etc.
      totalCards: {
        homeTeam: {
          last5Home: { over: number; under: number; percentage: { over: number; under: number } };
          last10Home: { over: number; under: number; percentage: { over: number; under: number } };
        };
        awayTeam: {
          last5Away: { over: number; under: number; percentage: { over: number; under: number } };
          last10Away: { over: number; under: number; percentage: { over: number; under: number } };
        };
        h2h: {
          last5: { over: number; under: number; percentage: { over: number; under: number } };
          last10: { over: number; under: number; percentage: { over: number; under: number } };
        };
      };
      yellowCards: {
        // Similar structure as totalCards
      };
      redCards: {
        // Similar structure as totalCards
      };
    };
  };
}

export interface CornersAnalysis {
  thresholds: {
    [key: string]: {  // '6.5', '7.5', etc.
      total: {
        homeTeam: {
          last5Home: { over: number; under: number; percentage: { over: number; under: number } };
          last10Home: { over: number; under: number; percentage: { over: number; under: number } };
        };
        awayTeam: {
          last5Away: { over: number; under: number; percentage: { over: number; under: number } };
          last10Away: { over: number; under: number; percentage: { over: number; under: number } };
        };
        h2h: {
          last5: { over: number; under: number; percentage: { over: number; under: number } };
          last10: { over: number; under: number; percentage: { over: number; under: number } };
        };
      };
      firstHalf: {
        // Similar structure as total
      };
      secondHalf: {
        // Similar structure as total
      };
    };
  };
}

export interface RefereeAnalysis {
  id: number;
  name: string;
  cardsPerMatch: number;
  cardsHomeTeams: number;
  cardsAwayTeams: number;
  penaltiesAwarded: number;
  penaltiesPerMatch: number;
  penaltiesHomeTeams: number;
  penaltiesAwayTeams: number;
  matchesWithHomeTeam: number;
  matchesWithAwayTeam: number;
  // Additional referee statistics
}

export interface LeagueAnalysis {
  id: number;
  name: string;
  homeTeamPosition: number;
  awayTeamPosition: number;
  pointsGap: number;
  possiblePositionChanges: {
    homeTeamWin: { homeTeam: number; awayTeam: number };
    draw: { homeTeam: number; awayTeam: number };
    awayTeamWin: { homeTeam: number; awayTeam: number };
  };
  leagueAverages: {
    goals: number;
    cards: number;
    corners: number;
  };
  homeTeamLeagueForm: {
    home: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
    overall: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
  };
  awayTeamLeagueForm: {
    away: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
    overall: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
  };
}

export interface H2HAnalysis {
  matches: {
    last5: Array<{
      id: number;
      date: string;
      homeTeam: { id: number; name: string; score: number };
      awayTeam: { id: number; name: string; score: number };
      venue: string;
      stats: {
        totalGoals: number;
        totalCards: number;
        totalCorners: number;
        // Additional match statistics
      };
    }>;
    last10: Array<any>; // Similar structure as last5
  };
  summary: {
    homeTeamWins: number;
    draws: number;
    awayTeamWins: number;
    averageGoals: number;
    averageCards: number;
    averageCorners: number;
  };
}

export interface PlayerAnalysis {
  homeTeam: Array<{
    id: number;
    name: string;
    position: string;
    last5: {
      goals: number;
      assists: number;
      minutesPlayed: number;
      yellowCards: number;
      redCards: number;
      foulsCommitted: number;
      foulsSuffered: number;
      xG: number;
      xA: number;
    };
    last10: any; // Similar structure as last5
  }>;
  awayTeam: Array<any>; // Similar structure as homeTeam
}

export interface ExpectedStatsAnalysis {
  xG: {
    homeTeam: number;
    awayTeam: number;
  };
  xCorners: number;
  xCards: number;
  historicalVariance: {
    goals: number;
    corners: number;
    cards: number;
  };
}

export interface MatchAnalysis {
  match: Match;
  goalsAnalysis: GoalsAnalysis;
  cardsAnalysis: CardsAnalysis;
  cornersAnalysis: CornersAnalysis;
  refereeAnalysis: RefereeAnalysis;
  leagueAnalysis: LeagueAnalysis;
  h2hAnalysis: H2HAnalysis;
  playerAnalysis: PlayerAnalysis;
  expectedStats: ExpectedStatsAnalysis;
}