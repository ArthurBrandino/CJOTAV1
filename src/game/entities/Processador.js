import Phaser from 'phaser';

export class Processador extends Phaser.Physics.Arcade.Sprite {   
    constructor(scene, x, y) {
        super(scene, x, y, 'processador');
        
        scene.add.existing(this);
        // Configuração de física estática (essencial para o núcleo/base a ser defendido)
        scene.physics.add.existing(this, true);

        // Configurações de transformação e renderização de textura
        this.setScale(3);
        this.setPixelArt = true;

        // Ajuste da caixa de colisão baseada nas dimensões nativas do asset
        this.body.setSize(this.width, this.height);
        this.body.setOffset(0, 0);

        // Sincronização do corpo estático: Força o motor físico a recalcular a caixa com base na escala
        this.body.updateFromGameObject();

        // Parâmetros de integridade do núcleo
        this.vidaMaxima = 100;
        this.vidaAtual = this.vidaMaxima;  

        this.somHit = scene.sound.add('hit_processador');
        this.podeTocarSomHit = true;
    }

    // --- 1. PIPELINE DE DANOS E DISPARO DE EVENTOS GLOBAIS ---
    receberDano(quantidade) {
        this.vidaAtual = Phaser.Math.Clamp(this.vidaAtual - quantidade, 0, this.vidaMaxima);
        
        // Emissão de barramento de eventos para atualização da interface (HUD/UI) externa
        this.scene.events.emit('update-hp', this.vidaAtual, this.vidaMaxima);

        // Gatilho de verificação de derrota imediata (Ciclo de interrupção de jogo)
        if (this.vidaAtual <= 0) {
            this.destruirEGameOver();
            return;
        }

        // Debounce de feedback tátil e sonoro para evitar saturação de canais
        if (this.podeTocarSomHit) {
            this.podeTocarSomHit = false; 

            if (this.somHit) this.somHit.play();

            this.setTint(0xff3333);
            this.setAlpha(0.8); 

            this.scene.time.delayedCall(150, () => {
                this.clearTint();            
                this.setAlpha(1);             
                this.podeTocarSomHit = true;
            });
        }
    }

    // --- 2. CICLO DE ENCERRAMENTO E TRANSIÇÃO DE MÁQUINA DE ESTADOS ---
    destruirEGameOver() {
        // Garbage Collection de canais de áudio locais
        if (this.somHit) {
            this.somHit.stop();
            this.somHit.destroy();
        }
        
        // Limpeza do barramento acústico de background da cena ativa
        if (this.scene.bgmOnda) {
            this.scene.bgmOnda.stop();
        }
        
        // Transição direta de contexto para a Scene de terminação (GameOver / Tela Azul)
        this.scene.scene.start('GameOver'); 
    }
}