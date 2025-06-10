import { HistoricalMatch } from '../../models/Match';
import { CardsAnalysis, ThresholdStatistics } from '../../models/MatchAnalysis';
export declare class CardsAnalysisService {
    private readonly CARDS_THRESHOLDS;
    analyzeCards(matches: HistoricalMatch[], isHomeTeam?: boolean): CardsAnalysis;
    private analyzeMatchSet;
    private calculateCardsThresholds;
    private calculateAverageCards;
    private calculateAverageYellowCards;
    private calculateAverageRedCards;
    getCardsOverUnderStats(matches: HistoricalMatch[], thresholds?: number[]): Map<number, ThresholdStatistics>;
    calculateTeamCardsStats(matches: HistoricalMatch[], isHomeTeam: boolean): {
        averageCardsReceived: number;
        averageYellowCardsReceived: number;
        averageRedCardsReceived: number;
        disciplinaryRecord: {
            cleanGames: number;
            heavilyBooked: number;
            redCardGames: number;
        };
    };
    calculateRefereeInfluencedStats(matches: HistoricalMatch[]): {
        strictRefereeGames: number;
        lenientRefereeGames: number;
        averageCardsPerReferee: Map<string, number>;
        mostStrictReferees: Array<{
            name: string;
            averageCards: number;
            games: number;
        }>;
    };
    analyzeCardsDistribution(matches: HistoricalMatch[]): {
        homeTeamCards: {
            average: number;
            pattern: 'aggressive' | 'disciplined' | 'average';
        };
        awayTeamCards: {
            average: number;
            pattern: 'aggressive' | 'disciplined' | 'average';
        };
        homeAdvantage: {
            homeTeamReceivesFewerCards: boolean;
            cardsDifference: number;
        };
    };
    analyzeCardsTiming(matches: HistoricalMatch[]): {
        firstHalfCards: number;
        secondHalfCards: number;
        firstHalfPercentage: number;
        secondHalfPercentage: number;
        lateCards: number;
    };
}
declare const _default: CardsAnalysisService;
export default _default;
//# sourceMappingURL=cardsAnalysis.d.ts.map