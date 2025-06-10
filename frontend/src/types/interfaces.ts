// Basic types
export interface Team {
  id: string;
  name: string;
  logo?: string;
  rating?: number;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo?: string;
}

export interface Score {
  home: number;
  away: number;
}

export interface Odds {
  home: number;
  draw: number;
  away: number;
}

export interface Statistics {
  corners: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  possession: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsScored?: number;
  goalsConceded?: number;
  cleanSheets?: number;
  failedToScore?: number;
  homeWins?: number;
  homeDraws?: number;
  homeLosses?: number;
  homeGoalsScored?: number;
  homeGoalsConceded?: number;
  homeCleanSheets?: number;
  homeFailedToScore?: number;
  awayWins?: number;
  awayDraws?: number;
  awayLosses?: number;
  awayGoalsScored?: number;
  awayGoalsConceded?: number;
  awayCleanSheets?: number;
  awayFailedToScore?: number;  scoringPatterns?: {
    scoredFirst: number;
    concededFirst: number;
    winAfterScoring: number;
    winAfterConceding: number;
    drawAfterScoring: number;
    drawAfterConceding: number;
    lossAfterScoring: number;
    lossAfterConceding: number;
    [key: string]: number;
  };
  timingPercentages?: {
    first15Percent: number;
    second15Percent: number;
    third15Percent: number;
    fourth15Percent: number;
    fifth15Percent: number;
    sixth15Percent: number;
    firstHalfPercent: number;
    secondHalfPercent: number;
    [key: string]: number;
  };
  [key: string]: any; // Add index signature to allow string indexing
}

// Algorithm types
export interface Algorithm {
  confidence: number;
  recommendation: 'home' | 'away' | 'draw';
  type?: string;
  prediction?: {
    home: number;
    draw: number;
    away: number;
  };
}

// Base match type without analysis
export interface BaseMatch {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  startTime: string;
  status: string;
  score?: Score;
  odds: Odds;
  probability: {
    home: string;
  // Properties that might be found in raw match data
  event_date?: string;
  date?: string;
  event_home_team?: string;
  event_away_team?: string;
  homeName?: string;
  awayName?: string;
  event_home_final_result?: number;
  event_away_final_result?: number;
  homeScore?: number;
  awayScore?: number;
  goals?: {
    home: number;
    away: number;
  };
    draw: string;
    away: string;
  };  recommended?: 'home' | 'away' | 'draw';
  statistics?: {
    home: Statistics;
    away: Statistics;
  };
  date?: string;
  time?: string;
  elapsed?: string | number;
  venue?: string;
  stadium?: string;
  minute?: string;
  isPremiumPick?: boolean;
  isPromo?: boolean;
  algorithm?: Algorithm;
  referee?: string;
  h2h?: any; // Add h2h data property that might come directly from the API
  analysis?: MatchAnalysis; // Analysis data that might be added later
}

// Analysis related types

export interface CardAnalysis {
  home: {
    team: Team;
    yellowCards: number;
    redCards: number;
  };
  away: {
    team: Team;
    yellowCards: number;
    redCards: number;
  };
}

export interface CornerAnalysis {
  home: {
    team: Team;
    corners: number;
  };
  away: {
    team: Team;
    corners: number;
  };
}

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

export interface StatsData {
  totalMatches: number;
  winRate: number;
  profitLoss: number;
  averageOdds: number;
  bttsRate: number;
  over25Rate: number;
  teamStats: {
    home: {
      over1_5?: number;
      over2_5?: number;
      over3_5?: number;
      btts?: number;
      cleanSheets?: number;
      failedToScore?: number;
      averageGoalsScored?: number;
      averageGoalsConceded?: number;
      cornersFor?: number;
      cornersAgainst?: number;
      averageCornersFor?: number;
      averageCornersAgainst?: number;
      over8_5?: number;
      over9_5?: number;
      over10_5?: number;
      totalCorners?: number;
      totalYellowCards?: number;
      totalRedCards?: number;
      averageYellowCards?: number;
      averageRedCards?: number;
      cardsPer15Min?: number[];
      percentages?: {
        over2Cards?: number;
        over3Cards?: number;
        over4Cards?: number;
        over5Cards?: number;
      };
      [key: string]: any;
    };
    away: {
      over1_5?: number;
      over2_5?: number;
      over3_5?: number;
      btts?: number;
      cleanSheets?: number;
      failedToScore?: number;
      averageGoalsScored?: number;
      averageGoalsConceded?: number;
      cornersFor?: number;
      cornersAgainst?: number;
      averageCornersFor?: number;
      averageCornersAgainst?: number;
      over8_5?: number;
      over9_5?: number;
      over10_5?: number;
      totalCorners?: number;
      totalYellowCards?: number;
      totalRedCards?: number;
      averageYellowCards?: number;
      averageRedCards?: number;
      cardsPer15Min?: number[];
      percentages?: {
        over2Cards?: number;
        over3Cards?: number;
        over4Cards?: number;
        over5Cards?: number;
      };
      [key: string]: any;
    };
  };
}

