import { Inimigo } from "./Virus";
import { Worm } from "./Worm";

export class Trojan extends Inimigo {
    // --- 1. CONSTRUTOR E PARAMETRIZAÇÃO DE ATRIBUTOS ---
    constructor(scene, x, y) {
        const velocidade = 60;
        const vida = 40;
        const dano = 10;
        const largura = 50; 
        const altura = 50;
        const frequencia = 0;
        const amplitude = 0;

        super(scene, x, y, largura, altura, 'spr_trojan', vida, velocidade, dano, frequencia, amplitude);
    }

    // --- 2. CICLO DE PRÉ-RENDERIZAÇÃO E ORIENTAÇÃO DE FLIP ---
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Atualização dinâmica baseada no vetor de velocidade do motor físico
        if (this.body) {
            if (this.body.velocity.x > 0) {
                this.setFlipX(false); 
            } else if (this.body.velocity.x < 0) {
                this.setFlipX(true); 
            }
        }
    }

    // --- 3. ROTINA DE DESTRUIÇÃO E INJEÇÃO DE ENTIDADES FILHAS (SPAWN) ---
    morrer(gerarFilhos = true) {
        if (gerarFilhos) {
            let quantidade = Phaser.Math.Between(2, 4);
            
            for (let i = 0; i < quantidade; i++) {
                // Cálculo de dispersão radial para evitar sobreposição imediata de hitboxes
                const offsetX = Phaser.Math.Between(-30, 30);
                const offsetY = Phaser.Math.Between(-30, 30);

                const wormFilho = new Worm(
                    this.scene, 
                    this.x + offsetX, 
                    this.y + offsetY
                );
            
                // Alocação da nova instância no barramento global de colisões da cena ativa
                if (this.scene.inimigos) {
                    this.scene.inimigos.add(wormFilho);
                }
            }
        }
        
        super.morrer(gerarFilhos);
    }
}