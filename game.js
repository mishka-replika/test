// Game Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'win'
let score = 0;
let lives = 3;
let gameSpeed = 1;

// Game Objects
let player = {};
let bullets = [];
let invaders = [];
let invaderBullets = [];
let explosions = [];

// Input State
const keys = {};

// Game Settings
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const INVADER_BULLET_SPEED = 3;
const INVADER_SPEED = 1;
const INVADER_DROP_SPEED = 20;

// Initialize Game
function init() {
    // Player setup
    player = {
        x: CANVAS_WIDTH / 2 - 25,
        y: CANVAS_HEIGHT - 60,
        width: 50,
        height: 30,
        speed: PLAYER_SPEED
    };

    // Reset arrays
    bullets = [];
    invaders = [];
    invaderBullets = [];
    explosions = [];

    // Create invader formation
    createInvaders();
    
    // Reset game state
    score = 0;
    lives = 3;
    gameSpeed = 1;
    updateUI();
}

// Create Invader Formation
function createInvaders() {
    const rows = 5;
    const cols = 10;
    const invaderWidth = 40;
    const invaderHeight = 30;
    const spacing = 20;
    const startX = 80;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            invaders.push({
                x: startX + col * (invaderWidth + spacing),
                y: startY + row * (invaderHeight + spacing),
                width: invaderWidth,
                height: invaderHeight,
                type: row < 2 ? 'small' : row < 4 ? 'medium' : 'large'
            });
        }
    }
}

// Game Loop
function gameLoop() {
    if (gameState === 'playing') {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

// Update Game Logic
function update() {
    // Update player
    updatePlayer();
    
    // Update bullets
    updateBullets();
    
    // Update invaders
    updateInvaders();
    
    // Update invader bullets
    updateInvaderBullets();
    
    // Update explosions
    updateExplosions();
    
    // Check collisions
    checkCollisions();
    
    // Check win/lose conditions
    checkGameState();
}

// Update Player
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed;
    }
}

// Update Bullets
function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        return bullet.y > 0;
    });
}

// Update Invaders
function updateInvaders() {
    if (invaders.length === 0) return;

    let moveDown = false;
    let direction = getInvaderDirection();

    // Check if any invader hits the edge
    for (let invader of invaders) {
        if ((direction > 0 && invader.x + invader.width >= CANVAS_WIDTH) ||
            (direction < 0 && invader.x <= 0)) {
            moveDown = true;
            break;
        }
    }

    // Move invaders
    for (let invader of invaders) {
        if (moveDown) {
            invader.y += INVADER_DROP_SPEED;
        } else {
            invader.x += direction * INVADER_SPEED * gameSpeed;
        }
    }

    // Invaders shoot randomly
    if (Math.random() < 0.002) {
        shootInvaderBullet();
    }
}

// Get Invader Movement Direction
function getInvaderDirection() {
    // Simple back-and-forth movement
    return Math.floor(Date.now() / 1000) % 2 === 0 ? 1 : -1;
}

// Shoot Invader Bullet
function shootInvaderBullet() {
    if (invaders.length === 0) return;
    
    const randomInvader = invaders[Math.floor(Math.random() * invaders.length)];
    invaderBullets.push({
        x: randomInvader.x + randomInvader.width / 2 - 2,
        y: randomInvader.y + randomInvader.height,
        width: 4,
        height: 10
    });
}

// Update Invader Bullets
function updateInvaderBullets() {
    invaderBullets = invaderBullets.filter(bullet => {
        bullet.y += INVADER_BULLET_SPEED;
        return bullet.y < CANVAS_HEIGHT;
    });
}

// Update Explosions
function updateExplosions() {
    explosions = explosions.filter(explosion => {
        explosion.timer--;
        return explosion.timer > 0;
    });
}

