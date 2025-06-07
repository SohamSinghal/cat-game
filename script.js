// ------------------------------
// 1) Preload / define all audio arrays
// ------------------------------
const soundFiles = {
  sad: [
    'assets/sad/sad_01.mp3',
    'assets/sad/sad_02.mp3',
    'assets/sad/sad_03.mp3'
  ],
  angry: [
    'assets/angry/angry_01.mp3',
    'assets/angry/angry_02.mp3'
  ],
  happy: [
    'assets/happy/happy_01.mp3',
    'assets/happy/happy_02.mp3',
    'assets/happy/happy_03.mp3'
  ],
  final: {
    happy: 'assets/happy final/happy_final.mp3',
    sad:   'assets/sad final/sad_final.mp3'
  }
};

function playRandom(category) {
  const arr = soundFiles[category];
  if (!arr || arr.length === 0) return;
  const choice = arr[Math.floor(Math.random() * arr.length)];
  const audio = new Audio(choice);
  audio.volume = 0.6;
  audio.play();
  return audio;
}

// ------------------------------
// 2) Game State & Dialogues
// ------------------------------
let gameState = {
  selectedCat: null,
  catName: '',
  happiness: 3,
  progress: 0,
  usedTools: new Set(),
  gameActive: false,
  currentStep: 0,
  catState: 'normal' 
};

const dialogues = {
  tool: [
    "Meow! Bitch that tickles 🐾😹",
    "Uh-uh, fluff no, not my belly!! 😾",
    "You tryna fight? 🥊 Touch my fur again, I dare you 😼",
    "WTF is this? A spa day from hell?! 💦🙀",
    "This wasn't in the contract, hooman!! 📄😾",
    "Purr... okay fine, I tolerate u... for now 😼💕",
    "It do be treat time yet? Wait, YOU don't decide that. Hand me my treats 🤬🍗",
    "I'd rather be napping, hooman. Go touch grass 😴🌱",
    "What the fluff is this tool even?! 🚿😿",
    "Chop chop, let's get this over with, peasant 😼🧼"
  ],
  treat: [
    "YUM YUM YUM 🐟😸",
    "Mmmm... bribery accepted 🍤💅",
    "This shit SLAPS 🐾🔥",
    "More or I riot 😤🍗",
    "You ARE annoying, but damn u good with snacks 😽💕",
    "This is the ONLY reason I tolerate your nonsense 😾🍣",
    "Treats = forgiveness. For now 😼🧁",
    "I could live this soft life forever 😎🍰",
    "Ughhh fine, you're not the worst (You are but treats) 🥹💖",
    "Nom nom nom motherfluffer 😋🐾"
  ],
  wrong_order: [
    "Yo dumbass... have u EVER bathed a cat before?? 🫠🛁",
    "Nah nopes, that ain't it 😾📉",
    "Wrong order, dumb hooman 🤦‍♀️🫧",
    "Who gave u a license to cat-care?! 💢🚫",
    "That's not the step, you chaotic gremlin 😤🧼",
    "Bitch are you just WINGING it?? 🤯",
    "Let's follow the goddamn steps, yeah? 📋😒",
    "This ain't Pinterest, this my fur we talkin bout!! 😾📸",
    "Did you even read the fluffing instructions, hooman?! 🧠❌",
    "Are you TRYNA get scratched?! 🔪🔪"
  ]
};

const bathingSequence = ['shampoo', 'loofah', 'shower', 'dryer', 'brush'];
const sequenceNames = {
  shampoo: 'Shampoo',
  loofah:  'Loofah',
  shower:  'Shower',
  dryer:   'Hair Dryer',
  brush:   'Brush'
};

