class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        my.gridsize = 64;
         this.load.image("waterO", "Assets/PNG/water.png");
         this.load.image("sandO", "Assets/PNG/sand.png");
         this.load.image("grassO", "Assets/PNG/grass.png");
         this.load.image("swampO", "Assets/PNG/swamp.png");
        this.load.spritesheet('tiles', 'Assets/Tiles-Sheet.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {


        game.scene.stop('loadScene');
        this.scene.start("map2Scene");
    }

    // Never get here since a new scene is started in create()
    update() {

        /*game.scene.stop('loadScene');
        this.scene.start("TitleScreen");*/


    }
}