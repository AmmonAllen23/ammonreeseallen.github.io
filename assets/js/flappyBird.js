// Canvas and context
let canvas, ctx;

// Responsive canvas dimensions
let canvasWidth, canvasHeight;

// Game state variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let gravity = 0.5;
let pipeSpeed = -4;
let pipeGap; // Set later based on canvas height
let lastPipeTime = 0;
let lastTimestamp = 0;

// Image paths and variables
const images = {
    background: 'images/flappybirdbg.png',
    bird: 'images/flappybird.png',
    topPipe: 'images/toppipe.png',
    bottomPipe: 'images/bottompipe.png'
};
let backgroundImg, birdImg, topPipeImg, bottomPipeImg;

// Function to preload images and initialize them in variables
function preloadImages(sources, callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(sources).length;
    const imgs = {};

    for (let key in sources) {
        imgs[key] = new Image();
        imgs[key].src = sources[key];
        imgs[key].onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback(imgs);
            }
        };
        imgs[key].onerror = () => {
            console.error(`Failed to load image: ${sources[key]}`);
        };
    }
}

// Function to initialize the game canvas and context
function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Game canvas not found.");
        return false;
    }

    // Set canvas dimensions based on viewport size
    canvasHeight = Math.min(window.innerHeight * 0.85, 600); // 85% of viewport height, max 600px
    canvasWidth = canvasHeight * (3 / 4); // Maintain a 3:4 aspect ratio
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    // Shift the canvas down slightly with a top margin
    canvas.style.marginTop = "40px";

    // Adjust the pipe gap based on the new canvas height (slightly increased)
    pipeGap = canvasHeight / 4;

    return true;
}

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
    ctx.font = `${canvasWidth * 0.06}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("Press SPACE to Start", canvasWidth / 2, canvasHeight / 2);
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

    // Reset game state
    bird.y = canvasHeight / 2;
    bird.velocityY = 0;
    pipes.length = 0;
    score = 0;
    lastPipeTime = performance.now();
    lastTimestamp = performance.now();
    gameOver = false;
    gameStarted = true;

    // Remove "Return to Projects" button if it exists
    const returnButton = document.getElementById("returnButton");
    if (returnButton) returnButton.remove();

    createPipe();
    gameLoop(performance.now());
}

// Draw everything
function draw() {
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(topPipeImg, Math.round(pipe.x), pipe.y, canvasWidth * 0.15, canvasHeight * 0.8);
        ctx.drawImage(bottomPipeImg, Math.round(pipe.x), pipe.y + canvasHeight * 0.8 + pipeGap, canvasWidth * 0.15, canvasHeight * 0.8);
    });

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${canvasWidth * 0.06}px Arial`;
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

    // Create a new pipe every 1000 ms
    if (performance.now() - lastPipeTime >= 1000) {
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
    pipes.push({ x: canvasWidth, y: pipeY + canvasHeight * 0.8 + pipeGap, passed: false });
}

// Collision detection
function collision(bird, pipe) {
    const pipeTop = { x: pipe.x, y: pipe.y, width: canvasWidth * 0.15, height: canvasHeight * 0.8 };
    const pipeBottom = { x: pipe.x, y: pipe.y + canvasHeight * 0.8 + pipeGap, width: canvasWidth * 0.15, height: canvasHeight * 0.8 };

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

    // Create "Return to Projects" button
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
            bird.velocityY = -8.5;
        }
    }
});

// Initialize game on page load
function initializeGame() {
    preloadImages(images, (loadedImages) => {
        backgroundImg = loadedImages.background;
        birdImg = loadedImages.bird;
        topPipeImg = loadedImages.topPipe;
        bottomPipeImg = loadedImages.bottomPipe;

        if (initializeCanvas()) {
            loadHighScore();
            drawStartPrompt();
        }
    });
}

// Start the game
initializeGame();
