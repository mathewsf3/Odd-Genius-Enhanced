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

// Função para descobrir partidas de forma mais abrangente
async function discoverMatchesComprehensive() {
    console.log('🔍 Descobrindo partidas de forma abrangente...\n');
    
    let allMatches = [];
    
    try {
        // 1. Testar várias seasons que sabemos que funcionam
        const workingSeasons = [
            10117, 10118, 10119, 10120,  // International competitions (sabemos que funciona!)
            1625, 1626, 1627, 1628,      // League seasons
            2020, 2021, 2022, 2023,      // Year-based
            9500, 9501, 9502, 9503       // Additional seasons
        ];
        
        console.log('📊 Testando seasons conhecidas...');
        
        for (const seasonId of workingSeasons.slice(0, 6)) { // Testar apenas 6 para não sobrecarregar
            try {
                console.log(`   Season ${seasonId}...`);
                const seasonMatches = await makeRequest(`/matches?key=${API_KEY}&season_id=${seasonId}`);
                
                if (seasonMatches.data && seasonMatches.data.length > 0) {
                    console.log(`   ✅ Season ${seasonId}: ${seasonMatches.data.length} partidas`);
                    
                    // Pegar uma amostra de partidas desta season
                    const sampleMatches = seasonMatches.data
                        .filter(match => 
                            (match.homeID || match.home_id) &&
                            (match.awayID || match.away_id) &&
                            (match.home_name || match.homeTeam) &&
                            (match.away_name || match.awayTeam)
                        )
                        .slice(0, 10) // Pegar apenas 10 por season
                        .map(match => ({
                            id: match.id,
                            homeTeam: match.home_name || match.homeTeam || 'Unknown Home',
                            awayTeam: match.away_name || match.awayTeam || 'Unknown Away',
                            homeId: match.homeID || match.home_id,
                            awayId: match.awayID || match.away_id,
                            date: match.date_unix || match.date,
                            season: seasonId,
                            homeGoals: match.homeGoalCount || match.home_goals || 0,
                            awayGoals: match.awayGoalCount || match.away_goals || 0,
                            status: match.status || 'completed'
                        }));
                    
                    allMatches = allMatches.concat(sampleMatches);
                    console.log(`   Adicionadas ${sampleMatches.length} partidas da season ${seasonId}`);
                } else {
                    console.log(`   ❌ Season ${seasonId}: sem dados`);
                }
                
                // Pequena pausa
                await new Promise(resolve => setTimeout(resolve, 400));
                
            } catch (error) {
                console.log(`   ❌ Erro na season ${seasonId}:`, error.message);
            }
        }
        
        // 2. Tentar buscar partidas por times específicos conhecidos
        console.log('\n🏟️ Buscando por times específicos...');
        
        const knownTeams = [
            { name: 'Manchester United', id: 35 },
            { name: 'Barcelona', id: 81 },
            { name: 'Real Madrid', id: 86 },
            { name: 'Liverpool', id: 40 }
        ];
        
        for (const team of knownTeams.slice(0, 2)) {
            try {
                console.log(`   Buscando partidas do ${team.name}...`);
                const teamMatches = await makeRequest(`/team-matches?key=${API_KEY}&team_id=${team.id}`);
                
                if (teamMatches.data && teamMatches.data.length > 0) {
                    console.log(`   ✅ ${team.name}: ${teamMatches.data.length} partidas`);
                    
                    const teamSample = teamMatches.data
                        .slice(0, 5)
                        .map(match => ({
                            id: match.id,
                            homeTeam: match.home_name || match.homeTeam || 'Unknown Home',
                            awayTeam: match.away_name || match.awayTeam || 'Unknown Away',
                            homeId: match.homeID || match.home_id,
                            awayId: match.awayID || match.away_id,
                            date: match.date_unix || match.date,
                            season: 'team-based',
                            homeGoals: match.homeGoalCount || match.home_goals || 0,
                            awayGoals: match.awayGoalCount || match.away_goals || 0,
                            status: match.status || 'completed'
                        }));
                    
                    allMatches = allMatches.concat(teamSample);
                }
                
                await new Promise(resolve => setTimeout(resolve, 400));
                
            } catch (error) {
                console.log(`   ❌ Erro com ${team.name}:`, error.message);
            }
        }
        
        // 3. Remover duplicatas
        const uniqueMatches = allMatches.filter((match, index, self) => 
            match.id && index === self.findIndex(m => m.id === match.id)
        );
        
        console.log(`\n🎯 Total de partidas encontradas: ${uniqueMatches.length}`);
        
        if (uniqueMatches.length > 0) {
            console.log('\n📋 PARTIDAS DISPONÍVEIS:');
            uniqueMatches.slice(0, 15).forEach((match, i) => {
                console.log(`${i + 1}. ${match.homeTeam} vs ${match.awayTeam}`);
                console.log(`   ID: ${match.id} | Home ID: ${match.homeId} | Away ID: ${match.awayId}`);
                console.log(`   Season: ${match.season} | Resultado: ${match.homeGoals}-${match.awayGoals}\n`);
            });
        }
        
        return uniqueMatches;
        
    } catch (error) {
        console.error('❌ Erro na descoberta abrangente:', error);
        return allMatches;
    }
}

