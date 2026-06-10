import { Inimigo } from "./Virus";

export class ILY extends Inimigo {
    // --- 1. CONSTRUTOR E PARAMETRIZAÇÃO DE ATRIBUTOS ---
    constructor(scene, x, y) {
        const velocidade = 70;
        const vida = 15; 
        const dano = 20;
        const largura = 50; 
        const altura = 35;
        const frequencia = 0.005;
        const amplitude = 4;

        super(scene, x, y, largura, altura, 'spr_letter', vida, velocidade, dano, frequencia, amplitude);
        
        // Flag de exceção: Sinaliza ao barramento de Defesa para ignorar esta instância nas varreduras de mira
        this.alvejavel = false; 
    }

    // --- 2. EXCEÇÃO DE INTERAÇÃO (IMUNIDADE ABSOLUTA) ---
    receberDano(quantidade) {
        // Bloqueio de pipeline de dano: Garante imunidade caso seja interceptado por colisões ou projéteis alternativos
        return; 
    }

    // --- 3. COMPORTAMENTO DE IMPACTO E DESALOCAÇÃO ---
    explodir(alvo, dano) {
        // Aplicação direta de dano massivo (Hitkill) ao interceptar uma barreira/defesa no tabuleiro
        alvo.receberDano(dano); 
        this.destroy(); 
    }
}