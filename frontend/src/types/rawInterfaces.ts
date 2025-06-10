// This file contains raw interface definitions that match the API response formats
// These are used for typing raw data before it's converted to the standard interfaces

// Raw Head-to-Head data from the API
export interface RawH2HData {
  totalMatches?: number;
  homeTeamWins?: number;
  awayTeamWins?: number;
  draws?: number;
  totalGoalsHome?: number;
  totalGoalsAway?: number;
  recentMatches?: any[]; // We might want to type this more specifically later
  [key: string]: any; // Allow any other properties that might come from the API
}

// Helper type for data that could be coming from different API formats
export interface MatchAnalysisWithRawData {
  h2h?: RawH2HData;
  teamStats?: {
    home: any;
    away: any;
  };
  matchDetails?: any;
  statistics?: {
    home: any;
    away: any;
  };
  [key: string]: any; // Allow any additional properties
}

// Type for raw h2h analysis in Match object
export type RawH2H = {
  // Direct properties
  [key: string]: any; // Add index signature to allow any properties
  
  totalMatches?: number;
  homeTeamWins?: number;
  awayTeamWins?: number;
  draws?: number;
  totalGoalsHome?: number;
  totalGoalsAway?: number;
  recentMatches?: any[];
  matches?: any[];
  history?: any[];
  
  // Team names
  firstTeamName?: string;
  secondTeamName?: string;
  
  // Nested structures
  overall?: {
    [key: string]: any;
    totalMatches?: number;
    homeTeamWins?: number;
    awayTeamWins?: number;
    draws?: number;
    totalGoalsHome?: number;
    totalGoalsAway?: number;
  };
  
  summary?: {
    [key: string]: any;
    totalMatches?: number;
    homeTeamWins?: number;
    awayTeamWins?: number;
    draws?: number;
    totalGoalsHome?: number;
    totalGoalsAway?: number;
    wins?: {
      firstTeam?: number;
      secondTeam?: number;
      draws?: number;
    };
    goals?: {
      firstTeam?: number;
      secondTeam?: number;
    };
  };
  
  // Direct win/goal properties that might be present
  wins?: {
    firstTeam?: number;
    secondTeam?: number;
    draws?: number;
  };
  
  goals?: {
    firstTeam?: number;
    secondTeam?: number;
  };
};

// To be expanded with other raw interfaces as needed
