import { Defesa } from './Defesa.js';

export class Lixeira extends Defesa {
    // --- 1. PROPRIEDADES ESTÁTICAS DE BALANCEAMENTO ---
    static get CUSTO() { return 200; }
    static get RANGE() { return 300; }
    static get LARGURA() { return 100; }
    static get ALTURA() { return 100; }
    static get VIDA() { return 2; }
    static get TAXA_TIRO() { return 10000; }
    static get DANO() { return 1; }

    constructor(scene, x, y) {
        super(
            scene, 
            x, 
            y, 
            Lixeira.LARGURA, 
            Lixeira.ALTURA, 
            'spr_lixeira',
            Lixeira.VIDA, 
            Lixeira.TAXA_TIRO, 
            Lixeira.DANO, 
            Lixeira.RANGE, 
            Lixeira.CUSTO
        );
        this.alvoPreso = null;
        this.ocupado = false;
        this.cronometro = 0;
        
        // Cache de escala para mitigar artefatos visuais ou quebras de tamanho pós-tweens
        this.escalaOriginalX = this.scaleX;
        this.escalaOriginalY = this.scaleY;

        this.somProcessando = this.scene.sound.add('TrashProcessing', { loop: true, volume: 0.3 });
    }

    // --- 2. MÁQUINA DE ESTADO E ATUALIZAÇÃO LOGÍSTICA ---
    update(time, delta) {
        if (!this.ocupado) {
            this.capturar(time);
            return;
        } else {
            this.cronometro += delta;

            // Tratamento de exceção: Se o alvo foi expurgado por outra entidade externa
            if (!this.alvoPreso || !this.alvoPreso.active) {
                this.resetarLixeira(); 
                return;
            }

            // Cálculo proporcional de decaimento de integridade do vírus (DPS)
            this.dano = this.alvoPreso.hp / Lixeira.TAXA_TIRO;
            this.alvoPreso.receberDano(this.dano);

            // Condicional de expurgo finalizado por exaustão de tempo ou HP zerado
            if (this.cronometro >= Lixeira.TAXA_TIRO || this.alvoPreso.hp <= 0) {
                this.alvoPreso.morrer(false);
                this.finalizarFeedback(); 
                this.resetarLixeira();
            }
        }
    }

    // --- 3. MECÂNICA DE INTERCEPÇÃO E RETENÇÃO DE IA ---
    capturar(time) {
        const alvo = this.procurarAlvo();
        if (alvo) {
            this.alvoPreso = alvo; 
            this.alvoPreso.estaPreso = true;

            // Delegação de hierarquia: Evita quebras de cadeia caso o vírus seja uma Worm articulada
            if (typeof this.alvoPreso.promoverProximoSegmento === 'function') {
                console.log("Promovendo novo líder para o Worm...");
                this.alvoPreso.promoverProximoSegmento(); 
            }

            // Ocultamento visual e desativação do motor físico do alvo contido
            this.alvoPreso.visible = false;
            this.alvoPreso.body.enable = false;
            this.ocupado = true; 

            console.log("INIMIGO CAPTURADO:", this.alvoPreso);
            this.capturarFeedback();
        }
    }

    // --- 4. SOBRECARGA DE DANOS E EXPULSÃO DE SEGURANÇA ---
    receberDano(quantidade) {
        super.receberDano(quantidade);
        
        if (this.hp <= 0) {
            // Ejeção de emergência: cospe o bicho de volta ao tabuleiro se a lixeira colapsar
            if (this.ocupado && this.alvoPreso && this.alvoPreso.active) {   
                this.alvoPreso.setPosition(this.x, this.y);
                this.alvoPreso.visible = true;
                if (this.alvoPreso.body) {
                    this.alvoPreso.body.enable = true;
                }
                this.alvoPreso.estaPreso = false;
            }
            
            // Garbage Collection preventiva de instâncias de áudio em loop
            if (this.somProcessando) {
                if (this.somProcessando.isPlaying) {
                    this.somProcessando.stop();
                }
                this.somProcessando.destroy(); 
            }

            if (this.tweenProcessando) {
                this.tweenProcessando.stop();
            }
            
            this.destroy();
        }
    }

    // --- 5. REDEFINIÇÃO DE PARÂMETROS E LIMPEZA DE CICLO ---
    resetarLixeira() {
        this.alvoPreso = null;
        this.cronometro = 0;
        this.ocupado = false;
    
        if (this.tweenProcessando) {
            this.tweenProcessando.stop();
            this.tweenProcessando = null;
        }

        if (this.somProcessando && this.somProcessando.isPlaying) {
            this.somProcessando.stop();
        }

        this.setAngle(0);
        this.setScale(this.escalaOriginalX, this.escalaOriginalY); 
    }

    // --- 6. INTERFACE GRÁFICA E FEEDBACK DE ANIMAÇÃO (TWEENS) ---
    capturarFeedback() {
        if (this.somProcessando && !this.somProcessando.isPlaying) {
            this.somProcessando.play();
        }

        // Tween A: Oscilação angular contínua para simular trituração/compressão mecânica
        this.tweenProcessando = this.scene.tweens.add({
            targets: this,
            angle: { from: -6, to: 6 }, 
            duration: 60, 
            repeat: -1,
            yoyo: true
        });

        // Tween B: Efeito de esmagamento elástico imediato (Squash & Stretch)
        this.scene.tweens.add({
            targets: this,
            scaleX: this.escalaOriginalX * 1.3, 
            scaleY: this.escalaOriginalY * 0.7,
            duration: 100,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    finalizarFeedback() {
        if (this.somProcessando && this.somProcessando.isPlaying) {
            this.somProcessando.stop();
        }
        this.scene.sound.play('TrashComplete', { volume: 2 });

        if (this.tweenProcessando) {
            this.tweenProcessando.stop();
            this.tweenProcessando = null;
        }
        this.setAngle(0);

        // Tween C: Efeito óptico Pop para sinalizar a conclusão do expurgo de dados
        this.scene.tweens.add({
            targets: this,
            scaleX: this.escalaOriginalX * 1.4,
            scaleY: this.escalaOriginalY * 1.4,
            alpha: 0.7,
            duration: 120,
            yoyo: true,
            onComplete: () => {
                this.setScale(this.escalaOriginalX, this.escalaOriginalY); 
                this.setAlpha(1);
            }
        });
    }
}