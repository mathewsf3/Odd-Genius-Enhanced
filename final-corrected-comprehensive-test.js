/**
 * TESTE FINAL CORRIGIDO - COMPREHENSIVE MATCH TEST
 * 
 * CORREÇÕES APLICADAS baseadas na análise real do JSON:
 * ✅ homeID/awayID (não home_id/away_id)  
 * ✅ season: "2026" (não season_id)
 * ✅ roundID (não round_id)
 * ✅ Sem league_id no response
 * ✅ Estratégia robusta para obter form data de seleções nacionais
 * ✅ Error handling não-fatal para 417/404 errors
 */

const axios = require('axios');
const fs = require('fs');

// Configurações da API
const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';
const MATCH_ID = 7479469; // Iran vs North Korea

// Timeout padrão para requisições
const REQUEST_TIMEOUT = 25000;

/**
 * Executa requisição para API com tratamento de erro robusto
 */
async function safeApiRequest(endpoint, params = {}, description = '') {
    try {
        console.log(`\n🔄 ${description}`);
        console.log(`   Endpoint: ${endpoint}`);
        console.log(`   Params:`, JSON.stringify(params, null, 2));
        
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { key: API_KEY, ...params },
            timeout: REQUEST_TIMEOUT,
            validateStatus: () => true // Não falhar em códigos de status HTTP
        });
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Data size: ${JSON.stringify(response.data).length} bytes`);
        
        // Verificar se é um erro da API mas continuar execução
        if (response.status !== 200) {
            console.log(`   ⚠️  Warning: Status ${response.status} - ${response.data?.message || 'Unknown error'}`);
            return { 
                success: false, 
                error: `HTTP ${response.status}`,
                message: response.data?.message,
                data: null 
            };
        }
        
        if (!response.data?.success) {
            console.log(`   ⚠️  Warning: API returned success=false - ${response.data?.message || 'Unknown error'}`);
            return {
                success: false,
                error: 'API_ERROR',
                message: response.data?.message,
                data: response.data?.data || null
            };
        }
        
        return {
            success: true,
            data: response.data.data,
            metadata: response.data.metadata,
            rawResponse: response.data
        };
        
    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
        return {
            success: false,
            error: error.code || 'REQUEST_ERROR',
            message: error.message,
            data: null
        };
    }
}

/**
 * Obtém dados do match específico
 */
async function getMatchData() {
    return await safeApiRequest('/match', { match_id: MATCH_ID }, 'Buscando dados do match Iran vs North Korea');
}

/**
 * Obtém os últimos jogos de um time específico
 */
async function getTeamFormData(teamId, teamName, homeAway = null) {
    console.log(`\n🏆 Buscando form data para ${teamName} (ID: ${teamId})`);
    
    // Estratégia 1: Tentar endpoint league-matches sem filtro de venue
    const seasonAttempts = ['2026', '2025', '2024'];
    
    for (const season of seasonAttempts) {
        console.log(`   🔍 Tentando season: ${season}`);
        
        const result = await safeApiRequest(
            '/league-matches', 
            { season, team: teamId },
            `Form data ${teamName} - Season ${season}`
        );
        
        if (result.success && result.data && Array.isArray(result.data)) {
            console.log(`   ✅ Encontrados ${result.data.length} jogos para ${teamName} na season ${season}`);
            
            // Filtrar manualmente para HOME/AWAY se especificado
            let filteredMatches = result.data;
            
            if (homeAway) {
                const originalCount = filteredMatches.length;
                filteredMatches = result.data.filter(match => {
                    const isHome = match.homeID === teamId || match.home_id === teamId;
                    const isAway = match.awayID === teamId || match.away_id === teamId;
                    
                    if (homeAway === 'home') return isHome;
                    if (homeAway === 'away') return isAway;
                    return true;
                });
                
                console.log(`   🎯 Filtrado para ${homeAway}: ${filteredMatches.length}/${originalCount} jogos`);
            }
            
            // Pegar os últimos 5 jogos
            const recentMatches = filteredMatches
                .filter(match => match.status === 'complete') // Apenas jogos completados
                .sort((a, b) => (b.date_unix || 0) - (a.date_unix || 0)) // Mais recentes primeiro
                .slice(0, 5);
            
            console.log(`   📋 Retornando ${recentMatches.length} jogos mais recentes`);
            
            return {
                success: true,
                data: recentMatches,
                season: season,
                total_found: result.data.length
            };
        }
    }
    
    // Estratégia 2: Tentar endpoint de team diretamente se disponível
    console.log(`   🔄 Tentando endpoint de team diretamente...`);
    
    const teamResult = await safeApiRequest(
        '/team', 
        { team_id: teamId },
        `Team data para ${teamName}`
    );
    
    if (teamResult.success) {
        console.log(`   ✅ Dados de team obtidos para ${teamName}`);
        return {
            success: true,
            data: [],
            message: 'Team data available but no recent matches found',
            team_data: teamResult.data
        };
    }
    
    console.log(`   ⚠️  Não foi possível obter form data específico para ${teamName}`);
    return {
        success: false,
        error: 'NO_FORM_DATA',
        message: `Could not retrieve form data for ${teamName}`,
        data: []
    };
}

/**
 * Obtém dados de H2H entre dois times
 */
async function getH2HData(homeId, awayId, homeName, awayName) {
    return await safeApiRequest(
        '/head-to-head',
        { team1: homeId, team2: awayId },
        `H2H data entre ${homeName} vs ${awayName}`
    );
}

/**
 * Obtém dados da liga/temporada se possível
 */
async function getLeagueSeasonData(season) {
    console.log(`\n🏆 Tentando obter dados da liga para season: ${season}`);
    
    // Tentar diferentes variações do season
    const seasonVariations = [season, parseInt(season), season.toString()];
    
    for (const seasonVar of seasonVariations) {
        const result = await safeApiRequest(
            '/league-season',
            { season_id: seasonVar },
            `League season data - variation: ${seasonVar}`
        );
        
        if (result.success) {
            return result;
        }
    }
    
    console.log(`   ⚠️  League season data não disponível para season ${season}`);
    return {
        success: false,
        error: 'NO_LEAGUE_SEASON_DATA',
        message: `League season data not available for season ${season}`,
        data: null
    };
}

/**
 * Função principal do teste
 */
async function runComprehensiveMatchTest() {
    console.log('🚀 TESTE COMPREHENSIVE FINAL CORRIGIDO');
    console.log('=====================================');
    console.log(`Match ID: ${MATCH_ID} (Iran vs North Korea)`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
    
    const results = {
        timestamp: new Date().toISOString(),
        match_id: MATCH_ID,
        test_status: 'RUNNING',
        corrections_applied: [
            'homeID/awayID field paths',
            'season string format',
            'roundID field path',
            'no league_id assumption',
            'robust error handling',
            'national team form data strategy'
        ],
        data: {},
        errors: [],
        warnings: []
    };
    
    try {
        // 1. OBTER DADOS DO MATCH
        console.log('\n' + '='.repeat(50));
        console.log('STEP 1: MATCH DATA');
        console.log('='.repeat(50));
        
        const matchResult = await getMatchData();
        
        if (!matchResult.success) {
            results.errors.push({
                step: 'match_data',
                error: matchResult.error,
                message: matchResult.message
            });
            throw new Error(`Failed to get match data: ${matchResult.message}`);
        }
        
        const matchData = matchResult.data;
        results.data.match = matchData;
        
        // Extrair informações do match usando os campos CORRETOS
        const homeTeamId = matchData.homeID; // CORRIGIDO: era home_id
        const awayTeamId = matchData.awayID; // CORRIGIDO: era away_id
        const homeName = matchData.home_name;
        const awayName = matchData.away_name;
        const season = matchData.season; // CORRIGIDO: é string, não season_id
        const roundId = matchData.roundID; // CORRIGIDO: era round_id
        
        console.log(`\n📊 DADOS EXTRAÍDOS DO MATCH:`);
        console.log(`   🏠 Home: ${homeName} (ID: ${homeTeamId})`);
        console.log(`   ✈️  Away: ${awayName} (ID: ${awayTeamId})`);
        console.log(`   📅 Season: ${season}`);
        console.log(`   🎯 Round ID: ${roundId}`);
        console.log(`   📈 Odds disponíveis: ${matchData.odds_ft_1 ? 'SIM' : 'NÃO'}`);
        
        // 2. OBTER FORM DATA DOS TIMES
        console.log('\n' + '='.repeat(50));
        console.log('STEP 2: TEAM FORM DATA');
        console.log('='.repeat(50));
        
        // Iran - últimos 5 jogos em CASA
        const iranHomeForm = await getTeamFormData(homeTeamId, homeName, 'home');
        results.data.iran_home_form = iranHomeForm;
        
        if (!iranHomeForm.success) {
            results.warnings.push({
                step: 'iran_home_form',
                message: iranHomeForm.message
            });
        }
        
        // North Korea - últimos 5 jogos FORA de casa
        const northKoreaAwayForm = await getTeamFormData(awayTeamId, awayName, 'away');
        results.data.north_korea_away_form = northKoreaAwayForm;
        
        if (!northKoreaAwayForm.success) {
            results.warnings.push({
                step: 'north_korea_away_form',
                message: northKoreaAwayForm.message
            });
        }
        
        // 3. OBTER DADOS H2H
        console.log('\n' + '='.repeat(50));
        console.log('STEP 3: H2H DATA');
        console.log('='.repeat(50));
        
        const h2hResult = await getH2HData(homeTeamId, awayTeamId, homeName, awayName);
        results.data.h2h = h2hResult;
        
        if (!h2hResult.success) {
            results.warnings.push({
                step: 'h2h_data',
                message: h2hResult.message
            });
        }
        
        // 4. OBTER DADOS DA LIGA/TEMPORADA
        console.log('\n' + '='.repeat(50));
        console.log('STEP 4: LEAGUE SEASON DATA');
        console.log('='.repeat(50));
        
        const leagueSeasonResult = await getLeagueSeasonData(season);
        results.data.league_season = leagueSeasonResult;
        
        if (!leagueSeasonResult.success) {
            results.warnings.push({
                step: 'league_season_data',
                message: leagueSeasonResult.message
            });
        }
        
        // 5. COMPILAR RESULTADOS FINAIS
        console.log('\n' + '='.repeat(50));
        console.log('STEP 5: FINAL COMPILATION');
        console.log('='.repeat(50));
        
        results.test_status = 'COMPLETED';
        results.summary = {
            match_data_available: !!matchResult.success,
            iran_home_form_available: iranHomeForm.success,
            iran_home_games_found: iranHomeForm.data?.length || 0,
            north_korea_away_form_available: northKoreaAwayForm.success,
            north_korea_away_games_found: northKoreaAwayForm.data?.length || 0,
            h2h_data_available: h2hResult.success,
            league_season_data_available: leagueSeasonResult.success,
            total_errors: results.errors.length,
            total_warnings: results.warnings.length,
            odds_data_available: !!(matchData.odds_ft_1),
            prediction_data_available: !!(matchData.gpt_en)
        };
        
        // Salvar resultados
        const filename = `final-corrected-comprehensive-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log(`\n✅ TESTE FINALIZADO COM SUCESSO!`);
        console.log(`📁 Resultados salvos em: ${filename}`);
        console.log(`\n📊 RESUMO FINAL:`);
        console.log(`   ✅ Match data: ${results.summary.match_data_available ? 'OK' : 'FALHOU'}`);
        console.log(`   🏠 Iran home form: ${results.summary.iran_home_games_found} jogos encontrados`);
        console.log(`   ✈️  North Korea away form: ${results.summary.north_korea_away_games_found} jogos encontrados`);
        console.log(`   🔗 H2H data: ${results.summary.h2h_data_available ? 'OK' : 'INDISPONÍVEL'}`);
        console.log(`   📈 Odds data: ${results.summary.odds_data_available ? 'OK' : 'INDISPONÍVEL'}`);
        console.log(`   🤖 Prediction data: ${results.summary.prediction_data_available ? 'OK' : 'INDISPONÍVEL'}`);
        console.log(`   ⚠️  Total warnings: ${results.summary.total_warnings}`);
        console.log(`   ❌ Total errors: ${results.summary.total_errors}`);
        
        return results;
        
    } catch (error) {
        console.error(`\n💥 TESTE FALHOU: ${error.message}`);
        results.test_status = 'FAILED';
        results.fatal_error = {
            message: error.message,
            stack: error.stack
        };
        
        // Salvar mesmo em caso de falha
        const filename = `final-corrected-comprehensive-test-FAILED-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        
        console.log(`📁 Resultados de falha salvos em: ${filename}`);
        throw error;
    }
}

// Executar teste
if (require.main === module) {
    runComprehensiveMatchTest()
        .then(results => {
            console.log('\n🎉 TESTE COMPREHENSIVE EXECUTADO COM SUCESSO!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 FALHA NO TESTE COMPREHENSIVE:', error.message);
            process.exit(1);
        });
}

module.exports = { runComprehensiveMatchTest };
