class TileMap {
    constructor(width, height, steps) {
        this.width = width;
        this.height = height;
        this.steps = steps;
        this.threshold = 0;
        this.populated = false;
        this.min_num = 1;
        this.max_num = -1;
        this.grid = Array.apply(0, Array(height)).map(e => Array(width));
    }

    populateGrid(seed, frequency) {
        noise.seed(seed);
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                let cur_noise = noise.perlin2(i * frequency, j * frequency);
                this.grid[j][i] = new Tile(cur_noise);
                if (cur_noise < this.min_num) {
                    this.min_num = cur_noise;
                } else if (cur_noise > this.max_num) {
                    this.max_num = cur_noise;
                }
            }
        }
        this.populated = true;
        this.threshold = (this.max_num - this.min_num) / this.steps;
    }

    giveStep(i, j) {
        if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
            let tile = this.grid[j][i];
            let step = this.findStep(tile.noise_val);
            tile.step = step;
            return step;
        } else {
            return NaN;
        }
    }

    findStep(noise_level) {
        return Math.min(Math.floor(((noise_level - this.min_num) / this.threshold)), this.steps - 1);
    }

    getStep(i, j) {
        if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
            return this.grid[j][i].step;
        } else {
            return NaN;
        }
    }

    //Gets adjacencies for tiling, needs map to be populated first, sets both at the same time (x -> y) and (y <- x)
    populateAdjacencies() {
        if (!this.populated) {
            throw new Error("Grid has not been populated!");
        }
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++) {
                this.updateAllAdjacenciesHelp(i, j);
            }
        }
    }

    //Given the tile at i, j updates the adjacencies around it, assuming all are being updated sequentially, for efficiency
    updateAllAdjacenciesHelp(i, j) {
        if (!this.populated) {
            throw new Error("Grid has not been populated!");
        }
            let curTile = this.grid[j][i];
            //Edges
            //TL + L + BL i do this slightly redundantly
            if (i === 0) {
                curTile.adjacencies[0] = 0;
                curTile.adjacencies[3] = 0;
                curTile.adjacencies[6] = 0;
            }
            //TL + T + TR i do this slightly redundantly
            if (j === 0) {
                curTile.adjacencies[0] = 0;
                curTile.adjacencies[1] = 0;
                curTile.adjacencies[2] = 0;
            }
            //TR + R + BR i do this slightly redundantly
            if (i === this.width -1) {
                curTile.adjacencies[2] = 0;
                curTile.adjacencies[5] = 0;
                curTile.adjacencies[8] = 0;

            } else {
                //Get right
                curTile.adjacencies[5] = this.grid[j][i+1].step - curTile.step;
                this.grid[j][i+1].adjacencies[3] = curTile.step - this.grid[j][i+1].step;
            }
            //BL + B + BR i do this slightly redundantly
            if (j === this.height-1) {
                curTile.adjacencies[6] = 0;
                curTile.adjacencies[7] = 0;
                curTile.adjacencies[8] = 0;

            } else {
                //Get bottom
                curTile.adjacencies[7] = this.grid[j+1][i].step - curTile.step;
                this.grid[j+1][i].adjacencies[1] = curTile.step - this.grid[j+1][i].step;
            }
            //Main stuff, since I do both, central tiles only need to get TR, R, BR, and B
            //BR
            if (i < this.width-1 && j < this.height-1) {
                curTile.adjacencies[8] = this.grid[j+1][i+1].step - curTile.step;
                this.grid[j+1][i+1].adjacencies[0] = curTile.step - this.grid[j+1][i+1].step;
            }
            //TR
            if (i < this.width-1 && j > 0) {
                curTile.adjacencies[2] = this.grid[j-1][i+1].step - curTile.step;
                this.grid[j-1][i+1].adjacencies[6] = curTile.step - this.grid[j-1][i+1].step;
            }

    }

    updateAdjacencies(i, j) {
        if (!this.populated) {
            throw new Error("Grid has not been populated!");
        }
        let curTile = this.grid[j][i];
        //Edges
    //L
        if (i !== 0) {
            curTile.adjacencies[4] = this.grid[j][i-1].step - curTile.step;
            this.grid[j][i-1].adjacencies[6] = curTile.step - this.grid[j][i-1].step;
        }
    //T
        if (j !== 0) {
            curTile.adjacencies[1] = this.grid[j-1][i].step - curTile.step;
            this.grid[j-1][i].adjacencies[7] = curTile.step - this.grid[j-1][i].step;
        }
    //R
        if (i !== this.width -1)  {
            //Get right
            curTile.adjacencies[5] = this.grid[j][i+1].step - curTile.step;
            this.grid[j][i+1].adjacencies[3] = curTile.step - this.grid[j][i+1].step;
        }
    //B
        if (j !== this.height - 1) {
            curTile.adjacencies[7] = this.grid[j+1][i].step - curTile.step;
            this.grid[j+1][i].adjacencies[1] = curTile.step - this.grid[j+1][i].step;
        }

        //Main stuff, since I do both, central tiles only need to get TR, R, BR, and B
    //BR
        if (i < this.width-1 && j < this.height-1) {
            curTile.adjacencies[8] = this.grid[j+1][i+1].step - curTile.step;
            this.grid[j+1][i+1].adjacencies[0] = curTile.step - this.grid[j+1][i+1].step;
        }
    //BL
        if (i > 0 && j < this.height-1) {
            curTile.adjacencies[6] = this.grid[j+1][i-1].step - curTile.step;
            this.grid[j+1][i-1].adjacencies[2] = curTile.step - this.grid[j+1][i-1].step;
        }
    //TL
        if (i > 0 && j > 0) {
            curTile.adjacencies[0] = this.grid[j-1][i-1].step - curTile.step;
            this.grid[j-1][i-1].adjacencies[8] = curTile.step - this.grid[j-1][i-1].step;
        }
    //TR
        if (i < this.width-1 && j > 0) {
            curTile.adjacencies[2] = this.grid[j-1][i+1].step - curTile.step;
            this.grid[j-1][i+1].adjacencies[6] = curTile.step - this.grid[j-1][i+1].step;
        }
    }

    findAdjacencies() {
        if (!this.populated) {
            throw new Error("Grid has not been populated!");
        }

    }

    // ohGodOhNoAhh(match) {
    //     for(let i = 0; i < this.width; i++) {
    //         for (let j = 0; j < this.height; j++) {
    //             for (let k = 0; k < 9; k++) {
    //                 let check_val = this.grid[j][i].adjacencies[k];
    //                 if (check_val < match) {
    //                     return new Vector2(i, j);
    //                 }
    //             }
    //         }
    //     }

    //    return null;
    //}
}