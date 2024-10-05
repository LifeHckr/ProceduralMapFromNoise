class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 100;
        //Physics
        this.setBodySize(16, 16);
        scene.waterCollider = scene.physics.add.collider(this, scene.waterGroup);

    }

    update() {
        if (my.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
        } else if (my.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
        } else {
            this.body.setVelocityX(0);
        }

        if (my.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (my.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        } else {
            this.body.setVelocityY(0);
        }

        if (my.shiftKey.isDown) {
            this.speed = 200;
        } else {
            this.speed = 100;
        }
    }
}