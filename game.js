// Game variables
let grid;
let score;
let highScore = localStorage.getItem('2048-highScore') || 0;
let gameOver;
let moving = false;

// DOM elements
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const howToPlayModal = document.getElementById('how-to-play-modal');
const closeModal = document.querySelector('.close-modal');
const retryButton = document.getElementById('retry-button');
const backToMenu = document.getElementById('back-to-menu');
const highScoreElement = document.getElementById('high-score-value');
const currentHighScoreElement = document.getElementById('current-high-score');
const finalHighScoreElement = document.getElementById('final-high-score');
const upButton = document.getElementById('up-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const downButton = document.getElementById('down-button');

// Initialize the game
function initGame() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    score = 0;
    gameOver = false;
    
    document.getElementById('score').textContent = score;
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.style.display = 'none';
    gameOverScreen.classList.remove('active');
    
    // Update high score display
    highScoreElement.textContent = highScore;
    currentHighScoreElement.textContent = highScore;
    
    // Create the grid cells
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${Math.floor(i / 4)}-${i % 4}`;
        gridElement.appendChild(cell);
    }
    
    // Add two initial tiles
    addRandomTile(true);
    addRandomTile(true);
    
    updateGrid();
}

// Add a random tile (2 or 4) to an empty cell
function addRandomTile(animate = false) {
    const emptyCells = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({i, j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
        
        if (animate) {
            const cell = document.getElementById(`cell-${randomCell.i}-${randomCell.j}`);
            cell.classList.add('tile-new');
            setTimeout(() => cell.classList.remove('tile-new'), 200);
        }
    }
}

// Update the grid display
function updateGrid() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.textContent = '';
            cell.className = 'cell';
            cell.classList.remove('tile-merged', 'tile-new');
            
            if (grid[i][j] !== 0) {
                cell.textContent = grid[i][j];
                cell.classList.add(`tile-${grid[i][j]}`);
            }
        }
    }
    
    document.getElementById('score').textContent = score;
    
    // Check for game over
    if (isGameOver() && !gameOver) {
        showGameOver();
    }
}

// Improved game over detection
function isGameOver() {
    // Check if there are empty cells first (game can't be over if there are)
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    // Check for possible horizontal merges
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === grid[i][j + 1]) {
                return false;
            }
        }
    }
    
    // Check for possible vertical merges
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 3; i++) {
            if (grid[i][j] === grid[i + 1][j]) {
                return false;
            }
        }
    }
    
    // If we get here, no moves are possible
    return true;
}

// Highlight merged tiles
function highlightMergedTiles(newGrid, oldGrid) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (newGrid[i][j] > oldGrid[i][j] && oldGrid[i][j] !== 0) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                cell.classList.add('tile-merged');
                setTimeout(() => cell.classList.remove('tile-merged'), 200);
            }
        }
    }
}

// Move tiles left
function moveLeft() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(val => val !== 0);
        
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                row[j + 1] = 0;
                score += row[j];
                moved = true;
            }
        }
        
        row = row.filter(val => val !== 0);
        while (row.length < 4) row.push(0);
        
        if (!arraysEqual(grid[i], row)) moved = true;
        grid[i] = row;
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
        if (isGameOver()) {
            showGameOver();
        }
    }
    
    return moved;
}

// Move tiles right
function moveRight() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(val => val !== 0);
        
        for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
                row[j] *= 2;
                row[j - 1] = 0;
                score += row[j];
                moved = true;
            }
        }
        
        row = row.filter(val => val !== 0);
        while (row.length < 4) row.unshift(0);
        
        if (!arraysEqual(grid[i], row)) moved = true;
        grid[i] = row;
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
        if (isGameOver()) {
            showGameOver();
        }
    }
    
    return moved;
}

// Move tiles up
function moveUp() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let j = 0; j < 4; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]].filter(val => val !== 0);
        
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                column[i + 1] = 0;
                score += column[i];
                moved = true;
            }
        }
        
        column = column.filter(val => val !== 0);
        while (column.length < 4) column.push(0);
        
        const oldColumn = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        if (!arraysEqual(oldColumn, column)) moved = true;
        
        for (let i = 0; i < 4; i++) grid[i][j] = column[i];
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
        if (isGameOver()) {
            showGameOver();
        }
    }
    
    return moved;
}

// Move tiles down
function moveDown() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let j = 0; j < 4; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]].filter(val => val !== 0);
        
        for (let i = column.length - 1; i > 0; i--) {
            if (column[i] === column[i - 1]) {
                column[i] *= 2;
                column[i - 1] = 0;
                score += column[i];
                moved = true;
            }
        }
        
        column = column.filter(val => val !== 0);
        while (column.length < 4) column.unshift(0);
        
        const oldColumn = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        if (!arraysEqual(oldColumn, column)) moved = true;
        
        for (let i = 0; i < 4; i++) grid[i][j] = column[i];
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
        if (isGameOver()) {
            showGameOver();
        }
    }
    
    return moved;
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Show game over screen
function showGameOver() {
    gameOver = true;
    updateHighScore();
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-high-score').textContent = highScore;
    
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.style.display = 'flex';
    setTimeout(() => {
        gameOverScreen.classList.add('active');
    }, 10);
}

// Update high score
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('2048-highScore', highScore);
        currentHighScoreElement.textContent = highScore;
        finalHighScoreElement.textContent = highScore;
        highScoreElement.textContent = highScore;
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (gameOver) return;
    
    let moved = false;
    
    switch (e.key) {
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
        default:
            return; // Ignore other keys
    }
}

// Start the game
function startGame() {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    initGame();
}

// Return to main menu
function returnToMenu() {
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.classList.remove('active');
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
        gameContainer.style.display = 'none';
        mainMenu.style.display = 'flex';
    }, 300);
}

// Event listeners
startButton.addEventListener('click', startGame);
howToPlayButton.addEventListener('click', () => {
    howToPlayModal.style.display = 'flex';
});
closeModal.addEventListener('click', () => {
    howToPlayModal.style.display = 'none';
});
retryButton.addEventListener('click', () => {
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.classList.remove('active');
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
        initGame();
    }, 300);
});
backToMenu.addEventListener('click', returnToMenu);

// Mobile control event listeners
upButton.addEventListener('click', moveUp);
leftButton.addEventListener('click', moveLeft);
rightButton.addEventListener('click', moveRight);
downButton.addEventListener('click', moveDown);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === howToPlayModal) {
        howToPlayModal.style.display = 'none';
    }
});

// Initialize high score display
highScoreElement.textContent = highScore;

// Initialize the game when the page loads
window.onload = function() {
    // Show main menu by default
    mainMenu.style.display = 'flex';
    gameContainer.style.display = 'none';
    document.addEventListener('keydown', handleKeyPress);
};