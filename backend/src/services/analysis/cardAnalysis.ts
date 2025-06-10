import { CardsAnalysis } from '../../models/MatchAnalysis';

export class CardsAnalysisService {
  /**
   * Analyze cards data for different thresholds
   */
  analyzeCards(
    homeTeamLast5Home: any[],
    homeTeamLast10Home: any[],
    awayTeamLast5Away: any[],
    awayTeamLast10Away: any[],
    h2hLast5: any[],
    h2hLast10: any[],
    refereeStats: any
  ): CardsAnalysis {
    // Define thresholds to analyze
    const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
    
    const result: CardsAnalysis = {
      thresholds: {}
    };
    
    thresholds.forEach(threshold => {
      result.thresholds[threshold.toString()] = {
        totalCards: {
          homeTeam: {
            last5Home: this.analyzeTeamCardsThreshold(homeTeamLast5Home, threshold, 'total'),
            last10Home: this.analyzeTeamCardsThreshold(homeTeamLast10Home, threshold, 'total')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCardsThreshold(awayTeamLast5Away, threshold, 'total'),
            last10Away: this.analyzeTeamCardsThreshold(awayTeamLast10Away, threshold, 'total')
          },
          h2h: {
            last5: this.analyzeTeamCardsThreshold(h2hLast5, threshold, 'total'),
            last10: this.analyzeTeamCardsThreshold(h2hLast10, threshold, 'total')
          }
        },
        yellowCards: {
          homeTeam: {
            last5Home: this.analyzeTeamCardsThreshold(homeTeamLast5Home, threshold, 'yellow'),
            last10Home: this.analyzeTeamCardsThreshold(homeTeamLast10Home, threshold, 'yellow')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCardsThreshold(awayTeamLast5Away, threshold, 'yellow'),
            last10Away: this.analyzeTeamCardsThreshold(awayTeamLast10Away, threshold, 'yellow')
          },
          h2h: {
            last5: this.analyzeTeamCardsThreshold(h2hLast5, threshold, 'yellow'),
            last10: this.analyzeTeamCardsThreshold(h2hLast10, threshold, 'yellow')
          }
        },
        redCards: {
          homeTeam: {
            last5Home: this.analyzeTeamCardsThreshold(homeTeamLast5Home, threshold, 'red'),
            last10Home: this.analyzeTeamCardsThreshold(homeTeamLast10Home, threshold, 'red')
          },
          awayTeam: {
            last5Away: this.analyzeTeamCardsThreshold(awayTeamLast5Away, threshold, 'red'),
            last10Away: this.analyzeTeamCardsThreshold(awayTeamLast10Away, threshold, 'red')
          },
          h2h: {
            last5: this.analyzeTeamCardsThreshold(h2hLast5, threshold, 'red'),
            last10: this.analyzeTeamCardsThreshold(h2hLast10, threshold, 'red')
          }
        }
      };
    });
    
    return result;
  }
  
  private analyzeTeamCardsThreshold(matches: any[], threshold: number, cardType: 'total' | 'yellow' | 'red') {
    let over = 0;
    let under = 0;
    
    matches.forEach(match => {
      let totalCards: number;
      
      if (cardType === 'yellow') {
        totalCards = (match.homeYellowCards || 0) + (match.awayYellowCards || 0);
      } else if (cardType === 'red') {
        totalCards = (match.homeRedCards || 0) + (match.awayRedCards || 0);
      } else { // total
        totalCards = (match.homeYellowCards || 0) + (match.awayYellowCards || 0) + 
                    (match.homeRedCards || 0) + (match.awayRedCards || 0);
      }
      
      if (totalCards > threshold) {
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

export const cardsAnalysisService = new CardsAnalysisService();