import { Defesa } from './Defesa.js';
import { Worm } from "../entities/Worm.js";

export class Firewall extends Defesa {
    // --- 1. PROPRIEDADES ESTÁTICAS DE BALANCEAMENTO ---
    static get CUSTO() { return 10; }
    static get LARGURA() { return 50; }
    static get ALTURA() { return 50; }
    static get VIDA() { return 2; }

    constructor(scene, x, y) {
        super(
            scene, 
            x, 
            y, 
            Firewall.LARGURA, 
            Firewall.ALTURA, 
            'spr_firewall',
            Firewall.VIDA,  
            0, // speed (taxa de tiro) - Inativo para barreira passiva
            0, // dano ativo - Inativo
            0, // range - Inativo
            Firewall.CUSTO
        );
        this.danoCritico = 10;
    }

}