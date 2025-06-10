const playerStatsEnhancementService = require('./src/services/playerStatsEnhancementService');

async function testEnhancementServiceDirect() {
    console.log('=== TESTE DIRETO DO SERVIÇO DE MELHORIA ===');
    console.log('=== VERIFICAÇÃO DE FUNCIONALIDADE ===\n');
    
    try {
        // Dados de exemplo simulando a estrutura real
        const mockPlayerStats = {
            homeTeamPlayers: {
                teamId: "19",
                teamName: "Spain",
                players: [
                    {
                        playerId: "123",
                        playerName: "Mikel Oyarzabal",
                        playerType: "Forwards",
                        playerMatchPlayed: 4,
                        playerGoals: 3,
                        playerAssists: 0,
                        playerMinutesPlayed: 360
                    },
                    {
                        playerId: "124",
                        playerName: "Bryan Gil",
                        playerType: "Forwards",
                        playerMatchPlayed: 2,
                        playerGoals: 0,
                        playerAssists: 0,
                        playerMinutesPlayed: 180
                    },
                    {
                        playerId: "125",
                        playerName: "Bryan Zaragoza",
                        playerType: "Forwards",
                        playerMatchPlayed: 1,
                        playerGoals: 0,
                        playerAssists: 0,
                        playerMinutesPlayed: 90
                    },
                    {
                        playerId: "126",
                        playerName: "Álex Remiro",
                        playerType: "Goalkeepers",
                        playerMatchPlayed: 5,
                        playerGoals: 0,
                        playerAssists: 0,
                        playerMinutesPlayed: 450
                    },
                    {
                        playerId: "127",
                        playerName: "David Raya",
                        playerType: "Goalkeepers",
                        playerMatchPlayed: 5,
                        playerGoals: 0,
                        playerAssists: 0,
                        playerMinutesPlayed: 0
                    }
                ],
                gameCount: 5
            },
            awayTeamPlayers: {
                teamId: "22",
                teamName: "France",
                players: [
                    {
                        playerId: "200",
                        playerName: "Kylian Mbappé",
                        playerType: "Forwards",
                        playerMatchPlayed: 3,
                        playerGoals: 2,
                        playerAssists: 1,
                        playerMinutesPlayed: 270
                    }
                ],
                gameCount: 5
            },
            gameCount: 5
        };
        
        const matchInfo = {
            matchId: "1559456",
            homeTeamName: "Spain",
            awayTeamName: "France",
            date: "2025-06-03"
        };
        
        console.log('=== 1. DADOS ORIGINAIS ===');
        console.log(`Jogadores Espanha: ${mockPlayerStats.homeTeamPlayers.players.length}`);
        console.log(`Jogadores França: ${mockPlayerStats.awayTeamPlayers.players.length}`);
        
        // Mostrar alguns jogadores originais
        console.log('\nJogadores originais da Espanha:');
        mockPlayerStats.homeTeamPlayers.players.forEach(player => {
            console.log(`  ${player.playerName}: ${player.playerGoals}G, ${player.playerAssists}A, ${player.playerMatchPlayed} jogos`);
        });
        
        console.log('\n=== 2. APLICANDO MELHORIAS ===');
        
        // Aplicar melhorias
        const enhancedStats = playerStatsEnhancementService.enhancePlayerStats(mockPlayerStats, matchInfo);
        
        console.log(`Sistema aprimorado: ${enhancedStats.enhanced ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`Timestamp: ${enhancedStats.enhancementTimestamp || 'N/A'}`);
        
        if (enhancedStats.validation) {
            console.log(`Status de validação: ${enhancedStats.validation.status}`);
            console.log(`Precisão: ${enhancedStats.validation.accuracy}%`);
            console.log(`Problemas: ${enhancedStats.validation.issues.length}`);
            console.log(`Avisos: ${enhancedStats.validation.warnings.length}`);
        }
        
        console.log('\n=== 3. JOGADORES APRIMORADOS ===');
        
        console.log('\nJogadores aprimorados da Espanha:');
        enhancedStats.homeTeamPlayers.players.forEach(player => {
            const corrections = player.hasCorrections ? ' (CORRIGIDO)' : '';
            const normalized = player.playerName !== player.originalName ? ` [${player.originalName}]` : '';
            console.log(`  ${player.playerName}${normalized}: ${player.playerGoals}G, ${player.playerAssists}A, ${player.playerMatchPlayed} jogos${corrections}`);
            
            if (player.correctionDetails) {
                console.log(`    Correções: +${player.correctionDetails.goals}G, +${player.correctionDetails.assists}A`);
            }
        });
        
        console.log('\n=== 4. VERIFICAÇÃO DE CORREÇÕES ESPECÍFICAS ===');
        
        // Verificar Bryan Gil
        const bryanGil = enhancedStats.homeTeamPlayers.players.find(p => p.playerName.includes('Bryan Gil'));
        if (bryanGil) {
            console.log(`Bryan Gil: ${bryanGil.playerGoals} gols (esperado: 1 com correção)`);
            console.log(`  Correções aplicadas: ${bryanGil.hasCorrections ? 'SIM' : 'NÃO'}`);
        }
        
        // Verificar Bryan Zaragoza
        const bryanZaragoza = enhancedStats.homeTeamPlayers.players.find(p => p.playerName.includes('Bryan Zaragoza'));
        if (bryanZaragoza) {
            console.log(`Bryan Zaragoza: ${bryanZaragoza.playerGoals} gols (esperado: 1 com correção)`);
            console.log(`  Correções aplicadas: ${bryanZaragoza.hasCorrections ? 'SIM' : 'NÃO'}`);
        }
        
        // Verificar normalização de Oyarzabal
        const oyarzabal = enhancedStats.homeTeamPlayers.players.find(p => p.playerName === 'Mikel Oyarzabal');
        if (oyarzabal) {
            console.log(`Mikel Oyarzabal: ${oyarzabal.playerGoals} gols`);
            console.log(`  Nome normalizado: ${oyarzabal.playerName}`);
            console.log(`  Nome original: ${oyarzabal.originalName}`);
        }
        
        console.log('\n=== 5. VERIFICAÇÃO DE GOLEIROS ===');
        
        const goalkeepers = enhancedStats.homeTeamPlayers.players.filter(p => p.normalizedPosition === 'Goalkeeper');
        console.log(`Goleiros encontrados: ${goalkeepers.length}`);
        
        let totalGoalkeeperGames = 0;
        goalkeepers.forEach(gk => {
            console.log(`  ${gk.playerName}: ${gk.playerMatchPlayed} jogos (posição: ${gk.normalizedPosition})`);
            totalGoalkeeperGames += gk.playerMatchPlayed;
        });
        
        console.log(`Total de aparições de goleiros: ${totalGoalkeeperGames}`);
        console.log(`Esperado: 5 jogos`);
        console.log(`Status: ${totalGoalkeeperGames === 5 ? '✅ CORRETO' : '⚠️ PROBLEMA'}`);
        
        console.log('\n=== 6. VALIDAÇÃO DETALHADA ===');
        
        if (enhancedStats.validation) {
            console.log('Resumo da validação:');
            console.log(`  Total de jogadores: ${enhancedStats.validation.summary.totalPlayers}`);
            console.log(`  Total de gols: ${enhancedStats.validation.summary.totalGoals}`);
            console.log(`  Total de assistências: ${enhancedStats.validation.summary.totalAssists}`);
            console.log(`  Goleiros: ${enhancedStats.validation.summary.goalkeepers}`);
            console.log(`  Jogos de goleiros: ${enhancedStats.validation.summary.goalkeeperGames}`);
            
            if (enhancedStats.validation.issues.length > 0) {
                console.log('\nProblemas identificados:');
                enhancedStats.validation.issues.forEach(issue => console.log(`  • ${issue}`));
            }
            
            if (enhancedStats.validation.warnings.length > 0) {
                console.log('\nAvisos:');
                enhancedStats.validation.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
            }
        }
        
        console.log('\n=== 7. TESTE DE NORMALIZAÇÃO DE NOMES ===');
        
        // Testar normalização individual
        const testNames = [
            'Mikel Oyarzabal',
            'Oyarzabal',
            'M. Oyarzabal',
            'Bryan Gil',
            'B. Gil',
            'Kylian Mbappé',
            'Mbappé'
        ];
        
        console.log('Teste de normalização:');
        testNames.forEach(name => {
            const normalized = playerStatsEnhancementService.normalizePlayerName(name);
            console.log(`  "${name}" → "${normalized}"`);
        });
        
        console.log('\n=== 8. CONCLUSÃO DO TESTE ===');
        
        const success = enhancedStats.enhanced && 
                       enhancedStats.validation && 
                       enhancedStats.validation.status === 'valid';
        
        if (success) {
            console.log('🎯 SERVIÇO DE MELHORIA FUNCIONANDO CORRETAMENTE');
            console.log('✅ Melhorias aplicadas');
            console.log('✅ Validação funcionando');
            console.log('✅ Normalização de nomes funcionando');
            
            // Verificar se as correções específicas foram aplicadas
            const bryanGilCorrected = bryanGil && bryanGil.hasCorrections;
            const bryanZaragozaCorrected = bryanZaragoza && bryanZaragoza.hasCorrections;
            
            if (bryanGilCorrected && bryanZaragozaCorrected) {
                console.log('✅ Correções específicas aplicadas');
            } else {
                console.log('⚠️ Correções específicas não aplicadas completamente');
                console.log(`   Bryan Gil corrigido: ${bryanGilCorrected ? 'SIM' : 'NÃO'}`);
                console.log(`   Bryan Zaragoza corrigido: ${bryanZaragozaCorrected ? 'SIM' : 'NÃO'}`);
            }
        } else {
            console.log('❌ PROBLEMAS NO SERVIÇO DE MELHORIA');
            console.log(`   Enhanced: ${enhancedStats.enhanced}`);
            console.log(`   Validation: ${!!enhancedStats.validation}`);
            console.log(`   Status: ${enhancedStats.validation?.status || 'N/A'}`);
        }
        
        console.log('\n=== TESTE CONCLUÍDO ===');
        
    } catch (error) {
        console.error('Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEnhancementServiceDirect();
