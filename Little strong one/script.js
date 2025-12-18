// ============ GAME STATE ============
let gameState = {
    level: 1,
    grit: 50,
    moves: 0,
    player: { x: 1, y: 1 },
    map: [],
    mapWidth: 0,
    mapHeight: 0,
    gameOver: false,
    enemies: [],
    toxicSprays: [],
    pawTimer: 0,
    pawTarget: null
};

// ============ LEVEL CONFIGURATION ============
const LEVEL_CONFIG = {
    1: {
        name: "WET MARKET",
        width: 60,
        height: 20,
        walkable: [' ', '.'],
        wallChar: '#',
        floorChar: '.'
    },
    2: {
        name: "RESTAURANT KITCHEN",
        width: 50,
        height: 30,
        walkable: [' ', '.'],
        wallChar: '#',
        floorChar: '.'
    },
    3: {
        name: "THE BEDROOM",
        width: 40,
        height: 25,
        walkable: [' ', '.'],
        wallChar: '#',
        floorChar: '.'
    }
};

// ============ MAP GENERATION ============
function generateMap(levelNum) {
    const config = LEVEL_CONFIG[levelNum];
    if (!config) return;
    
    gameState.mapWidth = config.width;
    gameState.mapHeight = config.height;
    
    // Initialize empty map
    gameState.map = [];
    for (let y = 0; y < gameState.mapHeight; y++) {
        const row = [];
        for (let x = 0; x < gameState.mapWidth; x++) {
            row.push(' ');
        }
        gameState.map.push(row);
    }
    
    // Create border walls
    for (let y = 0; y < gameState.mapHeight; y++) {
        gameState.map[y][0] = '#';
        gameState.map[y][gameState.mapWidth - 1] = '#';
    }
    for (let x = 0; x < gameState.mapWidth; x++) {
        gameState.map[0][x] = '#';
        gameState.map[gameState.mapHeight - 1][x] = '#';
    }
    
    // Generate random rooms and corridors
    generateRooms(levelNum);
    
    // Place player at start
    gameState.player = findEmptyTile();
    
    // Place exit
    const exit = findEmptyTile();
    if (exit) {
        gameState.map[exit.y][exit.x] = 'E';
    }
    
    // Add food items
    addFoodItems(levelNum);
    
    // Initialize enemies
    initializeEnemies(levelNum);
}

function generateRooms(levelNum) {
    const config = LEVEL_CONFIG[levelNum];
    const numRooms = 5 + Math.floor(levelNum * 2);
    
    const rooms = [];
    
    for (let i = 0; i < numRooms; i++) {
        const roomWidth = 5 + Math.floor(Math.random() * 8);
        const roomHeight = 5 + Math.floor(Math.random() * 8);
        const x = 2 + Math.floor(Math.random() * (gameState.mapWidth - roomWidth - 4));
        const y = 2 + Math.floor(Math.random() * (gameState.mapHeight - roomHeight - 4));
        
        // Check if room overlaps with existing rooms
        let overlaps = false;
        for (let room of rooms) {
            if (x < room.x + room.w + 2 && x + roomWidth + 2 > room.x &&
                y < room.y + room.h + 2 && y + roomHeight + 2 > room.y) {
                overlaps = true;
                break;
            }
        }
        
        if (!overlaps) {
            rooms.push({ x, y, w: roomWidth, h: roomHeight });
            
            // Carve out room
            for (let ry = y; ry < y + roomHeight && ry < gameState.mapHeight - 1; ry++) {
                for (let rx = x; rx < x + roomWidth && rx < gameState.mapWidth - 1; rx++) {
                    if (ry > 0 && rx > 0) {
                        gameState.map[ry][rx] = config.floorChar;
                    }
                }
            }
        }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        const room1 = rooms[i];
        const room2 = rooms[i + 1];
        
        const center1X = Math.floor(room1.x + room1.w / 2);
        const center1Y = Math.floor(room1.y + room1.h / 2);
        const center2X = Math.floor(room2.x + room2.w / 2);
        const center2Y = Math.floor(room2.y + room2.h / 2);
        
        // Horizontal corridor
        const startX = Math.min(center1X, center2X);
        const endX = Math.max(center1X, center2X);
        for (let cx = startX; cx <= endX && cx < gameState.mapWidth - 1; cx++) {
            if (cx > 0 && center1Y > 0 && center1Y < gameState.mapHeight - 1) {
                gameState.map[center1Y][cx] = config.floorChar;
            }
        }
        
        // Vertical corridor
        const startY = Math.min(center1Y, center2Y);
        const endY = Math.max(center1Y, center2Y);
        for (let cy = startY; cy <= endY && cy < gameState.mapHeight - 1; cy++) {
            if (cy > 0 && center2X > 0 && center2X < gameState.mapWidth - 1) {
                gameState.map[cy][center2X] = config.floorChar;
            }
        }
    }
    
    // Add some random walls for obstacles
    for (let i = 0; i < numRooms * 2; i++) {
        const x = 1 + Math.floor(Math.random() * (gameState.mapWidth - 2));
        const y = 1 + Math.floor(Math.random() * (gameState.mapHeight - 2));
        if (gameState.map[y][x] === config.floorChar && 
            !(x === gameState.player.x && y === gameState.player.y)) {
            gameState.map[y][x] = '#';
        }
    }
}

