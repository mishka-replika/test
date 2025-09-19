class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        
        // Game settings
        this.enemySpeed = 1;
        this.enemyDirection = 1;
        this.enemyDropDistance = 20;
        this.lastEnemyShot = 0;
        this.enemyShootRate = 1000; // milliseconds
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Initialize game
        this.initializeGame();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Enter') {
                if (this.gameState === 'start' || this.gameState === 'gameOver') {
                    this.startGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    initializeGame() {
        // Create player
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5,
            lastShot: 0,
            shootRate: 250
        };
        
        // Create enemies
        this.createEnemies();
    }
    
    createEnemies() {
        this.enemies = [];
        const rows = 5;
        const cols = 10;
        const enemyWidth = 40;
        const enemyHeight = 30;
        const spacing = 60;
        const startX = (this.canvas.width - (cols * spacing)) / 2;
        const startY = 80;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    type: row < 2 ? 'small' : row < 4 ? 'medium' : 'large',
                    points: row < 2 ? 30 : row < 4 ? 20 : 10
                });
            }
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.enemySpeed = 1;
        this.enemyDirection = 1;
        
        this.initializeGame();
        this.updateUI();
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateEnemyBullets();
        this.updateParticles();
        this.checkCollisions();
        this.checkGameState();
    }
    
    updatePlayer() {
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Player shooting
        if (this.keys['Space'] && Date.now() - this.player.lastShot > this.player.shootRate) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: -8
            });
            this.player.lastShot = Date.now();
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    
    updateEnemies() {
        if (this.enemies.length === 0) return;
        
        // Check if enemies need to change direction
        let changeDirection = false;
        for (let enemy of this.enemies) {
            if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
                changeDirection = true;
                break;
            }
        }
        
        if (changeDirection) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                enemy.y += this.enemyDropDistance;
            });
            this.enemySpeed *= 1.1; // Increase speed when dropping
        }
        
        // Move enemies
        this.enemies.forEach(enemy => {
            enemy.x += this.enemySpeed * this.enemyDirection;
        });
        
        // Enemy shooting
        if (Date.now() - this.lastEnemyShot > this.enemyShootRate) {
            if (this.enemies.length > 0) {
                const shooter = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2 - 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 8,
                    speed: 3
                });
                this.lastEnemyShot = Date.now();
            }
        }
    }
    
    updateEnemyBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.enemies[j])) {
                    this.createExplosion(this.enemies[j].x + this.enemies[j].width / 2, 
                                       this.enemies[j].y + this.enemies[j].height / 2);
                    this.score += this.enemies[j].points;
                    this.enemies.splice(j, 1);
                    this.bullets.splice(i, 1);
                    this.updateUI();
                    break;
                }
            }
        }
        
        // Enemy bullets vs player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.isColliding(this.enemyBullets[i], this.player)) {
                this.createExplosion(this.player.x + this.player.width / 2, 
                                   this.player.y + this.player.height / 2);
                this.enemyBullets.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameState = 'gameOver';
                    document.getElementById('gameOverScreen').classList.remove('hidden');
                    document.getElementById('finalScore').textContent = this.score;
                }
                break;
            }
        }
        
        // Enemies reaching player
        for (let enemy of this.enemies) {
            if (enemy.y + enemy.height >= this.player.y) {
                this.gameState = 'gameOver';
                document.getElementById('gameOverScreen').classList.remove('hidden');
                document.getElementById('finalScore').textContent = this.score;
                break;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
            });
        }
    }
    
    checkGameState() {
        if (this.enemies.length === 0) {
            // Level completed - create new enemies with increased difficulty
            this.createEnemies();
            this.enemySpeed *= 1.2;
            this.enemyShootRate *= 0.9;
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars background
        this.drawStars();
        
        if (this.gameState === 'playing') {
            this.drawPlayer();
            this.drawBullets();
            this.drawEnemies();
            this.drawEnemyBullets();
            this.drawParticles();
        }
    }
    
    drawStars() {
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player details
        this.ctx.fillStyle = '#008800';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, this.player.width - 10, this.player.height - 10);
        
        // Draw cannon
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x + this.player.width / 2 - 3, this.player.y - 8, 6, 8);
    }
    
    drawBullets() {
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            // Different colors for different enemy types
            switch (enemy.type) {
                case 'small':
                    this.ctx.fillStyle = '#ff0000';
                    break;
                case 'medium':
                    this.ctx.fillStyle = '#ff8800';
                    break;
                case 'large':
                    this.ctx.fillStyle = '#ffff00';
                    break;
            }
            
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Add enemy details
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
            
            // Add eyes
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x + 10, enemy.y + 8, 4, 4);
            this.ctx.fillRect(enemy.x + enemy.width - 14, enemy.y + 8, 4, 4);
        });
    }
    
    drawEnemyBullets() {
        this.ctx.fillStyle = '#ff0000';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
        });
        this.ctx.globalAlpha = 1;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new SpaceInvaders();
});