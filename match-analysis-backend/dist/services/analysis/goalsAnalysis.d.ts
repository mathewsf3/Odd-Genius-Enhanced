import { HistoricalMatch } from '../../models/Match';
import { GoalsAnalysis, ThresholdStatistics } from '../../models/MatchAnalysis';
export declare class GoalsAnalysisService {
    private readonly GOALS_THRESHOLDS;
    analyzeGoals(matches: HistoricalMatch[], isHomeTeam?: boolean): GoalsAnalysis;
    private analyzeMatchSet;
    private calculateGoalsThresholds;
    private calculateAverageGoals;
    private calculateAverageGoalsFor;
    private calculateAverageGoalsAgainst;
    getGoalsOverUnderStats(matches: HistoricalMatch[], thresholds?: number[]): Map<number, ThresholdStatistics>;
    calculateBTTSStats(matches: HistoricalMatch[]): {
        bttsYes: number;
        bttsNo: number;
        bttsYesPercentage: number;
        bttsNoPercentage: number;
        totalMatches: number;
    };
    calculateHalfTimeGoalsStats(matches: HistoricalMatch[]): {
        firstHalf: {
            averageGoals: number;
            over05Percentage: number;
            over15Percentage: number;
        };
        secondHalf: {
            averageGoals: number;
            over05Percentage: number;
            over15Percentage: number;
        };
    };
    identifyGoalPatterns(matches: HistoricalMatch[]): {
        highScoring: number;
        lowScoring: number;
        averageScoring: number;
        cleanSheets: number;
        goalFests: number;
    };
}
declare const _default: GoalsAnalysisService;
export default _default;
//# sourceMappingURL=goalsAnalysis.d.ts.map