// Game State
let currentStage = 1;
let puzzlesSolved = 0;
let totalPuzzles = 4;
let cockroach = null;
let obstacles = [];
let interactiveElements = [];

const stageData = {
    1: {
        title: "Stage 1: Nymph",
        adaptation: "Speed",
        description: "You are a young nymph. Use your incredible speed to escape danger!",
        instruction: "Click quickly on moving obstacles to dodge them before they hit you.",
        obstacles: [
            { id: 1, x: 300, y: 200, width: 100, height: 100, text: "Fast Moving", speed: 2, direction: 1, solved: false },
            { id: 2, x: 600, y: 350, width: 100, height: 100, text: "Quick Dodge", speed: 3, direction: -1, solved: false },
            { id: 3, x: 900, y: 150, width: 100, height: 100, text: "Speed Test", speed: 2.5, direction: 1, solved: false },
            { id: 4, x: 1200, y: 450, width: 100, height: 100, text: "Final Sprint", speed: 4, direction: -1, solved: false }
        ],
        goal: { x: 90, y: 90 }
    },
    2: {
        title: "Stage 2: Adult",
        adaptation: "Hard Exoskeleton",
        description: "You are an adult cockroach. Use your hard exoskeleton to break through barriers!",
        instruction: "Click on barriers to break through them with your armored body.",
        obstacles: [
            { id: 1, x: 250, y: 200, width: 120, height: 120, text: "Weak Barrier", health: 1, solved: false },
            { id: 2, x: 550, y: 300, width: 120, height: 120, text: "Medium Barrier", health: 2, solved: false },
            { id: 3, x: 850, y: 150, width: 120, height: 120, text: "Strong Barrier", health: 3, solved: false },
            { id: 4, x: 1150, y: 400, width: 120, height: 120, text: "Tough Barrier", health: 4, solved: false }
        ],
        goal: { x: 90, y: 90 }
    },
    3: {
        title: "Stage 3: Reproduction",
        adaptation: "Reproductive Power",
        description: "You are a mature adult. Use your reproductive power to multiply and overcome obstacles!",
        instruction: "Click to create clones that can help you reach multiple goals simultaneously.",
        obstacles: [
            { id: 1, x: 200, y: 200, width: 100, height: 100, text: "Multi-Target 1", solved: false },
            { id: 2, x: 600, y: 300, width: 100, height: 100, text: "Multi-Target 2", solved: false },
            { id: 3, x: 1000, y: 150, width: 100, height: 100, text: "Multi-Target 3", solved: false },
            { id: 4, x: 1400, y: 400, width: 100, height: 100, text: "Multi-Target 4", solved: false }
        ],
        goal: { x: 90, y: 90 },
        clones: 0,
        maxClones: 4
    },
    4: {
        title: "Stage 4: Egg",
        adaptation: "Small Size",
        description: "You are a cockroach egg. Use your small size to navigate through tight spaces!",
        instruction: "Click on the narrow gaps between obstacles to squeeze through.",
        obstacles: [
            { id: 1, x: 200, y: 200, width: 150, height: 100, text: "Large Gap", solved: false },
            { id: 2, x: 500, y: 300, width: 80, height: 60, text: "Tight Space", solved: false },
            { id: 3, x: 800, y: 150, width: 120, height: 80, text: "Narrow Passage", solved: false },
            { id: 4, x: 1100, y: 400, width: 70, height: 50, text: "Tiny Opening", solved: false }
        ],
        goal: { x: 90, y: 90 }
    }
};

function startGame() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-ui').classList.add('active');
    setTimeout(() => {
        loadStage(1);
    }, 500);
}

function loadStage(stageNum) {
    currentStage = stageNum;
    const stage = stageData[stageNum];
    
    // Update UI
    document.getElementById('stage-title').textContent = stage.title;
    document.getElementById('adaptation-badge').textContent = stage.adaptation;
    updateProgress();
    
    // Set stage class
    const gameArea = document.getElementById('game-area');
    gameArea.className = 'game-area stage-' + stageNum;
    
    // Reset cockroach
    cockroach = document.getElementById('cockroach');
    cockroach.style.left = '50px';
    cockroach.style.top = '50%';
    cockroach.className = 'cockroach';
    
    // Add stage-specific class
    if (stageNum === 1) cockroach.classList.add('fast');
    if (stageNum === 2) cockroach.classList.add('armored');
    if (stageNum === 4) cockroach.classList.add('small');
    
    // Clear previous obstacles
    obstacles = [];
    document.querySelectorAll('.obstacle').forEach(el => el.remove());
    
    // Create obstacles
    stage.obstacles.forEach(obs => {
        createObstacle(obs, stageNum);
    });
    
    // Show dialog
    showDialog(stage.title, stage.description + ' ' + stage.instruction);
    
    // Reset puzzle count
    puzzlesSolved = 0;
    
    // Stage-specific setup
    if (stageNum === 1) {
        startMovingObstacles();
    }
    if (stageNum === 3) {
        stageData[3].clones = 0;
    }
}

