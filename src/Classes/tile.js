class Tile {

    constructor(noise_val = NaN) {
        this.noise_val = noise_val;
        this.step = -1;
        this.stage = 0;//0, 1
        //Stores the difference (adjacent.stage - self.stage) for each surrounding tile
        //I want to believe there is a better way to do tiling
        this.adjacencies = [ //difs
            NaN, NaN, NaN, //0, 1, 2, // TL, T, TR  //TL, T, TR, L, This, R, BL, B, BR
            NaN, 0, NaN,   // 3,   4 // L, skip, R
            NaN, NaN, NaN // 5, 6, 7  // BL, B, BR
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
    //Should probably be a lookup table --DONE
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

    //Gets the actual coords from the given position (pos)
    getAdjCoords(pos, adjIndex)  {
        return pos.add(this.getAdjVec(adjIndex));
    }
}

