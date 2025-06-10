"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CornersAnalysisService = void 0;
class CornersAnalysisService {
    constructor() {
        this.CORNERS_THRESHOLDS = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5];
    }
    analyzeCorners(matches, isHomeTeam = true) {
        const last5Matches = matches.slice(0, 5);
        const last10Matches = matches.slice(0, 10);
        return {
            last5Matches: this.analyzeMatchSet(last5Matches, isHomeTeam),
            last10Matches: this.analyzeMatchSet(last10Matches, isHomeTeam),
        };
    }
    analyzeMatchSet(matches, isHomeTeam) {
        const thresholds = this.calculateCornersThresholds(matches);
        const averageCorners = this.calculateAverageCorners(matches);
        const averageCornersFor = this.calculateAverageCornersFor(matches, isHomeTeam);
        const averageCornersAgainst = this.calculateAverageCornersAgainst(matches, isHomeTeam);
        const firstHalfAverage = this.calculateFirstHalfAverage(matches);
        const secondHalfAverage = this.calculateSecondHalfAverage(matches);
        return {
            matches,
            thresholds,
            averageCorners,
            averageCornersFor,
            averageCornersAgainst,
            firstHalfAverage,
            secondHalfAverage,
        };
    }
    calculateCornersThresholds(matches) {
        return this.CORNERS_THRESHOLDS.map(threshold => {
            const matchesOver = matches.filter(match => match.statistics.corners.total > threshold).length;
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
    calculateAverageCorners(matches) {
        if (matches.length === 0)
            return 0;
        const totalCorners = matches.reduce((sum, match) => sum + match.statistics.corners.total, 0);
        return parseFloat((totalCorners / matches.length).toFixed(2));
    }
    calculateAverageCornersFor(matches, isHomeTeam) {
        if (matches.length === 0)
            return 0;
        const totalCornersFor = matches.reduce((sum, match) => {
            const cornersFor = isHomeTeam ? match.statistics.corners.home : match.statistics.corners.away;
            return sum + cornersFor;
        }, 0);
        return parseFloat((totalCornersFor / matches.length).toFixed(2));
    }
    calculateAverageCornersAgainst(matches, isHomeTeam) {
        if (matches.length === 0)
            return 0;
        const totalCornersAgainst = matches.reduce((sum, match) => {
            const cornersAgainst = isHomeTeam ? match.statistics.corners.away : match.statistics.corners.home;
            return sum + cornersAgainst;
        }, 0);
        return parseFloat((totalCornersAgainst / matches.length).toFixed(2));
    }
    calculateFirstHalfAverage(matches) {
        const firstHalfMatches = matches.filter(match => match.statistics.corners.firstHalf);
        if (firstHalfMatches.length === 0)
            return 0;
        const totalFirstHalfCorners = firstHalfMatches.reduce((sum, match) => sum + (match.statistics.corners.firstHalf?.total || 0), 0);
        return parseFloat((totalFirstHalfCorners / firstHalfMatches.length).toFixed(2));
    }
    calculateSecondHalfAverage(matches) {
        const secondHalfMatches = matches.filter(match => match.statistics.corners.secondHalf);
        if (secondHalfMatches.length === 0)
            return 0;
        const totalSecondHalfCorners = secondHalfMatches.reduce((sum, match) => sum + (match.statistics.corners.secondHalf?.total || 0), 0);
        return parseFloat((totalSecondHalfCorners / secondHalfMatches.length).toFixed(2));
    }
    getCornersOverUnderStats(matches, thresholds = this.CORNERS_THRESHOLDS) {
        const stats = new Map();
        thresholds.forEach(threshold => {
            const matchesOver = matches.filter(match => match.statistics.corners.total > threshold).length;
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
    calculateTeamCornersStats(matches, isHomeTeam) {
        if (matches.length === 0) {
            return {
                averageCornersWon: 0,
                averageCornersConceeded: 0,
                cornersDominance: 'balanced',
                cornersEfficiency: {
                    highCornerGames: 0,
                    lowCornerGames: 0,
                },
            };
        }
        const teamCornersData = matches.map(match => ({
            cornersWon: isHomeTeam ? match.statistics.corners.home : match.statistics.corners.away,
            cornersConceeded: isHomeTeam ? match.statistics.corners.away : match.statistics.corners.home,
        }));
        const totalCornersWon = teamCornersData.reduce((sum, data) => sum + data.cornersWon, 0);
        const totalCornersConceeded = teamCornersData.reduce((sum, data) => sum + data.cornersConceeded, 0);
        const averageCornersWon = totalCornersWon / matches.length;
        const averageCornersConceeded = totalCornersConceeded / matches.length;
        const getDominance = (won, conceeded) => {
            const ratio = won / (conceeded || 1);
            if (ratio >= 1.5)
                return 'dominant';
            if (ratio <= 0.67)
                return 'weak';
            return 'balanced';
        };
        const highCornerGames = teamCornersData.filter(data => data.cornersWon >= 6).length;
        const lowCornerGames = teamCornersData.filter(data => data.cornersWon <= 2).length;
        return {
            averageCornersWon: parseFloat(averageCornersWon.toFixed(2)),
            averageCornersConceeded: parseFloat(averageCornersConceeded.toFixed(2)),
            cornersDominance: getDominance(averageCornersWon, averageCornersConceeded),
            cornersEfficiency: {
                highCornerGames,
                lowCornerGames,
            },
        };
    }
    analyzeCornersDistributionByHalf(matches) {
        const matchesWithHalfData = matches.filter(match => match.statistics.corners.firstHalf && match.statistics.corners.secondHalf);
        if (matchesWithHalfData.length === 0) {
            return {
                firstHalf: { averageTotal: 0, averageHome: 0, averageAway: 0, percentage: 0 },
                secondHalf: { averageTotal: 0, averageHome: 0, averageAway: 0, percentage: 0 },
                pattern: 'balanced',
            };
        }
        const firstHalfStats = matchesWithHalfData.reduce((acc, match) => {
            const fh = match.statistics.corners.firstHalf;
            acc.total += fh.total;
            acc.home += fh.home;
            acc.away += fh.away;
            return acc;
        }, { total: 0, home: 0, away: 0 });
        const secondHalfStats = matchesWithHalfData.reduce((acc, match) => {
            const sh = match.statistics.corners.secondHalf;
            acc.total += sh.total;
            acc.home += sh.home;
            acc.away += sh.away;
            return acc;
        }, { total: 0, home: 0, away: 0 });
        const totalCorners = firstHalfStats.total + secondHalfStats.total;
        const firstHalfPercentage = totalCorners > 0 ? (firstHalfStats.total / totalCorners) * 100 : 0;
        const secondHalfPercentage = totalCorners > 0 ? (secondHalfStats.total / totalCorners) * 100 : 0;
        const getPattern = (fhPerc, shPerc) => {
            if (fhPerc > 60)
                return 'first_half_heavy';
            if (shPerc > 60)
                return 'second_half_heavy';
            return 'balanced';
        };
        return {
            firstHalf: {
                averageTotal: parseFloat((firstHalfStats.total / matchesWithHalfData.length).toFixed(2)),
                averageHome: parseFloat((firstHalfStats.home / matchesWithHalfData.length).toFixed(2)),
                averageAway: parseFloat((firstHalfStats.away / matchesWithHalfData.length).toFixed(2)),
                percentage: parseFloat(firstHalfPercentage.toFixed(1)),
            },
            secondHalf: {
                averageTotal: parseFloat((secondHalfStats.total / matchesWithHalfData.length).toFixed(2)),
                averageHome: parseFloat((secondHalfStats.home / matchesWithHalfData.length).toFixed(2)),
                averageAway: parseFloat((secondHalfStats.away / matchesWithHalfData.length).toFixed(2)),
                percentage: parseFloat(secondHalfPercentage.toFixed(1)),
            },
            pattern: getPattern(firstHalfPercentage, secondHalfPercentage),
        };
    }
    analyzeHomeAwayAdvantage(matches) {
        if (matches.length === 0) {
            return {
                homeAdvantage: {
                    averageCornersHome: 0,
                    averageCornersAway: 0,
                    advantage: 0,
                    hasAdvantage: false,
                },
                venueEffect: {
                    homeTeamDominatesCorners: false,
                    averageDifference: 0,
                },
            };
        }
        const homeCorners = matches.reduce((sum, match) => sum + match.statistics.corners.home, 0);
        const awayCorners = matches.reduce((sum, match) => sum + match.statistics.corners.away, 0);
        const averageHome = homeCorners / matches.length;
        const averageAway = awayCorners / matches.length;
        const advantage = averageHome - averageAway;
        return {
            homeAdvantage: {
                averageCornersHome: parseFloat(averageHome.toFixed(2)),
                averageCornersAway: parseFloat(averageAway.toFixed(2)),
                advantage: parseFloat(advantage.toFixed(2)),
                hasAdvantage: advantage > 0.5,
            },
            venueEffect: {
                homeTeamDominatesCorners: advantage > 1.0,
                averageDifference: parseFloat(Math.abs(advantage).toFixed(2)),
            },
        };
    }
    calculateCornersToGoalsConversion(matches) {
        if (matches.length === 0) {
            return {
                homeTeam: { totalCorners: 0, totalGoals: 0, conversionRate: 0 },
                awayTeam: { totalCorners: 0, totalGoals: 0, conversionRate: 0 },
                overall: { totalCorners: 0, totalGoals: 0, conversionRate: 0 },
            };
        }
        const homeCorners = matches.reduce((sum, match) => sum + match.statistics.corners.home, 0);
        const awayCorners = matches.reduce((sum, match) => sum + match.statistics.corners.away, 0);
        const homeGoals = matches.reduce((sum, match) => sum + match.result.homeScore, 0);
        const awayGoals = matches.reduce((sum, match) => sum + match.result.awayScore, 0);
        const totalCorners = homeCorners + awayCorners;
        const totalGoals = homeGoals + awayGoals;
        return {
            homeTeam: {
                totalCorners: homeCorners,
                totalGoals: homeGoals,
                conversionRate: homeCorners > 0 ? parseFloat(((homeGoals / homeCorners) * 100).toFixed(1)) : 0,
            },
            awayTeam: {
                totalCorners: awayCorners,
                totalGoals: awayGoals,
                conversionRate: awayCorners > 0 ? parseFloat(((awayGoals / awayCorners) * 100).toFixed(1)) : 0,
            },
            overall: {
                totalCorners,
                totalGoals,
                conversionRate: totalCorners > 0 ? parseFloat(((totalGoals / totalCorners) * 100).toFixed(1)) : 0,
            },
        };
    }
}
exports.CornersAnalysisService = CornersAnalysisService;
exports.default = new CornersAnalysisService();
//# sourceMappingURL=cornersAnalysis.js.map