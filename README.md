# Space Invaders 2D Game

A classic 2D Space Invaders game built with HTML5 Canvas and vanilla JavaScript.

## How to Play

1. Open `index.html` in any modern web browser
2. Press **ENTER** to start the game
3. Use **LEFT** and **RIGHT** arrow keys to move your spaceship
4. Press **SPACEBAR** to shoot at the invading aliens
5. Destroy all aliens to advance to the next level
6. Avoid getting hit by alien bullets or letting aliens reach your position
7. You have 3 lives - game ends when all lives are lost

## Game Features

- **Classic Gameplay**: Faithful recreation of the iconic Space Invaders experience
- **Progressive Difficulty**: Enemies get faster and more aggressive each level
- **Scoring System**: Different enemy types award different points
  - Small (red) enemies: 30 points
  - Medium (orange) enemies: 20 points
  - Large (yellow) enemies: 10 points
- **Visual Effects**: Explosion particles and smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Lives System**: 3 lives with game over when depleted

## Controls

| Key | Action |
|-----|--------|
| ← → | Move spaceship left/right |
| SPACEBAR | Shoot bullets |
| ENTER | Start game / Restart after game over |

## Game Mechanics

- **Player Movement**: Smooth left/right movement within screen boundaries
- **Shooting**: Limited fire rate to prevent bullet spam
- **Enemy Behavior**: 
  - Move in formation across the screen
  - Drop down when reaching screen edges
  - Speed increases as they advance
  - Random shooting at player
- **Collision Detection**: Precise collision between bullets, enemies, and player
- **Level Progression**: New waves of enemies spawn after clearing all enemies

## Technical Details

- Built with vanilla JavaScript (ES6+)
- HTML5 Canvas for rendering
- CSS3 for styling and responsive design
- No external dependencies
- 60 FPS smooth gameplay

## File Structure

```
├── index.html      # Main HTML file with game structure
├── style.css       # CSS styling and responsive design
├── game.js         # Complete game logic and mechanics
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3

Tested on:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

The game is fully contained in three files and requires no build process or external dependencies. Simply open `index.html` in a browser to play.

To modify the game:
- Edit `game.js` for gameplay mechanics
- Edit `style.css` for visual styling
- Edit `index.html` for structure and UI elements

## License

This project is open source and available under the MIT License.