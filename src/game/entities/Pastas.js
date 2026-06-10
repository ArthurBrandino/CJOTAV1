export class Pastas extends Phaser.GameObjects.Sprite {    
    constructor(scene, x, y) {
        const largura = 50;
        const altura = 50;
        super(scene, x, y, 'spr_folder', largura, altura);
        
        this.setFrame(1);
        this.vida = Phaser.Math.Between(3, 6); 
        this.bits = Phaser.Math.Between(5, 10);

        scene.add.existing(this);
        // Configuração de corpo físico estático para servir de obstáculo intransponível passivo
        scene.physics.add.existing(this, true); 
        
        // Ativação do barramento de input do Phaser para detecção de cliques do mouse/toques
        this.setInteractive(); 
        this.on('pointerdown', () => { this.tentarMinerar(); });
    }

    // --- 1. MECÂNICA DE MINERAÇÃO E VALIDAÇÃO PROXIMAL ---
    tentarMinerar() {
        const player = this.scene.enzinho;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Verificação de raio de alcance do jogador 
        if (dist < 500) {
            this.scene.adicionarBits(this.bits);
            this.vida--;
            this.scene.sound.play('key');

            // Feedback tátil visual elástico 
            this.scene.tweens.add({
                targets: this,
                scale: 0.8,
                duration: 50,
                yoyo: true 
            });

            // Atualização do estado do frame baseado no limiar de integridade da pasta
            if (this.vida === 1) this.setFrame(0);
            if (this.vida <= 0) this.destroy(); 
        } else {
            console.log("Muito longe para minerar!");
        }
    }

    // --- 2. ALGORITMO ESTRUTURAL DE SPAWN EM GRID MESH ---
    static gerarGrupo(scene, quantidade) {
        for (let i = 0; i < quantidade; i++) {
            let xRaw = Phaser.Math.Between(100, 1900);
            let yRaw = Phaser.Math.Between(100, 1900);
            
            // Projeção matemática para encaixe perfeito em células do Grid (50x50) com offset de pivô (+25)
            const xFinal = Math.floor(xRaw / 50) * 50 + 25;
            const yFinal = Math.floor(yRaw / 50) * 50 + 25;

            new Pastas(scene, xFinal, yFinal);
        }
    }
}