// ------------------------------
// 3) DOM Elements
// ------------------------------
const setupScreen     = document.getElementById('setupScreen');
const gameScreen      = document.getElementById('gameScreen');
const catOptions      = document.querySelectorAll('.cat-option');
const catNameInput    = document.getElementById('catName');
const startBtn        = document.getElementById('startBtn');
const catDisplay      = document.getElementById('catDisplay');
const catContainer    = document.getElementById('catContainer');
const displayName     = document.getElementById('displayName');
const hearts          = document.getElementById('hearts');
const progressFill    = document.getElementById('progressFill');
const progressText    = document.getElementById('progressText');
const dialogueBox     = document.getElementById('dialogueBox');
const toolBtns        = document.querySelectorAll('.tool-btn');
const treatBtn        = document.getElementById('treatBtn');
const gameOver        = document.getElementById('gameOver');
const gameOverTitle   = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartBtn      = document.querySelector('.restart-btn');

// ------------------------------
// 4) Event Listeners
// ------------------------------
catOptions.forEach(option => {
  option.addEventListener('click', () => selectCat(option.dataset.cat));
});

catNameInput.addEventListener('input', updateStartButton);
startBtn.addEventListener('click', startGame);

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => useTool(btn.dataset.tool));
});

treatBtn.addEventListener('click', giveTreat);
restartBtn.addEventListener('click', restartGame);

// ------------------------------
// 5) Core Functions (with audio, rain, confetti, animated button)
// ------------------------------
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
  const hasCat  = gameState.selectedCat !== null;
  startBtn.disabled = !(hasName && hasCat);
}

function startGame() {
  gameState.catName    = catNameInput.value.trim();
  gameState.happiness  = 3;
  gameState.progress   = 0;
  gameState.usedTools  = new Set();
  gameState.gameActive = true;
  gameState.currentStep= 0;
  gameState.catState   = 'normal';
  
  setupScreen.style.display = 'none';
  gameScreen.style.display  = 'block';
  
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
  
  // Wrong tool → angry sound + wrong-message
  if (tool !== expectedTool) {
    playRandom('angry');
    showDialogue(dialogues.wrong_order);
    return;
  }
  
  // Correct tool → sad sound
  playRandom('sad');
  
  // Add 20% progress (5 tools = 100%)
  gameState.progress  = Math.min(100, gameState.progress + 20);
  // Reduce happiness
  gameState.happiness = Math.max(0, gameState.happiness - 1);
  // Mark tool used and advance step
  gameState.usedTools.add(tool);
  gameState.currentStep++;
  
  // Update cat appearance
  updateCatState(tool);
  showDialogue(dialogues.tool);
  updateUI();
  updateCatAppearance();
  
  // Win condition
  if (gameState.progress >= 100) {
    endGame(true);
    return;
  }
  // Lose condition
  if (gameState.happiness <= 0) {
    endGame(false);
    return;
  }
}