export interface TeamForm {
  team: Team;
  lastMatches: BaseMatch[];
  formSummary: string;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  totalMatches: number;
  possession?: number;
}
}

export interface MatchAnalysis {
  h2h: H2HData;
  teamForm: {
    home: TeamForm;
    away: TeamForm;
  };
  leagueStandings: any;
  odds: {
    markets: {
      overUnder: {
        [key: string]: number;
      };
    };
  };
  insights: Array<{
    type: string;
    insight: string;
    strength: 'weak' | 'medium' | 'strong';
  }>;
  cardAnalysis?: CardAnalysis;
  cornerAnalysis?: CornerAnalysis;
  statistics?: {
    home: Statistics;
    away: Statistics;
  };  predictions?: {
    home: number;
    draw: number;
    away: number;
    homeWinProbability?: number;
    drawProbability?: number;
    awayWinProbability?: number;
    btts?: {
      yes: number;
      no: number;
    };
    overUnder?: {
      over2_5: number;
      under2_5: number;
    };
    correctScore?: Array<{
      score: string;
      probability: number;
    }>;
    firstGoalScorer?: Array<{
      player: string;
      team: string;
      probability: number;
    }>;
    // Goal timing predictions removed
  };

  // League statistics for goal timing analysis removed
  overUnder?: {
    over: number;
    under: number;
    average: number;
  };
  teamStats?: {
    home: {
      over1_5?: number;
      over2_5?: number;
      over3_5?: number;
      btts?: number;
      cleanSheets?: number;
      failedToScore?: number;
      averageGoalsScored?: number;
      averageGoalsConceded?: number;
      cornersFor?: number;
      cornersAgainst?: number;
      averageCornersFor?: number;
      averageCornersAgainst?: number;
      over8_5?: number;
      over9_5?: number;
      over10_5?: number;
      totalCorners?: number;
      totalYellowCards?: number;
      totalRedCards?: number;
      averageYellowCards?: number;
      averageRedCards?: number;
      cardsPer15Min?: number[];
      percentages?: {
        over2Cards?: number;
        over3Cards?: number;
        over4Cards?: number;
        over5Cards?: number;
      };
      goalsScored?: {
        first15?: number;
        min16_30?: number;
        min31_45?: number;
        min46_60?: number;
        min61_75?: number;
        min76_90?: number;
      };
      goalsConceded?: {
        first15?: number;
        min16_30?: number;
        min31_45?: number;
        min46_60?: number;
        min61_75?: number;
        min76_90?: number;
      };
    };
    away: {
      over1_5?: number;
      over2_5?: number;
      over3_5?: number;
      btts?: number;
      cleanSheets?: number;
      failedToScore?: number;
      averageGoalsScored?: number;
      averageGoalsConceded?: number;
      cornersFor?: number;
      cornersAgainst?: number;
      averageCornersFor?: number;
      averageCornersAgainst?: number;
      over8_5?: number;
      over9_5?: number;
      over10_5?: number;
      totalCorners?: number;
      totalYellowCards?: number;
      totalRedCards?: number;
      averageYellowCards?: number;
      averageRedCards?: number;
      cardsPer15Min?: number[];
      percentages?: {
        over2Cards?: number;
        over3Cards?: number;
        over4Cards?: number;
        over5Cards?: number;
      };
      goalsScored?: {
        first15?: number;
        min16_30?: number;
        min31_45?: number;
        min46_60?: number;
        min61_75?: number;
        min76_90?: number;
      };
      goalsConceded?: {
        first15?: number;
        min16_30?: number;
        min31_45?: number;
        min46_60?: number;
        min61_75?: number;
        min76_90?: number;
      };
    };
  };
  overall?: {
    home: {
      played?: number;
      won?: number;
      drawn?: number;
      lost?: number;
      goalsFor?: number;
      goalsAgainst?: number;
      cleanSheets?: number;
      failedToScore?: number;
      avgGoalsScored?: number;
      avgGoalsConceded?: number;
      form?: string[];
    };
    away: {
      played?: number;
      won?: number;
      drawn?: number;
      lost?: number;
      goalsFor?: number;
      goalsAgainst?: number;
      cleanSheets?: number;
      failedToScore?: number;
      avgGoalsScored?: number;
      avgGoalsConceded?: number;
      form?: string[];
    };
  };
  matchDetails?: {
    id: string;
    league: {
      id: string;
      name: string;
      logo: string;
    };
    homeTeam: {
      id: string;
      name: string;
      logo: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logo: string;
    };
    date: string;
    time: string;
    venue: string;
    referee: string;
    score: {
      home: number;
      away: number;
    };
    statistics: {
      home: {
        possession: number;
        shots: number;
        shotsTotal: number;
        corners: number;
        fouls: number;
        yellowCards: number;
        redCards: number;
        offsides: number;
      };
      away: {
        possession: number;
        shots: number;
        shotsTotal: number;
        corners: number;
        fouls: number;
        yellowCards: number;
        redCards: number;
        offsides: number;
      };
    };
    isMockData: boolean;
  };
}

