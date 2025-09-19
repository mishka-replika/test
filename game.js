// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startButton = document.getElementById('startButton');
const gameMessage = document.getElementById('gameMessage');

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 5,
    color: '#00ff00'
};

// Bullets array
let bullets = [];

// Invaders array
let invaders = [];
let invaderDirection = 1; // 1 for right, -1 for left

// Game settings
const BULLET_SPEED = 7;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 10;
const INVADER_ROWS = 5;
const INVADER_COLS = 10;
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 20;
const INVADER_SPEED = 0.5;
const INVADER_DROP_SPEED = 15;

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Initialize invaders
function createInvaders() {
    invaders = [];
    for (let row = 0; row < INVADER_ROWS; row++) {
        for (let col = 0; col < INVADER_COLS; col++) {
            invaders.push({
                x: col * (INVADER_WIDTH + 10) + 50,
                y: row * (INVADER_HEIGHT + 10) + 50,
                width: INVADER_WIDTH,
                height: INVADER_HEIGHT,
                alive: true,
                color: row === 0 ? '#ff0000' : row === 1 ? '#ffff00' : '#00ffff'
            });
        }
    }
}

// Game initialization
function initGame() {
    score = 0;
    lives = 3;
    bullets = [];
    player.x = canvas.width / 2 - 25;
    invaderDirection = 1; // Reset invader direction
    createInvaders();
    updateUI();
    gameMessage.textContent = '';
    gameMessage.className = 'game-message';
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// Player movement and shooting
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['Space']) {
        shootBullet();
        keys['Space'] = false; // Prevent continuous shooting
    }
}

// Shoot bullet
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED,
        color: '#ffff00'
    });
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // Remove bullets that are off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Update invaders
function updateInvaders() {
    let shouldMoveDown = false;
    
    // Check if any invader hits the edge
    for (let invader of invaders) {
        if (invader.alive) {
            if ((invaderDirection > 0 && invader.x >= canvas.width - invader.width) ||
                (invaderDirection < 0 && invader.x <= 0)) {
                shouldMoveDown = true;
                break;
            }
        }
    }
    
    // Move invaders
    if (shouldMoveDown) {
        // Move all invaders down and reverse direction
        for (let invader of invaders) {
            if (invader.alive) {
                invader.y += INVADER_DROP_SPEED;
            }
        }
        invaderDirection *= -1; // Reverse direction
    } else {
        // Move all invaders horizontally
        for (let invader of invaders) {
            if (invader.alive) {
                invader.x += INVADER_SPEED * invaderDirection;
            }
        }
    }
}

// Collision detection
function checkCollisions() {
    // Bullet-invader collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = invaders.length - 1; j >= 0; j--) {
            if (invaders[j].alive && 
                bullets[i].x < invaders[j].x + invaders[j].width &&
                bullets[i].x + bullets[i].width > invaders[j].x &&
                bullets[i].y < invaders[j].y + invaders[j].height &&
                bullets[i].y + bullets[i].height > invaders[j].y) {
                
                // Hit!
                invaders[j].alive = false;
                bullets.splice(i, 1);
                score += 10;
                updateUI();
                break;
            }
        }
    }
    
    // Check if invaders reach player
    for (let invader of invaders) {
        if (invader.alive && invader.y + invader.height >= player.y) {
            lives--;
            updateUI();
            if (lives <= 0) {
                endGame(false);
            } else {
                // Reset invaders position
                createInvaders();
            }
            break;
        }
    }
}

// Check win condition
function checkWin() {
    const aliveInvaders = invaders.filter(invader => invader.alive);
    if (aliveInvaders.length === 0) {
        endGame(true);
    }
}

// End game
function endGame(won) {
    gameRunning = false;
    startButton.disabled = false;
    startButton.textContent = 'Start Game';
    
    if (won) {
        gameMessage.textContent = 'YOU WIN! All invaders destroyed!';
        gameMessage.className = 'game-message win';
    } else {
        gameMessage.textContent = 'GAME OVER! The invaders have invaded!';
        gameMessage.className = 'game-message lose';
    }
}

// Render functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw ship details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 20, player.y - 5, 10, 5);
    ctx.fillRect(player.x + 15, player.y + 10, 5, 10);
    ctx.fillRect(player.x + 30, player.y + 10, 5, 10);
}

function drawBullets() {
    ctx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawInvaders() {
    for (let invader of invaders) {
        if (invader.alive) {
            ctx.fillStyle = invader.color;
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            
            // Draw invader details
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(invader.x + 5, invader.y + 3, 3, 3);
            ctx.fillRect(invader.x + 22, invader.y + 3, 3, 3);
            ctx.fillRect(invader.x + 10, invader.y + 10, 10, 3);
        }
    }
}

function drawBackground() {
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 17 + Date.now() * 0.01) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Update
    updatePlayer();
    updateBullets();
    updateInvaders();
    checkCollisions();
    checkWin();
    
    // Render
    drawBackground();
    drawPlayer();
    drawBullets();
    drawInvaders();
    
    requestAnimationFrame(gameLoop);
}

// Start game function
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    startButton.disabled = true;
    startButton.textContent = 'Game Running...';
    
    initGame();
    gameLoop();
}

// Event listeners
startButton.addEventListener('click', startGame);

// Prevent spacebar from scrolling the page
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
    }
});

// Initialize the game display
initGame();
drawBackground();
drawPlayer();
drawInvaders();