function updateCatState(tool) {
  switch (tool) {
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
  catContainer.classList.remove('soapy', 'wet', 'fluffy');
  
  const existingBubbles = catDisplay.querySelectorAll('.bubble');
  existingBubbles.forEach(b => b.remove());
  
  switch (gameState.catState) {
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
  
  playRandom('happy');
  
  gameState.happiness = Math.min(3, gameState.happiness + 1);
  showDialogue(dialogues.treat);
  updateUI();
  
  catDisplay.classList.add('happy');
  setTimeout(() => {
    catDisplay.classList.remove('happy');
  }, 500);
}

function updateUI() {
  hearts.textContent = 
    '💙'.repeat(gameState.happiness) +
    '🤍'.repeat(3 - gameState.happiness);
  
  progressFill.style.width = gameState.progress + '%';
  progressText.textContent = gameState.progress + '%';
  
  treatBtn.disabled = gameState.happiness >= 3 || !gameState.gameActive;
  
  toolBtns.forEach(btn => {
    const tool = btn.dataset.tool;
    const used = gameState.usedTools.has(tool);
    btn.disabled = !gameState.gameActive;
    if (used) {
      btn.style.opacity = '0.5';
      if (!btn.textContent.includes('✓')) {
        btn.innerHTML = btn.innerHTML + ' ✓';
      }
    }
  });
}

function showDialogue(dialogueArray) {
  const randomDialogue = dialogueArray[
    Math.floor(Math.random() * dialogueArray.length)
  ];
  dialogueBox.textContent = randomDialogue;
}

function endGame(won) {
  gameState.gameActive = false;
  
  // Hide any existing overlays
  removeOverlay('rain');
  removeOverlay('confetti');
  
  // Prepare the Play Again button to fade in
  restartBtn.style.display = 'inline-block';
  restartBtn.classList.add('fade-in');
  restartBtn.style.opacity = '0';
  restartBtn.disabled = true;
  
  // Show the modal
  gameOver.style.display = 'flex';
  
  if (won) {
    gameOverTitle.textContent   = 'Congratulations! 🎉';
    gameOverMessage.textContent = 'Your cat is squeaky clean. You deserve a treat!';
    
    // Trigger confetti overlay
    launchConfetti();
    
    // Play happy-final audio and fade in button over duration
    const audio = new Audio(soundFiles.final.happy);
    audio.volume = 0.6;
    audio.addEventListener('loadedmetadata', () => {
      // Animate opacity from 0→1 over audio.duration
      restartBtn.style.transition = `opacity ${audio.duration}s linear`;
      requestAnimationFrame(() => {
        restartBtn.style.opacity = '1';
      });
    });
    audio.addEventListener('ended', () => {
      restartBtn.disabled = false;
    });
    audio.play();
  } else {
    gameOverTitle.textContent   = 'Game Over 😿';
    gameOverMessage.textContent = `${gameState.catName} was too sad. Try giving treats!`;
    
    // Trigger rain overlay
    createRain();
    
    // Play sad-final audio and fade in button over duration
    const audio = new Audio(soundFiles.final.sad);
    audio.volume = 0.6;
    audio.addEventListener('loadedmetadata', () => {
      restartBtn.style.transition = `opacity ${audio.duration}s linear`;
      requestAnimationFrame(() => {
        restartBtn.style.opacity = '1';
      });
    });
    audio.addEventListener('ended', () => {
      restartBtn.disabled = false;
    });
    audio.play();
  }
}

function restartGame() {
  // Remove overlays
  removeOverlay('rain');
  removeOverlay('confetti');
  
  gameOver.style.display    = 'none';
  gameScreen.style.display  = 'none';
  setupScreen.style.display = 'block';
  
  catOptions.forEach(option => option.classList.remove('selected'));
  catNameInput.value       = '';
  gameState.selectedCat    = null;
  gameState.currentStep    = 0;
  gameState.catState       = 'normal';
  updateStartButton();
  
  catContainer.classList.remove('soapy', 'wet', 'fluffy', 'orange');
  const existingBubbles = catDisplay.querySelectorAll('.bubble');
  existingBubbles.forEach(bubble => bubble.remove());
  
  toolBtns.forEach(btn => {
    btn.style.opacity = '1';
    btn.textContent   = btn.textContent.replace(' ✓', '');
  });
  
  dialogueBox.textContent = "Welcome! Let's get your cat clean and happy! 🛁";
}

// ------------------------------
// 6) Overlay Helpers (rain + confetti)
// ------------------------------
function createRain() {
  removeOverlay('rain');
  
  // Create canvas for rain animation
  const canvas = document.createElement('canvas');
  canvas.id = 'rainCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.dataset.overlay = 'rain';
  document.body.append(canvas);
  
  if(canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    const init = [];
    const maxParts = 1000;
    for(let a = 0; a < maxParts; a++) {
      init.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 1,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
      });
    }
    
    const particles = [];
    for(let b = 0; b < maxParts; b++) {
      particles[b] = init[b];
    }
    
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for(let c = 0; c < particles.length; c++) {
        const p = particles[c];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
        ctx.stroke();
      }
      move();
    }
    
    function move() {
      for(let b = 0; b < particles.length; b++) {
        const p = particles[b];
        p.x += p.xs;
        p.y += p.ys;
        if(p.x > w || p.y > h) {
          p.x = Math.random() * w;
          p.y = -20;
        }
      }
    }
    
    // Store interval ID on canvas for cleanup
    canvas.rainInterval = setInterval(draw, 30);
  }
}

