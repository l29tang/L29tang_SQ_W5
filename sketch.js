// ============================================================
// Maze Game with Your Custom Character Sprite
// ============================================================

// ------------------------------------------------------------
// CHARACTER SPRITE CONFIG (from your Example 1)
// ------------------------------------------------------------
const SPRITE = {
  frameWidth:  100,
  frameHeight: 150,
  numFrames:   4,
  animSpeed:   20,
  scale:       0.33,

  rows: {
    down:  0,
    up:    1,
    right: 3,
    left:  2,
  },

  offsets: {
    down:  { x: 0, y: 0 },
    up:    { x: 0, y: 0 },
    right: { x: 0, y: 0 },
    left:  { x: 0, y: 0 },
  },
};

// ------------------------------------------------------------
// COIN SPRITE CONFIG
// ------------------------------------------------------------
const COIN = {
  frameWidth:  50,
  frameHeight: 400,
  numFrames:   8,
  animSpeed:   5,
  scale:       0.5,
};

const TILE_SIZE = 60;

// ------------------------------------------------------------
// MAZE LAYOUT
// ------------------------------------------------------------
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 3, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 3, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TILE_COLORS = {
  0: [40,  40,  50 ],
  1: [60, 180, 90],   // <-- green walls
  2: [40,  40,  50 ],
  3: [40,  40,  50 ],
  4: [60,  100, 80 ],
};


// ------------------------------------------------------------
// PLAYER (updated hitbox for your sprite)
// ------------------------------------------------------------
let player = {
  x: 0,
  y: 0,
  speed: 2,
  currentFrame: 0,
  frameTimer:   0,
  direction:    "down",
  isMoving:     false,

  hw: 16,
  hh: 25,
};


let coins = [];
let coinsCollected = 0;
let gameWon = false;

// Images
let characterSheet;
let coinSheet;
let backgroundImg;

// ============================================================
// preload()
// ============================================================
function preload() {
  characterSheet = loadImage("assets/images/good.png");
  coinSheet      = loadImage("assets/images/use.png");
}

// ============================================================
// setup()
// ============================================================
function setup() {
  createCanvas(TILE_SIZE * MAZE[0].length, TILE_SIZE * MAZE.length);
  imageMode(CENTER);

  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      let tile = MAZE[row][col];

      if (tile === 2) {
        player.x = col * TILE_SIZE + TILE_SIZE / 2;
        player.y = row * TILE_SIZE + TILE_SIZE / 2;
      }

      if (tile === 3) {
        coins.push({
          x:          col * TILE_SIZE + TILE_SIZE / 2,
          y:          row * TILE_SIZE + TILE_SIZE / 2,
          frame:      floor(random(COIN.numFrames)),
          frameTimer: 0,
          collected:  false,
        });
      }
    }
  }
}

// ============================================================
// draw()
// ============================================================
function draw() {
  background(20);

  drawMaze();
  updateCoins();
  drawCoins();
  handleInput();
  resolveWallCollisions();
  checkCoinCollection();
  checkExit();
  animateSprite();
  drawCharacter();
  drawHUD();

  if (gameWon) {
    drawWinScreen();
  }
}

// ------------------------------------------------------------
// drawMaze()
// ------------------------------------------------------------
function drawMaze() {
  rectMode(CORNER);
  noStroke();

  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      let tile = MAZE[row][col];

      if (tile === 4) {
        if (coinsCollected === coins.length) {
          fill(30, 200, 120);
        } else {
          fill(60, 100, 80);
        }
      } else {
        let c = TILE_COLORS[tile];
        fill(c[0], c[1], c[2]);
      }

      rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

// ------------------------------------------------------------
// updateCoins()
// ------------------------------------------------------------
function updateCoins() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;

    coins[i].frameTimer++;
    if (coins[i].frameTimer >= COIN.animSpeed) {
      coins[i].frameTimer = 0;
      coins[i].frame = (coins[i].frame + 1) % COIN.numFrames;
    }
  }
}

// ------------------------------------------------------------
// drawCoins()
// ------------------------------------------------------------
function drawCoins() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;

    let coin = coins[i];
    let sx = coin.frame * COIN.frameWidth;
    let dw = COIN.frameWidth  * COIN.scale;
    let dh = COIN.frameHeight * COIN.scale;

    image(coinSheet, coin.x, coin.y, dw, dh, sx, 0, COIN.frameWidth, COIN.frameHeight);
  }
}

