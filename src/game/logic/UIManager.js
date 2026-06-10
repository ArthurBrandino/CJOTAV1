import { Clicker } from '../entities/Clicker.js';
import { Lixeira } from '../entities/Lixeira.js';
import { Firewall } from '../entities/Firewall.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.w = this.scene.scale.width;
        this.h = this.scene.scale.height;

        // Deslocamentos das ilhas de renderização para isolamento de viewports
        this.offVida = 5000;
        this.offBits = 6000;
        this.offWave = 7000;
        this.offHotbar = 8000;

        this.setupCameras();
        this.setupUIElements();
        this.criarIconesHotbar();
        this.setupListeners(); 
    }

    // --- 1. CONFIGURAÇÃO DE VIEWPORTS E SISTEMA DE CÂMERAS MULTILAYER ---
    setupCameras() {
        // Câmera de Plano de Fundo Global Estático
        this.offBack = 9000;
        this.scene.backCamera = this.scene.cameras.add(0, 0, this.w, this.h).setName('GlobalBG');
        this.scene.backCamera.setScroll(this.offBack, this.offBack);

        // Viewport Principal do Jogo (Janela de Gameplay)
        const gameW = 950;
        const gameH = 550;
        this.scene.cameras.main.setViewport((this.w - gameW) / 2, 100, gameW, gameH);
        this.scene.cameras.main.setBackgroundColor('#000b00');

        // Câmeras Independentes para Elementos Modulares da HUD
        this.scene.lifeCamera = this.scene.cameras.add(20, 20, 300, 100).setName('LIFE')
            .setBackgroundColor('#005300').setScroll(this.offVida, this.offVida);

        this.scene.bitsCamera = this.scene.cameras.add(this.w - 350, 20, 300, 100).setName('STATUS')
            .setBackgroundColor('#0a0097').setScroll(this.offBits, this.offBits);

        this.scene.waveCamera = this.scene.cameras.add(this.w - 320, 100, 300, 100).setName('WAVE')
            .setBackgroundColor('#4a4a00').setScroll(this.offWave, this.offWave);

        const barH = 80; 
        this.scene.hotbarCamera = this.scene.cameras.add(0, this.h - barH, this.w, barH).setName('Hotbar')
            .setBackgroundColor('#0058aa').setScroll(this.offHotbar, this.offHotbar);
        
        // Reordena a câmera de fundo para garantir prioridade de renderização inicial
        const cameraIndex = this.scene.cameras.cameras.indexOf(this.scene.backCamera);
        if (cameraIndex > -1) {
            const [cam] = this.scene.cameras.cameras.splice(cameraIndex, 1);
            this.scene.cameras.cameras.unshift(cam);
        }

        // Camada de Efeito para Feedback de Dano (Flash Overlay)
        const { width, height } = this.scene.scale;
        this.scene.flashOverlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xff0000);
        this.scene.flashOverlay.setScrollFactor(0); 
        this.scene.flashOverlay.setDepth(99999);   
        this.scene.flashOverlay.setAlpha(0);
    }
    
    // --- 2. RENDERIZAÇÃO ESTÉTICA DAS MOLDURAS (INTERFACE DO S.O.) ---
    setupUIElements() {
        this.globalBG = this.scene.add.image(this.offBack + (this.w/2), this.offBack + (this.h/2), 'meu-wallpaper')
            .setDisplaySize(this.w, this.h).setDepth(-1);

        const gameW = 950;
        const gameH = 550;
        const cameraX = (this.w - gameW) / 2;
        const cameraY = 100;
        const molduraX = this.offBack + cameraX;
        const molduraY = this.offBack + cameraY; 

        this.janelaJogoContainer = this.criarMolduraWinXP(molduraX, molduraY, gameW, gameH, "C:\\Games\\Cyber_Defense.exe");

        // Compensação geométrica da borda externa para delimitação visual da tela de jogo
        const bordaJogo = this.scene.add.graphics();
        bordaJogo.lineStyle(3, 0x000000); 
        bordaJogo.strokeRect(molduraX - 1, molduraY - 1, gameW + 2, gameH + 2);
        bordaJogo.setDepth(10); 

        const estiloValor = { fontSize: '28px', fill: '#000', fontFamily: 'Courier', fontWeight: 'bold' };

        // Instanciação das molduras clássicas do monitor do sistema
        this.criarMolduraWinXP(this.offVida, this.offVida, 300, 100, "SYSTEM_MONITOR.EXE");
        this.barraVida = this.scene.add.graphics();
        this.textoHUD = this.scene.add.text(this.offVida + 15, this.offVida + 75, 'STATUS: OK', {
            fontSize: '12px', fill: '#000', fontFamily: 'monospace'
        });

        this.criarMolduraWinXP(this.offBits, this.offBits, 300, 100, "BIT_COUNTER.SYS");
        this.scene.textoBits = this.scene.add.text(this.offBits + 150, this.offBits + 60, 'BITS: 0', estiloValor).setOrigin(0.5);

        this.criarMolduraWinXP(this.offWave, this.offWave, 300, 100, "WAVE_MANAGER.DLL");
        this.scene.textoTurno = this.scene.add.text(this.offWave + 150, this.offWave + 60, 'WAVE: 01', estiloValor).setOrigin(0.5);

        // Registro de rotinas de atualização reativas via eventos do Phaser
        this.onUpdateHP = (atual, max) => {
            if (!this.barraVida || !this.barraVida.scene) return; 
            this.desenharBarraVida(atual, max);
        };

        this.onUpdateBits = (valor) => {
            if (!this.scene.textoBits || !this.scene.textoBits.scene) return; 
            this.scene.textoBits.setText('BITS: ' + valor);
            this.atualizarCoresPorPreco(valor);
        };

        this.scene.events.on('update-hp', this.onUpdateHP);
        this.scene.events.on('update-bits', this.onUpdateBits);

        this.scene.events.once('shutdown', () => {
            this.scene.events.off('update-hp', this.onUpdateHP);
            this.scene.events.off('update-bits', this.onUpdateBits);
            this.barraVida = null;
            if(this.scene.textoBits) this.scene.textoBits = null;
            if(this.scene.textoTurno) this.scene.textoTurno = null;
        });
    }

    // --- 3. CONTROLE GEOMÉTRICO E DE CORES DO STATUS DO SISTEMA ---
    atualizarTextoWave(numero) {
        const waveFormatada = String(numero).padStart(2, '0');
        this.scene.textoTurno.setText(`WAVE: ${waveFormatada}`);
    }

    desenharBarraVida(atual, max) {
        this.barraVida.clear();
        const off = this.offVida;
        const x = off + 15; 
        const y = off + 35;
        const larguraTotal = 270;

        this.barraVida.fillStyle(0x000000, 0.5);
        this.barraVida.fillRect(x, y, larguraTotal, 20);

        const larguraVida = (atual / max) * larguraTotal;
        const corBarra = atual < 30 ? 0xff0000 : (atual < 60 ? 0xffff00 : 0x00ff00);
        
        this.barraVida.fillStyle(corBarra);
        this.barraVida.fillRect(x, y, larguraVida, 20);

        this.barraVida.lineStyle(2, 0xffffff);
        this.barraVida.strokeRect(x, y, larguraTotal, 20);

        if (atual < 30) this.textoHUD.setText('CPU_STABILITY: CRITICAL').setFill('#ff0000');
        else if (atual < 60) this.textoHUD.setText('CPU_STABILITY: WARNING').setFill('#ffff00');
        else this.textoHUD.setText('CPU_STABILITY: OK').setFill('#00ff00');
    }

    // --- 4. CONSTRUÇÃO DA HOTBAR E SLOTS DE COMPRA ---
    criarIconesHotbar() {
        const off = this.offHotbar;
        const camera = this.scene.hotbarCamera;
        const worldY = off + (camera.height / 2);

        this.criarBotaoStart(off, worldY);
        this.criarRelogio(off, worldY, camera, camera.height);
        this.criarItens(off, worldY, camera);
    }

    criarItens(off, worldY, camera){
        const larguraSlot = 48; 
        const espacamento = 45;
        const totalSlots = 4;
        const larguraGrupo = (totalSlots * larguraSlot) + ((totalSlots - 1) * espacamento);
        const inicioX = (camera.width / 2) - (larguraGrupo / 2) + (larguraSlot / 2);
        const slotY = worldY - 6;

        const itensHotbar = [
            { nome: 'CURSOR', preco: 0, sprite: 'pointer-icon' },
            { nome: 'CLICKER', preco: Clicker.CUSTO, sprite: 'spr_clicker' },
            { nome: 'LIXEIRA', preco: Lixeira.CUSTO, sprite: 'spr_lixeira' }, 
            { nome: 'FIREWALL', preco: Firewall.CUSTO, sprite: 'spr_firewall' }
        ];

        this.slots = [];
        this.textosSlots = []; 
        this.precosSlots = []; 
        this.iconesRef = [this.btnStart, this.menuLogo, this.txtStart, this.trayBG, this.txtTempoWave];

        itensHotbar.forEach((item, i) => {
            const x = off + inicioX + i * (larguraSlot + espacamento);

            const bg = this.scene.add.rectangle(x, slotY, larguraSlot, larguraSlot, 0xd4d0c8)
                .setStrokeStyle(1.5, 0xffffff) 
                .setInteractive({ useHandCursor: true })
                .setDepth(2000);

            const txtNum = this.scene.add.text(x - (larguraSlot / 2) + 4, slotY - (larguraSlot / 2) + 2, i + 1, { 
                fontSize: '11px', fill: '#505050', fontFamily: 'Tahoma, Arial, sans-serif', fontWeight: 'bold'
            }).setOrigin(0, 0).setDepth(2002);

            if (item.sprite && this.scene.textures.exists(item.sprite)) {
                const spriteIcone = this.scene.add.image(x, slotY, item.sprite).setDepth(2001);
                
                // Redimensionamento condicional para o ícone padrão de seta do mouse
                if (item.sprite === 'pointer-icon') {
                    spriteIcone.setDisplaySize(20, 30); 
                } else {
                    spriteIcone.setDisplaySize(larguraSlot - 12, larguraSlot - 12);
                }

                this.iconesRef.push(spriteIcone);
            }

            const textoExibicao = item.preco > 0 ? `${item.nome} (${item.preco}B)` : item.nome;
            const yTexto = slotY + (larguraSlot / 2) + 6;

            const txtInfo = this.scene.add.text(x, yTexto, textoExibicao, { 
                fontSize: '10px', 
                fill: '#ffffff', 
                fontFamily: 'Tahoma, Arial, sans-serif',
                fontWeight: 'bold',
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 1, fill: true }
            }).setOrigin(0.5, 0).setDepth(2001);

            this.slots[i + 1] = bg;
            this.textosSlots[i + 1] = txtInfo; 
            this.precosSlots[i + 1] = item.preco; 
            
            bg.on('pointerdown', () => this.selecionarSlot(i + 1));
            this.iconesRef.push(bg, txtNum, txtInfo);
        });

        this.atualizarCoresPorPreco(this.scene.bits || 0);
        this.selecionarSlot(1);
    }

    // --- 5. COMPORTAMENTO E SELEÇÃO DE INTERFACE DO SLOT DE COMPRAS ---
    selecionarSlot(index) {
        this.slots.forEach(slot => { if (slot) slot.setStrokeStyle(2, 0xffffff); });
        if (this.slots[index]) this.slots[index].setStrokeStyle(4, 0x00ff00);
        this.scene.selecionada = index;
        this.scene.events.emit('trocou-slot', index);
    }

    atualizarBits(valor) {
        if (this.scene.textoBits) this.scene.textoBits.setText('BITS: ' + valor);
        this.atualizarCoresPorPreco(valor);
    }

    atualizarCoresPorPreco(bitsAtuais) {
        if (!this.textosSlots) return;

        for (let i = 1; i <= 4; i++) {
            const texto = this.textosSlots[i];
            const preco = this.precosSlots[i];

            if (texto) {
                if (i === 1) {
                    texto.setFill('#ffffff');
                } else {
                    // Feedback visual verde (saldo suficiente) ou vermelho (insuficiente)
                    if (bitsAtuais >= preco) {
                        texto.setFill('#39ff14');
                    } else {
                        texto.setFill('#ff0000');
                    }
                }
            }
        }
    }

    // --- 6. ATALHOS LÓGICOS DE ESCUTADORES DA HUD ---
    setupListeners() {
        this.scene.events.on('update-timer', (texto) => {
            if (this.txtTempoWave && this.txtTempoWave.scene && this.txtTempoWave.scene.sys.isActive()) {
                this.txtTempoWave.setText(texto);
                this.txtTempoWave.setFill(texto.includes("DANGER") ? '#ff0000' : '#00ff00');
            }
        });

        this.scene.events.on('proxima-wave', (numeroDaWave) => {
            if (this.scene && this.scene.sys.isActive()) {
                this.atualizarTextoWave(numeroDaWave);
            }
        });
    }

    // --- 7. MÉTODOS DE FILTRAGEM DE CÂMERAS E ELEMENTOS RETRÔ DO S.O. ---
    applyCameraIgnores() {
        const textosHotbar = (this.textosSlots || []).filter(el => el != null);

        const tudoUI = [
            this.scene.textoBits, this.scene.textoTurno, 
            this.barraVida, this.textoHUD, ...(this.iconesRef || []), ...textosHotbar
        ].filter(el => el != null);

        this.scene.cameras.main.ignore([...tudoUI, this.globalBG]);
        this.scene.backCamera.ignore(tudoUI);

        this.scene.lifeCamera.ignore(this.globalBG);
        this.scene.bitsCamera.ignore(this.globalBG);
        this.scene.waveCamera.ignore(this.globalBG);
        this.scene.hotbarCamera.ignore(this.globalBG);
    }

    criarMolduraWinXP(x, y, largura, altura, tituloTexto) {
        const fundo = this.scene.add.rectangle(x, y, largura, altura, 0xced4d6).setOrigin(0, 0);
        const barra = this.scene.add.rectangle(x, y, largura, 25, 0x000080).setOrigin(0, 0);
        
        const tituloTxt = this.scene.add.text(x + 5, y + 5, tituloTexto, { 
            fontSize: '12px', fill: '#fff', fontWeight: 'bold', fontFamily: 'Tahoma' 
        });

        const borda = this.scene.add.graphics();
        borda.lineStyle(2, 0x000000);
        borda.strokeRect(x, y, largura, altura);

        if(tituloTexto.includes("Cyber_Defense.exe")) {
            borda.setDepth(1);
        }

        return { fundo, barra, borda };
    }

    criarBotaoStart(off, worldY){
        const startX = off + 85; 
        const startWidth = 110;  
        const startHeight = 34;

        this.btnStart = this.scene.add.rectangle(startX, worldY, startWidth, startHeight, 0x388A34)
            .setStrokeStyle(1.5, 0x2E6A29) 
            .setInteractive({ useHandCursor: true })
            .setDepth(2000);

        this.menuLogo = this.scene.add.image(startX - (startWidth / 2) + 18, worldY, 'menu')
            .setScale(0.25)
            .setDepth(2001);

        this.txtStart = this.scene.add.text(startX + 12, worldY, 'start', {
            fontSize: '16px', 
            fill: '#ffffff', 
            fontWeight: 'bold', 
            fontStyle: 'italic',
            fontFamily: 'Tahoma, Arial, sans-serif',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 1, stroke: false, fill: true }
        }).setOrigin(0.5).setDepth(2001);

        this.btnStart.on('pointerover', () => this.btnStart.setFillStyle(0x4CA647));  
        this.btnStart.on('pointerout', () => this.btnStart.setFillStyle(0x388A34));   
        this.btnStart.on('pointerdown', () => this.btnStart.setFillStyle(0x286325));  
    }

    criarRelogio(off, worldY, camera, barH){
        const trayX = off + camera.width - 75;
        const trayWidth = 160;
        const trayHeight = barH;

        this.trayBG = this.scene.add.rectangle(trayX, worldY, trayWidth, trayHeight, 0x16619eff)
            .setStrokeStyle(1, 0x2595f0ff)
            .setDepth(2000);

        this.txtTempoWave = this.scene.add.text(trayX, worldY, '00:00', {
            fontSize: '20px', 
            fill: '#ffffff', 
            fontFamily: 'Tahoma, Arial, sans-serif', 
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(2001);
    }
}