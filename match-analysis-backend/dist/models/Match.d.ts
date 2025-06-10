export interface Match {
    id: number;
    homeTeam: Team;
    awayTeam: Team;
    league: League;
    date: string;
    status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
    venue?: string;
    referee?: Referee;
    season: string;
    round?: string;
    week?: number;
}
export interface Team {
    id: number;
    name: string;
    shortName?: string;
    logo?: string;
    country: string;
    league: League;
}
export interface League {
    id: number;
    name: string;
    country: string;
    season: string;
    logo?: string;
}
export interface Referee {
    id?: number;
    name: string;
    country?: string;
    statistics?: RefereeStatistics;
}
export interface RefereeStatistics {
    totalMatches: number;
    averageCardsPerMatch: number;
    averageYellowCards: number;
    averageRedCards: number;
    penaltiesAwarded: number;
    homeAdvantage?: {
        homeWinPercentage: number;
        awayWinPercentage: number;
        drawPercentage: number;
    };
}
export interface MatchResult {
    homeScore: number;
    awayScore: number;
    totalGoals: number;
    halfTimeScore?: {
        home: number;
        away: number;
    };
}
export interface MatchStatistics {
    corners: {
        home: number;
        away: number;
        total: number;
        firstHalf?: {
            home: number;
            away: number;
            total: number;
        };
        secondHalf?: {
            home: number;
            away: number;
            total: number;
        };
    };
    cards: {
        yellow: {
            home: number;
            away: number;
            total: number;
        };
        red: {
            home: number;
            away: number;
            total: number;
        };
        total: {
            home: number;
            away: number;
            total: number;
        };
    };
    fouls?: {
        home: number;
        away: number;
        total: number;
    };
    shots?: {
        home: number;
        away: number;
        onTarget?: {
            home: number;
            away: number;
        };
    };
    possession?: {
        home: number;
        away: number;
    };
    xG?: {
        home: number;
        away: number;
        total: number;
    };
}
export interface PlayerStatistics {
    playerId: number;
    playerName: string;
    teamId: number;
    position?: string;
    minutesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    foulsCommitted: number;
    foulsSuffered: number;
    shots?: number;
    shotsOnTarget?: number;
    xG?: number;
    xA?: number;
}
export interface HistoricalMatch extends Match {
    result: MatchResult;
    statistics: MatchStatistics;
    players?: PlayerStatistics[];
}
//# sourceMappingURL=Match.d.ts.map