// Check Collisions
function checkCollisions() {
    // Player bullets vs Invaders
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = invaders.length - 1; j >= 0; j--) {
            if (collision(bullets[i], invaders[j])) {
                // Create explosion
                createExplosion(invaders[j].x + invaders[j].width / 2, invaders[j].y + invaders[j].height / 2);
                
                // Update score based on invader type
                const points = invaders[j].type === 'small' ? 30 : invaders[j].type === 'medium' ? 20 : 10;
                score += points;
                
                // Remove bullet and invader
                bullets.splice(i, 1);
                invaders.splice(j, 1);
                
                updateUI();
                break;
            }
        }
    }

    // Invader bullets vs Player
    for (let i = invaderBullets.length - 1; i >= 0; i--) {
        if (collision(invaderBullets[i], player)) {
            createExplosion(player.x + player.width / 2, player.y + player.height / 2);
            invaderBullets.splice(i, 1);
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameState = 'gameOver';
                showGameOver(false);
            }
        }
    }

    // Invaders vs Player (collision)
    for (let invader of invaders) {
        if (collision(invader, player)) {
            gameState = 'gameOver';
            showGameOver(false);
            return;
        }
        
        // Check if invaders reached bottom
        if (invader.y + invader.height >= CANVAS_HEIGHT - 100) {
            gameState = 'gameOver';
            showGameOver(false);
            return;
        }
    }
}

// Collision Detection
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Create Explosion
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        timer: 20
    });
}

// Check Game State
function checkGameState() {
    if (invaders.length === 0) {
        gameState = 'win';
        showGameOver(true);
    }
}

// Render Game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars background
    drawStars();

    // Draw player
    drawPlayer();

    // Draw bullets
    drawBullets();

    // Draw invaders
    drawInvaders();

    // Draw invader bullets
    drawInvaderBullets();

    // Draw explosions
    drawExplosions();
}

// Draw Stars Background
function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
    }
}

// Draw Player
function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 10, player.y + 5, 30, 5);
    ctx.fillRect(player.x + 20, player.y - 5, 10, 10);
}

// Draw Bullets
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Draw Invaders
function drawInvaders() {
    for (let invader of invaders) {
        // Set color based on type
        ctx.fillStyle = invader.type === 'small' ? '#ff00ff' : 
                       invader.type === 'medium' ? '#ff6600' : '#ff0000';
        
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        
        // Draw invader details
        ctx.fillStyle = '#fff';
        ctx.fillRect(invader.x + 5, invader.y + 5, 8, 8);
        ctx.fillRect(invader.x + 27, invader.y + 5, 8, 8);
        ctx.fillRect(invader.x + 15, invader.y + 15, 10, 5);
    }
}

// Draw Invader Bullets
function drawInvaderBullets() {
    ctx.fillStyle = '#ff0000';
    for (let bullet of invaderBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Draw Explosions
function drawExplosions() {
    ctx.fillStyle = '#ffff00';
    for (let explosion of explosions) {
        const size = explosion.timer;
        ctx.fillRect(explosion.x - size/2, explosion.y - size/2, size, size);
    }
}

// Shoot Bullet
function shootBullet() {
    if (gameState !== 'playing') return;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10
    });
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Show Game Over
function showGameOver(isWin) {
    const gameOverDiv = document.getElementById('gameOver');
    const gameOverText = document.getElementById('gameOverText');
    
    if (isWin) {
        gameOverText.textContent = 'You Win!';
        gameOverDiv.classList.add('win');
    } else {
        gameOverText.textContent = 'Game Over!';
        gameOverDiv.classList.remove('win');
    }
    
    gameOverDiv.classList.remove('hidden');
}

// Hide Game Over
function hideGameOver() {
    document.getElementById('gameOver').classList.add('hidden');
}

// Start Game
function startGame() {
    gameState = 'playing';
    init();
    hideGameOver();
}

// Pause Game
function pauseGame() {
    gameState = gameState === 'paused' ? 'playing' : 'paused';
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Button Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Initialize and Start Game Loop
init();
gameLoop();