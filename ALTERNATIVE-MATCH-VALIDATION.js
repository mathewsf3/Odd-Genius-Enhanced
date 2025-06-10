const https = require('https');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.footystats.org';

// Função para fazer requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.footystats.org',
            path: url,
            method: 'GET',
            headers: {
                'User-Agent': 'Node.js'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    console.error('Parse error for URL:', url);
                    console.error('Raw data:', data.substring(0, 500));
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Função para descobrir partidas alternativas
async function discoverAlternativeMatches() {
    console.log('🔍 Descobrindo partidas alternativas...\n');
    
    try {
        // 1. Buscar partidas ao vivo e próximas
        console.log('📡 Buscando partidas ao vivo...');
        const liveMatches = await makeRequest(`/live-matches?key=${API_KEY}`);
        console.log(`✅ Encontradas ${liveMatches.data?.length || 0} partidas ao vivo`);
        
        // 2. Buscar por ligas específicas com partidas frequentes
        console.log('\n🏆 Buscando ligas ativas...');
        const leagues = await makeRequest(`/league-list?key=${API_KEY}`);
        console.log(`✅ Encontradas ${leagues.data?.length || 0} ligas`);
        
        // Ligas que geralmente têm partidas frequentes
        const targetLeagues = [
            'premier-league',
            'la-liga', 
            'serie-a',
            'bundesliga',
            'ligue-1',
            'championship',
            'primeira-liga',
            'eredivisie'
        ];
        
        let alternativeMatches = [];
        
        // 3. Coletar partidas das ligas
        for (const leagueSlug of targetLeagues.slice(0, 3)) { // Testar apenas 3 para não sobrecarregar
            try {
                console.log(`\n🔍 Buscando partidas na liga: ${leagueSlug}`);
                const leagueMatches = await makeRequest(`/matches?key=${API_KEY}&league=${leagueSlug}&season_id=current`);
                
                if (leagueMatches.data && leagueMatches.data.length > 0) {
                    console.log(`✅ Encontradas ${leagueMatches.data.length} partidas na ${leagueSlug}`);
                    
                    // Pegar partidas mais recentes/próximas
                    const recentMatches = leagueMatches.data
                        .slice(0, 5) // Apenas as 5 mais recentes
                        .map(match => ({
                            id: match.id,
                            homeTeam: match.home_name || match.homeTeam,
                            awayTeam: match.away_name || match.awayTeam,
                            homeId: match.homeID || match.home_id,
                            awayId: match.awayID || match.away_id,
                            date: match.date_unix || match.date,
                            league: leagueSlug,
                            status: match.status
                        }));
                    
                    alternativeMatches = alternativeMatches.concat(recentMatches);
                }
                
                // Pequena pausa entre requests
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.log(`❌ Erro na liga ${leagueSlug}:`, error.message);
            }
        }
        
        // 4. Também incluir algumas partidas ao vivo se houver
        if (liveMatches.data && liveMatches.data.length > 0) {
            const liveFormatted = liveMatches.data.slice(0, 3).map(match => ({
                id: match.id,
                homeTeam: match.home_name || match.homeTeam,
                awayTeam: match.away_name || match.awayTeam,
                homeId: match.homeID || match.home_id,
                awayId: match.awayID || match.away_id,
                date: match.date_unix || match.date,
                league: 'live',
                status: 'live'
            }));
            
            alternativeMatches = alternativeMatches.concat(liveFormatted);
        }
        
        // 5. Remover duplicatas e filtrar dados válidos
        const uniqueMatches = alternativeMatches.filter((match, index, self) => 
            match.id && match.homeId && match.awayId &&
            index === self.findIndex(m => m.id === match.id)
        );
        
        console.log(`\n🎯 Total de partidas alternativas encontradas: ${uniqueMatches.length}`);
        
        // Mostrar as opções
        console.log('\n📋 PARTIDAS ALTERNATIVAS DISPONÍVEIS:');
        uniqueMatches.slice(0, 10).forEach((match, i) => {
            console.log(`${i + 1}. ${match.homeTeam} vs ${match.awayTeam}`);
            console.log(`   ID: ${match.id} | Home ID: ${match.homeId} | Away ID: ${match.awayId}`);
            console.log(`   Liga: ${match.league} | Status: ${match.status}\n`);
        });
        
        return uniqueMatches;
        
    } catch (error) {
        console.error('❌ Erro ao descobrir partidas alternativas:', error);
        return [];
    }
}

// Função para testar uma partida específica
async function testAlternativeMatch(matchData) {
    console.log(`\n🧪 TESTANDO PARTIDA: ${matchData.homeTeam} vs ${matchData.awayTeam}`);
    console.log(`Match ID: ${matchData.id}`);
    console.log(`Home ID: ${matchData.homeId} | Away ID: ${matchData.awayId}\n`);
    
    const results = {
        matchInfo: matchData,
        formData: null,
        analytics: null,
        errors: [],
        success: false
    };
    
    try {
        // 1. Buscar dados de forma dos times usando a mesma lógica que funcionou
        console.log('📊 Extraindo dados de forma dos times...');
        
        const internationalSeasons = [
            10117, 10118, 10119, 10120,  // Competition seasons (funcionou antes!)
            1625, 1626, 1627, 1628,      // League seasons  
            2020, 2021, 2022, 2023       // Year-based seasons
        ];
        
        let homeFormMatches = [];
        let awayFormMatches = [];
        
        for (const seasonId of internationalSeasons) {
            try {
                console.log(`   Testando season ${seasonId}...`);
                const seasonMatches = await makeRequest(`/matches?key=${API_KEY}&season_id=${seasonId}`);
                
                if (seasonMatches.data && seasonMatches.data.length > 0) {
                    console.log(`   ✅ Season ${seasonId}: ${seasonMatches.data.length} partidas`);
                    
                    // Filtrar partidas do time da casa (HOME)
                    const homeMatches = seasonMatches.data.filter(match => {
                        const homeId = match.homeID || match.home_id;
                        return homeId == matchData.homeId;
                    });
                    
                    // Filtrar partidas do time visitante (AWAY)
                    const awayMatches = seasonMatches.data.filter(match => {
                        const awayId = match.awayID || match.away_id;
                        return awayId == matchData.awayId;
                    });
                    
                    homeFormMatches = homeFormMatches.concat(homeMatches);
                    awayFormMatches = awayFormMatches.concat(awayMatches);
                    
                    console.log(`   Home matches found: ${homeMatches.length}`);
                    console.log(`   Away matches found: ${awayMatches.length}`);
                }
                
                // Pausa entre requests
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log(`   ❌ Erro na season ${seasonId}:`, error.message);
            }
        }
        
        console.log(`\n📈 FORMA ENCONTRADA:`);
        console.log(`${matchData.homeTeam} (HOME): ${homeFormMatches.length} partidas`);
        console.log(`${matchData.awayTeam} (AWAY): ${awayFormMatches.length} partidas`);
        
        if (homeFormMatches.length === 0 && awayFormMatches.length === 0) {
            results.errors.push('Nenhuma partida de forma encontrada para ambos os times');
            console.log('❌ Nenhuma partida de forma encontrada!');
            return results;
        }
        
        // 2. Pegar últimas 5 partidas de cada time
        const last5Home = homeFormMatches.slice(-5);
        const last5Away = awayFormMatches.slice(-5);
        
        results.formData = {
            homeTeam: {
                name: matchData.homeTeam,
                id: matchData.homeId,
                matches: last5Home
            },
            awayTeam: {
                name: matchData.awayTeam,
                id: matchData.awayId,
                matches: last5Away
            }
        };
        
        // 3. Calcular analytics básicas
        console.log('\n🔢 Calculando analytics...');
        
        function calculateBasicStats(matches, teamName) {
            if (!matches || matches.length === 0) return null;
            
            let totalGoals = 0;
            let totalCards = 0;
            let totalCorners = 0;
            let over25Count = 0;
            
            matches.forEach(match => {
                const homeGoals = match.homeGoalCount || match.home_goals || 0;
                const awayGoals = match.awayGoalCount || match.away_goals || 0;
                const totalMatchGoals = homeGoals + awayGoals;
                
                totalGoals += totalMatchGoals;
                if (totalMatchGoals > 2.5) over25Count++;
                
                totalCards += (match.team_a_yellow_cards || 0) + (match.team_b_yellow_cards || 0);
                totalCorners += (match.team_a_corners || 0) + (match.team_b_corners || 0);
            });
            
            return {
                matches: matches.length,
                avgGoals: (totalGoals / matches.length).toFixed(2),
                over25Percentage: ((over25Count / matches.length) * 100).toFixed(1),
                avgCards: (totalCards / matches.length).toFixed(1),
                avgCorners: (totalCorners / matches.length).toFixed(1)
            };
        }
        
        const homeStats = calculateBasicStats(last5Home, matchData.homeTeam);
        const awayStats = calculateBasicStats(last5Away, matchData.awayTeam);
        
        results.analytics = {
            homeStats,
            awayStats,
            prediction: {
                expectedGoals: homeStats && awayStats ? 
                    ((parseFloat(homeStats.avgGoals) + parseFloat(awayStats.avgGoals)) / 2).toFixed(2) : 'N/A',
                over25Probability: homeStats && awayStats ?
                    ((parseFloat(homeStats.over25Percentage) + parseFloat(awayStats.over25Percentage)) / 2).toFixed(1) + '%' : 'N/A'
            }
        };
        
        console.log('\n📊 ANALYTICS CALCULADAS:');
        if (homeStats) {
            console.log(`${matchData.homeTeam}: ${homeStats.avgGoals} gols/jogo, ${homeStats.over25Percentage}% Over 2.5`);
        }
        if (awayStats) {
            console.log(`${matchData.awayTeam}: ${awayStats.avgGoals} gols/jogo, ${awayStats.over25Percentage}% Over 2.5`);
        }
        
        results.success = true;
        console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        results.errors.push(error.message);
    }
    
    return results;
}

// Função principal
async function main() {
    console.log('🚀 VALIDAÇÃO DE PARTIDA ALTERNATIVA');
    console.log('=====================================\n');
    
    try {
        // 1. Descobrir partidas alternativas
        const alternativeMatches = await discoverAlternativeMatches();
        
        if (alternativeMatches.length === 0) {
            console.log('❌ Nenhuma partida alternativa encontrada!');
            return;
        }
        
        // 2. Pegar a primeira partida válida
        const selectedMatch = alternativeMatches[0];
        console.log(`\n🎯 PARTIDA SELECIONADA: ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`);
        
        // 3. Testar a partida
        const testResults = await testAlternativeMatch(selectedMatch);
        
        // 4. Salvar resultados
        const timestamp = Date.now();
        const fs = require('fs');
        
        const resultData = {
            timestamp: new Date().toISOString(),
            testType: 'alternative-match-validation',
            selectedMatch,
            results: testResults,
            allAlternatives: alternativeMatches.slice(0, 10), // Salvar apenas as primeiras 10
            summary: {
                success: testResults.success,
                errorsCount: testResults.errors.length,
                formDataFound: testResults.formData !== null,
                analyticsCalculated: testResults.analytics !== null
            }
        };
        
        fs.writeFileSync(
            `ALTERNATIVE-MATCH-VALIDATION-RESULTS-${timestamp}.json`,
            JSON.stringify(resultData, null, 2)
        );
        
        console.log(`\n💾 Resultados salvos em: ALTERNATIVE-MATCH-VALIDATION-RESULTS-${timestamp}.json`);
        
        // 5. Resumo final
        console.log('\n🎯 RESUMO DO TESTE:');
        console.log(`Partida: ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`);
        console.log(`Sucesso: ${testResults.success ? '✅' : '❌'}`);
        console.log(`Dados de forma encontrados: ${testResults.formData ? '✅' : '❌'}`);
        console.log(`Analytics calculadas: ${testResults.analytics ? '✅' : '❌'}`);
        console.log(`Erros: ${testResults.errors.length}`);
        
        if (testResults.errors.length > 0) {
            console.log('\nErros encontrados:');
            testResults.errors.forEach(error => console.log(`- ${error}`));
        }
        
    } catch (error) {
        console.error('❌ Erro na execução principal:', error);
    }
}

// Executar
main().catch(console.error);
