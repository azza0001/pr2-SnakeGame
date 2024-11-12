const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("scoreValue");
const questionElement = document.getElementById("mathQuestion");
const wrongAnswerElement = document.getElementById("wrongAnswer");
const startMenu = document.getElementById("startMenu");
const deathScreen = document.getElementById("deathScreen");
const finalScoreElement = document.getElementById("finalScore");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const GRID = 16;
const GAME_SPEED = 120;

let gameLoop;

// Classes and Constructors //

class MathProblem {
  constructor() {
    this.operators = ["+", "-", "*"];
    this.generateNewProblem();
  }

  generateNewProblem() {
    const score = parseInt(scoreElement.textContent);
    const maxNum = Math.min(12, Math.max(5, Math.floor(score / 50) + 5));
    this.num1 = Math.floor(Math.random() * maxNum) + 1;
    this.num2 = Math.floor(Math.random() * maxNum) + 1;
    this.operator =
      this.operators[Math.floor(Math.random() * this.operators.length)];

    switch (this.operator) {
      case "+":
        this.answer = this.num1 + this.num2;
        break;
      case "-":
        this.answer = this.num1 - this.num2;
        break;
      case "*":
        this.answer = this.num1 * this.num2;
        break;
    }

    this.wrongAnswers = this.generateWrongAnswers();
    this.allAnswers = [...this.wrongAnswers, this.answer];
    this.shuffleAnswers();

    questionElement.textContent = `${this.num1} ${this.operator} ${this.num2} = ?`;
  }

  generateWrongAnswers() {
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 2) {
      let wrong =
        this.answer +
        (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
      if (wrong !== this.answer && wrong >= 0) {
        wrongAnswers.add(wrong);
      }
    }
    return Array.from(wrongAnswers);
  }

  shuffleAnswers() {
    for (let i = this.allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.allAnswers[i], this.allAnswers[j]] = [
        this.allAnswers[j],
        this.allAnswers[i],
      ];
    }
  }
}

class Answer {
  constructor(value, x, y, isCorrect) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.isCorrect = isCorrect;
  }

  draw() {
    context.fillStyle = "#cc4f4f";
    context.fillRect(this.x, this.y, GRID, GRID);
    context.fillStyle = "white";
    context.font = "14px Times New Roman";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.value, this.x + GRID / 2, this.y + GRID / 2);
  }
}

// Class representing the Snake in the game, handling its movement, growth, and collision detection.
class Snake {
  // Constructor to initialize the Snake object
  constructor() {
    this.reset(); // Reset the snake's properties
  }

  // Method to reset the snake's position and properties
  reset() {
    this.x = 160; // Initial x position
    this.y = 160; // Initial y position
    this.cells = []; // Array to hold the snake's body segments
    this.maxCells = 4; // Maximum number of cells in the snake
    this.score = 0; // Initial score
    this.currentDirection = "right"; // Current direction of the snake
    this.nextDirection = "right"; // Next direction of the snake
    this.dx = GRID; // Change in x (horizontal movement)
    this.dy = 0; // Change in y (vertical movement)
    scoreElement.textContent = this.score; // Update the score display
  }

  // Method to update the snake's direction based on user input
  updateDirection() {
    switch (this.nextDirection) {
      case "left":
        this.dx = -GRID; // Move left
        this.dy = 0; // No vertical movement
        break;
      case "up":
        this.dx = 0; // No horizontal movement
        this.dy = -GRID; // Move up
        break;
      case "right":
        this.dx = GRID; // Move right
        this.dy = 0; // No vertical movement
        break;
      case "down":
        this.dx = 0; // No horizontal movement
        this.dy = GRID; // Move down
        break;
    }
    this.currentDirection = this.nextDirection; // Update current direction
  }

  // Method to move the snake based on its current direction
  move() {
    this.updateDirection(); // Update direction before moving
    this.x += this.dx; // Update x position
    this.y += this.dy; // Update y position

    // Check for wall collisions
    if (
      this.x < 0 ||
      this.x >= canvas.width ||
      this.y < 0 ||
      this.y >= canvas.height
    ) {
      this.gameOver(); // Trigger game over if collision occurs
      return; // Exit the method
    }

    this.cells.unshift({ x: this.x, y: this.y }); // Add new head position to the cells array

    // Remove the last cell if the snake exceeds its maximum length
    if (this.cells.length > this.maxCells) {
      this.cells.pop(); // Remove the last segment
    }
  }