function createObstacle(obsData, stageNum) {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.id = 'obstacle-' + obsData.id;
    obstacle.style.left = obsData.x + 'px';
    obstacle.style.top = obsData.y + 'px';
    obstacle.style.width = obsData.width + 'px';
    obstacle.style.height = obsData.height + 'px';
    obstacle.textContent = obsData.text;
    
    obstacle.addEventListener('click', () => handleObstacleClick(obsData, stageNum, obstacle));
    
    document.getElementById('game-area').appendChild(obstacle);
    obstacles.push({ element: obstacle, data: obsData });
}

function handleObstacleClick(obsData, stageNum, element) {
    if (obsData.solved) return;
    
    let solved = false;
    
    switch(stageNum) {
        case 1: // Speed - click while moving
            solved = true; // Speed is handled by timing
            break;
            
        case 2: // Hard Exoskeleton - break barriers
            if (!obsData.health) obsData.health = 1;
            obsData.health--;
            if (obsData.health <= 0) {
                solved = true;
            } else {
                element.textContent = obsData.text + ' (' + obsData.health + ' hits left)';
                element.style.background = `rgba(255, ${255 - obsData.health * 50}, 0, 0.3)`;
                return;
            }
            break;
            
        case 3: // Reproductive Power - create clones
            if (stageData[3].clones < stageData[3].maxClones) {
                createClone(obsData.x, obsData.y);
                stageData[3].clones++;
                if (stageData[3].clones >= stageData[3].maxClones) {
                    solved = true;
                    // Mark all obstacles as solved
                    stageData[3].obstacles.forEach(o => o.solved = true);
                    document.querySelectorAll('.obstacle').forEach(el => {
                        el.classList.add('solved');
                    });
                }
            }
            return;
            
        case 4: // Small Size - click on small obstacles
            if (obsData.width < 100 || obsData.height < 70) {
                solved = true;
            }
            break;
    }
    
    if (solved) {
        obsData.solved = true;
        element.classList.add('solved');
        puzzlesSolved++;
        updateProgress();
        
        // Move cockroach to obstacle
        moveCockroachTo(obsData.x + obsData.width / 2, obsData.y + obsData.height / 2);
        
        // Check if stage complete
        setTimeout(() => {
            if (puzzlesSolved >= totalPuzzles) {
                completeStage();
            }
        }, 500);
    } else {
        showTooltip(element, "Try a different approach!");
    }
}

function createClone(x, y) {
    const clone = document.createElement('div');
    clone.className = 'cockroach';
    clone.style.left = x + 'px';
    clone.style.top = y + 'px';
    clone.style.position = 'absolute';
    document.getElementById('game-area').appendChild(clone);
    
    setTimeout(() => {
        clone.style.opacity = '0';
        clone.style.transition = 'opacity 0.5s';
    }, 100);
}

function moveCockroachTo(x, y) {
    cockroach.classList.add('moving');
    cockroach.style.left = x + 'px';
    cockroach.style.top = y + 'px';
    setTimeout(() => {
        cockroach.classList.remove('moving');
    }, 500);
}

function startMovingObstacles() {
    const moveInterval = setInterval(() => {
        if (currentStage !== 1) {
            clearInterval(moveInterval);
            return;
        }
        
        obstacles.forEach(obs => {
            if (obs.data.speed && !obs.data.solved) {
                let newX = parseFloat(obs.element.style.left) + (obs.data.speed * obs.data.direction * 2);
                if (newX > window.innerWidth - obs.data.width || newX < 0) {
                    obs.data.direction *= -1;
                }
                obs.element.style.left = newX + 'px';
            }
        });
    }, 16);
}

function showDialog(title, text) {
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-text').textContent = text;
    document.getElementById('dialog').classList.add('show');
}

function closeDialog() {
    document.getElementById('dialog').classList.remove('show');
}

function showTooltip(element, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = text;
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 40) + 'px';
    tooltip.classList.add('show');
    
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 2000);
}

function updateProgress() {
    const progress = (puzzlesSolved / totalPuzzles) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

function completeStage() {
    setTimeout(() => {
        if (currentStage < 4) {
            showDialog(
                'Stage Complete!',
                `You've mastered ${stageData[currentStage].adaptation}! Moving to the next stage...`
            );
            setTimeout(() => {
                closeDialog();
                loadStage(currentStage + 1);
            }, 2000);
        } else {
            // Game complete!
            document.getElementById('success-screen').classList.add('show');
        }
    }, 1000);
}

function restartGame() {
    document.getElementById('success-screen').classList.remove('show');
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('game-ui').classList.remove('active');
    currentStage = 1;
    puzzlesSolved = 0;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add click handler for cockroach (optional interaction)
    document.getElementById('cockroach').addEventListener('click', () => {
        showTooltip(document.getElementById('cockroach'), 
            `Current adaptation: ${stageData[currentStage].adaptation}`);
    });
});











