import Phaser from 'phaser';

export class Inimigo extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, largura, altura, spriteKey, hp, speed, dano, freq = 0, amp = 0) {
        super(scene, x, y, spriteKey);
        
        this.setDisplaySize(largura, altura);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Atributos lógicos e de balanceamento
        this.hp = hp;
        this.speed = speed;
        this.dano = dano;
        this.frequencia = freq; 
        this.amplitude = amp;
        
        // Atribuição de IA de perseguição: O Processador central é o destino padrão
        this.alvo = scene.processador; 
        this.alvejavel = true;
    }

    // --- 1. VETORES DE MOVIMENTAÇÃO E CÁLCULO TRICOMOMÉTRICO ---
    preUpdate(time, delta) {
        if (this.alvo && this.alvo.active) {
            // Aplica o vetor de velocidade física em direção às coordenadas do alvo
            this.scene.physics.moveToObject(this, this.alvo, this.speed);

            // Condicional de perturbação de trajetória: Aplica oscilação ondulatória (onda senoidal)
            if (this.amplitude > 0) {
                // Ângulo base em radianos em relação ao alvo
                const angulo = Phaser.Math.Angle.Between(this.x, this.y, this.alvo.x, this.alvo.y);
                
                // Mapeamento da crista/vale da onda com base no tempo de execução global
                const oscilacao = Math.sin(time * this.frequencia) * this.amplitude;

                // Deslocamento ortogonal (+90º / PI/2) para fazer o movimento de ziguezague lateral
                this.x += Math.cos(angulo + Math.PI / 2) * oscilacao;
                this.y += Math.sin(angulo + Math.PI / 2) * oscilacao;
            }
        }
    }

    // --- 2. PIPELINE DE IMPACTO E FEEDBACK VISUAL ---
    receberDano(quantidade) {
        this.hp -= quantidade;

        // Feedback visual imediato (Piscar de opacidade controlado)
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });
        
        if (this.hp <= 0) {
            this.morrer();
        }
    }

    // --- 3. RECOMPENSA E DESALOCAÇÃO DA INSTÂNCIA ---
    morrer(gerarFilhos = true) {
        // Barramento de economia: Injeta a pontuação de bits na carteira global da cena
        if (this.scene.adicionarBits) { 
            let bits = Phaser.Math.Between(1, 5);
            this.scene.adicionarBits(bits);
        }
        this.destroy();
    }
}