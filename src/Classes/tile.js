class Tile {

    constructor(noise_val = NaN) {
        this.noise_val = noise_val;
        this.step = -1;
        this.stage = 0;//0, 1
        //Stores the difference (adjacent.stage - self.stage) for each surrounding tile
        //I want to believe there is a better way to do tiling
        this.adjacencies = [ //difs
            NaN, NaN, NaN, //0, 1, 2, // TL, T, TR  //TL, T, TR, L, This, R, BL, B, BR
            NaN, 0, NaN,   // 3, 4, 5 // L, this, R
            NaN, NaN, NaN // 6, 7, 8  // BL, B, BR
        ]
        this.bitmask = 255;
    }

    matchPatterntoAdjacencies(pattern =  [null, null, null,
                                                null, null, null,
                                                null, null, null]) {
        for (let i = 0; i < 9; i++) {
            if (pattern[i] !== null && pattern[i] !== this.adjacencies[i]) {
                return false;
            }
        }
        return true;
    }

    //Returns a vector representing the pos change to get the coordinate change of the given adjacency
    //Should probably be a lookup table
    getAdjVec(adjIndex /*between 0 and 8*/) {
        let new_vec = new Vector2(0, 0);
        new_vec.x = (adjIndex % 3) - 1; //e.g. 0, 3, 6 -> left 1 (-1) 1, 4, 7 -> same col
        new_vec.y = Math.floor((adjIndex - 3) / 3); //e.g. 0, 1, 2 -> up 1 (-1) 6, 7, 8 -> right 1 (+1)
        return new_vec;
    }

    //Gets the actual coords from the given position (pos)
    getAdjCoords(adjIndex /*between 0 and 8*/, pos /*Vector2*/)  {
        let new_vec = this.getAdjVec(adjIndex);
        return pos.add(new_vec);
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }
}