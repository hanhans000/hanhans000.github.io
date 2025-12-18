class ArboriasAscent {
    constructor(outputElement, trackerOutput, targetOutput, catalystList, startStopButton, checkEnvButton, advanceButton, restartButton) {
        this.stage = 0;
        this.gameOver = false;
        this.outputElement = outputElement;
        this.trackerOutput = trackerOutput;
        this.targetOutput = targetOutput;
        this.catalystList = catalystList;
        this.startStopButton = startStopButton;
        this.checkEnvButton = checkEnvButton;
        this.advanceButton = advanceButton;
        this.restartButton = restartButton;

        this.stressors = {};
        this.targetRanges = {};
        this.stressorNames = [];
        this.stressorEmojis = ['💧', '☀️', '🔬'];

        this.toolDefinitions = {};
        this.toolDecoded = {}; 
        this.toolUsedThisStage = {};
        
        this.movesRemaining = 0;
        this.maxMoves = 0;
        
        // --- FINAL STAGE SETTINGS (Beginner Friendly First Stages) ---
        this.STAGE_SETTINGS = [
            // Stage 1: Easy - 2 Tools, 2 Variables. Additive solution (Test 1, Test 2, Use 1, Use 2 = Win).
            { id: 1, name: "The Discovery Phase", moves: 4, numTools: 2, numStressorsToSet: 2, tightTargets: false, easyEffects: true },
            // Stage 2: Easy - 3 Tools, 3 Variables. Additive solution, generous moves.
            { id: 2, name: "Triple Variable Balance", moves: 5, numTools: 3, numStressorsToSet: 3, tightTargets: false, easyEffects: true },
            // Stage 3: Medium - 3 Tools, 3 Variables. Requires efficiency (4 moves). Tighter targets.
            { id: 3, name: "The Efficiency Check", moves: 4, numTools: 3, numStressorsToSet: 3, tightTargets: true }, 
            // Stage 4: Harder - 4 Tools, 3 Variables. Requires selection/reversal/negative bias.
            { id: 4, name: "Adaptation Test", moves: 5, numTools: 4, numStressorsToSet: 3, tightTargets: false, hasNegativeBias: true },
            // Stage 5: Extreme - 5 Tools, 3 Variables. Full complexity, tight targets.
            { id: 5, name: "Final Synthesis", moves: 5, numTools: 5, numStressorsToSet: 3, tightTargets: true, hasRedHerring: true }
        ];
        
        this.ACTION_STATE = 'TEST'; // Default mode
        this.NUM_MAX_TOOLS = 5;

        this._setupEventListeners();
        this._updateUI();
    }

    _setupEventListeners() {
        this.startStopButton.addEventListener('click', () => {
            if (this.stage === 0) this.start();
        });
        this.checkEnvButton.addEventListener('click', () => this._generateConsultation());
        this.advanceButton.addEventListener('click', () => this._handleAdvance());
        this.restartButton.addEventListener('click', () => this.restart());

        // Setup listeners for action mode selectors
        document.addEventListener('DOMContentLoaded', () => {
             const btnTest = document.getElementById('btnTestMode');
             const btnApply = document.getElementById('btnApplyMode');
             if (btnTest) btnTest.addEventListener('click', () => this._setActionMode('TEST'));
             if (btnApply) btnApply.addEventListener('click', () => this._setActionMode('APPLY'));
        });
    }

    // --- RANDOMIZATION & SETUP (Only minor changes) ---

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    _generateStressorNames(num) {
        const potentialNames = this._shuffleArray([
            "Hydration Index", "Thermo-Flux", "Acidity Value",
            "Energy State", "Pressure Ratio", "Mineral Balance",
            "Growth Factor"
        ]);
        this.stressorNames = potentialNames.slice(0, num);
    }

    _generateToolEffects(numTools, hasNegativeBias = false, hasRedHerring = false, easyEffects = false) {
        this.toolDefinitions = {};
        this.toolDecoded = {};
        this.toolUsedThisStage = {};

        const stressorKeys = this.stressorNames.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''));

        for (let i = 1; i <= this.NUM_MAX_TOOLS; i++) {
            const toolKey = `Tool ${i}`;

            if (i > numTools) {
                // Tool is not available this stage
                this.toolDefinitions[toolKey] = { effects: {} };
                this.toolDecoded[toolKey] = false;
                this.toolUsedThisStage[toolKey] = true; 
                continue;
            }

            const effects = {};
            let totalEffect = 0;

            stressorKeys.forEach(key => {
                let effect;
                if (easyEffects) {
                    // Stages 1 & 2: Simple effects (+/- 2, 0)
                    effect = (Math.floor(Math.random() * 3) - 1) * 2; 
                } else {
                    // Later Stages: Complex effects
                    effect = Math.floor(Math.random() * 7) - 3; 
                    if (hasNegativeBias && Math.random() < 0.4) {
                        effect -= Math.floor(Math.random() * 3) + 2;
                    }
                }
                
                effects[key] = effect;
                totalEffect += Math.abs(effect);
            });

            // Ensure not zero unless it's a planned red herring
            if (totalEffect === 0 && (!hasRedHerring || i <= numTools - 1)) {
                 const randomStressor = stressorKeys[Math.floor(Math.random() * stressorKeys.length)];
                 effects[randomStressor] = Math.random() < 0.5 ? 2 : -2;
            }

            this.toolDefinitions[toolKey] = { effects: effects };
            this.toolDecoded[toolKey] = false;
            this.toolUsedThisStage[toolKey] = false;
        }
    }

    _generateStressorsAndTargets(numStressors, tightTargets) {
        this.stressors = {};
        this.targetRanges = {};
        const baseValue = 5;
        const rangeSpread = tightTargets ? 1 : 2; 

        this.stressorNames.forEach(name => {
            const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            let currentValue = baseValue + (Math.floor(Math.random() * 5) - 2); 
            let targetMin = baseValue + (Math.floor(Math.random() * 3) - 1);
            let targetMax = targetMin + rangeSpread;

            targetMin = Math.max(0, targetMin);
            targetMax = Math.min(10, targetMax);
            if (targetMin > targetMax) [targetMin, targetMax] = [targetMax, targetMin];

            this.stressors[key] = currentValue;
            this.targetRanges[key] = [targetMin, targetMax];
        });
    }

    _updateTrackers() {
        this.trackerOutput.innerHTML = '';
        this.targetOutput.innerHTML = '';
        this.stressorNames.forEach((name, index) => {
            const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const emoji = this.stressorEmojis[index % this.stressorEmojis.length];
            const currentValue = this.stressors[key] !== undefined ? this.stressors[key] : '?';
            const targetMin = this.targetRanges[key] ? this.targetRanges[key][0] : '?';
            const targetMax = this.targetRanges[key] ? this.targetRanges[key][1] : '?';

            this.trackerOutput.innerHTML += `<div>${emoji} ${name}: <span style="color: ${this._getStressorColor(key)}">${currentValue}</span></div>`;
            this.targetOutput.innerHTML += `<div>${emoji} ${name} Target: ${targetMin}-${targetMax}</div>`;
        });
    }

    _getStressorColor(key) {
        const current = this.stressors[key];
        const [min, max] = this.targetRanges[key];
        if (current === undefined || min === undefined || max === undefined) return '#333';
        if (current < min || current > max) return '#f44336';
        return '#2e8b57';
    }

    _generateConsultation() {
        let report = "🔬 **CONSULTATION REPORT**\n-----------------------\n";
        let allBalanced = true;

        this.stressorNames.forEach((name, index) => {
            const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const emoji = this.stressorEmojis[index % this.stressorEmojis.length];
            const current = this.stressors[key];
            const [min, max] = this.targetRanges[key];
            let status;

            if (current < min) {
                status = `TOO LOW (Needs at least +${min - current})`;
                allBalanced = false;
            } else if (current > max) {
                status = `TOO HIGH (Needs at least -${current - max})`;
                allBalanced = false;
            } else {
                status = `Optimal (${current} is within ${min}-${max})`;
            }
            report += `${emoji} ${name}: ${current} (${status})\n`;
        });

        report += '-----------------------\n';
        report += 'ACTION SUGGESTION: ' + (allBalanced ? 'All Variables are optimal. Click **Advance Stage**.' : 'Identify tools that can correct the variables shown above.');

        this._printGameMessage(report, 'report');
    }

    _checkWinCondition() {
        for (const key in this.stressors) {
            const current = this.stressors[key];
            const [min, max] = this.targetRanges[key];
            if (current < min || current > max) {
                return false;
            }
        }
        this._printGameMessage(`\n*** Stage ${this.stage} Conditions Met! Click **Advance Stage**! ***`, 'success');
        this.advanceButton.style.display = 'block';
        return true;
    }

    // --- TOOL UI / ACTIONS ---

    _renderToolButtons() {
        // Update Action Mode Classes
        const btnTest = document.getElementById('btnTestMode');
        const btnApply = document.getElementById('btnApplyMode');
        if (btnTest) btnTest.classList.toggle('active', this.ACTION_STATE === 'TEST');
        if (btnApply) btnApply.classList.toggle('active', this.ACTION_STATE === 'APPLY');

        const toolGrid = this.catalystList;
        toolGrid.innerHTML = ''; // Clear previous buttons

        for (let i = 1; i <= this.NUM_MAX_TOOLS; i++) {
            const toolKey = `Tool ${i}`;
            const item = document.createElement('div');
            const isUsed = this.toolUsedThisStage[toolKey];
            const isAvailable = this.toolDefinitions[toolKey].effects && Object.keys(this.toolDefinitions[toolKey].effects).length > 0;

            let className = 'catalyst-item';
            if (!isAvailable) className += ' unavailable';
            if (this.toolDecoded[toolKey]) className += ' decoded';
            if (isUsed) className += ' used';
            item.className = className;
            item.setAttribute('data-key', toolKey);

            const decodedString = this.toolDecoded[toolKey] ? this._getDecodedEffectsString(toolKey) : 'Effect Unknown';
            const toolDisplay = isAvailable ? toolKey : '—';

            let buttonText;
            let isDisabled = isUsed || !isAvailable;

            if (this.ACTION_STATE === 'TEST') {
                buttonText = 'TEST TOOL';
                if (this.toolDecoded[toolKey]) isDisabled = true; // Cannot re-test
            } else { // APPLY MODE
                buttonText = 'USE TOOL';
                if (!this.toolDecoded[toolKey]) isDisabled = true; // Cannot use if not tested
            }
            
            item.innerHTML = `
                <h4>${toolDisplay}</h4>
                <p>${isAvailable ? decodedString : '—'}</p>
                <button class="btn-tool-action" data-key="${toolKey}" ${isDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            `;
            toolGrid.appendChild(item);

            item.querySelector('.btn-tool-action')?.addEventListener('click', (e) => this._handleToolAction(e.target.dataset.key));
        }
        
        // Update Moves Display
        document.getElementById('movesDisplay').textContent = `Moves Left: ${this.movesRemaining}/${this.maxMoves}`;
    }

    _setActionMode(mode) {
        this.ACTION_STATE = mode;
        this._renderToolButtons();
        this._printGameMessage(`Action mode set to **${mode}**.`);
    }

    _getDecodedEffectsString(toolKey) {
        const effectsList = Object.keys(this.toolDefinitions[toolKey].effects)
            .map(key => {
                const effectVal = this.toolDefinitions[toolKey].effects[key];
                const stressorName = this.stressorNames.find(n => n.toLowerCase().replace(/[^a-z0-9]/g, '') === key);
                // Display only the first word of the stressor name for brevity
                return `${stressorName.split(' ')[0]}: ${effectVal > 0 ? '+' : ''}${effectVal}`;
            })
            .join(', ');
        return effectsList;
    }

    _handleToolAction(toolKey) {
        if (this.movesRemaining <= 0) {
            this._printGameMessage("❌ No moves remaining! Stage failed.", 'error');
            return;
        }

        if (this.ACTION_STATE === 'TEST') {
            this._testTool(toolKey);
        } else if (this.ACTION_STATE === 'APPLY') {
            this._applyTool(toolKey);
        }
    }

    _testTool(toolKey) {
        if (this.toolDecoded[toolKey]) return; 
        
        this.toolDecoded[toolKey] = true; 
        this.movesRemaining--;

        let experimentReport = `**TEST REPORT for ${toolKey}** (1 Move used)\n`;
        for (const key in this.toolDefinitions[toolKey].effects) {
            const effect = this.toolDefinitions[toolKey].effects[key];
            const stressorName = this.stressorNames.find(n => n.toLowerCase().replace(/[^a-z0-9]/g, '') === key);
            experimentReport += `  ${stressorName}: ${effect > 0 ? '+' : ''}${effect}\n`;
        }
        this._printGameMessage(experimentReport, 'experiment-result');
        this._printGameMessage(`Tool ${toolKey} effects revealed. Switch to **USE MODE** to apply its effect.`);

        this._renderToolButtons();
        this._checkWinCondition();
    }

    _applyTool(toolKey) {
        if (!this.toolDecoded[toolKey]) return; 

        const effects = this.toolDefinitions[toolKey].effects;
        for (const key in effects) {
            this.stressors[key] += effects[key];
        }

        this.movesRemaining--;
        this.toolUsedThisStage[toolKey] = true;
        this._printGameMessage(`Used ${toolKey}. Variables updated. (1 Move used)`);

        this._updateTrackers();
        this._renderToolButtons();
        this._checkWinCondition();
    }


    // --- STAGE FLOW ---

    async _runStage(stageSettings) {
        this.stage = stageSettings.id;
        this.maxMoves = stageSettings.moves;
        this.movesRemaining = stageSettings.moves;
        this.ACTION_STATE = 'TEST'; // Default mode

        this._generateStressorNames(stageSettings.numStressorsToSet);
        this._generateStressorsAndTargets(stageSettings.numStressorsToSet, stageSettings.tightTargets);
        this._generateToolEffects(stageSettings.numTools, stageSettings.hasNegativeBias, stageSettings.hasRedHerring, stageSettings.easyEffects);

        this.advanceButton.style.display = 'none';

        this._printGameMessage(`\n## Stage ${this.stage}: ${stageSettings.name}`);
        this._printGameMessage(`Moves available: **${this.movesRemaining}**.`);
        
        this._updateTrackers();
        this._renderToolButtons();

        while (!this.gameOver) {
            if (this._checkWinCondition()) return; 

            if (this.movesRemaining <= 0) {
                this._printGameMessage("❌ No moves remaining and conditions are not met! Stage failed.", 'error');
                this.gameOver = true;
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    _handleAdvance() {
        if (this._checkWinCondition()) {
            this.advanceButton.style.display = 'none';
            
            if (this.stage === 5) {
                this._printGameMessage("\n🎉 VICTORY! Your tree has reached peak adaptation! 🎉", 'success');
                this.stage++;
                return;
            }

            this._printGameMessage(`\nAdvancing from Stage ${this.stage}.`);
            this.stage++;
            this._clearOutput();
            this._runStage(this.STAGE_SETTINGS[this.stage - 1]);
        } else {
            this._printGameMessage("Conditions are not currently met! Check your environment.", 'error');
        }
    }

    async start() {
        this.stage = 1;
        this.startStopButton.style.display = 'none';
        this.checkEnvButton.style.display = 'block';
        this.restartButton.style.display = 'block';
        this._printGameMessage("\n*** Beginning Adaptation Sequence ***");

        await this._runStage(this.STAGE_SETTINGS[0]);

        if (this.gameOver || this.stage > 5) {
             this.startStopButton.style.display = 'none';
             this.advanceButton.style.display = 'none';
        }
    }

    restart() {
        window.location.reload();
    }
}

// --- Initialize the Game ---
document.addEventListener('DOMContentLoaded', () => {
    const gameOutput = document.getElementById('gameOutput');
    const trackerOutput = document.getElementById('trackerOutput');
    const targetOutput = document.getElementById('targetOutput');
    const catalystList = document.getElementById('catalystList'); 
    const startStopButton = document.getElementById('startStopButton');
    const checkEnvButton = document.getElementById('checkEnvButton');
    const advanceButton = document.getElementById('advanceButton');
    const restartButton = document.getElementById('restartButton');

    const game = new ArboriasAscent(gameOutput, trackerOutput, targetOutput, catalystList, startStopButton, checkEnvButton, advanceButton, restartButton);
});
