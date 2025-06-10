const axios = require('axios');

async function testPlayerCrossReference() {
    console.log('=== CROSS-REFERENCE ESTATÍSTICAS DE JOGADORES - ÚLTIMOS 5 JOGOS ===');
    console.log('=== VERIFICAÇÃO DINÂMICA CONTRA DADOS OFICIAIS ===\n');
    
    try {
        // Dados oficiais dos últimos 5 jogos da Espanha (referência)
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
                        { player: 'N. Williams', for: 'Oyarzabal' },
                        { player: 'Grimaldo', for: 'Oyarzabal' },
                        { player: 'Oyarzabal', for: 'Lamine Yamal' }
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
                        { player: 'Navas', for: 'Nico Williams' },
                        { player: 'Cucurella', for: 'Mikel Merino' }
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
                        { player: 'Fabián', for: 'Bryan Gil' },
                        { player: 'Zaragoza', for: 'Bryan Zaragoza' }
                    ]
                },
                {
                    date: '2024-11-15',
                    opponent: 'Dinamarca',
                    score: '2-1',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Mikel Oyarzabal', minute: 15, type: 'normal' },
                        { player: 'Ayoze Pérez', minute: 58, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Grimaldo', for: 'Mikel Oyarzabal' },
                        { player: 'Oyarzabal', for: 'Ayoze Pérez' }
                    ]
                },
                {
                    date: '2024-10-15',
                    opponent: 'Sérvia',
                    score: '3-0',
                    competition: 'Nations League',
                    goals: [
                        { player: 'Aymeric Laporte', minute: 34, type: 'normal' },
                        { player: 'Álvaro Morata', minute: 48, type: 'normal' },
                        { player: 'Álex Baena', minute: 79, type: 'normal' }
                    ],
                    assists: [
                        { player: 'Nico Williams', for: 'Aymeric Laporte' },
                        { player: 'Nico Williams', for: 'Álvaro Morata' },
                        { player: 'Porro', for: 'Álex Baena' }
                    ]
                }
            ]
        };

        // Buscar dados do sistema
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=5');
        const systemData = response.data.result;
        
        console.log('=== 1. RESUMO DOS DADOS OFICIAIS ===');
        let totalOfficialGoals = 0;
        let totalOfficialAssists = 0;
        
        officialData.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.date} vs ${match.opponent} (${match.score})`);
            console.log(`   Gols: ${match.goals.map(g => `${g.player} ${g.minute}'`).join(', ')}`);
            console.log(`   Assists: ${match.assists.map(a => `${a.player} → ${a.for}`).join(', ')}`);
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
        
        console.log('\n=== 2. CROSS-REFERENCE GOLEADORES ===');
        
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
                // Normalizar nome para comparação
                let normalizedName = player.playerName;
                if (normalizedName.includes('Oyarzabal')) normalizedName = 'Oyarzabal';
                if (normalizedName.includes('Ayoze')) normalizedName = 'Ayoze Pérez';
                if (normalizedName.includes('Nico Williams')) normalizedName = 'Nico Williams';
                if (normalizedName.includes('Laporte')) normalizedName = 'Aymeric Laporte';
                if (normalizedName.includes('Baena')) normalizedName = 'Álex Baena';
                if (normalizedName.includes('Merino')) normalizedName = 'Mikel Merino';
                if (normalizedName.includes('Lamine')) normalizedName = 'Lamine Yamal';
                if (normalizedName.includes('Pino')) normalizedName = 'Yeremy Pino';
                if (normalizedName.includes('Bryan Gil')) normalizedName = 'Bryan Gil';
                if (normalizedName.includes('Zaragoza')) normalizedName = 'Bryan Zaragoza';
                
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
        
        console.log('\n=== 3. CROSS-REFERENCE ASSISTÊNCIAS ===');
        
        // Criar mapa de assistências oficiais
        const officialAssists = {};
        officialData.matches.forEach(match => {
            match.assists.forEach(assist => {
                const playerName = assist.player;
                officialAssists[playerName] = (officialAssists[playerName] || 0) + 1;
            });
        });
        
        // Criar mapa de assistências do sistema
        const systemAssists = {};
        spainPlayers.forEach(player => {
            if (player.playerAssists > 0) {
                let normalizedName = player.playerName;
                if (normalizedName.includes('Nico Williams')) normalizedName = 'Nico Williams';
                if (normalizedName.includes('Grimaldo')) normalizedName = 'Grimaldo';
                if (normalizedName.includes('Oyarzabal')) normalizedName = 'Oyarzabal';
                if (normalizedName.includes('Navas')) normalizedName = 'Navas';
                if (normalizedName.includes('Cucurella')) normalizedName = 'Cucurella';
                if (normalizedName.includes('Pedri')) normalizedName = 'Pedri';
                if (normalizedName.includes('Fabián')) normalizedName = 'Fabián';
                if (normalizedName.includes('Porro')) normalizedName = 'Porro';
                
                systemAssists[normalizedName] = player.playerAssists;
            }
        });
        
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│                   COMPARAÇÃO DE ASSISTÊNCIAS               │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        console.log('│ Jogador              │ Oficial │ Sistema │ Status          │');
        console.log('├─────────────────────────────────────────────────────────────┤');
        
        const allAssisters = new Set([...Object.keys(officialAssists), ...Object.keys(systemAssists)]);
        let missingAssists = 0;
        let extraAssists = 0;
        
        [...allAssisters].sort().forEach(player => {
            const official = officialAssists[player] || 0;
            const system = systemAssists[player] || 0;
            const diff = system - official;
            
            let status = '✅ CORRETO';
            if (diff < 0) {
                status = `❌ FALTAM ${Math.abs(diff)}`;
                missingAssists += Math.abs(diff);
            } else if (diff > 0) {
                status = `⚠️ EXTRA ${diff}`;
                extraAssists += diff;
            }
            
            const playerFormatted = player.length > 18 ? player.substring(0, 18) + '..' : player.padEnd(20);
            const officialFormatted = official.toString().padStart(7);
            const systemFormatted = system.toString().padStart(7);
            
            console.log(`│ ${playerFormatted} │${officialFormatted} │${systemFormatted} │ ${status.padEnd(15)} │`);
        });
        
        console.log('└─────────────────────────────────────────────────────────────┘');
        
        console.log('\n=== 4. ANÁLISE DE DISCREPÂNCIAS ===');
        
        console.log(`📊 RESUMO QUANTITATIVO:`);
        console.log(`   Gols oficiais: ${totalOfficialGoals}`);
        console.log(`   Gols sistema: ${totalSystemGoals}`);
        console.log(`   Diferença: ${totalSystemGoals - totalOfficialGoals} gols`);
        console.log(`   Assistências oficiais: ${totalOfficialAssists}`);
        console.log(`   Assistências sistema: ${totalSystemAssists}`);
        console.log(`   Diferença: ${totalSystemAssists - totalOfficialAssists} assistências`);
        
        console.log(`\n🔍 PROBLEMAS IDENTIFICADOS:`);
        
        const issues = [];
        
        if (missingGoals > 0) {
            issues.push(`${missingGoals} gol(s) faltando no sistema`);
        }
        
        if (extraGoals > 0) {
            issues.push(`${extraGoals} gol(s) extra no sistema`);
        }
        
        if (missingAssists > 0) {
            issues.push(`${missingAssists} assistência(s) faltando no sistema`);
        }
        
        if (extraAssists > 0) {
            issues.push(`${extraAssists} assistência(s) extra no sistema`);
        }
        
        // Verificar goleiros
        const goalkeepers = spainPlayers.filter(p => p.playerType === 'Goalkeepers');
        const totalGoalkeeperGames = goalkeepers.reduce((sum, gk) => sum + (gk.playerMatchPlayed || 0), 0);
        
        if (totalGoalkeeperGames > 5) {
            issues.push(`Contagem dupla de goleiros (${totalGoalkeeperGames} aparições vs 5 esperadas)`);
        }
        
        if (issues.length === 0) {
            console.log(`   ✅ NENHUM PROBLEMA CRÍTICO ENCONTRADO`);
        } else {
            issues.forEach(issue => console.log(`   ❌ ${issue}`));
        }
        
        console.log('\n=== 5. RECOMENDAÇÕES DINÂMICAS ===');
        
        console.log(`💡 AJUSTES SUGERIDOS:`);
        
        if (missingGoals > 0) {
            console.log(`   • Verificar fonte de dados para gols faltantes`);
            console.log(`   • Possível problema: jogo Espanha 3-2 Suíça (Bryan Gil, Bryan Zaragoza)`);
        }
        
        if (missingAssists > 0) {
            console.log(`   • Importar feed oficial UEFA/Opta para assistências`);
            console.log(`   • Verificar "Key Pass" vs assistências oficiais`);
        }
        
        if (totalGoalkeeperGames > 5) {
            console.log(`   • Usar minutos jogados (>0) em vez de aparições para goleiros`);
            console.log(`   • Evitar contagem dupla titular + suplente`);
        }
        
        console.log(`   • Implementar normalização automática de nomes de jogadores`);
        console.log(`   • Conectar a endpoint UEFA JSON /matches/{id}/events para dados em tempo real`);
        console.log(`   • Adicionar validação cruzada com múltiplas fontes (ESPN, UEFA, FIFA)`);
        
        console.log('\n=== 6. CONCLUSÃO ===');
        
        const accuracy = ((totalSystemGoals + totalSystemAssists) / (totalOfficialGoals + totalOfficialAssists) * 100).toFixed(1);
        
        if (issues.length <= 2 && Math.abs(totalSystemGoals - totalOfficialGoals) <= 2) {
            console.log(`🎯 DADOS MAJORITARIAMENTE CORRETOS (${accuracy}% precisão)`);
            console.log(`✅ Sistema funcional para análises de apostas e scouting`);
            console.log(`⚠️ Pequenos ajustes necessários para 100% de precisão`);
        } else {
            console.log(`⚠️ DISCREPÂNCIAS SIGNIFICATIVAS ENCONTRADAS`);
            console.log(`📊 Precisão atual: ${accuracy}%`);
            console.log(`🔧 Revisão da fonte de dados necessária`);
        }
        
        console.log('\n=== CROSS-REFERENCE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no cross-reference:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPlayerCrossReference();
