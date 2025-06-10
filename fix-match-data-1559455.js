const axios = require('axios');
const fs = require('fs');
const dataValidationService = require('./backend/src/services/dataValidationService');

const MATCH_ID = '1559455';
const BASE_URL = 'http://localhost:5000/api';

/**
 * Comprehensive Match Data Fixing Script
 * Applies all corrections identified in the validation report
 */

class MatchDataFixer {
  constructor(matchId) {
    this.matchId = matchId;
    this.originalData = {};
    this.fixedData = {};
    this.report = {
      fixes: [],
      improvements: [],
      finalAccuracy: 0
    };
  }

  async fixAllData() {
    console.log(`🔧 Starting comprehensive data fixing for match ${this.matchId}`);
    console.log('=' .repeat(80));

    try {
      // Fetch all current data
      await this.fetchAllData();
      
      // Apply comprehensive fixes
      await this.applyDataFixes();
      
      // Validate fixes
      await this.validateFixes();
      
      // Generate final report
      this.generateFinalReport();

    } catch (error) {
      console.error('❌ Data fixing failed:', error.message);
    }
  }

  async fetchAllData() {
    console.log('📊 Fetching current match data...');
    
    try {
      // Fetch match details
      const matchResponse = await axios.get(`${BASE_URL}/matches/${this.matchId}`, { timeout: 15000 });
      this.originalData.match = matchResponse.data;
      
      // Fetch card statistics
      const cardResponse = await axios.get(`${BASE_URL}/matches/${this.matchId}/cards?matches=10`, { timeout: 15000 });
      this.originalData.cardStats = cardResponse.data;
      
      // Fetch BTTS statistics
      const bttsResponse = await axios.get(`${BASE_URL}/matches/${this.matchId}/btts?matches=10`, { timeout: 15000 });
      this.originalData.bttsStats = bttsResponse.data;
      
      // Fetch player statistics
      const playerResponse = await axios.get(`${BASE_URL}/matches/${this.matchId}/players?matches=10`, { timeout: 15000 });
      this.originalData.playerStats = playerResponse.data;
      
      console.log('✅ All data fetched successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch data:', error.message);
      throw error;
    }
  }

  async applyDataFixes() {
    console.log('\n🔧 Applying comprehensive data fixes...');
    
    // Use the data validation service to fix all issues
    const fixes = dataValidationService.validateAndFixMatchData(this.originalData);
    
    this.fixedData = {
      match: this.originalData.match,
      cardStats: fixes.cardStats || this.originalData.cardStats,
      bttsStats: fixes.bttsStats || this.originalData.bttsStats,
      playerStats: fixes.playerStats || this.originalData.playerStats
    };
    
    this.report.fixes = fixes.corrections;
    this.report.issues = fixes.issues;
    
    console.log(`✅ Applied ${fixes.corrections.length} fixes`);
    fixes.corrections.forEach(fix => console.log(`   • ${fix}`));
    
    if (fixes.issues.length > 0) {
      console.log(`⚠️  ${fixes.issues.length} issues remain:`);
      fixes.issues.forEach(issue => console.log(`   • ${issue}`));
    }
  }

  async validateFixes() {
    console.log('\n🔍 Validating applied fixes...');
    
    // Validate card statistics fixes
    this.validateCardStatsFixes();
    
    // Validate BTTS synchronization
    this.validateBTTSSynchronization();
    
    // Validate player statistics fixes
    this.validatePlayerStatsFixes();
    
    // Calculate final accuracy
    this.calculateFinalAccuracy();
  }

  validateCardStatsFixes() {
    console.log('\n📊 Validating card statistics fixes...');
    
    if (!this.fixedData.cardStats?.result) {
      console.log('❌ No card statistics data to validate');
      return;
    }
    
    const cardStats = this.fixedData.cardStats.result;
    let issues = 0;
    
    // Check home and away stats
    ['homeStats', 'awayStats'].forEach(teamKey => {
      if (cardStats[teamKey]?.mostCardedPlayers) {
        cardStats[teamKey].mostCardedPlayers.forEach(player => {
          // Check for undefined player IDs
          if (!player.playerId || player.playerId.includes('undefined')) {
            console.log(`❌ Still has undefined player ID: ${player.playerId}`);
            issues++;
          }
          
          // Check for placeholder names
          if (!player.playerName || player.playerName.includes('Unknown') || player.playerName.startsWith('Player ')) {
            console.log(`❌ Still has placeholder name: ${player.playerName}`);
            issues++;
          }
          
          // Check for unrealistic values
          if (player.cardsPerMatch > 3) {
            console.log(`❌ Still has unrealistic cards per match: ${player.cardsPerMatch}`);
            issues++;
          }
        });
      }
    });
    
    if (issues === 0) {
      console.log('✅ Card statistics fixes validated successfully');
      this.report.improvements.push('Card statistics: All undefined IDs and unrealistic values fixed');
    } else {
      console.log(`❌ ${issues} card statistics issues remain`);
    }
  }

