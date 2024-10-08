class Map2Scene extends Phaser.Scene {
    constructor() {
        super("map2Scene")
    }
    map_width = 40;
    map_height = 30;
    steps = 5; //water, sand, grass, swamp
    tile_map = new TileMap(this.map_width, this.map_height, this.steps);
    frequency = .18;//.2
    rectMode = false;
    playerMade = false;
    landmarkTouching = false;

    max_num = -1; //-1
    min_num = 1;//1
    threshold = (this.max_num - this.min_num) / this.steps;
    tile_image_keys = ["water", "water", "sand", "grass", "dirt"];
    place_name_nouns = [
        ["Sea, Ocean, Depths, Triangle"],
        ["Sea, Ocean, Depths, Triangle"],
        ["Beach", "Sands", "Bay"],
        ["Forest", "Plains", "Savannah", "Wilds", "Town"],
        ["Mountain", "Heights", "Swamp", "Sheers", "Bluffs"]
    ];
    place_name_adjectives = ["Red", "Wild", "Blistering", "Cool-Cool", "Beyond Reach"];

    preload() {
        //Seed
        this.seed = Math.random();
        this.rng = new Phaser.Math.RandomDataGenerator([this.seed.toString()]);

        //Noise for grid
        this.tile_map.populateGrid(this.seed, this.frequency);

        //groups
        this.waterGroup = this.add.group();
        this.landmarkGroup = this.add.group();

        //Controls
        my.cursors = this.input.keyboard.createCursorKeys();
        my.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        my.regenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        my.shiftSmall = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);
        my.shiftBig = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);

    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(1, 1).setScroll(-16, -16);
        this.firstPass();
        console.log(structuredClone(this.tile_map.grid));
        if (!this.rectMode) {
             this.secondPass();
             console.log(this.tile_map);
             this.thirdPass();

             //Label for place names
             my.sprite.landmarkLabel = this.add.text(10, 10, "" , {
                 color: "#fff",
                 stroke: "#000",
                 strokeThickness: 5
             });
             my.sprite.landmarkLabel.setScrollFactor(0, 0).setDepth(10);

             //Set up physics
             this.physics.world.setBounds(-my.gridsize/2, -my.gridsize/2, this.map_width*my.gridsize, this.map_height*my.gridsize);
             my.sprite.player.setCollideWorldBounds(true);
             this.physics.add.overlap(my.sprite.player, this.landmarkGroup, (player, landmark) => {
                 my.sprite.landmarkLabel.text = landmark.name;
                 this.landmarkTouching = true;
             });
        }

        console.log(this);
    }

    update() {
         if (!this.rectMode) {
             my.sprite.player.update();

             if (!this.landmarkTouching) {
                 my.sprite.landmarkLabel.text = "";
             }
             this.landmarkTouching = false;
        }
    }

    //Gets step
    //Just sets base steps for all tiles
    firstPass() {
        for (let i = 0; i < this.map_width; i++) {//X
            for (let j = 0; j < this.map_height; j++) {
                this.tile_map.giveStep(i, j);
                if (this.rectMode) {
                    let rect = this.add.rectangle(i * my.gridsize, j* my.gridsize, my.gridsize, my.gridsize, Phaser.Display.Color.GetColor((((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255)));//(16777215 * this.tile_grid[j][i])
                }
            }
        }
    }

    //Evens out less even changes, e.g. tiles adjacent when the step dif is > 2, with a better tileset I could ignore this
    secondPass() {
        let queue = [];
        for (let k = 0; k < this.map_width; k++){//X
            for (let l = 0; l < this.map_height; l++) {
                queue.push(new Vector2(k, l));
            }
        }
        while (queue.length > 0) {
            let cur_pos = queue.pop();
            //Find any adjacency with a discrepancy of >1, e.g. water next to a mountain
            for (let m = 0; m < 8; m++) {
                let adj_val = this.tile_map.getAdjStepDif(cur_pos, m);
                if (adj_val < -1) {
                    let adj_vec = this.tile_map.getAdjCoords(cur_pos, m);
                    //Get tile at adj
                    //Push its step up
                    this.tile_map.changeTileValAt(adj_vec, 1);
                    //Queue
                    queue.push(adj_vec);
                }
            }
        }
    }

    //Draws correct tiling for tiles, and draws decorations, roads and landmarks
    thirdPass() {
        for (let i = 0; i < this.map_width; i++) {
            for (let j = 0; j < this.map_height; j++) {
                let cur_pos = new Vector2(i, j);
                let keyAndAngle = this.getCorrectTiling(this.tile_map.calcBitmask(cur_pos), this.tile_map.getTileValAt(cur_pos));
                let key = this.tile_image_keys[this.tile_map.getTileValAt(cur_pos)];
                let new_tile = this.add.sprite(i * my.gridsize, j*my.gridsize, key + keyAndAngle[0]);
                new_tile.angle = keyAndAngle[1];
                if (key === "water") {
                    this.physics.world.enable(new_tile, Phaser.Physics.Arcade.STATIC_BODY);
                    this.waterGroup.add(new_tile);
                    new_tile.body.setSize(12, 14); //fudge it and make them a tiny bit smaller to fit in 1 tile gaps
                }


               //Draw decoration or landmark
                 //5% chance to draw deco, if draw deco 46% deco1, 46% deco2, 8% landmark, but only if not water
                 if (this.rng.integerInRange(0, 19) === 19) {
                     let deco = this.rng.integerInRange(0, 99);
                     if (deco < 46) {
                         let new_deco = this.add.sprite(i * my.gridsize, j*my.gridsize, key + "Deco1");
                     } else if (deco < 92) {
                         let new_deco = this.add.sprite(i * my.gridsize, j*my.gridsize, key + "Deco2");
                     } else {
                         if (key !== "water") {
                             let new_deco = this.add.sprite(i * my.gridsize, j*my.gridsize, "landmark");
                             this.physics.world.enable(new_deco, Phaser.Physics.Arcade.STATIC_BODY);
                             this.landmarkGroup.add(new_deco);
                             new_deco.name = this.generateNames(this.tile_map.getTileValAt(cur_pos));
                             //Places player at first landmark
                             if (!this.playerMade) {
                                 this.playerMade = true;
                                 my.sprite.player = new Player(this, i * my.gridsize, j*my.gridsize, "person");
                                 my.sprite.player.setDepth(4);
                             }
                         }
                     }
                 }
            }
        }
    }

    //Gets correct sprite key and angle, from testing a tiny bit, a switch statement seems most optimal
    getCorrectTiling(bitmask, step) {
        let angleAndKey = ["Full", 0];
        if (this.tile_image_keys[step] === "water") {
            return angleAndKey;
        }

        switch (bitmask) {
            case 1:
                angleAndKey[0] = "End";
                angleAndKey[1] = -90;
                break;
            case 2:
                angleAndKey[0] = "End";
                break;
            case 3:
                angleAndKey[0] = "Corner";
                angleAndKey[1] = 90;
                break;
            case 4:
                angleAndKey[0] = "End";
                angleAndKey[1] = 90;
                break;
            case 5:
                angleAndKey[0] = "Long";
                angleAndKey[1] = 90;
                break;
            case 6:
                angleAndKey[0] = "Corner";
                angleAndKey[1] = 180;
                break;
            case 7:
                angleAndKey[0] = "Edge";
                angleAndKey[1] = 180;
                break;
            case 8:
                angleAndKey[0] = "End";
                angleAndKey[1] = 180;
                break;
            case 9:
                angleAndKey[0] = "Corner";
                break;
            case 10:
                angleAndKey[0] = "Long";
                break;
            case 11:
                angleAndKey[0] = "Edge";
                angleAndKey[1] = 90;
                break;
            case 12:
                angleAndKey[0] = "Corner";
                angleAndKey[1] = -90;
                break;
            case 13:
                angleAndKey[0] = "Edge";
                break;
            case 14:
                angleAndKey[0] = "Edge";
                angleAndKey[1] = -90;
                break;
            default:
                break;
        }




        return angleAndKey
    }

    //generates place names based on tile, returns the name
    generateNames(cur_tile) {
        return this.place_name_adjectives[this.rng.integerInRange(0, this.place_name_adjectives.length-1)] + " " +this.place_name_nouns[cur_tile][this.rng.integerInRange(0, this.place_name_nouns[cur_tile].length-1)];
    }


}
