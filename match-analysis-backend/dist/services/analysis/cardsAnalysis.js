"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsAnalysisService = void 0;
class CardsAnalysisService {
    constructor() {
        this.CARDS_THRESHOLDS = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    }
    analyzeCards(matches, isHomeTeam = true) {
        const last5Matches = matches.slice(0, 5);
        const last10Matches = matches.slice(0, 10);
        return {
            last5Matches: this.analyzeMatchSet(last5Matches, isHomeTeam),
            last10Matches: this.analyzeMatchSet(last10Matches, isHomeTeam),
        };
    }
    analyzeMatchSet(matches, isHomeTeam) {
        const thresholds = this.calculateCardsThresholds(matches);
        const averageCards = this.calculateAverageCards(matches);
        const averageYellowCards = this.calculateAverageYellowCards(matches);
        const averageRedCards = this.calculateAverageRedCards(matches);
        return {
            matches,
            thresholds,
            averageCards,
            averageYellowCards,
            averageRedCards,
        };
    }
    calculateCardsThresholds(matches) {
        return this.CARDS_THRESHOLDS.map(threshold => {
            const matchesOver = matches.filter(match => match.statistics.cards.total.total > threshold).length;
            const matchesUnder = matches.length - matchesOver;
            const totalMatches = matches.length;
            return {
                threshold,
                matchesOver,
                matchesUnder,
                totalMatches,
                overPercentage: totalMatches > 0 ? (matchesOver / totalMatches) * 100 : 0,
                underPercentage: totalMatches > 0 ? (matchesUnder / totalMatches) * 100 : 0,
            };
        });
    }
    calculateAverageCards(matches) {
        if (matches.length === 0)
            return 0;
        const totalCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.total, 0);
        return parseFloat((totalCards / matches.length).toFixed(2));
    }
    calculateAverageYellowCards(matches) {
        if (matches.length === 0)
            return 0;
        const totalYellowCards = matches.reduce((sum, match) => sum + match.statistics.cards.yellow.total, 0);
        return parseFloat((totalYellowCards / matches.length).toFixed(2));
    }
    calculateAverageRedCards(matches) {
        if (matches.length === 0)
            return 0;
        const totalRedCards = matches.reduce((sum, match) => sum + match.statistics.cards.red.total, 0);
        return parseFloat((totalRedCards / matches.length).toFixed(2));
    }
    getCardsOverUnderStats(matches, thresholds = this.CARDS_THRESHOLDS) {
        const stats = new Map();
        thresholds.forEach(threshold => {
            const matchesOver = matches.filter(match => match.statistics.cards.total.total > threshold).length;
            const matchesUnder = matches.length - matchesOver;
            const totalMatches = matches.length;
            stats.set(threshold, {
                threshold,
                matchesOver,
                matchesUnder,
                totalMatches,
                overPercentage: totalMatches > 0 ? (matchesOver / totalMatches) * 100 : 0,
                underPercentage: totalMatches > 0 ? (matchesUnder / totalMatches) * 100 : 0,
            });
        });
        return stats;
    }
    calculateTeamCardsStats(matches, isHomeTeam) {
        if (matches.length === 0) {
            return {
                averageCardsReceived: 0,
                averageYellowCardsReceived: 0,
                averageRedCardsReceived: 0,
                disciplinaryRecord: {
                    cleanGames: 0,
                    heavilyBooked: 0,
                    redCardGames: 0,
                },
            };
        }
        const teamCardsData = matches.map(match => ({
            totalCards: isHomeTeam ? match.statistics.cards.total.home : match.statistics.cards.total.away,
            yellowCards: isHomeTeam ? match.statistics.cards.yellow.home : match.statistics.cards.yellow.away,
            redCards: isHomeTeam ? match.statistics.cards.red.home : match.statistics.cards.red.away,
        }));
        const totalCards = teamCardsData.reduce((sum, data) => sum + data.totalCards, 0);
        const totalYellowCards = teamCardsData.reduce((sum, data) => sum + data.yellowCards, 0);
        const totalRedCards = teamCardsData.reduce((sum, data) => sum + data.redCards, 0);
        const cleanGames = teamCardsData.filter(data => data.totalCards === 0).length;
        const heavilyBooked = teamCardsData.filter(data => data.totalCards >= 3).length;
        const redCardGames = teamCardsData.filter(data => data.redCards > 0).length;
        return {
            averageCardsReceived: parseFloat((totalCards / matches.length).toFixed(2)),
            averageYellowCardsReceived: parseFloat((totalYellowCards / matches.length).toFixed(2)),
            averageRedCardsReceived: parseFloat((totalRedCards / matches.length).toFixed(2)),
            disciplinaryRecord: {
                cleanGames,
                heavilyBooked,
                redCardGames,
            },
        };
    }
    calculateRefereeInfluencedStats(matches) {
        const refereeStats = new Map();
        matches.forEach(match => {
            if (match.referee?.name) {
                const refName = match.referee.name;
                const totalCards = match.statistics.cards.total.total;
                if (!refereeStats.has(refName)) {
                    refereeStats.set(refName, { totalCards: 0, games: 0 });
                }
                const current = refereeStats.get(refName);
                current.totalCards += totalCards;
                current.games += 1;
            }
        });
        const averageCardsPerReferee = new Map();
        const mostStrictReferees = [];
        refereeStats.forEach((stats, refName) => {
            const average = stats.totalCards / stats.games;
            averageCardsPerReferee.set(refName, parseFloat(average.toFixed(2)));
            if (stats.games >= 2) {
                mostStrictReferees.push({
                    name: refName,
                    averageCards: parseFloat(average.toFixed(2)),
                    games: stats.games,
                });
            }
        });
        mostStrictReferees.sort((a, b) => b.averageCards - a.averageCards);
        return {
            strictRefereeGames: matches.filter(match => match.statistics.cards.total.total >= 4).length,
            lenientRefereeGames: matches.filter(match => match.statistics.cards.total.total <= 1).length,
            averageCardsPerReferee,
            mostStrictReferees: mostStrictReferees.slice(0, 5),
        };
    }
    analyzeCardsDistribution(matches) {
        if (matches.length === 0) {
            return {
                homeTeamCards: { average: 0, pattern: 'average' },
                awayTeamCards: { average: 0, pattern: 'average' },
                homeAdvantage: { homeTeamReceivesFewerCards: false, cardsDifference: 0 },
            };
        }
        const homeCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.home, 0);
        const awayCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.away, 0);
        const homeAverage = homeCards / matches.length;
        const awayAverage = awayCards / matches.length;
        const getPattern = (average) => {
            if (average >= 2.5)
                return 'aggressive';
            if (average <= 1.0)
                return 'disciplined';
            return 'average';
        };
        return {
            homeTeamCards: {
                average: parseFloat(homeAverage.toFixed(2)),
                pattern: getPattern(homeAverage),
            },
            awayTeamCards: {
                average: parseFloat(awayAverage.toFixed(2)),
                pattern: getPattern(awayAverage),
            },
            homeAdvantage: {
                homeTeamReceivesFewerCards: homeAverage < awayAverage,
                cardsDifference: parseFloat((awayAverage - homeAverage).toFixed(2)),
            },
        };
    }
    analyzeCardsTiming(matches) {
        const totalCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.total, 0);
        return {
            firstHalfCards: Math.round(totalCards * 0.4),
            secondHalfCards: Math.round(totalCards * 0.6),
            firstHalfPercentage: 40,
            secondHalfPercentage: 60,
            lateCards: Math.round(totalCards * 0.2),
        };
    }
}
exports.CardsAnalysisService = CardsAnalysisService;
exports.default = new CardsAnalysisService();
//# sourceMappingURL=cardsAnalysis.js.map