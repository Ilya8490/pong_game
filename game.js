const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const AI_SPEED = 240;
const BALL_INITIAL_SPEED = 540;
const BALL_SPEED_INCREMENT = 36;
const BALL_MAX_SPEED = 960;
const MAX_BOUNCE_ANGLE = Math.PI / 3;
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
    vx: 0,
    vy: 0,
    speed: BALL_INITIAL_SPEED
};
let playerScore = 0, aiScore = 0;
let isPaused = false;
let lastFrameTime = 0;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Pause button support
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    if (!isPaused) {
        lastFrameTime = 0;
    }
});

// Spacebar support for pausing/resuming
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? "Resume" : "Pause";
        if (!isPaused) {
            lastFrameTime = 0;
        }
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

function setBallVelocity(directionX, bounceAngle) {
    ball.vx = Math.cos(bounceAngle) * ball.speed * directionX;
    ball.vy = Math.sin(bounceAngle) * ball.speed;
}

function serveBall(directionX = Math.random() < 0.5 ? -1 : 1) {
    const launchAngle = (Math.random() * 0.8 - 0.4) * MAX_BOUNCE_ANGLE;
    ball.speed = BALL_INITIAL_SPEED;
    setBallVelocity(directionX, launchAngle);
}

function bounceOffPaddle(paddleY, directionX) {
    const collidePoint = ball.y - (paddleY + PADDLE_HEIGHT / 2);
    const normalizedImpact = clamp(collidePoint / (PADDLE_HEIGHT / 2), -1, 1);
    const bounceAngle = normalizedImpact * MAX_BOUNCE_ANGLE;

    ball.speed = Math.min(ball.speed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
    setBallVelocity(directionX, bounceAngle);
}

// Ball and paddle collision
function checkCollision() {
    // Top and bottom wall
    if (ball.y - BALL_RADIUS <= 0) {
        ball.y = BALL_RADIUS;
        ball.vy = Math.abs(ball.vy);
    } else if (ball.y + BALL_RADIUS >= gameHeight) {
        ball.y = gameHeight - BALL_RADIUS;
        ball.vy = -ball.vy;
    }

    // Player paddle
    if (
        ball.x - BALL_RADIUS <= PLAYER_X + PADDLE_WIDTH &&
        ball.y + BALL_RADIUS > playerY &&
        ball.y - BALL_RADIUS < playerY + PADDLE_HEIGHT &&
        ball.vx < 0
    ) {
        ball.x = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
        bounceOffPaddle(playerY, 1);
    }

    // AI paddle
    if (
        ball.x + BALL_RADIUS >= getAiX() &&
        ball.y + BALL_RADIUS > aiY &&
        ball.y - BALL_RADIUS < aiY + PADDLE_HEIGHT &&
        ball.vx > 0
    ) {
        ball.x = getAiX() - BALL_RADIUS;
        bounceOffPaddle(aiY, -1);
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
    serveBall();
}

// AI logic
function moveAI(dt) {
    const aiStep = AI_SPEED * dt;
    if (aiY + PADDLE_HEIGHT / 2 < ball.y - 10) {
        aiY += aiStep;
    } else if (aiY + PADDLE_HEIGHT / 2 > ball.y + 10) {
        aiY -= aiStep;
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
function update(timestamp) {
    if (lastFrameTime === 0) {
        lastFrameTime = timestamp;
    }

    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    if (!isPaused) {
        // Move ball using elapsed time so speed is consistent across displays.
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Move AI paddle
        moveAI(dt);

        // Check collisions
        checkCollision();
    }

    // Draw everything
    draw();

    requestAnimationFrame(update);
}

serveBall();
draw();
requestAnimationFrame(update);
