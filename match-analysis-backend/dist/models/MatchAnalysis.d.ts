import { HistoricalMatch, Team, League, RefereeStatistics } from './Match';
export interface ThresholdStatistics {
    threshold: number;
    matchesOver: number;
    matchesUnder: number;
    totalMatches: number;
    overPercentage: number;
    underPercentage: number;
}
export interface GoalsAnalysis {
    last5Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageGoals: number;
        averageGoalsFor: number;
        averageGoalsAgainst: number;
    };
    last10Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageGoals: number;
        averageGoalsFor: number;
        averageGoalsAgainst: number;
    };
}
export interface CardsAnalysis {
    last5Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageCards: number;
        averageYellowCards: number;
        averageRedCards: number;
    };
    last10Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageCards: number;
        averageYellowCards: number;
        averageRedCards: number;
    };
}
export interface CornersAnalysis {
    last5Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageCorners: number;
        averageCornersFor: number;
        averageCornersAgainst: number;
        firstHalfAverage?: number;
        secondHalfAverage?: number;
    };
    last10Matches: {
        matches: HistoricalMatch[];
        thresholds: ThresholdStatistics[];
        averageCorners: number;
        averageCornersFor: number;
        averageCornersAgainst: number;
        firstHalfAverage?: number;
        secondHalfAverage?: number;
    };
}
export interface TeamFormAnalysis {
    team: Team;
    homeForm?: {
        goals: GoalsAnalysis;
        cards: CardsAnalysis;
        corners: CornersAnalysis;
    };
    awayForm?: {
        goals: GoalsAnalysis;
        cards: CardsAnalysis;
        corners: CornersAnalysis;
    };
}
export interface HeadToHeadAnalysis {
    last5Meetings: {
        matches: HistoricalMatch[];
        homeTeamWins: number;
        awayTeamWins: number;
        draws: number;
        averageGoals: number;
        averageCards: number;
        averageCorners: number;
    };
    last10Meetings: {
        matches: HistoricalMatch[];
        homeTeamWins: number;
        awayTeamWins: number;
        draws: number;
        averageGoals: number;
        averageCards: number;
        averageCorners: number;
    };
    venueAnalysis?: {
        homeTeamHomeRecord: {
            wins: number;
            draws: number;
            losses: number;
            matches: HistoricalMatch[];
        };
        awayTeamAwayRecord: {
            wins: number;
            draws: number;
            losses: number;
            matches: HistoricalMatch[];
        };
    };
}
export interface LeagueContextAnalysis {
    league: League;
    standings?: {
        homeTeamPosition: number;
        awayTeamPosition: number;
        pointsGap: number;
        homeTeamPoints: number;
        awayTeamPoints: number;
    };
    averages: {
        goalsPerMatch: number;
        cardsPerMatch: number;
        cornersPerMatch: number;
    };
    homeAdvantage: {
        homeWinPercentage: number;
        awayWinPercentage: number;
        drawPercentage: number;
    };
}
export interface ExpectedStatistics {
    xG: {
        home: number;
        away: number;
        total: number;
    };
    xCorners?: {
        home: number;
        away: number;
        total: number;
    };
    xCards?: {
        home: number;
        away: number;
        total: number;
    };
    variance?: {
        xGVariance: number;
        actualVsExpectedGoals: number;
    };
}
export interface ComprehensiveMatchAnalysis {
    targetMatch: {
        homeTeam: Team;
        awayTeam: Team;
        league: League;
        date: string;
        referee?: RefereeStatistics;
    };
    homeTeamAnalysis: TeamFormAnalysis;
    awayTeamAnalysis: TeamFormAnalysis;
    headToHead: HeadToHeadAnalysis;
    leagueContext: LeagueContextAnalysis;
    expectedStatistics?: ExpectedStatistics;
    generatedAt: string;
    dataQuality: {
        completeness: number;
        reliability: number;
        freshness: number;
    };
}
export interface AnalysisRequest {
    homeTeamId: number;
    awayTeamId: number;
    leagueId?: number;
    matchDate?: string;
    includePlayerStats?: boolean;
    includeExpectedStats?: boolean;
    cacheResults?: boolean;
}
//# sourceMappingURL=MatchAnalysis.d.ts.map