import { Worm } from "../entities/Worm.js";

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.setupCollisions();
    }

    // --- 1. CONFIGURAÇÃO E MAPEAMENTO DOS ESCUTADORES FÍSICOS (OVERLAPS) ---
    setupCollisions() {
        // Colisão Inimigos vs Processador Central
        this.scene.physics.add.overlap(
            this.scene.inimigos, 
            this.scene.processador, 
            this.tratarColisao, 
            null, 
            this
        );

        // Colisão Inimigos vs Defesas (Torres)
        this.scene.physics.add.overlap(
            this.scene.inimigos, 
            this.scene.defesas, 
            this.tratarColisao, 
            null, 
            this
        );
    }

    // --- 2. TRIAGEM E DIRECIONAMENTO LÓGICO DA COLISÃO ---
    tratarColisao(obj1, obj2) {
        let inimigo, alvo;

        // Inversão dinâmica para identificar a entidade inimiga independente da ordem do impacto
        if (obj1 instanceof Worm || obj1.velocidade !== undefined) {
            inimigo = obj1;
            alvo = obj2;
        } else {
            inimigo = obj2;
            alvo = obj1;
        }

        if (!inimigo.active || !alvo.active) return;

        // --- 3. APLICAÇÃO DE DANO POR COMPORTAMENTO DE ENTIDADE ---
        if (inimigo instanceof Worm) {
            // Lógica exclusiva para o comportamento do vírus Worm (ignora segmentos do corpo)
            if (!inimigo.ehSegmento) {
                inimigo.aoColidir(alvo); 
            }
        } else {
            // Comportamento para vírus padrão de impacto (ex: Trojan, Letter)
            if (alvo.receberDano) {
                alvo.receberDano(inimigo.dano || 10, inimigo); 
            }
            if (inimigo.morrer) inimigo.morrer();
        }
    }
}