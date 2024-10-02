class MapScene extends Phaser.Scene {
    constructor() {
        super("mapScene")
    }
    map_width = 20;
    map_height = 15;
    tile_grid = Array.apply(0, Array(this.map_height)).map(e => Array(this.map_width));
    frequency = .2;//.2

    max_num = -1; //-1
    min_num = 1;//1
    steps = 4; //water, sand, grass, swamp
    threshold = (this.max_num - this.min_num) / this.steps;
    bounds_of_tiles = Array.apply(null, Array(this.step));//array of vals to correlate with each tile, step(x) relates to noiseval < b_o_t(x)
    tile_image_keys = ["water", "sand", "grass", "swamp"];

    preload() {
        //Seed
        noise.seed(1);//1

        //Get noise for pos i, j
        for (let i = 0; i < this.map_width; i++){
            for (let j = 0; j < this.map_height; j++){
                let cur_noise = noise.perlin2(i * this.frequency, j * this.frequency);
                this.tile_grid[j][i] = new Tile(cur_noise);
                if (cur_noise < this.min_num) {
                    this.min_num = cur_noise;
                } else if (cur_noise > this.max_num) {
                    this.max_num = cur_noise;
                }
            }
        }

        //Get tile val bounds
        //this.bounds_of_tiles[this.steps - 1] = this.max_num;
        this.threshold = (this.max_num - this.min_num) / this.steps;
        //for (let i = this.steps - 1; i > 0 - 1; i--){
        //    this.bounds_of_tiles[(this.steps - 1) - i] = this.max_num - (i * step_size); // y = mx +b => step_bound = max - step_size(step) => step = (max - step_bound)/step_size
        //}                                                                               //((.506 - )
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(.5, .5);
        let draw_size = my.gridsize;
        console.log(this.tile_grid);

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

                //Determine sprite
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

            if (L === -2) {
                queue.push(new Vector2(i-1, j));
                this.tile_grid[j][i - 1].step = cur_tile.step - 1;
                L = -1;
            } else if (L === 2) {
                queue.push(new Vector2(i, j));
                cur_tile.step = cur_tile.step + 1;
                L = 1;
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

            if (T === -2) {
                queue.push(new Vector2(i, j-1));
                this.tile_grid[j-1][i].step = cur_tile.step - 1;
                T = -1;
            } else if (T === 2) {
                queue.push(new Vector2(i, j));
                cur_tile.step = cur_tile.step + 1;
                T = 1;
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
                    } else if (this.tile_grid[j-1][i-1].step === -1) {
                        TL = ( this.getStep(this.tile_grid[j-1][i-1].noise_val) - cur_tile.step);
                        queue.push(new Vector2(i-1, j-1));
                        this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                    } else {
                        TL = (this.getStep(this.tile_grid[j-1][i-1].noise_val) - cur_tile.step);
                        if (TL === 1) {
                            TL = Math.max(L, T);
                        } else if (TL === -1) {
                            TL = Math.min(L, T);
                        }
                    }

                }

            if (TL === -2) {
                queue.push(new Vector2(i-1, j-1));
                this.tile_grid[j-1][i-1].step = cur_tile.step - 1;
                TL = -1;
            } else if (TL === 2) {
                queue.push(new Vector2(i, j));
                cur_tile.step = cur_tile.step + 1;
                TL = 1;
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

                if (R === -2) {
                    queue.push(new Vector2(i+1, j));
                    this.tile_grid[j][i+1].step = cur_tile.step - 1;
                    R = -1;
                } else if (R === 2) {
                    queue.push(new Vector2(i, j));
                    cur_tile.step = cur_tile.step + 1;
                    R = 1;
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

                if (TR === -2) {
                    this.tile_grid[j-1][i+1].step = cur_tile.step - 1;
                    queue.push(new Vector2(i+1, j-1));
                    TR = -1;
                }  else if (TR === 2) {
                    queue.push(new Vector2(i, j));
                    cur_tile.step = cur_tile.step + 1;
                    TR = 1;
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

                if (B === -2) {
                    queue.push(new Vector2(i, j+1));
                    this.tile_grid[j+1][i].step = cur_tile.step - 1;
                    B = -1;
                }  else if (B === 2) {
                    queue.push(new Vector2(i, j));
                    cur_tile.step = cur_tile.step + 1;
                    B = 1;
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

                if (BL === -2) {
                    this.tile_grid[j+1][i-1].step = cur_tile.step - 1;
                    queue.push(new Vector2(i-1, j+1));
                    BL = -1;
                }  else if (BL === 2) {
                    queue.push(new Vector2(i, j));
                    cur_tile.step = cur_tile.step + 1;
                    BL = 1;
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

                if (BR === -2) {
                    queue.push(new Vector2(i+1, j+1));
                    this.tile_grid[j+1][i+1].step = cur_tile.step -1;
                    BR = -1;
                }  else if (BR === 2) {
                    queue.push(new Vector2(i, j));
                    cur_tile.step = cur_tile.step + 1;
                    BR = 1;
                }



                //
            key = this.tile_image_keys[cur_tile.step];
            let new_tile = this.add.sprite(i * 64, j*64, key + "O");
                //let rect = this.add.rectangle(i * draw_size, j*draw_size, draw_size, draw_size, Phaser.Display.Color.GetColor((((1 - this.tile_grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_grid[j][i].noise_val) / 2) * 255)));//(16777215 * this.tile_grid[j][i])


            }
        //}

        console.log(this);
    }

    update() {


    }

    //Gets step
    getStep(noise_level) {
        return Math.min(Math.floor(((noise_level - this.min_num) / this.threshold)), this.steps - 1)
    }

    //Make sure no +2 or -2 in adjacent
    validateTile(pos) {
        let L = 0;
        if (x > 0) {
            L = this.tile_grid[j][i-1].step - tile_grid[j][i-1].step
        }
    }

}
