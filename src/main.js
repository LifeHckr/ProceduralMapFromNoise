//An ode to a real one:

// debug with extreme prejudice
"use strict"
// game config
let config = {
    parent: 'phaser-game',
    //type: Phaser.CANVAS,
    type: Phaser.WEBGL,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    //fps: { forceSetTimeOut: true, target: 30 },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            //useTree: false,
            fps: 60,//I am officially leaving this at 60
            fixedstep: true,
            tileBias: 64,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width:  1200,//window.innerWidth * window.devicePixelRatio
    height: 700,//window.innerHeight * window.devicePixelRatio,
    scene: [Load, Map2Scene]
}

const cursors = {};

const SCALE = 2.0;
const my = {sprite: {}, text: {}, log: []};
my.seed = Math.random();


const game = new Phaser.Game(config);
