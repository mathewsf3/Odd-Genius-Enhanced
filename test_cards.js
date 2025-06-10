const axios = require('axios');

async function testCardStats() {
  try {
    console.log('=== TESTE ESTATÍSTICAS DE CARTÕES (5 JOGOS) - VERSÃO CORRIGIDA ===');

    // Limpar cache primeiro para testar as correções
    console.log('Limpando cache...');
    try {
      const clearResponse = await axios.post('http://localhost:5000/api/cache/clear');
      console.log('✅ Cache limpo com sucesso:', clearResponse.data.message);
    } catch (cacheError) {
      console.log('⚠️ Erro ao limpar cache:', cacheError.response?.data?.message || cacheError.message);
      console.log('Continuando com teste...');
    }

    const response = await axios.get('http://localhost:5000/api/matches/1559456/cards?matches=5');
    const data = response.data.result;
    
    console.log('\n=== 1. MÉDIAS E TOTAIS BÁSICOS ===');
    console.log(`Espanha - Total: ${data.homeStats.totalCards}, Média: ${data.homeStats.averageCardsPerMatch}`);
    console.log(`  Amarelos: ${data.homeStats.averageYellowCardsPerMatch}, Vermelhos: ${data.homeStats.averageRedCardsPerMatch}`);
    console.log(`França - Total: ${data.awayStats.totalCards}, Média: ${data.awayStats.averageCardsPerMatch}`);
    console.log(`  Amarelos: ${data.awayStats.averageYellowCardsPerMatch}, Vermelhos: ${data.awayStats.averageRedCardsPerMatch}`);
    console.log(`Total Esperado: ${data.combinedStats.expectedCards}`);
    
    // Verificar cálculos básicos
    const expectedTotal = data.homeStats.averageCardsPerMatch + data.awayStats.averageCardsPerMatch;
    console.log(`\nVerificação: ${data.homeStats.averageCardsPerMatch} + ${data.awayStats.averageCardsPerMatch} = ${expectedTotal}`);
    console.log(`Valor retornado: ${data.combinedStats.expectedCards}`);
    console.log(`✅ Cálculo básico: ${Math.abs(expectedTotal - data.combinedStats.expectedCards) < 0.01 ? 'CORRETO' : 'ERRO'}`);
    
    console.log('\n=== 2. DISTRIBUIÇÃO POR TEMPO ===');
    console.log('Cartões por período:', JSON.stringify(data.combinedStats.cardsByPeriod, null, 2));
    
    // Verificar se é agregado ou apenas último jogo
    const totalCardsInPeriods = Object.values(data.combinedStats.cardsByPeriod).reduce((sum, count) => sum + count, 0);
    const totalCardsExpected = data.homeStats.totalCards + data.awayStats.totalCards;
    console.log(`\nTotal cartões nos períodos: ${totalCardsInPeriods}`);
    console.log(`Total cartões esperado (5 jogos): ${totalCardsExpected}`);
    console.log(`${totalCardsInPeriods === totalCardsExpected ? '✅' : '❌'} Distribuição por tempo: ${totalCardsInPeriods === totalCardsExpected ? 'AGREGADO CORRETO' : 'POSSÍVEL ERRO - APENAS ÚLTIMO JOGO?'}`);
    
    console.log('\n=== 3. PROBABILIDADES OVER/UNDER ===');
    console.log('Over/Under rates:', JSON.stringify(data.combinedStats.overRates, null, 2));
    
    // Verificar se as probabilidades fazem sentido com λ = expectedTotal
    const lambda = data.combinedStats.expectedCards;
    console.log(`\nLambda (média esperada): ${lambda}`);
    
    // Verificar ordem lógica: over3.5 >= over4.5 >= over5.5
    const over35 = data.combinedStats.overRates['3.5'];
    const over45 = data.combinedStats.overRates['4.5'];
    const over55 = data.combinedStats.overRates['5.5'];
    
    console.log(`Over 3.5: ${over35}%`);
    console.log(`Over 4.5: ${over45}%`);
    console.log(`Over 5.5: ${over55}%`);
    
    const logicalOrder = over35 >= over45 && over45 >= over55;
    console.log(`${logicalOrder ? '✅' : '❌'} Ordem lógica: ${logicalOrder ? 'CORRETA' : 'ERRO'}`);
    
    // Verificar se são valores realísticos para λ=7.0
    const expectedOver35 = lambda > 6 ? 'Alto (>80%)' : lambda > 4 ? 'Médio (50-80%)' : 'Baixo (<50%)';
    console.log(`Para λ=${lambda}, Over 3.5 deveria ser: ${expectedOver35}`);
    
    console.log('\n=== 4. JOGADORES MAIS PUNIDOS ===');
    console.log(`Número de jogadores listados: ${data.combinedStats.mostCardedPlayers.length}`);
    
    if (data.combinedStats.mostCardedPlayers.length > 0) {
      console.log('Top 3 jogadores:');
      data.combinedStats.mostCardedPlayers.slice(0, 3).forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.playerName || 'Nome não disponível'} - ${player.totalCards} cartões`);
      });
      
      const hasRealNames = data.combinedStats.mostCardedPlayers.some(p => 
        p.playerName && !p.playerName.includes('Unknown') && !p.playerName.includes('Player')
      );
      console.log(`${hasRealNames ? '✅' : '❌'} Nomes reais: ${hasRealNames ? 'DISPONÍVEIS' : 'PLACEHOLDERS'}`);
    } else {
      console.log('❌ Nenhum jogador listado');
    }
    
    console.log('\n=== 5. METADADOS E QUALIDADE ===');
    console.log(`Partidas analisadas - Casa: ${data.homeStats.matchesAnalyzed}, Fora: ${data.awayStats.matchesAnalyzed}`);
    console.log(`Fonte de dados: ${data.metadata.dataSource}`);
    console.log(`Qualidade dos dados:`, JSON.stringify(data.metadata.dataQuality, null, 2));

    // Verificar dados de debug se disponíveis
    if (data.combinedStats._debug) {
      console.log('\n=== 6. INFORMAÇÕES DE DEBUG ===');
      console.log('Debug info:', JSON.stringify(data.combinedStats._debug, null, 2));
    }
    
    console.log('\n=== RESUMO DOS PROBLEMAS IDENTIFICADOS ===');
    
    // Problema 1: Verificar se distribuição por tempo é agregada
    if (totalCardsInPeriods !== totalCardsExpected) {
      console.log('❌ PROBLEMA 1: Distribuição por tempo parece mostrar apenas último jogo, não agregado de 5 jogos');
    }
    
    // Problema 2: Verificar nomes de jogadores
    const hasPlaceholderNames = data.combinedStats.mostCardedPlayers.some(p => 
      !p.playerName || p.playerName.includes('Unknown') || p.playerName.includes('Player')
    );
    if (hasPlaceholderNames) {
      console.log('❌ PROBLEMA 2: Jogadores com nomes placeholder ("Unknown Player", "Player X")');
    }
    
    // Problema 3: Verificar se probabilidades são realísticas
    if (over35 < 70 && lambda > 6) {
      console.log(`❌ PROBLEMA 3: Over 3.5 muito baixo (${over35}%) para λ=${lambda}`);
    }
    
    // Problema 4: Verificar se há dados de cartões vermelhos altos
    const avgRed = (data.homeStats.averageRedCardsPerMatch + data.awayStats.averageRedCardsPerMatch) / 2;
    if (avgRed > 0.5) {
      console.log(`❌ PROBLEMA 4: Média de cartões vermelhos muito alta (${avgRed.toFixed(2)} por jogo) - verificar se inclui segundo amarelo`);
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

testCardStats();
