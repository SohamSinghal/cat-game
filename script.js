// Game State
        let gameState = {
            selectedCat: null,
            catName: '',
            happiness: 3,
            progress: 0,
            usedTools: new Set(),
            gameActive: false,
            currentStep: 0, // Track bathing sequence
            catState: 'normal' // normal, soapy, wet, fluffy, clean
        };

        // Dialogue messages (you can customize these later)
        const dialogues = {
            tool: [
                "Meow! That tickles!",
                "I'm not sure about this...",
                "This is actually kind of nice!",
                "Can we be done soon?",
                "I suppose this is necessary...",
                "Purr... okay, I guess this is fine",
                "Is it treat time yet?",
                "I'd rather be napping...",
                "This feels weird but okay",
                "I'm being so good right now!"
            ],
            treat: [
                "Yum yum yum! 😸",
                "This makes everything better!",
                "I love treats! Purr purr!",
                "More please! 🐾",
                "You're the best human ever!",
                "This is why I tolerate baths!",
                "Treats make me so happy!",
                "I could get used to this!",
                "Best part of bath time!",
                "Nom nom nom! 😋"
            ],
            wrong_order: [
                "Have you ever bathed a cat before?",
                "That's not how you do it!",
                "Wrong order, silly human!",
                "Do you even know what you're doing?",
                "That's not the right step!",
                "Are you trying to confuse me?",
                "Let's follow the proper steps, please!",
                "I'm not sure that's how bathing works...",
                "Maybe read the instructions first?",
                "That doesn't make sense right now!"
            ]
        };

        // Bathing sequence
        const bathingSequence = ['shampoo', 'loofah', 'shower', 'dryer', 'brush'];
        const sequenceNames = {
            'shampoo': 'Shampoo',
            'loofah': 'Loofah',
            'shower': 'Shower',
            'dryer': 'Hair Dryer',
            'brush': 'Brush'
        };


        // DOM Elements
        const setupScreen = document.getElementById('setupScreen');
        const gameScreen = document.getElementById('gameScreen');
        const catOptions = document.querySelectorAll('.cat-option');
        const catNameInput = document.getElementById('catName');
        const startBtn = document.getElementById('startBtn');
        const catDisplay = document.getElementById('catDisplay');
        const catContainer = document.getElementById('catContainer');
        const displayName = document.getElementById('displayName');
        const hearts = document.getElementById('hearts');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const dialogueBox = document.getElementById('dialogueBox');
        const toolBtns = document.querySelectorAll('.tool-btn');
        const treatBtn = document.getElementById('treatBtn');
        const gameOver = document.getElementById('gameOver');
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');

        // Event Listeners
        catOptions.forEach(option => {
            option.addEventListener('click', () => selectCat(option.dataset.cat));
        });

        catNameInput.addEventListener('input', updateStartButton);
        startBtn.addEventListener('click', startGame);

        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => useTool(btn.dataset.tool));
        });

        treatBtn.addEventListener('click', giveTreat);

        // Functions
        function selectCat(catType) {
            gameState.selectedCat = catType;
            
            catOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.cat === catType) {
                    option.classList.add('selected');
                }
            });
            
            updateStartButton();
        }

        function updateStartButton() {
            const hasName = catNameInput.value.trim().length > 0;
            const hasCat = gameState.selectedCat !== null;
            startBtn.disabled = !(hasName && hasCat);
        }

        function startGame() {
            gameState.catName = catNameInput.value.trim();
            gameState.happiness = 3;
            gameState.progress = 0;
            gameState.usedTools = new Set();
            gameState.gameActive = true;
            gameState.currentStep = 0;
            gameState.catState = 'normal';
            
            setupScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            
            displayName.textContent = gameState.catName;
            
            // Set cat color
            if (gameState.selectedCat === 'orange') {
                catContainer.classList.add('orange');
            } else {
                catContainer.classList.remove('orange');
            }
            
            updateUI();
            updateCatAppearance();
        }

        function useTool(tool) {
            if (!gameState.gameActive) return;
            
            const expectedTool = bathingSequence[gameState.currentStep];
            
            // Check if using correct tool in sequence
            if (tool !== expectedTool) {
                showDialogue(dialogues.wrong_order);
                return;
            }
            
            // Add 25% progress (4 tools = 100%)
            gameState.progress = Math.min(100, gameState.progress + 20);
            
            // Reduce happiness
            gameState.happiness = Math.max(0, gameState.happiness - 1);
            
            // Mark tool as used and advance step
            gameState.usedTools.add(tool);
            gameState.currentStep++;
            
            // Update cat appearance based on tool
            updateCatState(tool);
            
            // Show random dialogue
            showDialogue(dialogues.tool);
            
            // Update UI
            updateUI();
            updateCatAppearance();
            
            // Check win condition
            if (gameState.progress >= 100) {
                endGame(true);
                return;
            }
            
            // Check lose condition
            if (gameState.happiness <= 0) {
                endGame(false);
                return;
            }
        }

        function updateCatState(tool) {
            switch(tool) {
                case 'shampoo':
                case 'loofah':
                    gameState.catState = 'soapy';
                    break;
                case 'shower':
                    gameState.catState = 'wet';
                    break;
                case 'dryer':
                    gameState.catState = 'fluffy';
                    break;
                case 'brush':
                    gameState.catState = 'normal';
                    break;
            }
        }


        function updateCatAppearance() {
            // Remove all state classes
            catContainer.classList.remove('soapy', 'wet', 'fluffy');
            
            // Remove existing bubbles
            const existingBubbles = catDisplay.querySelectorAll('.bubble');
            existingBubbles.forEach(bubble => bubble.remove());
            
            // Apply current state
            switch(gameState.catState) {
                case 'soapy':
                    catContainer.classList.add('soapy');
                    addBubbles();
                    break;
                case 'wet':
                    catContainer.classList.add('wet');
                    break;
                case 'fluffy':
                    catContainer.classList.add('fluffy');
                    break;
            }
        }

        function addBubbles() {
            for (let i = 0; i < 4; i++) {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble');
                bubble.style.left = Math.random() * 80 + 10 + '%';
                bubble.style.animationDelay = Math.random() * 2 + 's';
                catDisplay.appendChild(bubble);
            }
        }

        function giveTreat() {
            if (!gameState.gameActive || gameState.happiness >= 3) return;
            
            gameState.happiness = Math.min(3, gameState.happiness + 1);
            showDialogue(dialogues.treat);
            updateUI();
            
            // Add happy animation
            catDisplay.classList.add('happy');
            setTimeout(() => {
                catDisplay.classList.remove('happy');
            }, 500);
        }

        function updateUI() {
            // Update hearts
            hearts.textContent = '💙'.repeat(gameState.happiness) + '🤍'.repeat(3 - gameState.happiness);
            
            // Update progress
            progressFill.style.width = gameState.progress + '%';
            progressText.textContent = gameState.progress + '%';
            
            // Update treat button
            treatBtn.disabled = gameState.happiness >= 3 || !gameState.gameActive;
            
            // Update tool buttons - show checkmarks for used tools but keep all enabled
            toolBtns.forEach(btn => {
                const tool = btn.dataset.tool;
                const isUsed = gameState.usedTools.has(tool);
                
                btn.disabled = !gameState.gameActive;
                
                if (isUsed) {
                    btn.style.opacity = '0.5';
                    if (!btn.textContent.includes('✓')) {
                        btn.innerHTML = btn.innerHTML + ' ✓';
                    }
                }
            });
        }

        function showDialogue(dialogueArray) {
            const randomDialogue = dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
            dialogueBox.textContent = randomDialogue;
        }

        function endGame(won) {
            gameState.gameActive = false;
            
            if (won) {
                gameOverTitle.textContent = 'Congratulations! 🎉';
                gameOverMessage.textContent = 'Congratulations! Your cat is squeaky clean. You deserve a treat now hehe.';
            } else {
                gameOverTitle.textContent = 'Game Over 😿';
                gameOverMessage.textContent = `${gameState.catName} was sad to splash around in the tub. Make sure you give it treats!!`;
            }
            
            gameOver.style.display = 'flex';
        }

        function restartGame() {
            gameOver.style.display = 'none';
            gameScreen.style.display = 'none';
            setupScreen.style.display = 'block';
            
            // Reset selections
            catOptions.forEach(option => option.classList.remove('selected'));
            catNameInput.value = '';
            gameState.selectedCat = null;
            gameState.currentStep = 0;
            gameState.catState = 'normal';
            updateStartButton();
            
            // Reset cat appearance
            catContainer.classList.remove('soapy', 'wet', 'fluffy', 'orange');
            const existingBubbles = catDisplay.querySelectorAll('.bubble');
            existingBubbles.forEach(bubble => bubble.remove());
            
            // Reset tool buttons
            toolBtns.forEach(btn => {
                btn.style.opacity = '1';
                btn.textContent = btn.textContent.replace(' ✓', '');
            });
            
            // Reset dialogue
            dialogueBox.textContent = "Welcome! Let's get your cat clean and happy! 🛁";
        }