// Final enriched match type
export interface Match extends BaseMatch {
  analysis?: MatchAnalysis;
}

// Performance related types
// Extended interfaces for card analysis data
export interface CardPlayer {
  name: string;
  position?: string;
  yellowCards: number;
  redCards: number;
}

export interface CardPeriod {
  period: string;
  cards: number;
}

export interface CardStatsPercentages {
  over2Cards?: number;
  over3Cards?: number;
  over4Cards?: number;
  over5Cards?: number;
  [key: string]: number | undefined;
}

export interface TeamCardAnalysis {
  team: Team;
  yellowCards: number;
  redCards: number;
  yellowCardsAvg?: number;
  redCardsAvg?: number;
  cardsByPeriod?: CardPeriod[];
  players?: CardPlayer[];
  stats?: CardStatsPercentages;
}

export interface RefereeCardData {
  name?: string;
  matches?: number;
  yellowCardsAvg?: number;
  redCardsAvg?: number;
  recentMatches?: Array<{
    date: string;
    teams: string;
    yellowCards: number;
    redCards: number;
  }>;
}

export interface LeagueCardStats {
  yellowCardsAvg?: number;
  redCardsAvg?: number;
  stats?: CardStatsPercentages;
}

export interface CardAnalysisData {
  home: TeamCardAnalysis;
  away: TeamCardAnalysis;
  league?: LeagueCardStats;
  referee?: RefereeCardData;
}

export interface CardPredictions {
  total?: string;
  home?: number;
  away?: number;
  confidence?: number;
}

export interface StatsData {
  totalMatches: number;
  winRate: number;
  profitLoss: number;
  averageOdds: number;
  roi: number;
  bets: number;
  wins?: number;
  losses?: number;
  cards?: {
    home: Statistics;
    away: Statistics;
  };
  corners?: {
    home: Statistics;
    away: Statistics;
  };
  goalTiming?: {
    home: { [key: string]: number };
    away: { [key: string]: number };
  };
  overUnder?: {
    over: number;
    under: number;
    average: number;
  };
  predictions?: {
    home: number;
    draw: number;
    away: number;
    cards?: CardPredictions;
  };
  teamStats?: {
    home: Statistics;
    away: Statistics;
  };
  daily?: Array<{ date: string; value: number }>;
  average?: number;
  totalWins?: number;
  totalLosses?: number;
  cardAnalysis?: CardAnalysisData;
}

export interface BettingPerformance {
  period?: string;
  date: string;
  wins: number;
  losses: number;
  voids: number;
  profit: number;
  roi: number;
  betsWon?: number;
  betsLost?: number;
  winRate?: number;
  totalBets?: number;
  profitLoss?: number;
  winningBets?: number;
  losingBets?: number;
}
