// --- CONSTANTS ---
const MAX_GRIT = 40.0;
const HUNGER_RATE = 0.5;
const TILE_SIZE = 18; // Must match CSS .tile width

const TILES = {
    PLAYER: '&',
    FOOD: '$', 
    FOOD_CHUNK: 'F', // Logic type for giant food
    POISON: 'x',
    GLUE: '%',
    EXIT: 'E',
    WALL: '#',
    ENEMY: '!' 
};

// REDUCED SIZE FOR BETTER SPAWNING
const SEAFOOD_ART = {
    creature: [
        " (oo)",
        " (~~)"
    ],
    shrimp: [
        " ,//,",
        "o::::;",
        " `''`"
    ],
    fish: [
        " ,;/",
        "<><",
        " ';\\"
    ]
};

const BIOMES = {
    1: {
        name: "THE ASIAN WET MARKET",
        // Very wide horizontal level: 150x20
        width: 150,
        height: 20,
        floorChars: ['~', ',', '.', '"', '`'],
        wallChar: '#',
        enemyChar: 'M',
        enemyName: "STRAY CAT",
        desc: "Crowded stalls. Fresh catch. Live tanks. The exit to the kitchen awaits.",
        pattern: "puddles",
        layout: "wet_market"
    },
    2: {
        name: "RESTAURANT KITCHEN",
        // Wider for kitchen equipment: 80x35
        width: 80,
        height: 35,
        floorChars: ['=', '+', '-', ' '],
        wallChar: '[',
        enemyChar: 'O',
        enemyName: "CLEAN-BOT",
        desc: "Walk-in cooler. Dry storage. A maze of counters and dropped fish heads.",
        pattern: "checkerboard",
        layout: "kitchen"
    },
    3: {
        name: "DRAIN OPENING",
        // Wide horizontal level: 120x25
        width: 120,
        height: 25,
        floorChars: ['.', ',', ':', ' '],
        wallChar: '#',
        enemyChar: '☻',
        enemyName: "SLEEPING CAT",
        desc: "Water flows from the drain. A bedroom awaits below. The cat sleeps.",
        pattern: "bedroom",
        layout: "drain_opening"
    }
};

const FLAVOR_TEXT = {
    food: ["Slurped a chunk!", "Strange texture.", "Seafood consumed."],
    poison: "POISON! Wretched taste.",
    glue: "Stuck in the muck.",
    stomp_warn: "SHADOW DETECTED ABOVE.",
    stomp_hit: "SQUASHED.",
    stomp_miss: "The giant missed.",
    starve: "You starved to death.",
    level_up: "Ascended."
};

class NeonScuttle {
    constructor() {
        this.gridEl = document.getElementById('grid-container');
        this.viewportEl = document.getElementById('viewport'); // Camera container
        this.logEl = document.getElementById('log-console');
        this.gritEl = document.getElementById('grit-display');
        this.scoreEl = document.getElementById('score-display');
        this.levelEl = document.getElementById('level-display');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.deathReasonEl = document.getElementById('death-reason');

        this.level = 1;
        this.score = 0;
        this.levelStartScore = 0; 
        this.grit = MAX_GRIT;
        this.playerPos = { x: 1, y: 1 };
        
        this.map = []; 
        this.visualMap = []; 
        this.foodVisuals = []; 
        this.enemies = []; 

        this.stompTimer = 0;
        this.stompTarget = null;
        this.isGameOver = false;

        this.mapW = 25;
        this.mapH = 18;

        this.startLevel();
        this.bindInput();
    }

    log(msg, type = 'normal') {
        const div = document.createElement('div');
        div.textContent = `> ${msg}`;
        div.className = `log-entry ${type}`;
        this.logEl.prepend(div);
        if (this.logEl.children.length > 20) this.logEl.lastChild.remove();
    }

    startLevel() {
        this.grit = MAX_GRIT;
        this.levelStartScore = this.score;

        const biomeIndex = ((this.level - 1) % 3) + 1;
        this.biome = BIOMES[biomeIndex];
        
        this.mapW = this.biome.width;
        this.mapH = this.biome.height;

        this.gridEl.style.gridTemplateColumns = `repeat(${this.mapW}, 1fr)`;
        this.gridEl.style.gridTemplateRows = `repeat(${this.mapH}, 1fr)`;
        this.gridEl.style.width = 'fit-content';
        
        this.log(`ENTER: ${this.biome.name}`, 'new');
        this.log(this.biome.desc);

        this.generateLevel();
        this.render();
        
        // Reset Camera - start at left for horizontal levels
        this.viewportEl.scrollLeft = 0;
        if (this.biome.layout === "wet_market" || this.biome.layout === "kitchen") {
            // Center vertically for horizontal scrolling levels
            const tileSize = window.innerWidth <= 768 ? 14 : 18;
            this.viewportEl.scrollTop = (this.mapH * tileSize / 2) - (this.viewportEl.clientHeight / 2);
        } else {
            this.viewportEl.scrollTop = 0;
        }
        this.updateCamera();
    }

    skipLevel() {
        this.log("CHEAT: WARPING TO NEXT FLOOR...", 'new');
        this.level++;
        this.startLevel();
    }

    // --- CAMERA LOGIC ---
    updateCamera() {
        const tileSize = window.innerWidth <= 768 ? 14 : 18;
        
        const playerPixelX = (this.playerPos.x * tileSize) + (tileSize / 2);
        const playerPixelY = (this.playerPos.y * tileSize) + (tileSize / 2);
        
        const halfViewW = this.viewportEl.clientWidth / 2;
        const halfViewH = this.viewportEl.clientHeight / 2;
        
        // For horizontal levels, focus on horizontal scrolling
        if (this.biome && (this.biome.layout === "wet_market" || this.biome.layout === "kitchen")) {
            this.viewportEl.scrollLeft = playerPixelX - halfViewW;
            // Keep vertical centered for horizontal scrolling
            this.viewportEl.scrollTop = (this.mapH * tileSize / 2) - halfViewH;
        } else {
            this.viewportEl.scrollLeft = playerPixelX - halfViewW;
            this.viewportEl.scrollTop = playerPixelY - halfViewH;
        }
    }

