import { Pastas } from '../entities/Pastas.js';
import { Worm } from "../entities/Worm.js";

export class CombatManager {
    constructor(scene) {
        this.scene = scene;

        // --- 1. CONFIGURAÇÃO DE ÁUDIO DO COMBATE ---
        this.somAtaque = scene.sound.add('hit_enemy');
    }

    executarAcao(worldPoint) {
        const player = this.scene.enzinho;

        // --- 2. VERIFICAÇÃO DE INTERAÇÃO COM ELEMENTOS DE MAPA (PASTAS) ---
        const pastasNoClique = this.scene.physics.overlapCirc(worldPoint.x, worldPoint.y, 10);
        let interagiuComPasta = false;

        pastasNoClique.forEach(corpo => {
            const objeto = corpo.gameObject;
            // CORREÇÃO: Chamando o método correto de mineração da classe Pastas
            if (objeto instanceof Pastas) {
                objeto.tentarMinerar(); 
                interagiuComPasta = true;
            }
        });

        // --- 3. LÓGICA DE FILTRAGEM E SELEÇÃO DE ALVO VÍRUS ---
        if (!interagiuComPasta) {
            const inimigosNoRaio = this.scene.inimigos.getChildren().filter(inimigo => {
                const distancia = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, inimigo.x, inimigo.y);
                
                // Ignora o dano caso o alvo seja um segmento imortal do corpo de um Worm
                const alvoValido = inimigo instanceof Worm ? !inimigo.ehSegmento : true;
                return distancia < 50 && inimigo.active && alvoValido;
            });

            // Ordenação por proximidade matemática para priorizar o inimigo mais perto do clique
            inimigosNoRaio.sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, b.x, b.y);
                return distA - distB;
            });

            // --- 4. DISPARO DA ANIMAÇÃO, APLICAÇÃO DE DANO E AUDIO ---
            const alvoUnico = inimigosNoRaio[0];
            
            // CORREÇÃO: Sempre dispara a animação visual de ataque do Player na direção do clique, mesmo se errar o golpe
            if (player && typeof player.atacar === 'function') {
                player.atacar(worldPoint);
            }

            if (alvoUnico && alvoUnico.receberDano) {
                alvoUnico.receberDano(player.danoAtaque);
                if (this.somAtaque) {
                    this.somAtaque.play({ volume: 0.6 });
                }
            }
        }
    }
}