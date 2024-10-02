class MapScene extends Phaser.Scene {
    constructor() {
        super("mapScene")
    }
    map_width = 20;
    map_height = 15;
    tile_grid = Array.apply(0, Array(this.map_height)).map(e => Array(this.map_width));
    frequency = .2;

    max_num = -1; //-1
    min_num = 1;//1
    steps = 4; //water, sand, grass, swamp
    bounds_of_tiles = Array.apply(null, Array(this.step));//array of vals to correlate with each tile, step(x) relates to noiseval < b_o_t(x)
    tile_image_keys = ["waterO", "sandO", "grassO", "swampO"];

    preload() {
        //Seed
        noise.seed(1);

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
        this.bounds_of_tiles[this.steps - 1] = this.max_num;
        let step_size = (this.max_num - this.min_num) / this.steps
        for (let i = 0; i < this.steps - 1; i++){
            this.bounds_of_tiles[i] = this.min_num + ((i+1) * step_size);
        }
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setZoom(.5, .5);
        let draw_size = my.gridsize;
        console.log(this.tile_grid);

        //Pass one get basic tiles
        for (let i = 0; i < this.map_width; i++){
            for (let j = 0; j < this.map_height; j++){ //(((1 - this.tile_grid[j][i]) / 2) * 255)
                //let rect = this.add.rectangle(i * draw_size, j*draw_size, draw_size, draw_size, Phaser.Display.Color.GetColor((((1 - this.tile_grid[j][i]) / 2) * 255), (((1 - this.tile_grid[j][i]) / 2) * 255), (((1 - this.tile_grid[j][i]) / 2) * 255)));//(16777215 * this.tile_grid[j][i])





                let key = this.tile_image_keys[this.steps -1];
                let cur_noise_val = this.tile_grid[j][i].noise_val;
                let has_finished = false;

                for(let i = 0; i < this.steps && !has_finished; i++) {
                    if (cur_noise_val <= this.bounds_of_tiles[i]){
                        key = this.tile_image_keys[i]
                        has_finished = true;
                    }
                }
                let new_tile = this.add.sprite(i * 64, j*64, key);

            }
        }

        console.log(this);
    }

    update() {


    }

}