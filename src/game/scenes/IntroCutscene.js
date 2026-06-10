import Phaser from 'phaser';

export class IntroCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroCutscene' });
    }

    create() {
        // --- 1. CONFIGURAÇÃO DO PLANO DE FUNDO (CUTSCENE) ---
        this.comic = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'introducao_cutscene');
        this.comic.setOrigin(0.5);
        this.comic.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // --- 2. INTERFACE E TEXTO DA HUD ---
        this.clickText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.height - 50, 
            "CLIQUE EM QUALQUER LUGAR PARA CONTINUAR", 
            {
                fontFamily: 'monospace', 
                fontSize: '20px',
                fill: '#ffffff', 
                stroke: '#000000', 
                strokeThickness: 4
            }
        );
        this.clickText.setOrigin(0.5); 

        // --- 3. EFEITOS VISUAIS E TRANSIÇÕES ---
        this.tweens.add({
            targets: this.clickText,
            alpha: 0,            
            duration: 800,        
            yoyo: true,           
            loop: -1              
        });

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // --- 4. GERENCIAMENTO DE INPUTS (MOUSE E TECLADO) ---
        this.input.on('pointerdown', () => this.startGame());
        this.input.keyboard.on('keydown', () => this.startGame());
    }

    startGame() {
        // --- 5. TRANSIÇÃO DE SAÍDA SEGURA ---
        if (this.cameras.main.fadeEffect.isRunning) return;

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Game'); 
        });
    }
}