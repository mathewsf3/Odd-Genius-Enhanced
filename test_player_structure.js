const axios = require('axios');

async function testPlayerStructure() {
    console.log('=== VERIFICAÇÃO DA ESTRUTURA DOS DADOS DE JOGADORES ===');
    
    try {
        const response = await axios.get('http://localhost:5000/api/matches/1559456/players?matches=5');
        const data = response.data;
        
        console.log('Estrutura da resposta:');
        console.log('Keys principais:', Object.keys(data));
        
        if (data.result) {
            console.log('Keys do result:', Object.keys(data.result));
            console.log('Estrutura completa do result:');
            console.log(JSON.stringify(data.result, null, 2));
        } else {
            console.log('Dados completos:');
            console.log(JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.error('Erro:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Dados da resposta:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPlayerStructure();
