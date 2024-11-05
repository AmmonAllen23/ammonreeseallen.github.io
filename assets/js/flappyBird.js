// Canvas and context
let canvas, ctx;

// Set the maximum canvas dimensions relative to the viewport
let canvasWidth, canvasHeight;

// Function to initialize the game canvas and context
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Game canvas not found.");
        return false;
    }

    // Set canvas dimensions based on viewport size
    canvasHeight = Math.min(window.innerHeight * 0.7, 480); // 70% of viewport height, max 480px
    canvasWidth = canvasHeight * (3 / 4); // Maintain a 3:4 aspect ratio
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    return true;
}

// Game state variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let gravity = 0.5;
let pipeSpeed = -3; 
let pipeGap = canvasHeight / 4;
let lastPipeTime = 0;
let lastTimestamp = 0;

// Load images
const backgroundImg = new Image();
backgroundImg.src = 'images/flappybirdbg.png';
const birdImg = new Image();
birdImg.src = 'images/flappybird.png';
const topPipeImg = new Image();
topPipeImg.src = 'images/toppipe.png';
const bottomPipeImg = new Image();
bottomPipeImg.src = 'images/bottompipe.png';

// Bird properties
const bird = {
    x: canvasWidth / 8,
    y: canvasHeight / 2,
    width: canvasWidth * 0.1,
    height: canvasHeight * 0.06,
    velocityY: 0
};

// Pipe properties
const pipes = [];

// Start the game with a prompt
function drawStartPrompt() {
    if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${canvasWidth * 0.06}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("Press SPACE to Start", canvasWidth / 2, canvasHeight / 2);
    }
}

// Game Loop
function gameLoop(timestamp) {
    if (!gameOver) {
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver();
    }
}

// Start or Restart the Game
function startGame() {
    if (!initializeCanvas()) return;

    // Remove "Return to Projects" button if it exists
    const returnButton = document.getElementById("returnButton");
    if (returnButton) returnButton.remove();

    bird.y = canvasHeight / 2;
    bird.velocityY = 0;
    pipes.length = 0;
    score = 0;
    lastPipeTime = performance.now();
    lastTimestamp = performance.now();
    gameOver = false;
    gameStarted = true;
    createPipe();
    gameLoop(performance.now());
}

// Draw everything
function draw() {
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(topPipeImg, Math.round(pipe.x), pipe.y, canvasWidth * 0.15, canvasHeight * 0.7);
        ctx.drawImage(bottomPipeImg, Math.round(pipe.x), pipe.y + canvasHeight * 0.7 + pipeGap, canvasWidth * 0.15, canvasHeight * 0.7);
    });

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${canvasWidth * 0.06}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(score)}`, 10, 25);

    // Display high score if the game is over
    if (gameOver) {
        ctx.fillText(`High Score: ${highScore}`, 10, 50);
    }
}

// Update game state
function update(deltaTime) {
    if (!gameStarted) return;

    // Bird gravity
    bird.velocityY += gravity * (deltaTime / 16.67);
    bird.y += bird.velocityY * (deltaTime / 16.67);

    // Pipe movement and collision
    pipes.forEach(pipe => {
        pipe.x += pipeSpeed * (deltaTime / 16.67);

        // Check if bird passes pipe
        if (!pipe.passed && bird.x > pipe.x + canvasWidth * 0.15) {
            pipe.passed = true;
            score += 0.5;
        }

        // Collision detection
        if (collision(bird, pipe)) {
            gameOver = true;
            checkHighScore();
        }
    });

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x < -canvasWidth * 0.15) {
        pipes.shift();
        pipes.shift();
    }

    // Create a new pipe based on elapsed time
    if (performance.now() - lastPipeTime >= 1200) {
        createPipe();
        lastPipeTime = performance.now();
    }

    // Check if bird hits the ground or flies off-screen
    if (bird.y + bird.height > canvasHeight || bird.y < 0) {
        gameOver = true;
        checkHighScore();
    }
}

// Pipe creation
function createPipe() {
    const pipeY = -Math.floor(Math.random() * (canvasHeight / 2)) - 100;
    pipes.push({ x: canvasWidth, y: pipeY, passed: false });
    pipes.push({ x: canvasWidth, y: pipeY + canvasHeight * 0.7 + pipeGap, passed: false });
}

// Collision detection
function collision(bird, pipe) {
    const pipeTop = { x: pipe.x, y: pipe.y, width: canvasWidth * 0.15, height: canvasHeight * 0.7 };
    const pipeBottom = { x: pipe.x, y: pipe.y + canvasHeight * 0.7 + pipeGap, width: canvasWidth * 0.15, height: canvasHeight * 0.7 };

    return (
        (bird.x < pipeTop.x + pipeTop.width &&
            bird.x + bird.width > pipeTop.x &&
            bird.y < pipeTop.y + pipeTop.height &&
            bird.y + bird.height > pipeTop.y) ||
        (bird.x < pipeBottom.x + pipeBottom.width &&
            bird.x + bird.width > pipeBottom.x &&
            bird.y < pipeBottom.y + pipeBottom.height &&
            bird.y + bird.height > pipeBottom.y)
    );
}

// Game Over display
function displayGameOver() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${canvasWidth * 0.08}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 2);
    ctx.fillText(`Score: ${Math.floor(score)}`, canvasWidth / 2, canvasHeight / 2 + 40);
    ctx.fillText(`High Score: ${highScore}`, canvasWidth / 2, canvasHeight / 2 + 80);

    // Create a button overlay to close the game and return to projects
    const returnButton = document.createElement("button");
    returnButton.id = "returnButton";
    returnButton.textContent = "Return to Projects";
    returnButton.style.position = "absolute";
    returnButton.style.top = "50%";
    returnButton.style.left = "50%";
    returnButton.style.transform = "translate(-50%, 50px)";
    returnButton.style.padding = "10px 20px";
    returnButton.style.fontSize = "16px";
    returnButton.style.cursor = "pointer";
    returnButton.style.zIndex = "1000";
    document.body.appendChild(returnButton);

    // Event listener to close modal and remove button when clicked
    returnButton.addEventListener("click", () => {
        closeGameModal();
        returnButton.remove();
    });
}

// Check and update high score
function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Load high score from localStorage
function loadHighScore() {
    const savedScore = localStorage.getItem('highScore');
    if (savedScore) {
        highScore = parseFloat(savedScore);
    }
}

// Handle space key press to start or restart
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            startGame();
        } else {
            bird.velocityY = -9;
        }
    }
});

// Initialize game on page load
function initializeGame() {
    if (initializeCanvas()) {
        loadHighScore();
        drawStartPrompt();
    }
}

// Call initializeGame to set up the canvas and prompt
initializeGame();
