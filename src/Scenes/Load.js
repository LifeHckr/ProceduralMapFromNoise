class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        my.gridsize = 16;
        this.load.image("waterFull", "Assets/simple_tiles/waterFull.png");
        this.load.image("waterDeco1", "Assets/simple_tiles/waterDeco1.png");
        this.load.image("waterDeco2", "Assets/simple_tiles/waterDeco2.png");

        this.load.image("sandFull", "Assets/simple_tiles/sandFull.png");
        this.load.image("sandCorner", "Assets/simple_tiles/sandCorner.png");
        this.load.image("sandEdge", "Assets/simple_tiles/sandEdge.png");
        this.load.image("sandLong", "Assets/simple_tiles/sandLong.png");
        this.load.image("sandEnd", "Assets/simple_tiles/sandEnd.png");
        this.load.image("sandDeco1", "Assets/simple_tiles/sandDeco1.png");
        this.load.image("sandDeco2", "Assets/simple_tiles/sandDeco2.png");


        this.load.image("grassFull", "Assets/simple_tiles/grassFull.png");
        this.load.image("grassCorner", "Assets/simple_tiles/grassCorner.png");
        this.load.image("grassEdge", "Assets/simple_tiles/grassEdge.png");
        this.load.image("grassLong", "Assets/simple_tiles/grassLong.png");
        this.load.image("grassEnd", "Assets/simple_tiles/grassEnd.png");
        this.load.image("grassDeco1", "Assets/simple_tiles/grassDeco1.png");
        this.load.image("grassDeco2", "Assets/simple_tiles/grassDeco2.png");

        this.load.image("dirtFull", "Assets/simple_tiles/dirtFull.png");
        this.load.image("dirtCorner", "Assets/simple_tiles/dirtCorner.png");
        this.load.image("dirtEdge", "Assets/simple_tiles/dirtEdge.png");
        this.load.image("dirtLong", "Assets/simple_tiles/dirtLong.png");
        this.load.image("dirtEnd", "Assets/simple_tiles/dirtEnd.png");
        this.load.image("dirtDeco1", "Assets/simple_tiles/dirtDeco1.png");
        this.load.image("dirtDeco2", "Assets/simple_tiles/dirtDeco2.png");

        this.load.image("landmark", "Assets/simple_tiles/landmark.png");

        this.load.image("person", "Assets/simple_tiles/person.png");
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