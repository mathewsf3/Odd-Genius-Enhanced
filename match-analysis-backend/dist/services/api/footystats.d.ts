import { HistoricalMatch } from '../../models/Match';
export interface FootyStatsApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface FootyStatsMatch {
    id: number;
    date: string;
    status: string;
    home_team: FootyStatsTeam;
    away_team: FootyStatsTeam;
    league: FootyStatsLeague;
    venue?: string;
    referee?: string;
    stats?: FootyStatsMatchStats;
    result?: {
        home_score: number;
        away_score: number;
        ht_score?: string;
    };
}
export interface FootyStatsTeam {
    id: number;
    name: string;
    short_name?: string;
    logo?: string;
    country?: string;
}
export interface FootyStatsLeague {
    id: number;
    name: string;
    country: string;
    season: string;
    logo?: string;
}
export interface FootyStatsMatchStats {
    corners?: {
        home: number;
        away: number;
        total: number;
        ht?: {
            home: number;
            away: number;
            total: number;
        };
    };
    cards?: {
        yellow_cards: {
            home: number;
            away: number;
            total: number;
        };
        red_cards: {
            home: number;
            away: number;
            total: number;
        };
        total_cards: {
            home: number;
            away: number;
            total: number;
        };
    };
    goals?: {
        home: number;
        away: number;
        total: number;
    };
    xg?: {
        home: number;
        away: number;
        total: number;
    };
}
export interface TeamFormRequest {
    teamId: number;
    matchType: 'home' | 'away' | 'all';
    limit: number;
    leagueId?: number;
    season?: string;
}
export interface HeadToHeadRequest {
    homeTeamId: number;
    awayTeamId: number;
    limit: number;
}
declare class FootyStatsService {
    private api;
    private rateLimitCounter;
    private rateLimitReset;
    constructor();
    private setupInterceptors;
    private checkRateLimit;
    private updateRateLimit;
    getTeamMatches(request: TeamFormRequest): Promise<HistoricalMatch[]>;
    getHeadToHeadMatches(request: HeadToHeadRequest): Promise<HistoricalMatch[]>;
    getLeagueStandings(leagueId: number, season?: string): Promise<any[]>;
    getRefereeStats(refereeId: number): Promise<any>;
    getLeagueAverages(leagueId: number, season?: string): Promise<any>;
    private transformMatches;
    private transformMatch;
    private transformTeam;
    private transformLeague;
    private normalizeStatus;
    private parseHalfTimeScore;
    private transformStatistics;
}
declare const _default: FootyStatsService;
export default _default;
//# sourceMappingURL=footystats.d.ts.map