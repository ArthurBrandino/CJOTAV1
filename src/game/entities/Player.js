import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Inicializa o sprite herdeiro com a textura padrão de repouso (idle)
        super(scene, x, y, 'player_idle', 0);
        
        // Insere a instância na lista de renderização e no motor físico da cena ativa
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurações de colisão com as bordas do mapa e propriedades de combate
        this.body.setCollideWorldBounds(true);
        this.speed = 300;
        this.danoAtaque = 1;

        // Registro de entradas físicas (Teclado - Setas direcionais e WASD)
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.teclasWASD = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Configuração de dimensionamento e preservação de proporção para Pixel Art
        this.setScale(2.5); 
        this.setPixelArt = true; 

        // Redefinição da Hitbox física interna (Caixa de colisão otimizada para os pés/base)
        this.body.setSize(14, 16);
        this.body.setOffset(5, 6);

        // Armazenamento de estado de orientação do vetor e histórico de concorrência de cliques
        this.ultimaDirecaoX = 0;
        this.ultimaDirecaoY = 1; 
        this.ultimoCliqueTempo = 0;

        // Inicialização do catálogo de spritesheets e reprodução do estado inicial
        this.configurarAnimacoes(scene);

        if (scene.anims.exists('player_idle_down')) {
            this.play('player_idle_down');
        }
    }

    // --- MÁQUINA DE ANIMAÇÃO: MAPEAMENTO DE FRAMES DAS SPRITESHEETS ---
    configurarAnimacoes(scene) {
        // --- IDLES (Estados de Repouso Estático) ---
        if (!scene.anims.exists('player_idle_down')) {
            scene.anims.create({ key: 'player_idle_down', frames: scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }), frameRate: 6, loop: -1 });
        }
        if (!scene.anims.exists('player_idle_side')) {
            scene.anims.create({ key: 'player_idle_side', frames: scene.anims.generateFrameNumbers('player_idle', { start: 8, end: 11 }), frameRate: 6, loop: -1 });
        }
        if (!scene.anims.exists('player_idle_up')) {
            scene.anims.create({ key: 'player_idle_up', frames: scene.anims.generateFrameNumbers('player_idle', { start: 16, end: 19 }), frameRate: 6, loop: -1 });
        }

        // --- CORRIDAS (Estados de Movimentação Dinâmica) ---
        if (!scene.anims.exists('player_run_down')) {
            scene.anims.create({ key: 'player_run_down', frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }), frameRate: 12, loop: -1 });
        }
        if (!scene.anims.exists('player_run_side')) {
            scene.anims.create({ key: 'player_run_side', frames: scene.anims.generateFrameNumbers('player_run', { start: 12, end: 17 }), frameRate: 12, loop: -1 });
        }
        if (!scene.anims.exists('player_run_up')) {
            scene.anims.create({ key: 'player_run_up', frames: scene.anims.generateFrameNumbers('player_run', { start: 24, end: 29 }), frameRate: 12, loop: -1 });
        }

        // --- ATAQUES (Estados de Ação e Combate Ofensivo) ---
        if (!scene.anims.exists('player_attack_down')) {
            scene.anims.create({ key: 'player_attack_down', frames: scene.anims.generateFrameNumbers('player_attack', { start: 0, end: 5 }), frameRate: 14, loop: 0 });
        }
        if (!scene.anims.exists('player_attack_side')) {
            scene.anims.create({ key: 'player_attack_side', frames: scene.anims.generateFrameNumbers('player_attack', { start: 12, end: 17 }), frameRate: 14, loop: 0 });
        }
        if (!scene.anims.exists('player_attack_up')) {
            scene.anims.create({ key: 'player_attack_up', frames: scene.anims.generateFrameNumbers('player_attack', { start: 24, end: 29 }), frameRate: 14, loop: 0 });
        }

        // --- INTERAÇÕES (Estados de Mineração, Construção ou Coleta) ---
        if (!scene.anims.exists('player_interact_down')) {
            scene.anims.create({ key: 'player_interact_down', frames: scene.anims.generateFrameNumbers('player_interact', { start: 0, end: 3 }), frameRate: 12, loop: 0 });
        }
        if (!scene.anims.exists('player_interact_side')) {
            scene.anims.create({ key: 'player_interact_side', frames: scene.anims.generateFrameNumbers('player_interact', { start: 8, end: 11 }), frameRate: 12, loop: 0 });
        }
        if (!scene.anims.exists('player_interact_up')) {
            scene.anims.create({ key: 'player_interact_up', frames: scene.anims.generateFrameNumbers('player_interact', { start: 16, end: 19 }), frameRate: 12, loop: 0 });
        }
    }

    // --- LOOP PRINCIPAL DE EXECUÇÃO (ATUALIZAÇÃO DE ESTADOS) ---
    update() {
        // Trava de Animação Ativa: Interrompe a reavaliação de input se uma animação prioritária estiver rodando
        if (this.anims.isPlaying && (this.anims.currentAnim.key.startsWith('player_attack') || this.anims.currentAnim.key.startsWith('player_interact'))) {
            return; 
        }

        // Reseta as forças inerciais físicas antes do cálculo de movimentação do frame atual
        this.body.setVelocity(0);
        let moveX = 0;
        let moveY = 0;

        // Leitura e armazenamento vetorial nos eixos X e Y
        if (this.cursors.left.isDown || this.teclasWASD.left.isDown)       moveX = -1;
        else if (this.cursors.right.isDown || this.teclasWASD.right.isDown) moveX = 1;

        if (this.cursors.up.isDown || this.teclasWASD.up.isDown)           moveY = -1;
        else if (this.cursors.down.isDown || this.teclasWASD.down.isDown)   moveY = 1;

        // Aplicação das forças de velocidade no corpo físico do Arcade Physics
        if (moveX !== 0 || moveY !== 0) {
            this.body.setVelocityX(moveX * this.speed);
            this.body.setVelocityY(moveY * this.speed);
        }

        // Árvore de Decisão Visual: Define e reproduz a animação correta com base no vetor de movimento
        if (moveY === 1) {
            this.play('player_run_down', true);
            this.ultimaDirecaoY = 1;
            this.ultimaDirecaoX = 0;
        } 
        else if (moveY === -1) {
            this.play('player_run_up', true);
            this.ultimaDirecaoY = -1;
            this.ultimaDirecaoX = 0;
        } 
        else if (moveX !== 0) {
            this.play('player_run_side', true);
            this.setFlipX(moveX === -1); // Inversão horizontal do sprite (Espelhamento para a esquerda)
            this.ultimaDirecaoX = moveX;
            this.ultimaDirecaoY = 0;
        } 
        else {
            // Estrutura Fallback: Retorna o sprite para o estado Idle correspondente à última direção salva
            if (this.ultimaDirecaoY === 1)       this.play('player_idle_down', true);
            else if (this.ultimaDirecaoY === -1) this.play('player_idle_up', true);
            else if (this.ultimaDirecaoX !== 0) {
                this.play('player_idle_side', true);
                this.setFlipX(this.ultimaDirecaoX === -1);
            } else {
                this.play('player_idle_down', true);
            }
        }
    }

    // --- GATILHO COMPORTAMENTAL: ATAQUE DIRECIONAL ---
    atacar(worldPoint) {
        // Amortecimento físico completo para evitar deslizamentos durante a conjuração do ataque
        this.body.setVelocity(0);

        // Sistema de Combo/Cadência: Calcula o tempo delta entre ativações consecutivas do mouse
        const tempoAtual = this.scene.time.now;
        const diferencaTempo = tempoAtual - this.ultimoCliqueTempo;
        this.ultimoCliqueTempo = tempoAtual;

        // Escalonamento Dinâmico: Aumenta a velocidade de reprodução da animação (Time Scale) em cliques rápidos
        let escalaVelocidade = 1;
        if (diferencaTempo < 300) {
            escalaVelocidade = 1 + ((300 - diferencaTempo) / 250); 
            escalaVelocidade = Phaser.Math.Clamp(escalaVelocidade, 1, 1.8);
        }

        // Trigonometria de Mira: Divide o espaço tridimensional em quadrantes angulares baseados no clique
        const angulo = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        const graus = Phaser.Math.RadToDeg(angulo);

        let animAtaque = 'player_attack_down';

        // Mapeamento dos eixos angulares em graus para a troca direcional da animação gráfica
        if (graus >= -135 && graus < -45)        animAtaque = 'player_attack_up';
        else if (graus >= 45 && graus < 135)   animAtaque = 'player_attack_down';
        else if (graus < -135 || graus >= 135) { animAtaque = 'player_attack_side'; this.setFlipX(true); }
        else                                   { animAtaque = 'player_attack_side'; this.setFlipX(false); }

        // Execução da animação e injeção do modificador de velocidade de reprodução
        this.play(animAtaque, true);
        this.anims.timeScale = escalaVelocidade;
    }

    // --- GATILHO COMPORTAMENTAL: INTERAÇÃO / MINERAÇÃO ---
    interagir(worldPoint) {
        // Estabilização da física inercial e restauração da escala de tempo padrão da animação
        this.body.setVelocity(0);
        this.anims.timeScale = 1.0;

        // Mapeamento trigonométrico vetorial para determinar a rotação visual do player durante a ação
        const angulo = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        const graus = Phaser.Math.RadToDeg(angulo);

        let animInteract = 'player_interact_down';

        // Distribuição dos quadrantes de ação e cacheamento forçado das variáveis de última direção
        if (graus >= -135 && graus < -45) {
            animInteract = 'player_interact_up';
            this.ultimaDirecaoY = -1;
            this.ultimaDirecaoX = 0;
        }
        else if (graus >= 45 && graus < 135) {
            animInteract = 'player_interact_down';
            this.ultimaDirecaoY = 1;
            this.ultimaDirecaoX = 0;
        }
        else if (graus < -135 || graus >= 135) {
            animInteract = 'player_interact_side';
            this.setFlipX(true);
            this.ultimaDirecaoX = -1;
            this.ultimaDirecaoY = 0;
        }
        else {
            animInteract = 'player_interact_side';
            this.setFlipX(false);
            this.ultimaDirecaoX = 1;
            this.ultimaDirecaoY = 0;
        }

        // Execução final da animação de interação baseada nas coordenadas obtidas
        this.play(animInteract, true);
    }
}