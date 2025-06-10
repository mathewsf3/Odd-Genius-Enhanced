const axios = require('axios');

async function testPlayerCrossReference10() {
    console.log('=== CROSS-REFERENCE ESTATÍSTICAS DE JOGADORES - ÚLTIMOS 10 JOGOS ===');
    console.log('=== VERIFICAÇÃO DINÂMICA CONTRA DADOS OFICIAIS ===\n');
    
    try {
        // Dados oficiais dos últimos 10 jogos da Espanha (referência)
        const officialData = {
            matches: [
                {
                    date: '2025-03-23',
                    opponent: 'Holanda',
                    score: '3-3',
                    competition: 'Nations League QF',
                    goals: [
                        { player: 'Oyarzabal', minute: 8, type: 'penalty' },
                        { player: 'Oyarzabal', minute: 67, type: 'normal' },
                        { player: 'Lamine Yamal', minute: 103, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Nico Williams', for: 'Oyarzabal' },
                        { player: 'Cucurella', for: 'Lamine Yamal' }
                    ]
                },
                {
                    date: '2025-03-20',
                    opponent: 'Holanda',
                    score: '2-2',
                    competition: 'Nations League QF',
                    goals: [
                        { player: 'Nico Williams', minute: 9, type: 'normal' },
                        { player: 'Mikel Merino', minute: 93, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Lamine Yamal', for: 'Nico Williams' },
                        { player: 'Pedri', for: 'Mikel Merino' }
                    ]
                },
                {
                    date: '2024-11-18',
                    opponent: 'Suíça',
                    score: '3-2',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Yeremy Pino', minute: 32, type: 'normal' },
                        { player: 'Bryan Gil', minute: 68, type: 'normal' },
                        { player: 'Bryan Zaragoza', minute: 93, type: 'penalty' }
                    ],
                    assists: [
                        { player: 'Pedri', for: 'Yeremy Pino' },
                        { player: 'Fabián Ruiz', for: 'Bryan Gil' },
                        { player: 'Zaragoza', for: 'Bryan Zaragoza' }
                    ]
                },
                {
                    date: '2024-11-15',
                    opponent: 'Dinamarca',
                    score: '2-1',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Oyarzabal', minute: 15, type: 'normal' },
                        { player: 'Ayoze Pérez', minute: 58, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Grimaldo', for: 'Oyarzabal' },
                        { player: 'Oyarzabal', for: 'Ayoze Pérez' }
                    ]
                },
                {
                    date: '2024-10-15',
                    opponent: 'Sérvia',
                    score: '3-0',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Laporte', minute: 5, type: 'normal' },
                        { player: 'Álvaro Morata', minute: 65, type: 'normal' },
                        { player: 'Álex Baena', minute: 77, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Fabián Ruiz', for: 'Laporte' },
                        { player: 'Fabián Ruiz', for: 'Álvaro Morata' }
                    ]
                },
                {
                    date: '2024-10-12',
                    opponent: 'Dinamarca',
                    score: '1-0',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Martín Zubimendi', minute: 79, type: 'normal' }
                    ],
                    assists: []
                },
                {
                    date: '2024-09-08',
                    opponent: 'Suíça',
                    score: '4-1',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Joselu', minute: 4, type: 'normal' },
                        { player: 'Fabián Ruiz', minute: 13, type: 'normal' },
                        { player: 'Fabián Ruiz', minute: 77, type: 'normal' },
                        { player: 'Ferran Torres', minute: 80, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Joselu', for: 'Fabián Ruiz' }
                    ]
                },
                {
                    date: '2024-09-05',
                    opponent: 'Sérvia',
                    score: '0-0',
                    competition: 'Nations League',
                    goals: [],
                    assists: []
                },
                {
                    date: '2024-07-14',
                    opponent: 'Inglaterra',
                    score: '2-1',
                    competition: 'Euro 2024 Final',
                    goals: [
                        { player: 'Nico Williams', minute: 47, type: 'normal' },
                        { player: 'Oyarzabal', minute: 86, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Lamine Yamal', for: 'Nico Williams' },
                        { player: 'Cucurella', for: 'Oyarzabal' }
                    ]
                },
                {
                    date: '2024-07-09',
                    opponent: 'França',
                    score: '2-1',
                    competition: 'Euro 2024 Semi',
                    goals: [
                        { player: 'Lamine Yamal', minute: 21, type: 'normal' },
                        { player: 'Dani Olmo', minute: 25, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Dani Olmo', for: 'Lamine Yamal' }
                    ]
                }
            ]
        };

        // Buscar dados do sistema
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=10');
        const systemData = response.data.result;
        
        console.log('=== 1. RESUMO DOS DADOS OFICIAIS (10 JOGOS) ===');
        let totalOfficialGoals = 0;
        let totalOfficialAssists = 0;
        
        officialData.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.date} vs ${match.opponent} (${match.score})`);
            if (match.goals.length > 0) {
                console.log(`   Gols: ${match.goals.map(g => `${g.player} ${g.minute}'`).join(', ')}`);
            } else {
                console.log(`   Gols: Nenhum`);
            }
            if (match.assists.length > 0) {
                console.log(`   Assists: ${match.assists.map(a => `${a.player} → ${a.for}`).join(', ')}`);
            } else {
                console.log(`   Assists: Nenhum`);
            }
            totalOfficialGoals += match.goals.length;
            totalOfficialAssists += match.assists.length;
        });
        
        console.log(`\nTotal oficial: ${totalOfficialGoals} gols, ${totalOfficialAssists} assistências`);
        
        // Processar dados do sistema
        const spainPlayers = systemData.homeTeamPlayers.players;
        let totalSystemGoals = 0;
        let totalSystemAssists = 0;
        
        spainPlayers.forEach(player => {
            totalSystemGoals += player.playerGoals || 0;
            totalSystemAssists += player.playerAssists || 0;
        });
        
        console.log(`Total sistema: ${totalSystemGoals} gols, ${totalSystemAssists} assistências`);
        
        console.log('\n=== 2. CROSS-REFERENCE GOLEADORES (10 JOGOS) ===');
        
        // Criar mapa de gols oficiais
        const officialGoals = {};
        officialData.matches.forEach(match => {
            match.goals.forEach(goal => {
                const playerName = goal.player;
                officialGoals[playerName] = (officialGoals[playerName] || 0) + 1;
            });
        });
        
        // Criar mapa de gols do sistema (normalizar nomes)
        const systemGoals = {};
        spainPlayers.forEach(player => {
            if (player.playerGoals > 0) {
                let normalizedName = player.playerName;
                
                // Normalização mais abrangente para 10 jogos
                if (normalizedName.includes('Oyarzabal')) normalizedName = 'Oyarzabal';
                if (normalizedName.includes('Ayoze')) normalizedName = 'Ayoze Pérez';
                if (normalizedName.includes('Nico Williams')) normalizedName = 'Nico Williams';
                if (normalizedName.includes('Laporte')) normalizedName = 'Laporte';
                if (normalizedName.includes('Baena')) normalizedName = 'Álex Baena';
                if (normalizedName.includes('Merino')) normalizedName = 'Mikel Merino';
                if (normalizedName.includes('Lamine')) normalizedName = 'Lamine Yamal';
                if (normalizedName.includes('Pino')) normalizedName = 'Yeremy Pino';
                if (normalizedName.includes('Bryan Gil')) normalizedName = 'Bryan Gil';
                if (normalizedName.includes('Zaragoza')) normalizedName = 'Bryan Zaragoza';
                if (normalizedName.includes('Zubimendi')) normalizedName = 'Martín Zubimendi';
                if (normalizedName.includes('Joselu')) normalizedName = 'Joselu';
                if (normalizedName.includes('Fabián')) normalizedName = 'Fabián Ruiz';
                if (normalizedName.includes('Ferran')) normalizedName = 'Ferran Torres';
                if (normalizedName.includes('Dani Olmo')) normalizedName = 'Dani Olmo';
                if (normalizedName.includes('Morata')) normalizedName = 'Álvaro Morata';
                
                systemGoals[normalizedName] = player.playerGoals;
            }
        });
        
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                    COMPARAÇÃO DE GOLEADORES                │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ Jogador              │ Oficial │ Sistema │ Status          │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        
        const allPlayers = new Set([...Object.keys(officialGoals), ...Object.keys(systemGoals)]);
        let missingGoals = 0;
        let extraGoals = 0;
        
        [...allPlayers].sort().forEach(player => {
            const official = officialGoals[player] || 0;
            const system = systemGoals[player] || 0;
            const diff = system - official;
            
            let status = '✅ CORRETO';
            if (diff < 0) {
                status = `❌ FALTAM ${Math.abs(diff)}`;
                missingGoals += Math.abs(diff);
            } else if (diff > 0) {
                status = `⚠️ EXTRA ${diff}`;
                extraGoals += diff;
            }
            
            const playerFormatted = player.length > 18 ? player.substring(0, 18) + '..' : player.padEnd(20);
            const officialFormatted = official.toString().padStart(7);
            const systemFormatted = system.toString().padStart(7);
            
            console.log(`│ ${playerFormatted} │${officialFormatted} │${systemFormatted} │ ${status.padEnd(15)} │`);
        });
        
        console.log('└─────────────────────────────────────────────────────────────┘');
        
        console.log('\n=== 3. PRINCIPAIS ARTILHEIROS OFICIAIS vs SISTEMA ===');
        
        // Top artilheiros oficiais
        const topOfficialScorers = Object.entries(officialGoals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
            
        console.log('\n📊 TOP ARTILHEIROS OFICIAIS (10 jogos):');
        topOfficialScorers.forEach(([player, goals], index) => {
            const systemGoalsForPlayer = systemGoals[player] || 0;
            const status = systemGoalsForPlayer === goals ? '✅' : '❌';
            console.log(`   ${index + 1}. ${player}: ${goals} gols (sistema: ${systemGoalsForPlayer}) ${status}`);
        });
        
        // Top artilheiros do sistema
        const topSystemScorers = Object.entries(systemGoals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
            
        console.log('\n📊 TOP ARTILHEIROS SISTEMA (10 jogos):');
        topSystemScorers.forEach(([player, goals], index) => {
            const officialGoalsForPlayer = officialGoals[player] || 0;
            const status = officialGoalsForPlayer === goals ? '✅' : '❌';
            console.log(`   ${index + 1}. ${player}: ${goals} gols (oficial: ${officialGoalsForPlayer}) ${status}`);
        });
        
        console.log('\n=== 4. JOGADORES FALTANTES NO SISTEMA ===');
        
        const missingPlayers = Object.entries(officialGoals)
            .filter(([player, goals]) => !systemGoals[player] && goals > 0);
            
        if (missingPlayers.length > 0) {
            console.log('❌ JOGADORES COM GOLS NÃO ENCONTRADOS NO SISTEMA:');
            missingPlayers.forEach(([player, goals]) => {
                console.log(`   • ${player}: ${goals} gol(s) oficial(is) - FALTANDO COMPLETAMENTE`);
            });
        } else {
            console.log('✅ Todos os goleadores oficiais estão presentes no sistema');
        }
        
        console.log('\n=== 5. ANÁLISE DE DISCREPÂNCIAS CRÍTICAS ===');
        
        console.log(`📊 RESUMO QUANTITATIVO (10 JOGOS):`);
        console.log(`   Gols oficiais: ${totalOfficialGoals}`);
        console.log(`   Gols sistema: ${totalSystemGoals}`);
        console.log(`   Diferença: ${totalSystemGoals - totalOfficialGoals} gols`);
        console.log(`   Assistências oficiais: ${totalOfficialAssists}`);
        console.log(`   Assistências sistema: ${totalSystemAssists}`);
        console.log(`   Diferença: ${totalSystemAssists - totalOfficialAssists} assistências`);
        
        const goalAccuracy = ((totalSystemGoals / totalOfficialGoals) * 100).toFixed(1);
        const assistAccuracy = ((totalSystemAssists / totalOfficialAssists) * 100).toFixed(1);
        const overallAccuracy = (((totalSystemGoals + totalSystemAssists) / (totalOfficialGoals + totalOfficialAssists)) * 100).toFixed(1);
        
        console.log(`\n🎯 PRECISÃO ATUAL (10 JOGOS):`);
        console.log(`   Gols: ${goalAccuracy}%`);
        console.log(`   Assistências: ${assistAccuracy}%`);
        console.log(`   Precisão geral: ${overallAccuracy}%`);
        
        console.log(`\n🔍 PROBLEMAS CRÍTICOS IDENTIFICADOS:`);
        
        const issues = [];
        
        if (missingGoals > 0) {
            issues.push(`${missingGoals} gol(s) faltando no sistema`);
        }
        
        if (extraGoals > 0) {
            issues.push(`${extraGoals} gol(s) extra no sistema`);
        }
        
        if (missingPlayers.length > 0) {
            issues.push(`${missingPlayers.length} jogador(es) goleador(es) completamente ausente(s)`);
        }
        
        if (totalSystemGoals < totalOfficialGoals * 0.8) {
            issues.push(`Dados muito incompletos (${goalAccuracy}% dos gols)`);
        }
        
        if (issues.length === 0) {
            console.log(`   ✅ NENHUM PROBLEMA CRÍTICO ENCONTRADO`);
        } else {
            issues.forEach(issue => console.log(`   ❌ ${issue}`));
        }
        
        console.log('\n=== 6. VERIFICAÇÃO DE GOLEIROS (10 JOGOS) ===');
        
        const goalkeepers = spainPlayers.filter(p => p.playerType === 'Goalkeepers');
        const totalGoalkeeperGames = goalkeepers.reduce((sum, gk) => sum + (gk.playerMatchPlayed || 0), 0);
        
        console.log(`🥅 ANÁLISE DE GOLEIROS:`);
        goalkeepers.forEach(gk => {
            console.log(`   ${gk.playerName}: ${gk.playerMatchPlayed} jogos`);
        });
        console.log(`   Total de aparições: ${totalGoalkeeperGames}`);
        console.log(`   Esperado: 10 jogos (1 por partida)`);
        console.log(`   Status: ${totalGoalkeeperGames === 10 ? '✅ CORRETO' : '⚠️ CONTAGEM DUPLA'}`);
        
        console.log('\n=== 7. RECOMENDAÇÕES ESPECÍFICAS (10 JOGOS) ===');
        
        console.log(`💡 CORREÇÕES URGENTES NECESSÁRIAS:`);
        
        if (missingPlayers.length > 0) {
            console.log(`   • Adicionar ${missingPlayers.length} jogador(es) goleador(es) faltante(s):`);
            missingPlayers.forEach(([player, goals]) => {
                console.log(`     - ${player}: ${goals} gol(s)`);
            });
        }
        
        if (totalSystemGoals < totalOfficialGoals) {
            const missingGoalsTotal = totalOfficialGoals - totalSystemGoals;
            console.log(`   • Corrigir ${missingGoalsTotal} gol(s) faltante(s) no total`);
        }
        
        if (totalSystemAssists < totalOfficialAssists) {
            const missingAssistsTotal = totalOfficialAssists - totalSystemAssists;
            console.log(`   • Corrigir ${missingAssistsTotal} assistência(s) faltante(s) no total`);
        }
        
        if (totalGoalkeeperGames > 10) {
            console.log(`   • Corrigir contagem dupla de goleiros (${totalGoalkeeperGames} vs 10)`);
        }
        
        console.log(`   • Implementar validação automática: Σ gols individuais = gols da equipe`);
        console.log(`   • Sincronizar com feed UEFA/Opta para assistências completas`);
        console.log(`   • Usar "minutos jogados" para evitar duplicação de goleiros`);
        
        console.log('\n=== 8. CONCLUSÃO FINAL (10 JOGOS) ===');
        
        if (parseFloat(overallAccuracy) >= 90) {
            console.log(`🎯 DADOS MAJORITARIAMENTE CORRETOS (${overallAccuracy}% precisão)`);
            console.log(`✅ Sistema adequado para análises com pequenos ajustes`);
        } else if (parseFloat(overallAccuracy) >= 70) {
            console.log(`⚠️ DADOS PARCIALMENTE CORRETOS (${overallAccuracy}% precisão)`);
            console.log(`🔧 Correções necessárias antes de uso em produção`);
        } else {
            console.log(`❌ DADOS SIGNIFICATIVAMENTE INCOMPLETOS (${overallAccuracy}% precisão)`);
            console.log(`🚨 REVISÃO URGENTE DA FONTE DE DADOS NECESSÁRIA`);
        }
        
        console.log(`\n📈 Comparação com análise de 5 jogos:`);
        console.log(`   5 jogos: 65.4% precisão`);
        console.log(`   10 jogos: ${overallAccuracy}% precisão`);
        console.log(`   Tendência: ${parseFloat(overallAccuracy) > 65.4 ? 'MELHORA' : 'PIORA'} com mais dados`);
        
        console.log('\n=== CROSS-REFERENCE 10 JOGOS CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no cross-reference:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPlayerCrossReference10();
