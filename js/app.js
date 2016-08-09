var NUMBER_OF_LANES = 3;
var NUMBER_OF_ENEMIES = 4;
var ENEMY_SPEED = 100;
var ENEMY_START_POSITION = -100;
var PLAYER_X_START_POSITION = 200;
var PLAYER_Y_START_POSITION = 400;
var PLAYER_SPEED = 100;
var canvasWidth = 505;
var canvasHeight = 606;

// The different lane positions for the bugs.
var Lanes = {
    lanePositions: [60, 140, 220]
};

// The possible direction for the player and bugs to go. Though the bugs only travel in one.
var Direction = {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
    NONE: 0
};

/* GameObject is the superclass for both the player and the enemies. It contains the information that
 * is shared across both classes and also the functions that are shared.
 */
var GameObject = function (sprite, startX, startY, speed, direction, tag, colliderWidth, colliderHeight) {
    this.sprite = sprite;
    this.x = startX;
    this.y = startY;
    this.speed = speed;
    this.currentDirection = direction;
    this.tag = tag;
    this.colliderWidth = colliderWidth;
    this.colliderHeight = colliderHeight;
};

// Handles all of the rendering for both subclasses.
GameObject.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handles all movement for both subclasses and also contains special rules for the player movement.
GameObject.prototype.move = function (deltaTime) {
    if (this.currentDirection === Direction.LEFT) {
        this.x = this.x - 1 * this.speed * deltaTime;
    }
    else if (this.currentDirection === Direction.RIGHT) {
        this.x = this.x + 1 * this.speed * deltaTime;
    }
    else if (this.currentDirection === Direction.UP) {
        this.y = this.y - 1 * this.speed * deltaTime;
    }
    else if (this.currentDirection === Direction.DOWN) {
        this.y = this.y + 1 * this.speed * deltaTime;
    }

    // Keeps the player from running off the screen
    if (this.tag === "Player") {
        if (this.x > 420) {
            this.x = 420;
        }
        else if (this.x < -10) {
            this.x = -10;
        }
        else if (this.y > 435) {
            this.y = 435;
        }
    }
};

// Enemies our player must avoid
var Enemy = function (sprite, startX, startY, speed, direction, tag, colliderWidth, colliderHeight) {
    GameObject.call(this, sprite, startX, startY, speed, direction, tag, colliderWidth, colliderHeight);
    this.tag = tag;
};
Enemy.prototype = Object.create(GameObject.prototype);
Enemy.prototype.constructor = Enemy;

/* Returns the collider object for the enemy. The collider object provides corrected
 * collider sides with offsets of the character to compensate for the transparent parts of
 * images.
 */
Enemy.prototype.getCollider = function () {
    return {
        left: this.x + 2,
        right: this.x + 2 + this.colliderWidth,
        top: this.y + 76,
        bottom: this.y + 76 + this.colliderHeight
    };
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// Also respawns the bug when it reaches the otherside of the canvas.
Enemy.prototype.update = function (dt) {
    this.move(dt);
    if (this.x > canvasWidth + 10) {
        this.respawn();
    }
};

// Moves the bug back to the start position and randomizes speed and lane.
Enemy.prototype.respawn = function () {
    this.x = ENEMY_START_POSITION;
    this.y = Lanes.lanePositions[Math.floor((Math.random() * 3))];
    this.speed = ENEMY_SPEED * Math.random();
};

// The playable character.
var Player = function (sprite, startX, startY, speed, direction, tag, colliderWidth, colliderHeight) {
    GameObject.call(this, sprite, startX, startY, speed, direction, tag, colliderWidth, colliderHeight);
};
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

/* Returns the collider object for the player. The collider object provides corrected
 * collider sides with offsets of the character to compensate for the transparent parts of
 * images.
 */
Player.prototype.getCollider = function () {
    return {
        left: this.x + 16,
        right: this.x + 16 + this.colliderWidth,
        top: this.y + 65,
        bottom: this.y + 65 + this.colliderHeight
    };
};

// Updates the player movement and determines if the player has won.
Player.prototype.update = function (dt) {
    this.move(dt);
    this.currentDirection = 0;
    this.handleInput(input.currentDirectionPressed);
    if (this.y < -10) {
        this.win();
    }
};

// Updates the current direction the players wants to go.
Player.prototype.handleInput = function (direction) {
    this.currentDirection = direction;
};

// Resets the game when the player has won.
Player.prototype.win = function () {
    for (var i = 0; i < allEnemies.length; i++) {
        allEnemies[i].respawn();
    }
    this.reset();
};

// Moves the player back to the starting position.
Player.prototype.reset = function () {
    this.x = PLAYER_X_START_POSITION;
    this.y = PLAYER_Y_START_POSITION;
};

// Keeps track of the current direction pressed.
var Input = function () {
    this.currentDirectionPressed = Direction.NONE;
};

// Handles input for when a key is pressed.
Input.prototype.keyDown = function (keyCode) {
    this.currentDirectionPressed = this.getDirection(keyCode);
};

// Handles input for when a key is released.
Input.prototype.keyUp = function (keyCode) {
    if (this.currentDirectionPressed === this.getDirection(keyCode)) {
        this.currentDirectionPressed = Direction.NONE;
    }
};

// Translates the allowed keys into directions.
Input.prototype.getDirection = function (keyCode) {
    var direction;
    if (keyCode === "up") {
        direction = Direction.UP;
    }
    else if (keyCode === "down") {
        direction = Direction.DOWN;
    }
    else if (keyCode === "left") {
        direction = Direction.LEFT;
    }
    else if (keyCode === "right") {
        direction = Direction.RIGHT;
    }
    return direction;
};

var input = new Input();
var player = new Player('images/char-boy.png', PLAYER_X_START_POSITION, PLAYER_Y_START_POSITION, PLAYER_SPEED, Direction.NONE, "Player", 68, 74);

//Declares all enemies and randomizes their lanes and speeds.
var allEnemies = [];
for (var i = 0; i < NUMBER_OF_ENEMIES; i++) {
    allEnemies.push(new Enemy('images/enemy-bug.png', ENEMY_START_POSITION, Lanes.lanePositions[Math.floor((Math.random() * NUMBER_OF_LANES))], ENEMY_SPEED * Math.random(), Direction.RIGHT, "Enemy", 96, 63));
}

// This listens for key presses and sends the keys to input.keyDown
document.addEventListener('keydown', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    input.keyDown(allowedKeys[e.keyCode]);
});

// This listens for key release and sends the keys to input.keyUp
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    input.keyUp(allowedKeys[e.keyCode]);
});
