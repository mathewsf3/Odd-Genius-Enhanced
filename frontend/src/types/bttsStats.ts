// BTTS (Both Teams To Score) statistics types

export interface BTTSStats {
  homeStats: TeamBTTSStats;
  awayStats: TeamBTTSStats;
  h2hStats: H2HBTTSStats;
  combinedStats: CombinedBTTSStats;
  isFallbackData: boolean;
}

export interface TeamBTTSStats {
  teamId: string;
  teamName?: string;
  
  // Overall BTTS stats
  totalMatches: number;
  bttsYesCount: number;
  bttsYesPercentage: number;
  
  // Clean sheets and failed to score stats
  cleanSheetCount: number;
  cleanSheetPercentage: number;
  failedToScoreCount: number;
  failedToScorePercentage: number;
  
  // Home/Away specific stats
  homeMatches?: number;
  homeBttsYesCount?: number;
  homeBttsYesPercentage?: number;
  homeCleanSheetCount?: number;
  homeCleanSheetPercentage?: number;
  homeFailedToScoreCount?: number;
  homeFailedToScorePercentage?: number;
  
  awayMatches?: number;
  awayBttsYesCount?: number;
  awayBttsYesPercentage?: number;
  awayCleanSheetCount?: number;
  awayCleanSheetPercentage?: number;
  awayFailedToScoreCount?: number;
  awayFailedToScorePercentage?: number;
  
  // Recent form (last 5 matches)
  recentForm: BTTSFormItem[];
}

export interface BTTSFormItem {
  matchId: string;
  date: string;
  opponent: string;
  isHome: boolean;
  goalsScored: number;
  goalsConceded: number;
  bttsResult: 'Yes' | 'No';
  cleanSheet: boolean;
  failedToScore: boolean;
}

export interface H2HBTTSStats {
  totalMatches: number;
  bttsYesCount: number;
  bttsYesPercentage: number;
  homeTeamWins: number;
  awayTeamWins: number;
  draws: number;
  homeTeamGoals: number;
  awayTeamGoals: number;
  averageTotalGoals: number;
  recentH2HForm: BTTSFormItem[];
}

export interface CombinedBTTSStats {
  // Combined BTTS prediction
  bttsYesProbability: number;
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  prediction: 'Yes' | 'No' | 'Uncertain';
  
  // Goal scoring trends
  averageHomeTeamGoals: number;
  averageAwayTeamGoals: number;
  averageTotalGoals: number;
  
  // Clean sheet trends
  homeTeamCleanSheetProbability: number;
  awayTeamCleanSheetProbability: number;
  
  // Failed to score trends
  homeTeamFailToScoreProbability: number;
  awayTeamFailToScoreProbability: number;
}
