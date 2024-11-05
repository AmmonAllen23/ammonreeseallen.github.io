// Canvas and context
let canvas, ctx;

// Function to initialize the game canvas and context
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Game canvas not found.");
        return false;
    }
    ctx = canvas.getContext('2d');
    return true;
}

// Game state variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let gravity = 0.5;
let pipeSpeed = -4;
let pipeGap = 640 / 4.5;
let lastPipeTime = 0; // Tracks time since the last pipe was created
let lastTimestamp = 0; // Tracks time for deltaTime calculation

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
    x: 360 / 8,
    y: 640 / 2,
    width: 34,
    height: 24,
    velocityY: 0
};

// Pipe properties
const pipes = [];

// Start the game with a prompt
function drawStartPrompt() {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE to Start", 360 / 2, 640 / 2);
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
    if (!initializeCanvas()) return; // Check if the canvas was initialized
    bird.y = 640 / 2;
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
    ctx.drawImage(backgroundImg, 0, 0, 360, 640);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(topPipeImg, Math.round(pipe.x), pipe.y, 64, 512);
        ctx.drawImage(bottomPipeImg, Math.round(pipe.x), pipe.y + 512 + pipeGap, 64, 512);
    });

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(score)}`, 15, 30);

    // Display high score if the game is over
    if (gameOver) {
        ctx.fillText(`High Score: ${highScore}`, 15, 60);
    }
}

// Update game state
function update(deltaTime) {
    if (!gameStarted) return;

    // Bird gravity
    bird.velocityY += gravity * (deltaTime / 16.67); // Normalize gravity for consistent behavior
    bird.y += bird.velocityY * (deltaTime / 16.67);

    // Pipe movement and collision
    pipes.forEach(pipe => {
        pipe.x += pipeSpeed * (deltaTime / 16.67);

        // Check if bird passes pipe
        if (!pipe.passed && bird.x > pipe.x + 64) {
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
    if (pipes.length > 0 && pipes[0].x < -64) {
        pipes.shift();
        pipes.shift();
    }

    // Create a new pipe based on elapsed time
    if (performance.now() - lastPipeTime >= 1000) { // 2000 ms (2 seconds) between pipes
        createPipe();
        lastPipeTime = performance.now();
    }

    // Check if bird hits the ground or flies off-screen
    if (bird.y + bird.height > 640 || bird.y < 0) {
        gameOver = true;
        checkHighScore();
    }
}

// Pipe creation
function createPipe() {
    const pipeY = -Math.floor(Math.random() * 256) - 128;
    pipes.push({ x: 360, y: pipeY, passed: false });
    pipes.push({ x: 360, y: pipeY + 512 + pipeGap, passed: false });
}

// Collision detection
function collision(bird, pipe) {
    const pipeTop = { x: pipe.x, y: pipe.y, width: 64, height: 512 };
    const pipeBottom = { x: pipe.x, y: pipe.y + 512 + pipeGap, width: 64, height: 512 };

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
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', 360 / 2, 640 / 2);
    ctx.fillText(`Score: ${Math.floor(score)}`, 360 / 2, 640 / 2 + 40);
    ctx.fillText(`High Score: ${highScore}`, 360 / 2, 640 / 2 + 80);

    // Create a button overlay to close the game and return to projects
    const returnButton = document.createElement("button");
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
        closeGameModal(); // Close the game modal
        returnButton.remove(); // Remove the button after click
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
            bird.velocityY = -9; // Flap if the game is running
        }
    }
});

// Initialize game when modal opens
loadHighScore();
drawStartPrompt(); // Show the start prompt on initial load