    generateLevel() {
        this.map = [];
        this.visualMap = [];
        this.foodVisuals = [];
        this.enemies = [];

        // 1. Initialize Grids
        for (let y = 0; y < this.mapH; y++) {
            const row = [];
            const visRow = [];
            const foodRow = [];
            for (let x = 0; x < this.mapW; x++) {
                row.push('EMPTY');
                foodRow.push(null);
                
                let char = '.';
                if (this.biome.pattern === "puddles") {
                    // More varied wet floor patterns
                    const noise = Math.sin(x * 0.15) + Math.cos(y * 0.4) + Math.sin(x * 0.3) * 0.5; 
                    if (noise > 0.6) char = '~';
                    else if (noise > 0.3) char = ',';
                    else if (noise > 0) char = '.';
                    else if (noise > -0.2) char = '"';
                    else char = '`';
                } 
                else if (this.biome.pattern === "checkerboard") {
                    char = (x + y) % 2 === 0 ? '+' : ' ';
                } 
                else if (this.biome.pattern === "face") {
                    char = Math.random() > 0.8 ? (Math.random() > 0.5 ? '(' : ')') : ' ';
                }
                else if (this.biome.pattern === "bedroom") {
                    // Bedroom floor pattern
                    if (y > 10) { // Lower part is bedroom floor
                        char = Math.random() > 0.7 ? ':' : (Math.random() > 0.5 ? '.' : ' ');
                    } else {
                        char = ' '; // Upper part is drain/pipe area
                    }
                }

                visRow.push(char);
            }
            this.map.push(row);
            this.visualMap.push(visRow);
            this.foodVisuals.push(foodRow);
        }

        // Walls Border
        for (let i = 0; i < this.mapW; i++) { this.setTile(0, i, 'WALL'); this.setTile(this.mapH-1, i, 'WALL'); }
        for (let i = 0; i < this.mapH; i++) { this.setTile(i, 0, 'WALL'); this.setTile(i, this.mapW-1, 'WALL'); }

        // 2. LAYOUT GENERATION
        if (this.biome.layout === "cubes") {
            for (let y = 2; y < this.mapH - 4; y += 5) {
                for (let x = 2; x < this.mapW - 4; x += 5) {
                    if (Math.random() < 0.7) {
                        this.drawRectWall(x, y, 3, 3, true); 
                    }
                }
            }
        } 
        else if (this.biome.layout === "open_square") {
            this.generateFaceObstacles();
        }
        else if (this.biome.layout === "wet_market") {
            this.generateWetMarket();
        }
        else if (this.biome.layout === "kitchen") {
            this.generateKitchen();
        }
        else if (this.biome.layout === "drain_opening") {
            this.generateDrainOpening();
        }
        else {
             for (let i = 0; i < (this.mapW * this.mapH) * 0.1; i++) this.setRandomTile('WALL');
        }

        // 3. GIANT FOOD GENERATION
        // INCREASED DENSITY: 1 per 70 tiles instead of 100
        const giantFoodCount = Math.floor((this.mapW * this.mapH) / 70);
        const foodKeys = Object.keys(SEAFOOD_ART);
        
        for(let i=0; i<giantFoodCount; i++) {
            const type = foodKeys[Math.floor(Math.random() * foodKeys.length)];
            this.placeGiantFood(type);
        }

        // Regular Items - more crowded for wet market
        const area = this.mapW * this.mapH;
        const itemMultiplier = this.biome.layout === "wet_market" ? 1.5 : 1.0;
        const crumbCount = Math.floor(area * 0.02 * itemMultiplier);
        for(let i=0; i<crumbCount; i++) {
            const pos = this.findEmptyTile();
            if(pos && pos.x > 5) { // Don't place too close to start
                this.map[pos.y][pos.x] = 'FOOD';
            }
        }

        for(let i=0; i<Math.floor(area * 0.005 * itemMultiplier); i++) {
            const pos = this.findEmptyTile();
            if(pos && pos.x > 5) {
                this.map[pos.y][pos.x] = 'POISON';
            }
        }
        
        // Glue is already placed in puddles for wet_market, so only add more if not wet_market
        if (this.biome.layout !== "wet_market" && this.biome.layout !== "kitchen") {
            for(let i=0; i<Math.floor(area * 0.01); i++) this.setRandomTile('GLUE');
        }

        // Enemies - more crowded for wet market
        const enemyMultiplier = this.biome.layout === "wet_market" ? 1.8 : 1.0;
        const enemyCount = Math.floor((3 + Math.floor(this.level / 2) + Math.floor(area * 0.005)) * enemyMultiplier);
        for(let i=0; i<enemyCount; i++) {
            const pos = this.findEmptyTile();
            if(pos && pos.x > 5) { // Don't spawn enemies too close to start
                this.enemies.push({ x: pos.x, y: pos.y, id: i });
            }
        }

        // Exit and player positioning
        if (this.biome.layout === "kitchen") {
            // Exit on the far right
            const exitY = Math.floor(this.mapH / 2);
            this.map[exitY][this.mapW - 3] = 'EXIT';
            this.map[exitY - 1][this.mapW - 3] = 'EMPTY';
            this.map[exitY + 1][this.mapW - 3] = 'EMPTY';
            
            // Player starts on the left
            this.playerPos = { x: 2, y: Math.floor(this.mapH / 2) };
            this.map[this.playerPos.y][this.playerPos.x] = 'EMPTY';
            this.map[this.playerPos.y][this.playerPos.x + 1] = 'EMPTY';
            this.map[this.playerPos.y + 1][this.playerPos.x] = 'EMPTY';
        } else if (this.biome.layout === "wet_market") {
            // Exit on the far right, centered vertically
            const exitY = Math.floor(this.mapH / 2);
            this.map[exitY][this.mapW - 3] = 'EXIT';
            this.map[exitY - 1][this.mapW - 3] = 'EMPTY';
            this.map[exitY + 1][this.mapW - 3] = 'EMPTY';
            
            // Player starts on the left, near entrance
            this.playerPos = { x: 3, y: Math.floor(this.mapH / 2) };
            this.map[this.playerPos.y][this.playerPos.x] = 'EMPTY';
            this.map[this.playerPos.y][this.playerPos.x + 1] = 'EMPTY';
            this.map[this.playerPos.y + 1][this.playerPos.x] = 'EMPTY';
        } else if (this.biome.layout === "drain_opening") {
            // Exit at bottom right (drain/pipe exit)
            const exitY = this.mapH - 3;
            this.map[exitY][this.mapW - 3] = 'EXIT';
            this.map[exitY - 1][this.mapW - 3] = 'EMPTY';
            
            // Player starts at top left (near drain entrance)
            this.playerPos = { x: 3, y: 4 };
            this.map[this.playerPos.y][this.playerPos.x] = 'EMPTY';
            this.map[this.playerPos.y][this.playerPos.x + 1] = 'EMPTY';
            this.map[this.playerPos.y + 1][this.playerPos.x] = 'EMPTY';
        } else {
            this.map[this.mapH-2][this.mapW-2] = 'EXIT';
            this.playerPos = { x: 1, y: 1 };
            this.map[1][1] = 'EMPTY';
            this.map[1][2] = 'EMPTY';
            this.map[2][1] = 'EMPTY';
        }
    }

    placeGiantFood(type) {
        const art = SEAFOOD_ART[type];
        const h = art.length;
        const w = art[0].length;
        
        let placed = false;
        let attempts = 0;
        while(!placed && attempts < 50) {
            const tx = Math.floor(Math.random() * (this.mapW - w - 2)) + 1;
            const ty = Math.floor(Math.random() * (this.mapH - h - 2)) + 1;
            
            let clear = true;
            for(let i=0; i<h; i++) {
                for(let j=0; j<w; j++) {
                    if (this.map[ty+i][tx+j] !== 'EMPTY') clear = false;
                }
            }

            if(clear) {
                for(let i=0; i<h; i++) {
                    for(let j=0; j<w; j++) {
                        const char = art[i][j];
                        if (char !== ' ') {
                            this.map[ty+i][tx+j] = 'FOOD_CHUNK';
                            this.foodVisuals[ty+i][tx+j] = char;
                        }
                    }
                }
                placed = true;
            }
            attempts++;
        }
    }

    generateFaceObstacles() {
        const cx = Math.floor(this.mapW / 2);
        const cy = Math.floor(this.mapH / 2);
        this.drawRectWall(cx - 5, cy - 5, 3, 3, false); 
        this.drawRectWall(cx + 3, cy - 5, 3, 3, false); 
        for(let y=cy-2; y<cy+2; y++) this.setTile(y, cx, 'WALL');
        for(let x=cx-3; x<cx+4; x++) this.setTile(cy+4, x, 'WALL');
    }

    generateWetMarket() {
        const midY = Math.floor(this.mapH / 2); // Center row (around row 10 in 20-height map)
        const topRow = 2; // Near top for entrance
        const bottomRow = this.mapH - 3; // Near bottom for vegetables
        
        // STREET ENTRANCE - Barriers at top with gap
        for (let x = 10; x < 20; x++) {
            if (x === 13 || x === 14) continue; // Gap for entrance (||)
            this.setTile(topRow, x, 'WALL');
        }
        
        // FRESH CATCH STALLS (left side, around x=10-30)
        // First stall
        this.drawRectWall(10, midY - 4, 10, 7, false);
        this.setTile(midY - 2, 13, 'FOOD'); // $ sign in center
        this.visualMap[midY - 3][12] = '.';
        this.visualMap[midY - 3][13] = '-';
        this.visualMap[midY - 3][14] = '-';
        this.visualMap[midY - 3][15] = '-';
        this.visualMap[midY - 3][16] = '.';
        
        // Ice bed between stalls
        this.drawRectWall(22, midY - 3, 12, 6, false);
        this.visualMap[midY - 2][24] = '/';
        this.visualMap[midY - 2][25] = '`';
        this.visualMap[midY - 2][26] = '·';
        this.visualMap[midY - 2][27] = '.';
        this.visualMap[midY - 1][24] = '/';
        this.visualMap[midY - 1][25] = '.';
        this.visualMap[midY - 1][26] = '.';
        this.visualMap[midY - 1][27] = '.';
        this.visualMap[midY - 1][28] = '`';
        this.visualMap[midY - 1][29] = ':';
        this.visualMap[midY - 1][30] = '·';
        
        // Second stall
        this.drawRectWall(36, midY - 4, 10, 7, false);
        this.setTile(midY - 2, 39, 'FOOD'); // $ sign
        
        // LIVE TANKS (around x=50-65)
        this.drawRectWall(50, midY - 2, 14, 5, false);
        this.setTile(midY, 53, 'FOOD'); // Fish
        this.setTile(midY, 56, 'FOOD'); // Fish
        this.setTile(midY, 59, 'FOOD'); // Fish
        this.visualMap[midY][52] = '~';
        this.visualMap[midY][54] = ' ';
        this.visualMap[midY][55] = '>';
        this.visualMap[midY][57] = '<';
        this.visualMap[midY][58] = '(';
        this.visualMap[midY][60] = '(';
        this.visualMap[midY][61] = "'";
        this.visualMap[midY][62] = '>';
        this.visualMap[midY][63] = ' ';
        this.visualMap[midY][64] = '~';
        
        // CRAB BUCKETS (around x=70-85)
        this.drawRectWall(70, midY - 2, 12, 5, false);
        this.setTile(midY - 1, 73, 'FOOD'); // (V)
        this.setTile(midY - 1, 76, 'FOOD'); // (V)
        this.setTile(midY, 74, 'FOOD'); // (@@)
        this.setTile(midY, 77, 'FOOD'); // (@@)
        
        // BUTCHER AREA (around x=90-110) - Three stalls
        for (let i = 0; i < 3; i++) {
            const bx = 90 + (i * 6);
            this.drawRectWall(bx, midY - 2, 4, 5, false);
            this.setTile(midY, bx + 1, 'POISON'); // Blood
            this.setTile(midY, bx + 2, 'POISON'); // Blood
            this.visualMap[midY - 1][bx + 1] = '(';
            this.visualMap[midY - 1][bx + 2] = ' ';
            this.visualMap[midY - 1][bx + 3] = '(';
            this.visualMap[midY - 1][bx + 4] = ' ';
            this.visualMap[midY - 1][bx + 5] = ')';
            this.visualMap[midY + 1][bx + 1] = '\\';
            this.visualMap[midY + 1][bx + 2] = ' ';
            this.visualMap[midY + 1][bx + 3] = ')';
            this.visualMap[midY + 2][bx + 1] = ')';
            this.visualMap[midY + 2][bx + 2] = ' ';
            this.visualMap[midY + 2][bx + 3] = '(';
            this.visualMap[midY + 2][bx + 4] = '`';
            this.visualMap[midY + 2][bx + 5] = '-';
            this.visualMap[midY + 2][bx + 6] = '´';
        }
        
        // VEGETABLES (bottom area, around x=20-50)
        for (let i = 0; i < 3; i++) {
            const vx = 20 + (i * 10);
            this.setTile(bottomRow - 2, vx, 'FOOD');
            this.setTile(bottomRow - 1, vx, 'FOOD');
            this.setTile(bottomRow, vx, 'FOOD');
            this.visualMap[bottomRow - 3][vx] = 'v';
            this.visualMap[bottomRow - 3][vx + 1] = 'v';
            this.visualMap[bottomRow - 3][vx + 2] = 'v';
            this.visualMap[bottomRow - 1][vx - 1] = '(';
            this.visualMap[bottomRow - 1][vx + 1] = ')';
            this.visualMap[bottomRow][vx - 1] = '\\';
            this.visualMap[bottomRow][vx + 1] = '/';
            this.visualMap[bottomRow + 1][vx] = '_';
            this.visualMap[bottomRow + 1][vx - 1] = '_';
            this.visualMap[bottomRow + 1][vx + 1] = '_';
        }
        
        // SPICES & DRY GOODS (right side, around x=115-130)
        this.drawRectWall(115, midY - 1, 12, 4, false);
        for (let x = 117; x < 125; x += 2) {
            this.setTile(midY, x, 'FOOD');
            this.visualMap[midY - 1][x] = '^';
            this.visualMap[midY - 1][x + 1] = '^';
            this.visualMap[midY - 1][x + 2] = '^';
        }
        // Price signs
        this.drawRectWall(127, midY - 1, 8, 3, false);
        this.visualMap[midY][128] = '|';
        this.visualMap[midY][129] = ' ';
        this.visualMap[midY][130] = 'P';
        this.visualMap[midY][131] = 'R';
        this.visualMap[midY][132] = 'I';
        this.visualMap[midY][133] = 'C';
        this.visualMap[midY][134] = 'E';
        this.visualMap[midY][135] = ' ';
        this.visualMap[midY][136] = '|';
        
        // FRUITS (near spices, around x=120-135)
        for (let x = 120; x < 135; x += 4) {
            this.setTile(midY + 1, x, 'FOOD');
            this.setTile(midY + 2, x, 'FOOD');
            this.visualMap[midY + 1][x - 1] = '(';
            this.visualMap[midY + 1][x + 1] = '.';
            this.visualMap[midY + 1][x + 2] = ')';
            this.visualMap[midY + 2][x - 1] = '(';
            this.visualMap[midY + 2][x + 1] = '.';
            this.visualMap[midY + 2][x + 2] = ')';
        }
        
        // BOXES scattered (around x=60-100, various Y)
        const boxPositions = [
            {x: 65, y: midY + 3},
            {x: 75, y: midY + 3},
            {x: 85, y: midY + 3},
            {x: 70, y: bottomRow - 1},
            {x: 80, y: bottomRow - 1}
        ];
        boxPositions.forEach(box => {
            if (this.map[box.y][box.x] === 'EMPTY') {
                this.setTile(box.y, box.x, 'WALL');
                this.visualMap[box.y][box.x] = '[';
                this.visualMap[box.y][box.x + 1] = '|';
                this.visualMap[box.y][box.x + 2] = '|';
                this.visualMap[box.y][box.x + 3] = '|';
                this.visualMap[box.y][box.x + 4] = '|';
                this.visualMap[box.y][box.x + 5] = ']';
            }
        });
        
        // PUDDLES - Create specific puddle areas
        const puddleAreas = [
            {x: 15, y: bottomRow - 1, size: 3},
            {x: 55, y: midY + 2, size: 2},
            {x: 75, y: midY + 2, size: 2},
            {x: 95, y: bottomRow - 1, size: 4},
            {x: 25, y: midY + 3, size: 2}
        ];
        puddleAreas.forEach(puddle => {
            for (let i = 0; i < puddle.size; i++) {
                for (let j = 0; j < puddle.size; j++) {
                    const px = puddle.x + i;
                    const py = puddle.y + j;
                    if (px < this.mapW - 1 && py < this.mapH - 1 && this.map[py][px] === 'EMPTY') {
                        this.visualMap[py][px] = '~';
                        // Make some puddles slippery
                        if (Math.random() < 0.4) {
                            this.map[py][px] = 'GLUE';
                        }
                    }
                }
            }
        });
        
        // Additional random puddles
        for (let i = 0; i < 20; i++) {
            const px = Math.floor(Math.random() * (this.mapW - 4)) + 2;
            const py = Math.floor(Math.random() * (this.mapH - 4)) + 2;
            if (this.map[py][px] === 'EMPTY' && px > 5) {
                this.visualMap[py][px] = '~';
                if (Math.random() < 0.3) {
                    this.map[py][px] = 'GLUE';
                }
            }
        }
    }