function findEmptyTile() {
    const config = LEVEL_CONFIG[gameState.level];
    let attempts = 0;
    while (attempts < 1000) {
        const x = 1 + Math.floor(Math.random() * (gameState.mapWidth - 2));
        const y = 1 + Math.floor(Math.random() * (gameState.mapHeight - 2));
        if (config.walkable.includes(gameState.map[y][x])) {
            return { x, y };
        }
        attempts++;
    }
    return { x: 1, y: 1 };
}

function addFoodItems(levelNum) {
    const config = LEVEL_CONFIG[levelNum];
    const foodCount = 10 + levelNum * 5;
    
    for (let i = 0; i < foodCount; i++) {
        let attempts = 0;
        while (attempts < 100) {
            const x = 1 + Math.floor(Math.random() * (gameState.mapWidth - 2));
            const y = 1 + Math.floor(Math.random() * (gameState.mapHeight - 2));
            
            if (config.walkable.includes(gameState.map[y][x]) &&
                gameState.map[y][x] !== 'E' &&
                !(x === gameState.player.x && y === gameState.player.y)) {
                gameState.map[y][x] = '$';
                break;
            }
            attempts++;
        }
    }
    
    // Add giant food chunks
    if (levelNum <= 2) {
        const giantFoodCount = 2 + levelNum;
        for (let i = 0; i < giantFoodCount; i++) {
            let attempts = 0;
            while (attempts < 100) {
                const x = 1 + Math.floor(Math.random() * (gameState.mapWidth - 2));
                const y = 1 + Math.floor(Math.random() * (gameState.mapHeight - 2));
                
                if (config.walkable.includes(gameState.map[y][x]) &&
                    gameState.map[y][x] !== 'E' &&
                    !(x === gameState.player.x && y === gameState.player.y)) {
                    // Create a small cluster
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx > 0 && nx < gameState.mapWidth - 1 &&
                                ny > 0 && ny < gameState.mapHeight - 1 &&
                                config.walkable.includes(gameState.map[ny][nx]) &&
                                gameState.map[ny][nx] !== 'E') {
                                gameState.map[ny][nx] = 'F';
                            }
                        }
                    }
                    break;
                }
                attempts++;
            }
        }
    }
}

function initializeEnemies(levelNum) {
    gameState.enemies = [];
    const config = LEVEL_CONFIG[levelNum];
    
    if (levelNum === 1) {
        // Walking humans
        for (let i = 0; i < 3; i++) {
            const pos = findEmptyTile();
            if (pos) {
                gameState.enemies.push({
                    type: 'human',
                    x: pos.x,
                    y: pos.y,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    minX: Math.max(1, pos.x - 20),
                    maxX: Math.min(gameState.mapWidth - 2, pos.x + 20)
                });
            }
        }
    } else if (levelNum === 2) {
        // Scout ants
        for (let i = 0; i < 5; i++) {
            const pos = findEmptyTile();
            if (pos) {
                gameState.enemies.push({
                    type: 'ant',
                    x: pos.x,
                    y: pos.y,
                    targetX: pos.x,
                    targetY: pos.y,
                    moving: false
                });
            }
        }
    }
}

