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

    max_num = -1; //-1
    min_num = 1;//1
    threshold = (this.max_num - this.min_num) / this.steps;
    tile_image_keys = ["water", "water", "sand", "grass", "swamp"];

    preload() {
        //Seed
        this.seed = 3;
        //Noise for grid
        this.tile_map.populateGrid(this.seed, this.frequency);
        if (this.rectMode) {
            my.gridsize = 64;
        }
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(.25, .25).setScroll(this.map_width * my.gridsize / 2, this.map_height * my.gridsize / 2);
        console.log(this.tile_map);

        this.firstPass();
        if (!this.rectMode) {
            this.tile_map.populateAdjacencies();
            this.secondPass();
        }


        console.log(this);
    }

    update() {


    }

    //Gets step
    //Just sets base steps for all tiles
    firstPass() {
        for (let i = 0; i < this.map_width; i++) {//X
            for (let j = 0; j < this.map_height; j++) {
                this.tile_map.giveStep(i, j);
                //let key = this.tile_image_keys[this.tile_map.getStep(i, j)];
                //let new_tile = this.add.sprite(i * 64, j*64, key + "O");
                if (this.rectMode) {
                    let rect = this.add.rectangle(i * my.gridsize, j* my.gridsize, my.gridsize, my.gridsize, Phaser.Display.Color.GetColor((((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_map.grid[j][i].noise_val) / 2) * 255)));//(16777215 * this.tile_grid[j][i])
                }
            }
        }
    }

    //Evens out less even changes, e.g. tiles adjacent when the step dif is > 2, with a better tileset I could ignore this
    secondPass() {
        //let test_vec = this.tile_map.ohGodOhNoAhh(-1);
        // while (test_vec !== null) {
        //     let cur_tile = this.tile_map.grid[test_vec.y][test_vec.x];
        //     for (let m = 0; m < 9; m++) {
        //         let adj_val = cur_tile.adjacencies[m];
        //         if (adj_val < -1) {
        //             let adj_vec = test_vec.add(cur_tile.getAdjVec(m));
        //              //Get tile at adj
        //              let adj_tile = this.tile_map.grid[adj_vec.y][adj_vec.x];
        //              //Push it up
        //              adj_tile.step += 1;
        //             this.tile_map.updateAllAdjacenciesHelp(adj_vec.x, adj_vec.y);
        //             console.log("hi")
        //         }
        //     }
        //
        //     test_vec = this.tile_map.ohGodOhNoAhh(-1);
        // }
        let queue = [];
        for (let k = 0; k < this.map_width; k++){//X
            for (let l = 0; l < this.map_height; l++) {
                queue.push(new Vector2(k, l));
                while (queue.length > 0) {
                    let cur_pos = queue.pop();
                    let i = cur_pos.x;
                    let j = cur_pos.y;
                    let cur_tile = this.tile_map.grid[j][i];

                    for (let m = 0; m < 9; m++) {
                        this.tile_map.updateAdjacencies(i, j);

                        let adj_val = cur_tile.adjacencies[m];
                        if (adj_val < -1) {
                            let adj_vec = cur_pos.add(cur_tile.getAdjVec(m));
                             //Get tile at adj
                             let adj_tile = this.tile_map.grid[adj_vec.y][adj_vec.x];
                             //Push it up
                             adj_tile.step += 1;
                             //Queue
                             queue.push(adj_vec);
                            this.tile_map.updateAdjacencies(adj_vec.x, adj_vec.y);
                        }
                    }
                    let key = this.tile_image_keys[cur_tile.step];
                    let new_tile = this.add.sprite(i * my.gridsize, j*my.gridsize, key + "O");
                }

            }
        }
    }

    //Fix big jumps between tiles
    // applySecondPassRules(cur_pos, cur_tile, m, queue) {
    //     let  j = cur_pos.y;
    //     let i = cur_pos.x;
    //     let adj_val = cur_tile.adjacencies[m];
    //     if (adj_val > 1) {
    //         this.tile_map.grid[j][i].step += 1;
    //         this.tile_map.updateAllAdjacenciesHelp(i, j);
    //         queue.push(cur_pos);
    //     } else if (adj_val < -1) {
    //         let lower_tile = cur_tile.getAdjVec(m);
    //         console.log(i + " " + j + " " + m + " " + cur_tile.step + " " + adj_val);
    //         queue.push(new Vector2(cur_pos.x + lower_tile.x, cur_pos.y + lower_tile.y));
    //         this.tile_map.grid[i + lower_tile.x][j + lower_tile.y].step += 1;
    //         this.tile_map.updateAllAdjacenciesHelp(i + lower_tile.x, j + lower_tile.y);
    //     }
    // }

    //First pass, basic map
    oldfirstPass() {
        let queue = [];
        queue.push(new Vector2(0 ,0));
        //Pass one get basic tiles
        //For each tile
        //for (let i = 0; i < this.map_width; i++){//X
        //for (let j = 0; j < this.map_height; j++){ //(((1 - this.tile_grid[j][i]) / 2) * 255) //Y
        while (queue.length > 0) {
            let cur_pair = queue.pop();
            let i = cur_pair.x;
            let j = cur_pair.y;
            //Setting vars
            let key = this.tile_image_keys[this.steps -1];
            let cur_tile = this.tile_grid[j][i];

            //Get step
            if (cur_tile.step === -1) {
                cur_tile.step = this.getStep(cur_tile.noise_val);
            }

            //State matching
            let L = NaN;
            let T = NaN;
            let TL = NaN;
            let R = NaN;
            let TR = NaN;
            let B = NaN;
            let BR = NaN;
            let BL = NaN;
            //Get positional dif of left tile
            if (i !== 0){
                L = (this.getStep(this.tile_grid[j][i-1].noise_val) - cur_tile.step);
                if (this.tile_grid[j][i-1].step === -1) {
                    queue.push(new Vector2(i-1, j));
                    this.tile_grid[j][i - 1].step = cur_tile.step + L;
                } else {
                    L = (this.tile_grid[j][i-1].step - cur_tile.step);
                }
            } else {
                L = 0;
            }

            //Get pos dif of top tile
            if (j !== 0){
                T = (this.getStep(this.tile_grid[j-1][i].noise_val) - cur_tile.step);
                if (this.tile_grid[j-1][i].step === -1){
                    queue.push(new Vector2(i, j-1));
                    this.tile_grid[j-1][i].step = cur_tile.step + T;
                } else {
                    T = (this.tile_grid[j-1][i].step - cur_tile.step);
                }
            } else {
                T = 0;
            }

            //TL corner
            if (L === T) { // orthog are same, make corner same
                TL = L;
                if (i !== 0 && j !== 0) {
                    this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                    queue.push(new Vector2(i-1, j-1));
                }
            } else if (Math.abs(L - T) === 2) { // one up and one down, orientation doesn't matter?
                TL = 0;
                if (i !== 0 && j !== 0 && this.tile_grid[j-1][i-1].step === -1) { //hmm
                    queue.push(new Vector2(i-1, j-1));
                    this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                }
            } else { //dif is one, take its val
                if (i === 0 || j === 0) {
                    TL = 0;
                } else if (this.tile_grid[j - 1][i - 1].step === -1) {
                    TL = (this.getStep(this.tile_grid[j - 1][i - 1].noise_val) - cur_tile.step);
                    queue.push(new Vector2(i - 1, j - 1));
                    this.tile_grid[j - 1][i - 1].step = cur_tile.step + TL;
                } else {
                    TL = (this.getStep(this.tile_grid[j - 1][i - 1].noise_val) - cur_tile.step);
                    if (TL === 1) {
                        TL = Math.max(L, T);
                    } else if (TL === -1) {
                        TL = Math.min(L, T);
                    }
                }

            }

            //Get pos dif of right tile
            if (i < this.map_width - 1){
                R = (this.getStep(this.tile_grid[j][i+1].noise_val) - cur_tile.step);
                if (this.tile_grid[j][i+1].step === -1){
                    queue.push(new Vector2(i+1, j));
                    this.tile_grid[j][i+1].step = cur_tile.step + R;
                } else {
                    R = Math.sign(this.tile_grid[j][i+1].step - cur_tile.step);
                }
            } else {
                R = 0;
            }

            //TR corner
            if (R === T) { // orthog are same, make corner same
                TR = R;
                if (i < this.map_width - 1 && j !== 0 && this.tile_grid[j-1][i+1].step === -1) {
                    this.tile_grid[j-1][i+1].step = cur_tile.step + TR;
                    queue.push(new Vector2(i+1, j-1));
                }
            } else if (Math.abs(R - T) === 2) { // one up and one down, orientation doesn't matter?
                TR = 0;
                if (i < this.map_width - 1 && j !== 0 && this.tile_grid[j-1][i+1].step === -1) { //hmm
                    queue.push(new Vector2(i+1, j-1));
                    this.tile_grid[j-1][i+1].step = cur_tile.step + TR;
                }
            } else { //dif is one, take its val
                if (i === this.map_width - 1 || j === 0) {
                    TR = 0;
                } else if (this.tile_grid[j-1][i+1].step === -1) {
                    TR = (this.getStep(this.tile_grid[j-1][i+1].noise_val) - cur_tile.step);
                    this.tile_grid[j-1][i+1].step = cur_tile.step + TR;
                    queue.push(new Vector2(i+1, j-1));
                } else {
                    TR = (this.getStep(this.tile_grid[j-1][i+1].noise_val) - cur_tile.step);
                    if (TR === 1) {
                        TR = Math.max(R, T);
                    } else if (TR === -1) {
                        TR = Math.min(R, T);
                    }
                }
            }

            //Get pos dif of bottom tile
            if (j < this.map_height - 1){
                B = (this.getStep(this.tile_grid[j+1][i].noise_val) - cur_tile.step);
                if (this.tile_grid[j+1][i].step === -1){
                    queue.push(new Vector2(i, j+1));
                    this.tile_grid[j+1][i].step = cur_tile.step + B;
                } else {
                    B = (this.tile_grid[j+1][i].step - cur_tile.step);
                }
            } else {
                B = 0;
            }

            //BL corner
            if (L === B) { // orthog are same, make corner same
                BL = L;
                if (i > 0 && j < this.map_height - 1 && this.tile_grid[j+1][i-1].step === -1) {
                    this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    queue.push(new Vector2(i-1, j+1));
                }
            } else if (Math.abs(L - B) === 2) { // one up and one down, orientation doesn't matter?
                BL = 0;
                if (i !== 0 && j < this.map_height - 1 && this.tile_grid[j+1][i-1].step === -1) { //hmm
                    this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    queue.push(new Vector2(i-1, j+1));
                }
            } else { //dif is one, take its val
                if (i === 0 || j === this.map_height - 1) {
                    BL = 0;
                } else if (this.tile_grid[j+1][i-1].step === -1) {
                    BL = (this.getStep(this.tile_grid[j+1][i-1].noise_val) - cur_tile.step);
                    this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    queue.push(new Vector2(i-1, j+1));
                } else {
                    BL = (this.getStep(this.tile_grid[j+1][i-1].noise_val) - cur_tile.step);
                    if (BL === 1) {
                        BL = Math.max(L, B);
                    } else if (BL === -1) {
                        BL = Math.min(L, B);
                    }
                }
            }

            //BR corner
            if (Math.sign(R) === Math.sign(B)) { // orthog are same, make corner same
                BR = R;
                if (i < this.map_width - 1 && j < this.map_height - 1 && this.tile_grid[j+1][i+1].step === -1) {
                    queue.push(new Vector2(i+1, j+1));
                    this.tile_grid[j+1][i+1].step = cur_tile.step + Math.sign(BR);
                }
            } else if (Math.abs(Math.sign(R) - Math.sign(B)) === 2) { // one up and one down, orientation doesn't matter?
                BR = 0;
                if (i < this.map_width - 1 && j < this.map_height - 1 && this.tile_grid[j+1][i+1].step === -1) { //hmm
                    queue.push(new Vector2(i+1, j+1));
                    this.tile_grid[j+1][i+1].step = cur_tile.step + BR;
                }
            } else { //dif is one, take its val
                if (i === this.map_width - 1 || j === this.map_height - 1) {
                    BR = 0;
                } else if (this.tile_grid[j+1][i+1].step === -1) {
                    BR = (this.getStep(this.tile_grid[j+1][i+1].noise_val) - cur_tile.step);
                    if (Math.sign(BR) === 1) {
                        BR = Math.max(Math.sign(R), Math.sign(B));
                    } else if (Math.sign(BR) === -1) {
                        BR = Math.min(Math.sign(R), Math.sign(B));
                    }
                    queue.push(new Vector2(i+1, j+1));
                    this.tile_grid[j+1][i+1].step = cur_tile.step + Math.sign(BR);
                } else {
                    BR = (this.getStep(this.tile_grid[j+1][i+1].noise_val) - cur_tile.step);
                }
            }



            //
            key = this.tile_image_keys[cur_tile.step];
            let new_tile = this.add.sprite(i * 64, j*64, key + "O");

        }

    }

    oldsecondPass() {
        let queue = []
        for (let k = 0; k < this.map_width; k++){//X
            for (let l = 0; l < this.map_height; l++) {
                queue.push(new Vector2(k, l));
                while (queue.length > 0) {
                    let cur_pos = queue.pop();
                    let i = cur_pos.x;
                    let j = cur_pos.y;
                    let cur_tile = this.tile_grid[j][i];

                    let L = 0;
                    if (i > 0) {
                        L = this.tile_grid[j][i - 1].step - cur_tile.step;
                    }
                    if (L > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (L < -1) {
                        queue.push(new Vector2(i - 1, j));
                        this.tile_grid[j][i - 1].step += 1;
                    }

                    let R = 0;
                    if (i < this.map_width - 1) {
                        R = this.tile_grid[j][i + 1].step - cur_tile.step;
                    }
                    if (R > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (R < -1) {
                        queue.push(new Vector2(i + 1, j));
                        this.tile_grid[j][i + 1].step += 1;
                    }

                    let T = 0;
                    if (j > 0) {
                        T = this.tile_grid[j - 1][i].step - cur_tile.step;
                    }
                    if (T > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (T < -1) {
                        queue.push(new Vector2(i, j-1));
                        this.tile_grid[j-1][i].step += 1;
                    }

                    let B = 0;
                    if (j < this.map_height - 1) {
                        B = this.tile_grid[j + 1][i].step - cur_tile.step;
                    }
                    if (B > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (B < -1) {
                        queue.push(new Vector2(i, j+1));
                        this.tile_grid[j+1][i].step += 1;
                    }

                    let BL = 0;
                    if (j < this.map_height - 1 && i > 0) {
                        BL = this.tile_grid[j + 1][i-1].step - cur_tile.step;
                    }
                    if (BL > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (BL < -1) {
                        queue.push(new Vector2(i-1, j+1));
                        this.tile_grid[j+1][i-1].step += 1;
                    }

                    let BR = 0;
                    if (j < this.map_height - 1 && i < this.map_width - 1) {
                        BR = this.tile_grid[j + 1][i+1].step - cur_tile.step;
                    }
                    if (BR > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (BR < -1) {
                        queue.push(new Vector2(i+1, j+1));
                        this.tile_grid[j+1][i+1].step += 1;
                    }

                    let TL = 0;
                    if (j > 0 && i > 0) {
                        TL = this.tile_grid[j - 1][i-1].step - cur_tile.step;
                    }
                    if (TL > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (TL < -1) {
                        queue.push(new Vector2(i-1, j-1));
                        this.tile_grid[j-1][i-1].step += 1;
                    }

                    let TR = 0;
                    if (j > 0 && i < this.map_width - 1) {
                        TR = this.tile_grid[j - 1][i+1].step - cur_tile.step;
                    }
                    if (TR > 1) {
                        cur_tile.step += 1;
                        queue.push(new Vector2(i, j));
                    } else if (TR < -1) {
                        queue.push(new Vector2(i+1, j-1));
                        this.tile_grid[j-1][i+1].step += 1;
                    }



                    let key = this.tile_image_keys[cur_tile.step];
                    let new_tile = this.add.sprite(i * 64, j*64, key + "O");


                }
            }
        }
    }

}
