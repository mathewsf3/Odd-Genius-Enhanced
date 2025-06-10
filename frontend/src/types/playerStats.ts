// Player Statistics types for the Player Stats/Props tab

export interface PlayerStats {
  homeTeamPlayers: TeamPlayerStats;
  awayTeamPlayers: TeamPlayerStats;
  topScorers: TopScorersStats;
  lineups: LineupStats | null;
  isFallbackData: boolean;
  gameCount?: number; // Number of games used for player stats
}

export interface TeamPlayerStats {
  teamId: string;
  teamName: string;
  players: Player[];
  gameCount?: number; // Number of games used for player stats
}

export interface Player {
  playerId: string;
  playerName: string;
  playerImage?: string;
  playerNumber?: string;
  playerCountry?: string;
  playerType?: string; // forward, midfielder, defender, goalkeeper
  playerAge?: number;
  playerMatchPlayed?: number;
  playerGoals: number;
  playerAssists: number;
  playerMinutesPlayed?: number;
  playerRedCards: number;
  playerYellowCards: number;
  playerShots?: number;
  playerShotsOnTarget?: number;
  playerKeyPasses?: number;
  playerRating?: number;
  playerForm?: PlayerFormItem[];
}

export interface PlayerFormItem {
  matchId: string;
  date: string;
  opponent: string;
  isHome: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating?: number;
}

export interface TopScorersStats {
  leagueId: string;
  leagueName: string;
  season: string;
  topScorers: TopScorer[];
}

export interface TopScorer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  playerGoals: number;
  playerAssists: number;
  playerPenaltyGoals?: number;
  playerMinutesPlayed?: number;
  playerMatches?: number;
  goalsPerMatch?: number;
  minutesPerGoal?: number;
}

export interface LineupStats {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
  homeFormation: string;
  awayFormation: string;
}

export interface TeamLineup {
  teamId: string;
  teamName: string;
  startingLineup: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupPlayer {
  playerId: string;
  playerName: string;
  playerNumber?: string;
  playerPosition?: string;
  playerRating?: number;
  isCaptain?: boolean;
}

export interface PlayerPropBet {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  propType: 'shots' | 'goals' | 'assists' | 'cards';
  line: number;
  overProbability: number;
  underProbability: number;
  recommendation: 'OVER' | 'UNDER' | 'PUSH';
  confidenceLevel: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface PlayerPropStats {
  player: Player;
  propBets: PlayerPropBet[];
}
