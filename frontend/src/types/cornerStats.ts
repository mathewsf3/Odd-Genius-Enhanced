export interface CornerTimingPeriod {
  timePeriod: string;
  homeCorners: number;
  awayCorners: number;
}

export interface OverUnderPrediction {
  line: number;
  overProbability: number;
  underProbability: number;
  historicalOverRate: number;
  recommendation: string; // OVER, UNDER, PUSH
  // Legacy properties for backward compatibility
  overPercentage?: number;
  underPercentage?: number;
  confidence?: string; // Low, Medium, High
  prediction?: string; // OVER, UNDER, PUSH
}

export interface CornerRange {
  range: string;
  probability: number;
  historicalOccurrence: number;
}

export interface TeamCornerStats {
  teamId: string;
  totalCorners: number;
  averageCorners: number;
  averageAgainst: number;
  maxCorners: number;
  homeAdvantage: number;
  awayAdvantage: number;
  cornersByHalf?: {
    firstHalf: number;
    secondHalf: number;
  };
  overRates: {
    [key: string]: number;
  };
  cornerSources?: {
    fromAttacks: number;
    fromFouls: number;
    fromCounterAttacks: number;
  };
  matchesAnalyzed: number;
  homeMatches: number;
  awayMatches: number;
  teamName?: string;
  teamLogo?: string;
  dataQuality?: {
    isValid: boolean;
    validMatches: number;
    dataCompleteness: number;
  };
}

export interface CornerStats {
  homeStats: TeamCornerStats;
  awayStats: TeamCornerStats;
  timingAnalysis?: CornerTimingPeriod[];
  overUnderPredictions: {
    [key: string]: OverUnderPrediction;
  };
  cornerProbabilities: {
    totalRanges: CornerRange[];
    expectedTotal: number;
    expectedHome: number;
    expectedAway: number;
  };
  matchesAnalyzed?: {
    home: number;
    away: number;
  };
  isFallbackData?: boolean; // Optional flag to indicate if this is fallback/mock data
  noCornerData?: boolean; // Optional flag to indicate matches found but no corner data available
  totalMatches?: {
    home: number;
    away: number;
  }; // Total matches found for each team (regardless of corner data availability)
}
