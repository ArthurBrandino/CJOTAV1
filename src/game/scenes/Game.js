import { Scene } from 'phaser';
import { Player } from '../entities/Player.js';
import { Processador } from '../entities/Processador.js';
import { Worm } from "../entities/Worm.js";
import { Trojan } from "../entities/Trojan.js";
import { ILY } from "../entities/ILY.js";
import { Clicker } from '../entities/Clicker.js';
import { Lixeira } from '../entities/Lixeira.js';
import { Firewall } from '../entities/Firewall.js';

// Importação dos Gerenciadores de Lógica
import { WaveManager } from '../logic/WaveManager.js';
import { WAVES } from '../logic/wavedata.js';
import { BuildManager } from '../logic/BuildManager.js';
import { InputManager } from '../logic/InputManager.js';
import { CollisionManager } from '../logic/CollisionManager.js';
import { CombatManager } from '../logic/CombatManager.js';
import { UIManager } from '../logic/UIManager.js';

export class Game extends Scene {
    constructor() {
        super('Game'); 
    }

    init(data) {
        this.somTransicao = data.somTransicao;
    }

    create() {
        // --- 1. CONFIGURAÇÃO DO PLANO DE FUNDO (CIBERESPAÇO) ---
        this.backgroundCyber = this.add.tileSprite(0, 0, 2000, 2000, 'game_background');
        this.backgroundCyber.setOrigin(0, 0);
        this.backgroundCyber.setDepth(-1); 
        this.backgroundCyber.tileScaleX = 1;
        this.backgroundCyber.tileScaleY = 1;

        // --- 2. SISTEMA DE ECONOMIA E SLOT INICIAL ---
        this.bits = 0;
        this.selecionada = 1;
        this.dadosDefesas = this.configurarDadosDefesas();

        // --- 3. CONFIGURAÇÃO DA FÍSICA E GRUPOS ---
        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.inimigos = this.physics.add.group({ runChildUpdate: true });
        this.defesas = this.add.group({ runChildUpdate: true });

        // --- 4. INSTANCIAÇÃO DAS ENTIDADES PRINCIPAIS ---
        this.enzinho = new Player(this, 1100, 1100);
        this.processador = new Processador(this, 1000, 1000);
        this.physics.add.collider(this.enzinho, this.processador);

        // --- 5. ELEMENTOS GRÁFICOS DO PREVIEW DE CONSTRUÇÃO ---
        this.previewRange = this.add.graphics().setDepth(99).setVisible(false);
        this.previewPreco = this.add.text(0, 0, '', {
            fontSize: '16px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3, fontWeight: 'bold'
        }).setOrigin(0.5, 2.5).setDepth(101).setVisible(false);

        // --- 6. INICIALIZAÇÃO DOS GERENCIADORES E ARQUITETURA ---
        this.combatManager = new CombatManager(this);
        this.buildManager = new BuildManager(this);
        this.uiManager = new UIManager(this); 
        this.collisionManager = new CollisionManager(this);
        this.inputManager = new InputManager(this);
        this.waveManager = new WaveManager(this, WAVES); 
        this.waveManager.iniciarSistema();

        // --- 7. CONTROLE DE CÂMERA ---
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.startFollow(this.enzinho, true);

        // --- 8. GERENCIAMENTO DA TRILHA SONORA RETRÔ ---
        this.bgmOnda = this.sound.add('soundtrack', {
            loop: true,
            volume: 0.35 
        });

        if (this.somTransicao && this.somTransicao.isPlaying) {
            this.somTransicao.once('complete', () => {
                this.bgmOnda.play(); 
            });
        } else {
            this.bgmOnda.play();
        }
    }

    // --- 9. TABELA DE PROPRIEDADES DAS DEFESAS ---
    configurarDadosDefesas() {
        return {
            1: { nome: 'Combate', modo: 'acao' },
            2: { nome: 'Clicker', largura: Clicker.LARGURA, altura: Clicker.ALTURA, cor: Clicker.COR, custo: Clicker.CUSTO, range: Clicker.RANGE, modo: 'construcao', classe: Clicker },
            3: { nome: 'Lixeira', largura: Lixeira.LARGURA, altura: Lixeira.ALTURA, cor: Lixeira.COR, custo: Lixeira.CUSTO, range: Lixeira.RANGE, modo: 'construcao', classe: Lixeira },
            4: { nome: 'Firewall', largura: Firewall.LARGURA, altura: Firewall.ALTURA, cor: Firewall.COR, custo: Firewall.CUSTO, modo: 'construcao', classe: Firewall }
        };
    }

    // --- 10. INTERPOLAÇÃO VISUAL DE ALERTA ---
    mudarMatrizBackground() {
        const progressoCor = { valor: 0 };
        const corOriginal = Phaser.Display.Color.HexStringToColor('#ffffff'); 
        const corAlerta = Phaser.Display.Color.HexStringToColor('#ff0000');   

        this.tweens.add({
            targets: progressoCor,
            valor: 100,
            duration: 2000, 
            ease: 'Quad.easeOut',
            onUpdate: () => {
                const corMisturada = Phaser.Display.Color.Interpolate.ColorWithColor(
                    corOriginal,
                    corAlerta,
                    100,
                    progressoCor.valor
                );
                const corHex = Phaser.Display.Color.GetColor(corMisturada.r, corMisturada.g, corMisturada.b);
                
                if (this.backgroundCyber) {
                    this.backgroundCyber.setTint(corHex);
                }
            }
        });
    }

    // --- 11. ATUALIZAÇÃO DO SISTEMA ECONÓMICO ---
    adicionarBits(valor) {
        this.bits += valor;
        this.uiManager.atualizarBits(this.bits);
    }

    // --- 12. GERAÇÃO ALEATÓRIA DE INIMIGOS (BORDAS DO MAPA) ---
    spawnInimigo(classe) { 
        const margem = 100;
        const lado = Phaser.Math.Between(0, 3);
        let x, y;

        if (lado === 0) { x = Phaser.Math.Between(0, 2000); y = -margem; }
        else if (lado === 1) { x = Phaser.Math.Between(0, 2000); y = 2000 + margem; }
        else if (lado === 2) { x = -margem; y = Phaser.Math.Between(0, 2000); }
        else { x = 2000 + margem; y = Phaser.Math.Between(0, 2000); }

        const classes = { 'Worm': Worm, 'ILY': ILY, 'Trojan': Trojan };
        const InimigoClasse = classes[classe];

        if (InimigoClasse) {
            this.inimigos.add(new InimigoClasse(this, x, y));
        }
    }

    // --- 13. LOOP DE EXECUÇÃO PRINCIPAL (TICK RATE) ---
    update() {
        if (this.enzinho?.update) this.enzinho.update();
        
        if (this.backgroundCyber) {
            this.backgroundCyber.tilePositionY -= 1.7; 
            this.backgroundCyber.tilePositionX += 0.4; 
        }

        this.buildManager.atualizarPreview(
            this.input.activePointer, 
            this.dadosDefesas[this.selecionada]
        );
    }
}