  validateBTTSSynchronization() {
    console.log('\n📊 Validating BTTS goal synchronization...');
    
    if (!this.fixedData.bttsStats?.result || !this.fixedData.playerStats?.result) {
      console.log('❌ Missing data for BTTS synchronization validation');
      return;
    }
    
    // Calculate goals from player stats
    const homePlayerGoals = this.fixedData.playerStats.result.homeTeamPlayers?.players?.reduce((sum, p) => sum + (p.playerGoals || 0), 0) || 0;
    const awayPlayerGoals = this.fixedData.playerStats.result.awayTeamPlayers?.players?.reduce((sum, p) => sum + (p.playerGoals || 0), 0) || 0;
    
    // Check BTTS totals
    const homeBttsGoals = this.fixedData.bttsStats.result.homeStats?.totalGoals || 0;
    const awayBttsGoals = this.fixedData.bttsStats.result.awayStats?.totalGoals || 0;
    
    console.log(`Player Stats Goals: Home ${homePlayerGoals}, Away ${awayPlayerGoals}`);
    console.log(`BTTS Stats Goals: Home ${homeBttsGoals}, Away ${awayBttsGoals}`);
    
    if (homePlayerGoals === homeBttsGoals && awayPlayerGoals === awayBttsGoals) {
      console.log('✅ BTTS goal synchronization validated successfully');
      this.report.improvements.push('BTTS statistics: Goal counting synchronized with player data');
    } else {
      console.log('❌ BTTS goal synchronization still has discrepancies');
    }
  }

  validatePlayerStatsFixes() {
    console.log('\n📊 Validating player statistics fixes...');
    
    if (!this.fixedData.playerStats?.result) {
      console.log('❌ No player statistics data to validate');
      return;
    }
    
    const playerStats = this.fixedData.playerStats.result;
    let issues = 0;
    
    // Check home and away teams
    ['homeTeamPlayers', 'awayTeamPlayers'].forEach(teamKey => {
      if (playerStats[teamKey]?.players) {
        playerStats[teamKey].players.forEach(player => {
          // Check for placeholder names
          if (!player.playerName || player.playerName.includes('Unknown') || player.playerName.startsWith('Player ')) {
            console.log(`❌ Still has placeholder player name: ${player.playerName}`);
            issues++;
          }
          
          // Check for unrealistic statistics
          if ((player.playerGoals || 0) > (player.playerMatchPlayed || 0) * 2) {
            console.log(`❌ Still has unrealistic goals: ${player.playerGoals} in ${player.playerMatchPlayed} matches`);
            issues++;
          }
        });
      }
    });
    
    if (issues === 0) {
      console.log('✅ Player statistics fixes validated successfully');
      this.report.improvements.push('Player statistics: Real player names and realistic values applied');
    } else {
      console.log(`❌ ${issues} player statistics issues remain`);
    }
  }

  calculateFinalAccuracy() {
    console.log('\n📊 Calculating final data accuracy...');
    
    let totalIssues = 0;
    
    // Count remaining issues from validation
    if (this.report.issues) {
      totalIssues += this.report.issues.length;
    }
    
    // Check for any validation failures
    const validationChecks = [
      this.fixedData.cardStats?.dataFixed,
      this.fixedData.playerStats?.playersFixed,
      this.fixedData.bttsStats?.goalsSynchronized
    ];
    
    const successfulFixes = validationChecks.filter(Boolean).length;
    const totalFixes = validationChecks.length;
    
    // Calculate accuracy based on successful fixes and remaining issues
    this.report.finalAccuracy = Math.max(0, 100 - (totalIssues * 5) + (successfulFixes / totalFixes * 10));
    
    console.log(`📈 Final Data Accuracy: ${this.report.finalAccuracy.toFixed(1)}%`);
    console.log(`✅ Successful Fixes: ${successfulFixes}/${totalFixes}`);
    console.log(`❌ Remaining Issues: ${totalIssues}`);
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE DATA FIXING REPORT');
    console.log('='.repeat(80));
    
    console.log(`🎯 Match: Germany vs Portugal (${this.matchId})`);
    console.log(`📅 Fixed on: ${new Date().toISOString().split('T')[0]}`);
    console.log(`📈 Original Accuracy: 82.0%`);
    console.log(`📈 Final Accuracy: ${this.report.finalAccuracy.toFixed(1)}%`);
    console.log(`📊 Improvement: +${(this.report.finalAccuracy - 82.0).toFixed(1)}%`);
    
    console.log('\n✅ FIXES APPLIED:');
    this.report.fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix}`);
    });
    
    console.log('\n🎉 IMPROVEMENTS ACHIEVED:');
    this.report.improvements.forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement}`);
    });
    
    if (this.report.issues && this.report.issues.length > 0) {
      console.log('\n⚠️  REMAINING ISSUES:');
      this.report.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    // Save detailed report
    const reportData = {
      matchId: this.matchId,
      timestamp: new Date().toISOString(),
      originalAccuracy: 82.0,
      finalAccuracy: this.report.finalAccuracy,
      improvement: this.report.finalAccuracy - 82.0,
      fixes: this.report.fixes,
      improvements: this.report.improvements,
      issues: this.report.issues || [],
      originalData: this.originalData,
      fixedData: this.fixedData
    };
    
    fs.writeFileSync(`match-${this.matchId}-fixes-applied.json`, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved to: match-${this.matchId}-fixes-applied.json`);
    
    // Generate summary
    console.log('\n🏆 SUMMARY:');
    if (this.report.finalAccuracy >= 95) {
      console.log('🌟 EXCELLENT: Data quality is now at premium level!');
    } else if (this.report.finalAccuracy >= 90) {
      console.log('✅ GOOD: Data quality significantly improved!');
    } else {
      console.log('⚠️  PARTIAL: Some improvements made, but more work needed.');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Restart the backend server to apply fixes');
    console.log('2. Clear browser cache and refresh the match page');
    console.log('3. Verify all statistics display correctly');
    console.log('4. Run validation script again to confirm 100% accuracy');
  }
}

// Run the comprehensive fix
async function runComprehensiveFix() {
  const fixer = new MatchDataFixer(MATCH_ID);
  await fixer.fixAllData();
}

runComprehensiveFix().catch(console.error);