// ============ INITIALIZATION ============
function initGame() {
    try {
        console.log('Initializing game...');
        loadLevel(1);
        console.log('Level loaded, map size:', gameState.mapWidth, 'x', gameState.mapHeight);
        bindControls();
        updateUI();
        console.log('Game initialized successfully');
    } catch (e) {
        console.error('Game initialization error:', e);
        const mapEl = document.getElementById('game-map');
        if (mapEl) {
            mapEl.innerHTML = 'ERROR: ' + e.message + '<br>' + e.stack;
            mapEl.style.color = '#ff0000';
        }
    }
}

// Start game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function loadLevel(levelNum) {
    const config = LEVEL_CONFIG[levelNum];
    if (!config) {
        showMessage("GAME COMPLETE! YOU ASCENDED!");
        return;
    }
    
    gameState.level = levelNum;
    gameState.grit = 50;
    gameState.moves = 0;
    gameState.gameOver = false;
    gameState.enemies = [];
    gameState.toxicSprays = [];
    gameState.pawTimer = 0;
    gameState.pawTarget = null;
    
    // Generate procedural map
    generateMap(levelNum);
    
    render();
}

// ============ CONTROLS ============
function bindControls() {
    document.addEventListener('keydown', (e) => {
        if (gameState.gameOver) return;
        
        let dx = 0, dy = 0;
        
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
        else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
        else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
        else if (e.key === ' ' || e.key === 'Enter') {
            // Wait
            endTurn();
            return;
        } else {
            return;
        }
        
        e.preventDefault();
        movePlayer(dx, dy);
    });
}

// ============ GAME LOGIC ============
function movePlayer(dx, dy) {
    const config = LEVEL_CONFIG[gameState.level];
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // Check bounds
    if (newX < 0 || newX >= gameState.mapWidth || newY < 0 || newY >= gameState.mapHeight) {
        return;
    }
    
    const tile = gameState.map[newY][newX];
    
    // Check if walkable
    if (!config.walkable.includes(tile) && tile !== '$' && tile !== 'F' && tile !== 'E' && tile !== config.floorChar) {
        return;
    }
    
    // Check collisions with enemies
    if (checkEnemyCollision(newX, newY)) {
        return;
    }
    
    // Move player
    gameState.player.x = newX;
    gameState.player.y = newY;
    gameState.moves++;
    
    // Handle tile interactions
    if (tile === '$') {
        gameState.grit = Math.min(50, gameState.grit + 2);
        gameState.map[newY][newX] = ' ';
        showMessage("ATE CRUMB! +2 GRIT", 500);
    } else if (tile === 'F') {
        gameState.grit = Math.min(50, gameState.grit + 2);
        gameState.map[newY][newX] = ' ';
        showMessage("ATE CHUNK! +2 GRIT", 500);
    } else if (tile === 'E') {
        // Level complete!
        showMessage("LEVEL COMPLETE! ASCENDING...", 1000);
        setTimeout(() => {
            loadLevel(gameState.level + 1);
        }, 1500);
        return;
    }
    
    // Hunger mechanic: lose 1 Grit every 3 moves
    if (gameState.moves % 3 === 0) {
        gameState.grit--;
        if (gameState.grit <= 0) {
            gameState.grit = 0;
            gameOver("STARVED TO DEATH");
            return;
        }
    }
    
    endTurn();
}

