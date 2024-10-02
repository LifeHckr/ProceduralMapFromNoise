class MapScene extends Phaser.Scene {
    constructor() {
        super("mapScene")
    }
    map_width = 20;
    map_height = 15;
    tile_grid = Array.apply(0, Array(this.map_height)).map(e => Array(this.map_width));
    frequency = .3;//.2

    max_num = -1; //-1
    min_num = 1;//1
    steps = 4; //water, sand, grass, swamp
    threshold = (this.max_num - this.min_num) / this.steps;
    bounds_of_tiles = Array.apply(null, Array(this.step));//array of vals to correlate with each tile, step(x) relates to noiseval < b_o_t(x)
    tile_image_keys = ["water", "sand", "grass", "swamp"];

    preload() {
        //Seed
        noise.seed(8);//1

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

        //Pass one get basic tiles
            //For each tile
        for (let i = 0; i < this.map_width; i++){//X
            for (let j = 0; j < this.map_height; j++){ //(((1 - this.tile_grid[j][i]) / 2) * 255) //Y

                //Setting vars
                let key = this.tile_image_keys[this.steps -1];
                let cur_tile = this.tile_grid[j][i];

                //Get step
                if (cur_tile.step === -1) {
                    cur_tile.step = this.getStep(cur_tile.noise_val);
                }
                key = this.tile_image_keys[cur_tile.step];

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
                    L = Math.sign(this.getStep(this.tile_grid[j][i-1].noise_val) - cur_tile.step);
                    if (this.tile_grid[j][i-1].step === -1) {
                        this.tile_grid[j][i - 1].step = cur_tile.step + L;
                    } else {
                        L = Math.sign(this.tile_grid[j][i-1].step - cur_tile.step);
                    }
                } else {
                    L = 0;
                }

                //Get pos dif of top tile
                if (j !== 0){
                    T = Math.sign(this.getStep(this.tile_grid[j-1][i].noise_val) - cur_tile.step);
                    if (this.tile_grid[j-1][i].step === -1){
                        this.tile_grid[j-1][i].step = cur_tile.step + T;
                    } else {
                        T = Math.sign(this.tile_grid[j-1][i].step - cur_tile.step);
                    }
                } else {
                    T = 0;
                }

                //TL corner
                if (L === T) { // orthog are same, make corner same
                    TL = L;
                    if (i !== 0 && j !== 0 && this.tile_grid[j-1][i-1].step === -1) {
                        this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                    }
                } else if (Math.abs(L - T) === 2) { // one up and one down, orientation doesn't matter?
                    TL = 0;
                    if (i !== 0 && j !== 0 && this.tile_grid[j-1][i-1].step === -1) { //hmm
                        this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                    }
                } else { //dif is one, take its val
                    if (i === 0 || j === 0) {
                        TL = 0;
                    } else if (this.tile_grid[j-1][i-1].step === -1) {
                        TL = Math.sign( this.getStep(this.tile_grid[j-1][i-1].noise_val) - cur_tile.step);
                        this.tile_grid[j-1][i-1].step = cur_tile.step + TL;
                    } else {
                        TL = Math.sign(this.getStep(this.tile_grid[j-1][i-1].noise_val) - cur_tile.step);
                        if (TL === 1) {
                            TL = Math.max(L, T);
                        } else if (TL === -1) {
                            TL = Math.min(L, T);
                        }
                    }

                }

                //Get pos dif of right tile
                if (i < this.map_width - 1){
                    R = Math.sign(this.getStep(this.tile_grid[j][i+1].noise_val) - cur_tile.step);
                    if (this.tile_grid[j][i+1].step === -1){
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
                         //console.log(i + " " + j + " " + cur_tile.step + " " + T + " " + R);
                         //console.log(this.tile_grid[j-1][i+1].step);
                     }
                } else if (Math.abs(R - T) === 2) { // one up and one down, orientation doesn't matter?
                     TR = 0;
                     if (i < this.map_width - 1 && j !== 0 && this.tile_grid[j-1][i+1].step === -1) { //hmm
                         this.tile_grid[j-1][i+1].step = cur_tile.step + TR;
                     }
                } else { //dif is one, take its val
                    if (i === this.map_width - 1 || j === 0) {
                        TR = 0;
                     } else if (this.tile_grid[j-1][i+1].step === -1) {
                          TR = Math.sign(this.getStep(this.tile_grid[j-1][i+1].noise_val) - cur_tile.step);
                          this.tile_grid[j-1][i+1].step = cur_tile.step + TR;
                      } else {
                        TR = Math.sign(this.getStep(this.tile_grid[j-1][i+1].noise_val) - cur_tile.step);
                        if (TR === 1) {
                            TR = Math.max(R, T);
                        } else if (TR === -1) {
                            TR = Math.min(R, T);
                        }
                      }
                }

                //Get pos dif of bottom tile
                if (j < this.map_height - 1){
                    B = Math.sign(this.getStep(this.tile_grid[j+1][i].noise_val) - cur_tile.step);
                    if (this.tile_grid[j+1][i].step === -1){
                        this.tile_grid[j+1][i].step = cur_tile.step + B;
                     } else {
                         B = Math.sign(this.tile_grid[j+1][i].step - cur_tile.step);
                        if (i === 0 && j === 5) {
                            console.log("spooky " +B + " " + this.tile_grid[j+1][i].step + " " + cur_tile.step);
                        }
                     }
                } else {
                    B = 0;
                }

                if (i === 0 && j === 5) {
                    console.log("spooky" +B + " " + this.tile_grid[j+1][i].step + " " + cur_tile.step);
                }

                //BL corner
                if (L === B) { // orthog are same, make corner same
                    BL = L;
                    if (i > 0 && j < this.map_height - 1 && this.tile_grid[j+1][i-1].step === -1) {
                        this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    }
                } else if (Math.abs(L - B) === 2) { // one up and one down, orientation doesn't matter?
                    BL = 0;
                    if (i !== 0 && j < this.map_height - 1 && this.tile_grid[j+1][i-1].step === -1) { //hmm
                        this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    }
                } else { //dif is one, take its val
                    if (i === 0 || j === this.map_height - 1) {
                        BL = 0;
                    } else if (this.tile_grid[j+1][i-1].step === -1) {
                        BL = Math.sign(this.getStep(this.tile_grid[j+1][i-1].noise_val) - cur_tile.step);
                        this.tile_grid[j+1][i-1].step = cur_tile.step + BL;
                    } else {
                        BL = Math.sign(this.getStep(this.tile_grid[j+1][i-1].noise_val) - cur_tile.step);
                        if (BL === 1) {
                            BL = Math.max(L, B);
                        } else if (BL === -1) {
                            BL = Math.min(L, B);
                        }
                    }
                }

                //BR corner

                console.log(i + " " + j + " " + cur_tile.step + " " + B + " " + R);

                if (R === B) { // orthog are same, make corner same
                    BR = R;
                    if (i < this.map_width - 1 && j < this.map_height - 1 && this.tile_grid[j+1][i+1].step === -1) {
                        this.tile_grid[j+1][i+1].step = cur_tile.step + BR;
                    }
                } else if (Math.abs(R - B) === 2) { // one up and one down, orientation doesn't matter?
                     BR = 0;
                     if (i < this.map_width - 1 && j < this.map_height - 1 && this.tile_grid[j+1][i+1].step === -1) { //hmm
                         this.tile_grid[j+1][i+1].step = cur_tile.step + BR;
                     }
                 } else { //dif is one, take its val
                     if (i === this.map_width - 1 || j === this.map_height - 1) {
                         BR = 0;
                     } else if (this.tile_grid[j+1][i+1].step === -1) {
                         BR = Math.sign(this.getStep(this.tile_grid[j+1][i+1].noise_val) - cur_tile.step);
                         if (BR === 1) {
                              BR = Math.max(R, B);
                          } else if (BR === -1) {
                              BR = Math.min(R, B);
                          }
                         this.tile_grid[j+1][i+1].step = cur_tile.step + BR;
                     } else {
                         BR = Math.sign(this.getStep(this.tile_grid[j+1][i+1].noise_val) - cur_tile.step);
                     }
                 }
                console.log(BR);



                // if (this.tile_grid[13][2].step !== -1) {
                //     console.log(j + " " + i);
                //     console.log(cur_tile.noise_val);
                //     console.log(cur_tile.step);
                //     console.log(this.tile_grid[13][2].step);
                // }


                //
                let new_tile = this.add.sprite(i * 64, j*64, key + "O");
                //let rect = this.add.rectangle(i * draw_size, j*draw_size, draw_size, draw_size, Phaser.Display.Color.GetColor((((1 - this.tile_grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_grid[j][i].noise_val) / 2) * 255), (((1 - this.tile_grid[j][i].noise_val) / 2) * 255)));//(16777215 * this.tile_grid[j][i])


            }
        }

        console.log(this);
    }

    update() {


    }

    //Gets step
    getStep(noise_level) {
        return Math.min(Math.floor(((noise_level - this.min_num) / this.threshold)), this.steps - 1)
    }

}
