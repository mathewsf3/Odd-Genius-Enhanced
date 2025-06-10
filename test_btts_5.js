const axios = require('axios');

async function testBTTS5Games() {
    console.log('=== TESTE ESTATÍSTICAS DE BTTS (5 JOGOS) - FRANÇA × ESPANHA ===');
    
    try {
        // Testar com 5 jogos
        const response = await axios.get('http://localhost:5000/api/matches/1559456/btts?matches=5');
        const data = response.data.result;
        
        console.log('\n=== 1. ESTATÍSTICAS BÁSICAS DE BTTS ===');
        console.log(`Espanha BTTS: ${data.homeStats.bttsYesPercentage}% (${data.homeStats.bttsYesCount}/${data.homeStats.totalMatches})`);
        console.log(`França BTTS: ${data.awayStats.bttsYesPercentage}% (${data.awayStats.bttsYesCount}/${data.awayStats.totalMatches})`);
        console.log(`Predição BTTS: ${data.combinedStats.bttsYesProbability}%`);
        console.log(`Confiança: ${data.combinedStats.confidenceLevel}`);
        
        console.log('\n=== 2. MÉDIAS DE GOLS ===');
        console.log(`Gols/jogo Espanha: ${data.combinedStats.averageHomeTeamGoals}`);
        console.log(`Gols/jogo França: ${data.combinedStats.averageAwayTeamGoals}`);
        console.log(`Total esperado: ${data.combinedStats.averageTotalGoals}`);
        
        // Verificação matemática
        const expectedTotal = data.combinedStats.averageHomeTeamGoals + data.combinedStats.averageAwayTeamGoals;
        console.log(`\nVerificação: ${data.combinedStats.averageHomeTeamGoals} + ${data.combinedStats.averageAwayTeamGoals} = ${expectedTotal}`);
        console.log(`Valor retornado: ${data.combinedStats.averageTotalGoals}`);
        console.log(Math.abs(expectedTotal - data.combinedStats.averageTotalGoals) < 0.01 ? '✅ Cálculo de gols: CORRETO' : '❌ Cálculo de gols: ERRO');
        
        console.log('\n=== 3. CLEAN SHEETS ===');
        console.log(`Clean Sheet Espanha: ${data.homeStats.cleanSheetPercentage}% (${data.homeStats.cleanSheetCount}/${data.homeStats.totalMatches})`);
        console.log(`Clean Sheet França: ${data.awayStats.cleanSheetPercentage}% (${data.awayStats.cleanSheetCount}/${data.awayStats.totalMatches})`);
        console.log(`Clean Sheet Espanha (Combined): ${data.combinedStats.homeTeamCleanSheetProbability}%`);
        console.log(`Clean Sheet França (Combined): ${data.combinedStats.awayTeamCleanSheetProbability}%`);
        
        console.log('\n=== 4. FAILED TO SCORE ===');
        console.log(`Failed to Score Espanha: ${data.homeStats.failedToScorePercentage}% (${data.homeStats.failedToScoreCount}/${data.homeStats.totalMatches})`);
        console.log(`Failed to Score França: ${data.awayStats.failedToScorePercentage}% (${data.awayStats.failedToScoreCount}/${data.awayStats.totalMatches})`);
        console.log(`Failed to Score Espanha (Combined): ${data.combinedStats.homeTeamFailToScoreProbability}%`);
        console.log(`Failed to Score França (Combined): ${data.combinedStats.awayTeamFailToScoreProbability}%`);
        
        console.log('\n=== 5. ESTATÍSTICAS HOME/AWAY ===');
        console.log('ESPANHA:');
        console.log(`  Home: ${data.homeStats.homeMatches} jogos, BTTS: ${data.homeStats.homeBttsYesPercentage}%`);
        console.log(`  Away: ${data.homeStats.awayMatches} jogos, BTTS: ${data.homeStats.awayBttsYesPercentage}%`);
        console.log(`  Home Clean Sheet: ${data.homeStats.homeCleanSheetPercentage}%`);
        console.log(`  Away Clean Sheet: ${data.homeStats.awayCleanSheetPercentage}%`);
        console.log(`  Home Failed to Score: ${data.homeStats.homeFailedToScorePercentage}%`);
        console.log(`  Away Failed to Score: ${data.homeStats.awayFailedToScorePercentage}%`);
        
        console.log('\nFRANÇA:');
        console.log(`  Home: ${data.awayStats.homeMatches} jogos, BTTS: ${data.awayStats.homeBttsYesPercentage}%`);
        console.log(`  Away: ${data.awayStats.awayMatches} jogos, BTTS: ${data.awayStats.awayBttsYesPercentage}%`);
        console.log(`  Home Clean Sheet: ${data.awayStats.homeCleanSheetPercentage}%`);
        console.log(`  Away Clean Sheet: ${data.awayStats.awayCleanSheetPercentage}%`);
        console.log(`  Home Failed to Score: ${data.awayStats.homeFailedToScorePercentage}%`);
        console.log(`  Away Failed to Score: ${data.awayStats.awayFailedToScorePercentage}%`);
        
        console.log('\n=== 6. HEAD-TO-HEAD ===');
        if (data.h2hStats && data.h2hStats.totalMatches > 0) {
            console.log(`H2H Partidas: ${data.h2hStats.totalMatches}`);
            console.log(`H2H BTTS: ${data.h2hStats.bttsYesPercentage}% (${data.h2hStats.bttsYesCount}/${data.h2hStats.totalMatches})`);
            console.log(`H2H Média de gols: ${data.h2hStats.averageTotalGoals}`);
            console.log(`Vitórias Espanha: ${data.h2hStats.homeTeamWins}`);
            console.log(`Vitórias França: ${data.h2hStats.awayTeamWins}`);
            console.log(`Empates: ${data.h2hStats.draws}`);
        } else {
            console.log('H2H: Nenhum dado disponível');
        }
        
        console.log('\n=== 7. VERIFICAÇÕES DE CONSISTÊNCIA ===');
        
        // Verificar problemas
        const problems = [];
        
        // Verificar se BTTS + Clean Sheet + Failed to Score fazem sentido
        const spainBtts = data.homeStats.bttsYesPercentage;
        const spainCleanSheet = data.homeStats.cleanSheetPercentage;
        const spainFailedToScore = data.homeStats.failedToScorePercentage;
        
        const franceBtts = data.awayStats.bttsYesPercentage;
        const franceCleanSheet = data.awayStats.cleanSheetPercentage;
        const franceFailedToScore = data.awayStats.failedToScorePercentage;
        
        console.log('\nVerificação lógica:');
        console.log(`Espanha: BTTS=${spainBtts}%, Clean Sheet=${spainCleanSheet}%, Failed to Score=${spainFailedToScore}%`);
        console.log(`França: BTTS=${franceBtts}%, Clean Sheet=${franceCleanSheet}%, Failed to Score=${franceFailedToScore}%`);
        
        // Verificar se as estatísticas combinadas batem com as individuais
        const homeStatsMatch = data.homeStats.cleanSheetPercentage === data.combinedStats.homeTeamCleanSheetProbability;
        const awayStatsMatch = data.awayStats.cleanSheetPercentage === data.combinedStats.awayTeamCleanSheetProbability;
        
        if (!homeStatsMatch) {
            problems.push(`PROBLEMA: Clean Sheet Espanha inconsistente (Individual: ${data.homeStats.cleanSheetPercentage}% vs Combined: ${data.combinedStats.homeTeamCleanSheetProbability}%)`);
        }
        
        if (!awayStatsMatch) {
            problems.push(`PROBLEMA: Clean Sheet França inconsistente (Individual: ${data.awayStats.cleanSheetPercentage}% vs Combined: ${data.combinedStats.awayTeamCleanSheetProbability}%)`);
        }
        
        // Verificar predição BTTS
        const simpleBttsPrediction = Math.round((100 - spainFailedToScore) * (100 - franceFailedToScore) / 100);
        console.log(`\nPredição BTTS simples: (100-${spainFailedToScore}) × (100-${franceFailedToScore}) / 100 = ${simpleBttsPrediction}%`);
        console.log(`Predição BTTS sistema: ${data.combinedStats.bttsYesProbability}%`);
        
        console.log('\n=== 8. FORMA RECENTE ===');
        if (data.homeStats.recentForm && data.homeStats.recentForm.length > 0) {
            console.log('\nÚltimos jogos Espanha:');
            data.homeStats.recentForm.slice(0, 5).forEach((match, index) => {
                console.log(`  ${index + 1}. vs ${match.opponent} (${match.isHome ? 'Casa' : 'Fora'}): ${match.goalsScored}-${match.goalsConceded}, BTTS: ${match.bttsResult}`);
            });
        }
        
        if (data.awayStats.recentForm && data.awayStats.recentForm.length > 0) {
            console.log('\nÚltimos jogos França:');
            data.awayStats.recentForm.slice(0, 5).forEach((match, index) => {
                console.log(`  ${index + 1}. vs ${match.opponent} (${match.isHome ? 'Casa' : 'Fora'}): ${match.goalsScored}-${match.goalsConceded}, BTTS: ${match.bttsResult}`);
            });
        }
        
        console.log('\n=== RESUMO DOS PROBLEMAS IDENTIFICADOS ===');
        
        if (problems.length === 0) {
            console.log('✅ NENHUM PROBLEMA CRÍTICO ENCONTRADO');
        } else {
            problems.forEach(problem => console.log(`❌ ${problem}`));
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no teste:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testBTTS5Games();
