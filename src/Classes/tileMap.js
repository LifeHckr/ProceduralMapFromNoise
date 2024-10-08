/*

A 2d array to hold a tile map

In built population of grid by noise
I base the threshold of each step based on the actual noise values received, to make it less likely for extremes to take
over or maps to be very monotonous

Threshold is the noise_val difference between each tile step
 */

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

    //Gives each tile a noise val
    //Also bookkeeping to find min, max and threshold
    populateGrid(seed, frequency) {
        noise.seed(seed);
        for (let i = 0; i < this.width; i++){
            for (let j = 0; j < this.height; j++){
                let cur_noise = noise.perlin2(i * frequency, j * frequency);
                this.grid[j][i] = cur_noise;
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

    //Returns the value in the gird at pos
    //-1 if tile is OOB
    getTileValAt(pos) {
        if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
            return -1;
        }
        return this.grid[pos.y][pos.x];
    }

    //Adds change to tile val at pos
    changeTileValAt(pos, change) {
        if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
            throw new Error(`Array out of bounds! Width: ${this.width} i: ${i} Height: ${this.height} j: ${j}`);
        }
        this.grid[pos.y][pos.x] += change;
    }

    //REPLACES each tiles noise value with its tile step
    //Based on threshold, min, and max, so map must be populated first
    giveStep(i, j) {
        if (!this.populated) {
            throw new Error("Tilemap has not been populated with noise!")
        }
        if (i < 0 || i >= this.width || j < 0 || j >= this.height) {
            throw new Error(`Array out of bounds! Width: ${this.width} i: ${i} Height: ${this.height} j: ${j}`);
        }
        this.grid[j][i] = this.findStep(this.grid[j][i]);
    }

    //Finds step val from the given noise and existing threshold
    findStep(noise_level) {
        if (!this.populated) {
            throw new Error("Tilemap has not been populated with noise!")
        }
        return Math.min(Math.floor(((noise_level - this.min_num) / this.threshold)), this.steps - 1);
    }

    //REMOVE
    updateAdjacencies(i, j) {
        if (!this.populated) {
            throw new Error("Grid has not been populated!");
        }
        let curTile = this.grid[j][i];
        //Edges
    //L
        if (i !== 0) {
            curTile.adjacencies[3] = this.grid[j][i-1].step - curTile.step;
            this.grid[j][i-1].adjacencies[5] = curTile.step - this.grid[j][i-1].step;
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

    //Returns a vector representing the pos change to get the coordinate change of the given adjacency
    //Should probably be a lookup table --DONE
    /*
    *       0, 1, 2
    *       3, tile, 4
    *       5, 6, 7
    * */
    getAdjVec(adjIndex /*between 0 and 7*/) {
        if (adjIndex < 0 || adjIndex > 7) {
            throw new Error("Adjacency out of bonds must be [0,7]!");
        }
        switch (adjIndex) {
            case 0:
                return new Vector2(-1, -1);
            case 1:
                return new Vector2(0, -1);
            case 2:
                return new Vector2(1, -1);
            case 3:
                return new Vector2(-1, 0);
            case 4:
                return new Vector2(1, 0);
            case 5:
                return new Vector2(-1, 1);
            case 6:
                return new Vector2(0, 1);
            case 7:
                return new Vector2(1, 1);
        }
    }

    //Gets the actual coords to adjindex from pos
    //E.g. tile above (adjIndex = 1) of (2, 2), returns (2, 1)
    //Does not check OOB's
    getAdjCoords(pos, adjIndex)  {
        return pos.add(this.getAdjVec(adjIndex));
    }

    //Returns the step difference between tile at pos, and tile ad adjIndex
    //Tile at pos must exist, but returns 0 if adj is OOB
    getAdjStepDif(pos, adjIndex) {
        let adjVal = this.getTileValAt(this.getAdjCoords(pos, adjIndex));
        if (adjVal === -1) {
            //adj tile is OOB
            return 0;
        }
        return adjVal - this.getTileValAt(pos);
    }

    /* Calcs a tiles tiling bitmask by (1 * upper) + (2 * right) + (4 * bottom) + (8*bottom)
        An adjacent tile is 0 if a dif tile, 1 if same tile
        Upper
    Left Tile   Right
        Bottom

    Using wacky javascript booleans to get 0 or 1
    */
    calcBitmask(pos) {
        return (1 * !(this.getAdjStepDif(pos, 1))) + (2* !(this.getAdjStepDif(pos, 4))) + (4* !(this.getAdjStepDif(pos, 6))) + (8* !(this.getAdjStepDif(pos, 3)));
    }


}

//I didn't need this, but it's easier after using Godot too much
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }
}