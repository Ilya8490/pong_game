# Pong Game

A small browser-based Pong game built with plain HTML, CSS, and JavaScript.

This project focuses on classic arcade gameplay with a clean canvas rendering pipeline, responsive layout, and lightweight code structure. It runs directly in the browser without any framework or build step.

## Features

- Classic one-player Pong against a simple AI opponent
- Responsive canvas that scales to the viewport
- Sharp rendering on high-DPI and Retina displays
- Delta-time movement for consistent speed across different refresh rates
- Paddle bounce physics with rally-based speed progression
- Pause and resume support with button and spacebar controls
- Minimal setup: open the app and play

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API

## Project Structure

```text
ponggame/
├── index.html
├── style.css
├── game.js
└── README.md
```

## How To Run

Because this is a static frontend project, you can run it in any of these simple ways:

1. Open `index.html` directly in your browser.
2. Or serve the folder with a simple local server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

- Move your mouse vertically over the canvas to control the left paddle
- Press `Space` to pause or resume the game
- Click the `Pause` button to pause or resume

## Gameplay Notes

- The player controls the left paddle
- The AI controls the right paddle
- The ball speed increases slightly after each paddle hit
- Bounce angle depends on where the ball hits the paddle
- The game automatically resets the ball after each score

## Implementation Highlights

### Responsive Canvas

The canvas uses CSS sizing for layout and JavaScript resizing for internal resolution. This keeps the game responsive while preserving crisp drawing quality on high-density displays.

### Delta-Time Animation

Movement is based on elapsed time instead of per-frame increments. This prevents the game from running faster on high-refresh-rate monitors.

### Bounce Physics

The ball angle changes based on the hit position on the paddle. Center hits produce flatter returns, while edge hits create sharper angles. Speed also increases during rallies to make gameplay more dynamic.

## Customization

You can tune gameplay by editing constants near the top of `game.js`:

- `AI_SPEED`
- `BALL_INITIAL_SPEED`
- `BALL_SPEED_INCREMENT`
- `BALL_MAX_SPEED`
- `MAX_BOUNCE_ANGLE`
- `PADDLE_WIDTH`
- `PADDLE_HEIGHT`
- `BALL_RADIUS`

## Future Improvements

- Add keyboard and touch controls
- Add start screen and restart flow
- Add win conditions such as first to 5 points
- Add difficulty levels
- Add sound effects and UI feedback
- Add score HUD and game status text

## Author

Created as a simple web game project using vanilla frontend technologies.
