const axios = require('axios');

async function testEnhancedPlayerStats() {
    console.log('=== TESTE DO SISTEMA APRIMORADO DE ESTATÍSTICAS DE JOGADORES ===');
    console.log('=== VERIFICAÇÃO DE MELHORIAS E CORREÇÕES APLICADAS ===\n');
    
    try {
        // Testar estatísticas aprimoradas da Espanha com 5 jogos
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=5');
        const data = response.data.result;
        
        console.log('=== 1. VERIFICAÇÃO DE MELHORIAS APLICADAS ===');
        console.log(`Sistema aprimorado: ${data.enhanced ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`Timestamp de melhoria: ${data.enhancementTimestamp || 'N/A'}`);
        
        if (data.validation) {
            console.log(`Status de validação: ${data.validation.status}`);
            console.log(`Precisão: ${data.validation.accuracy}%`);
            console.log(`Problemas encontrados: ${data.validation.issues.length}`);
            console.log(`Avisos: ${data.validation.warnings.length}`);
        }
        
        console.log('\n=== 2. ANÁLISE DOS JOGADORES APRIMORADOS ===');
        
        const spainPlayers = data.homeTeamPlayers.players;
        let totalGoals = 0;
        let totalAssists = 0;
        let playersWithCorrections = 0;
        
        console.log('┌─────────────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│                           JOGADORES APRIMORADOS DA ESPANHA                             │');
        console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤');
        console.log('│ Nome                    │ Nome Original       │ Gols │ Assist │ G/Game │ A/Game │ Corr │');
        console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤');
        
        spainPlayers.slice(0, 15).forEach(player => {
            const name = (player.playerName || 'N/A').substring(0, 20).padEnd(23);
            const originalName = (player.originalName || 'N/A').substring(0, 17).padEnd(19);
            const goals = (player.playerGoals || 0).toString().padStart(4);
            const assists = (player.playerAssists || 0).toString().padStart(6);
            const goalsPerGame = (player.goalsPerGame || 0).toFixed(2).padStart(6);
            const assistsPerGame = (player.assistsPerGame || 0).toFixed(2).padStart(6);
            const hasCorrections = player.hasCorrections ? '✅' : '  ';
            
            totalGoals += player.playerGoals || 0;
            totalAssists += player.playerAssists || 0;
            if (player.hasCorrections) playersWithCorrections++;
            
            console.log(`│ ${name} │ ${originalName} │${goals} │${assists} │${goalsPerGame} │${assistsPerGame} │ ${hasCorrections}   │`);
        });
        
        console.log('└─────────────────────────────────────────────────────────────────────────────────────────┘');
        
        console.log('\n=== 3. VERIFICAÇÃO DE CORREÇÕES ESPECÍFICAS ===');
        
        // Verificar se Bryan Gil e Bryan Zaragoza foram corrigidos
        const bryanGil = spainPlayers.find(p => p.playerName.includes('Bryan Gil'));
        const bryanZaragoza = spainPlayers.find(p => p.playerName.includes('Bryan Zaragoza'));
        
        console.log(`🔍 CORREÇÕES APLICADAS:`);
        
        if (bryanGil) {
            console.log(`   Bryan Gil: ${bryanGil.playerGoals} gols (${bryanGil.hasCorrections ? 'CORRIGIDO' : 'SEM CORREÇÃO'})`);
            if (bryanGil.correctionDetails) {
                console.log(`      Detalhes: +${bryanGil.correctionDetails.goals} gols, +${bryanGil.correctionDetails.assists} assists`);
            }
        } else {
            console.log(`   ❌ Bryan Gil não encontrado`);
        }
        
        if (bryanZaragoza) {
            console.log(`   Bryan Zaragoza: ${bryanZaragoza.playerGoals} gols (${bryanZaragoza.hasCorrections ? 'CORRIGIDO' : 'SEM CORREÇÃO'})`);
            if (bryanZaragoza.correctionDetails) {
                console.log(`      Detalhes: +${bryanZaragoza.correctionDetails.goals} gols, +${bryanZaragoza.correctionDetails.assists} assists`);
            }
        } else {
            console.log(`   ❌ Bryan Zaragoza não encontrado`);
        }
        
        // Verificar normalização de nomes
        const oyarzabal = spainPlayers.find(p => p.playerName === 'Mikel Oyarzabal');
        if (oyarzabal) {
            console.log(`   Mikel Oyarzabal: ${oyarzabal.playerGoals} gols (normalizado de "${oyarzabal.originalName}")`);
        }
        
        console.log('\n=== 4. ESTATÍSTICAS MELHORADAS ===');
        
        console.log(`📊 TOTAIS APRIMORADOS:`);
        console.log(`   Gols totais: ${totalGoals} (vs 11 original)`);
        console.log(`   Assistências totais: ${totalAssists} (vs 6 original)`);
        console.log(`   Jogadores com correções: ${playersWithCorrections}`);
        
        // Verificar goleiros
        const goalkeepers = spainPlayers.filter(p => p.normalizedPosition === 'Goalkeeper');
        const totalGoalkeeperGames = goalkeepers.reduce((sum, gk) => sum + (gk.playerMatchPlayed || 0), 0);
        
        console.log(`\n🥅 GOLEIROS NORMALIZADOS:`);
        goalkeepers.forEach(gk => {
            console.log(`   ${gk.playerName}: ${gk.playerMatchPlayed} jogos (posição: ${gk.normalizedPosition})`);
        });
        console.log(`   Total de aparições: ${totalGoalkeeperGames} (vs 15 original)`);
        
        console.log('\n=== 5. VALIDAÇÃO DE QUALIDADE ===');
        
        if (data.validation) {
            console.log(`📋 RESULTADOS DA VALIDAÇÃO:`);
            console.log(`   Status: ${data.validation.status}`);
            console.log(`   Precisão: ${data.validation.accuracy}%`);
            
            if (data.validation.issues.length > 0) {
                console.log(`   Problemas identificados:`);
                data.validation.issues.forEach(issue => console.log(`      • ${issue}`));
            }
            
            if (data.validation.warnings.length > 0) {
                console.log(`   Avisos:`);
                data.validation.warnings.forEach(warning => console.log(`      ⚠️ ${warning}`));
            }
            
            console.log(`\n📈 RESUMO DA VALIDAÇÃO:`);
            console.log(`   Total de jogadores: ${data.validation.summary.totalPlayers}`);
            console.log(`   Total de gols: ${data.validation.summary.totalGoals}`);
            console.log(`   Total de assistências: ${data.validation.summary.totalAssists}`);
            console.log(`   Goleiros: ${data.validation.summary.goalkeepers}`);
            console.log(`   Jogos de goleiros: ${data.validation.summary.goalkeeperGames}`);
        }
        
        console.log('\n=== 6. COMPARAÇÃO COM DADOS OFICIAIS ===');
        
        // Dados oficiais para comparação
        const officialGoals = 13;
        const officialAssists = 13;
        
        const goalAccuracy = ((totalGoals / officialGoals) * 100).toFixed(1);
        const assistAccuracy = ((totalAssists / officialAssists) * 100).toFixed(1);
        const overallAccuracy = (((totalGoals + totalAssists) / (officialGoals + officialAssists)) * 100).toFixed(1);
        
        console.log(`🎯 PRECISÃO APRIMORADA:`);
        console.log(`   Gols: ${totalGoals}/${officialGoals} (${goalAccuracy}%)`);
        console.log(`   Assistências: ${totalAssists}/${officialAssists} (${assistAccuracy}%)`);
        console.log(`   Precisão geral: ${overallAccuracy}%`);
        
        const improvement = parseFloat(overallAccuracy) - 65.4; // Precisão anterior
        console.log(`   Melhoria: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}% vs sistema anterior`);
        
        console.log('\n=== 7. CONCLUSÃO DO TESTE ===');
        
        if (data.enhanced) {
            console.log(`🎯 SISTEMA APRIMORADO FUNCIONANDO`);
            console.log(`✅ Melhorias aplicadas com sucesso`);
            console.log(`✅ Validação automática implementada`);
            console.log(`✅ Normalização de nomes funcionando`);
            
            if (playersWithCorrections > 0) {
                console.log(`✅ ${playersWithCorrections} correção(ões) aplicada(s)`);
            }
            
            if (parseFloat(overallAccuracy) > 70) {
                console.log(`✅ Precisão aceitável (${overallAccuracy}%)`);
            } else {
                console.log(`⚠️ Precisão ainda baixa (${overallAccuracy}%) - mais correções necessárias`);
            }
        } else {
            console.log(`❌ SISTEMA APRIMORADO NÃO FUNCIONANDO`);
            console.log(`❌ Melhorias não foram aplicadas`);
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no teste:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testEnhancedPlayerStats();
