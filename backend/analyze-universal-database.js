const fs = require('fs');
const path = require('path');

function analyzeUniversalDatabase() {
  console.log('🌍 UNIVERSAL DATABASE ANALYSIS TOOL');
  console.log('═'.repeat(60));

  try {
    // Load the database
    const dbPath = path.join(__dirname, 'src/data/mappings/universal-teams.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const mappings = data.mappings || [];

    console.log('📊 BASIC STATISTICS:');
    console.log('─'.repeat(40));
    console.log(`Total Teams: ${mappings.length.toLocaleString()}`);
    console.log(`Last Sync: ${new Date(data.lastSync).toLocaleString()}`);
    console.log('');

    // Analyze mapping types
    const bothApis = mappings.filter(m => m.allSportsId && m.apiFootballId);
    const allSportsOnly = mappings.filter(m => m.allSportsId && !m.apiFootballId);
    const apiFootballOnly = mappings.filter(m => !m.allSportsId && m.apiFootballId);
    const verified = mappings.filter(m => m.verified);

    console.log('🔗 MAPPING DISTRIBUTION:');
    console.log('─'.repeat(40));
    console.log(`✅ Both APIs Mapped: ${bothApis.length.toLocaleString()} (${(bothApis.length/mappings.length*100).toFixed(1)}%)`);
    console.log(`🅰️  AllSports Only: ${allSportsOnly.length.toLocaleString()} (${(allSportsOnly.length/mappings.length*100).toFixed(1)}%)`);
    console.log(`🅱️  API Football Only: ${apiFootballOnly.length.toLocaleString()} (${(apiFootballOnly.length/mappings.length*100).toFixed(1)}%)`);
    console.log(`✅ Verified Mappings: ${verified.length.toLocaleString()} (${(verified.length/mappings.length*100).toFixed(1)}%)`);
    console.log('');

    // Analyze by country
    const countryStats = {};
    mappings.forEach(m => {
      const country = m.country || 'Unknown';
      if (!countryStats[country]) {
        countryStats[country] = { total: 0, bothApis: 0, allSportsOnly: 0, apiFootballOnly: 0 };
      }
      countryStats[country].total++;
      if (m.allSportsId && m.apiFootballId) countryStats[country].bothApis++;
      else if (m.allSportsId) countryStats[country].allSportsOnly++;
      else if (m.apiFootballId) countryStats[country].apiFootballOnly++;
    });

    console.log('🌎 TOP COUNTRIES BY TEAM COUNT:');
    console.log('─'.repeat(40));
    const topCountries = Object.entries(countryStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 15);

    topCountries.forEach(([country, stats]) => {
      console.log(`${country.padEnd(20)} ${stats.total.toString().padStart(5)} teams (Both: ${stats.bothApis}, AS: ${stats.allSportsOnly}, AF: ${stats.apiFootballOnly})`);
    });
    console.log('');

    // Analyze by league
    const leagueStats = {};
    mappings.forEach(m => {
      const league = m.league || 'Unknown';
      if (!leagueStats[league]) {
        leagueStats[league] = { total: 0, bothApis: 0 };
      }
      leagueStats[league].total++;
      if (m.allSportsId && m.apiFootballId) leagueStats[league].bothApis++;
    });

    console.log('🏆 TOP LEAGUES BY TEAM COUNT:');
    console.log('─'.repeat(40));
    const topLeagues = Object.entries(leagueStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 15);

    topLeagues.forEach(([league, stats]) => {
      const coverage = stats.total > 0 ? (stats.bothApis / stats.total * 100).toFixed(1) : '0.0';
      console.log(`${league.substring(0, 35).padEnd(35)} ${stats.total.toString().padStart(4)} teams (${coverage}% both APIs)`);
    });
    console.log('');

    // Confidence analysis
    const confidenceRanges = {
      'Perfect (1.0)': mappings.filter(m => m.confidence === 1.0).length,
      'High (0.9-0.99)': mappings.filter(m => m.confidence >= 0.9 && m.confidence < 1.0).length,
      'Good (0.8-0.89)': mappings.filter(m => m.confidence >= 0.8 && m.confidence < 0.9).length,
      'Fair (0.7-0.79)': mappings.filter(m => m.confidence >= 0.7 && m.confidence < 0.8).length,
      'Low (<0.7)': mappings.filter(m => m.confidence < 0.7).length
    };

    console.log('🎯 CONFIDENCE DISTRIBUTION:');
    console.log('─'.repeat(40));
    Object.entries(confidenceRanges).forEach(([range, count]) => {
      const percentage = (count / mappings.length * 100).toFixed(1);
      console.log(`${range.padEnd(20)} ${count.toString().padStart(6)} (${percentage}%)`);
    });
    console.log('');

    // Show examples of different mapping types
    console.log('📝 MAPPING EXAMPLES:');
    console.log('─'.repeat(40));

    // Perfect match example
    const perfectMatch = bothApis.find(m => m.confidence === 1.0);
    if (perfectMatch) {
      console.log('✅ PERFECT MATCH EXAMPLE:');
      console.log(`   ${perfectMatch.primaryName}`);
      console.log(`   AllSports: ${perfectMatch.allSportsName} (ID: ${perfectMatch.allSportsId})`);
      console.log(`   API Football: ${perfectMatch.apiFootballName} (ID: ${perfectMatch.apiFootballId})`);
      console.log(`   Country: ${perfectMatch.country}, League: ${perfectMatch.league}`);
      console.log('');
    }

    // AllSports only example
    const allSportsExample = allSportsOnly.find(m => m.country === 'England');
    if (allSportsExample) {
      console.log('🅰️  ALLSPORTS ONLY EXAMPLE:');
      console.log(`   ${allSportsExample.primaryName}`);
      console.log(`   AllSports: ${allSportsExample.allSportsName} (ID: ${allSportsExample.allSportsId})`);
      console.log(`   API Football: Not mapped`);
      console.log(`   Country: ${allSportsExample.country}, League: ${allSportsExample.league}`);
      console.log('');
    }

    // API Football only example
    const apiFootballExample = apiFootballOnly.find(m => m.country === 'England');
    if (apiFootballExample) {
      console.log('🅱️  API FOOTBALL ONLY EXAMPLE:');
      console.log(`   ${apiFootballExample.primaryName}`);
      console.log(`   AllSports: Not mapped`);
      console.log(`   API Football: ${apiFootballExample.apiFootballName} (ID: ${apiFootballExample.apiFootballId})`);
      console.log(`   Country: ${apiFootballExample.country}, League: ${apiFootballExample.league}`);
      console.log('');
    }

    // Show major teams that need mapping
    console.log('⚠️  MAJOR TEAMS NEEDING MAPPING:');
    console.log('─'.repeat(40));
    
    const majorTeams = [
      'Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal',
      'Real Madrid', 'Barcelona', 'Bayern Munich', 'Paris Saint Germain', 'Juventus'
    ];

    majorTeams.forEach(teamName => {
      const team = mappings.find(m => 
        m.primaryName.toLowerCase().includes(teamName.toLowerCase()) ||
        m.allSportsName?.toLowerCase().includes(teamName.toLowerCase()) ||
        m.apiFootballName?.toLowerCase().includes(teamName.toLowerCase())
      );
      
      if (team) {
        const status = team.allSportsId && team.apiFootballId ? '✅ Both APIs' : 
                      team.allSportsId ? '🅰️  AllSports Only' : '🅱️  API Football Only';
        console.log(`   ${teamName.padEnd(20)} ${status}`);
      } else {
        console.log(`   ${teamName.padEnd(20)} ❌ Not Found`);
      }
    });
    console.log('');

    // Expansion recommendations
    console.log('🚀 EXPANSION RECOMMENDATIONS:');
    console.log('─'.repeat(40));
    
    const lowCoverageCountries = Object.entries(countryStats)
      .filter(([country, stats]) => stats.total > 50 && (stats.bothApis / stats.total) < 0.3)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    if (lowCoverageCountries.length > 0) {
      console.log('🎯 Countries with low API coverage (priority for expansion):');
      lowCoverageCountries.forEach(([country, stats]) => {
        const coverage = (stats.bothApis / stats.total * 100).toFixed(1);
        console.log(`   ${country.padEnd(20)} ${stats.total} teams, ${coverage}% both APIs`);
      });
      console.log('');
    }

    const majorLeaguesLowCoverage = Object.entries(leagueStats)
      .filter(([league, stats]) => {
        const majorLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'MLS'];
        return majorLeagues.some(major => league.includes(major)) && (stats.bothApis / stats.total) < 0.8;
      });

    if (majorLeaguesLowCoverage.length > 0) {
      console.log('🏆 Major leagues needing better coverage:');
      majorLeaguesLowCoverage.forEach(([league, stats]) => {
        const coverage = (stats.bothApis / stats.total * 100).toFixed(1);
        console.log(`   ${league.substring(0, 30).padEnd(30)} ${coverage}% both APIs`);
      });
      console.log('');
    }

    console.log('📋 NEXT STEPS:');
    console.log('─'.repeat(40));
    console.log('1. Run targeted sync for major European leagues');
    console.log('2. Focus on countries with >50 teams but <30% coverage');
    console.log('3. Manually verify high-profile teams like Manchester United');
    console.log('4. Add missing major league teams through API Football');
    console.log('5. Implement fuzzy matching improvements for better coverage');
    console.log('');
    console.log('🎉 Analysis complete! Database is ready for strategic expansion.');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the analysis
if (require.main === module) {
  analyzeUniversalDatabase();
}

module.exports = { analyzeUniversalDatabase };
