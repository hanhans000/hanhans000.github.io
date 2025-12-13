class ArboriasAscent {
    constructor(outputElement, inputElement, submitButton, restartButton, trackerOutput) {
        this.stage = 0; 
        this.gameOver = false;
        this.outputElement = outputElement;
        this.inputElement = inputElement;
        this.submitButton = submitButton;
        this.restartButton = restartButton;
        this.trackerOutput = trackerOutput;

        this.environment = {};
        this.targetRange = {};
        this.tilesPlaced = []; // Tracks tiles currently placed

        this.TILE_DEFINITIONS = {
            'drip': { name: 'Irrigation Drip', cost: 1, effects: { moisture: 3, light: 0, nutrient: 0 } },
            'shade': { name: 'Shade Cloth', cost: 1, effects: { moisture: 0, light: -4, nutrient: 0 } },
            'compost': { name: 'Compost Pile', cost: 1, effects: { moisture: 1, light: 0, nutrient: 2 } },
            'stone': { name: 'Reflective Stone', cost: 1, effects: { moisture: -1, light: 3, nutrient: 0 } },
            'drain': { name: 'Drainage Channel', cost: 1, effects: { moisture: -3, light: 0, nutrient: 0 } }
        };

        this.stageLogic = [
            this._stageOne.bind(this),
            this._stageTwo.bind(this),
            this._stageThree.bind(this),
            this._stageFour.bind(this),
            this._stageFive.bind(this)
        ];

        this.currentStageResolver = null;
        this.movesRemaining = 0;

        this._setupEventListeners();
        this._updateTrackers();
        this._printGameMessage("Welcome to Arboria's Ascent! Type 'start' to begin.");
        this._enableInput();
    }

    _setupEventListeners() {
        this.submitButton.addEventListener('click', () => this._handleInput());
        this.inputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this._handleInput();
            }
        });
        this.restartButton.addEventListener('click', () => this.restart());
    }

    _printGameMessage(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = message
            .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
            .replace(/✅/g, '<span class="success">✅</span>')
            .replace(/❌/g, '<span class="error">❌</span>')
            .replace(/🚨/g, '<span class="error">🚨</span>')
            .replace(/🎉/g, '<span class="success">🎉</span>')
            .replace(/💀/g, '<span class="error">💀</span>')
            .replace(/🌳/g, '<span class="highlight">🌳</span>');
        p.classList.add(type);
        this.outputElement.appendChild(p);
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    _updateTrackers() {
        let moistureColor = this.environment.moisture < this.targetRange.moisture[0] ? '#f44336' : (this.environment.moisture > this.targetRange.moisture[1] ? '#f44336' : '#2e8b57');
        let lightColor = this.environment.light < this.targetRange.light[0] ? '#ff9800' : (this.environment.light > this.targetRange.light[1] ? '#ff9800' : '#2e8b57');
        let nutrientColor = this.environment.nutrient < this.targetRange.nutrient[0] ? '#795548' : (this.environment.nutrient > this.targetRange.nutrient[1] ? '#795548' : '#2e8b57');

        this.trackerOutput.innerHTML = `
            <div style="color: #2196F3;">💧 Moisture: ${this.environment.moisture || '?'}${this.stage > 0 ? ` (${this.targetRange.moisture[0]}-${this.targetRange.moisture[1]})` : ''}</div>
            <div style="color: #FFC107;">☀️ Light: ${this.environment.light || '?'}${this.stage > 0 ? ` (${this.targetRange.light[0]}-${this.targetRange.light[1]})` : ''}</div>
            <div style="color: #4CAF50;">🔬 Nutrient: ${this.environment.nutrient || '?'}${this.stage > 0 ? ` (${this.targetRange.nutrient[0]}-${this.targetRange.nutrient[1]})` : ''}</div>
        `;
    }

    _applyTileEffects(tileCode, multiplier = 1) {
        const effects = this.TILE_DEFINITIONS[tileCode].effects;
        this.environment.moisture += effects.moisture * multiplier;
        this.environment.light += effects.light * multiplier;
        this.environment.nutrient += effects.nutrient * multiplier;
        this._updateTrackers();
    }

    _showInventory() {
        let invMessage = `Moves Left: ${this.movesRemaining}. Available Tiles:`;
        const tileCounts = this.inventory;

        const tileNames = Object.keys(tileCounts).filter(k => tileCounts[k] > 0).map(k => {
            return `${this.TILE_DEFINITIONS[k].name} (${tileCounts[k]})`;
        });
        
        invMessage += tileNames.length > 0 ? ` ${tileNames.join(', ')}` : ' (Empty)';
        this._printGameMessage(invMessage, 'info');

        if (this.tilesPlaced.length > 0) {
            this._printGameMessage(`Tiles Placed: ${this.tilesPlaced.map(t => this.TILE_DEFINITIONS[t].name).join(', ')}`, 'info');
        }
    }
    
    // --- New Consultation/Hint Logic ---
    _generateConsultation() {
        let report = "🔬 **CONSULTATION REPORT**\n-----------------------\n";
        let suggestions = [];
        let isBalanced = true;

        const checkCondition = (key, emoji, label) => {
            const current = this.environment[key];
            const [min, max] = this.targetRange[key];
            let status;
            let suggestion;

            if (current < min) {
                status = `TOO LOW (Needs +${min - current} correction)`;
                suggestion = `Focus on tiles that increase ${label}.`;
                isBalanced = false;
            } else if (current > max) {
                status = `TOO HIGH (Needs -${current - max} correction)`;
                suggestion = `Focus on tiles that decrease ${label}.`;
                isBalanced = false;
            } else {
                status = `Optimal (${current} is within ${min}-${max})`;
                suggestion = `Maintain ${label} levels.`;
            }
            report += `${emoji} ${label}: ${current} (${status})\n`;
            if (suggestion) suggestions.push(suggestion);
        };

        checkCondition('moisture', '💧', 'Moisture');
        checkCondition('light', '☀️', 'Light');
        checkCondition('nutrient', '🔬', 'Nutrient');

        report += '-----------------------\n';
        report += 'ACTION SUGGESTION: ' + (isBalanced ? 'All conditions are optimal. Use the **"advance"** command.' : suggestions.join(' '));

        this._printGameMessage(report, 'report');
    }
    // --- End Consultation/Hint Logic ---

    _checkWinCondition() {
        if (this.environment.moisture >= this.targetRange.moisture[0] && this.environment.moisture <= this.targetRange.moisture[1] &&
            this.environment.light >= this.targetRange.light[0] && this.environment.light <= this.targetRange.light[1] &&
            this.environment.nutrient >= this.targetRange.nutrient[0] && this.environment.nutrient <= this.targetRange.nutrient[1]) {
            
            this._printGameMessage(`\n*** Stage ${this.stage} Conditions Met! Type **'advance'** to proceed! ***`, 'success');
            return true;
        }
        return false;
    }

    // --- Input Handling (Fixed) ---

    async _handleInput() {
        const input = this.inputElement.value.trim().toLowerCase();
        this.inputElement.value = '';
        this._printGameMessage(`> ${input}`, 'user-input');

        if (this.currentStageResolver) {
            const resolver = this.currentStageResolver;
            // Input is processed by the active stage resolver
            resolver(input);
        } else if (input === 'start' && this.stage === 0) {
            this.start();
        } else if (this.stage === 0) {
            this._printGameMessage("Please type 'start' to begin the game.", 'info');
        } else {
            this._printGameMessage("Game is not currently expecting input, or you need to type 'start'.", 'info');
        }
    }

    _getValidAction(validActions) {
        return new Promise(resolve => {
            const resolver = (input) => {
                if (validActions.includes(input)) {
                    this.currentStageResolver = null;
                    resolve(input);
                } else if (input === 'check environment') {
                    this._generateConsultation();
                    this._enableInput(); // Allow player to try again
                } else {
                    this._printGameMessage(`Invalid action. Available actions: ${validActions.join(', ')} or **'check environment'**.`, 'error');
                    this._enableInput();
                    // Resolver remains active to catch next input
                }
            };
            this.currentStageResolver = resolver;
        });
    }

    // --- Stage Setup Functions ---

    _setupInitialState(stageName, startEnv, targetRange, inventory, moves) {
        this.environment = startEnv;
        this.targetRange = targetRange;
        this.inventory = inventory;
        this.movesRemaining = moves;
        this.tilesPlaced = [];

        this._setupStage(`${stageName} (Moves Left: ${moves})`, inventory);
        this._updateTrackers();
        this._printGameMessage("Available commands: **place [tile]**, **remove [tile]**, **check environment**, **advance**.", 'info');
        this._checkWinCondition(); // Check if starting state already wins
    }

    async _executeTileAction(action) {
        const parts = action.split(' ');
        const verb = parts[0]; // place or remove
        const tileCode = parts[1]; // drip, shade, stone, etc.

        if (!this.TILE_DEFINITIONS[tileCode]) {
            this._printGameMessage(`Unknown tile: ${tileCode}.`, 'error');
            return;
        }

        const tileName = this.TILE_DEFINITIONS[tileCode].name;

        if (verb === 'place') {
            if (this.movesRemaining <= 0) {
                this._printGameMessage("❌ No moves remaining! Type **'advance'** to proceed or check your environment.", 'error');
                return;
            }
            if (this.inventory[tileCode] > 0) {
                this._applyTileEffects(tileCode, 1);
                this.inventory[tileCode]--;
                this.tilesPlaced.push(tileCode);
                this.movesRemaining--;
                this._printGameMessage(`Placed ${tileName}. Moves remaining: ${this.movesRemaining}.`);
            } else {
                this._printGameMessage(`❌ You have no ${tileName} left to place.`, 'error');
            }
        } else if (verb === 'remove') {
            const index = this.tilesPlaced.indexOf(tileCode);
            if (index !== -1) {
                this._applyTileEffects(tileCode, -1); // Reverse the effects
                this.inventory[tileCode]++; // Return to inventory
                this.tilesPlaced.splice(index, 1); // Remove from placed list
                // Moves are NOT consumed when removing
                this._printGameMessage(`Removed ${tileName}. Effects reversed.`);
            } else {
                this._printGameMessage(`❌ ${tileName} is not currently placed.`, 'error');
            }
        }
    }

    // --- Stage 1 Logic ---
    async _stageOne() {
        this._setupInitialState(
            "The Sun-Drenched Sproutling",
            { moisture: 2, light: 10, nutrient: 5 },
            { moisture: [4, 6], light: [5, 8], nutrient: [4, 7] },
            { drip: 1, shade: 1 },
            2 // Max 2 moves
        );

        while (!this.gameOver) {
            const validActions = this._getAvailableActions();
            this._showInventory();
            this._enableInput();
            const action = await this._getValidAction(validActions);
            this._disableInput();

            if (action === 'advance') {
                if (this._checkWinCondition()) return;
                this._printGameMessage("Conditions not met. Use 'check environment' for help.", 'error');
            } else {
                await this._executeTileAction(action);
                this._checkWinCondition();
            }
        }
    }

    // --- Stage 2 Logic ---
    async _stageTwo() {
        this._setupInitialState(
            "The Root Rot Threat",
            { moisture: 7, light: 6, nutrient: 3 },
            { moisture: [3, 5], light: [5, 8], nutrient: [5, 7] },
            { compost: 1, drain: 1, stone: 1 },
            3 // Max 3 moves
        );

        while (!this.gameOver) {
            const validActions = this._getAvailableActions();
            this._showInventory();
            this._enableInput();
            const action = await this._getValidAction(validActions);
            this._disableInput();

            if (action === 'advance') {
                if (this._checkWinCondition()) return;
                this._printGameMessage("Conditions not met. Use 'check environment' for help.", 'error');
            } else {
                await this._executeTileAction(action);
                this._checkWinCondition();
            }
        }
    }

    // --- Stage 3 Logic ---
    async _stageThree() {
         this._setupInitialState(
            "The Midday Sun (Structural Hardening)",
            { moisture: 5, light: 3, nutrient: 6 },
            { moisture: [4, 6], light: [6, 9], nutrient: [4, 7] },
            { stone: 2, drip: 1, drain: 1 },
            4 // Max 4 moves
        );

        while (!this.gameOver) {
            const validActions = this._getAvailableActions();
            this._showInventory();
            this._enableInput();
            const action = await this._getValidAction(validActions);
            this._disableInput();

            if (action === 'advance') {
                if (this._checkWinCondition()) return;
                this._printGameMessage("Conditions not met. Use 'check environment' for help.", 'error');
            } else {
                await this._executeTileAction(action);
                this._checkWinCondition();
            }
        }
    }

    // --- Stage 4 Logic ---
    async _stageFour() {
         this._setupInitialState(
            "Nutrient Dependency (Efficiency Challenge)",
            { moisture: 4, light: 8, nutrient: 7 },
            { moisture: [3, 6], light: [6, 10], nutrient: [10, 11] },
            { compost: 2, shade: 1, drain: 1 },
            4 // Max 4 moves
        );

        while (!this.gameOver) {
            const validActions = this._getAvailableActions();
            this._showInventory();
            this._enableInput();
            const action = await this._getValidAction(validActions);
            this._disableInput();

            if (action === 'advance') {
                if (this._checkWinCondition()) return;
                this._printGameMessage("Conditions not met. Use 'check environment' for help.", 'error');
            } else {
                await this._executeTileAction(action);
                this._checkWinCondition();
            }
        }
    }

    // --- Stage 5 Logic ---
    async _stageFive() {
        this._setupInitialState(
            "Peak Maturity (The Tight Squeeze)",
            { moisture: 8, light: 7, nutrient: 9 },
            { moisture: [6, 7], light: [5, 6], nutrient: [9, 10] },
            { shade: 1, drip: 1, drain: 1, stone: 1, compost: 1 },
            5 // Max 5 moves
        );

        while (!this.gameOver) {
            const validActions = this._getAvailableActions();
            this._showInventory();
            this._enableInput();
            const action = await this._getValidAction(validActions);
            this._disableInput();

            if (action === 'advance') {
                if (this._checkWinCondition()) return;
                this._printGameMessage("Conditions not met. Use 'check environment' for help.", 'error');
            } else {
                await this._executeTileAction(action);
                this._checkWinCondition();
            }
        }
    }

    _getAvailableActions() {
        const placeActions = Object.keys(this.inventory)
            .filter(code => this.inventory[code] > 0)
            .map(code => `place ${code}`);
        
        const removeActions = this.tilesPlaced
            .map(code => `remove ${code}`);
        
        // Use a Set to ensure unique actions if a tile is used multiple times
        const uniqueRemoveActions = Array.from(new Set(removeActions));

        return [...placeActions, ...uniqueRemoveActions, 'advance'];
    }

    // --- Main Game Execution ---

    async start() {
        this.stage = 1;
        this.restartButton.style.display = 'none';
        
        for (let i = 0; i < this.stageLogic.length; i++) {
            this.stage = i + 1;
            if (this.gameOver) break;

            await this.stageLogic[i](); 

            if (!this.gameOver && this.stage < 5) {
                this._printGameMessage(`\n[Press Enter or Submit to continue to the next stage ${this.stage + 1}...]\n`, 'info');
                this._enableInput();
                // Wait for ANY input to proceed
                await this._getValidAction(['']); 
                this._disableInput();
            } else if (!this.gameOver && this.stage === 5) {
                this._printGameMessage("\n🎉 VICTORY! Your tree reached full maturity! 🎉", 'success');
            }
        }

        if (this.gameOver) {
            this._printGameMessage("\n💀 GAME OVER. The plant has perished.", 'error');
        }
        this.restartButton.style.display = 'block'; 
        this._disableInput();
    }

    restart() {
        this._clearOutput();
        this.stage = 0;
        this.environment = {};
        this.targetRange = {};
        this.inventory = {};
        this.gameOver = false;
        this.currentStageResolver = null;
        this._updateTrackers();
        this._printGameMessage("Game restarted! Type 'start' to begin.", 'info');
        this.restartButton.style.display = 'none';
        this._enableInput();
    }
}

// --- Initialize the Game ---
document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('gameOutput');
    const userInput = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    const restartButton = document.getElementById('restartButton');
    const trackerOutput = document.getElementById('trackerOutput'); // New element

    const game = new ArboriasAscent(gameOutput, userInput, submitButton, restartButton, trackerOutput);
});