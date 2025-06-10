import { HistoricalMatch } from '../../models/Match';
import { CardsAnalysis, ThresholdStatistics } from '../../models/MatchAnalysis';
import logger from '../../utils/logger';

export class CardsAnalysisService {
  private readonly CARDS_THRESHOLDS = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

  /**
   * Analyze cards data for a team's matches
   */
  analyzeCards(matches: HistoricalMatch[], isHomeTeam: boolean = true): CardsAnalysis {
    const last5Matches = matches.slice(0, 5);
    const last10Matches = matches.slice(0, 10);

    return {
      last5Matches: this.analyzeMatchSet(last5Matches, isHomeTeam),
      last10Matches: this.analyzeMatchSet(last10Matches, isHomeTeam),
    };
  }

  private analyzeMatchSet(matches: HistoricalMatch[], isHomeTeam: boolean) {
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

  private calculateCardsThresholds(matches: HistoricalMatch[]): ThresholdStatistics[] {
    return this.CARDS_THRESHOLDS.map(threshold => {
      const matchesOver = matches.filter(match => 
        match.statistics.cards.total.total > threshold
      ).length;
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

  private calculateAverageCards(matches: HistoricalMatch[]): number {
    if (matches.length === 0) return 0;
    const totalCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.total, 0);
    return parseFloat((totalCards / matches.length).toFixed(2));
  }

  private calculateAverageYellowCards(matches: HistoricalMatch[]): number {
    if (matches.length === 0) return 0;
    const totalYellowCards = matches.reduce((sum, match) => sum + match.statistics.cards.yellow.total, 0);
    return parseFloat((totalYellowCards / matches.length).toFixed(2));
  }

  private calculateAverageRedCards(matches: HistoricalMatch[]): number {
    if (matches.length === 0) return 0;
    const totalRedCards = matches.reduce((sum, match) => sum + match.statistics.cards.red.total, 0);
    return parseFloat((totalRedCards / matches.length).toFixed(2));
  }

  /**
   * Get cards statistics for specific thresholds
   */
  getCardsOverUnderStats(matches: HistoricalMatch[], thresholds: number[] = this.CARDS_THRESHOLDS): Map<number, ThresholdStatistics> {
    const stats = new Map<number, ThresholdStatistics>();

    thresholds.forEach(threshold => {
      const matchesOver = matches.filter(match => 
        match.statistics.cards.total.total > threshold
      ).length;
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
   * Calculate team-specific cards statistics
   */
  calculateTeamCardsStats(matches: HistoricalMatch[], isHomeTeam: boolean): {
    averageCardsReceived: number;
    averageYellowCardsReceived: number;
    averageRedCardsReceived: number;
    disciplinaryRecord: {
      cleanGames: number; // games with 0 cards
      heavilyBooked: number; // games with 3+ cards
      redCardGames: number; // games with red cards
    };
  } {
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

  /**
   * Calculate referee-influenced cards statistics
   */
  calculateRefereeInfluencedStats(matches: HistoricalMatch[]): {
    strictRefereeGames: number; // games with 4+ total cards
    lenientRefereeGames: number; // games with 0-1 total cards
    averageCardsPerReferee: Map<string, number>;
    mostStrictReferees: Array<{ name: string; averageCards: number; games: number }>;
  } {
    const refereeStats = new Map<string, { totalCards: number; games: number }>();

    matches.forEach(match => {
      if (match.referee?.name) {
        const refName = match.referee.name;
        const totalCards = match.statistics.cards.total.total;
        
        if (!refereeStats.has(refName)) {
          refereeStats.set(refName, { totalCards: 0, games: 0 });
        }
        
        const current = refereeStats.get(refName)!;
        current.totalCards += totalCards;
        current.games += 1;
      }
    });

    const averageCardsPerReferee = new Map<string, number>();
    const mostStrictReferees: Array<{ name: string; averageCards: number; games: number }> = [];

    refereeStats.forEach((stats, refName) => {
      const average = stats.totalCards / stats.games;
      averageCardsPerReferee.set(refName, parseFloat(average.toFixed(2)));
      
      if (stats.games >= 2) { // Only include referees with multiple games
        mostStrictReferees.push({
          name: refName,
          averageCards: parseFloat(average.toFixed(2)),
          games: stats.games,
        });
      }
    });

    // Sort by average cards descending
    mostStrictReferees.sort((a, b) => b.averageCards - a.averageCards);

    return {
      strictRefereeGames: matches.filter(match => match.statistics.cards.total.total >= 4).length,
      lenientRefereeGames: matches.filter(match => match.statistics.cards.total.total <= 1).length,
      averageCardsPerReferee,
      mostStrictReferees: mostStrictReferees.slice(0, 5), // Top 5 strictest
    };
  }

  /**
   * Analyze cards distribution patterns
   */
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
  } {
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

    const getPattern = (average: number): 'aggressive' | 'disciplined' | 'average' => {
      if (average >= 2.5) return 'aggressive';
      if (average <= 1.0) return 'disciplined';
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

  /**
   * Get cards timing analysis (if available)
   */
  analyzeCardsTiming(matches: HistoricalMatch[]): {
    firstHalfCards: number;
    secondHalfCards: number;
    firstHalfPercentage: number;
    secondHalfPercentage: number;
    lateCards: number; // cards after 80th minute (if timing data available)
  } {
    // This would require match events data with timing
    // For now, return basic structure that can be extended
    const totalCards = matches.reduce((sum, match) => sum + match.statistics.cards.total.total, 0);
    
    // Mock data structure - in reality, this would parse match events
    return {
      firstHalfCards: Math.round(totalCards * 0.4), // Estimate
      secondHalfCards: Math.round(totalCards * 0.6), // Estimate
      firstHalfPercentage: 40,
      secondHalfPercentage: 60,
      lateCards: Math.round(totalCards * 0.2), // Estimate
    };
  }
}

export default new CardsAnalysisService();
