const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const PADDLE_SPEED = 6;
const AI_SPEED = 4;
const BALL_SPEED = 9;
const MAX_DPR = 2;

let gameWidth = BASE_WIDTH;
let gameHeight = BASE_HEIGHT;

function getAiX() {
    return gameWidth - 19 - PADDLE_WIDTH;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function resizeCanvas() {
    const nextWidth = canvas.clientWidth || BASE_WIDTH;
    const nextHeight = canvas.clientHeight || BASE_HEIGHT;
    const prevWidth = gameWidth;
    const prevHeight = gameHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = Math.round(nextWidth * dpr);
    canvas.height = Math.round(nextHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    gameWidth = nextWidth;
    gameHeight = nextHeight;

    if (prevWidth > 0 && prevHeight > 0) {
        const widthRatio = gameWidth / prevWidth;
        const heightRatio = gameHeight / prevHeight;

        playerY *= heightRatio;
        aiY *= heightRatio;
        ball.x *= widthRatio;
        ball.y *= heightRatio;
    }

    playerY = clamp(playerY, 0, gameHeight - PADDLE_HEIGHT);
    aiY = clamp(aiY, 0, gameHeight - PADDLE_HEIGHT);
    ball.x = clamp(ball.x, BALL_RADIUS, gameWidth - BALL_RADIUS);
    ball.y = clamp(ball.y, BALL_RADIUS, gameHeight - BALL_RADIUS);

    draw();
}

// Game state
let playerY = gameHeight / 2 - PADDLE_HEIGHT / 2;
let aiY = gameHeight / 2 - PADDLE_HEIGHT / 2;
let ball = {
    x: gameWidth / 2,
    y: gameHeight / 2,
    vx: BALL_SPEED * (Math.random() < 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};
let playerScore = 0, aiScore = 0;
let isPaused = false;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Pause button support
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    if (!isPaused) update();
});

// Spacebar support for pausing/resuming
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? "Resume" : "Pause";
        if (!isPaused) update();
    }
});

// Draw paddles, ball, and score
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Middle line
    ctx.strokeStyle = "#555";
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(gameWidth / 2, 0);
    ctx.lineTo(gameWidth / 2, gameHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillRect(getAiX(), aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.font = "32px Arial";
    ctx.fillText(playerScore, gameWidth / 2 - 60, 48);
    ctx.fillText(aiScore, gameWidth / 2 + 32, 48);
}

// Ball and paddle collision
function checkCollision() {
    // Top and bottom wall
    if (ball.y - BALL_RADIUS <= 0 || ball.y + BALL_RADIUS >= gameHeight) {
        ball.vy = -ball.vy;
    }

    // Player paddle
    if (
        ball.x - BALL_RADIUS <= PLAYER_X + PADDLE_WIDTH &&
        ball.y + BALL_RADIUS > playerY &&
        ball.y - BALL_RADIUS < playerY + PADDLE_HEIGHT &&
        ball.vx < 0
    ) {
        ball.vx = -ball.vx;
        // Add some "spin" based on where the ball hits the paddle
        let collidePoint = ball.y - (playerY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angle = collidePoint * Math.PI / 4;
        ball.vy = BALL_SPEED * Math.sin(angle);
    }

    // AI paddle
    if (
        ball.x + BALL_RADIUS >= getAiX() &&
        ball.y + BALL_RADIUS > aiY &&
        ball.y - BALL_RADIUS < aiY + PADDLE_HEIGHT &&
        ball.vx > 0
    ) {
        ball.vx = -ball.vx;
        // "Spin" for AI paddle
        let collidePoint = ball.y - (aiY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angle = collidePoint * Math.PI / 4;
        ball.vy = BALL_SPEED * Math.sin(angle);
    }

    // Left and right wall (score)
    if (ball.x - BALL_RADIUS < 0) {
        aiScore++;
        resetBall();
    } else if (ball.x + BALL_RADIUS > gameWidth) {
        playerScore++;
        resetBall();
    }
}

function resetBall() {
    ball.x = gameWidth / 2;
    ball.y = gameHeight / 2;
    ball.vx = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// AI logic
function moveAI() {
    let target = ball.y - PADDLE_HEIGHT / 2;
    if (aiY + PADDLE_HEIGHT / 2 < ball.y - 10) {
        aiY += AI_SPEED;
    } else if (aiY + PADDLE_HEIGHT / 2 > ball.y + 10) {
        aiY -= AI_SPEED;
    }
    // Clamp AI within canvas
    aiY = clamp(aiY, 0, gameHeight - PADDLE_HEIGHT);
}

// Mouse control for player paddle
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = clamp(playerY, 0, gameHeight - PADDLE_HEIGHT);
});

// Game loop
function update() {
    if (isPaused) return;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Move AI paddle
    moveAI();

    // Check collisions
    checkCollision();

    // Draw everything
    draw();

    requestAnimationFrame(update);
}

draw();
update();