  // Method to check for collisions with the snake's own body
  checkCollision() {
    for (let i = 1; i < this.cells.length; i++) {
      // Check if the head collides with any body segment
      if (
        this.cells[i].x === this.cells[0].x &&
        this.cells[i].y === this.cells[0].y
      ) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  }

  // Method to draw the snake on the canvas
  draw() {
    context.fillStyle = "green"; // Set the color for the snake
    this.cells.forEach((cell) => {
      context.fillRect(cell.x, cell.y, GRID - 1, GRID - 1); // Draw each segment
    });
  }

  // Method to handle game over state
  gameOver() {
    finalScoreElement.textContent = this.score; // Display the final score
    clearInterval(gameLoop); // Stop the game loop
    deathScreen.style.display = "block"; // Show the death screen
    canvas.style.display = "none"; // Hide the game canvas
  }
}

// Functions //

function getRandomPosition() {
  return {
    x: getRandomInt(0, 25) * GRID,
    y: getRandomInt(0, 25) * GRID,
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function createAnswers() {
  answers = [];
  let positions = [];

  while (positions.length < 3) {
    let pos = getRandomPosition();
    if (!positions.some((p) => p.x === pos.x && p.y === pos.y)) {
      positions.push(pos);
    }
  }

  mathProblem.allAnswers.forEach((value, index) => {
    answers.push(
      new Answer(
        value,
        positions[index].x,
        positions[index].y,
        value === mathProblem.answer
      )
    );
  });
}

class TextEffect {
  constructor(text, x, y) {
    this.text = text;
    this.x = x;
    this.y = y - GRID; // Offset above the snake's head
    this.alpha = 1.0; // Start fully opaque
    this.dy = -1; // Move up slightly each frame
  }

  update() {
    this.y += this.dy; // Move text upwards
    this.alpha -= 0.05; // Gradually reduce opacity
  }

  draw() {
    context.globalAlpha = this.alpha; // Apply transparency
    context.fillStyle = "yellow";
    context.font = "14px Arial";
    context.textAlign = "center";
    context.fillText(this.text, this.x, this.y);
    context.globalAlpha = 1.0; // Reset transparency
  }

  isVisible() {
    return this.alpha > 0; // Keep showing until invisible
  }
}

let textEffects = []; // Array to hold active text effects

function checkAnswerCollision() {
  const head = snake.cells[0];
  if (!head) return false;

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (head.x === answer.x && head.y === answer.y) {
      if (answer.isCorrect) {
        // Increase the snake's length by one segment
        snake.maxCells++;

        // Update the score
        snake.score += 10;
        scoreElement.textContent = snake.score;

        // Clear any previous wrong answer message
        wrongAnswerElement.textContent = "";

        // Add a floating text effect above the snake's head
        textEffects.push(new TextEffect("+10", head.x + GRID / 2, head.y));
        // Generate a new math problem and reposition answers
        mathProblem.generateNewProblem();
        createAnswers();
        return true;
      } else {
        // Display wrong answer feedback
        wrongAnswerElement.textContent = "Wrong answer! Try again.";

        // Clear the wrong answer message after 2 seconds
        setTimeout(() => {
          wrongAnswerElement.textContent = "";
        }, 2000);

        return false;
      }
    }
  }
  return false;
}

function update() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  snake.move();
  checkAnswerCollision();

  // Update and draw each text effect
  textEffects = textEffects.filter((effect) => effect.isVisible());
  textEffects.forEach((effect) => {
    effect.update();
    effect.draw();
  });

  if (snake.checkCollision()) {
    snake.gameOver();
  }
  answers.forEach((answer) => answer.draw());
  snake.draw();
}

// Function Events //

const snake = new Snake();
const mathProblem = new MathProblem();

let answers = [];

document.addEventListener("keydown", (e) => {
  const key = e.which || e.keyCode;
  const currentDir = snake.currentDirection;

  if ((key === 37 || key === 65) && currentDir !== "right") {
    snake.nextDirection = "left";
  } else if ((key === 38 || key === 87) && currentDir !== "down") {
    snake.nextDirection = "up";
  } else if ((key === 39 || key === 68) && currentDir !== "left") {
    snake.nextDirection = "right";
  } else if ((key === 40 || key === 83) && currentDir !== "up") {
    snake.nextDirection = "down";
  }
});

startButton.addEventListener("click", () => {
  startMenu.style.display = "none";
  canvas.style.display = "block";
  createAnswers();
  gameLoop = setInterval(update, GAME_SPEED);
});

restartButton.addEventListener("click", () => {
  deathScreen.style.display = "none";
  snake.reset();
  mathProblem.generateNewProblem();
  createAnswers();
  canvas.style.display = "block";
  gameLoop = setInterval(update, GAME_SPEED);
});

startMenu.style.display = "block";
