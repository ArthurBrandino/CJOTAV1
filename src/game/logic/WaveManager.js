import { Pastas } from '../entities/Pastas.js';

export class WaveManager {
    constructor(scene, configOndas) {
        this.scene = scene;
        this.configOndas = configOndas;
        this.indiceAtual = 0;
        this.emDangerZone = false;
        this.eventoTimer = null;

        // Limpeza preventiva de barramento de tempo em cenários de derrota (GameOver)
        this.scene.events.once('GameOver', () => {
            if (this.timerGeradorDeWave) {
                this.timerGeradorDeWave.remove();
            }
            this.scene.time.removeAllEvents(); 
        });
    }

    // --- 1. INICIALIZAÇÃO DO LOOP GLOBAL DE SESSÃO ---
    iniciarSistema() {
        this.indiceAtual = 0; 
        this.currentWave = 0;
        this.proximaOnda();
    }

    // --- 2. GERENCIAMENTO DE TRANSIÇÃO E ESTADO SEGURO (SAFE ZONE) ---
    proximaOnda() {
        if (!this.configOndas || this.configOndas.length === 0) return;

        // Condicional de interrupção: Gatilho de Vitória Absoluta (Limpeza Total do Sistema)
        if (this.indiceAtual >= this.configOndas.length) {
            console.log("SISTEMA LIMPO!");
            this.scene.events.emit('update-timer', "WIN");
            this.scene.time.removeAllEvents();
            this.scene.sound.stopAll(); 
            
            this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
            this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                const bitsAtuais = this.scene.bits || 0; 
                this.scene.scene.start('WinScreen', { bits: bitsAtuais }); 
            });
            return;
        }

        const dadosOnda = this.configOndas[this.indiceAtual];
        this.scene.events.emit('update-wave', dadosOnda.id);

        this.emDangerZone = false;
        this.scene.cameras.main.flash(500, 0, 100, 255);
        this.scene.cameras.main.setBackgroundColor(0x001133); 
        
        if (this.scene.backgroundCyber) {
            this.scene.backgroundCyber.clearTint();
        }
        
        this.iniciarContagemRegressiva(dadosOnda.safeTime / 1000, "SAFE");

        // Injeção de arquivos corrompidos passivos no cenário durante o tempo de preparação
        if (dadosOnda.pastasParaCriar) {
            Pastas.gerarGrupo(this.scene, dadosOnda.pastasParaCriar);
        }

        // Agendamento do gatilho de invasão após esgotamento do tempo seguro
        this.scene.time.delayedCall(dadosOnda.safeTime, () => {
            this.iniciarDangerZone(dadosOnda);
        });
    }

    // --- 3. ALGORITMO DE FILA E INVASÃO RÍTMICA (DANGER ZONE) ---
    iniciarDangerZone(dadosOnda) {
        this.scene.sound.play('EvilLaugh');
        this.currentWave++; 
        this.scene.events.emit('proxima-wave', this.currentWave);
        
        this.emDangerZone = true;
        this.scene.cameras.main.flash(500, 255, 0, 0);
        this.scene.cameras.main.setBackgroundColor(0x330000);
        
        if (this.scene && typeof this.scene.mudarMatrizBackground === 'function') {
            this.scene.mudarMatrizBackground();
        }
        
        this.iniciarContagemRegressiva(dadosOnda.dangerTime / 1000, "DANGER");

        // Desembrulho estrutural da configuração de dados da horda para string linear
        let filaInimigos = [];
        dadosOnda.inimigos.forEach(config => {
            for (let i = 0; i < config.quantidade; i++) {
                filaInimigos.push(config.classe);
            }
        });

        // Embaralhamento Estatístico (Algoritmo Fisher-Yates Shuffle)
        for (let i = filaInimigos.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filaInimigos[i], filaInimigos[j]] = [filaInimigos[j], filaInimigos[i]];
        }

        // Cálculo de cadência dinâmica uniforme baseada no tempo limite da horda
        const tempoTotalDisponivel = dadosOnda.dangerTime - 2000; 
        const intervaloSpawn = Math.max(200, tempoTotalDisponivel / filaInimigos.length);

        // Consumo sequencial e cadenciado da fila de entidades misturadas
        if (filaInimigos.length > 0) {
            this.timerGeradorDeWave = this.scene.time.addEvent({
                delay: intervaloSpawn,
                repeat: filaInimigos.length - 1,
                callback: () => {
                    if (filaInimigos.length > 0) {
                        const proximoInimigo = filaInimigos.shift(); 
                        this.scene.spawnInimigo(proximoInimigo);
                    }
                }
            });
        }

        this.scene.time.delayedCall(dadosOnda.dangerTime, () => {
            this.verificarFimDeOnda();
        });
    }

    // --- 4. RELÓGIOS DE CONTAGEM E VERIFICAÇÃO DE LIMPEZA ---
    iniciarContagemRegressiva(segundos, status) {
        let tempoRestante = segundos;
        if (this.eventoTimer) this.eventoTimer.destroy(); 

        this.eventoTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.scene || !this.scene.sys.isActive()) {
                    if (this.eventoTimer) this.eventoTimer.destroy();
                    return;
                }

                tempoRestante--;
                this.scene.events.emit('update-timer', `${status}: ${tempoRestante}s`);
                
                if (tempoRestante <= 0) {
                    this.eventoTimer.destroy();
                }
            },
            loop: true
        });
    }

    verificarFimDeOnda() {
        this.scene.events.emit('update-timer', "CLEANING...");
        
        // Loop de varredura ativa para detecção de eliminação completa dos vírus ativos
        const check = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.inimigos.countActive() === 0) {
                    check.remove();
                    this.indiceAtual++;
                    this.scene.sound.play('WaveClear');
                    this.proximaOnda();
                }
            },
            loop: true
        });
    }
}