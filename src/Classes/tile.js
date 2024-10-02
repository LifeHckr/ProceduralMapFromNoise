class Tile {

    constructor(noise_val = NaN) {
        this.noise_val = noise_val;
        this.step = -1;
        this.stage = 0;//0, 1
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}