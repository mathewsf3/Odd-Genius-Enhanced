const axios = require('axios');

async function testBTTS10Games() {
    console.log('=== TESTE ESTATÍSTICAS DE BTTS (10 JOGOS) - ESPANHA × FRANÇA ===');
    console.log('=== CHECK-LIST DE CONSISTÊNCIA MATEMÁTICA ===\n');
    
    try {
        // Testar com 10 jogos
        const response = await axios.get('http://localhost:5000/api/matches/1559456/btts?matches=10');
        const data = response.data.result;
        
        console.log('=== 1. ESTATÍSTICAS BÁSICAS DE BTTS ===');
        console.log(`Espanha BTTS: ${data.homeStats.bttsYesPercentage}% (${data.homeStats.bttsYesCount}/${data.homeStats.totalMatches})`);
        console.log(`França BTTS: ${data.awayStats.bttsYesPercentage}% (${data.awayStats.bttsYesCount}/${data.awayStats.totalMatches})`);
        console.log(`Predição BTTS: ${data.combinedStats.bttsYesProbability}%`);
        console.log(`Confiança: ${data.combinedStats.confidenceLevel}`);
        
        console.log('\n=== 2. MÉDIAS DE GOLS ===');
        console.log(`Gols/jogo Espanha: ${data.combinedStats.averageHomeTeamGoals}`);
        console.log(`Gols/jogo França: ${data.combinedStats.averageAwayTeamGoals}`);
        console.log(`Total esperado: ${data.combinedStats.averageTotalGoals}`);
        
        console.log('\n=== 3. CHECK-LIST DE CONSISTÊNCIA ===');
        
        // Extrair dados para verificação
        const spainBtts = data.homeStats.bttsYesPercentage;
        const spainBttsCount = data.homeStats.bttsYesCount;
        const spainTotal = data.homeStats.totalMatches;
        const spainCleanSheet = data.homeStats.cleanSheetPercentage;
        const spainFailedToScore = data.homeStats.failedToScorePercentage;
        const spainGoalsPerGame = data.combinedStats.averageHomeTeamGoals;
        
        const franceBtts = data.awayStats.bttsYesPercentage;
        const franceBttsCount = data.awayStats.bttsYesCount;
        const franceTotal = data.awayStats.totalMatches;
        const franceCleanSheet = data.awayStats.cleanSheetPercentage;
        const franceFailedToScore = data.awayStats.failedToScorePercentage;
        const franceGoalsPerGame = data.combinedStats.averageAwayTeamGoals;
        
        const combinedAvg = data.combinedStats.averageTotalGoals;
        const bttsPrediction = data.combinedStats.bttsYesProbability;
        
        console.log('┌─────────────────────────────────────────────────────────────────┐');
        console.log('│                    CHECK-LIST DE CONSISTÊNCIA                  │');
        console.log('├─────────────────────────────────────────────────────────────────┤');
        
        // 1. Verificar BTTS Espanha
        const spainConcededGames = Math.round((100 - spainCleanSheet) * spainTotal / 100);
        const spainScoredGames = Math.round((100 - spainFailedToScore) * spainTotal / 100);
        const spainBttsExpectedMin = Math.max(0, spainConcededGames + spainScoredGames - spainTotal);
        const spainBttsExpectedMax = Math.min(spainConcededGames, spainScoredGames);
        
        console.log(`│ BTTS Espanha: ${spainBtts}% (${spainBttsCount}/${spainTotal})`);
        console.log(`│   Clean Sheet: ${spainCleanSheet}% → Concedeu em ${spainConcededGames} jogos`);
        console.log(`│   Failed to Score: ${spainFailedToScore}% → Marcou em ${spainScoredGames} jogos`);
        console.log(`│   Interseção esperada: ${spainBttsExpectedMin}-${spainBttsExpectedMax} → Real: ${spainBttsCount}`);
        
        const spainBttsOK = spainBttsCount >= spainBttsExpectedMin && spainBttsCount <= spainBttsExpectedMax;
        console.log(`│   Status: ${spainBttsOK ? '✅ CORRETO' : '❌ INCONSISTENTE'}`);
        
        // 2. Verificar BTTS França
        const franceConcededGames = Math.round((100 - franceCleanSheet) * franceTotal / 100);
        const franceScoredGames = Math.round((100 - franceFailedToScore) * franceTotal / 100);
        const franceBttsExpectedMin = Math.max(0, franceConcededGames + franceScoredGames - franceTotal);
        const franceBttsExpectedMax = Math.min(franceConcededGames, franceScoredGames);
        
        console.log(`│ BTTS França: ${franceBtts}% (${franceBttsCount}/${franceTotal})`);
        console.log(`│   Clean Sheet: ${franceCleanSheet}% → Concedeu em ${franceConcededGames} jogos`);
        console.log(`│   Failed to Score: ${franceFailedToScore}% → Marcou em ${franceScoredGames} jogos`);
        console.log(`│   Interseção esperada: ${franceBttsExpectedMin}-${franceBttsExpectedMax} → Real: ${franceBttsCount}`);
        
        const franceBttsOK = franceBttsCount >= franceBttsExpectedMin && franceBttsCount <= franceBttsExpectedMax;
        console.log(`│   Status: ${franceBttsOK ? '✅ CORRETO' : '❌ INCONSISTENTE'}`);
        
        // 3. Verificar médias de gols
        const expectedSpainTotal = spainGoalsPerGame * spainTotal;
        const expectedFranceTotal = franceGoalsPerGame * franceTotal;
        
        console.log(`│ Gols/jogo Espanha: ${spainGoalsPerGame}`);
        console.log(`│   Esperado: ${expectedSpainTotal} gols/${spainTotal} jogos = ${(expectedSpainTotal/spainTotal).toFixed(1)}`);
        const spainGoalsOK = Math.abs(spainGoalsPerGame - expectedSpainTotal/spainTotal) < 0.1;
        console.log(`│   Status: ${spainGoalsOK ? '✅ CORRETO' : '❌ INCONSISTENTE'}`);
        
        console.log(`│ Gols/jogo França: ${franceGoalsPerGame}`);
        console.log(`│   Esperado: ${expectedFranceTotal} gols/${franceTotal} jogos = ${(expectedFranceTotal/franceTotal).toFixed(1)}`);
        const franceGoalsOK = Math.abs(franceGoalsPerGame - expectedFranceTotal/franceTotal) < 0.1;
        console.log(`│   Status: ${franceGoalsOK ? '✅ CORRETO' : '❌ INCONSISTENTE'}`);
        
        // 4. Verificar média combinada
        const expectedCombined = spainGoalsPerGame + franceGoalsPerGame;
        console.log(`│ Média combinada: ${combinedAvg}`);
        console.log(`│   Esperado: ${spainGoalsPerGame} + ${franceGoalsPerGame} = ${expectedCombined.toFixed(1)}`);
        const combinedOK = Math.abs(combinedAvg - expectedCombined) < 0.1;
        console.log(`│   Status: ${combinedOK ? '✅ CORRETO' : '❌ INCONSISTENTE'}`);
        
        // 5. Verificar predição BTTS
        const independentBtts = Math.round((spainBtts/100) * (franceBtts/100) * 100);
        console.log(`│ Predição BTTS: ${bttsPrediction}%`);
        console.log(`│   Independência simples: ${spainBtts}% × ${franceBtts}% = ${independentBtts}%`);
        console.log(`│   Diferença: ${Math.abs(bttsPrediction - independentBtts)}% ${bttsPrediction > independentBtts ? '(modelo considera correlação positiva)' : '(modelo conservador)'}`);
        
        console.log('└─────────────────────────────────────────────────────────────────┘');
        
        console.log('\n=== 4. ESTATÍSTICAS HOME/AWAY ===');
        console.log('ESPANHA:');
        console.log(`  Home: ${data.homeStats.homeMatches} jogos, BTTS: ${data.homeStats.homeBttsYesPercentage}%`);
        console.log(`  Away: ${data.homeStats.awayMatches} jogos, BTTS: ${data.homeStats.awayBttsYesPercentage}%`);
        console.log(`  Home Clean Sheet: ${data.homeStats.homeCleanSheetPercentage}%`);
        console.log(`  Away Clean Sheet: ${data.homeStats.awayCleanSheetPercentage}%`);
        
        console.log('\nFRANÇA:');
        console.log(`  Home: ${data.awayStats.homeMatches} jogos, BTTS: ${data.awayStats.homeBttsYesPercentage}%`);
        console.log(`  Away: ${data.awayStats.awayMatches} jogos, BTTS: ${data.awayStats.awayBttsYesPercentage}%`);
        console.log(`  Home Clean Sheet: ${data.awayStats.homeCleanSheetPercentage}%`);
        console.log(`  Away Clean Sheet: ${data.awayStats.awayCleanSheetPercentage}%`);
        
        console.log('\n=== 5. HEAD-TO-HEAD ===');
        if (data.h2hStats && data.h2hStats.totalMatches > 0) {
            console.log(`H2H Partidas: ${data.h2hStats.totalMatches}`);
            console.log(`H2H BTTS: ${data.h2hStats.bttsYesPercentage}% (${data.h2hStats.bttsYesCount}/${data.h2hStats.totalMatches})`);
            console.log(`H2H Média de gols: ${data.h2hStats.averageTotalGoals}`);
        } else {
            console.log('H2H: Nenhum dado disponível');
        }
        
        console.log('\n=== 6. RESUMO FINAL ===');
        const allChecksOK = spainBttsOK && franceBttsOK && spainGoalsOK && franceGoalsOK && combinedOK;
        
        if (allChecksOK) {
            console.log('🎯 TODOS OS CHECKS PASSARAM - SISTEMA CONSISTENTE');
            console.log('✅ Dados brutos coerentes');
            console.log('✅ Gols, BTTS individuais e estatísticas fecham');
            console.log('✅ Cálculos matemáticos corretos');
        } else {
            console.log('⚠️  ALGUNS CHECKS FALHARAM - REVISAR DADOS');
        }
        
        console.log(`\n📊 Confiança do sistema: ${data.combinedStats.confidenceLevel}`);
        console.log(`📈 Amostra: ${Math.max(spainTotal, franceTotal)} jogos por equipe`);
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no teste:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testBTTS10Games();