function checkEnemyCollision(x, y) {
    // Level 1: Walking humans - check all parts (head at y-1, body at y, legs at y+1)
    if (gameState.level === 1) {
        for (let enemy of gameState.enemies) {
            if (enemy.type === 'human') {
                // Check if player collides with any part of human (head, body, or legs)
                if (x === enemy.x && (y === enemy.y - 1 || y === enemy.y || y === enemy.y + 1)) {
                    gameState.grit -= 15;
                    showMessage("TRAMPLED BY HUMAN! -15 GRIT", 800);
                    if (gameState.grit <= 0) {
                        gameOver("CRUSHED");
                        return true;
                    }
                    return true;
                }
            }
        }
    }
    
    // Level 2: Ants
    if (gameState.level === 2) {
        for (let enemy of gameState.enemies) {
            if (enemy.type === 'ant' && enemy.x === x && enemy.y === y) {
                gameState.grit -= 5;
                showMessage("ANT BIT! -5 GRIT", 600);
                if (gameState.grit <= 0) {
                    gameOver("DEFEATED BY ANTS");
                    return true;
                }
                return true;
            }
        }
    }
    
    // Level 2: Toxic spray
    for (let spray of gameState.toxicSprays) {
        if (spray.active && spray.x === x && spray.y === y) {
            gameState.grit -= 10;
            showMessage("TOXIC CLOUD! -10 GRIT", 800);
            if (gameState.grit <= 0) {
                gameOver("POISONED");
                return true;
            }
            return true;
        }
    }
    
    // Level 3: Cat paw
    if (gameState.level === 3 && gameState.pawTarget) {
        const px = gameState.pawTarget.x;
        const py = gameState.pawTarget.y;
        // 9x4 area
        if (x >= px - 4 && x <= px + 4 && y >= py - 1 && y <= py + 2) {
            gameState.grit -= 20;
            showMessage("SMASHED BY CAT PAW! -20 GRIT", 1000);
            if (gameState.grit <= 0) {
                gameOver("CRUSHED BY CAT");
                return true;
            }
            return true;
        }
    }
    
    return false;
}

function endTurn() {
    // Update enemies
    updateEnemies();
    
    // Level-specific hazards
    if (gameState.level === 2) {
        updateToxicSpray();
    } else if (gameState.level === 3) {
        updateCatPaw();
    }
    
    render();
    updateUI();
    
    if (gameState.grit <= 0 && !gameState.gameOver) {
        gameOver("STARVED");
    }
}