    generateKitchen() {
        const leftX = 5;
        const rightX = this.mapW - 6;
        const topY = 3;
        const midY = Math.floor(this.mapH / 2);
        
        // WALK-IN COOLER/FRIDGE (left side)
        const fridgeX = leftX;
        const fridgeY = topY;
        const fridgeW = 18;
        const fridgeH = 12;
        
        // Draw fridge walls
        this.drawRectWall(fridgeX, fridgeY, fridgeW, fridgeH, false);
        
        // Fridge interior sections
        // Top row: Milk and Vegetables
        this.drawRectWall(fridgeX + 2, fridgeY + 2, 6, 3, false); // Milk section
        this.drawRectWall(fridgeX + 10, fridgeY + 2, 6, 3, false); // Vegetables section
        
        // Visual details for fridge sections
        this.visualMap[fridgeY + 3][fridgeX + 3] = '[';
        this.visualMap[fridgeY + 3][fridgeX + 4] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 5] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 6] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 7] = ']';
        this.visualMap[fridgeY + 3][fridgeX + 11] = '[';
        this.visualMap[fridgeY + 3][fridgeX + 12] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 13] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 14] = '-';
        this.visualMap[fridgeY + 3][fridgeX + 15] = ']';
        
        // Milk and Vegetable labels
        this.visualMap[fridgeY + 4][fridgeX + 3] = '|';
        this.visualMap[fridgeY + 4][fridgeX + 4] = 'M';
        this.visualMap[fridgeY + 4][fridgeX + 5] = 'I';
        this.visualMap[fridgeY + 4][fridgeX + 6] = 'L';
        this.visualMap[fridgeY + 4][fridgeX + 7] = 'K';
        this.visualMap[fridgeY + 4][fridgeX + 8] = '|';
        this.visualMap[fridgeY + 4][fridgeX + 11] = '|';
        this.visualMap[fridgeY + 4][fridgeX + 12] = 'V';
        this.visualMap[fridgeY + 4][fridgeX + 13] = 'E';
        this.visualMap[fridgeY + 4][fridgeX + 14] = 'G';
        this.visualMap[fridgeY + 4][fridgeX + 15] = ' ';
        this.visualMap[fridgeY + 4][fridgeX + 16] = '|';
        
        // Bottom section: Meat
        this.drawRectWall(fridgeX + 2, fridgeY + 7, 10, 3, false);
        this.visualMap[fridgeY + 8][fridgeX + 3] = '[';
        this.visualMap[fridgeY + 8][fridgeX + 4] = 'M';
        this.visualMap[fridgeY + 8][fridgeX + 5] = 'E';
        this.visualMap[fridgeY + 8][fridgeX + 6] = 'A';
        this.visualMap[fridgeY + 8][fridgeX + 7] = 'T';
        this.visualMap[fridgeY + 8][fridgeX + 8] = ']';
        
        // Fridge door handle (bottom center)
        const handleX = fridgeX + Math.floor(fridgeW / 2) - 1;
        const handleY = fridgeY + fridgeH - 1;
        this.visualMap[handleY][handleX] = '(';
        this.visualMap[handleY][handleX + 1] = '0';
        this.visualMap[handleY][handleX + 2] = ')';
        this.visualMap[handleY + 1][handleX + 1] = '[';
        this.visualMap[handleY + 1][handleX + 2] = 'H';
        this.visualMap[handleY + 1][handleX + 3] = 'A';
        this.visualMap[handleY + 1][handleX + 4] = 'N';
        this.visualMap[handleY + 1][handleX + 5] = 'D';
        this.visualMap[handleY + 1][handleX + 6] = 'L';
        this.visualMap[handleY + 1][handleX + 7] = 'E';
        this.visualMap[handleY + 1][handleX + 8] = ']';
        
        // Place food items in fridge sections
        this.setTile(fridgeY + 3, fridgeX + 4, 'FOOD'); // Milk
        this.setTile(fridgeY + 3, fridgeX + 5, 'FOOD');
        this.setTile(fridgeY + 4, fridgeX + 12, 'FOOD'); // Vegetables
        this.setTile(fridgeY + 4, fridgeX + 13, 'FOOD');
        this.setTile(fridgeY + 8, fridgeX + 5, 'FOOD'); // Meat
        this.setTile(fridgeY + 8, fridgeX + 6, 'FOOD');
        
        // DRY STORAGE SHELVING (right side, wide)
        const shelfX = rightX - 50;
        const shelfY = topY + 2;
        const shelfW = 48;
        const shelfH = 10;
        
        // Draw shelving walls
        this.drawRectWall(shelfX, shelfY, shelfW, shelfH, false);
        
        // Top shelf: Rice, Flour, Oil, Soy
        const topShelfY = shelfY + 1;
        
        // Rice section
        this.drawRectWall(shelfX + 2, topShelfY, 8, 2, false);
        this.visualMap[topShelfY + 1][shelfX + 3] = '[';
        this.visualMap[topShelfY + 1][shelfX + 4] = 'R';
        this.visualMap[topShelfY + 1][shelfX + 5] = 'I';
        this.visualMap[topShelfY + 1][shelfX + 6] = 'C';
        this.visualMap[topShelfY + 1][shelfX + 7] = 'E';
        this.visualMap[topShelfY + 1][shelfX + 8] = ']';
        this.visualMap[topShelfY + 2][shelfX + 3] = '[';
        this.visualMap[topShelfY + 2][shelfX + 4] = '=';
        this.visualMap[topShelfY + 2][shelfX + 5] = '=';
        this.visualMap[topShelfY + 2][shelfX + 6] = '=';
        this.visualMap[topShelfY + 2][shelfX + 7] = '=';
        this.visualMap[topShelfY + 2][shelfX + 8] = ']';
        this.setTile(topShelfY + 1, shelfX + 5, 'FOOD');
        
        // Flour section
        this.drawRectWall(shelfX + 12, topShelfY, 9, 2, false);
        this.visualMap[topShelfY + 1][shelfX + 13] = '[';
        this.visualMap[topShelfY + 1][shelfX + 14] = 'F';
        this.visualMap[topShelfY + 1][shelfX + 15] = 'L';
        this.visualMap[topShelfY + 1][shelfX + 16] = 'O';
        this.visualMap[topShelfY + 1][shelfX + 17] = 'U';
        this.visualMap[topShelfY + 1][shelfX + 18] = 'R';
        this.visualMap[topShelfY + 1][shelfX + 19] = ']';
        this.visualMap[topShelfY + 2][shelfX + 13] = '[';
        this.visualMap[topShelfY + 2][shelfX + 14] = '=';
        this.visualMap[topShelfY + 2][shelfX + 15] = '=';
        this.visualMap[topShelfY + 2][shelfX + 16] = '=';
        this.visualMap[topShelfY + 2][shelfX + 17] = '=';
        this.visualMap[topShelfY + 2][shelfX + 18] = '=';
        this.visualMap[topShelfY + 2][shelfX + 19] = ']';
        this.setTile(topShelfY + 1, shelfX + 15, 'FOOD');
        
        // Oil section
        this.drawRectWall(shelfX + 23, topShelfY, 7, 2, false);
        this.visualMap[topShelfY + 1][shelfX + 24] = '[';
        this.visualMap[topShelfY + 1][shelfX + 25] = 'O';
        this.visualMap[topShelfY + 1][shelfX + 26] = 'I';
        this.visualMap[topShelfY + 1][shelfX + 27] = 'L';
        this.visualMap[topShelfY + 1][shelfX + 28] = ']';
        this.visualMap[topShelfY + 2][shelfX + 24] = '[';
        this.visualMap[topShelfY + 2][shelfX + 25] = '=';
        this.visualMap[topShelfY + 2][shelfX + 26] = '=';
        this.visualMap[topShelfY + 2][shelfX + 27] = '=';
        this.visualMap[topShelfY + 2][shelfX + 28] = ']';
        this.setTile(topShelfY + 1, shelfX + 25, 'FOOD');
        
        // Soy section
        this.drawRectWall(shelfX + 32, topShelfY, 7, 2, false);
        this.visualMap[topShelfY + 1][shelfX + 33] = '[';
        this.visualMap[topShelfY + 1][shelfX + 34] = 'S';
        this.visualMap[topShelfY + 1][shelfX + 35] = 'O';
        this.visualMap[topShelfY + 1][shelfX + 36] = 'Y';
        this.visualMap[topShelfY + 1][shelfX + 37] = ']';
        this.visualMap[topShelfY + 2][shelfX + 33] = '[';
        this.visualMap[topShelfY + 2][shelfX + 34] = '=';
        this.visualMap[topShelfY + 2][shelfX + 35] = '=';
        this.visualMap[topShelfY + 2][shelfX + 36] = '=';
        this.visualMap[topShelfY + 2][shelfX + 37] = ']';
        this.setTile(topShelfY + 1, shelfX + 34, 'FOOD');
        
        // Shelf divider line
        for (let x = shelfX + 1; x < shelfX + shelfW - 1; x++) {
            this.visualMap[topShelfY + 3][x] = '=';
        }
        
        // Bottom shelf: Cans and Boxes
        const bottomShelfY = topShelfY + 4;
        
        // Cans section 1
        this.drawRectWall(shelfX + 2, bottomShelfY, 9, 3, false);
        this.visualMap[bottomShelfY + 1][shelfX + 3] = '[';
        this.visualMap[bottomShelfY + 1][shelfX + 4] = 'C';
        this.visualMap[bottomShelfY + 1][shelfX + 5] = 'A';
        this.visualMap[bottomShelfY + 1][shelfX + 6] = 'N';
        this.visualMap[bottomShelfY + 1][shelfX + 7] = 'S';
        this.visualMap[bottomShelfY + 1][shelfX + 8] = ']';
        this.visualMap[bottomShelfY + 2][shelfX + 3] = '(';
        this.visualMap[bottomShelfY + 2][shelfX + 4] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 5] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 6] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 7] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 8] = ')';
        this.setTile(bottomShelfY + 1, shelfX + 5, 'FOOD');
        
        // Cans section 2
        this.drawRectWall(shelfX + 13, bottomShelfY, 9, 3, false);
        this.visualMap[bottomShelfY + 1][shelfX + 14] = '[';
        this.visualMap[bottomShelfY + 1][shelfX + 15] = 'C';
        this.visualMap[bottomShelfY + 1][shelfX + 16] = 'A';
        this.visualMap[bottomShelfY + 1][shelfX + 17] = 'N';
        this.visualMap[bottomShelfY + 1][shelfX + 18] = 'S';
        this.visualMap[bottomShelfY + 1][shelfX + 19] = ']';
        this.visualMap[bottomShelfY + 2][shelfX + 14] = '(';
        this.visualMap[bottomShelfY + 2][shelfX + 15] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 16] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 17] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 18] = '_';
        this.visualMap[bottomShelfY + 2][shelfX + 19] = ')';
        this.setTile(bottomShelfY + 1, shelfX + 16, 'FOOD');
        
        // Box section 1
        this.drawRectWall(shelfX + 24, bottomShelfY, 8, 3, false);
        this.visualMap[bottomShelfY + 1][shelfX + 25] = '[';
        this.visualMap[bottomShelfY + 1][shelfX + 26] = 'B';
        this.visualMap[bottomShelfY + 1][shelfX + 27] = 'O';
        this.visualMap[bottomShelfY + 1][shelfX + 28] = 'X';
        this.visualMap[bottomShelfY + 1][shelfX + 29] = ']';
        this.visualMap[bottomShelfY + 2][shelfX + 25] = '[';
        this.visualMap[bottomShelfY + 2][shelfX + 26] = '|';
        this.visualMap[bottomShelfY + 2][shelfX + 27] = 'X';
        this.visualMap[bottomShelfY + 2][shelfX + 28] = '|';
        this.visualMap[bottomShelfY + 2][shelfX + 29] = ']';
        this.setTile(bottomShelfY + 1, shelfX + 27, 'FOOD');
        
        // Box section 2
        this.drawRectWall(shelfX + 34, bottomShelfY, 8, 3, false);
        this.visualMap[bottomShelfY + 1][shelfX + 35] = '[';
        this.visualMap[bottomShelfY + 1][shelfX + 36] = 'B';
        this.visualMap[bottomShelfY + 1][shelfX + 37] = 'O';
        this.visualMap[bottomShelfY + 1][shelfX + 38] = 'X';
        this.visualMap[bottomShelfY + 1][shelfX + 39] = ']';
        this.visualMap[bottomShelfY + 2][shelfX + 35] = '[';
        this.visualMap[bottomShelfY + 2][shelfX + 36] = '|';
        this.visualMap[bottomShelfY + 2][shelfX + 37] = '/';
        this.visualMap[bottomShelfY + 2][shelfX + 38] = '|';
        this.visualMap[bottomShelfY + 2][shelfX + 39] = ']';
        this.setTile(bottomShelfY + 1, shelfX + 37, 'FOOD');
        
        // COOKING STATIONS (center area)
        const centerX = Math.floor(this.mapW / 2);
        const cookingY = midY - 5;
        
        // WOK STATION (left of center)
        const wokX = centerX - 15;
        this.drawRectWall(wokX, cookingY, 8, 7, false);
        // Wok visual
        this.visualMap[cookingY + 1][wokX + 3] = '(';
        this.visualMap[cookingY + 1][wokX + 4] = ' ';
        this.visualMap[cookingY + 1][wokX + 5] = ')';
        this.visualMap[cookingY + 2][wokX + 3] = ' ';
        this.visualMap[cookingY + 2][wokX + 4] = ')';
        this.visualMap[cookingY + 2][wokX + 5] = '(';
        this.visualMap[cookingY + 3][wokX + 2] = '(';
        this.visualMap[cookingY + 3][wokX + 3] = '_';
        this.visualMap[cookingY + 3][wokX + 4] = '_';
        this.visualMap[cookingY + 3][wokX + 5] = ')';
        this.visualMap[cookingY + 4][wokX + 1] = '/';
        this.visualMap[cookingY + 4][wokX + 2] = ' ';
        this.visualMap[cookingY + 4][wokX + 3] = ' ';
        this.visualMap[cookingY + 4][wokX + 4] = ' ';
        this.visualMap[cookingY + 4][wokX + 5] = ' ';
        this.visualMap[cookingY + 4][wokX + 6] = '\\';
        this.visualMap[cookingY + 5][wokX + 2] = '|';
        this.visualMap[cookingY + 5][wokX + 3] = '_';
        this.visualMap[cookingY + 5][wokX + 4] = '_';
        this.visualMap[cookingY + 5][wokX + 5] = '_';
        this.visualMap[cookingY + 5][wokX + 6] = '_';
        this.visualMap[cookingY + 5][wokX + 7] = '|';
        this.visualMap[cookingY + 6][wokX + 2] = '[';
        this.visualMap[cookingY + 6][wokX + 3] = '=';
        this.visualMap[cookingY + 6][wokX + 4] = '=';
        this.visualMap[cookingY + 6][wokX + 5] = 'F';
        this.visualMap[cookingY + 6][wokX + 6] = 'I';
        this.visualMap[cookingY + 6][wokX + 7] = 'R';
        this.visualMap[cookingY + 6][wokX + 8] = 'E';
        this.visualMap[cookingY + 6][wokX + 9] = ']';
        // Fire is dangerous (poison)
        this.setTile(cookingY + 6, wokX + 5, 'POISON');
        this.setTile(cookingY + 6, wokX + 6, 'POISON');
        
        // STOVE RANGE (center)
        const stoveX = centerX - 8;
        this.drawRectWall(stoveX, cookingY, 16, 7, false);
        // Two burners
        this.visualMap[cookingY + 1][stoveX + 3] = '(';
        this.visualMap[cookingY + 1][stoveX + 4] = ' ';
        this.visualMap[cookingY + 1][stoveX + 5] = ')';
        this.visualMap[cookingY + 1][stoveX + 11] = '(';
        this.visualMap[cookingY + 1][stoveX + 12] = ' ';
        this.visualMap[cookingY + 1][stoveX + 13] = ')';
        this.visualMap[cookingY + 2][stoveX + 3] = ' ';
        this.visualMap[cookingY + 2][stoveX + 4] = ')';
        this.visualMap[cookingY + 2][stoveX + 5] = '(';
        this.visualMap[cookingY + 2][stoveX + 11] = ' ';
        this.visualMap[cookingY + 2][stoveX + 12] = ')';
        this.visualMap[cookingY + 2][stoveX + 13] = '(';
        this.visualMap[cookingY + 3][stoveX + 2] = '(';
        this.visualMap[cookingY + 3][stoveX + 3] = '_';
        this.visualMap[cookingY + 3][stoveX + 4] = '_';
        this.visualMap[cookingY + 3][stoveX + 5] = ')';
        this.visualMap[cookingY + 3][stoveX + 10] = '(';
        this.visualMap[cookingY + 3][stoveX + 11] = '_';
        this.visualMap[cookingY + 3][stoveX + 12] = '_';
        this.visualMap[cookingY + 3][stoveX + 13] = ')';
        this.visualMap[cookingY + 4][stoveX + 2] = '/';
        this.visualMap[cookingY + 4][stoveX + 3] = ' ';
        this.visualMap[cookingY + 4][stoveX + 4] = ' ';
        this.visualMap[cookingY + 4][stoveX + 5] = ' ';
        this.visualMap[cookingY + 4][stoveX + 6] = '\\';
        this.visualMap[cookingY + 4][stoveX + 10] = '/';
        this.visualMap[cookingY + 4][stoveX + 11] = ' ';
        this.visualMap[cookingY + 4][stoveX + 12] = ' ';
        this.visualMap[cookingY + 4][stoveX + 13] = ' ';
        this.visualMap[cookingY + 4][stoveX + 14] = '\\';
        this.visualMap[cookingY + 5][stoveX + 2] = '|';
        this.visualMap[cookingY + 5][stoveX + 3] = '_';
        this.visualMap[cookingY + 5][stoveX + 4] = '_';
        this.visualMap[cookingY + 5][stoveX + 5] = '_';
        this.visualMap[cookingY + 5][stoveX + 6] = '|';
        this.visualMap[cookingY + 5][stoveX + 10] = '|';
        this.visualMap[cookingY + 5][stoveX + 11] = '_';
        this.visualMap[cookingY + 5][stoveX + 12] = '_';
        this.visualMap[cookingY + 5][stoveX + 13] = '_';
        this.visualMap[cookingY + 5][stoveX + 14] = '|';
        this.visualMap[cookingY + 6][stoveX + 2] = '[';
        this.visualMap[cookingY + 6][stoveX + 3] = '=';
        this.visualMap[cookingY + 6][stoveX + 4] = '=';
        this.visualMap[cookingY + 6][stoveX + 5] = '=';
        this.visualMap[cookingY + 6][stoveX + 6] = '=';
        this.visualMap[cookingY + 6][stoveX + 7] = 'G';
        this.visualMap[cookingY + 6][stoveX + 8] = 'A';
        this.visualMap[cookingY + 6][stoveX + 9] = 'S';
        this.visualMap[cookingY + 6][stoveX + 10] = '=';
        this.visualMap[cookingY + 6][stoveX + 11] = '=';
        this.visualMap[cookingY + 6][stoveX + 12] = '=';
        this.visualMap[cookingY + 6][stoveX + 13] = '=';
        this.visualMap[cookingY + 6][stoveX + 14] = ']';
        // Gas is dangerous (poison)
        this.setTile(cookingY + 6, stoveX + 7, 'POISON');
        this.setTile(cookingY + 6, stoveX + 8, 'POISON');
        
        // OVENS (right of center)
        const ovenX = centerX + 8;
        this.drawRectWall(ovenX, cookingY, 10, 8, false);
        // Oven visual
        this.visualMap[cookingY + 1][ovenX + 2] = '[';
        this.visualMap[cookingY + 1][ovenX + 3] = '~';
        this.visualMap[cookingY + 1][ovenX + 4] = '~';
        this.visualMap[cookingY + 1][ovenX + 5] = '~';
        this.visualMap[cookingY + 1][ovenX + 6] = '~';
        this.visualMap[cookingY + 1][ovenX + 7] = '~';
        this.visualMap[cookingY + 1][ovenX + 8] = ']';
        this.visualMap[cookingY + 2][ovenX + 2] = '[';
        this.visualMap[cookingY + 2][ovenX + 3] = '~';
        this.visualMap[cookingY + 2][ovenX + 4] = '~';
        this.visualMap[cookingY + 2][ovenX + 5] = '~';
        this.visualMap[cookingY + 2][ovenX + 6] = '~';
        this.visualMap[cookingY + 2][ovenX + 7] = '~';
        this.visualMap[cookingY + 2][ovenX + 8] = ']';
        this.visualMap[cookingY + 3][ovenX + 2] = '[';
        this.visualMap[cookingY + 3][ovenX + 3] = '_';
        this.visualMap[cookingY + 3][ovenX + 4] = '_';
        this.visualMap[cookingY + 3][ovenX + 5] = 'o';
        this.visualMap[cookingY + 3][ovenX + 6] = '_';
        this.visualMap[cookingY + 3][ovenX + 7] = '_';
        this.visualMap[cookingY + 3][ovenX + 8] = ']';
        this.visualMap[cookingY + 4][ovenX + 2] = '|';
        this.visualMap[cookingY + 4][ovenX + 3] = ' ';
        this.visualMap[cookingY + 4][ovenX + 4] = ' ';
        this.visualMap[cookingY + 4][ovenX + 5] = ' ';
        this.visualMap[cookingY + 4][ovenX + 6] = ' ';
        this.visualMap[cookingY + 4][ovenX + 7] = ' ';
        this.visualMap[cookingY + 4][ovenX + 8] = '|';
        this.visualMap[cookingY + 5][ovenX + 2] = '|';
        this.visualMap[cookingY + 5][ovenX + 3] = '_';
        this.visualMap[cookingY + 5][ovenX + 4] = '_';
        this.visualMap[cookingY + 5][ovenX + 5] = '_';
        this.visualMap[cookingY + 5][ovenX + 6] = '_';
        this.visualMap[cookingY + 5][ovenX + 7] = '_';
        this.visualMap[cookingY + 5][ovenX + 8] = '|';
        this.visualMap[cookingY + 6][ovenX + 2] = '[';
        this.visualMap[cookingY + 6][ovenX + 3] = 'H';
        this.visualMap[cookingY + 6][ovenX + 4] = 'O';
        this.visualMap[cookingY + 6][ovenX + 5] = 'T';
        this.visualMap[cookingY + 6][ovenX + 6] = '!';
        this.visualMap[cookingY + 6][ovenX + 7] = '!';
        this.visualMap[cookingY + 6][ovenX + 8] = ']';
        // Oven is dangerous (poison)
        this.setTile(cookingY + 3, ovenX + 5, 'POISON');
        this.setTile(cookingY + 6, ovenX + 4, 'POISON');
        
        // Additional kitchen counters scattered around
        for (let i = 0; i < 8; i++) {
            const pos = this.findEmptyTile();
            if (pos && pos.x > 25 && pos.x < this.mapW - 10) {
                const counterSize = Math.floor(Math.random() * 3) + 2;
                this.drawRectWall(pos.x, pos.y, counterSize, counterSize, true);
            }
        }
    }

    generateDrainOpening() {
        const midX = Math.floor(this.mapW / 2);
        const drainTopY = 3;
        const drainBottomY = 12;
        const bedroomTopY = 13;
        const bedroomBottomY = this.mapH - 2;
        
        // DRAIN OPENING AREA (top section)
        // Left pipe area
        this.drawRectWall(5, drainTopY, 25, drainBottomY - drainTopY, false);
        // Right pipe area  
        this.drawRectWall(midX + 5, drainTopY, 25, drainBottomY - drainTopY, false);
        
        // Center drain opening
        for (let x = midX - 2; x <= midX + 2; x++) {
            this.setTile(drainTopY, x, 'WALL');
            this.setTile(drainBottomY, x, 'WALL');
        }
        
        // Water flow (▓▓▓▓) in pipes
        for (let y = drainTopY + 1; y < drainBottomY; y++) {
            for (let x = 8; x < 25; x++) {
                if (this.map[y][x] === 'EMPTY') {
                    this.visualMap[y][x] = '▓';
                }
            }
            for (let x = midX + 8; x < midX + 25; x++) {
                if (this.map[y][x] === 'EMPTY') {
                    this.visualMap[y][x] = '▓';
                }
            }
        }
        
        // Drain face (o o) in center
        this.visualMap[drainTopY + 5][midX - 1] = '(';
        this.visualMap[drainTopY + 5][midX] = 'o';
        this.visualMap[drainTopY + 5][midX + 1] = ' ';
        this.visualMap[drainTopY + 5][midX + 2] = 'o';
        this.visualMap[drainTopY + 5][midX + 3] = ')';
        
        // Water drops flowing down (v)
        for (let x = midX - 2; x <= midX + 2; x++) {
            this.visualMap[drainBottomY + 1][x] = 'v';
        }
        
        // Leak indicators
        this.visualMap[drainBottomY + 2][midX - 2] = '|';
        this.visualMap[drainBottomY + 2][midX + 2] = '|';
        this.visualMap[drainBottomY + 3][midX - 2] = 'v';
        this.visualMap[drainBottomY + 3][midX + 2] = 'v';
        
        // BEDROOM AREA (bottom section)
        const leftX = 10;
        const rightX = this.mapW - 11;
        const midBedroomY = Math.floor((bedroomTopY + bedroomBottomY) / 2);
        
        // WARDROBE (left side)
        this.drawRectWall(leftX, bedroomTopY, 12, 8, false);
        this.visualMap[bedroomTopY + 1][leftX + 2] = '.';
        this.visualMap[bedroomTopY + 1][leftX + 3] = '-';
        this.visualMap[bedroomTopY + 1][leftX + 4] = '-';
        this.visualMap[bedroomTopY + 1][leftX + 5] = '.';
        this.visualMap[bedroomTopY + 2][leftX + 1] = '/';
        this.visualMap[bedroomTopY + 2][leftX + 5] = '/';
        this.visualMap[bedroomTopY + 3][leftX + 2] = '|';
        this.visualMap[bedroomTopY + 3][leftX + 6] = '|';
        this.visualMap[bedroomTopY + 4][leftX + 2] = '|';
        this.visualMap[bedroomTopY + 4][leftX + 6] = '|';
        this.visualMap[bedroomTopY + 5][leftX + 3] = "'";
        this.visualMap[bedroomTopY + 5][leftX + 4] = '=';
        this.visualMap[bedroomTopY + 5][leftX + 5] = '=';
        this.setTile(bedroomTopY + 6, leftX + 5, 'FOOD'); // Shoes
        
        // WORK DESK (center-left)
        const deskX = leftX + 20;
        this.drawRectWall(deskX, bedroomTopY + 2, 15, 6, false);
        this.visualMap[bedroomTopY + 3][deskX + 2] = '.';
        this.visualMap[bedroomTopY + 3][deskX + 3] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 4] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 5] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 6] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 7] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 8] = '-';
        this.visualMap[bedroomTopY + 3][deskX + 9] = '.';
        this.visualMap[bedroomTopY + 4][deskX + 2] = '|';
        this.visualMap[bedroomTopY + 4][deskX + 3] = ' ';
        this.visualMap[bedroomTopY + 4][deskX + 4] = '.';
        this.visualMap[bedroomTopY + 4][deskX + 5] = '-';
        this.visualMap[bedroomTopY + 4][deskX + 6] = '-';
        this.visualMap[bedroomTopY + 4][deskX + 7] = '-';
        this.visualMap[bedroomTopY + 4][deskX + 8] = '-';
        this.visualMap[bedroomTopY + 4][deskX + 9] = '-';
        this.visualMap[bedroomTopY + 4][deskX + 10] = '.';
        this.visualMap[bedroomTopY + 4][deskX + 11] = ' ';
        this.visualMap[bedroomTopY + 4][deskX + 12] = '_';
        this.visualMap[bedroomTopY + 5][deskX + 2] = '|';
        this.visualMap[bedroomTopY + 5][deskX + 3] = ' ';
        this.visualMap[bedroomTopY + 5][deskX + 4] = "'";
        this.visualMap[bedroomTopY + 5][deskX + 5] = '-';
        this.visualMap[bedroomTopY + 5][deskX + 6] = '-';
        this.visualMap[bedroomTopY + 5][deskX + 7] = '-';
        this.visualMap[bedroomTopY + 5][deskX + 8] = '-';
        this.visualMap[bedroomTopY + 5][deskX + 9] = '-';
        this.visualMap[bedroomTopY + 5][deskX + 10] = "'";
        this.visualMap[bedroomTopY + 6][deskX + 3] = '|';
        this.visualMap[bedroomTopY + 6][deskX + 4] = ' ';
        this.visualMap[bedroomTopY + 6][deskX + 5] = '[';
        this.visualMap[bedroomTopY + 6][deskX + 6] = 'K';
        this.visualMap[bedroomTopY + 6][deskX + 7] = 'b';
        this.visualMap[bedroomTopY + 6][deskX + 8] = ']';
        this.visualMap[bedroomTopY + 6][deskX + 9] = ' ';
        this.visualMap[bedroomTopY + 6][deskX + 10] = '[';
        this.visualMap[bedroomTopY + 6][deskX + 11] = 'M';
        this.visualMap[bedroomTopY + 6][deskX + 12] = 's';
        this.visualMap[bedroomTopY + 6][deskX + 13] = ']';
        this.visualMap[bedroomTopY + 7][deskX + 3] = '/';
        this.visualMap[bedroomTopY + 7][deskX + 4] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 5] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 6] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 7] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 8] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 9] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 10] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 11] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 12] = '_';
        this.visualMap[bedroomTopY + 7][deskX + 13] = '\\';
        this.setTile(bedroomTopY + 4, deskX + 7, 'FOOD'); // Computer screen
        
        // WINDOW (right side)
        const windowX = rightX - 10;
        this.drawRectWall(windowX, bedroomTopY + 1, 10, 7, false);
        this.visualMap[bedroomTopY + 2][windowX + 1] = '+';
        this.visualMap[bedroomTopY + 2][windowX + 2] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 3] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 4] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 5] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 6] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 7] = '=';
        this.visualMap[bedroomTopY + 2][windowX + 8] = '+';
        this.visualMap[bedroomTopY + 3][windowX + 3] = '*';
        this.visualMap[bedroomTopY + 3][windowX + 4] = ' ';
        this.visualMap[bedroomTopY + 3][windowX + 5] = '*';
        this.visualMap[bedroomTopY + 4][windowX + 4] = '*';
        this.setTile(bedroomTopY + 6, windowX + 2, 'FOOD'); // Plant
        this.visualMap[bedroomTopY + 7][windowX + 2] = 'v';
        this.visualMap[bedroomTopY + 7][windowX + 3] = ' ';
        this.visualMap[bedroomTopY + 7][windowX + 4] = 'v';
        this.visualMap[bedroomTopY + 7][windowX + 5] = ' ';
        this.visualMap[bedroomTopY + 7][windowX + 6] = 'v';
        this.visualMap[bedroomTopY + 8][windowX + 2] = '\\';
        this.visualMap[bedroomTopY + 8][windowX + 3] = '|';
        this.visualMap[bedroomTopY + 8][windowX + 4] = '/';
        this.visualMap[bedroomTopY + 8][windowX + 5] = '|';
        this.visualMap[bedroomTopY + 8][windowX + 6] = '/';
        
        // QUEEN BED (center-bottom)
        const bedX = leftX + 15;
        const bedY = bedroomBottomY - 8;
        this.drawRectWall(bedX, bedY, 20, 8, false);
        this.visualMap[bedY + 1][bedX + 1] = '.';
        this.visualMap[bedY + 1][bedX + 2] = '-';
        this.visualMap[bedY + 1][bedX + 3] = '-';
        this.visualMap[bedY + 1][bedX + 4] = '-';
        this.visualMap[bedY + 1][bedX + 5] = '.';
        this.visualMap[bedY + 2][bedX] = '/';
        this.visualMap[bedY + 2][bedX + 1] = ' ';
        this.visualMap[bedY + 2][bedX + 2] = ' ';
        this.visualMap[bedY + 2][bedX + 3] = ' ';
        this.visualMap[bedY + 2][bedX + 4] = ' ';
        this.visualMap[bedY + 2][bedX + 5] = ' ';
        this.visualMap[bedY + 2][bedX + 6] = ' ';
        this.visualMap[bedY + 2][bedX + 7] = ' ';
        this.visualMap[bedY + 2][bedX + 8] = ' ';
        this.visualMap[bedY + 2][bedX + 9] = ' ';
        this.visualMap[bedY + 2][bedX + 10] = ' ';
        this.visualMap[bedY + 2][bedX + 11] = ' ';
        this.visualMap[bedY + 2][bedX + 12] = ' ';
        this.visualMap[bedY + 2][bedX + 13] = ' ';
        this.visualMap[bedY + 2][bedX + 14] = ' ';
        this.visualMap[bedY + 2][bedX + 15] = ' ';
        this.visualMap[bedY + 2][bedX + 16] = ' ';
        this.visualMap[bedY + 2][bedX + 17] = ' ';
        this.visualMap[bedY + 2][bedX + 18] = '/';
        this.visualMap[bedY + 2][bedX + 19] = '|';
        this.visualMap[bedY + 3][bedX] = '/';
        this.visualMap[bedY + 3][bedX + 1] = '_';
        this.visualMap[bedY + 3][bedX + 2] = '_';
        this.visualMap[bedY + 3][bedX + 3] = '_';
        this.visualMap[bedY + 3][bedX + 4] = '_';
        this.visualMap[bedY + 3][bedX + 5] = '_';
        this.visualMap[bedY + 3][bedX + 6] = '_';
        this.visualMap[bedY + 3][bedX + 7] = '_';
        this.visualMap[bedY + 3][bedX + 8] = '_';
        this.visualMap[bedY + 3][bedX + 9] = '_';
        this.visualMap[bedY + 3][bedX + 10] = '_';
        this.visualMap[bedY + 3][bedX + 11] = '_';
        this.visualMap[bedY + 3][bedX + 12] = '_';
        this.visualMap[bedY + 3][bedX + 13] = '_';
        this.visualMap[bedY + 3][bedX + 14] = '_';
        this.visualMap[bedY + 3][bedX + 15] = '_';
        this.visualMap[bedY + 3][bedX + 16] = '_';
        this.visualMap[bedY + 3][bedX + 17] = '_';
        this.visualMap[bedY + 3][bedX + 18] = '/';
        this.visualMap[bedY + 3][bedX + 19] = '|';
        this.visualMap[bedY + 4][bedX + 2] = '|';
        this.visualMap[bedY + 4][bedX + 3] = ' ';
        this.visualMap[bedY + 4][bedX + 4] = ' ';
        this.visualMap[bedY + 4][bedX + 5] = ' ';
        this.visualMap[bedY + 4][bedX + 6] = ' ';
        this.visualMap[bedY + 4][bedX + 7] = ' ';
        this.visualMap[bedY + 4][bedX + 8] = ' ';
        this.visualMap[bedY + 4][bedX + 9] = '=';
        this.visualMap[bedY + 4][bedX + 10] = '=';
        this.visualMap[bedY + 4][bedX + 11] = '=';
        this.visualMap[bedY + 4][bedX + 12] = '=';
        this.visualMap[bedY + 4][bedX + 13] = ' ';
        this.visualMap[bedY + 4][bedX + 14] = ' ';
        this.visualMap[bedY + 4][bedX + 15] = ' ';
        this.visualMap[bedY + 4][bedX + 16] = ' ';
        this.visualMap[bedY + 4][bedX + 17] = '|';
        this.visualMap[bedY + 5][bedX + 2] = '|';
        this.visualMap[bedY + 5][bedX + 3] = '_';
        this.visualMap[bedY + 5][bedX + 4] = '_';
        this.visualMap[bedY + 5][bedX + 5] = '_';
        this.visualMap[bedY + 5][bedX + 6] = '_';
        this.visualMap[bedY + 5][bedX + 7] = '_';
        this.visualMap[bedY + 5][bedX + 8] = '_';
        this.visualMap[bedY + 5][bedX + 9] = '_';
        this.visualMap[bedY + 5][bedX + 10] = '_';
        this.visualMap[bedY + 5][bedX + 11] = '_';
        this.visualMap[bedY + 5][bedX + 12] = '_';
        this.visualMap[bedY + 5][bedX + 13] = '_';
        this.visualMap[bedY + 5][bedX + 14] = '_';
        this.visualMap[bedY + 5][bedX + 15] = '_';
        this.visualMap[bedY + 5][bedX + 16] = '_';
        this.visualMap[bedY + 5][bedX + 17] = '|';
        this.visualMap[bedY + 5][bedX + 18] = '/';
        this.setTile(bedY + 2, bedX + 10, 'FOOD'); // Bed items
        
        // RUG (patterned area near bed)
        const rugX = bedX + 25;
        const rugY = bedY + 2;
        for (let y = rugY; y < rugY + 4; y++) {
            for (let x = rugX; x < rugX + 15; x++) {
                if (this.map[y][x] === 'EMPTY') {
                    this.visualMap[y][x] = ':';
                }
            }
        }
        
        // SLEEPING CAT (on rug) - place as enemy
        const catX = rugX + 7;
        const catY = rugY + 1;
        this.visualMap[catY][catX] = '|';
        this.visualMap[catY][catX + 1] = '\\';
        this.visualMap[catY][catX + 2] = '_';
        this.visualMap[catY][catX + 3] = '_';
        this.visualMap[catY][catX + 4] = '/';
        this.visualMap[catY][catX + 5] = ',';
        this.visualMap[catY][catX + 6] = '|';
        this.visualMap[catY + 1][catX - 1] = '_';
        this.visualMap[catY + 1][catX] = '.';
        this.visualMap[catY + 1][catX + 1] = '|';
        this.visualMap[catY + 1][catX + 2] = 'o';
        this.visualMap[catY + 1][catX + 3] = ' ';
        this.visualMap[catY + 1][catX + 4] = 'o';
        this.visualMap[catY + 1][catX + 5] = ' ';
        this.visualMap[catY + 1][catX + 6] = '|';
        this.visualMap[catY + 1][catX + 7] = '_';
        // Cat body (simplified)
        this.visualMap[catY + 2][catX - 2] = '-';
        this.visualMap[catY + 2][catX - 1] = '(';
        this.visualMap[catY + 2][catX] = '(';
        this.visualMap[catY + 2][catX + 1] = '(';
        this.visualMap[catY + 2][catX + 2] = '-';
        this.visualMap[catY + 2][catX + 3] = '-';
        this.visualMap[catY + 2][catX + 4] = '-';
        this.visualMap[catY + 2][catX + 5] = '(';
        this.visualMap[catY + 2][catX + 6] = '(';
        this.visualMap[catY + 2][catX + 7] = '(';
        // Place sleeping cat as enemy on the rug
        if (this.map[catY + 1][catX + 2] === 'EMPTY') {
            this.enemies.push({ x: catX + 2, y: catY + 1, id: 999 });
        }
        
        // CAT TREE (far right)
        const catTreeX = rightX - 5;
        const catTreeY = bedroomBottomY - 10;
        this.drawRectWall(catTreeX, catTreeY, 8, 10, false);
        this.visualMap[catTreeY + 1][catTreeX + 1] = '+';
        this.visualMap[catTreeY + 1][catTreeX + 2] = '-';
        this.visualMap[catTreeY + 1][catTreeX + 3] = '-';
        this.visualMap[catTreeY + 1][catTreeX + 4] = '-';
        this.visualMap[catTreeY + 1][catTreeX + 5] = '-';
        this.visualMap[catTreeY + 1][catTreeX + 6] = '-';
        this.visualMap[catTreeY + 1][catTreeX + 7] = '+';
        this.visualMap[catTreeY + 2][catTreeX + 2] = '|';
        this.visualMap[catTreeY + 2][catTreeX + 3] = ' ';
        this.visualMap[catTreeY + 2][catTreeX + 4] = '[';
        this.visualMap[catTreeY + 2][catTreeX + 5] = '=';
        this.visualMap[catTreeY + 2][catTreeX + 6] = '=';
        this.visualMap[catTreeY + 2][catTreeX + 7] = '=';
        this.visualMap[catTreeY + 2][catTreeX + 8] = '=';
        this.visualMap[catTreeY + 2][catTreeX + 9] = ']';
        this.visualMap[catTreeY + 2][catTreeX + 10] = ' ';
        this.visualMap[catTreeY + 2][catTreeX + 11] = '|';
        this.visualMap[catTreeY + 3][catTreeX + 2] = '|';
        this.visualMap[catTreeY + 3][catTreeX + 3] = ' ';
        this.visualMap[catTreeY + 3][catTreeX + 4] = '|';
        this.visualMap[catTreeY + 3][catTreeX + 5] = ' ';
        this.visualMap[catTreeY + 3][catTreeX + 6] = ' ';
        this.visualMap[catTreeY + 3][catTreeX + 7] = '|';
        this.visualMap[catTreeY + 3][catTreeX + 8] = ' ';
        this.visualMap[catTreeY + 3][catTreeX + 9] = '|';
        this.visualMap[catTreeY + 3][catTreeX + 10] = ' ';
        this.visualMap[catTreeY + 3][catTreeX + 11] = '|';
        this.visualMap[catTreeY + 4][catTreeX + 2] = '|';
        this.visualMap[catTreeY + 4][catTreeX + 3] = ' ';
        this.visualMap[catTreeY + 4][catTreeX + 4] = '|';
        this.visualMap[catTreeY + 4][catTreeX + 5] = ' ';
        this.visualMap[catTreeY + 4][catTreeX + 6] = ' ';
        this.visualMap[catTreeY + 4][catTreeX + 7] = '|';
        this.visualMap[catTreeY + 4][catTreeX + 8] = ' ';
        this.visualMap[catTreeY + 4][catTreeX + 9] = '|';
        this.visualMap[catTreeY + 4][catTreeX + 10] = ' ';
        this.visualMap[catTreeY + 4][catTreeX + 11] = '|';
        this.visualMap[catTreeY + 5][catTreeX + 2] = '|';
        this.visualMap[catTreeY + 5][catTreeX + 3] = ' ';
        this.visualMap[catTreeY + 5][catTreeX + 4] = '|';
        this.visualMap[catTreeY + 5][catTreeX + 5] = ' ';
        this.visualMap[catTreeY + 5][catTreeX + 6] = ' ';
        this.visualMap[catTreeY + 5][catTreeX + 7] = '|';
        this.visualMap[catTreeY + 5][catTreeX + 8] = ' ';
        this.visualMap[catTreeY + 5][catTreeX + 9] = '|';
        this.visualMap[catTreeY + 5][catTreeX + 10] = ' ';
        this.visualMap[catTreeY + 5][catTreeX + 11] = '|';
        this.visualMap[catTreeY + 6][catTreeX + 3] = ' ';
        this.visualMap[catTreeY + 6][catTreeX + 4] = '/';
        this.visualMap[catTreeY + 6][catTreeX + 5] = '_';
        this.visualMap[catTreeY + 6][catTreeX + 6] = '\\';
        this.visualMap[catTreeY + 7][catTreeX + 4] = ' ';
        this.visualMap[catTreeY + 7][catTreeX + 5] = '(';
        this.visualMap[catTreeY + 7][catTreeX + 6] = 'o';
        this.visualMap[catTreeY + 7][catTreeX + 7] = ' ';
        this.visualMap[catTreeY + 7][catTreeX + 8] = 'o';
        this.visualMap[catTreeY + 7][catTreeX + 9] = ')';
        this.setTile(catTreeY + 2, catTreeX + 5, 'FOOD'); // Cat tree platform
    }

    drawRectWall(x, y, w, h, filled) {
        for(let i=0; i<h; i++) {
            for(let j=0; j<w; j++) {
                if (filled || (i===0 || i===h-1 || j===0 || j===w-1)) {
                    this.setTile(y+i, x+j, 'WALL');
                }
            }
        }
    }

    setTile(y, x, type) {
        if (y >= 0 && y < this.mapH && x >= 0 && x < this.mapW) {
            this.map[y][x] = type;
        }
    }

    setRandomTile(type) {
        const pos = this.findEmptyTile();
        if (pos) this.map[pos.y][pos.x] = type;
    }

    findEmptyTile() {
        let safety = 0;
        while(safety < 2000) {
            const x = Math.floor(Math.random() * (this.mapW-2)) + 1;
            const y = Math.floor(Math.random() * (this.mapH-2)) + 1;
            // For wet market, exclude left starting area (x < 6)
            // For other levels, exclude top-left corner (x<4 && y<4)
            const excludeArea = (this.biome && this.biome.layout === "wet_market") 
                ? (x < 6) 
                : (x < 4 && y < 4);
            if (this.map[y][x] === 'EMPTY' && !excludeArea) { 
                return {x, y};
            }
            safety++;
        }
        return null;
    }

    handleInput(dx, dy) {
        if (this.isGameOver) return;

        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        if (newX < 0 || newX >= this.mapW || newY < 0 || newY >= this.mapH) return;

        const targetType = this.map[newY][newX];

        let moved = false;

        if (targetType === 'WALL') {
            // Blocked
        } else {
            if (targetType === 'GLUE') {
                if (Math.random() > 0.5) {
                    this.log(FLAVOR_TEXT.glue);
                    this.endTurn(true); 
                    return;
                }
            }

            this.playerPos.x = newX;
            this.playerPos.y = newY;
            moved = true;

            if (targetType === 'FOOD') {
                this.score += 50;
                this.grit = Math.min(MAX_GRIT, this.grit + 2); // RESTORE +2
                this.map[newY][newX] = 'EMPTY';
                this.log(FLAVOR_TEXT.food[Math.floor(Math.random()*3)], 'info');
            } 
            else if (targetType === 'FOOD_CHUNK') {
                this.score += 20;
                this.grit = Math.min(MAX_GRIT, this.grit + 2); // RESTORE +2
                this.map[newY][newX] = 'EMPTY'; 
                this.log("Ate a piece of Giant Food.", 'info');
            }
            else if (targetType === 'POISON') {
                this.grit -= 4;
                this.map[newY][newX] = 'EMPTY';
                this.log(FLAVOR_TEXT.poison, 'danger');
            } else if (targetType === 'EXIT') {
                this.level++;
                this.score += 200;
                this.log(FLAVOR_TEXT.level_up, 'new');
                this.startLevel();
                return;
            }
        }

        if (dx === 0 && dy === 0) moved = true;

        if (moved) this.endTurn();
    }

    endTurn(struggled = false) {
        this.grit -= HUNGER_RATE;
        this.updateEnemies();

        this.updateCamera();

        if (this.stompTimer > 0) {
            this.stompTimer--;
            if (this.stompTimer === 0) this.triggerStomp();
        } else if (Math.random() < 0.05) {
            this.startStomp();
        }

        this.checkDeath();
        this.render();
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            const dx = this.playerPos.x - enemy.x;
            const dy = this.playerPos.y - enemy.y;
            
            let moveX = 0;
            let moveY = 0;

            if (Math.abs(dx) > Math.abs(dy)) {
                moveX = dx > 0 ? 1 : -1;
            } else if (Math.abs(dy) > 0) {
                moveY = dy > 0 ? 1 : -1;
            } else {
                if(Math.random() > 0.5) moveX = Math.random() > 0.5 ? 1 : -1;
            }

            const nx = enemy.x + moveX;
            const ny = enemy.y + moveY;

            if (nx > 0 && nx < this.mapW-1 && ny > 0 && ny < this.mapH-1 && this.map[ny][nx] !== 'WALL') {
                const otherEnemy = this.enemies.find(e => e.x === nx && e.y === ny && e !== enemy);
                if (!otherEnemy) {
                    enemy.x = nx;
                    enemy.y = ny;
                }
            }

            if (enemy.x === this.playerPos.x && enemy.y === this.playerPos.y) {
                this.grit -= 3;
                this.log(`ATTACKED by ${this.biome.enemyName}!`, 'danger');
            }
        });
    }

    startStomp() {
        this.stompTimer = 2; 
        this.stompTarget = { 
            x: Math.max(1, Math.min(this.mapW-2, this.playerPos.x + (Math.floor(Math.random() * 3) - 1))), 
            y: Math.max(1, Math.min(this.mapH-2, this.playerPos.y + (Math.floor(Math.random() * 3) - 1))) 
        };
        
        const warning = this.biome.pattern === 'face' ? "THE SLEEPER TOSSES & TURNS..." : FLAVOR_TEXT.stomp_warn;
        this.log(warning, 'danger');
    }

    triggerStomp() {
        if (!this.stompTarget) return;
        const tx = this.stompTarget.x;
        const ty = this.stompTarget.y;
        
        if (Math.abs(this.playerPos.x - tx) <= 1 && Math.abs(this.playerPos.y - ty) <= 1) {
            this.grit -= 8;
            const hitMsg = this.biome.pattern === 'face' ? "CRUSHED BY PILLOW." : FLAVOR_TEXT.stomp_hit;
            this.log(hitMsg, 'danger');
        } else {
            this.log(FLAVOR_TEXT.stomp_miss, 'normal');
        }
        
        setTimeout(() => { this.stompTarget = null; this.render(); }, 400);
    }

    checkDeath() {
        if (this.grit <= 0) {
            this.isGameOver = true;
            this.deathReasonEl.textContent = "Vital Signs: ZERO.";
            this.gameOverModal.style.display = 'block';
        }
    }

    retryLevel() {
        this.isGameOver = false;
        this.gameOverModal.style.display = 'none';
        this.score = this.levelStartScore; 
        this.log("TIMELINE RESET. TRY AGAIN.", 'info');
        this.startLevel(); 
    }

    render() {
        this.gridEl.innerHTML = '';

        this.gritEl.textContent = `GRIT:${Math.ceil(this.grit)}`;
        this.scoreEl.textContent = `SCR:${this.score}`;
        this.levelEl.textContent = `L:${this.level}`;
        
        if (this.grit < 5) this.gritEl.style.color = "var(--danger-red)";
        else this.gritEl.style.color = "var(--safe-green)";

        for (let y = 0; y < this.mapH; y++) {
            for (let x = 0; x < this.mapW; x++) {
                const tileDiv = document.createElement('div');
                tileDiv.className = 'tile';
                
                let char = this.visualMap[y][x];
                let className = 'floor';
                
                const type = this.map[y][x];
                
                if (x === this.playerPos.x && y === this.playerPos.y) {
                    char = TILES.PLAYER;
                    className = 'player';
                } else {
                    const enemyHere = this.enemies.find(e => e.x === x && e.y === y);
                    if (enemyHere) {
                        char = this.biome.enemyChar;
                        className = 'enemy';
                    } else if (type === 'WALL') {
                        char = this.biome.wallChar;
                        className = 'wall';
                    } else if (type === 'FOOD') {
                        char = TILES.FOOD;
                        className = 'food crumb';
                    } else if (type === 'FOOD_CHUNK') {
                        char = this.foodVisuals[y][x];
                        className = 'food';
                    } else if (type === 'POISON') {
                        char = TILES.POISON;
                        className = 'poison';
                    } else if (type === 'GLUE') {
                        char = TILES.GLUE;
                        className = 'glue';
                    } else if (type === 'EXIT') {
                        char = TILES.EXIT;
                        className = 'exit';
                    }
                }

                if (this.stompTarget) {
                     const tx = this.stompTarget.x;
                     const ty = this.stompTarget.y;
                     if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1) {
                         tileDiv.classList.add(this.stompTimer === 0 ? 'impact' : 'warning');
                     }
                }
                
                tileDiv.textContent = char;
                
                className.split(' ').forEach(cls => tileDiv.classList.add(cls));

                this.gridEl.appendChild(tileDiv);
            }
        }
    }

    bindInput() {
        document.addEventListener('keydown', (e) => {
            if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
            
            switch(e.key) {
                case 'ArrowUp': case 'w': this.handleInput(0, -1); break;
                case 'ArrowDown': case 's': this.handleInput(0, 1); break;
                case 'ArrowLeft': case 'a': this.handleInput(-1, 0); break;
                case 'ArrowRight': case 'd': this.handleInput(1, 0); break;
                case 'Enter': case ' ': this.handleInput(0, 0); break;
            }
        });

        document.getElementById('btn-up').onclick = () => this.handleInput(0, -1);
        document.getElementById('btn-down').onclick = () => this.handleInput(0, 1);
        document.getElementById('btn-left').onclick = () => this.handleInput(-1, 0);
        document.getElementById('btn-right').onclick = () => this.handleInput(1, 0);
        document.getElementById('btn-wait').onclick = () => this.handleInput(0, 0);
        document.getElementById('btn-skip').onclick = () => this.skipLevel();
    }
}

const game = new NeonScuttle();

