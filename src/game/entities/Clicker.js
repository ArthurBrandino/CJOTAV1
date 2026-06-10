import { Defesa } from './Defesa.js';

export class Clicker extends Defesa {
    // --- 1. PROPRIEDADES ESTÁTICAS DE BALANCEAMENTO ---
    static get CUSTO() { return 50; }
    static get RANGE() { return 300; }
    static get LARGURA() { return 100; }
    static get ALTURA() { return 100; }
    static get VIDA() { return 5; }
    static get TAXA_TIRO() { return 1000; }
    static get DANO() { return 1; }

    constructor(scene, x, y) {
        super(
            scene, 
            x, 
            y, 
            Clicker.LARGURA, 
            Clicker.ALTURA, 
            'spr_clicker',
            Clicker.VIDA, 
            Clicker.TAXA_TIRO, 
            Clicker.DANO, 
            Clicker.RANGE, 
            Clicker.CUSTO
        );
        
        this.proximoTiro = 0;
    }

    // --- 2. CICLO DE ATUALIZAÇÃO DA ENTIDADE ---
    update(time, delta) {
        // Controle de cadência baseado no tempo global do motor
        if (time > this.proximoTiro) {
            this.atirarNoMaisProximo(time);
        }
    }

    // --- 3. LÓGICA DE COMBATE E ANIMAÇÃO DE FEEDBACK ---
    atirarNoMaisProximo(time) {
        const alvo = this.procurarAlvo();

        if (alvo) {
            alvo.receberDano(this.dano); 
            this.proximoTiro = time + this.speed;
            
            this.scene.sound.play('ClickerShoot');
            
            // Efeito elástico (Squash & Stretch) para simular o clique do mouse
            this.scene.tweens.add({
                targets: this,
                scale: 0.8,
                duration: 50,
                yoyo: true
            });
        }
    }
}