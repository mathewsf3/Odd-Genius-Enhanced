"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config/config"));
const logger_1 = __importDefault(require("../../utils/logger"));
const redis_1 = __importDefault(require("../cache/redis"));
class FootyStatsService {
    constructor() {
        this.rateLimitCounter = new Map();
        this.rateLimitReset = new Map();
        this.api = axios_1.default.create({
            baseURL: config_1.default.api.footystats.baseUrl,
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.api.interceptors.request.use(async (requestConfig) => {
            requestConfig.params = {
                ...requestConfig.params,
                key: config_1.default.api.footystats.key,
            };
            await this.checkRateLimit();
            logger_1.default.debug(`FootyStats API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
                params: requestConfig.params,
            });
            return requestConfig;
        }, (error) => {
            logger_1.default.error('FootyStats API Request Error:', error);
            return Promise.reject(error);
        });
        this.api.interceptors.response.use((response) => {
            logger_1.default.debug(`FootyStats API Response: ${response.status} ${response.config.url}`);
            this.updateRateLimit(response);
            return response;
        }, (error) => {
            if (error.response) {
                logger_1.default.error(`FootyStats API Error: ${error.response.status} ${error.response.statusText}`, {
                    url: error.config?.url,
                    data: error.response.data,
                });
            }
            else {
                logger_1.default.error('FootyStats API Network Error:', error.message);
            }
            return Promise.reject(error);
        });
    }
    async checkRateLimit() {
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const currentCount = this.rateLimitCounter.get(minute.toString()) || 0;
        if (currentCount >= config_1.default.api.footystats.rateLimit.requestsPerMinute) {
            const waitTime = 60000 - (now % 60000);
            logger_1.default.warn(`Rate limit reached, waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.rateLimitCounter.set(minute.toString(), currentCount + 1);
    }
    updateRateLimit(response) {
        const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
        const rateLimitReset = response.headers['x-ratelimit-reset'];
        if (rateLimitRemaining !== undefined) {
            logger_1.default.debug(`Rate limit remaining: ${rateLimitRemaining}`);
        }
        if (rateLimitReset !== undefined) {
            const resetTime = parseInt(rateLimitReset) * 1000;
            this.rateLimitReset.set('current', resetTime);
        }
    }
    async getTeamMatches(request) {
        const cacheKey = `team_matches_${request.teamId}_${request.matchType}_${request.limit}_${request.leagueId || 'all'}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Cache hit for team matches: ${cacheKey}`);
            return cached;
        }
        try {
            const response = await this.api.get('/team/matches', {
                params: {
                    team_id: request.teamId,
                    match_type: request.matchType,
                    limit: request.limit,
                    league_id: request.leagueId,
                    season: request.season,
                    include_stats: true,
                },
            });
            const matches = this.transformMatches(response.data.matches || []);
            await redis_1.default.set(cacheKey, matches, 900);
            logger_1.default.info(`Fetched ${matches.length} matches for team ${request.teamId}`);
            return matches;
        }
        catch (error) {
            logger_1.default.error(`Failed to fetch team matches for team ${request.teamId}:`, error);
            throw error;
        }
    }
    async getHeadToHeadMatches(request) {
        const cacheKey = `h2h_${request.homeTeamId}_${request.awayTeamId}_${request.limit}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Cache hit for H2H matches: ${cacheKey}`);
            return cached;
        }
        try {
            const response = await this.api.get('/head-to-head', {
                params: {
                    home_team_id: request.homeTeamId,
                    away_team_id: request.awayTeamId,
                    limit: request.limit,
                    include_stats: true,
                },
            });
            const matches = this.transformMatches(response.data.matches || []);
            await redis_1.default.set(cacheKey, matches, 1800);
            logger_1.default.info(`Fetched ${matches.length} H2H matches between teams ${request.homeTeamId} and ${request.awayTeamId}`);
            return matches;
        }
        catch (error) {
            logger_1.default.error(`Failed to fetch H2H matches:`, error);
            throw error;
        }
    }
    async getLeagueStandings(leagueId, season) {
        const cacheKey = `league_standings_${leagueId}_${season || 'current'}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Cache hit for league standings: ${cacheKey}`);
            return cached;
        }
        try {
            const response = await this.api.get('/league/standings', {
                params: {
                    league_id: leagueId,
                    season,
                },
            });
            const standings = response.data.standings || [];
            await redis_1.default.set(cacheKey, standings, 3600);
            logger_1.default.info(`Fetched standings for league ${leagueId}`);
            return standings;
        }
        catch (error) {
            logger_1.default.error(`Failed to fetch league standings for league ${leagueId}:`, error);
            throw error;
        }
    }
    async getRefereeStats(refereeId) {
        const cacheKey = `referee_stats_${refereeId}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Cache hit for referee stats: ${cacheKey}`);
            return cached;
        }
        try {
            const response = await this.api.get('/referee/stats', {
                params: {
                    referee_id: refereeId,
                },
            });
            const stats = response.data;
            await redis_1.default.set(cacheKey, stats, 86400);
            logger_1.default.info(`Fetched stats for referee ${refereeId}`);
            return stats;
        }
        catch (error) {
            logger_1.default.error(`Failed to fetch referee stats for referee ${refereeId}:`, error);
            throw error;
        }
    }
    async getLeagueAverages(leagueId, season) {
        const cacheKey = `league_averages_${leagueId}_${season || 'current'}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Cache hit for league averages: ${cacheKey}`);
            return cached;
        }
        try {
            const response = await this.api.get('/league/averages', {
                params: {
                    league_id: leagueId,
                    season,
                },
            });
            const averages = response.data;
            await redis_1.default.set(cacheKey, averages, 14400);
            logger_1.default.info(`Fetched averages for league ${leagueId}`);
            return averages;
        }
        catch (error) {
            logger_1.default.error(`Failed to fetch league averages for league ${leagueId}:`, error);
            throw error;
        }
    }
    transformMatches(footyStatsMatches) {
        return footyStatsMatches.map(match => this.transformMatch(match));
    }
    transformMatch(footyStatsMatch) {
        return {
            id: footyStatsMatch.id,
            homeTeam: this.transformTeam(footyStatsMatch.home_team),
            awayTeam: this.transformTeam(footyStatsMatch.away_team),
            league: this.transformLeague(footyStatsMatch.league),
            date: footyStatsMatch.date,
            status: this.normalizeStatus(footyStatsMatch.status),
            venue: footyStatsMatch.venue,
            referee: footyStatsMatch.referee ? { name: footyStatsMatch.referee } : undefined,
            season: footyStatsMatch.league.season,
            result: footyStatsMatch.result ? {
                homeScore: footyStatsMatch.result.home_score,
                awayScore: footyStatsMatch.result.away_score,
                totalGoals: footyStatsMatch.result.home_score + footyStatsMatch.result.away_score,
                halfTimeScore: footyStatsMatch.result.ht_score ? this.parseHalfTimeScore(footyStatsMatch.result.ht_score) : undefined,
            } : {
                homeScore: 0,
                awayScore: 0,
                totalGoals: 0,
            },
            statistics: this.transformStatistics(footyStatsMatch.stats),
        };
    }
    transformTeam(footyStatsTeam) {
        return {
            id: footyStatsTeam.id,
            name: footyStatsTeam.name,
            shortName: footyStatsTeam.short_name,
            logo: footyStatsTeam.logo,
            country: footyStatsTeam.country || '',
            league: {
                id: 0,
                name: '',
                country: footyStatsTeam.country || '',
                season: '',
            },
        };
    }
    transformLeague(footyStatsLeague) {
        return {
            id: footyStatsLeague.id,
            name: footyStatsLeague.name,
            country: footyStatsLeague.country,
            season: footyStatsLeague.season,
            logo: footyStatsLeague.logo,
        };
    }
    normalizeStatus(status) {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('finished') || lowerStatus.includes('ft'))
            return 'finished';
        if (lowerStatus.includes('live') || lowerStatus.includes('playing'))
            return 'live';
        if (lowerStatus.includes('postponed'))
            return 'postponed';
        if (lowerStatus.includes('cancelled') || lowerStatus.includes('canceled'))
            return 'cancelled';
        return 'scheduled';
    }
    parseHalfTimeScore(htScore) {
        const parts = htScore.split('-');
        return {
            home: parseInt(parts[0] || '0', 10),
            away: parseInt(parts[1] || '0', 10),
        };
    }
    transformStatistics(stats) {
        if (!stats) {
            return {
                corners: { home: 0, away: 0, total: 0 },
                cards: {
                    yellow: { home: 0, away: 0, total: 0 },
                    red: { home: 0, away: 0, total: 0 },
                    total: { home: 0, away: 0, total: 0 },
                },
            };
        }
        return {
            corners: {
                home: stats.corners?.home || 0,
                away: stats.corners?.away || 0,
                total: stats.corners?.total || 0,
                firstHalf: stats.corners?.ht ? {
                    home: stats.corners.ht.home,
                    away: stats.corners.ht.away,
                    total: stats.corners.ht.total,
                } : undefined,
            },
            cards: {
                yellow: {
                    home: stats.cards?.yellow_cards.home || 0,
                    away: stats.cards?.yellow_cards.away || 0,
                    total: stats.cards?.yellow_cards.total || 0,
                },
                red: {
                    home: stats.cards?.red_cards.home || 0,
                    away: stats.cards?.red_cards.away || 0,
                    total: stats.cards?.red_cards.total || 0,
                },
                total: {
                    home: stats.cards?.total_cards.home || 0,
                    away: stats.cards?.total_cards.away || 0,
                    total: stats.cards?.total_cards.total || 0,
                },
            },
            xG: stats.xg ? {
                home: stats.xg.home,
                away: stats.xg.away,
                total: stats.xg.total,
            } : undefined,
        };
    }
}
exports.default = new FootyStatsService();
//# sourceMappingURL=footystats.js.map