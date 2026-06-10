// =====================================================================
// --- CONFIGURAÇÃO GLOBAL DE BALANCEAMENTO E RITMO DE ONDAS (WAVES) ---
// =====================================================================
export const WAVES = [
    // --- 1. INTRODUÇÃO E CURVA DE APRENDIZADO ---
    {
        id: 1,
        safeTime: 5000,   
        dangerTime: 15000, 
        inimigos: [
            { classe: 'Worm', quantidade: 10, intervalo: 1000 }
        ],
        pastasParaCriar: 2
    },
    {
        id: 2,
        safeTime: 8000,
        dangerTime: 20000,
        inimigos: [
            { classe: 'Worm', quantidade: 15, intervalo: 800 },
            { classe: 'Trojan', quantidade: 2, intervalo: 3000 }
        ],
        pastasParaCriar: 4
    },

    // --- 2. INTRODUÇÃO DE MECÂNICAS ESPECÍFICAS (FIREWALL & CLICKER) ---
    {
        id: 3,
        safeTime: 8000,
        dangerTime: 25000,
        inimigos: [
            { classe: 'ILY', quantidade: 2, intervalo: 8000 }, 
            { classe: 'Worm', quantidade: 8, intervalo: 1500 }
        ],
        pastasParaCriar: 3
    },
    {
        id: 4,
        safeTime: 10000,
        dangerTime: 30000,
        inimigos: [
            { classe: 'Trojan', quantidade: 5, intervalo: 4000 }, 
            { classe: 'Worm', quantity: 12, intervalo: 1000 }
        ],
        pastasParaCriar: 5
    },

    // --- 3. PRESSÃO COMBINADA E RITMO DE ENXAME (LIXEIRA) ---
    {
        id: 5,
        safeTime: 10000,
        dangerTime: 35000,
        inimigos: [
            { classe: 'ILY', quantidade: 3, intervalo: 6000 },
            { classe: 'Trojan', quantidade: 3, intervalo: 5000 },
            { classe: 'Worm', quantidade: 15, intervalo: 800 }
        ],
        pastasParaCriar: 6
    },
    {
        id: 6,
        safeTime: 12000,
        dangerTime: 40000,
        inimigos: [
            { classe: 'Worm', quantidade: 35, intervalo: 400 } 
        ],
        pastasParaCriar: 5
    },

    // --- 4. EXCEÇÃO DE MEMÓRIA E DIVISÃO DE ATENÇÃO ---
    {
        id: 7,
        safeTime: 12000,
        dangerTime: 45000,
        inimigos: [
            { classe: 'Trojan', quantidade: 6, intervalo: 3500 },
            { classe: 'ILY', quantidade: 4, intervalo: 5000 }
        ],
        pastasParaCriar: 8
    },
    {
        id: 8,
        safeTime: 15000,
        dangerTime: 50000,
        inimigos: [
            { classe: 'Worm', quantidade: 25, intervalo: 600 },
            { classe: 'ILY', quantidade: 5, intervalo: 4000 },
            { classe: 'Trojan', quantidade: 4, intervalo: 4500 }
        ],
        pastasParaCriar: 7
    },

    // --- 5. CLÍMAX E APOCALIPSE FINAL DE SISTEMA ---
    {
        id: 9,
        safeTime: 15000,
        dangerTime: 45000,
        inimigos: [
            { classe: 'Worm', quantidade: 50, intervalo: 300 }, 
            { classe: 'ILY', quantidade: 2, intervalo: 10000 }
        ],
        pastasParaCriar: 10
    },
    {
        id: 10,
        safeTime: 20000,
        dangerTime: 60000,
        inimigos: [
            { classe: 'ILY', quantidade: 8, intervalo: 3000 },     
            { classe: 'Trojan', quantidade: 10, intervalo: 2500 },  
            { classe: 'Worm', quantidade: 40, intervalo: 400 }     
        ],
        pastasParaCriar: 15 
    }
];