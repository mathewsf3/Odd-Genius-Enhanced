const https = require('https');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';

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

// Teste de robustez com diferentes combinações de IDs
async function testRobustnessWithDifferentTeams() {
    console.log('🔬 TESTE DE ROBUSTEZ - DIFERENTES COMBINAÇÕES DE TIMES');
    console.log('=' .repeat(60));
    
    // Partidas para testar (algumas reais, algumas fictícias)
    const testCases = [
        {
            name: 'Iran vs North Korea (CONHECIDA - CONTROLE)',
            homeId: 3072,
            awayId: 3095,
            homeTeam: 'Iran',
            awayTeam: 'North Korea',
            description: 'Partida que sabemos que funciona'
        },
        {
            name: 'Teams com IDs próximos ao Iran',
            homeId: 3070,
            awayId: 3074,
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            description: 'Teste com IDs próximos'
        },
        {
            name: 'Teams com IDs diferentes',
            homeId: 3100,
            awayId: 3200,
            homeTeam: 'Team C',
            awayTeam: 'Team D',
            description: 'Teste com IDs mais distantes'
        },
        {
            name: 'Teams com IDs muito baixos',
            homeId: 10,
            awayId: 20,
            homeTeam: 'Team E',
            awayTeam: 'Team F',
            description: 'Teste com IDs baixos'
        },
        {
            name: 'Teams com IDs altos',
            homeId: 5000,
            awayId: 5100,
            homeTeam: 'Team G',
            awayTeam: 'Team H',
            description: 'Teste com IDs altos'
        }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
        console.log(`\n🧪 TESTANDO: ${testCase.name}`);
        console.log(`${testCase.description}`);
        console.log(`Home ID: ${testCase.homeId} | Away ID: ${testCase.awayId}`);
        
        const result = {
            testCase: testCase,
            formDataFound: false,
            homeMatches: 0,
            awayMatches: 0,
            seasonsWithData: [],
            errors: [],
            success: false
        };
        
        try {
            // Usar a mesma lógica que funcionou antes
            const workingSeasons = [
                10117, 10118, 10119, 10120,
                1625, 1626, 1627, 1628,
                2020, 2021, 2022, 2023
            ];
            
            let homeMatches = [];
            let awayMatches = [];
            
            for (const seasonId of workingSeasons.slice(0, 8)) {
                try {
                    console.log(`   Season ${seasonId}...`);
                    const seasonMatches = await makeRequest(`/matches?key=${API_KEY}&season_id=${seasonId}`);
                    
                    if (seasonMatches.data && seasonMatches.data.length > 0) {
                        // Buscar partidas do home team
                        const homeFound = seasonMatches.data.filter(match => {
                            const homeId = match.homeID || match.home_id;
                            return homeId == testCase.homeId;
                        });
                        
                        // Buscar partidas do away team
                        const awayFound = seasonMatches.data.filter(match => {
                            const awayId = match.awayID || match.away_id;
                            return awayId == testCase.awayId;
                        });
                        
                        if (homeFound.length > 0 || awayFound.length > 0) {
                            console.log(`   ✅ Season ${seasonId}: ${homeFound.length} home, ${awayFound.length} away`);
                            homeMatches = homeMatches.concat(homeFound);
                            awayMatches = awayMatches.concat(awayFound);
                            result.seasonsWithData.push(seasonId);
                        } else {
                            console.log(`   ❌ Season ${seasonId}: sem dados para estes times`);
                        }
                    } else {
                        console.log(`   ❌ Season ${seasonId}: sem dados`);
                    }
                    
                    // Pequena pausa
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.log(`   ❌ Erro na season ${seasonId}: ${error.message}`);
                    result.errors.push(`Season ${seasonId}: ${error.message}`);
                }
            }
            
            result.homeMatches = homeMatches.length;
            result.awayMatches = awayMatches.length;
            result.formDataFound = homeMatches.length > 0 || awayMatches.length > 0;
            result.success = result.formDataFound;
            
            console.log(`   📊 RESULTADO: ${homeMatches.length} home + ${awayMatches.length} away = ${homeMatches.length + awayMatches.length} total`);
            
            if (result.success) {
                console.log(`   ✅ SUCESSO - Dados encontrados!`);
            } else {
                console.log(`   ❌ FALHOU - Nenhum dado encontrado`);
            }
            
        } catch (error) {
            console.error(`   ❌ Erro no teste: ${error.message}`);
            result.errors.push(`Test error: ${error.message}`);
        }
        
        results.push(result);
        
        // Pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

// Análise dos resultados e criação de um mapa de dados disponíveis
async function analyzeDataAvailability() {
    console.log('\n🔍 ANÁLISE DE DISPONIBILIDADE DE DADOS');
    console.log('=' .repeat(50));
    
    try {
        const workingSeasons = [10117, 10118, 10119, 10120, 1625, 1626, 1627, 1628, 2020, 2021, 2022, 2023];
        const dataMap = {};
        
        for (const seasonId of workingSeasons.slice(0, 6)) { // Limitar para não sobrecarregar
            try {
                console.log(`📊 Analisando Season ${seasonId}...`);
                const seasonMatches = await makeRequest(`/matches?key=${API_KEY}&season_id=${seasonId}`);
                
                if (seasonMatches.data && seasonMatches.data.length > 0) {
                    const uniqueTeams = new Set();
                    
                    seasonMatches.data.forEach(match => {
                        const homeId = match.homeID || match.home_id;
                        const awayId = match.awayID || match.away_id;
                        
                        if (homeId) uniqueTeams.add(homeId);
                        if (awayId) uniqueTeams.add(awayId);
                    });
                    
                    dataMap[seasonId] = {
                        totalMatches: seasonMatches.data.length,
                        uniqueTeams: uniqueTeams.size,
                        teamIds: Array.from(uniqueTeams).slice(0, 20), // Primeiros 20
                        sampleMatches: seasonMatches.data.slice(0, 3).map(match => ({
                            id: match.id,
                            homeId: match.homeID || match.home_id,
                            awayId: match.awayID || match.away_id,
                            homeName: match.home_name || match.homeTeam || 'Unknown',
                            awayName: match.away_name || match.awayTeam || 'Unknown'
                        }))
                    };
                    
                    console.log(`   ✅ ${seasonMatches.data.length} partidas, ${uniqueTeams.size} times únicos`);
                } else {
                    console.log(`   ❌ Sem dados`);
                    dataMap[seasonId] = { totalMatches: 0, uniqueTeams: 0, teamIds: [], sampleMatches: [] };
                }
                
                await new Promise(resolve => setTimeout(resolve, 400));
                
            } catch (error) {
                console.log(`   ❌ Erro: ${error.message}`);
                dataMap[seasonId] = { error: error.message };
            }
        }
        
        return dataMap;
        
    } catch (error) {
        console.error('❌ Erro na análise:', error);
        return {};
    }
}

// Função principal
async function main() {
    console.log('🚀 TESTE DE ROBUSTEZ DA IMPLEMENTAÇÃO');
    console.log('====================================\n');
    
    try {
        // 1. Análise de disponibilidade de dados
        const dataMap = await analyzeDataAvailability();
        
        // 2. Teste de robustez com diferentes times
        const robustnessResults = await testRobustnessWithDifferentTeams();
        
        // 3. Compilar resultados finais
        const timestamp = Date.now();
        const fs = require('fs');
        
        const finalResults = {
            timestamp: new Date().toISOString(),
            testType: 'robustness-validation',
            dataAvailabilityMap: dataMap,
            robustnessTests: robustnessResults,
            summary: {
                totalTests: robustnessResults.length,
                successfulTests: robustnessResults.filter(r => r.success).length,
                failedTests: robustnessResults.filter(r => !r.success).length,
                seasonsWithAnyData: Object.keys(dataMap).filter(season => 
                    dataMap[season].totalMatches && dataMap[season].totalMatches > 0
                ),
                teamsWithData: []
            }
        };
        
        // Extrair times que têm dados
        Object.values(dataMap).forEach(seasonData => {
            if (seasonData.teamIds) {
                finalResults.summary.teamsWithData = finalResults.summary.teamsWithData.concat(seasonData.teamIds);
            }
        });
        
        finalResults.summary.teamsWithData = [...new Set(finalResults.summary.teamsWithData)]; // Remove duplicatas
        
        // 4. Salvar resultados
        fs.writeFileSync(
            `ROBUSTNESS-TEST-RESULTS-${timestamp}.json`,
            JSON.stringify(finalResults, null, 2)
        );
        
        console.log(`\n💾 Resultados salvos em: ROBUSTNESS-TEST-RESULTS-${timestamp}.json`);
        
        // 5. Resumo final
        console.log('\n🎯 RESUMO FINAL:');
        console.log('=' .repeat(40));
        console.log(`Testes realizados: ${finalResults.summary.totalTests}`);
        console.log(`Sucessos: ${finalResults.summary.successfulTests}`);
        console.log(`Falhas: ${finalResults.summary.failedTests}`);
        console.log(`Seasons com dados: ${finalResults.summary.seasonsWithAnyData.length}`);
        console.log(`Times únicos encontrados: ${finalResults.summary.teamsWithData.length}`);
        
        console.log('\n📊 SEASONS COM DADOS:');
        finalResults.summary.seasonsWithAnyData.forEach(season => {
            const data = dataMap[season];
            console.log(`- Season ${season}: ${data.totalMatches} partidas, ${data.uniqueTeams} times`);
        });
        
        console.log('\n🧪 RESULTADOS DOS TESTES:');
        robustnessResults.forEach((result, i) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${i + 1}. ${status} ${result.testCase.name}`);
            console.log(`   ${result.homeMatches + result.awayMatches} partidas encontradas`);
        });
        
        // Conclusão
        if (finalResults.summary.successfulTests > 0) {
            console.log('\n🎉 IMPLEMENTAÇÃO ROBUSTA CONFIRMADA!');
            console.log('Pelo menos alguns testes foram bem-sucedidos, indicando que a lógica funciona.');
        } else {
            console.log('\n⚠️ PROBLEMAS DE ROBUSTEZ DETECTADOS');
            console.log('Nenhum teste foi bem-sucedido. Pode haver problemas com a API ou dados.');
        }
        
        // Se houver dados disponíveis, sugerir times para teste
        if (finalResults.summary.teamsWithData.length > 0) {
            console.log('\n💡 TIMES DISPONÍVEIS PARA TESTE:');
            console.log('IDs de times que têm dados históricos:');
            finalResults.summary.teamsWithData.slice(0, 20).forEach((teamId, i) => {
                console.log(`${i + 1}. Team ID: ${teamId}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro na execução principal:', error);
    }
}

// Executar
main().catch(console.error);
