import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { IntroCutscene } from './scenes/IntroCutscene'; 
import { BadEnding } from './scenes/BadEnding';
import { WinScreen } from './scenes/WinScreen';
import { GoodEnding } from './scenes/GoodEnding';
import { AUTO, Game, Scale } from 'phaser'; // Ajustado para usar Scale diretamente do Phaser se necessário

const config = {
    type: AUTO,
    width: window.innerWidth, 
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT, // Usando a importação limpa ou Phaser.Scale.FIT
        autoCenter: Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, 
            debug: false       
        }
    },
    // O Phaser lê o array e define a PRIMEIRA cena como a que vai iniciar o ciclo de vida (Boot)
    scene: [
        Boot,
        Preloader,
        MainMenu,
        IntroCutscene,
        MainGame,
        GameOver,
        BadEnding,
        WinScreen, 
        GoodEnding 
    ]
};

const StartGame = (parent) => {

    return new Game({ ...config, parent });

}

export default StartGame;