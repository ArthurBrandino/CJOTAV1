import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // --- 1. RENDERIZAÇÃO DA BARRA DE PROGRESSO INICIAL ---
        this.add.image(512, 384, 'background');

        // Contorno da barra de carregamento
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        // Preenchimento dinâmico da barra
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        // Ouvinte do evento de progresso do LoaderPlugin
        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        // --- 2. CONFIGURAÇÃO DO CAMINHO DOS ASSETS ---
        this.load.setPath('assets');

        // --- 3. CARREGAMENTO DE TEXTURAS E SPRITES DO MAPA/UI ---
        this.load.image('menu', 'mapa/Menu.png');
        this.load.image('avatar', 'mapa/Avatar.png');
        this.load.image('logo_winxp', 'mapa/Logo_winxp.png');
        this.load.image('on_button', 'mapa/ON_Sprite.png');
        this.load.image('meu-wallpaper', 'mapa/background.jpg');
        this.load.image('logo', 'logo.png'); 
        this.load.image('processador', 'mapa/processador.png');
        this.load.image('pointer-icon', 'mapa/pointer.png');
        this.load.image('game_background', 'mapa/BackgroundGame.gif');
        
        this.load.spritesheet('spr_folder', 'mapa/Folder_Sprite.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });

        // --- 4. CARREGAMENTO DE ENTIDADES E DEFESAS ---
        this.load.image('spr_clicker', 'defesas/Clicker_Sprite.png');
        this.load.image('spr_lixeira', 'defesas/Trashcan_Sprite.png');
        this.load.image('spr_firewall', 'defesas/Firewall_Sprite.png');

        // --- 5. CARREGAMENTO DE INIMIGOS (VÍRUS) ---
        this.load.image('spr_letter', 'inimigos/Letter_Sprite.png');
        this.load.image('spr_trojan', 'inimigos/Trojan_Sprite.png');
        this.load.spritesheet('spr_worm', 'inimigos/Worm_Sprite.png', { 
            frameWidth: 16, 
            frameHeight: 16 
        });

        // --- 6. CARREGAMENTO DAS ANIMAÇÕES DO JOGADOR ---
        this.load.spritesheet('player_attack', 'player/attack.png', {
            frameWidth: 24,  
            frameHeight: 24
        });
        this.load.spritesheet('player_idle', 'player/idle.png', {
            frameWidth: 24,  
            frameHeight: 24
        });
        this.load.spritesheet('player_run', 'player/run.png', {
            frameWidth: 24,  
            frameHeight: 24
        });
         this.load.spritesheet('player_interact', 'player/interact.png', {
            frameWidth: 24,  
            frameHeight: 24
        });

        // --- 7. CARREGAMENTO DE QUADRINHOS (CUTSCENES) ---
        this.load.image('introducao_cutscene', 'cutscenes/Introducao_cutscene.jpeg');
        this.load.image('bad_ending_cutscene', 'cutscenes/Bad_ending_cutscene.jpeg');
        this.load.image('good_ending_cutscene', 'cutscenes/Good_ending_cutscene.jpeg');

        // --- 8. CARREGAMENTO DE EFEITOS SONOROS E TRILHAS (ÁUDIOS) ---
        this.load.audio('key', 'audios/key.wav');
        this.load.audio('TurnOn', 'audios/TurnOn.mp3');
        this.load.audio('Start', 'audios/Startup.wav');
        this.load.audio('Shutdown', 'audios/Shutdown.mp3');
        this.load.audio('soundtrack', 'audios/GameSoundtrack.mp3');
        this.load.audio('WaveClear', 'audios/waveclear.wav');
        this.load.audio('hit_processador', 'audios/hitHurt.wav');
        this.load.audio('hit_enemy', 'audios/hitEnemy.wav');
        this.load.audio('death_processador', 'audios/processador_death.wav');
        this.load.audio('EvilLaugh', 'audios/EvilLaugh.mp3');
        this.load.audio('ClickerShoot', 'audios/MouseClick.mp3');
        this.load.audio('DefenseDestroy', 'audios/DefenseDestroy.mp3');
        this.load.audio('DefenseHit', 'audios/DefenseHit.wav');
        this.load.audio('TrashProcessing', 'audios/TrashProcessing.mp3');
        this.load.audio('TrashComplete', 'audios/TrashComplete.mp3');
        this.load.audio('som_vitoria', 'audios/WinSound.mp3');
        this.load.audio('Error', 'audios/Error.mp3');
    }   

    create ()
    {
        // --- 9. TRANSIÇÃO DE ENTRADA DO MENU ---
        this.scene.start('MainMenu');
    }
}