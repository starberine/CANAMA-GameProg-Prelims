var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/images/bg.png');
    this.load.image('ground', 'assets/images/plat.png');
    this.load.image('ground1', 'assets/images/platform.png');
    this.load.image('star', 'assets/images/Egg_item.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground1');
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();
    stars = this.physics.add.group({
        key: 'star',
        repeat: 4,
        setXY: {
            x: Phaser.Math.Between(100, 500),
            y: Phaser.Math.Between(100, 500),
            stepX: Phaser.Math.Between(50, 100)
        }
    });
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    bombs = this.physics.add.group();
    this.time.addEvent({
        delay: 15000,
        callback: spawnBomb,
        callbackScope: this,
        loop: true
    });
    scoreText = this.add.text(784, 16, 'Shells Collected: 0', { 
        fontSize: '32px', 
        fill: '#FFC0CB', 
        fontFamily: 'Butter', 
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000',
            blur: 1,
            stroke: false,
            fill: true
        }
    }).setOrigin(1, 0);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    if (gameOver) {
        return;
    }
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

var colors = ['0xff0000', '0xff7f00', '0xffff00', '0x00ff00', '0x0000ff', '0x4b0082', '0x9400d3'];
var currentColorIndex = 0;

function collectStar(player, star) {
    star.disableBody(true, true);
    player.setTint(parseInt(colors[currentColorIndex], 16));
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    score += 1;
    scoreText.setText('Shells Collected: ' + score);
    if (score >= 5 && score % 5 === 0) {
        player.setScale(player.scaleX * 1.1, player.scaleY * 1.1);
    }
    var x = Phaser.Math.Between(0, 800);
    var y = Phaser.Math.Between(0, 200);
    var newStar = stars.create(x, y, 'star');
    newStar.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function spawnBomb() {
    var x = Phaser.Math.Between(0, 800);
    var y = 1;
    var bomb = bombs.create(x, y, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    this.add.text(400, 300, 'Game Over', { 
        fontSize: '48px', 
        fill: '#FF0000', 
        fontFamily: 'Butter', 
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000',
            blur: 1,
            stroke: false,
            fill: true
        }
    }).setOrigin(0.5);
    player.setVisible(false);
}