function launchConfetti() {
  removeOverlay('confetti');
  
  // Create canvas for confetti animation
  const canvas = document.createElement('canvas');
  canvas.id = 'confettiCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.dataset.overlay = 'confetti';
  document.body.append(canvas);
  
  const ctx = canvas.getContext('2d');
  const cx = ctx.canvas.width/2;
  const cy = ctx.canvas.height/2;
  let confetti = [];
  const confettiCount = 300;
  const gravity = 0.5;
  const terminalVelocity = 5;
  const drag = 0.075;
  const colors = [
    { front : 'red', back: 'darkred'},
    { front : 'green', back: 'darkgreen'},
    { front : 'blue', back: 'darkblue'},
    { front : 'yellow', back: 'darkyellow'},
    { front : 'orange', back: 'darkorange'},
    { front : 'pink', back: 'darkpink'},
    { front : 'purple', back: 'darkpurple'},
    { front : 'turquoise', back: 'darkturquoise'},
  ];
  
  const randomRange = (min, max) => Math.random() * (max - min) + min;
  
  const initConfetti = () => {
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        color      : colors[Math.floor(randomRange(0, colors.length))],
        dimensions : {
          x: randomRange(10, 20),
          y: randomRange(10, 30),
        },
        position   : {
          x: randomRange(0, canvas.width),
          y: canvas.height - 1,
        },
        rotation   : randomRange(0, 2 * Math.PI),
        scale      : {
          x: 1,
          y: 1,
        },
        velocity   : {
          x: randomRange(-25, 25),
          y: randomRange(0, -50),
        },
      });
    }
  };
  
  const render = () => {  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confetti.forEach((confetto, index) => {
      let width = (confetto.dimensions.x * confetto.scale.x);
      let height = (confetto.dimensions.y * confetto.scale.y);
      
      // Move canvas to position and rotate
      ctx.translate(confetto.position.x, confetto.position.y);
      ctx.rotate(confetto.rotation);
      
      // Apply forces to velocity
      confetto.velocity.x -= confetto.velocity.x * drag;
      confetto.velocity.y = Math.min(confetto.velocity.y + gravity, terminalVelocity);
      confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
      
      // Set position
      confetto.position.x += confetto.velocity.x;
      confetto.position.y += confetto.velocity.y;
      
      // Delete confetti when out of frame
      if (confetto.position.y >= canvas.height) confetti.splice(index, 1);
      // Loop confetto x position
      if (confetto.position.x > canvas.width) confetto.position.x = 0;
      if (confetto.position.x < 0) confetto.position.x = canvas.width;
      // Spin confetto by scaling y
      confetto.scale.y = Math.cos(confetto.position.y * 0.1);
      ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
       
      // Draw confetto
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      // Reset transform matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    });
    
    // Check if canvas still exists before continuing animation
    if (document.body.contains(canvas)) {
      // Fire off another round of confetti
      if (confetti.length <= 10) initConfetti();
      canvas.confettiAnimationId = requestAnimationFrame(render);
    }
  };
  
  // Start the confetti animation
  initConfetti();
  canvas.confettiAnimationId = requestAnimationFrame(render);
}

function removeOverlay(type) {
  document.querySelectorAll(`[data-overlay="${type}"]`).forEach(el => {
    // Clean up rain animation interval if removing rain
    if (type === 'rain' && el.rainInterval) {
      clearInterval(el.rainInterval);
    }
    // Clean up confetti animation if removing confetti
    if (type === 'confetti' && el.confettiAnimationId) {
      cancelAnimationFrame(el.confettiAnimationId);
    }
    el.remove();
  });
}