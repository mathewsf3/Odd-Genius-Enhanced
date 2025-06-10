import { HistoricalMatch } from '../../models/Match';
import { GoalsAnalysis, ThresholdStatistics } from '../../models/MatchAnalysis';
import logger from '../../utils/logger';

export class GoalsAnalysisService {
  private readonly GOALS_THRESHOLDS = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

  /**
   * Analyze goals data for a team's matches
   */
  analyzeGoals(matches: HistoricalMatch[], isHomeTeam: boolean = true): GoalsAnalysis {
    const last5Matches = matches.slice(0, 5);
    const last10Matches = matches.slice(0, 10);

    return {
      last5Matches: this.analyzeMatchSet(last5Matches, isHomeTeam),
      last10Matches: this.analyzeMatchSet(last10Matches, isHomeTeam),
    };
  }

  private analyzeMatchSet(matches: HistoricalMatch[], isHomeTeam: boolean) {
    const thresholds = this.calculateGoalsThresholds(matches);
    const averageGoals = this.calculateAverageGoals(matches);
    const averageGoalsFor = this.calculateAverageGoalsFor(matches, isHomeTeam);
    const averageGoalsAgainst = this.calculateAverageGoalsAgainst(matches, isHomeTeam);

    return {
      matches,
      thresholds,
      averageGoals,
      averageGoalsFor,
      averageGoalsAgainst,
    };
  }

  private calculateGoalsThresholds(matches: HistoricalMatch[]): ThresholdStatistics[] {
    return this.GOALS_THRESHOLDS.map(threshold => {
      const matchesOver = matches.filter(match => match.result.totalGoals > threshold).length;
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

  private calculateAverageGoals(matches: HistoricalMatch[]): number {
    if (matches.length === 0) return 0;
    const totalGoals = matches.reduce((sum, match) => sum + match.result.totalGoals, 0);
    return parseFloat((totalGoals / matches.length).toFixed(2));
  }

  private calculateAverageGoalsFor(matches: HistoricalMatch[], isHomeTeam: boolean): number {
    if (matches.length === 0) return 0;
    
    const totalGoalsFor = matches.reduce((sum, match) => {
      // Determine if the team we're analyzing is home or away in this match
      const goalsFor = isHomeTeam ? match.result.homeScore : match.result.awayScore;
      return sum + goalsFor;
    }, 0);

    return parseFloat((totalGoalsFor / matches.length).toFixed(2));
  }

  private calculateAverageGoalsAgainst(matches: HistoricalMatch[], isHomeTeam: boolean): number {
    if (matches.length === 0) return 0;
    
    const totalGoalsAgainst = matches.reduce((sum, match) => {
      // Determine goals conceded based on team position
      const goalsAgainst = isHomeTeam ? match.result.awayScore : match.result.homeScore;
      return sum + goalsAgainst;
    }, 0);

    return parseFloat((totalGoalsAgainst / matches.length).toFixed(2));
  }

  /**
   * Get goals statistics for specific thresholds
   */
  getGoalsOverUnderStats(matches: HistoricalMatch[], thresholds: number[] = this.GOALS_THRESHOLDS): Map<number, ThresholdStatistics> {
    const stats = new Map<number, ThresholdStatistics>();

    thresholds.forEach(threshold => {
      const matchesOver = matches.filter(match => match.result.totalGoals > threshold).length;
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

  /**
   * Calculate BTTS (Both Teams To Score) statistics
   */
  calculateBTTSStats(matches: HistoricalMatch[]): {
    bttsYes: number;
    bttsNo: number;
    bttsYesPercentage: number;
    bttsNoPercentage: number;
    totalMatches: number;
  } {
    const bttsYes = matches.filter(match => 
      match.result.homeScore > 0 && match.result.awayScore > 0
    ).length;
    const bttsNo = matches.length - bttsYes;
    const totalMatches = matches.length;

    return {
      bttsYes,
      bttsNo,
      bttsYesPercentage: totalMatches > 0 ? (bttsYes / totalMatches) * 100 : 0,
      bttsNoPercentage: totalMatches > 0 ? (bttsNo / totalMatches) * 100 : 0,
      totalMatches,
    };
  }

  /**
   * Calculate first/second half goals statistics
   */
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
  } {
    const firstHalfGoals = matches
      .filter(match => match.result.halfTimeScore)
      .map(match => match.result.halfTimeScore!.home + match.result.halfTimeScore!.away);

    const secondHalfGoals = matches
      .filter(match => match.result.halfTimeScore)
      .map(match => {
        const htTotal = match.result.halfTimeScore!.home + match.result.halfTimeScore!.away;
        return match.result.totalGoals - htTotal;
      });

    return {
      firstHalf: {
        averageGoals: firstHalfGoals.length > 0 
          ? parseFloat((firstHalfGoals.reduce((a, b) => a + b, 0) / firstHalfGoals.length).toFixed(2))
          : 0,
        over05Percentage: firstHalfGoals.length > 0
          ? (firstHalfGoals.filter(goals => goals > 0.5).length / firstHalfGoals.length) * 100
          : 0,
        over15Percentage: firstHalfGoals.length > 0
          ? (firstHalfGoals.filter(goals => goals > 1.5).length / firstHalfGoals.length) * 100
          : 0,
      },
      secondHalf: {
        averageGoals: secondHalfGoals.length > 0
          ? parseFloat((secondHalfGoals.reduce((a, b) => a + b, 0) / secondHalfGoals.length).toFixed(2))
          : 0,
        over05Percentage: secondHalfGoals.length > 0
          ? (secondHalfGoals.filter(goals => goals > 0.5).length / secondHalfGoals.length) * 100
          : 0,
        over15Percentage: secondHalfGoals.length > 0
          ? (secondHalfGoals.filter(goals => goals > 1.5).length / secondHalfGoals.length) * 100
          : 0,
      },
    };
  }

  /**
   * Identify goals scoring patterns
   */
  identifyGoalPatterns(matches: HistoricalMatch[]): {
    highScoring: number; // matches with 3+ goals
    lowScoring: number;  // matches with 0-1 goals
    averageScoring: number; // matches with 2 goals
    cleanSheets: number; // matches with at least one team not scoring
    goalFests: number; // matches with 4+ goals
  } {
    return {
      highScoring: matches.filter(m => m.result.totalGoals >= 3).length,
      lowScoring: matches.filter(m => m.result.totalGoals <= 1).length,
      averageScoring: matches.filter(m => m.result.totalGoals === 2).length,
      cleanSheets: matches.filter(m => m.result.homeScore === 0 || m.result.awayScore === 0).length,
      goalFests: matches.filter(m => m.result.totalGoals >= 4).length,
    };
  }
}

export default new GoalsAnalysisService();