function updateEnemies() {
    const config = LEVEL_CONFIG[gameState.level];
    
    if (gameState.level === 1) {
        // Walking humans patrol back and forth within their bounds
        gameState.enemies.forEach(enemy => {
            if (enemy.type === 'human') {
                const newX = enemy.x + enemy.direction;
                
                // Check bounds
                if (newX < enemy.minX || newX > enemy.maxX) {
                    // Reverse direction at bounds
                    enemy.direction *= -1;
                    enemy.x += enemy.direction;
                } else if (config.walkable.includes(gameState.map[enemy.y][newX]) ||
                           gameState.map[enemy.y][newX] === ' ' ||
                           gameState.map[enemy.y][newX] === config.floorChar) {
                    enemy.x = newX;
                } else {
                    // Hit obstacle, reverse
                    enemy.direction *= -1;
                    enemy.x += enemy.direction;
                }
            }
        });
    } else if (gameState.level === 2) {
        // Scout ants move randomly
        gameState.enemies.forEach(enemy => {
            if (enemy.type === 'ant' && Math.random() < 0.3) {
                const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
                const newX = enemy.x + dx;
                const newY = enemy.y + dy;
                
                if (newX > 0 && newX < gameState.mapWidth - 1 &&
                    newY > 0 && newY < gameState.mapHeight - 1 &&
                    (config.walkable.includes(gameState.map[newY][newX]) ||
                     gameState.map[newY][newX] === config.floorChar)) {
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }
        });
    }
}

function updateToxicSpray() {
    const config = LEVEL_CONFIG[gameState.level];
    // Randomly spawn toxic spray warnings
    if (Math.random() < 0.05 && gameState.toxicSprays.length < 3) {
        const x = 1 + Math.floor(Math.random() * (gameState.mapWidth - 2));
        const y = 1 + Math.floor(Math.random() * (gameState.mapHeight - 2));
        
        if (config.walkable.includes(gameState.map[y][x]) ||
            gameState.map[y][x] === config.floorChar) {
            gameState.toxicSprays.push({
                x: x,
                y: y,
                active: false,
                warning: true,
                timer: 2
            });
        }
    }
    
    // Update existing sprays
    gameState.toxicSprays.forEach((spray, idx) => {
        if (spray.warning) {
            spray.timer--;
            if (spray.timer <= 0) {
                spray.warning = false;
                spray.active = true;
                spray.timer = 3; // Cloud lasts 3 turns
            }
        } else if (spray.active) {
            spray.timer--;
            if (spray.timer <= 0) {
                gameState.toxicSprays.splice(idx, 1);
            }
        }
    });
}

function updateCatPaw() {
    // Cat paw warning then smash (9x4 area)
    if (gameState.pawTimer === 0 && Math.random() < 0.03) {
        gameState.pawTimer = 3; // 3 turns warning
        // Target near player
        gameState.pawTarget = {
            x: Math.max(4, Math.min(gameState.mapWidth - 5, 
                gameState.player.x + Math.floor(Math.random() * 7) - 3)),
            y: Math.max(2, Math.min(gameState.mapHeight - 3,
                gameState.player.y + Math.floor(Math.random() * 5) - 2))
        };
        showMessage("SHADOW DETECTED ABOVE...", 1500);
    } else if (gameState.pawTimer > 0) {
        gameState.pawTimer--;
        if (gameState.pawTimer === 0) {
            // Paw smashes down - check if player is hit
            const px = gameState.pawTarget.x;
            const py = gameState.pawTarget.y;
            if (gameState.player.x >= px - 4 && gameState.player.x <= px + 4 &&
                gameState.player.y >= py - 1 && gameState.player.y <= py + 2) {
                // Player is in the 9x4 area
                checkEnemyCollision(gameState.player.x, gameState.player.y);
            }
            showMessage("PAW SMASH!", 500);
            setTimeout(() => {
                gameState.pawTarget = null;
                render();
            }, 1000);
        }
    }
}

function gameOver(reason) {
    gameState.gameOver = true;
    showMessage(`GAME OVER: ${reason}`, 3000);
}

// ============ RENDERING ============
function render() {
    const mapEl = document.getElementById('game-map');
    if (!mapEl) {
        console.error('game-map element not found!');
        return;
    }
    
    const viewport = document.getElementById('game-viewport');
    if (!viewport) {
        mapEl.innerHTML = 'ERROR: viewport not found';
        mapEl.style.color = '#ff0000';
        return;
    }
    
    if (!gameState.map || gameState.map.length === 0) {
        mapEl.innerHTML = 'Loading map... (map is empty)';
        mapEl.style.color = '#ffff00';
        console.log('Map is empty!', gameState);
        return;
    }
    
    const config = LEVEL_CONFIG[gameState.level];
    if (!config) {
        mapEl.innerHTML = 'Level data not found';
        return;
    }
    
    let output = '';
    
    // Calculate camera offset (centered on player)
    const tileWidth = 8; // Character width in pixels
    const tileHeight = 16; // Line height
    const vw = viewport.clientWidth || 800;
    const vh = viewport.clientHeight || 600;
    const viewportWidth = Math.min(80, Math.max(40, Math.floor(vw / tileWidth)));
    const viewportHeight = Math.min(30, Math.max(15, Math.floor(vh / tileHeight)));
    
    // Camera follows player - center player in viewport
    let camX = gameState.player.x - Math.floor(viewportWidth / 2);
    let camY = gameState.player.y - Math.floor(viewportHeight / 2);
    
    // Clamp camera to map bounds
    camX = Math.max(0, Math.min(camX, gameState.mapWidth - viewportWidth));
    camY = Math.max(0, Math.min(camY, gameState.mapHeight - viewportHeight));
    
    // Render visible area
    for (let y = camY; y < Math.min(camY + viewportHeight, gameState.mapHeight); y++) {
        let lineOutput = '';
        for (let x = camX; x < Math.min(camX + viewportWidth, gameState.mapWidth); x++) {
            // Ensure we have a valid character
            let char = gameState.map[y] && gameState.map[y][x] ? gameState.map[y][x] : ' ';
            let classes = [];
            
            // Check if player is here
            if (x === gameState.player.x && y === gameState.player.y) {
                char = '@';
                classes.push('player');
            } else {
                // Check enemies - render based on type
                let enemyHere = null;
                
                // Check for human stick figures (3 lines tall: head at y-1, body at y, legs at y+1)
                for (let enemy of gameState.enemies) {
                    if (enemy.type === 'human' && enemy.x === x) {
                        const relY = y - enemy.y;
                        if (relY === -1) {
                            // Head
                            enemyHere = enemy;
                            char = 'O';
                            break;
                        } else if (relY === 0) {
                            // Body/arms
                            enemyHere = enemy;
                            char = '|';
                            break;
                        } else if (relY === 1) {
                            // Legs
                            enemyHere = enemy;
                            char = 'V';
                            break;
                        }
                    } else if (enemy.type === 'ant' && enemy.x === x && enemy.y === y) {
                        enemyHere = enemy;
                        char = 'a';
                        break;
                    }
                }
                
                if (enemyHere) {
                    if (enemyHere.type === 'human') {
                        classes.push('human');
                    } else if (enemyHere.type === 'ant') {
                        classes.push('ant');
                    }
                } else if (char === '$') {
                    classes.push('food');
                } else if (char === 'F') {
                    classes.push('food-chunk');
                } else if (char === 'E') {
                    classes.push('exit');
                } else if (char === '#') {
                    classes.push('wall');
                } else if (char === config.floorChar) {
                    // Floor tile - keep as is
                } else {
                    // Empty space
                    char = ' ';
                }
                
                // Level 2: Toxic spray
                if (gameState.level === 2) {
                    for (let spray of gameState.toxicSprays) {
                        if (spray.x === x && spray.y === y) {
                            if (spray.warning) {
                                char = '!';
                                classes.push('toxic-warning');
                            } else if (spray.active) {
                                char = '~';
                                classes.push('toxic-cloud');
                            }
                        }
                    }
                }
                
                // Level 3: Cat paw (9x4 area centered on target)
                if (gameState.level === 3 && gameState.pawTarget) {
                    const px = gameState.pawTarget.x;
                    const py = gameState.pawTarget.y;
                    // 9 wide (px-4 to px+4), 4 tall (py-1 to py+2)
                    if (x >= px - 4 && x <= px + 4 && y >= py - 1 && y <= py + 2) {
                        if (gameState.pawTimer > 0) {
                            // Warning shadow
                            classes.push('paw-shadow');
                            if (x === px && (y === py || y === py + 1)) char = 'o';
                            else char = '.';
                        } else {
                            // Actual paw print - show oOo pattern in center
                            classes.push('paw-print');
                            if (x === px && y === py) char = 'o';
                            else if (x === px && y === py + 1) char = 'O';
                            else if (x === px && y === py + 2) char = 'o';
                            else char = 'X';
                        }
                    }
                }
            }
            
            // Escape HTML and build span (handle undefined/null)
            const escapedChar = (char === undefined || char === null) ? ' ' : String(char);
            if (classes.length > 0) {
                lineOutput += `<span class="${classes.join(' ')}">${escapedChar}</span>`;
            } else {
                lineOutput += escapedChar;
            }
        }
        output += lineOutput + '\n';
    }
    
    // Set innerHTML
    if (output.trim() === '') {
        console.error('Empty output generated!', {camX, camY, viewportWidth, viewportHeight, mapWidth: gameState.mapWidth, mapHeight: gameState.mapHeight, player: gameState.player});
        mapEl.innerHTML = 'ERROR: Empty map output<br>Map: ' + gameState.mapWidth + 'x' + gameState.mapHeight + '<br>Player: ' + gameState.player.x + ',' + gameState.player.y;
    } else {
        mapEl.innerHTML = output;
        
        // Position map to show player (camera follows player)
        const offsetX = -camX * tileWidth + 10; // Add padding
        const offsetY = -camY * tileHeight + 10;
        mapEl.style.left = offsetX + 'px';
        mapEl.style.top = offsetY + 'px';
        mapEl.style.color = '#aaa'; // Ensure text is visible
    }
}

function updateUI() {
    const config = LEVEL_CONFIG[gameState.level];
    document.getElementById('level-display').textContent = 
        `LEVEL: ${gameState.level} - ${config ? config.name : 'UNKNOWN'}`;
    document.getElementById('grit-display').textContent = `GRIT: ${gameState.grit}`;
    document.getElementById('moves-display').textContent = `MOVES: ${gameState.moves}`;
    
    const gritEl = document.getElementById('grit-display');
    if (gameState.grit < 10) {
        gritEl.className = 'stat danger';
    } else {
        gritEl.className = 'stat safe';
    }
}

function showMessage(msg, duration = 1000) {
    const msgEl = document.getElementById('status-message');
    msgEl.textContent = msg;
    msgEl.style.display = 'block';
    setTimeout(() => {
        msgEl.style.display = 'none';
    }, duration);
}
