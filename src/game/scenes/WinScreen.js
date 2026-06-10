import Phaser from 'phaser';

export class WinScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScreen' });
    }

    init(data) {
        this.bitsSalvos = data.bits || 0;
    }

    create() {
        // --- 1. GERENCIAMENTO DE ÁUDIO DE VITÓRIA ---
        this.sound.play('som_vitoria', { volume: 0.8 });

        // --- 2. CONFIGURAÇÃO ESTÉTICA DO DESKTOP ---
        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'meu-wallpaper');
        bg.setOrigin(0.5);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // --- 3. POP-UP DE SUCESSO (ESTILO POP-UP RESTRITO) ---
        let boxWidth = 500;
        let boxHeight = 250;
        let dialogBox = this.add.graphics();
        dialogBox.fillStyle(0xC0C0C0, 1);
        dialogBox.lineStyle(3, 0xffffff, 1);
        
        let startX = this.cameras.main.centerX - (boxWidth / 2);
        let startY = this.cameras.main.centerY - (boxHeight / 2) - 30; 
        dialogBox.fillRect(startX, startY, boxWidth, boxHeight);
        dialogBox.strokeRect(startX, startY, boxWidth, boxHeight);

        // Barra de Título
        dialogBox.fillStyle(0x0055ea, 1);
        dialogBox.fillRect(startX + 4, startY + 4, boxWidth - 8, 30);

        this.add.text(startX + 15, startY + 12, "Sucesso do Sistema", {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            fill: '#ffffff'
        });

        // Mensagem de Feedback Técnico
        this.add.text(this.cameras.main.centerX, startY + 95, 
            "O Rootkit foi removido com sucesso.\n\nSua CPU está operando a 100% de integridade e o computador está salvo!", {
            fontFamily: 'monospace',
            fontSize: '16px',
            fill: '#000000',
            align: 'center',
            wordWrap: { width: boxWidth - 40 }
        }).setOrigin(0.5);

        // --- 4. INTERFACE DO BOTÃO CONTINUAR (RELEVO 3D) ---
        let btnWidth = 120;
        let btnHeight = 30;
        let btnX = this.cameras.main.centerX;
        let btnY = startY + boxHeight - 40; 

        this.btnOk = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0xE0E0E0)
            .setStrokeStyle(1.5, 0x808080)
            .setInteractive({ useHandCursor: true });

        this.txtOk = this.add.text(btnX, btnY, 'CONTINUAR', {
            fontFamily: 'Tahoma, Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 'bold',
            fill: '#000000'
        }).setOrigin(0.5);

        // Eventos Hover e Clique do Botão Ok
        this.btnOk.on('pointerover', () => this.btnOk.setFillStyle(0xF2F2F2));
        this.btnOk.on('pointerout', () => this.btnOk.setFillStyle(0xE0E0E0));
        this.btnOk.on('pointerdown', () => {
            this.btnOk.setFillStyle(0xD0D0D0);
            this.goToGoodEnding();
        });

        // --- 5. RENDERIZAÇÃO DA BARRA DE TAREFAS (HUD DO SO) ---
        this.montarBarraDeTarefasDoUsuario();

        // --- 6. MAPEAMENTO DE ENTRADAS DE TECLADO ---
        this.input.keyboard.on('keydown-ENTER', () => this.goToGoodEnding());
        this.input.keyboard.on('keydown-SPACE', () => this.goToGoodEnding());

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    montarBarraDeTarefasDoUsuario() {
        const camera = this.cameras.main;
        
        // Configuração de Escala da Barra
        this.barHReal = camera.height > 600 ? 60 : 45; 
        
        let baseBarra = this.add.graphics();
        baseBarra.fillStyle(0x245edb, 1);
        baseBarra.fillRect(0, camera.height - this.barHReal, camera.width, this.barHReal);
        
        baseBarra.fillStyle(0x427bf4, 1);
        baseBarra.fillRect(0, camera.height - this.barHReal, camera.width, 4);

        const worldY = camera.height - (this.barHReal / 2);

        // Configuração Estética do Botão Start
        const startX = 110; 
        const startWidth = 120; 
        const startHeight = this.barHReal - 30; 

        this.btnStart = this.add.rectangle(startX, worldY, startWidth, startHeight, 0x388A34)
            .setStrokeStyle(2, 0x2E6A29) 
            .setInteractive({ useHandCursor: true })
            .setDepth(2000);

        this.menuLogo = this.add.image(startX - (startWidth / 2) + 24, worldY, 'menu')
            .setScale(0.25)
            .setDepth(2001);

        this.txtStart = this.add.text(startX + 18, worldY, 'start', {
            fontSize: '22px', 
            fill: '#ffffff', 
            fontWeight: 'bold', 
            fontStyle: 'italic',
            fontFamily: 'Tahoma, Arial, sans-serif',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 1, stroke: false, fill: true }
        }).setOrigin(0.5).setDepth(2001);

        this.btnStart.on('pointerover', () => this.btnStart.setFillStyle(0x4CA647));  
        this.btnStart.on('pointerout', () => this.btnStart.setFillStyle(0x388A34));   
        this.btnStart.on('pointerdown', () => this.btnStart.setFillStyle(0x286325));  

        // Configuração Estética do Sistema Tray (Relógio / Pontuação)
        const trayWidth = 200; 
        const trayX = camera.width - (trayWidth / 2); 
        const trayHeight = this.barHReal;

        this.trayBG = this.add.rectangle(trayX, worldY, trayWidth, trayHeight, 0x16619eff)
            .setStrokeStyle(1, 0x2595f0ff)
            .setDepth(2000);

        this.txtTempoWave = this.add.text(trayX, worldY, `${this.bitsSalvos} BITS`, {
            fontSize: '20px', 
            fill: '#ffffff', 
            fontFamily: 'Tahoma, Arial, sans-serif', 
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(2001);
    }

    goToGoodEnding() {
        // --- 7. TRANSIÇÃO DE SAÍDA SEGURA ---
        if (this.cameras.main.fadeEffect.isRunning) return;

        this.sound.stopAll();
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GoodEnding'); 
        });
    }
}