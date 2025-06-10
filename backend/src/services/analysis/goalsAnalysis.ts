import { GoalsAnalysis } from '../../models/MatchAnalysis';

export class GoalsAnalysisService {
  /**
   * Analyze goals data for different thresholds
   */
  analyzeGoals(
    homeTeamLast5Home: any[],
    homeTeamLast10Home: any[],
    awayTeamLast5Away: any[],
    awayTeamLast10Away: any[],
    h2hLast5: any[],
    h2hLast10: any[]
  ): GoalsAnalysis {
    // Define thresholds to analyze
    const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    
    const result: GoalsAnalysis = {
      thresholds: {}
    };
    
    thresholds.forEach(threshold => {
      result.thresholds[threshold.toString()] = {
        homeTeam: {
          last5Home: this.analyzeTeamGoalsThreshold(homeTeamLast5Home, threshold),
          last10Home: this.analyzeTeamGoalsThreshold(homeTeamLast10Home, threshold)
        },
        awayTeam: {
          last5Away: this.analyzeTeamGoalsThreshold(awayTeamLast5Away, threshold),
          last10Away: this.analyzeTeamGoalsThreshold(awayTeamLast10Away, threshold)
        },
        h2h: {
          last5: this.analyzeTeamGoalsThreshold(h2hLast5, threshold),
          last10: this.analyzeTeamGoalsThreshold(h2hLast10, threshold)
        }
      };
    });
    
    return result;
  }
  
  private analyzeTeamGoalsThreshold(matches: any[], threshold: number) {
    let over = 0;
    let under = 0;
    
    matches.forEach(match => {
      const totalGoals = (match.homeScore || 0) + (match.awayScore || 0);
      if (totalGoals > threshold) {
        over++;
      } else {
        under++;
      }
    });
    
    const total = matches.length;
    const overPercentage = total > 0 ? (over / total) * 100 : 0;
    const underPercentage = total > 0 ? (under / total) * 100 : 0;
    
    return {
      over,
      under,
      percentage: {
        over: Math.round(overPercentage * 100) / 100,
        under: Math.round(underPercentage * 100) / 100
      }
    };
  }
}

export const goalsAnalysisService = new GoalsAnalysisService();