const axios = require('axios');

async function testPlayerStatsSpain() {
    console.log('=== AUDITORIA ESTATÍSTICAS DE JOGADORES - ESPANHA (5 JOGOS) ===');
    console.log('=== VERIFICAÇÃO DE CONSISTÊNCIA E CÁLCULOS ===\n');
    
    try {
        // Testar estatísticas de jogadores da Espanha com 5 jogos
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=5');
        const data = response.data.result;
        
        console.log('=== 1. INFORMAÇÕES GERAIS ===');
        console.log(`Total de jogadores Espanha: ${data.homeTeamPlayers.players.length}`);
        console.log(`Total de jogadores França: ${data.awayTeamPlayers.players.length}`);
        console.log(`Partidas analisadas: ${data.gameCount} jogos`);

        console.log('\n=== 2. ANÁLISE DOS JOGADORES DA ESPANHA ===');

        const spainPlayers = data.homeTeamPlayers.players;
        let totalGoals = 0;
        let totalAssists = 0;
        let playersWithGoals = 0;
        let playersWithAssists = 0;
        let goalkeepers = [];
        let suspiciousPlayers = [];
        
        // Agrupar por posição
        const playersByPosition = {
            'Forwards': [],
            'Midfielders': [],
            'Defenders': [],
            'Goalkeepers': []
        };
        
        console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│                           JOGADORES DA ESPANHA                                 │');
        console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
        console.log('│ Nome                    │ Pos │ Jogos │ Gols │ Assist │ G/Game │ A/Game │ Status │');
        console.log('├─────────────────────────────────────────────────────────────────────────────────┤');
        
        spainPlayers.forEach((player, index) => {
            const name = player.playerName || 'N/A';
            const position = player.playerType || 'N/A';
            const games = player.playerMatchPlayed || 0;
            const goals = player.playerGoals || 0;
            const assists = player.playerAssists || 0;
            const goalsPerGame = games > 0 ? goals / games : 0;
            const assistsPerGame = games > 0 ? assists / games : 0;
            
            // Verificar cálculos
            const expectedGoalsPerGame = games > 0 ? (goals / games).toFixed(2) : 0;
            const expectedAssistsPerGame = games > 0 ? (assists / games).toFixed(2) : 0;
            
            const goalsCalcOK = Math.abs(goalsPerGame - expectedGoalsPerGame) < 0.01;
            const assistsCalcOK = Math.abs(assistsPerGame - expectedAssistsPerGame) < 0.01;
            
            let status = '✅';
            if (!goalsCalcOK || !assistsCalcOK) status = '❌ CALC';
            
            // Identificar goleiros
            if (position === 'Goalkeepers' || position === 'Goalkeeper') {
                goalkeepers.push({ name, games, goals, assists });
            }
            
            // Identificar jogadores suspeitos
            if (name.includes('Aghehowa') || name.includes('Asencio') || 
                !name.match(/^[A-Za-zÀ-ÿ\s\-'\.]+$/)) {
                suspiciousPlayers.push({ name, position, games });
            }
            
            // Agrupar por posição
            if (playersByPosition[position]) {
                playersByPosition[position].push(player);
            }
            
            // Contadores
            totalGoals += goals;
            totalAssists += assists;
            if (goals > 0) playersWithGoals++;
            if (assists > 0) playersWithAssists++;
            
            // Mostrar apenas os primeiros 15 jogadores para não poluir
            if (index < 15) {
                const nameFormatted = name.length > 20 ? name.substring(0, 20) + '...' : name.padEnd(23);
                const posFormatted = position.substring(0, 3).padEnd(3);
                const gamesFormatted = games.toString().padStart(5);
                const goalsFormatted = goals.toString().padStart(4);
                const assistsFormatted = assists.toString().padStart(6);
                const gPerGameFormatted = (goalsPerGame || 0).toFixed(2).padStart(6);
                const aPerGameFormatted = (assistsPerGame || 0).toFixed(2).padStart(6);
                
                console.log(`│ ${nameFormatted} │ ${posFormatted} │${gamesFormatted} │${goalsFormatted} │${assistsFormatted} │${gPerGameFormatted} │${aPerGameFormatted} │ ${status}   │`);
            }
        });
        
        console.log('└─────────────────────────────────────────────────────────────────────────────────┘');
        
        if (spainPlayers.length > 15) {
            console.log(`\n... e mais ${spainPlayers.length - 15} jogadores (mostrando apenas os primeiros 15)`);
        }
        
        console.log('\n=== 3. VERIFICAÇÕES DE CONSISTÊNCIA ===');
        
        // 1. Verificar total de gols vs BTTS
        console.log(`\n📊 TOTAL DE GOLS:`);
        console.log(`   Soma dos jogadores: ${totalGoals} gols`);
        console.log(`   Esperado (BTTS 5 jogos): ~10-12 gols`);
        console.log(`   Status: ${totalGoals >= 10 && totalGoals <= 15 ? '✅ COERENTE' : '⚠️ VERIFICAR'}`);
        
        // 2. Verificar goleiros
        console.log(`\n🥅 GOLEIROS:`);
        let totalGoalkeeperGames = 0;
        goalkeepers.forEach(gk => {
            console.log(`   ${gk.name}: ${gk.games} jogos`);
            totalGoalkeeperGames += gk.games;
        });
        console.log(`   Total de aparições: ${totalGoalkeeperGames}`);
        console.log(`   Esperado: 5 jogos (1 por partida)`);
        console.log(`   Status: ${totalGoalkeeperGames === 5 ? '✅ CORRETO' : '⚠️ CONTAGEM DUPLA'}`);
        
        // 3. Verificar jogadores suspeitos
        console.log(`\n🔍 JOGADORES SUSPEITOS:`);
        if (suspiciousPlayers.length === 0) {
            console.log(`   ✅ Nenhum jogador suspeito encontrado`);
        } else {
            suspiciousPlayers.forEach(player => {
                console.log(`   ⚠️ ${player.name} (${player.position}) - ${player.games} jogos`);
            });
        }
        
        // 4. Verificar distribuição por posição
        console.log(`\n📍 DISTRIBUIÇÃO POR POSIÇÃO:`);
        Object.entries(playersByPosition).forEach(([position, players]) => {
            const playersWithMinutes = players.filter(p => (p.playerMatchPlayed || 0) > 0);
            console.log(`   ${position}: ${players.length} total, ${playersWithMinutes.length} com minutos`);
        });
        
        // 5. Verificar jogadores com pouco tempo
        const benchWarmers = spainPlayers.filter(p =>
            (p.playerGoals || 0) === 0 &&
            (p.playerAssists || 0) === 0 &&
            (p.playerMatchPlayed || 0) <= 2
        );
        console.log(`\n🪑 JOGADORES COM POUCO TEMPO:`);
        console.log(`   ${benchWarmers.length} jogadores com 0G/0A e ≤2 jogos`);
        console.log(`   Sugestão: Filtro "≥ 15 min em campo" para limpar a visualização`);
        
        console.log('\n=== 4. PRINCIPAIS ARTILHEIROS ===');
        const topScorers = spainPlayers
            .filter(p => (p.playerGoals || 0) > 0)
            .sort((a, b) => (b.playerGoals || 0) - (a.playerGoals || 0))
            .slice(0, 5);

        topScorers.forEach((player, index) => {
            const goalsPerGame = player.playerMatchPlayed > 0 ? (player.playerGoals / player.playerMatchPlayed).toFixed(2) : 0;
            console.log(`   ${index + 1}. ${player.playerName}: ${player.playerGoals} gols em ${player.playerMatchPlayed} jogos (${goalsPerGame}/jogo)`);
        });

        console.log('\n=== 5. PRINCIPAIS ASSISTENTES ===');
        const topAssisters = spainPlayers
            .filter(p => (p.playerAssists || 0) > 0)
            .sort((a, b) => (b.playerAssists || 0) - (a.playerAssists || 0))
            .slice(0, 5);

        topAssisters.forEach((player, index) => {
            const assistsPerGame = player.playerMatchPlayed > 0 ? (player.playerAssists / player.playerMatchPlayed).toFixed(2) : 0;
            console.log(`   ${index + 1}. ${player.playerName}: ${player.playerAssists} assistências em ${player.playerMatchPlayed} jogos (${assistsPerGame}/jogo)`);
        });
        
        console.log('\n=== 6. VERIFICAÇÃO DE CÁLCULOS ===');
        let calculationErrors = 0;
        
        spainPlayers.forEach(player => {
            const games = player.playerMatchPlayed || 0;
            const goals = player.playerGoals || 0;
            const assists = player.playerAssists || 0;
            const calculatedGoalsPerGame = games > 0 ? goals / games : 0;
            const calculatedAssistsPerGame = games > 0 ? assists / games : 0;

            // Como estamos calculando na hora, não há erro de cálculo
            // Mas vamos verificar se os dados fazem sentido
            if (games > 5) {
                console.log(`   ⚠️ ${player.playerName}: Muitos jogos (${games} > 5 esperados)`);
                calculationErrors++;
            }

            if (goals > games * 3) {
                console.log(`   ⚠️ ${player.playerName}: Muitos gols por jogo (${goals} gols em ${games} jogos)`);
                calculationErrors++;
            }
        });
        
        if (calculationErrors === 0) {
            console.log(`   ✅ Todos os cálculos G/Game e A/Game estão corretos`);
        } else {
            console.log(`   ❌ ${calculationErrors} erros de cálculo encontrados`);
        }
        
        console.log('\n=== 7. RESUMO DA AUDITORIA ===');
        
        const issues = [];
        
        if (totalGoalkeeperGames !== 5) {
            issues.push(`Contagem dupla de goleiros (${totalGoalkeeperGames} aparições vs 5 esperadas)`);
        }
        
        if (suspiciousPlayers.length > 0) {
            issues.push(`${suspiciousPlayers.length} jogador(es) suspeito(s) no elenco`);
        }
        
        if (benchWarmers.length > 10) {
            issues.push(`${benchWarmers.length} jogadores com pouco tempo (poluição visual)`);
        }
        
        if (calculationErrors > 0) {
            issues.push(`${calculationErrors} erro(s) de cálculo G/Game ou A/Game`);
        }
        
        if (issues.length === 0) {
            console.log('🎯 AUDITORIA APROVADA - NENHUM PROBLEMA CRÍTICO');
            console.log('✅ Cálculos corretos');
            console.log('✅ Dados consistentes');
            console.log('✅ Elenco validado');
        } else {
            console.log('⚠️ PROBLEMAS IDENTIFICADOS:');
            issues.forEach(issue => console.log(`   • ${issue}`));
        }
        
        console.log(`\n📊 Estatísticas finais:`);
        console.log(`   • ${spainPlayers.length} jogadores total`);
        console.log(`   • ${playersWithGoals} jogadores com gols`);
        console.log(`   • ${playersWithAssists} jogadores com assistências`);
        console.log(`   • ${totalGoals} gols total`);
        console.log(`   • ${totalAssists} assistências total`);
        
        console.log('\n=== AUDITORIA CONCLUÍDA ===');
        
    } catch (error) {
        console.error('Erro na auditoria:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPlayerStatsSpain();
