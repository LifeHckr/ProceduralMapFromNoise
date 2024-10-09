class Map2Scene extends Phaser.Scene {
    constructor() {
        super("map2Scene");
        this.map_width = 40;
        this.map_height = 30;
        this.steps = 5; //water, sand, grass, swamp
        this.frequency = .07;//bigger number : more zoomed in
        this.rectMode = false;
        this.playerMade = false;
        this.landmarkTouching = false;

        this.tile_image_keys = ["water", "water", "sand", "grass", "dirt", "dirt"];
        this.place_name_nouns = [
            ["Sea, Ocean, Depths, Triangle"],
            ["Sea, Ocean, Depths, Triangle"],
            ["Beach", "Sands", "Bay"],
            ["Forest", "Plains", "Savannah", "Wilds", "Town"],
            ["Mountain", "Heights", "Swamp", "Sheers", "Bluffs"]
        ];
        this.place_name_adjectives = ["Red", "Wild", "Blistering", "Cool-Cool", "Beyond Reach"];
        this.type_of_decos = 2;

        this.LANDMARK_DEPTH = 4;
        this.PLAYER_DEPTH = 5;

    }

    player;

    preload() {
        this.tile_map = new TileMap(this.map_width, this.map_height, this.steps);

        //Seed-----------------------------------------------
        this.seed = my.seed;
        this.rng = new Phaser.Math.RandomDataGenerator([this.seed.toString()]);

        //Noise for grid-----------------------------------------------
        this.tile_map.populateGrid(this.seed, this.frequency);

        //groups-----------------------------------------------
        this.waterGroup = this.add.group();
        this.landmarkGroup = this.add.group();

        //Controls-----------------------------------------------
        my.cursors = this.input.keyboard.createCursorKeys();
        my.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        my.regenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        my.rectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        my.shiftSmall = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);//zoom in
        my.shiftBig = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);//zoom out

    }

    create() {
        //Camera-----------------------------------------------
        this.camera = this.cameras.main;
        this.camera.setZoom(1, 1).setScroll(-16, -16);

        //Make visual map-----------------------------------------------
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
             this.physics.add.overlap(this.player, this.landmarkGroup, (player, landmark) => {
                 my.sprite.landmarkLabel.text = landmark.name;
                 this.landmarkTouching = true;
             });
        }

        console.log(this);
    }

    update() {
         if (!this.rectMode && this.playerMade) {
             this.player.update();

             if (!this.landmarkTouching) {
                 my.sprite.landmarkLabel.text = "";
             }
             this.landmarkTouching = false;
        }

        //Input-----------------------------------------------
        if (Phaser.Input.Keyboard.JustDown(my.regenKey)) {
            my.seed = Math.random();
            this.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(my.shiftSmall)) {
            this.frequency -= 0.01;
            this.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(my.shiftBig)) {
            this.frequency += 0.01;
            this.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(my.rectKey)) {
            this.rectMode = !this.rectMode;
            this.restart();
        }
    }

    /*Gets step
    Just sets base steps for all tiles
    Steps get equally distributed between max noise val of the tile map and min noise val
    In theory this makes highs and lows slightly more prominent, and modular
    */
    firstPass() {
        for (let i = 0; i < this.map_width; i++) {//X
            for (let j = 0; j < this.map_height; j++) {
                if (this.rectMode) {
                    this.add.rectangle(i * my.gridsize, j* my.gridsize, my.gridsize, my.gridsize, Phaser.Display.Color.GetColor((((1 - this.tile_map.grid[j][i]) / 2) * 255), (((1 - this.tile_map.grid[j][i]) / 2) * 255), (((1 - this.tile_map.grid[j][i]) / 2) * 255)));//(16777215 * this.tile_grid[j][i])
                }
                this.tile_map.giveStep(i, j);
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

                this.generateDeco(cur_pos, key);

            }
        }
    }

    //Restart and redraw
    restart() {
        if (this.player !== undefined) {
            this.player.setActive(false);
            this.player.destroy();
        }
        this.playerMade = false;
        this.scene.restart();
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

    //generates decorations and landmarks
    generateDeco(cur_pos, tile_type_key) {
        //Draw decoration or landmark
        const deco_chance = 5;
        const landmark_chance = 8;
        //chance to draw deco, if draw deco 46% deco1, 46% deco2, 8% landmark, but only if not water
        if (this.rng.integerInRange(0, 99) < deco_chance) {
            const deco = this.rng.integerInRange(0, 99);
            if (deco < landmark_chance && tile_type_key !== "water") {
                const new_deco = this.add.sprite(cur_pos.x * my.gridsize, cur_pos.y*my.gridsize, "landmark");
                new_deco.setDepth(this.LANDMARK_DEPTH);
                this.physics.world.enable(new_deco, Phaser.Physics.Arcade.STATIC_BODY);
                this.landmarkGroup.add(new_deco);
                new_deco.name = this.generateNames(this.tile_map.getTileValAt(cur_pos));
                //Places player at first landmark
                if (!this.playerMade) {
                    this.playerMade = true;
                    this.player = new Player(this, cur_pos.x * my.gridsize, cur_pos.y*my.gridsize, "person");
                    this.player.setDepth(this.PLAYER_DEPTH);
                }
            } else {
                const new_deco = this.add.sprite(cur_pos.x * my.gridsize, cur_pos.y*my.gridsize, tile_type_key + "Deco" + this.rng.integerInRange(1, this.type_of_decos));
            }
        }
    }
}
