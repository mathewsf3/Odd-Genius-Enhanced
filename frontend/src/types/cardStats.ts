export interface CardsByPeriod {
  "0-15": number;
  "16-30": number;
  "31-45": number;
  "46-60": number;
  "61-75": number;
  "76-90": number;
}

export interface PlayerCardStats {
  playerId: string;
  playerName: string;
  yellowCards: number;
  redCards: number;
  totalCards: number;
  matchesPlayed: number;
  cardsPerMatch: number;
}

export interface TeamCardStats {
  teamId: string;
  totalYellowCards: number;
  totalRedCards: number;
  totalCards: number;
  averageYellowCardsPerMatch: number;
  averageRedCardsPerMatch: number;
  averageCardsPerMatch: number;
  cardsByPeriod: CardsByPeriod;
  mostCardedPlayers: PlayerCardStats[];
  overRates: {
    "3.5": number;
    "4.5": number;
    "5.5": number;
  };
}

export interface RefereeCardStats {
  refereeId: string;
  refereeName: string;
  totalMatches: number;
  totalYellowCards: number;
  totalRedCards: number;
  averageYellowCardsPerMatch: number;
  averageRedCardsPerMatch: number;
  averageCardsPerMatch: number;
}

export interface CardStats {
  homeStats: TeamCardStats;
  awayStats: TeamCardStats;
  combinedStats: {
    totalCards: number;
    averageCardsPerMatch: number;
    cardsByPeriod: CardsByPeriod;
    overRates: {
      "3.5": number;
      "4.5": number;
      "5.5": number;
    };
  };
  refereeStats?: RefereeCardStats;
  isFallbackData: boolean;
}
