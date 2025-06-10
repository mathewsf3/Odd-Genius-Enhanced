const axios = require('axios');

async function testCards10Games() {
    console.log('=== TESTE ESTATÍSTICAS DE CARTÕES (10 JOGOS) - FRANÇA × ESPANHA ===');
    
    try {
        // Testar com 10 jogos
        const response = await axios.get('http://localhost:5000/api/matches/1559456/cards?matches=10');
        const data = response.data.result;
        
        console.log('\n=== 1. MÉDIAS E TOTAIS BÁSICOS ===');
        console.log(`Espanha - Total: ${data.homeStats.totalCards}, Média: ${data.homeStats.averageCardsPerMatch}`);
        console.log(`  Amarelos: ${data.homeStats.averageYellowCardsPerMatch}, Vermelhos: ${data.homeStats.averageRedCardsPerMatch}`);
        console.log(`França - Total: ${data.awayStats.totalCards}, Média: ${data.awayStats.averageCardsPerMatch}`);
        console.log(`  Amarelos: ${data.awayStats.averageYellowCardsPerMatch}, Vermelhos: ${data.awayStats.averageRedCardsPerMatch}`);
        console.log(`Total Esperado: ${data.combinedStats.expectedCards}`);
        
        // Verificação matemática
        const expectedTotal = data.homeStats.averageCardsPerMatch + data.awayStats.averageCardsPerMatch;
        console.log(`\nVerificação: ${data.homeStats.averageCardsPerMatch} + ${data.awayStats.averageCardsPerMatch} = ${expectedTotal}`);
        console.log(`Valor retornado: ${data.combinedStats.expectedCards}`);
        console.log(expectedTotal === data.combinedStats.expectedCards ? '✅ Cálculo básico: CORRETO' : '❌ Cálculo básico: ERRO');
        
        console.log('\n=== 2. DISTRIBUIÇÃO POR TEMPO ===');
        console.log('Cartões por período:', JSON.stringify(data.combinedStats.cardsByPeriod, null, 2));
        
        // Verificar soma dos períodos
        const totalPeriods = Object.values(data.combinedStats.cardsByPeriod).reduce((sum, count) => sum + count, 0);
        const expectedTotalCards = data.homeStats.totalCards + data.awayStats.totalCards;
        console.log(`\nTotal cartões nos períodos: ${totalPeriods}`);
        console.log(`Total cartões esperado (10 jogos): ${expectedTotalCards}`);
        console.log(totalPeriods === expectedTotalCards ? '✅ Distribuição por tempo: AGREGADO CORRETO' : '❌ Distribuição por tempo: ERRO');
        
        console.log('\n=== 3. PROBABILIDADES OVER/UNDER ===');
        console.log('Over/Under rates:', JSON.stringify(data.combinedStats.overRates, null, 2));
        
        const lambda = data.combinedStats.expectedCards;
        console.log(`\nLambda (média esperada): ${lambda}`);
        console.log(`Over 3.5: ${data.combinedStats.overRates['3.5']}%`);
        console.log(`Over 4.5: ${data.combinedStats.overRates['4.5']}%`);
        console.log(`Over 5.5: ${data.combinedStats.overRates['5.5']}%`);
        
        // Verificar ordem lógica
        const over35 = data.combinedStats.overRates['3.5'];
        const over45 = data.combinedStats.overRates['4.5'];
        const over55 = data.combinedStats.overRates['5.5'];
        
        if (over55 <= over45 && over45 <= over35) {
            console.log('✅ Ordem lógica: CORRETA');
        } else {
            console.log('❌ Ordem lógica: ERRO');
        }
        
        // Verificar se as probabilidades são realistas para λ=4.5
        if (lambda >= 4.0 && lambda <= 5.0) {
            console.log(`Para λ=${lambda}, Over 3.5 deveria ser: Alto (60-80%)`);
            if (over35 >= 60 && over35 <= 80) {
                console.log('✅ Probabilidade Over 3.5: REALISTA');
            } else {
                console.log('⚠️ Probabilidade Over 3.5: VERIFICAR');
            }
        }
        
        console.log('\n=== 4. JOGADORES MAIS PUNIDOS ===');
        console.log(`Número de jogadores listados: ${data.combinedStats.mostCardedPlayers.length}`);
        
        if (data.combinedStats.mostCardedPlayers.length > 0) {
            console.log('Top 3 jogadores:');
            data.combinedStats.mostCardedPlayers.slice(0, 3).forEach((player, index) => {
                console.log(`  ${index + 1}. ${player.playerName} - ${player.totalCards} cartões`);
            });
            
            // Verificar se há nomes reais
            const hasRealNames = data.combinedStats.mostCardedPlayers.some(p => 
                p.playerName && !p.playerName.includes('Player') && !p.playerName.includes('Unknown')
            );
            console.log(hasRealNames ? '✅ Nomes reais: ENCONTRADOS' : '❌ Nomes reais: PLACEHOLDERS');
        }
        
        console.log('\n=== 5. METADADOS E QUALIDADE ===');
        console.log(`Partidas analisadas - Casa: ${data.homeStats.matchesAnalyzed}, Fora: ${data.awayStats.matchesAnalyzed}`);
        console.log('Fonte de dados: AllSportsAPI');
        
        if (data.combinedStats._debug) {
            console.log('Qualidade dos dados:', JSON.stringify({
                homeFixtures: data.combinedStats._debug.homeMatches,
                awayFixtures: data.combinedStats._debug.awayMatches,
                totalCardEvents: expectedTotalCards
            }, null, 2));
        }
        
        console.log('\n=== 6. INFORMAÇÕES DE DEBUG ===');
        if (data.combinedStats._debug) {
            console.log('Debug info:', JSON.stringify(data.combinedStats._debug, null, 2));
        }
        
        console.log('\n=== RESUMO DOS PROBLEMAS IDENTIFICADOS ===');
        
        // Verificar problemas
        const problems = [];
        
        if (data.homeStats.matchesAnalyzed < 10 || data.awayStats.matchesAnalyzed < 10) {
            problems.push('PROBLEMA 1: Menos de 10 partidas analisadas por equipe');
        }
        
        const hasPlaceholderNames = data.combinedStats.mostCardedPlayers.some(p => 
            p.playerName && (p.playerName.includes('Player') || p.playerName.includes('Unknown'))
        );
        if (hasPlaceholderNames) {
            problems.push('PROBLEMA 2: Jogadores com nomes placeholder ("Unknown Player", "Player X")');
        }
        
        if (totalPeriods !== expectedTotalCards) {
            problems.push('PROBLEMA 3: Soma dos períodos não confere com total de cartões');
        }
        
        if (!(over55 <= over45 && over45 <= over35)) {
            problems.push('PROBLEMA 4: Ordem lógica das probabilidades Over/Under incorreta');
        }
        
        if (problems.length === 0) {
            console.log('✅ NENHUM PROBLEMA CRÍTICO ENCONTRADO');
        } else {
            problems.forEach(problem => console.log(`❌ ${problem}`));
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no teste:', error.response?.data?.message || error.message);
    }
}

testCards10Games();