// Função para testar nossa implementação completa em uma partida
async function testCompleteImplementation(matchData) {
    console.log(`\n🧪 TESTE COMPLETO: ${matchData.homeTeam} vs ${matchData.awayTeam}`);
    console.log(`Match ID: ${matchData.id} | Season: ${matchData.season}`);
    console.log(`Home ID: ${matchData.homeId} | Away ID: ${matchData.awayId}\n`);
    
    const results = {
        matchInfo: matchData,
        formDataCollection: {
            attempted: false,
            successful: false,
            homeMatches: [],
            awayMatches: [],
            errors: []
        },
        analytics: {
            attempted: false,
            successful: false,
            results: null,
            errors: []
        },
        overallSuccess: false
    };
    
    try {
        // PARTE 1: COLETA DE DADOS DE FORMA
        console.log('📊 PARTE 1: Coletando dados de forma dos times');
        console.log('=' .repeat(50));
        
        results.formDataCollection.attempted = true;
        
        const workingSeasons = [
            10117, 10118, 10119, 10120,  // Sabemos que funciona!
            1625, 1626, 1627, 1628,
            2020, 2021, 2022, 2023
        ];
        
        let homeFormMatches = [];
        let awayFormMatches = [];
        
        for (const seasonId of workingSeasons) {
            try {
                console.log(`   Testando season ${seasonId}...`);
                const seasonMatches = await makeRequest(`/matches?key=${API_KEY}&season_id=${seasonId}`);
                
                if (seasonMatches.data && seasonMatches.data.length > 0) {
                    // Buscar partidas do time da casa
                    const homeMatches = seasonMatches.data.filter(match => {
                        const homeId = match.homeID || match.home_id;
                        return homeId == matchData.homeId;
                    });
                    
                    // Buscar partidas do time visitante  
                    const awayMatches = seasonMatches.data.filter(match => {
                        const awayId = match.awayID || match.away_id;
                        return awayId == matchData.awayId;
                    });
                    
                    if (homeMatches.length > 0 || awayMatches.length > 0) {
                        console.log(`   ✅ Season ${seasonId}: ${homeMatches.length} home, ${awayMatches.length} away`);
                        homeFormMatches = homeFormMatches.concat(homeMatches);
                        awayFormMatches = awayFormMatches.concat(awayMatches);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log(`   ❌ Erro na season ${seasonId}:`, error.message);
                results.formDataCollection.errors.push(`Season ${seasonId}: ${error.message}`);
            }
        }
        
        results.formDataCollection.homeMatches = homeFormMatches.slice(-5); // Últimas 5
        results.formDataCollection.awayMatches = awayFormMatches.slice(-5); // Últimas 5
        
        console.log(`\n📈 DADOS DE FORMA COLETADOS:`);
        console.log(`${matchData.homeTeam}: ${homeFormMatches.length} partidas (últimas 5 selecionadas)`);
        console.log(`${matchData.awayTeam}: ${awayFormMatches.length} partidas (últimas 5 selecionadas)`);
        
        if (homeFormMatches.length > 0 || awayFormMatches.length > 0) {
            results.formDataCollection.successful = true;
            console.log('✅ Coleta de dados de forma: SUCESSO');
        } else {
            console.log('❌ Coleta de dados de forma: FALHOU');
        }
        
        // PARTE 2: ANALYTICS COMPLETAS
        console.log('\n🔢 PARTE 2: Calculando analytics completas');
        console.log('=' .repeat(50));
        
        results.analytics.attempted = true;
        
        // Função para calcular todas as analytics
        function calculateCompleteAnalytics(homeMatches, awayMatches) {
            const analytics = {
                homeStats: null,
                awayStats: null,
                predictions: {},
                overUnderAnalysis: {},
                summary: {}
            };
            
            // Função auxiliar para calcular stats de um conjunto de partidas
            function calculateTeamStats(matches, teamName) {
                if (!matches || matches.length === 0) return null;
                
                let totalGoals = 0;
                let totalCards = 0;
                let totalCorners = 0;
                let over05 = 0, over15 = 0, over25 = 0, over35 = 0;
                
                matches.forEach(match => {
                    const homeGoals = match.homeGoalCount || match.home_goals || 0;
                    const awayGoals = match.awayGoalCount || match.away_goals || 0;
                    const total = homeGoals + awayGoals;
                    
                    totalGoals += total;
                    if (total > 0.5) over05++;
                    if (total > 1.5) over15++;
                    if (total > 2.5) over25++;
                    if (total > 3.5) over35++;
                    
                    totalCards += (match.team_a_yellow_cards || 0) + (match.team_b_yellow_cards || 0);
                    totalCorners += (match.team_a_corners || 0) + (match.team_b_corners || 0);
                });
                
                return {
                    matchesAnalyzed: matches.length,
                    avgGoals: (totalGoals / matches.length).toFixed(2),
                    avgCards: (totalCards / matches.length).toFixed(1),
                    avgCorners: (totalCorners / matches.length).toFixed(1),
                    overUnder: {
                        over05: `${((over05 / matches.length) * 100).toFixed(1)}%`,
                        over15: `${((over15 / matches.length) * 100).toFixed(1)}%`,
                        over25: `${((over25 / matches.length) * 100).toFixed(1)}%`,
                        over35: `${((over35 / matches.length) * 100).toFixed(1)}%`
                    }
                };
            }
            
            // Calcular para ambos os times
            analytics.homeStats = calculateTeamStats(homeMatches, matchData.homeTeam);
            analytics.awayStats = calculateTeamStats(awayMatches, matchData.awayTeam);
            
            // Predições combinadas
            if (analytics.homeStats && analytics.awayStats) {
                const avgHome = parseFloat(analytics.homeStats.avgGoals);
                const avgAway = parseFloat(analytics.awayStats.avgGoals);
                
                analytics.predictions = {
                    expectedGoals: ((avgHome + avgAway) / 2).toFixed(2),
                    over25Probability: (
                        (parseFloat(analytics.homeStats.overUnder.over25.replace('%', '')) +
                         parseFloat(analytics.awayStats.overUnder.over25.replace('%', ''))) / 2
                    ).toFixed(1) + '%'
                };
                
                analytics.summary = {
                    dataQuality: 'Complete',
                    recommendation: avgHome + avgAway > 2.5 ? 'Over 2.5 Goals' : 'Under 2.5 Goals',
                    confidence: homeMatches.length >= 3 && awayMatches.length >= 3 ? 'High' : 'Medium'
                };
            } else {
                analytics.summary = {
                    dataQuality: 'Incomplete',
                    recommendation: 'Insufficient data',
                    confidence: 'Low'
                };
            }
            
            return analytics;
        }
        
        const completeAnalytics = calculateCompleteAnalytics(
            results.formDataCollection.homeMatches,
            results.formDataCollection.awayMatches
        );
        
        results.analytics.results = completeAnalytics;
        results.analytics.successful = true;
        
        // Mostrar resultados
        console.log('\n📊 ANALYTICS CALCULADAS:');
        
        if (completeAnalytics.homeStats) {
            console.log(`\n🏠 ${matchData.homeTeam}:`);
            console.log(`   Partidas: ${completeAnalytics.homeStats.matchesAnalyzed}`);
            console.log(`   Média de gols: ${completeAnalytics.homeStats.avgGoals}`);
            console.log(`   Over 2.5: ${completeAnalytics.homeStats.overUnder.over25}`);
        }
        
        if (completeAnalytics.awayStats) {
            console.log(`\n✈️ ${matchData.awayTeam}:`);
            console.log(`   Partidas: ${completeAnalytics.awayStats.matchesAnalyzed}`);
            console.log(`   Média de gols: ${completeAnalytics.awayStats.avgGoals}`);
            console.log(`   Over 2.5: ${completeAnalytics.awayStats.overUnder.over25}`);
        }
        
        if (completeAnalytics.predictions.expectedGoals) {
            console.log(`\n🎯 PREDIÇÃO:`);
            console.log(`   Gols esperados: ${completeAnalytics.predictions.expectedGoals}`);
            console.log(`   Prob. Over 2.5: ${completeAnalytics.predictions.over25Probability}`);
            console.log(`   Recomendação: ${completeAnalytics.summary.recommendation}`);
            console.log(`   Confiança: ${completeAnalytics.summary.confidence}`);
        }
        
        console.log('✅ Analytics completas: SUCESSO');
        
        // Sucesso geral
        results.overallSuccess = results.formDataCollection.successful && results.analytics.successful;
        
    } catch (error) {
        console.error('❌ Erro no teste completo:', error);
        results.analytics.errors.push(error.message);
    }
    
    return results;
}

// Função principal
async function main() {
    console.log('🚀 VALIDAÇÃO ABRANGENTE DE IMPLEMENTAÇÃO');
    console.log('==========================================\n');
    
    try {
        // 1. Descobrir partidas
        const matches = await discoverMatchesComprehensive();
        
        if (matches.length === 0) {
            console.log('❌ Nenhuma partida encontrada!');
            return;
        }
        
        // 2. Selecionar partida para teste
        const selectedMatch = matches[0];
        console.log(`\n🎯 PARTIDA SELECIONADA PARA TESTE COMPLETO:`);
        console.log(`${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`);
        console.log(`ID: ${selectedMatch.id} | Season: ${selectedMatch.season}`);
        
        // 3. Executar teste completo
        const testResults = await testCompleteImplementation(selectedMatch);
        
        // 4. Salvar resultados
        const timestamp = Date.now();
        const fs = require('fs');
        
        const resultData = {
            timestamp: new Date().toISOString(),
            testType: 'comprehensive-implementation-validation',
            selectedMatch,
            testResults,
            allAvailableMatches: matches.slice(0, 20),
            finalSummary: {
                overallSuccess: testResults.overallSuccess,
                formDataCollection: testResults.formDataCollection.successful,
                analyticsCalculation: testResults.analytics.successful,
                totalErrors: testResults.formDataCollection.errors.length + testResults.analytics.errors.length
            }
        };
        
        fs.writeFileSync(
            `COMPREHENSIVE-VALIDATION-RESULTS-${timestamp}.json`,
            JSON.stringify(resultData, null, 2)
        );
        
        console.log(`\n💾 Resultados salvos em: COMPREHENSIVE-VALIDATION-RESULTS-${timestamp}.json`);
        
        // 5. Resumo final
        console.log('\n🎯 RESUMO FINAL DO TESTE:');
        console.log('=' .repeat(50));
        console.log(`Partida: ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`);
        console.log(`Sucesso geral: ${testResults.overallSuccess ? '✅' : '❌'}`);
        console.log(`Coleta de dados: ${testResults.formDataCollection.successful ? '✅' : '❌'}`);
        console.log(`Analytics: ${testResults.analytics.successful ? '✅' : '❌'}`);
        console.log(`Total de erros: ${testResults.formDataCollection.errors.length + testResults.analytics.errors.length}`);
        
        if (testResults.overallSuccess) {
            console.log('\n🎉 IMPLEMENTAÇÃO VALIDADA COM SUCESSO!');
            console.log('A solução funciona com partidas alternativas.');
        } else {
            console.log('\n⚠️ Problemas encontrados na validação:');
            [...testResults.formDataCollection.errors, ...testResults.analytics.errors].forEach(error => {
                console.log(`- ${error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro na execução principal:', error);
    }
}

// Executar
main().catch(console.error);
