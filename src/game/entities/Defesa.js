import Phaser from 'phaser';

export class Defesa extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, largura, altura, spriteKey, hp, speed, dano, range, custo) {
        super(scene, x, y, spriteKey);
        
        scene.add.existing(this);
        // Configuração de corpo físico estático para impedir deslocamento por colisão
        scene.physics.add.existing(this, true);
        this.body.setSize(largura, altura);
        this.setDisplaySize(largura, altura);
        
        // Atributos lógicos de combate
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.dano = dano;
        this.range = range;
        this.custo = custo;

        this.somHit = scene.sound.add('DefenseHit');
        this.podeTocarSomHit = true;

        // Instanciação do pipeline gráfico dedicado à barra de integridade
        this.barraVida = scene.add.graphics();
        this.atualizarBarraVida();
    }

    // --- 1. PROCESSAMENTO DE DANOS E FEEDBACK VISUAL/SONORO ---
    receberDano(quantidade) {
        this.hp -= quantidade;

        if (this.hp <= 0) {
            this.destruir();
            return;
        }

        this.atualizarBarraVida(); 
        
        // Rotina de debounce visual para evitar sobrecarga de canais de áudio e flashes
        if (this.podeTocarSomHit) {
            this.podeTocarSomHit = false;

            if (this.somHit) this.somHit.play();

            this.setTint(0xff0000);
            this.alpha = 0.6; 

            this.scene.time.delayedCall(120, () => {
                this.clearTint();          
                this.alpha = 1;            
                this.podeTocarSomHit = true; 
            });
        }
    }

    // --- 2. SISTEMA DE VARREDURA DE ALVOS E FILTRAGEM DE IA ---
    procurarAlvo() {
        const listaInimigos = this.scene.inimigos.getChildren();

        return listaInimigos.find(inimigo => {
            // Verificação básica de integridade da instância e estado físico
            if (!inimigo || !inimigo.active || !inimigo.body || inimigo.estaPreso) return false;

            // Flag de exceção: ignora entidades marcadas como inalvejáveis (ex: ILY)
            if (inimigo.alvejavel === false) return false;

            // Restrição por raio geométrico de atuação
            const distancia = Phaser.Math.Distance.Between(this.x, this.y, inimigo.x, inimigo.y);
            if (distancia > this.range) return false;

            // Exceção de segmento estrutural (ignora partes do corpo da Worm)
            if (inimigo.ehSegmento === true) return false;

            return true; 
        });
    }

    // --- 3. PIPELINE GRÁFICO DA INTERFACE INDIVIDUAL ---
    atualizarBarraVida() {
        this.barraVida.clear();
        this.barraVida.setDepth(101);

        // Otimização: A barra permanece oculta se a entidade estiver com integridade máxima
        if (this.hp < this.maxHp && this.hp > 0) {
            const larguraTotal = this.width * 0.8;
            const alturaBarra = 6;
            const x = this.x - larguraTotal / 2;
            const y = this.y - (this.height / 2) - 15;

            // Renderização do background (Sombra/Contorno)
            this.barraVida.fillStyle(0x000000, 0.7);
            this.barraVida.fillRect(x, y, larguraTotal, alturaBarra);

            // Renderização do preenchimento com base em limiar crítico (30%)
            const percentual = this.hp / this.maxHp;
            const cor = percentual > 0.3 ? 0x00ff00 : 0xff0000;
            
            this.barraVida.fillStyle(cor, 1);
            this.barraVida.fillRect(x, y, larguraTotal * percentual, alturaBarra);
        }
    }

    // --- 4. DESALOCAÇÃO DE MEMÓRIA E LIMPEZA DE RECURSOS ---
    destruir() {
        if (this.somHit) {
            this.somHit.stop();       
            this.somHit.destroy();   
        }

        if (this.barraVida) {
            this.scene.sound.play('DefenseDestroy'); 
            this.barraVida.destroy();
        }
        this.destroy();
    }
}