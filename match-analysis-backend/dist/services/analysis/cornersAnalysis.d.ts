import { HistoricalMatch } from '../../models/Match';
import { CornersAnalysis, ThresholdStatistics } from '../../models/MatchAnalysis';
export declare class CornersAnalysisService {
    private readonly CORNERS_THRESHOLDS;
    analyzeCorners(matches: HistoricalMatch[], isHomeTeam?: boolean): CornersAnalysis;
    private analyzeMatchSet;
    private calculateCornersThresholds;
    private calculateAverageCorners;
    private calculateAverageCornersFor;
    private calculateAverageCornersAgainst;
    private calculateFirstHalfAverage;
    private calculateSecondHalfAverage;
    getCornersOverUnderStats(matches: HistoricalMatch[], thresholds?: number[]): Map<number, ThresholdStatistics>;
    calculateTeamCornersStats(matches: HistoricalMatch[], isHomeTeam: boolean): {
        averageCornersWon: number;
        averageCornersConceeded: number;
        cornersDominance: 'dominant' | 'balanced' | 'weak';
        cornersEfficiency: {
            highCornerGames: number;
            lowCornerGames: number;
        };
    };
    analyzeCornersDistributionByHalf(matches: HistoricalMatch[]): {
        firstHalf: {
            averageTotal: number;
            averageHome: number;
            averageAway: number;
            percentage: number;
        };
        secondHalf: {
            averageTotal: number;
            averageHome: number;
            averageAway: number;
            percentage: number;
        };
        pattern: 'first_half_heavy' | 'second_half_heavy' | 'balanced';
    };
    analyzeHomeAwayAdvantage(matches: HistoricalMatch[]): {
        homeAdvantage: {
            averageCornersHome: number;
            averageCornersAway: number;
            advantage: number;
            hasAdvantage: boolean;
        };
        venueEffect: {
            homeTeamDominatesCorners: boolean;
            averageDifference: number;
        };
    };
    calculateCornersToGoalsConversion(matches: HistoricalMatch[]): {
        homeTeam: {
            totalCorners: number;
            totalGoals: number;
            conversionRate: number;
        };
        awayTeam: {
            totalCorners: number;
            totalGoals: number;
            conversionRate: number;
        };
        overall: {
            totalCorners: number;
            totalGoals: number;
            conversionRate: number;
        };
    };
}
declare const _default: CornersAnalysisService;
export default _default;
//# sourceMappingURL=cornersAnalysis.d.ts.map