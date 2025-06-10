import { CornersAnalysis } from '../../models/MatchAnalysis';

export class CornersAnalysisService {
  /**
   * Analyze corners data for different thresholds
   */
  analyzeCorners(
    homeTeamLast5Home: any[],
    homeTeamLast10Home: any[],
    awayTeamLast5Away: any[],
    awayTeamLast10Away: any[],
    h2hLast5: any[],
    h2hLast10: any[]
  ): CornersAnalysis {
    // Define thresholds to analyze
    const thresholds = [6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5];
    
    const result: CornersAnalysis = {
      thresholds: {}
    };
    
    thresholds.forEach(threshold => {
      result.thresholds[threshold.toString()] = {
        total: {
          homeTeam: {
            last5Home: this.analyzeTeamCornersThreshold(homeTeamLast5Home, threshold, 'total'),
            last10Home: this.analyzeTeamCornersThreshold(homeTeamLast10Home, threshold, 'total')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCornersThreshold(awayTeamLast5Away, threshold, 'total'),
            last10Away: this.analyzeTeamCornersThreshold(awayTeamLast10Away, threshold, 'total')
          },
          h2h: {
            last5: this.analyzeTeamCornersThreshold(h2hLast5, threshold, 'total'),
            last10: this.analyzeTeamCornersThreshold(h2hLast10, threshold, 'total')
          }
        },
        firstHalf: {
          homeTeam: {
            last5Home: this.analyzeTeamCornersThreshold(homeTeamLast5Home, threshold, 'firstHalf'),
            last10Home: this.analyzeTeamCornersThreshold(homeTeamLast10Home, threshold, 'firstHalf')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCornersThreshold(awayTeamLast5Away, threshold, 'firstHalf'),
            last10Away: this.analyzeTeamCornersThreshold(awayTeamLast10Away, threshold, 'firstHalf')
          },
          h2h: {
            last5: this.analyzeTeamCornersThreshold(h2hLast5, threshold, 'firstHalf'),
            last10: this.analyzeTeamCornersThreshold(h2hLast10, threshold, 'firstHalf')
          }
        },
        secondHalf: {
          homeTeam: {
            last5Home: this.analyzeTeamCornersThreshold(homeTeamLast5Home, threshold, 'secondHalf'),
            last10Home: this.analyzeTeamCornersThreshold(homeTeamLast10Home, threshold, 'secondHalf')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCornersThreshold(awayTeamLast5Away, threshold, 'secondHalf'),
            last10Away: this.analyzeTeamCornersThreshold(awayTeamLast10Away, threshold, 'secondHalf')
          },
          h2h: {
            last5: this.analyzeTeamCornersThreshold(h2hLast5, threshold, 'secondHalf'),
            last10: this.analyzeTeamCornersThreshold(h2hLast10, threshold, 'secondHalf')
          }
        }
      };
    });
    
    return result;
  }
  
  private analyzeTeamCornersThreshold(matches: any[], threshold: number, cornerType: 'total' | 'firstHalf' | 'secondHalf') {
    let over = 0;
    let under = 0;
    
    matches.forEach(match => {
      let totalCorners: number;
      
      if (cornerType === 'firstHalf') {
        totalCorners = (match.homeFirstHalfCorners || 0) + (match.awayFirstHalfCorners || 0);
      } else if (cornerType === 'secondHalf') {
        totalCorners = (match.homeSecondHalfCorners || 0) + (match.awaySecondHalfCorners || 0);
      } else { // total
        totalCorners = (match.homeCorners || 0) + (match.awayCorners || 0);
      }
      
      if (totalCorners > threshold) {
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

export const cornersAnalysisService = new CornersAnalysisService();