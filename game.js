const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 12;
const PLAYER_X = 20;
const AI_X = canvas.width - 20 - PADDLE_WIDTH;
const PADDLE_SPEED = 6;
const AI_SPEED = 4;
const BALL_SPEED = 9;

// Game state
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: BALL_SPEED * (Math.random() < 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1)
};
let playerScore = 0, aiScore = 0;
let isPaused = false;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Middle line
    ctx.strokeStyle = "#555";
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // AI paddle
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.font = "32px Arial";
    ctx.fillText(playerScore, canvas.width / 2 - 60, 48);
    ctx.fillText(aiScore, canvas.width / 2 + 32, 48);
}

// Ball and paddle collision
function checkCollision() {
    // Top and bottom wall
    if (ball.y - BALL_RADIUS <= 0 || ball.y + BALL_RADIUS >= canvas.height) {
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
        ball.x + BALL_RADIUS >= AI_X &&
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
    } else if (ball.x + BALL_RADIUS > canvas.width) {
        playerScore++;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
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
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Mouse control for player paddle
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
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