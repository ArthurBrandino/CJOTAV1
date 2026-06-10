import { Worm } from "../entities/Worm.js";
import { Trojan } from "../entities/Trojan.js";
import { ILY } from "../entities/ILY.js";
import { Pastas } from "../entities/Pastas.js";

export class InputManager {
    constructor(scene) {
        // Armazena a referência da cena principal do Phaser
        this.scene = scene;
        // Flag de controle para ativar/desativar os comandos de trapaça e depuração
        this.modoDev = false; 

        // Inicializa os ouvintes de eventos do teclado e do mouse
        this.setupKeys();
        this.setupMouse();
    }

    setupKeys() {
        // --- SELEÇÃO DE DEFESAS (Teclas 1 a 4) ---
        const chaves = ['ONE', 'TWO', 'THREE', 'FOUR'];
        chaves.forEach((key, index) => {
            // Vincula o evento de pressionar a tecla para atualizar o índice selecionado
            this.scene.input.keyboard.on(`keydown-${key}`, () => {
                this.scene.selecionada = index + 1;
                // Atualiza o visual do preview da estrutura que acompanha o mouse
                this.scene.buildManager.atualizarPreview(
                    this.scene.input.activePointer, 
                    this.scene.dadosDefesas[this.scene.selecionada]
                );
            });
        });

        // --- ALTERNADOR DO MODO DESENVOLVEDOR (Tecla F2) ---
        this.scene.input.keyboard.on('keydown-F2', () => {
            this.modoDev = !this.modoDev;
            console.log(`[DEV MODE] -> ${this.modoDev ? "ATIVADO 🔓" : "DESATIVADO 🔒"}`);
        });

        // --- TRAPAÇA: ADICIONAR CRÉDITOS (Tecla T) ---
        this.scene.input.keyboard.on('keydown-T', () => {
            if (!this.modoDev) return; // Bloqueia a execução se o modo dev estiver desligado
            this.scene.adicionarBits(100);
        });

        // --- TRAPAÇA: PULAR WAVE / LIMPAR INIMIGOS (Tecla Q) ---
        this.scene.input.keyboard.on('keydown-Q', () => {
            if (!this.modoDev) return;
            const wm = this.scene.waveManager;
            if (wm) {
                // Destrói os cronômetros ativos que geram os inimigos da horda
                if (wm.timerGeradorDeWave) wm.timerGeradorDeWave.destroy();
                if (wm.eventoTimer) wm.eventoTimer.destroy();
                
                // Remove todos os eventos de tempo pendentes na cena
                this.scene.time.removeAllEvents();
                
                // Remove e destrói fisicamente todos os inimigos presentes na tela
                if (this.scene.inimigos) this.scene.inimigos.clear(true, true);
                
                // Incrementa o índice e força o início da próxima horda
                wm.indiceAtual++;
                wm.proximaOnda();
            }
        });

        // --- TRAPAÇA: FORÇAR VITÓRIA INSTANTÂNEA (Tecla H) ---
        this.scene.input.keyboard.on('keydown-H', () => {
            if (!this.modoDev) return;
            this.limparAudiosDaCena();
            this.scene.time.removeAllEvents();
            const bitsAtuais = this.scene.bits || 0;
            // Transiciona para a tela de vitória carregando a pontuação atual
            this.scene.scene.start('WinScreen', { bits: bitsAtuais }); 
        });

        // --- TRAPAÇA: FORÇAR DERROTA INSTANTÂNEA (Tecla K) ---
        this.scene.input.keyboard.on('keydown-K', () => {
            if (!this.modoDev) return;
            this.limparAudiosDaCena();
            this.scene.time.removeAllEvents();
            // Transiciona diretamente para a tela de Game Over
            this.scene.scene.start('GameOver');
        });

        // --- TRAPAÇAS DE SPAWN MANUAL DE ENTIDADES NO MOUSE ---
        this.scene.input.keyboard.on('keydown-Y', () => { if (this.modoDev) this.scene.spawnInimigo('Worm'); });
        this.scene.input.keyboard.on('keydown-E', () => { if (this.modoDev) this.scene.spawnInimigo('Trojan'); });
        this.scene.input.keyboard.on('keydown-R', () => { if (this.modoDev) this.scene.spawnInimigo('ILY'); });
        this.scene.input.keyboard.on('keydown-P', () => { if (this.modoDev) this.debugSpawnNoMouse(Pastas); });
    }

    // --- GERENCIAMENTO DE CLIQUES DO MOUSE ---
    setupMouse() {
        this.scene.input.on('pointerdown', (pointer) => {
            // Obtém os metadados da estrutura de defesa selecionada no momento
            const dadosAtuais = this.scene.dadosDefesas[this.scene.selecionada];
            // Converte as coordenadas da tela física para as coordenadas lógicas do mundo/câmera
            const worldPoint = pointer.positionToCamera(this.scene.cameras.main);

            // Fluxo de Construção: Se houver defesa selecionada e o modo for construção
            if (dadosAtuais && dadosAtuais.modo === 'construcao') {
                this.scene.buildManager.tentarConstruir(worldPoint.x, worldPoint.y);
            } 
            // Fluxo de Combate/Interação: Caso não esteja construindo, delega a ação ao CombatManager
            else if (this.scene.combatManager) {
                this.scene.combatManager.executarAcao(worldPoint);
            }
        });
    }

    // --- MÉTODO AUXILIAR DE DEPURAÇÃO PARA CRIAR OBJETOS NA POSIÇÃO DO MOUSE ---
    debugSpawnNoMouse(classeInimigo) {
        const pointer = this.scene.input.activePointer;
        // Converte a posição do ponteiro em coordenadas do mundo absoluto
        const worldPoint = pointer.positionToCamera(this.scene.cameras.main);
        // Instancia a nova classe passando a cena e as coordenadas calculadas
        const inimigo = new classeInimigo(this.scene, worldPoint.x, worldPoint.y);
        // Adiciona a nova entidade no grupo físico correspondente da cena
        this.scene.inimigos.add(inimigo);
    }

    // --- SISTEMA DE LIMPEZA DE ÁUDIO ---
    limparAudiosDaCena() {
        // Interrompe a música de fundo da onda de forma segura caso ela exista
        if (this.scene.bgmOnda) this.scene.bgmOnda.stop();
        // Para absolutamente todos os efeitos sonoros sendo reproduzidos no motor de áudio
        this.scene.sound.stopAll(); 
    }
}