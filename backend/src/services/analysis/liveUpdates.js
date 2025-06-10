const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
// REMOVED: Legacy API service - Use FootyStats API only
// const { getAllSportsApi } = require('../allSportsApiService');

const CACHE_TTL = 30; // 30 seconds for live match data
const CACHE_KEY_PREFIX = 'live_match_';

class LiveMatchUpdatesService {
    constructor() {
        this.subscribers = new Map(); // matchId -> Set of socket connections
    }

    async getLiveMatchData(matchId) {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${matchId}`;
            const cachedData = cache.get(cacheKey);
            
            if (cachedData) {
                return cachedData;
            }

            const api = getAllSportsApi();
            const [matchDetails, events, statistics] = await Promise.all([
                api.getMatchDetails(matchId),
                api.getMatchEvents(matchId),
                api.getMatchStatistics(matchId)
            ]);

            const liveData = {
                status: matchDetails.status,
                score: {
                    home: matchDetails.homeScore,
                    away: matchDetails.awayScore
                },
                time: matchDetails.time,
                events: this.processEvents(events),
                stats: this.processStatistics(statistics),
                lastUpdated: new Date().toISOString()
            };

            cache.set(cacheKey, liveData, CACHE_TTL);
            return liveData;
        } catch (error) {
            logger.error(`Error fetching live match data for match ${matchId}: ${error.message}`);
            throw error;
        }
    }

    processEvents(events) {
        return events.map(event => ({
            type: event.type,
            minute: event.minute,
            team: event.team,
            player: event.player,
            additionalInfo: event.additionalInfo
        }));
    }

    processStatistics(statistics) {
        return {
            possession: {
                home: statistics.possession?.home || 0,
                away: statistics.possession?.away || 0
            },
            shots: {
                home: statistics.shots?.home || 0,
                away: statistics.shots?.away || 0
            },
            shotsOnTarget: {
                home: statistics.shotsOnTarget?.home || 0,
                away: statistics.shotsOnTarget?.away || 0
            },
            corners: {
                home: statistics.corners?.home || 0,
                away: statistics.corners?.away || 0
            },
            fouls: {
                home: statistics.fouls?.home || 0,
                away: statistics.fouls?.away || 0
            }
        };
    }

    subscribeToMatch(matchId, socket) {
        if (!this.subscribers.has(matchId)) {
            this.subscribers.set(matchId, new Set());
        }
        this.subscribers.get(matchId).add(socket);
        
        // Set up automatic updates
        this.startUpdates(matchId);
    }

    unsubscribeFromMatch(matchId, socket) {
        const matchSubscribers = this.subscribers.get(matchId);
        if (matchSubscribers) {
            matchSubscribers.delete(socket);
            if (matchSubscribers.size === 0) {
                this.subscribers.delete(matchId);
                this.stopUpdates(matchId);
            }
        }
    }

    startUpdates(matchId) {
        if (!this.updateIntervals) {
            this.updateIntervals = new Map();
        }

        if (!this.updateIntervals.has(matchId)) {
            const interval = setInterval(async () => {
                try {
                    const liveData = await this.getLiveMatchData(matchId);
                    this.broadcastUpdate(matchId, liveData);
                } catch (error) {
                    logger.error(`Error updating live match data for match ${matchId}: ${error.message}`);
                }
            }, CACHE_TTL * 1000);

            this.updateIntervals.set(matchId, interval);
        }
    }

    stopUpdates(matchId) {
        if (this.updateIntervals?.has(matchId)) {
            clearInterval(this.updateIntervals.get(matchId));
            this.updateIntervals.delete(matchId);
        }
    }

    broadcastUpdate(matchId, data) {
        const subscribers = this.subscribers.get(matchId);
        if (subscribers) {
            subscribers.forEach(socket => {
                if (socket.connected) {
                    socket.emit('matchUpdate', data);
                }
            });
        }
    }
}

module.exports = new LiveMatchUpdatesService();
