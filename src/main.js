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
    scene: [Load, MapScene, Map2Scene]
}

var cursors;

const SCALE = 2.0;
var my = {sprite: {}, text: {}, log: []};


const game = new Phaser.Game(config);
