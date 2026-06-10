import { Inimigo } from "./Virus";

export class Worm extends Inimigo {
    // --- 1. CONSTRUTOR E PARAMETRIZAÇÃO INDIVIDUAL DE SEGMENTOS ---
    constructor(scene, x, y, ehSegmento = false) {
        const velocidade = 150;
        const vida = 1;
        const dano = 1; 
        const largura = 18;
        const altura = 18;
        const frequencia = 0.01;
        const amplitude = 2.5;

        super(scene, x, y, largura, altura, 'spr_worm', vida, velocidade, dano, frequencia, amplitude);

        this.cauda = []; 
        this.ehSegmento = ehSegmento; 

        // Configuração de ramificação de comportamento (Cabeça Líder vs Segmento Rastreador)
        if (!ehSegmento) {
            this.setFrame(3);
            this.historicoPosicoes = [];
            this.adicionarSegmentos(4);
        } else {
            this.setFrame(2);
            this.tornarImortal();
        }

        this.setDisplaySize(altura, largura);
    }

    // --- 2. CONFIGURAÇÕES DE REGRAS DE INTERAÇÃO E MOTOR FÍSICO ---
    tornarImortal() {
        this.disableInteractive(); 
        if (this.body) {
            this.body.enable = false; 
        }
    }

    tornarVulneravel() {
        this.setInteractive(); 
        if (this.body) {
            this.body.enable = true; 
        }
        this.setAlpha(1); 
    }

    // --- 3. ALOCAÇÃO DINÂMICA DE FILHOS E ENCADEAMENTO ---
    adicionarSegmentos(quantidade) {
        for (let i = 0; i < quantidade; i++) {
            const novoSegmento = new Worm(this.scene, this.x, this.y, true);
            
            if (this.scene.inimigos) {
                this.scene.inimigos.add(novoSegmento);
            }
            this.cauda.push(novoSegmento);
        }
    }

    // --- 4. SISTEMA DE FILTRO DE ATUALIZAÇÃO E RASTRO POR BUFFER (SNAKE RENDER) ---
    preUpdate(time, delta) {
        // Apenas a cabeça processa a inteligência artificial de perseguição de Virus.js
        if (!this.ehSegmento) {
            super.preUpdate(time, delta);

            // Injeta a coordenada atual no topo do array (Buffer de Rastro)
            this.historicoPosicoes.unshift({ x: this.x, y: this.y });

            // Garbage Collection preventiva do histórico para mitigar vazamento de memória
            if (this.historicoPosicoes.length > 100) {
                this.historicoPosicoes.pop();
            }

            // Atualização de arrasto: Desloca cada segmento com um atraso fixo de iterações
            const espacamento = 6; 
            this.cauda.forEach((seg, index) => {
                const indiceNoHistorico = (index + 1) * espacamento;
                const posAntiga = this.historicoPosicoes[indiceNoHistorico];

                if (posAntiga) {
                    seg.x = posAntiga.x;
                    seg.y = posAntiga.y;
                }
            });
        }
    }

    // --- 5. ELEVAÇÃO DE COMPONENTES E PASSAGEM DE REFERÊNCIA (PROMOÇÃO DE LÍDER) ---
    promoverProximoSegmento(alvo = null) {
        if (this.estaMorrendo) return;
        this.estaMorrendo = true;

        if (this.cauda && this.cauda.length > 0) {
            // Extrai o primeiro elemento da fila para herdar o controle da entidade
            const novaCabeca = this.cauda.shift();

            if (novaCabeca && novaCabeca.active) {
                novaCabeca.setFrame(3);
                novaCabeca.cauda = this.cauda;
                novaCabeca.historicoPosicoes = this.historicoPosicoes;
                novaCabeca.ehSegmento = false;
                novaCabeca.tornarVulneravel();

                // Teleporte de emergência caso a colisão ocorra diretamente no Processador central
                if (alvo === this.scene.processador) {
                    novaCabeca.x = this.x;
                    novaCabeca.y = this.y;
                }
            }
        }
        this.cauda = [];
    }

    // --- 6. PROCESSAMENTO DE IMPACTOS, FEEDBACKS E DESTRUIÇÃO ---
    aoColidir(alvo) {
        if (this.estaMorrendo) return;

        if (alvo && alvo.receberDano) {
            alvo.receberDano(this.dano, this);

            // Mecânica Vampírica: Se a colisão obliterar uma defesa ordinária, a Worm expande
            if (alvo.hp <= 0 && alvo !== this.scene.processador) {
                console.log("Worm devorou a defesa e cresceu!");
                if (this.cauda.length > 0) {
                    this.adicionarSegmentos(5); 
                }
            }
        }

        this.promoverProximoSegmento(alvo);
        this.morrer();
    }

    receberDano(quantidade) {
        this.hp -= quantidade;
        
        if (this.hp <= 0 && !this.estaMorrendo) {
            this.promoverProximoSegmento(); 
            this.morrer();
        }
    }

    morrer() {
        if (this.cauda.length === 0 && this.ehSegmento === false) {
            console.log("Worm totalmente eliminado!");
        }
        super.morrer();
    }
}