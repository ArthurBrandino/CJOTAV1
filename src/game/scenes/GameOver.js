import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        // --- 1. GERENCIAMENTO DE ÁUDIO DE ERRO ---
        this.sound.stopAll();
        this.sound.play('death_processador');
        this.sound.play('Shutdown');
        
        // --- 2. CONFIGURAÇÃO ESTÉTICA DA BSOD ---
        this.cameras.main.setBackgroundColor('#0000aa');

        const { width, height } = this.scale;
        const margemX = 50;

        const estiloBSOD = {
            fontFamily: '"Lucida Console", "Courier New", Courier, monospace',
            fontSize: '18px',
            fill: '#ffffff',
            align: 'left',
            wordWrap: { width: width - (margemX * 2), useAdvancedWrap: true }
        };

        // --- 3. RENDERIZAÇÃO DA BARRA DE TÍTULO ---
        const barraTitulo = this.add.graphics();
        barraTitulo.fillStyle(0xffffff, 1);
        barraTitulo.fillRect(margemX, 40, width - (margemX * 2), 35);

        this.add.text(width / 2, 57, "--- GAME OVER ---", {
            fontFamily: '"Lucida Console", "Courier New", Courier, monospace',
            fontSize: '22px',
            fontWeight: 'bold',
            fill: '#0000aa',
        }).setOrigin(0.5);

        // --- 4. CONSTRUÇÃO DO CORPO DE TEXTO TÉCNICO ---
        let textoCompleto = "A problem has been detected and Cyber_Defense.exe has been terminated to prevent damage to your computer.\n\n";
        textoCompleto += "SYSTEM_STATUS: CORRUPTED_BY_MALWARE\n\n";
        textoCompleto += "If this is the first time you've seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:\n\n";
        textoCompleto += "Check to make sure any new hardware or software (like your FIREWALL, CLICKER or LIXEIRA) is properly installed.\n";
        textoCompleto += "If problems continue, disable or remove any newly installed software or drivers. Check your system resources for virus or malware infections.\n\n";
        
        textoCompleto += "Technical information:\n\n";
        textoCompleto += "*** STOP: 0x000000D1 (0x0000000C, 0x00000002, 0x00000000, 0xF86B5A89)\n\n";
        textoCompleto += "*** cyber_defense.sys - Address F86B5A89 base at F86B0000, DateStamp 36b122e2";

        this.add.text(margemX, 100, textoCompleto, estiloBSOD);

        // --- 5. INTERFACE INTERATIVA E EFEITO PISCANTE ---
        const textoClique = this.add.text(width / 2, height - 80, "Press any key or CLICK ANYWHERE to continue", {
            fontFamily: '"Lucida Console", "Courier New", Courier, monospace',
            fontSize: '18px',
            fill: '#ffff00', 
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: textoClique,
            alpha: 0,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // --- 6. CAPTURA DE ENTRADAS DE AVANÇO ---
        this.input.once('pointerdown', () => {
            this.scene.start('BadEnding');
        });

        this.input.keyboard.once('keydown', () => {
            this.scene.start('BadEnding');
        });
    }
}