// ------------------------------------------------------------
// handleInput()
// ------------------------------------------------------------
function handleInput() {
  if (gameWon) return;

  player.isMoving = false;

  if (keyIsDown(87)) {
    player.y -= player.speed;
    player.direction = "up";
    player.isMoving = true;
  }
  if (keyIsDown(83)) {
    player.y += player.speed;
    player.direction = "down";
    player.isMoving = true;
  }
  if (keyIsDown(65)) {
    player.x -= player.speed;
    player.direction = "left";
    player.isMoving = true;
  }
  if (keyIsDown(68)) {
    player.x += player.speed;
    player.direction = "right";
    player.isMoving = true;
  }
}

// ------------------------------------------------------------
// resolveWallCollisions()
// ------------------------------------------------------------
function resolveWallCollisions() {
  let corners = [
    { x: player.x - player.hw, y: player.y - player.hh },
    { x: player.x + player.hw, y: player.y - player.hh },
    { x: player.x - player.hw, y: player.y + player.hh },
    { x: player.x + player.hw, y: player.y + player.hh },
  ];

  for (let i = 0; i < corners.length; i++) {
    let c = corners[i];
    let col = floor(c.x / TILE_SIZE);
    let row = floor(c.y / TILE_SIZE);

    if (row < 0 || row >= MAZE.length || col < 0 || col >= MAZE[0].length) continue;

    if (MAZE[row][col] === 1) {
      let tileLeft   = col * TILE_SIZE;
      let tileRight  = tileLeft + TILE_SIZE;
      let tileTop    = row * TILE_SIZE;
      let tileBottom = tileTop + TILE_SIZE;

      let overlapLeft   = (player.x + player.hw) - tileLeft;
      let overlapRight  = tileRight  - (player.x - player.hw);
      let overlapTop    = (player.y + player.hh) - tileTop;
      let overlapBottom = tileBottom - (player.y - player.hh);

      let minOverlap = min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if      (minOverlap === overlapLeft)   player.x -= overlapLeft;
      else if (minOverlap === overlapRight)  player.x += overlapRight;
      else if (minOverlap === overlapTop)    player.y -= overlapTop;
      else if (minOverlap === overlapBottom) player.y += overlapBottom;
    }
  }
}

// ------------------------------------------------------------
// checkCoinCollection()
// ------------------------------------------------------------
function checkCoinCollection() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].collected) continue;

    let d = dist(player.x, player.y, coins[i].x, coins[i].y);
    if (d < TILE_SIZE * 0.6) {
      coins[i].collected = true;
      coinsCollected++;
    }
  }
}

// ------------------------------------------------------------
// checkExit()
// ------------------------------------------------------------
function checkExit() {
  if (coinsCollected < coins.length) return;

  for (let row = 0; row < MAZE.length; row++) {
    for (let col = 0; col < MAZE[row].length; col++) {
      if (MAZE[row][col] === 4) {
        let exitX = col * TILE_SIZE + TILE_SIZE / 2;
        let exitY = row * TILE_SIZE + TILE_SIZE / 2;
        if (dist(player.x, player.y, exitX, exitY) < TILE_SIZE * 0.6) {
          gameWon = true;
        }
      }
    }
  }
}

// ------------------------------------------------------------
// animateSprite()
// ------------------------------------------------------------
function animateSprite() {
  if (player.isMoving) {
    player.frameTimer++;

    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer = 0;
      player.currentFrame = (player.currentFrame + 1) % SPRITE.numFrames;
    }
  } else {
    player.currentFrame = 0;
    player.frameTimer   = 0;
  }
}

// ------------------------------------------------------------
// drawCharacter()
// ------------------------------------------------------------
function drawCharacter() {
  let row    = SPRITE.rows[player.direction];
  let offset = SPRITE.offsets[player.direction];

  let sx = (player.currentFrame * SPRITE.frameWidth)  + offset.x;
  let sy = (row                 * SPRITE.frameHeight) + offset.y;

  let dw = SPRITE.frameWidth  * SPRITE.scale;
  let dh = SPRITE.frameHeight * SPRITE.scale;

  image(characterSheet, player.x, player.y, dw, dh, sx, sy, SPRITE.frameWidth, SPRITE.frameHeight);
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT);
  textFont("monospace");
  text("Coins: " + coinsCollected + " / " + coins.length, 10, 20);

  if (coinsCollected === coins.length) {
    fill(30, 200, 120);
    text("Exit is open! Find the green tile.", 10, 40);
  }
}

// ------------------------------------------------------------
// drawWinScreen()
// ------------------------------------------------------------
function drawWinScreen() {
  fill(255, 0, 0, 160);
  rectMode(CORNER);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(50);
  text("You're the real Mario!", width / 2, height / 2 - 20);

  textSize(16);
  fill(180);
  text("All coins collected", width / 2, height / 2 + 20);
}
