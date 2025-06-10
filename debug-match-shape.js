/**
 * DIAGNÓSTICO: SHAPE REAL DO JSON DO /match
 * 
 * Vamos verificar o formato exato que o endpoint /match retorna
 * para Iran vs North Korea (Match ID: 7479469)
 */

const axios = require('axios');

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';

async function debugMatchShape() {
    console.log('🔍 DIAGNÓSTICO: SHAPE REAL DO JSON DO /match');
    console.log('===============================================');
    console.log(`Match ID: 7479469 (Iran vs North Korea)`);
    console.log(`📅 Data: ${new Date().toISOString()}\n`);

    try {
        const res = await axios.get(
            'https://api.football-data-api.com/match',
            { 
                params: { 
                    key: API_KEY, 
                    match_id: 7479469 
                },
                timeout: 25000
            }
        );

        console.log('✅ STATUS:', res.status);
        console.log('✅ DATA SIZE:', JSON.stringify(res.data).length, 'bytes');
        console.log('\n📊 ESTRUTURA COMPLETA DO RESPONSE:');
        console.log('=====================================');
        console.dir(res.data, { depth: 3, colors: true });

        // Análise específica dos campos críticos
        console.log('\n🎯 CAMPOS CRÍTICOS IDENTIFICADOS:');
        console.log('==================================');
        
        const data = res.data;
        
        console.log('📋 ROOT LEVEL:');
        console.log('   success:', data.success);
        console.log('   data type:', typeof data.data);
        console.log('   data keys:', data.data ? Object.keys(data.data).slice(0, 10) : 'N/A');
        
        if (data.data) {
            const matchData = data.data;
            console.log('\n🏆 MATCH DATA LEVEL:');
            console.log('   id:', matchData.id);
            console.log('   homeID:', matchData.homeID);
            console.log('   awayID:', matchData.awayID);
            console.log('   home_id:', matchData.home_id);
            console.log('   away_id:', matchData.away_id);
            console.log('   home_name:', matchData.home_name);
            console.log('   away_name:', matchData.away_name);
            console.log('   season:', matchData.season);
            console.log('   season_id:', matchData.season_id);
            console.log('   league_id:', matchData.league_id);
            console.log('   roundID:', matchData.roundID);
            console.log('   round_id:', matchData.round_id);
            
            console.log('\n🔑 ANÁLISE DE CAMPOS:');
            console.log('=====================================');
            console.log('   Team ID format:', matchData.homeID ? 'homeID/awayID' : 'home_id/away_id');
            console.log('   Season format:', matchData.season_id ? `season_id: ${matchData.season_id}` : `season: ${matchData.season}`);
            console.log('   Round format:', matchData.roundID ? 'roundID' : 'round_id');
            
            // Salvar estrutura para análise
            const analysis = {
                timestamp: new Date().toISOString(),
                matchId: 7479469,
                responseStructure: {
                    hasSuccess: !!data.success,
                    hasData: !!data.data,
                    dataType: typeof data.data,
                    isArray: Array.isArray(data.data)
                },
                fieldMapping: {
                    teamIds: {
                        homeID: matchData.homeID,
                        awayID: matchData.awayID,
                        home_id: matchData.home_id,
                        away_id: matchData.away_id,
                        recommended: matchData.homeID ? 'homeID/awayID' : 'home_id/away_id'
                    },
                    season: {
                        season: matchData.season,
                        season_id: matchData.season_id,
                        recommended: matchData.season_id || matchData.season
                    },
                    league: {
                        league_id: matchData.league_id,
                        recommended: matchData.league_id
                    },
                    round: {
                        roundID: matchData.roundID,
                        round_id: matchData.round_id,
                        recommended: matchData.roundID || matchData.round_id
                    }
                },
                allKeys: Object.keys(matchData)
            };
            
            require('fs').writeFileSync(
                `match-shape-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
                JSON.stringify(analysis, null, 2)
            );
            
            console.log('\n✅ DIAGNÓSTICO COMPLETO!');
            console.log('📁 Análise salva em: match-shape-analysis-*.json');
            
            return analysis;
        }

    } catch (error) {
        console.error('❌ ERRO no diagnóstico:', error.message);
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        throw error;
    }
}

// Executar diagnóstico
if (require.main === module) {
    debugMatchShape().catch(console.error);
}

module.exports = { debugMatchShape };
